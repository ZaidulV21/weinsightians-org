import { useCallback, useEffect, useRef } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import { lockScroll, unlockScroll } from "../../utils/scrollLock";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A confirmation dialog for destructive actions.
 *
 * Replaces window.confirm(), which cannot be styled, is announced
 * inconsistently, and gives a screen reader no control it can act on. This one
 * names the thing being deleted, moves focus in on open, keeps Tab inside the
 * dialog while it is open, closes on Escape, and hands focus back to whatever
 * opened it.
 */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  destructive = false,
  error = null,
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const cancelRef = useRef(null);
  const restoreFocusRef = useRef(null);

  // Remember what had focus before the dialog opened, so it can be given back.
  useEffect(() => {
    if (!open) return undefined;

    restoreFocusRef.current = document.activeElement;
    lockScroll();

    // Focus the safe action, not the destructive one: a stray Enter should not
    // be able to delete anything.
    const target = cancelRef.current || confirmRef.current;
    target?.focus();

    return () => {
      unlockScroll();
      const previous = restoreFocusRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [open]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Escape" && !busy) {
      event.stopPropagation();
      onCancel();
      return;
    }

    if (event.key !== "Tab") return;

    const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE);

    // While the request is in flight every control is disabled, so there is
    // nothing to move to. Hold focus on the dialog rather than letting it escape
    // into the page behind the overlay.
    if (!nodes || nodes.length === 0) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, [busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-[#04020b]/45"
        onClick={busy ? undefined : onCancel}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-md rounded-2xl border border-[#e8e6f1] bg-white p-6 shadow-[0_24px_60px_-24px_rgba(35,23,70,0.45)] sm:p-7"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-[#6b6483] transition-colors hover:bg-[#f4f2fa] hover:text-[#231746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiX className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className={
              destructive
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf0f1] text-[#a32b3b]"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f0fa] text-[#534277]"
            }
          >
            <FiAlertTriangle className="h-[18px] w-[18px]" />
          </span>

          <div className="min-w-0 pr-6">
            <h2
              id="confirm-dialog-title"
              className="font-[larken] text-[1.2rem] leading-snug text-[#231746]"
            >
              {title}
            </h2>
            <p
              id="confirm-dialog-description"
              className="mt-2 text-[14px] leading-relaxed text-[#5d5675]"
            >
              {description}
            </p>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-[#ecd7d9] bg-[#fdf4f5] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#a32b3b]"
          >
            {error}
          </p>
        ) : null}

        <div
          className={
            error
              ? "mt-4 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end"
              : "mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end"
          }
        >
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="w-full rounded-lg border border-[#ddd9ea] px-4 py-2.5 text-[14px] font-semibold text-[#3a3355] transition-colors hover:bg-[#f7f6fb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={
              destructive
                ? "flex w-full items-center justify-center gap-2 rounded-lg bg-[#a32b3b] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#8d2532] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a32b3b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#d8a7ad] sm:w-auto"
                : "flex w-full items-center justify-center gap-2 rounded-lg bg-[#231746] px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#2f2160] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#231746] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cfc9e2] sm:w-auto"
            }
          >
            {busy ? (
              <>
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
                Deleting…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
