import { forwardRef, useId } from "react";

/**
 * A labelled single-line or multi-line text field.
 *
 * Every input on the create and edit forms needs the same four things — a real
 * label, a hint, an error tied to the field with aria-describedby, and an
 * aria-invalid state — so they are built once here rather than repeated. The error
 * is a word plus a border, never colour on its own.
 *
 * The ref is forwarded to the real control so a form can move focus to the first
 * field that failed validation.
 *
 * `limit` drives the visible counter only. It is deliberately not the HTML
 * maxlength attribute: that attribute silently cuts pasted text off at the limit,
 * so an author pasting a long title would lose words with no warning. Here the
 * number is always visible and going over produces a message instead.
 */
const TextField = forwardRef(function TextField(
  {
    label,
    value,
    onChange,
    error,
    hint,
    placeholder,
    type = "text",
    as = "input",
    rows = 4,
    limit,
    required = false,
    disabled = false,
    autoComplete = "off",
    inputMode,
    name,
  },
  ref
) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const hintId = `${reactId}-hint`;
  const errorId = `${reactId}-error`;

  const describedByIds = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  const sharedProps = {
    id: inputId,
    name,
    value,
    onChange,
    placeholder,
    disabled,
    required,
    autoComplete,
    inputMode,
    ref,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedByIds || undefined,
    className: `w-full rounded-lg border bg-white px-3.5 py-2.5 text-[14px] text-[#231746] placeholder:text-[#a49dbb] transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:bg-[#faf9fd] disabled:text-[#8c86a1] ${
      error
        ? "border-[#d9a3a9] focus-visible:border-[#a32b3b] focus-visible:ring-[#a32b3b]/25"
        : "border-[#ddd9ea] focus-visible:border-[#231746] focus-visible:ring-[#231746]/15"
    }`,
  };

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={inputId} className="block text-[13.5px] font-semibold text-[#231746]">
          {label}{" "}
          {required ? (
            <span className="text-[#a32b3b]" aria-hidden="true">
              *
            </span>
          ) : (
            <span className="font-normal text-[#8c86a1]">(optional)</span>
          )}
        </label>

        {limit ? (
          <p className="text-[12.5px] text-[#8c86a1]">
            <span
              className={
                value.length > limit
                  ? "font-semibold text-[#a32b3b]"
                  : "font-semibold text-[#534277]"
              }
            >
              {value.length.toLocaleString("en-GB")}
            </span>{" "}
            / {limit.toLocaleString("en-GB")}
          </p>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="mt-1 text-[12.5px] leading-relaxed text-[#8c86a1]">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">
        {as === "textarea" ? (
          <textarea {...sharedProps} rows={rows} />
        ) : (
          <input {...sharedProps} type={type} />
        )}
      </div>

      {error ? (
        <p id={errorId} className="mt-2 text-[13px] font-medium text-[#a32b3b]">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default TextField;
