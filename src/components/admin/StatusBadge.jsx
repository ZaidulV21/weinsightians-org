import { isDraft, statusLabel } from "./blogMeta";

/**
 * Publish state, shown as a word plus a shape.
 *
 * Never colour alone: the label is the signal, the dot is the second cue, and the
 * two states use different dot shapes as well as different colours.
 */
const StatusBadge = ({ blog }) => {
  const draft = isDraft(blog);

  return (
    <span
      className={
        draft
          ? "inline-flex items-center gap-1.5 rounded-full border border-[#e2dff0] bg-[#f5f3fa] px-2.5 py-1 text-[12px] font-semibold text-[#5d5675]"
          : "inline-flex items-center gap-1.5 rounded-full border border-[#cfe4d8] bg-[#eef6f1] px-2.5 py-1 text-[12px] font-semibold text-[#1f6b45]"
      }
    >
      <span
        aria-hidden="true"
        className={
          draft
            ? "h-1.5 w-1.5 rounded-[1px] bg-[#8b83a8]"
            : "h-1.5 w-1.5 rounded-full bg-[#1f6b45]"
        }
      />
      {statusLabel(blog)}
    </span>
  );
};

export default StatusBadge;
