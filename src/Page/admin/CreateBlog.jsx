import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiEye } from "react-icons/fi";
import { createBlog } from "../../api/blogApi";
import AdminShell from "../../components/admin/AdminShell";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import FeaturedImageUploader from "../../components/admin/FeaturedImageUploader";
import PublishControls from "../../components/admin/PublishControls";
import TextField from "../../components/admin/TextField";
import ContentEditor from "../../components/editor/ContentEditor";
import {
  BLOG_STATUS,
  LIMITS,
  firstInvalidField,
  normaliseText,
  slugifyPreview,
  validateBlogForm,
  visibleLength,
} from "../../utils/blogForm";

// ==========================================
// CREATE BLOG
// ==========================================
// What the server already does, so this screen never has to guess:
//
//   POST /api/v1/blogs  (authenticated, admin, rate limited)
//     - the slug is generated from the title, and made unique with a numeric
//       suffix if the address is taken, so two posts with the same title can
//       never collide
//     - the body is sanitized before it is stored; this screen never renders it
//     - `status` is the server's own draft/published value, and `publishedAt` is
//       stamped only for a published post
//     - title, description, author and content are all required on every post
//
// Which means a duplicate slug is resolved by the server rather than reported as
// an error, the only status values are the two below, and there is no client-side
// work here that could make a post public without the server's agreement.

const EMPTY_FORM = { title: "", description: "", author: "", content: "" };

// A user who has typed nothing has nothing to lose. A user who has typed a word
// does, so that is what decides whether the browser warning appears.
const isMeaningful = ({ title, description, author, content }) =>
  Boolean(
    normaliseText(title) ||
      normaliseText(description) ||
      normaliseText(author) ||
      visibleLength(content)
  );

const CreateBlog = () => {
  const navigate = useNavigate();

  // ==========================================
  // FORM STATE
  // One object, one setter. Nothing is duplicated into a second store and
  // nothing is persisted: reloading the page is meant to lose a draft that was
  // never saved.
  // ==========================================
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Draft is the starting point, not published. A post should become public
  // because someone chose that, never because a form was opened and submitted.
  const [status, setStatus] = useState(BLOG_STATUS.DRAFT);

  const [errors, setErrors] = useState({});
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitIntent, setSubmitIntent] = useState(null); // "draft" | "published"
  const [failure, setFailure] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leaving, setLeaving] = useState(false);

  // The submit lock lives in a ref as well as in state. State alone is not enough:
  // two clicks arriving before React re-renders would both read the same stale
  // `submitting === false` and create the post twice. A ref is written
  // synchronously, so the second one is turned away on the spot.
  const submitLock = useRef(false);

  // The pause after a successful save exists so the confirmation can be read.
  // The timer is held in a ref so that leaving during that pause — which the
  // author is free to do, because the post is already saved and nothing is at
  // risk — cancels the pending redirect instead of firing it into a component
  // that is no longer on screen.
  const redirectTimer = useRef(null);

  // Field refs, so a failed submit can move the caret to the first problem.
  const fieldRefs = {
    title: useRef(null),
    description: useRef(null),
    author: useRef(null),
    content: useRef(null),
  };

  // ==========================================
  // DERIVED
  // ==========================================
  const slug = useMemo(() => slugifyPreview(form.title), [form.title]);

  // Read from the field values rather than from the error map, so the checklist
  // is honest from the first keystroke instead of only after a failed submit.
  const checklist = useMemo(
    () => [
      {
        id: "title",
        label: "Title",
        done: normaliseText(form.title).length >= LIMITS.title.min,
      },
      {
        id: "description",
        label: "Description",
        done: normaliseText(form.description).length >= LIMITS.description.min,
      },
      {
        id: "author",
        label: "Author",
        done: normaliseText(form.author).length >= LIMITS.author.min,
      },
      {
        id: "content",
        label: "Content",
        done: visibleLength(form.content) >= LIMITS.content.min,
      },
      { id: "image", label: "Featured image", done: Boolean(imageFile), optional: true },
    ],
    [form, imageFile]
  );

  // ==========================================
  // UNSAVED WORK
  //
  // Two different problems, handled two different ways:
  //
  //   Refreshing or closing the tab  -> beforeunload. Works with any router.
  //   Clicking a link in the sidebar -> handled by the shell's guardNavigation
  //     prop, because this app uses <BrowserRouter> and React Router's useBlocker
  //     needs a data router (createBrowserRouter). Moving the whole app to one
  //     is a separate change, not something to smuggle into a create form.
  // ==========================================
  const dirty = !success && (isMeaningful(form) || Boolean(imageFile));

  useEffect(() => {
    if (!dirty) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      // Chrome shows its own wording when this is set; the string is only used by
      // older browsers.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  // A scheduled redirect belongs to this screen. If the screen goes away first,
  // the redirect is dropped rather than executed on an unmounted component.
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
  // FIELD HANDLERS
  // ==========================================
  const updateField = useCallback(
    (field, value) => {
      setForm((previous) => ({ ...previous, [field]: value }));

      // After a first failed submit, fields are re-checked as they are fixed
      // rather than making the author submit again to find out. The whole form is
      // revalidated because the rule is a pure function of the values.
      if (touchedSubmit) {
        setErrors(validateBlogForm({ ...form, [field]: value }));
      }
    },
    [form, touchedSubmit]
  );

  const handleImageSelect = (file) => {
    // Replacing a chosen file releases the previous preview rather than leaking
    // both for the life of the page.
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setImageFile(file);
  };

  const handleImageClear = () => {
    setImagePreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setImageFile(null);
  };

  // ==========================================
  // VALIDATION
  // ==========================================
  const runValidation = useCallback(() => {
    const found = validateBlogForm(form);
    setErrors(found);
    return found;
  }, [form]);

  /**
   * Turns a failed request into a sentence an author can act on.
   *
   * The server's own messages are safe to show: its error handler is written so a
   * client only ever receives a message the server chose, never a driver error, a
   * stack trace or a path. Anything unrecognised falls through to a generic
   * sentence rather than echoing an exception.
   */
  const describeFailure = (error) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.msg || error?.response?.data?.message;

    if (typeof serverMessage === "string" && serverMessage.trim()) {
      return serverMessage;
    }

    if (!error?.response) {
      return "The post could not be saved because the server could not be reached. Check your connection and try again — nothing was lost.";
    }

    if (status === 401) {
      return "Your session has ended. Sign in again to save this post.";
    }

    if (status === 403) {
      return "This account is not allowed to publish posts.";
    }

    if (status === 413) {
      return "That image is larger than the 5 MB limit. Choose a smaller one and try again.";
    }

    if (status === 429) {
      return "Too many attempts. Wait a moment and try again.";
    }

    if (status >= 500) {
      return "The server could not save this post. Nothing was lost — try again in a moment.";
    }

    return "The post could not be saved. Nothing was lost — please review the fields and try again.";
  };

  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSave = async (nextStatus) => {
    // The single gate against a double submit. Enter in a text field, the
    // Publish button and Save as draft all arrive here.
    if (submitLock.current) return;

    submitLock.current = true;
    setSubmitting(true);
    setSubmitIntent(nextStatus);
    setTouchedSubmit(true);
    setFailure(null);

    const found = runValidation();

    if (Object.keys(found).length > 0) {
      submitLock.current = false;
      setSubmitting(false);
      setSubmitIntent(null);

      const first = firstInvalidField(found);
      // Quill's surface is a contenteditable div, so it is focused directly
      // rather than through a ref lookup like a real input.
      if (first === "content") {
        fieldRefs.content.current?.getEditor()?.focus();
      } else {
        fieldRefs[first]?.current?.focus();
      }

      return;
    }

    // Everything is trimmed and whitespace-collapsed before it is sent, so
    // "  How   AI  " is stored as "How AI" and does not fail a length check on
    // padding no reader would see. Nothing is ever truncated.
    const payload = new FormData();
    payload.append("title", normaliseText(form.title));
    payload.append("description", normaliseText(form.description));
    payload.append("author", normaliseText(form.author));
    payload.append("content", form.content);
    payload.append("status", nextStatus);

    if (imageFile) payload.append("image", imageFile);

    try {
      await createBlog(payload);

      const created = nextStatus === BLOG_STATUS.PUBLISHED;
      setSuccess(
        created
          ? `Published “${normaliseText(form.title)}”. It is live on the blog now.`
          : `Saved “${normaliseText(form.title)}” as a draft. Only you can see it until you publish it.`
      );

      // The dashboard reads the list itself when it mounts, so there is no cache
      // to clear and no state to hand over. A moment of visible confirmation is
      // better than a page that changes before the author can read it.
      redirectTimer.current = setTimeout(() => {
        redirectTimer.current = null;
        navigate("/admin/dashboard", { replace: true });
      }, 1200);
    } catch (error) {
      setFailure(describeFailure(error));

      // The lock is released so the author can correct the problem and try
      // again. The form is deliberately left exactly as it was.
      submitLock.current = false;
      setSubmitting(false);
      setSubmitIntent(null);
    }
  };

  // Enter inside a text field submits the form with whatever status is selected
  // in the sidebar, which is Draft unless the author changed it.
  const handleFormSubmit = (event) => {
    event.preventDefault();
    handleSave(status);
  };

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

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <AdminShell
      title="Create Blog"
      subtitle="Write the post, then choose whether it goes live now or stays a draft."
      guardNavigation={dirty}
      action={
        <button
          type="button"
          onClick={() => handleSave(BLOG_STATUS.PUBLISHED)}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#231746] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cfc9e2]"
        >
          {submitIntent === BLOG_STATUS.PUBLISHED && submitting ? (
            <>
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Publishing…
            </>
          ) : (
            <>
              <FiEye className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Publish Blog</span>
              <span className="sm:hidden">Publish</span>
            </>
          )}
        </button>
      }
    >
      {/* Back to the blog list. With nothing typed there is nothing to lose, so it
          goes straight there; with unsaved work it asks first. */}
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

      <form id="create-blog-form" onSubmit={handleFormSubmit} noValidate>
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
              hint="The post's headline, and the source of its address."
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
              <ContentEditor
                value={form.content}
                onChange={(value) => updateField("content", value)}
                error={errors.content}
                disabled={submitting}
                editorRef={fieldRefs.content}
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
              />
            </div>

            <div className="rounded-xl border border-[#e8e6f1] bg-white p-5">
              <FeaturedImageUploader
                file={imageFile}
                preview={imagePreview}
                onSelect={handleImageSelect}
                onClear={handleImageClear}
                disabled={submitting}
              />
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
          </aside>
        </div>
      </form>

      {/* ==========================================
          DISCARD CONFIRMATION
          ========================================== */}
      <ConfirmDialog
        open={leaving}
        title="Leave without saving?"
        description="This post has not been saved yet. Leaving now discards everything you have typed."
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

export default CreateBlog;
