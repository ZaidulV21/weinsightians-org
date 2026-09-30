// ==========================================
// RICH TEXT EDITOR CONFIGURATION
// ==========================================
// One definition of what the body editor can produce, shared by the admin
// editor screens.
//
// The important rule lives on the server: everything here is HTML that
// ReactQuill produces, and ReactQuill is an editor, not a filter. Whatever comes
// out of it — including markup pasted from another site — is sanitized by
// sanitizeBlogContent() on the way into the database. Editing this toolbar
// changes what an author *can* do; it does not change what gets stored.
//
// Formatting here is deliberately limited to the set the server's sanitizer
// allowlists (server/utils/sanitizeUtils.js), so a button can never produce
// markup that is silently thrown away on save.

export const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "link"],
    ["clean"],
  ],
};

// "clean" is a toolbar button, not a format, so it is absent here.
export const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "align",
  "blockquote",
  "link",
];

// Images are intentionally not offered inside the body. The only supported image
// route is the featured-image upload, which is a multipart file checked on the
// server; letting the editor insert an arbitrary <img src> would bypass that.

// ==========================================
// FULL TOOLBAR (the edit screen)
// ==========================================
// The edit screen has always offered the whole Quill surface — H1, font family,
// strikethrough, colour, background, indent and code blocks. Those are not
// mistakes left over from an older toolbar: the server's sanitizer preserves all
// of them on purpose (server/utils/sanitizeUtils.js allows h1-h6, <s>/<strike>,
// color, background-color, font-family, padding/margin/text-indent, and
// pre/code, and its header comment lists them as intentionally preserved).
//
// So the two toolbars are deliberately different, and the narrow one above is
// the conservative choice for authoring a new post rather than a limit imposed
// by the backend. Both live here so there is a single place to change them,
// rather than a second private copy inside a page.

export const QUILL_MODULES_EDIT = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

export const QUILL_FORMATS_EDIT = [
  "header", "font",
  "bold", "italic", "underline", "strike",
  "color", "background",
  "list", "bullet", "indent",
  "align",
  "blockquote", "code-block",
  "link",
];
