import { FiEye, FiEyeOff } from "react-icons/fi";
import { isDraft } from "./blogMeta";

/**
 * Moves a post between drafts and published.
 *
 * The decision about whether a post is allowed to go live belongs to the caller,
 * which owns the message shown when it is not: this component only renders the
 * state, so the same control works in a table row and on a card.
 *
 * Kept out of the table's action cell on purpose. Edit and Delete are navigation
 * and destruction; publishing is a state change, so it sits with the state it
 * changes rather than beside "Delete".
 */
const PublishToggle = ({ blog, busy, onToggle }) => {
  const draft = isDraft(blog);
  const label = draft ? "Publish" : "Unpublish";

  return (
    <button
      type="button"
      onClick={() => onToggle(blog)}
      disabled={busy}
      aria-label={`${label} "${blog.title}"`}
      className="mt-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[12.5px] font-semibold text-[#534277] transition-colors hover:bg-[#f1effa] hover:text-[#231746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? (
        <span
          className="h-3 w-3 animate-spin rounded-full border-2 border-[#534277]/30 border-t-[#534277]"
          aria-hidden="true"
        />
      ) : draft ? (
        <FiEye className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <FiEyeOff className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {busy ? "Working…" : label}
    </button>
  );
};

export default PublishToggle;
