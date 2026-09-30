import { Link } from "react-router-dom";
import { FiEdit2, FiImage, FiTrash2 } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import PublishToggle from "./PublishToggle";
import { formatDate, formatDateTime } from "./blogMeta";

/**
 * The blog list as cards, for narrow viewports.
 *
 * A seven-column table on a phone means either sideways scrolling or columns too
 * thin to read. Each card carries the same information as its table row, stacked,
 * and everything stays inside the viewport width.
 */
const BlogCardList = ({ blogs, busyId, updatingId, onRequestDelete, onToggle }) => (
  <ul className="space-y-3.5">
    {blogs.map((blog) => {
      const cardBusy = busyId === blog._id;

      return (
        <li
          key={blog._id}
          className="overflow-hidden rounded-xl border border-[#e8e6f1] bg-white"
        >
          {blog.image ? (
            <img
              src={blog.image}
              alt=""
              loading="lazy"
              className="h-36 w-full object-cover"
            />
          ) : null}

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-[15px] font-semibold leading-snug text-[#231746]">
                  {blog.title}
                </h3>
                <p className="mt-1.5 truncate font-mono text-[12px] text-[#8c86a1]">
                  {blog.slug}
                </p>
              </div>

              {!blog.image ? (
                <span
                  aria-hidden="true"
                  className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-[#ddd9ea] bg-[#faf9fd] text-[#b3adc7]"
                >
                  <FiImage className="h-4 w-4" />
                </span>
              ) : null}
            </div>

            <dl className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#6b6483]">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Author</dt>
                <dd>{blog.author}</dd>
              </div>

              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Created</dt>
                <dd aria-hidden="true" className="text-[#c3bddb]">
                  •
                </dd>
                <dd>
                  <time dateTime={blog.createdAt} title={formatDateTime(blog.createdAt)}>
                    {formatDate(blog.createdAt)}
                  </time>
                </dd>
              </div>
            </dl>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
              <StatusBadge blog={blog} />
              <PublishToggle
                blog={blog}
                busy={updatingId === blog._id}
                onToggle={onToggle}
              />
            </div>

            <div className="mt-4 flex gap-2.5">
              <Link
                to={`/admin/edit/${blog.slug}`}
                aria-label={`Edit "${blog.title}"`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#ddd9ea] px-3 py-2.5 text-[13.5px] font-semibold text-[#3a3355] transition-colors hover:bg-[#f7f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
              >
                <FiEdit2 className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Link>

              <button
                type="button"
                onClick={() => onRequestDelete(blog)}
                disabled={cardBusy || updatingId === blog._id}
                aria-label={`Delete "${blog.title}"`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#ecd7d9] px-3 py-2.5 text-[13.5px] font-semibold text-[#a32b3b] transition-colors hover:bg-[#fdf4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a32b3b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {cardBusy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </li>
      );
    })}
  </ul>
);

export default BlogCardList;
