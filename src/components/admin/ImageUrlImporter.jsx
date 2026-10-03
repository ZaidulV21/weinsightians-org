import { useId, useRef, useState } from "react";
import { FiDownload, FiLink } from "react-icons/fi";
import { validateImageUrl } from "../../utils/blogForm";

/**
 * Import a featured image by pasting its URL.
 *
 * The important thing to understand about this control is what it does *not* do:
 * it does not point the post at the pasted address. The server downloads the file,
 * checks it with the same rules an uploaded file goes through, stores it, and
 * hands back a URL on its own storage — and that is the only URL the editor ever
 * sends to the blog. A third-party URL is never saved, so it cannot later change
 * or disappear underneath the post.
 *
 * It is also a second, independent step from saving. An import can succeed and the
 * post still be unsaved, which is why the result is reported separately from the
 * save button rather than pretending to be one action.
 *
 * This control lives inside the Create/Edit Blog <form>, so it must NOT render
 * its own <form> (nested forms are invalid HTML and the inner submit would
 * submit the parent blog). It renders a <div> with an explicit type="button"
 * Import control instead, and Enter inside the URL input triggers an import via
 * a key handler — never a parent submission.
 *
 * Accessibility: a real form control with a real label, so it is reachable by
 * keyboard; the busy state is announced through aria-busy, and errors through
 * aria-describedby on the input itself rather than a message that only sighted
 * users would notice.
 */
/**
 * Turns a failed import into one sentence an author can act on.
 *
 * Two rules shape this. First, the server's own message is preferred, because it
 * is written for this exact situation and is careful never to include the
 * address, the resolved IP or the underlying failure — "That URL did not return
 * an image" says more than anything this file could invent. Second, a status
 * that is about *this request* rather than about the URL is never allowed to
 * surface a server-internal string. In particular a 404 here means the API the
 * page is talking to is an older build without the import endpoint; "Route does
 * not exist" is literally true of that server and completely misleading to
 * someone who simply pasted a bad link, so it is replaced with what actually
 * happened and what to do about it.
 */
const describeImportFailure = (error) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.msg;

  if (status === 404 || status === 405) {
    return "Image import is not available on this server yet. Please try again later.";
  }

  if (status === 401) {
    return "Your session has ended. Sign in again and import the image again.";
  }

  if (status === 429) {
    return "Too many import attempts. Wait a moment and try again.";
  }

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  if (!error?.response) {
    return "The image could not be imported because the server could not be reached. Check your connection and try again.";
  }

  if (status >= 500) {
    return "The server could not import this image. Nothing was lost — try again in a moment.";
  }

  return "Unable to import this image URL. Make sure it is a publicly accessible direct image URL.";
};

const ImageUrlImporter = ({ onImport, disabled = false }) => {
  const reactId = useId();
  const inputId = `${reactId}-url`;
  const hintId = `${reactId}-hint`;
  const errorId = `${reactId}-error`;
  const statusId = `${reactId}-status`;

  const inputRef = useRef(null);

  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [imported, setImported] = useState(null);

  // The import is a request the server has to fetch and store, so it can be
  // clicked twice. The ref is written synchronously, which a piece of state is
  // not: two clicks arriving before React re-renders would both see busy === false
  // and store the same image twice.
  const lock = useRef(false);

  // Runs outside any <form>: the Import button is type="button" and Enter is
  // intercepted on the input, so neither path submits the parent blog form.
  const handleImport = async () => {
    if (lock.current || disabled || busy) return;

    const candidate = value.trim();
    const message = validateImageUrl(candidate);
    setError(message);
    if (message) {
      inputRef.current?.focus();
      return;
    }

    lock.current = true;
    setBusy(true);
    setImported(null);

    try {
      await onImport(candidate);
      // The stored URL is deliberately not kept here: the parent owns the image,
      // and the box is emptied so a second paste is an obvious second action
      // rather than a repeat of the first.
      setValue("");
      setImported("Image imported. Save the post to keep it.");
    } catch (requestError) {
      setError(describeImportFailure(requestError));
      // The URL is deliberately left in the box, and the caret is put back in it,
      // so the failure is something to correct and retry rather than retype.
      inputRef.current?.focus();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };

  // Enter while the URL input is focused imports the URL instead of submitting
  // the parent blog form (implicit submission). No nested <form> is used.
  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      handleImport();
    }
  };

  const describedBy = [hintId, error ? errorId : null, imported ? statusId : null]
    .filter(Boolean)
    .join(" ");

  const borderClass = error
    ? "border-[#d9a3a9] focus-within:border-[#a32b3b]"
    : "border-[#e8e6f1] focus-within:border-[#231746]";

  return (
    <div className="mt-4 border-t border-[#f0eef7] pt-4">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[#231746]"
      >
        <FiLink className="h-3.5 w-3.5" aria-hidden="true" />
        Or import from a URL
      </label>

      <p id={hintId} className="mt-1 text-[12.5px] leading-relaxed text-[#8c86a1]">
        The file is downloaded, checked and stored on our own servers. The pasted
        address is never saved on the post.
      </p>

      <div className={`mt-2 flex flex-col gap-2 sm:flex-row ${borderClass} rounded-lg border`}>
        <input
          ref={inputRef}
          id={inputId}
          type="url"
          inputMode="url"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleInputKeyDown}
          placeholder="https://example.com/cover.jpg"
          disabled={disabled || busy}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : undefined}
          aria-busy={busy || undefined}
          className="min-w-0 flex-1 rounded-lg bg-white px-3 py-2 text-[13.5px] text-[#231746] placeholder:text-[#b5afc7] focus:outline-none disabled:bg-[#faf9fd] disabled:text-[#8c86a1]"
        />

        <button
          type="button"
          onClick={handleImport}
          disabled={disabled || busy}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#f1effa] px-3 py-2 text-[13px] font-semibold text-[#3a3355] transition-colors hover:bg-[#e7e4f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <span
                className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8c86a1]/40 border-t-[#534277]"
                aria-hidden="true"
              />
              Importing…
            </>
          ) : (
            <>
              <FiDownload className="h-3.5 w-3.5" aria-hidden="true" />
              Import
            </>
          )}
        </button>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-[13px] font-medium text-[#a32b3b]">
          {error}
        </p>
      ) : null}

      {imported ? (
        <p id={statusId} role="status" className="mt-2 text-[12.5px] text-[#1f6b45]">
          {imported}
        </p>
      ) : null}
    </div>
  );
};

export default ImageUrlImporter;
