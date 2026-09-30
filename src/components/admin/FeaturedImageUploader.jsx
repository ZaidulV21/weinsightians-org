import { useEffect, useId, useRef, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { IMAGE_RULES, formatBytes, validateImageFile } from "../../utils/blogForm";

/**
 * The featured image picker.
 *
 * The real checks happen on the server: multer's declared-type filter, its size
 * limit, and then the file's actual magic bytes before a single byte is streamed
 * to storage. Everything here is a courtesy that saves a doomed upload and gives
 * the author immediate feedback — never a security boundary.
 *
 * Three details worth keeping:
 *   - The visible control is a <label> bound to a real <input type="file">, and the
 *     input stays in the accessibility tree, so the whole thing works with the
 *     keyboard alone (tab to it, then space or enter).
 *   - Accepting "image/*" would offer SVG, which the server refuses because an
 *     SVG is an XML document that can carry script. The list is the server's.
 *   - Dropping a file is handled on the visible label, not on the hidden input,
 *     because an input the author cannot see cannot receive a drop.
 */
const FeaturedImageUploader = ({ file, preview, onSelect, onClear, disabled = false }) => {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const hintId = `${reactId}-hint`;
  const errorId = `${reactId}-error`;

  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  // The preview is an object URL created by the parent, so it has to be released
  // when it changes or the screen unmounts. Skipping this holds the whole file in
  // memory for as long as the tab is open.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const acceptFile = (candidate) => {
    const message = validateImageFile(candidate);
    setError(message);
    if (message) return false;

    onSelect(candidate);
    return true;
  };

  const handleChange = (event) => {
    const candidate = event.target.files?.[0];
    if (candidate) acceptFile(candidate);

    // Reset so choosing the same file twice in a row still fires a change event
    // instead of looking like nothing happened.
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;

    const candidate = event.dataTransfer?.files?.[0];
    if (candidate) acceptFile(candidate);
  };

  const handleClear = () => {
    setError(null);
    onClear();
    inputRef.current?.focus();
  };

  const buttonClass =
    "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ddd9ea] bg-white px-2.5 py-1.5 text-[12.5px] font-semibold text-[#3a3355] transition-colors";

  // Split out from buttonClass so the disabled state can cancel the hover effect
  // and the pointer. The file input is already disabled, so a click does nothing
  // either way — without this the control just looks like it is still live.
  const enabledControlClass = `cursor-pointer hover:bg-[#f7f6fb] focus-within:ring-2 focus-within:ring-[#231746] focus-within:ring-offset-2 ${buttonClass}`;
  const disabledControlClass = `pointer-events-none cursor-not-allowed opacity-50 ${buttonClass}`;
  const controlClass = disabled ? disabledControlClass : enabledControlClass;

  return (
    <div>
      <label htmlFor={inputId} className="block text-[13.5px] font-semibold text-[#231746]">
        Featured image{" "}
        <span className="font-normal text-[#8c86a1]">(optional)</span>
      </label>

      <p id={hintId} className="mt-1 text-[12.5px] leading-relaxed text-[#8c86a1]">
        JPEG, PNG, GIF, WebP or AVIF, up to 5 MB. Used as the post&apos;s cover image.
      </p>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_RULES.accept}
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}
        aria-invalid={error ? "true" : undefined}
        className="peer sr-only"
      />

      {preview ? (
        <div className="mt-2.5">
          <img
            src={preview}
            alt="Selected featured image preview"
            className="h-40 w-full rounded-xl border border-[#e8e6f1] object-cover"
          />

          <p className="mt-2 truncate text-[12.5px] text-[#6b6483]">
            {file?.name}
            {file ? ` · ${formatBytes(file.size)}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <label htmlFor={inputId} className={controlClass}>
              <FiUpload className="h-3.5 w-3.5" aria-hidden="true" />
              Replace image
            </label>

            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className={`${controlClass} text-[#a32b3b] enabled:hover:bg-[#fdf4f5]`}
            >
              <FiX className="h-3.5 w-3.5" aria-hidden="true" />
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#231746] peer-focus-visible:ring-offset-2 ${
            disabled
              ? "cursor-not-allowed border-[#e8e6f1] bg-[#faf9fd]"
              : dragging
              ? "border-[#231746] bg-[#f1effa]"
              : error
              ? "border-[#d9a3a9] bg-[#fdf8f8]"
              : "border-[#ddd9ea] bg-[#faf9fd] hover:border-[#c3bddb] hover:bg-[#f7f6fb]"
          }`}
        >
          {error ? (
            <FiX className="h-6 w-6 text-[#a32b3b]" aria-hidden="true" />
          ) : (
            <FiUpload className="h-6 w-6 text-[#8c86a1]" aria-hidden="true" />
          )}

          <span className="mt-2.5 text-[13.5px] font-semibold text-[#3a3355]">
            {error ? "That file cannot be used" : "Choose an image"}
          </span>

          <span className="mt-1 text-[12.5px] text-[#8c86a1]">
            or drop one here · up to 5 MB
          </span>
        </label>
      )}

      {error ? (
        <p id={errorId} className="mt-2 text-[13px] font-medium text-[#a32b3b]">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default FeaturedImageUploader;
