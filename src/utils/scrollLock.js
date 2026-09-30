// Locks page scrolling while an overlay is open.
//
// A plain "set overflow hidden on open, clear on close" breaks when two
// overlays overlap - closing the inner one would unlock the page while the outer
// one is still showing. Counting the holders makes nesting safe, and matters
// here because a confirmation dialog can be opened from a row inside the mobile
// drawer.

let holders = 0;
let previousOverflow = "";

export const lockScroll = () => {
  if (typeof document === "undefined") return;

  holders += 1;
  if (holders === 1) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
};

export const unlockScroll = () => {
  if (typeof document === "undefined") return;

  holders = Math.max(0, holders - 1);
  if (holders === 0) {
    document.body.style.overflow = previousOverflow;
  }
};
