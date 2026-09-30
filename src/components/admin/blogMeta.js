/**
 * A post's publish state.
 *
 * The word carries the meaning, not the colour: a green or grey badge on its own
 * is invisible to a colourblind reader and to anyone scanning a printed page. The
 * dot is a second, non-colour signal for the same state.
 *
 * Posts written before the status field existed are published, so an absent
 * status means published here too. The server applies exactly the same rule in
 * its public query, so the two never disagree about what is live.
 */
export const isDraft = (blog) => blog.status === "draft";

/**
 * A post can only go live once it has a title, description and content.
 * Publishing an empty post would render a blank article on the public site.
 */
export const canPublish = (blog) =>
  Boolean(blog.title?.trim() && blog.description?.trim() && blog.content?.trim());

export const statusLabel = (blog) => (isDraft(blog) ? "Draft" : "Published");

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** A short, unambiguous date for tables and cards. */
export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
};

/** The same instant in a readable form, for a tooltip. */
export const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
