import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiEdit3 } from "react-icons/fi";
import { getAdminBlogBySlug, importBlogImage, updateBlog } from "../../api/blogApi";
import AdminShell from "../../components/admin/AdminShell";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import FeaturedImageUploader from "../../components/admin/FeaturedImageUploader";
import ImageUrlImporter from "../../components/admin/ImageUrlImporter";
import PublishControls from "../../components/admin/PublishControls";
import TextField from "../../components/admin/TextField";
import ContentEditor from "../../components/editor/ContentEditor";
import { QUILL_MODULES_EDIT, QUILL_FORMATS_EDIT } from "../../components/editor/editorConfig";
import {
  BLOG_STATUS,
  LIMITS,
  firstInvalidField,
  normaliseText,
  validateBlogForm,
  visibleLength,
} from "../../utils/blogForm";

// ==========================================
// EDIT BLOG
// ==========================================
// What the server already does, so this screen never has to guess:
//
//   GET  /api/v1/blogs/admin/slug/:slug  loads a post of either status, so a
//                                        draft can be edited. A draft answers
//                                        404 on the public endpoint, and a draft
//                                        is exactly the post that most needs
//                                        editing.
//   PATCH /api/v1/blogs/:id              updates by MongoDB _id, never by slug.
//   POST /api/v1/blogs/admin/import-image  downloads a URL, stores it, and
//                                        returns our own URL for it.
//
// Three rules this screen is built around:
//
//   1. The slug is not editable. A published post's address is a promise to every
//      link, social preview and search result pointing at it. The server's
//      EDITABLE_FIELDS does not include `slug` at all, so a title edit can never
//      relocate a post and there is no way to lose a URL by accident.
//   2. The image and the post are saved separately. An import produces a stored
//      URL that is staged in the form; it reaches the post only when the post is
//      saved. The old image is untouched until then, so a failed import or a
//      cancelled edit cannot remove what readers currently see.
//   3. Loading a post is not editing it. The form is only "dirty" once it differs
//      from what was loaded, so opening a post and leaving is not a warning, but
//      typing one character and leaving is.

const EMPTY_FORM = { title: "", description: "", author: "", content: "" };

const formatDateTime = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// The shape the form was in when it loaded. Compared against the live form to
// decide whether anything has really changed, so re-opening a post and leaving
// does not prompt, and so a field the server returned empty does not look edited.
const isSameAsLoaded = (current, loaded) =>
  current.title === loaded.title &&
  current.description === loaded.description &&
  current.author === loaded.author &&
  current.content === loaded.content;

const EditBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // ==========================================
  const [blogId, setBlogId] = useState(null); // MongoDB _id, for PATCH
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(BLOG_STATUS.PUBLISHED);

  // Four distinct image states, kept apart on purpose:
  //   existingImage  what the post has now, on our storage
  //   imageFile      a file just chosen, not yet sent
  //   importedImage  a URL the server has already stored for us, not yet attached
  //   imageRemoved   the author pressed Remove: the stored image is hidden locally
  //                  and cleared on the server only when the post is saved
  // Only imageFile, importedImage and imageRemoved are changes; existingImage is
  // untouched until a save succeeds.
  const [existingImage, setExistingImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [importedImage, setImportedImage] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);

  const [loaded, setLoaded] = useState(EMPTY_FORM);
  const [meta, setMeta] = useState({ publishedAt: null, createdAt: null, updatedAt: null });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [errors, setErrors] = useState({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitIntent, setSubmitIntent] = useState(null);
  const [failure, setFailure] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leaving, setLeaving] = useState(false);

  // The single gate against a double submit. A ref rather than state because it is
  // written synchronously: two clicks arriving before React re-renders would both
  // read a stale submitting === false and save the post twice.
  const submitLock = useRef(false);

  // The pause after a successful save, held in a ref so that leaving during it
  // cancels the redirect instead of firing it into an unmounted component.
  const redirectTimer = useRef(null);

  const fieldRefs = {
    title: useRef(null),
    description: useRef(null),
    author: useRef(null),
    content: useRef(null),
  };

  // ==========================================
  // LOAD
  // ==========================================
  useEffect(() => {
    let cancelled = false;

    const fetchBlog = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data } = await getAdminBlogBySlug(slug);
        if (cancelled) return;

        const blog = data.blog;

        const nextForm = {
          title: blog.title || "",
          description: blog.description || "",
          author: blog.author || "",
          content: blog.content || "",
        };

        setBlogId(blog._id);
        setForm(nextForm);
        setLoaded(nextForm);

        // Posts saved before the status field existed are published. A draft must
        // not be flipped to published merely by opening and saving it.
        setStatus(blog.status || BLOG_STATUS.PUBLISHED);

        setExistingImage(blog.image || null);
        setMeta({
          publishedAt: blog.publishedAt || null,
          createdAt: blog.createdAt || null,
          updatedAt: blog.updatedAt || null,
        });
      } catch (error) {
        if (cancelled) return;

        const status_ = error?.response?.status;
        setLoadError(
          status_ === 404
            ? "That post does not exist. It may have been deleted."
            : status_ === 401
            ? "Your session has ended. Sign in again to open this post."
            : "This post could not be loaded. Check your connection and try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBlog();

    // A late response from a post the author has already navigated away from must
    // not write into a component that is no longer showing this post.
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(
    () => () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
        redirectTimer.current = null;
      }
    },
    []
  );

  // ==========================================
  // DERIVED
  // ==========================================
  const checklist = useMemo(
    () => [
      { id: "title", label: "Title", done: normaliseText(form.title).length >= LIMITS.title.min },
      {
        id: "description",
        label: "Description",
        done: normaliseText(form.description).length >= LIMITS.description.min,
      },
      { id: "author", label: "Author", done: normaliseText(form.author).length >= LIMITS.author.min },
      { id: "content", label: "Content", done: visibleLength(form.content) >= LIMITS.content.min },
      {
        id: "image",
        label: "Featured image",
        done: Boolean(imageFile || importedImage || (existingImage && !imageRemoved)),
        optional: true,
      },
    ],
    [form, imageFile, importedImage, existingImage, imageRemoved]
  );

  const imageChanged = Boolean(imageFile || importedImage || imageRemoved);

  // Only a real difference from what was loaded counts as unsaved work.
  const dirty = !success && (isSameAsLoaded(form, loaded) === false || imageChanged);

  useEffect(() => {
    if (!dirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // Chrome shows its own wording when this is set; the string is for older
      // browsers.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // ==========================================
  // FIELDS
  // ==========================================
  const updateField = useCallback(
    (field, value) => {
      setForm((previous) => {
        const next = { ...previous, [field]: value };

        // After a first failed submit the form revalidates as it is corrected,
        // rather than making the author submit again to find out. The check is a
        // pure function of the values, so the whole form is revalidated.
        if (touchedSubmit) setErrors(validateBlogForm(next));

        return next;
      });
    },
    [touchedSubmit]
  );

  // Choosing a file supersedes anything staged before it, and the previous
  // preview is released rather than leaking for the life of the page. It also
  // cancels a pending removal: picking a file is the opposite of removing one.
  const handleImageSelect = (file) => {
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
    setImportedImage(null);
    setImageRemoved(false);
    setFailure(null);
  };

  // Remove is a local staging action only: it clears any staged file/import,
  // hides the stored image, and marks the post dirty. Nothing is sent to the
  // server here — the removal is persisted when the author saves. The button
  // that calls this is type="button", so it never submits the parent form and
  // never reloads the page.
  const handleImageClear = () => {
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setImageFile(null);
    setImportedImage(null);
    // Only a stored image needs a removal flag; clearing a staged-only image
    // simply returns to the clean "no image" state.
    if (existingImage) setImageRemoved(true);
  };

  /**
   * Imports a URL and stages the stored URL the server returns.
   *
   * The blog document is not touched here. `onImage` is the same setter the file
   * upload uses, so an imported image is previewed and saved exactly like a chosen
   * one — there is no second path through the form.
   */
  const handleImport = async (url) => {
    const { data } = await importBlogImage(url);
    const stored = data.imageUrl;

    if (!stored) {
      throw new Error("The server did not return a stored image");
    }

    // A file chosen beforehand is replaced, and its preview released: two images
    // staged at once would be ambiguous about which one is being saved. Importing
    // also cancels a pending removal for the same reason selecting a file does.
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setImageFile(null);
    setImportedImage(stored);
    setImageRemoved(false);
    setFailure(null);
  };

  // ==========================================
  // SAVE
  // ==========================================
  const describeFailure = (error) => {
    const status_ = error?.response?.status;
    const serverMessage = error?.response?.data?.msg || error?.response?.data?.message;

    if (typeof serverMessage === "string" && serverMessage.trim()) return serverMessage;

    if (!error?.response) {
      return "The post could not be saved because the server could not be reached. Check your connection and try again — nothing was lost.";
    }
    if (status_ === 401) return "Your session has ended. Sign in again to save this post.";
    if (status_ === 403) return "This account is not allowed to edit posts.";
    if (status_ === 404) return "That post no longer exists, so it cannot be saved.";
    if (status_ === 413) return "That image is larger than the 5 MB limit. Choose a smaller one and try again.";
    if (status_ === 429) return "Too many attempts. Wait a moment and try again.";
    if (status_ >= 500) return "The server could not save this post. Nothing was lost — try again in a moment.";

    return "The post could not be saved. Nothing was lost — please review the fields and try again.";
  };

  const handleSave = async (nextStatus) => {
    if (submitLock.current) return;

    submitLock.current = true;
    setSubmitting(true);
    setSubmitIntent(nextStatus);
    setTouchedSubmit(true);
    setFailure(null);

    const found = validateBlogForm(form);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      submitLock.current = false;
      setSubmitting(false);
      setSubmitIntent(null);

      const first = firstInvalidField(found);
      // Quill's surface is a contenteditable div, so it is focused directly
      // rather than through a ref lookup like a real input.
      if (first === "content") fieldRefs.content.current?.getEditor()?.focus();
      else fieldRefs[first]?.current?.focus();

      return;
    }

    const payload = new FormData();
    payload.append("title", normaliseText(form.title));
    payload.append("description", normaliseText(form.description));
    payload.append("author", normaliseText(form.author));
    payload.append("content", form.content);
    payload.append("status", nextStatus);

    // A file is appended as a file; an imported image is appended as the stored URL
    // the server already gave us. The pasted address is never sent, and if nothing
    // changed then `image` is omitted entirely so the existing image is left alone
    // rather than being cleared and re-set. A staged removal sends an empty string,
    // which the server stores as no image (see updateBlog: '' is normalised to null).
    if (imageFile) payload.append("image", imageFile);
    else if (importedImage) payload.append("image", importedImage);
    else if (imageRemoved) payload.append("image", "");

    try {
      const { data } = await updateBlog(blogId, payload);

      // The saved form becomes the new baseline, so a second save without further
      // edits is not treated as unsaved work.
      setLoaded(form);
      setImageFile(null);
      setImportedImage(null);
      setImagePreview((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return null;
      });
      // The stored image is now whatever the server returned. On a removal this
      // is null/empty; on a replacement it is the new URL — either way the old
      // preview must not be restored.
      setExistingImage(data?.blog?.image || null);
      setImageRemoved(false);
      setStatus(nextStatus);

      const title = normaliseText(form.title);
      setSuccess(
        nextStatus === BLOG_STATUS.PUBLISHED
          ? `Saved and published “${title}”.`
          : `Saved “${title}” as a draft. It is not visible on the public blog.`
      );

      // The dashboard loads the list itself when it mounts, so there is no cache
      // to invalidate. A moment of visible confirmation beats a page that changes
      // before the author can read it.
      redirectTimer.current = setTimeout(() => {
        redirectTimer.current = null;
        navigate("/admin/dashboard", { replace: true });
      }, 1200);
    } catch (error) {
      setFailure(describeFailure(error));

      // Released so the author can fix the problem and try again. The form is
      // deliberately left exactly as it was, including any staged image.
      submitLock.current = false;
      setSubmitting(false);
      setSubmitIntent(null);
    }
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSave(status);
  };

  // ==========================================
  // LOADING AND LOAD FAILURE
  // ==========================================
  if (loading) {
    return (
      <AdminShell title="Edit Blog" subtitle="Loading this post…">
        <div className="flex items-center gap-3 rounded-xl border border-[#e8e6f1] bg-white px-5 py-8 text-[#534277]">
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-[#c3bddb] border-t-[#231746]"
            aria-hidden="true"
          />
          <p className="text-[14px]">Loading this post…</p>
        </div>
      </AdminShell>
    );
  }

  if (loadError) {
    return (
      <AdminShell title="Edit Blog" subtitle={null}>
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#ecd7d9] bg-[#fdf4f5] px-4 py-3 text-[#a32b3b]"
        >
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-[13.5px] leading-relaxed">{loadError}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/dashboard", { replace: true })}
          className="inline-flex items-center gap-1.5 rounded-md text-[13.5px] font-semibold text-[#534277] transition-colors hover:text-[#231746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
        >
          <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to blogs
        </button>
      </AdminShell>
    );
  }

  // ==========================================
  // NOTICES
  // ==========================================
  const notice = success ? (
    <div
      role="status"
      className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#cfe4d8] bg-[#eef6f1] px-4 py-3 text-[#1f6b45]"
    >
      <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="text-[13.5px] leading-relaxed">{success}</p>
    </div>
  ) : null;

  const errorNotice = failure ? (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#ecd7d9] bg-[#fdf4f5] px-4 py-3 text-[#a32b3b]"
    >
      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-relaxed">{failure}</p>

        <button
          type="button"
          onClick={() => setFailure(null)}
          className="mt-1.5 text-[12.5px] font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a32b3b]"
        >
          Dismiss
        </button>
      </div>
    </div>
  ) : null;

  const publishedAt = formatDateTime(meta.publishedAt);
  const createdAt = formatDateTime(meta.createdAt);
  const updatedAt = formatDateTime(meta.updatedAt);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <AdminShell
      title="Edit Blog"
      subtitle="Changes are saved when you press save. The post keeps its address and its original publish date."
      guardNavigation={dirty}
      action={
        <button
          type="button"
          onClick={() => handleSave(status)}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#231746] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cfc9e2]"
        >
          {submitting ? (
            <>
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              {submitIntent === BLOG_STATUS.PUBLISHED ? "Publishing…" : "Saving…"}
            </>
          ) : (
            <>
              <FiEdit3 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Save changes</span>
              <span className="sm:hidden">Save</span>
            </>
          )}
        </button>
      }
    >
      <button
        type="button"
        onClick={() => {
          if (!dirty) navigate("/admin/dashboard", { replace: true });
          else setLeaving(true);
        }}
        disabled={submitting}
        className="mb-5 inline-flex items-center gap-1.5 rounded-md text-[13.5px] font-semibold text-[#534277] transition-colors hover:text-[#231746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to blogs
      </button>

      {notice}
      {errorNotice}

      {/* A draft opened for editing must not look published, and vice versa. */}
      {status === BLOG_STATUS.DRAFT ? (
        <div className="mb-5 rounded-xl border border-[#d5d0e6] bg-[#f6f5fc] px-4 py-3">
          <p className="text-[13.5px] font-semibold text-[#3a3355]">This is a draft</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#6b6483]">
            It is not visible on the public blog. Saving will not publish it — use
            Publish for that.
          </p>
        </div>
      ) : null}

      <form id="edit-blog-form" onSubmit={handleFormSubmit} noValidate>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start xl:gap-7">
          {/* ==========================================
              MAIN COLUMN
              ========================================== */}
          <div className="min-w-0 space-y-6 rounded-xl border border-[#e8e6f1] bg-white p-5 sm:p-6">
            <TextField
              name="title"
              label="Title"
              required
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              error={errors.title}
              placeholder="How AI Is Changing Web Design"
              limit={LIMITS.title.max}
              ref={fieldRefs.title}
              hint="The post's headline. Changing it does not change the post's address."
            />

            <TextField
              as="textarea"
              name="description"
              label="Description"
              required
              rows={3}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              error={errors.description}
              placeholder="One or two sentences summarising the article."
              limit={LIMITS.description.max}
              hint={`Shown in listings and used as the summary. Between ${LIMITS.description.min} and ${LIMITS.description.max} characters.`}
            />

            <div className="border-t border-[#f0eef7] pt-6">
              {/* The full Quill surface, which this screen has always offered and
                  which the server's sanitizer preserves format by format. */}
              <ContentEditor
                value={form.content}
                onChange={(value) => updateField("content", value)}
                error={errors.content}
                disabled={submitting}
                editorRef={fieldRefs.content}
                modules={QUILL_MODULES_EDIT}
                formats={QUILL_FORMATS_EDIT}
              />
            </div>
          </div>

          {/* ==========================================
              SIDEBAR
              ========================================== */}
          <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
            <div className="rounded-xl border border-[#e8e6f1] bg-white p-5">
              <PublishControls
                status={status}
                onStatusChange={setStatus}
                checklist={checklist}
                slug={slug}
                busy={submitting}
                disabled={submitting}
                onSaveDraft={() => handleSave(BLOG_STATUS.DRAFT)}
                addressNote="This is the post's existing address. It was generated once from its first title and is kept deliberately, so no link, share or search result that points here breaks."
              />
            </div>

            <div className="rounded-xl border border-[#e8e6f1] bg-white p-5">
              <FeaturedImageUploader
                file={imageFile}
                preview={imagePreview || importedImage}
                existingUrl={imageRemoved ? null : existingImage}
                onSelect={handleImageSelect}
                onClear={handleImageClear}
                disabled={submitting}
              >
                <ImageUrlImporter onImport={handleImport} disabled={submitting} />
              </FeaturedImageUploader>
            </div>

            <div className="rounded-xl border border-[#e8e6f1] bg-white p-5">
              <TextField
                name="author"
                label="Author"
                required
                value={form.author}
                onChange={(event) => updateField("author", event.target.value)}
                error={errors.author}
                placeholder="Name shown on the post"
                limit={LIMITS.author.max}
                hint={`The byline. Between ${LIMITS.author.min} and ${LIMITS.author.max} characters.`}
                ref={fieldRefs.author}
              />
            </div>

            {/* Facts about this post rather than things to edit. Rendered only when
                the server actually sent them. */}
            <div className="rounded-xl border border-[#e8e6f1] bg-white p-5">
              <p className="text-[13.5px] font-semibold text-[#231746]">Post details</p>

              <dl className="mt-2.5 space-y-2 text-[12.5px]">
                {[
                  { label: "Published", value: publishedAt },
                  { label: "Created", value: createdAt },
                  { label: "Last updated", value: updatedAt },
                ]
                  .filter((row) => row.value)
                  .map((row) => (
                    <div key={row.label} className="flex justify-between gap-3">
                      <dt className="shrink-0 text-[#8c86a1]">{row.label}</dt>
                      <dd className="text-right text-[#534277]">{row.value}</dd>
                    </div>
                  ))}
              </dl>

              {publishedAt ? (
                <p className="mt-2.5 text-[12px] leading-relaxed text-[#8c86a1]">
                  The original publish date is kept even if you move this post back
                  to draft and publish it again.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </form>

      <ConfirmDialog
        open={leaving}
        title="Leave without saving?"
        description="This post has changes that have not been saved. Leaving now discards them."
        confirmLabel="Discard and leave"
        cancelLabel="Keep editing"
        destructive
        onConfirm={() => {
          setLeaving(false);
          navigate("/admin/dashboard", { replace: true });
        }}
        onCancel={() => setLeaving(false)}
      />
    </AdminShell>
  );
};

export default EditBlog;
