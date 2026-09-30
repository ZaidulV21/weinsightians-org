import { FiCheck, FiEye, FiFileText, FiLock } from "react-icons/fi";
import { BLOG_STATUS } from "../../utils/blogForm";

/**
 * The publishing panel: what will happen, and what is still missing.
 *
 * The status control is a radio group rather than a switch, because publishing is
 * a decision with a lasting consequence and both options deserve a sentence
 * explaining it. `published` and `draft` are the server's own values
 * (BLOG_STATUS in server/models/Blog.js); the client never invents a third one.
 *
 * The checklist reads the same field values the form holds, so it cannot disagree
 * with the messages next to the inputs.
 */
const PublishControls = ({
  status,
  onStatusChange,
  checklist,
  slug,
  busy,
  onSaveDraft,
  disabled = false,
}) => {
  const options = [
    {
      value: BLOG_STATUS.PUBLISHED,
      Icon: FiEye,
      label: "Publish",
      description: "Saves this post as live. It appears on the public blog and is open to search engines.",
    },
    {
      value: BLOG_STATUS.DRAFT,
      Icon: FiLock,
      label: "Draft",
      description: "Saves this post privately. Only the admin workspace can see it until you publish it later.",
    },
  ];

  return (
    <div className="space-y-5">
      {/* ==========================================
          STATUS
          ========================================== */}
      <fieldset>
        <legend className="text-[13.5px] font-semibold text-[#231746]">Visibility</legend>

        <div className="mt-2.5 space-y-2">
          {options.map((option) => {
            const { Icon } = option;
            const active = status === option.value;

            return (
              <label
                key={option.value}
                className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors ${
                  active
                    ? "border-[#231746] bg-[#f6f5fc]"
                    : "border-[#e8e6f1] bg-white hover:border-[#cbc6e0]"
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={active}
                  onChange={() => onStatusChange(option.value)}
                  disabled={disabled}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#231746]"
                />

                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#231746]">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {option.label}
                  </span>
                  <span className="mt-1 block text-[12.5px] leading-relaxed text-[#6b6483]">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ==========================================
          ADDRESS PREVIEW
          ========================================== */}
      <div>
        <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#231746]">
          <FiFileText className="h-3.5 w-3.5" aria-hidden="true" />
          Post address
        </p>

        {slug ? (
          <>
            <p className="mt-1.5 break-all rounded-lg border border-[#e8e6f1] bg-[#faf9fd] px-3 py-2 font-mono text-[12px] leading-relaxed text-[#534277]">
              /blog/{slug}
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-[#8c86a1]">
              Generated from the title by the server, which also guarantees it is
              unique. If the address is already taken it gets a number added, so
              this preview may not be the final one.
            </p>
          </>
        ) : (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#8c86a1]">
            Add a title to see the address this post will be published at.
          </p>
        )}
      </div>

      {/* ==========================================
          CHECKLIST
          ========================================== */}
      <div>
        <p className="text-[13.5px] font-semibold text-[#231746]">Before you save</p>

        <ul className="mt-2.5 space-y-1.5">
          {checklist.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
              {item.optional ? (
                <>
                  {/* An optional item is neither a pass nor a failure, so it gets
                      a neutral marker and says so. */}
                  <span
                    aria-hidden="true"
                    className="mt-px h-4 w-4 shrink-0 rounded-full border border-[#c3bddb] bg-[#faf9fd]"
                  />
                  <span className="text-[#6b6483]">
                    {item.label} <span className="text-[#8c86a1]">optional</span>
                  </span>
                </>
              ) : item.done ? (
                <>
                  <span
                    aria-hidden="true"
                    className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eef6f1] text-[#1f6b45]"
                  >
                    <FiCheck className="h-2.5 w-2.5" />
                  </span>
                  {/* The tick is decoration; the word carries the meaning. */}
                  <span className="text-[#6b6483]">
                    {item.label} <span className="text-[#1f6b45]">ready</span>
                  </span>
                </>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="mt-px h-4 w-4 shrink-0 rounded-full border border-dashed border-[#c3bddb]"
                  />
                  <span className="text-[#6b6483]">
                    {item.label} <span className="text-[#a32b3b]">needed</span>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>

        <p className="mt-2.5 text-[12px] leading-relaxed text-[#8c86a1]">
          A draft is private rather than unfinished: it needs the same fields as a
          published post. Only its visibility differs.
        </p>
      </div>

      {/* ==========================================
          SECONDARY ACTION
          ========================================== */}
      <button
        type="button"
        onClick={onSaveDraft}
        disabled={disabled || busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#d5d0e6] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#3a3355] transition-colors hover:bg-[#f7f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <>
            <span
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8c86a1]/40 border-t-[#534277]"
              aria-hidden="true"
            />
            Saving…
          </>
        ) : (
          "Save as draft"
        )}
      </button>
    </div>
  );
};

export default PublishControls;
