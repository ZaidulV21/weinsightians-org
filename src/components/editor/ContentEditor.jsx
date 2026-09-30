import { useEffect, useId, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { QUILL_FORMATS, QUILL_MODULES } from "./editorConfig";
import { LIMITS, visibleLength } from "../../utils/blogForm";

/**
 * The body editor.
 *
 * A wrapper rather than a replacement: it keeps the ReactQuill this project
 * already uses, and adds the things a CMS form needs around it — an accessible
 * name, an error tied to the field, a counter that measures visible text the same
 * way the server does, and a busy state.
 *
 * Security note: ReactQuill is an editor, not a filter. It never blocks a pasted
 * <script> or a javascript: link. Whatever comes out of it is sanitized by
 * sanitizeBlogContent() on the server before it is stored, and nothing here
 * renders that HTML — there is no path from editor output to a live DOM in the
 * admin app.
 */
const ContentEditor = ({
  value,
  onChange,
  error,
  disabled = false,
  describedBy,
  editorRef,
}) => {
  const localRef = useRef(null);
  const quillRef = editorRef || localRef;
  const reactId = useId();

  const labelId = `${reactId}-label`;
  const hintId = `${reactId}-hint`;
  const errorId = `${reactId}-error`;

  // Only ids that are really rendered, so aria-describedby never dangles.
  const describedByIds = [describedBy, hintId, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  // Quill renders its own contenteditable surface and React gives no way to put
  // attributes on it, so the association is made directly on the real element
  // after mount. A contenteditable div is not a labelable element, which is why
  // this is aria-labelledby rather than <label for>.
  useEffect(() => {
    const root = quillRef.current?.getEditor()?.root;
    if (!root) return;

    root.id = `${reactId}-editor`;
    root.setAttribute("aria-labelledby", labelId);

    if (describedByIds) root.setAttribute("aria-describedby", describedByIds);
    else root.removeAttribute("aria-describedby");

    if (error) root.setAttribute("aria-invalid", "true");
    else root.removeAttribute("aria-invalid");
  }, [describedByIds, error, labelId, quillRef, reactId]);

  const length = visibleLength(value);
  const { min } = LIMITS.content;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span id={labelId} className="block text-[13.5px] font-semibold text-[#231746]">
          Content <span className="text-[#a32b3b]" aria-hidden="true">*</span>
        </span>

        <p className="text-[12.5px] text-[#8c86a1]">
          <span className={length === 0 ? "font-semibold text-[#a32b3b]" : "font-semibold text-[#534277]"}>
            {length.toLocaleString("en-GB")}
          </span>{" "}
          visible characters
        </p>
      </div>

      <p id={hintId} className="mt-1 text-[12.5px] leading-relaxed text-[#8c86a1]">
        Headings, emphasis, lists, quotes and links. At least {min} characters of
        readable text.
      </p>

      <div
        className={`mt-2.5 overflow-hidden rounded-xl border bg-white transition-colors ${
          error
            ? "border-[#d9a3a9] ring-1 ring-[#d9a3a9]"
            : "border-[#ddd9ea] focus-within:border-[#231746] focus-within:ring-2 focus-within:ring-[#231746]/15"
        }`}
      >
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={QUILL_MODULES}
          formats={QUILL_FORMATS}
          placeholder="Write your article here…"
          readOnly={disabled}
          className="bg-white"
          // A tall enough canvas to be usable on a laptop, without pushing the
          // rest of the form off the screen.
          style={{ minHeight: "22rem" }}
        />
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-[13px] font-medium text-[#a32b3b]">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default ContentEditor;
