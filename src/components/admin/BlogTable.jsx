import { Link } from "react-router-dom";
import { FiEdit2, FiImage, FiTrash2 } from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import PublishToggle from "./PublishToggle";
import { formatDate, formatDateTime } from "./blogMeta";

/**
 * The blog list as a table, for wide viewports.
 *
 * Only rendered at lg and above; below that the same data is shown as cards,
 * because seven columns on a phone means either horizontal scrolling or unreadable
 * columns. The container still allows a horizontal scroll as a safety net for
 * awkward widths between the two layouts.
 */
const BlogTable = ({ blogs, busyId, updatingId, onRequestDelete, onToggle }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[56rem] border-collapse text-left">
      <caption className="sr-only">
        All blog posts, with their publish state and the actions available for each.
      </caption>

      <thead>
        <tr className="border-b border-[#e8e6f1] text-[11px] uppercase tracking-[0.12em] text-[#8c86a1]">
          <th scope="col" className="px-4 py-3 font-semibold">
            Image
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Title
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Author
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Status
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Created
          </th>
          <th scope="col" className="px-4 py-3 font-semibold">
            Updated
          </th>
          <th scope="col" className="px-4 py-3 text-right font-semibold">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {blogs.map((blog) => {
          const rowBusy = busyId === blog._id;

          return (
            <tr
              key={blog._id}
              className="border-b border-[#f0eef7] align-top transition-colors last:border-0 hover:bg-[#fbfaff]"
            >
              <td className="px-4 py-4">
                {blog.image ? (
                  <img
                    src={blog.image}
                    alt=""
                    loading="lazy"
                    className="h-11 w-16 rounded-md border border-[#e8e6f1] object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-16 items-center justify-center rounded-md border border-dashed border-[#ddd9ea] bg-[#faf9fd] text-[#b3adc7]"
                  >
                    <FiImage className="h-4 w-4" />
                  </span>
                )}
              </td>

              <td className="max-w-[20rem] px-4 py-4">
                <p className="font-semibold leading-snug text-[14.5px] text-[#231746]">
                  {blog.title}
                </p>
                <p className="mt-1 truncate font-mono text-[12px] text-[#8c86a1]">
                  {blog.slug}
                </p>
              </td>

              <td className="px-4 py-4 text-[14px] text-[#5d5675]">{blog.author}</td>

              <td className="px-4 py-4">
                <StatusBadge blog={blog} />
                <PublishToggle
                  blog={blog}
                  busy={updatingId === blog._id}
                  onToggle={onToggle}
                />
              </td>

              <td className="px-4 py-4 text-[13.5px] text-[#5d5675]">
                <time dateTime={blog.createdAt} title={formatDateTime(blog.createdAt)}>
                  {formatDate(blog.createdAt)}
                </time>
              </td>

              <td className="px-4 py-4 text-[13.5px] text-[#5d5675]">
                <time dateTime={blog.updatedAt} title={formatDateTime(blog.updatedAt)}>
                  {formatDate(blog.updatedAt)}
                </time>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    to={`/admin/edit/${blog.slug}`}
                    aria-label={`Edit "${blog.title}"`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ddd9ea] px-3 py-1.5 text-[13px] font-semibold text-[#3a3355] transition-colors hover:border-[#c3bddb] hover:bg-[#f7f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => onRequestDelete(blog)}
                    disabled={rowBusy || updatingId === blog._id}
                    aria-label={`Delete "${blog.title}"`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ecd7d9] px-3 py-1.5 text-[13px] font-semibold text-[#a32b3b] transition-colors hover:bg-[#fdf4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a32b3b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {rowBusy ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default BlogTable;
