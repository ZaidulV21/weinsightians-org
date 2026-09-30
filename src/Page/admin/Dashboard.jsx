import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiInbox,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { deleteBlog, getAdminBlogs, setBlogStatus } from "../../api/blogApi";
import AdminShell from "../../components/admin/AdminShell";
import BlogCardList from "../../components/admin/BlogCardList";
import BlogTable from "../../components/admin/BlogTable";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { canPublish, isDraft } from "../../components/admin/blogMeta";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

const NO_COUNTS = { total: 0, published: 0, drafts: 0 };

const NOTICES = {
  success: {
    Icon: FiCheckCircle,
    className: "border-[#cfe4d8] bg-[#eef6f1] text-[#1f6b45]",
  },
  warning: {
    Icon: FiAlertCircle,
    className: "border-[#ecdcb4] bg-[#fdf7e8] text-[#7a5c14]",
  },
  error: {
    Icon: FiAlertCircle,
    className: "border-[#ecd7d9] bg-[#fdf4f5] text-[#a32b3b]",
  },
};

const Dashboard = () => {
  // ==========================================
  // STATE
  // ==========================================
  const [blogs, setBlogs] = useState([]);
  const [counts, setCounts] = useState(NO_COUNTS);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState(null); // { tone, text }
  const [deleteError, setDeleteError] = useState(null);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // LOADING
  // The admin endpoint, not the public one: drafts are invisible to the public
  // API by design, so /blogs would show this page as empty.
  //
  // The counts on the stat cards come straight from the server's own totals
  // rather than being counted here, so the numbers always describe the whole
  // collection instead of only the rows that survived a filter.
  // ==========================================
  const loadBlogs = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoadState("loading");
    }

    try {
      const { data } = await getAdminBlogs();

      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      setCounts({
        total: Number(data.count) || 0,
        published: Number(data.publishedCount) || 0,
        drafts: Number(data.draftCount) || 0,
      });
      setLoadState("ready");
    } catch (error) {
      // A 401 means the session ended, and the B1 axios interceptor is already
      // sending the browser to the login page. Reporting an error here would only
      // flash before the navigation happens.
      if (error?.response?.status !== 401) {
        setLoadState("error");
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // ==========================================
  // SEARCH AND FILTER
  // Filtering happens on the list already in memory, so typing updates the
  // results immediately without a request or a page reload.
  // ==========================================
  const filterCounts = useMemo(() => {
    const drafts = blogs.filter(isDraft).length;
    return { all: blogs.length, published: blogs.length - drafts, draft: drafts };
  }, [blogs]);

  const visibleBlogs = useMemo(() => {
    const term = query.trim().toLowerCase();

    return blogs.filter((blog) => {
      if (filter === "published" && isDraft(blog)) return false;
      if (filter === "draft" && !isDraft(blog)) return false;
      if (!term) return true;

      return [blog.title, blog.author, blog.slug].some((field) =>
        field?.toLowerCase().includes(term)
      );
    });
  }, [blogs, filter, query]);

  const isFiltered = query.trim().length > 0 || filter !== "all";

  // ==========================================
  // PUBLISH / UNPUBLISH
  // Only the status is sent, so the server leaves the slug and the original
  // publish date alone.
  // ==========================================
  const handleToggleStatus = async (blog) => {
    const nextStatus = isDraft(blog) ? "published" : "draft";

    // An empty post would render a blank article on the public site.
    if (nextStatus === "published" && !canPublish(blog)) {
      setNotice({
        tone: "warning",
        text: `“${blog.title}” is missing a title, description or content, so it cannot go live yet.`,
      });
      return;
    }

    setUpdatingId(blog._id);

    try {
      await setBlogStatus(blog._id, nextStatus);

      // The server's own totals move by exactly one, so step them with the row
      // instead of leaving a stale number on screen for a moment.
      setBlogs((prev) =>
        prev.map((item) =>
          item._id === blog._id ? { ...item, status: nextStatus } : item
        )
      );
      setCounts((prev) =>
        nextStatus === "published"
          ? { ...prev, published: prev.published + 1, drafts: Math.max(0, prev.drafts - 1) }
          : { ...prev, published: Math.max(0, prev.published - 1), drafts: prev.drafts + 1 }
      );

      setNotice({
        tone: "success",
        text: `“${blog.title}” is now ${nextStatus}.`,
      });
    } catch {
      setNotice({
        tone: "error",
        text: `We couldn’t change the status of “${blog.title}”. It is unchanged.`,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // DELETE
  // The post is only removed once the server confirms it, and the list is then
  // revalidated against the server so the counts stay truthful.
  // ==========================================
  const handleRequestDelete = (blog) => {
    setDeleteError(null);
    setPendingDelete(blog);
  };

  const handleCloseDialog = () => {
    setPendingDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || deleting) return;

    const target = pendingDelete;
    const wasDraft = isDraft(target);

    setDeleting(true);
    setDeletingId(target._id);

    try {
      await deleteBlog(target._id);

      setBlogs((prev) => prev.filter((blog) => blog._id !== target._id));
      setCounts((prev) => ({
        total: Math.max(0, prev.total - 1),
        published: Math.max(0, prev.published - (wasDraft ? 0 : 1)),
        drafts: Math.max(0, prev.drafts - (wasDraft ? 1 : 0)),
      }));

      setPendingDelete(null);
      setDeleteError(null);
      setNotice({
        tone: "success",
        text: `“${target.title}” was deleted. This cannot be undone.`,
      });

      // Re-read the server's numbers rather than trusting the local step above.
      loadBlogs({ silent: true });
    } catch {
      // The dialog stays open with the reason inside it, so the failure is
      // visible and the post is still on screen.
      setDeleteError(
        "That post could not be deleted. Nothing was removed. Check your connection and try again."
      );
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  const statCards = [
    { label: "Total posts", value: counts.total, hint: "Everything in the workspace" },
    { label: "Published", value: counts.published, hint: "Live on the public blog" },
    { label: "Drafts", value: counts.drafts, hint: "Not visible to visitors yet" },
  ];

  const showSkeleton = loadState === "loading";
  const showError = loadState === "error";
  const showEmpty = loadState === "ready" && blogs.length === 0;
  const showNoResults = loadState === "ready" && blogs.length > 0 && visibleBlogs.length === 0;

  const Notice = notice ? (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 ${
        NOTICES[notice.tone].className
      }`}
    >
      {(() => {
        const { Icon } = NOTICES[notice.tone];
        return <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />;
      })()}

      <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed">{notice.text}</p>

      <button
        type="button"
        onClick={() => setNotice(null)}
        aria-label="Dismiss message"
        className="-mr-1 shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-1"
      >
        <FiX className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  ) : null;

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <AdminShell
      title="Dashboard"
      subtitle="Every post in the workspace, with its publish state and the actions available for it."
      action={
        <Link
          to="/admin/create"
          className="inline-flex items-center gap-2 rounded-lg bg-[#231746] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
        >
          <FiPlus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New post</span>
          <span className="sm:hidden">New</span>
        </Link>
      }
    >
      {Notice}

      {/* ==========================================
          STATISTICS
          ========================================== */}
      <section aria-label="Workspace summary" className="mb-6 sm:mb-8">
        <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
          {statCards.map((card) => (
            <li
              key={card.label}
              className="rounded-xl border border-[#e8e6f1] bg-white px-5 py-5"
            >
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.1em] text-[#8c86a1]">
                {card.label}
              </p>

              {showSkeleton || showError ? (
                // A dash rather than a zero: during a failed load the real number
                // is unknown, and "0 posts" would be a different, wrong statement.
                <p
                  aria-hidden="true"
                  className="mt-1.5 font-[larken] text-[2rem] leading-none text-[#c3bddb]"
                >
                  —
                </p>
              ) : (
                <p className="mt-1.5 font-[larken] text-[2rem] leading-none text-[#231746]">
                  {card.value}
                </p>
              )}

              <p className="mt-2.5 text-[12.5px] text-[#8c86a1]">{card.hint}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ==========================================
          BLOG LIST
          ========================================== */}
      <section id="blogs" aria-labelledby="blogs-heading" className="scroll-mt-24">
        <div className="overflow-hidden rounded-xl border border-[#e8e6f1] bg-white">
          {/* ---------- HEADER, SEARCH, FILTERS ---------- */}
          <div className="border-b border-[#eceaf4] px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 id="blogs-heading" className="font-[larken] text-[1.15rem] text-[#231746]">
                  All posts
                </h2>

                {refreshing ? (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#8c86a1]">
                    <span
                      className="h-3 w-3 animate-spin rounded-full border-2 border-[#b3adc7]/40 border-t-[#534277]"
                      aria-hidden="true"
                    />
                    Updating
                  </span>
                ) : null}
              </div>

              <p aria-live="polite" className="text-[13px] text-[#6b6483]">
                {isFiltered
                  ? `${visibleBlogs.length} of ${blogs.length} posts`
                  : `${blogs.length} ${blogs.length === 1 ? "post" : "posts"}`}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <label htmlFor="blog-search" className="sr-only">
                  Search posts by title, author or slug
                </label>

                <FiSearch
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a49dbb]"
                  aria-hidden="true"
                />

                <input
                  id="blog-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title, author or slug"
                  className="w-full appearance-none rounded-lg border border-[#ddd9ea] bg-white py-2.5 pl-10 pr-9 text-[14px] text-[#231746] placeholder:text-[#a49dbb] focus-visible:outline-none focus-visible:border-[#231746] focus-visible:ring-2 focus-visible:ring-[#231746]/15 [&::-webkit-search-cancel-button]:hidden"
                />

                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8c86a1] transition-colors hover:bg-[#f4f2fa] hover:text-[#231746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746]"
                  >
                    <FiX className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div
                role="group"
                aria-label="Filter posts by status"
                className="flex shrink-0 gap-1 rounded-lg border border-[#ddd9ea] bg-[#faf9fd] p-1"
              >
                {FILTERS.map((option) => {
                  const active = filter === option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setFilter(option.key)}
                      aria-pressed={active}
                      className={
                        active
                          ? "flex-1 rounded-md bg-white px-3 py-1.5 text-[13px] font-semibold text-[#231746] shadow-[0_1px_2px_rgba(35,23,70,0.08)] sm:flex-none"
                          : "flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium text-[#5d5675] transition-colors hover:text-[#231746] sm:flex-none"
                      }
                    >
                      {option.label}
                      <span className="ml-1.5 text-[12px] text-[#8c86a1]">
                        {filterCounts[option.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---------- LOADING ---------- */}
          {showSkeleton ? (
            <div className="px-5 py-6 sm:px-6" role="status" aria-live="polite">
              <span className="sr-only">Loading posts</span>

              <div className="space-y-4" aria-hidden="true">
                {[0, 1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center gap-4">
                    <div className="h-11 w-16 shrink-0 animate-pulse rounded-md bg-[#f0eef7]" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3.5 w-1/2 animate-pulse rounded bg-[#f0eef7]" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-[#f4f2fa]" />
                    </div>
                    <div className="hidden h-7 w-24 shrink-0 animate-pulse rounded-full bg-[#f4f2fa] sm:block" />
                    <div className="h-8 w-28 shrink-0 animate-pulse rounded-lg bg-[#f4f2fa]" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ---------- ERROR ---------- */}
          {showError ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf4f5] text-[#a32b3b]"
              >
                <FiAlertCircle className="h-5 w-5" />
              </span>

              <h3 className="mt-4 font-[larken] text-[1.1rem] text-[#231746]">
                We couldn’t load your posts
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#6b6483]">
                The workspace could not be reached. Nothing has changed. Try again, and if
                it keeps failing check your connection.
              </p>

              <button
                type="button"
                onClick={() => loadBlogs()}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#231746] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
              >
                <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
            </div>
          ) : null}

          {/* ---------- NO POSTS AT ALL ---------- */}
          {showEmpty ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1effa] text-[#534277]"
              >
                <FiInbox className="h-5 w-5" />
              </span>

              <h3 className="mt-4 font-[larken] text-[1.1rem] text-[#231746]">
                No posts yet
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#6b6483]">
                This workspace is empty. Your first post can be a draft, so it stays private
                until you decide to publish it.
              </p>

              <Link
                to="/admin/create"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#231746] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
              >
                <FiPlus className="h-4 w-4" aria-hidden="true" />
                Create your first post
              </Link>
            </div>
          ) : null}

          {/* ---------- SEARCH OR FILTER MATCHED NOTHING ---------- */}
          {showNoResults ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <span
                aria-hidden="true"
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f1effa] text-[#534277]"
              >
                <FiFileText className="h-5 w-5" />
              </span>

              <h3 className="mt-4 font-[larken] text-[1.1rem] text-[#231746]">
                No posts match
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[#6b6483]">
                {query.trim()
                  ? `Nothing here matches “${query.trim()}”.`
                  : "There are no posts with this status right now."}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-lg border border-[#ddd9ea] px-4 py-2.5 text-[14px] font-semibold text-[#3a3355] transition-colors hover:bg-[#f7f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
                  >
                    Clear search
                  </button>
                ) : null}

                {filter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setFilter("all")}
                    className="rounded-lg border border-[#ddd9ea] px-4 py-2.5 text-[14px] font-semibold text-[#3a3355] transition-colors hover:bg-[#f7f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
                  >
                    Show all statuses
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* ---------- RESULTS ---------- */}
          {loadState === "ready" && visibleBlogs.length > 0 ? (
            <>
              <div className="hidden lg:block">
                <BlogTable
                  blogs={visibleBlogs}
                  busyId={deletingId}
                  updatingId={updatingId}
                  onRequestDelete={handleRequestDelete}
                  onToggle={handleToggleStatus}
                />
              </div>

              <div className="p-4 lg:hidden">
                <BlogCardList
                  blogs={visibleBlogs}
                  busyId={deletingId}
                  updatingId={updatingId}
                  onRequestDelete={handleRequestDelete}
                  onToggle={handleToggleStatus}
                />
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* ==========================================
          DELETE CONFIRMATION
          ========================================== */}
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this post?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be removed from the workspace and from the public blog. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete post"
        cancelLabel="Keep post"
        busy={deleting}
        destructive
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDialog}
      />
    </AdminShell>
  );
};

export default Dashboard;
