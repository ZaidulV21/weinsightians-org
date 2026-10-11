/* ==========================================
   PUBLIC BLOG LIST — CLIENT CACHE
   ==========================================
   The listing and every article page read the same GET /blogs payload. Without a
   cache each visit re-issues that request: opening /blogs, opening an article and
   going back cost three round trips to an API that already takes ~2s to answer.
   The content changes only when an editor publishes, so refetching it on every
   navigation buys nothing and costs a full skeleton flash each time.

   This is a small time-to-live cache with two rules that matter:

     - A response is reused for TTL_MS. Inside that window a revisit renders from
       memory with no network request at all.
     - Concurrent callers share one in-flight request instead of each firing their
       own. The listing and an article's "related" section regularly ask at once.

   Deliberately JSX-free and dependency-free: the cache is constructed with the
   fetch function injected, so it can be tested without a browser, a server or a
   module mocking layer. The real fetcher is wired up in src/api/blogListApi.js.
   ========================================== */

// Five minutes. Long enough that browsing from the listing into an article and
// back never re-hits the network, short enough that a newly published post shows
// up without a hard refresh in any realistic session.
export const DEFAULT_TTL_MS = 5 * 60 * 1000;

export const createBlogListCache = ({ fetcher, ttlMs = DEFAULT_TTL_MS, now = () => Date.now() } = {}) => {
  if (typeof fetcher !== "function") {
    throw new TypeError("createBlogListCache requires a fetcher function");
  }

  // entry is the last successful payload plus when it landed. It survives a failed
  // refresh on purpose, so an API wobble never replaces content the visitor can
  // already see with an error screen.
  let entry = null;
  let inFlight = null;

  const getCached = () => (entry ? entry.data : null);

  const hasCached = () => Boolean(entry);

  const isFresh = () => Boolean(entry) && now() - entry.storedAt < ttlMs;

  // Resolves with the payload. Reuses a fresh entry, joins an in-flight request,
  // or starts a new one. A rejected fetch leaves any existing entry untouched.
  const load = ({ force = false } = {}) => {
    if (!force && isFresh()) return Promise.resolve(entry.data);
    if (inFlight) return inFlight;

    inFlight = Promise.resolve()
      .then(fetcher)
      .then((data) => {
        entry = { data, storedAt: now() };
        return data;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  };

  const invalidate = () => {
    entry = null;
  };

  return { load, getCached, hasCached, isFresh, invalidate };
};
