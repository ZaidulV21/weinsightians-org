import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_TTL_MS, createBlogListCache } from "./blogListCache.js";

const payload = { blogs: [{ slug: "a" }] };

/* A controllable clock, so TTL behaviour is tested rather than waited out. The
   cache takes `now` as an injected dependency for exactly this reason. */
const clock = (start = 0) => {
  let t = start;
  return {
    now: () => t,
    advance: (ms) => {
      t += ms;
    },
  };
};

describe("createBlogListCache", () => {
  it("requires a fetcher", () => {
    assert.throws(() => createBlogListCache({}), TypeError);
  });

  it("starts empty, so the first render has nothing to show yet", () => {
    const cache = createBlogListCache({ fetcher: async () => payload });
    assert.equal(cache.getCached(), null);
    assert.equal(cache.hasCached(), false);
    assert.equal(cache.isFresh(), false);
  });

  it("fetches once and caches the payload", async () => {
    let calls = 0;
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        return payload;
      },
    });

    const data = await cache.load();

    assert.equal(data, payload);
    assert.equal(calls, 1);
    assert.equal(cache.getCached(), payload);
    assert.equal(cache.hasCached(), true);
    assert.equal(cache.isFresh(), true);
  });

  it("reuses a fresh entry without hitting the network again", async () => {
    let calls = 0;
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        return payload;
      },
    });

    await cache.load();
    await cache.load();
    await cache.load();

    assert.equal(calls, 1);
  });

  it("shares a single in-flight request between concurrent callers", async () => {
    let calls = 0;
    let release;
    const cache = createBlogListCache({
      fetcher: () => {
        calls += 1;
        return new Promise((resolve) => {
          release = resolve;
        });
      },
    });

    const first = cache.load();
    const second = cache.load();
    const third = cache.load();

    // Let the queued fetcher start; the three callers must still be one request.
    await Promise.resolve();
    assert.equal(calls, 1);

    release(payload);
    assert.deepEqual(await Promise.all([first, second, third]), [payload, payload, payload]);
  });

  it("keeps serving the cached payload inside the TTL", async () => {
    let calls = 0;
    const c = clock();
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        return payload;
      },
      ttlMs: 1000,
      now: c.now,
    });

    await cache.load();
    c.advance(999);
    await cache.load();

    assert.equal(calls, 1);
  });

  it("refetches once the TTL has passed", async () => {
    let calls = 0;
    const c = clock();
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        return { calls };
      },
      ttlMs: 1000,
      now: c.now,
    });

    await cache.load();
    c.advance(1000);
    assert.equal(cache.isFresh(), false);
    await cache.load();

    assert.equal(calls, 2);
  });

  it("force refetches even when the entry is fresh", async () => {
    let calls = 0;
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        return payload;
      },
    });

    await cache.load();
    await cache.load({ force: true });

    assert.equal(calls, 2);
  });

  it("does not cache a rejected fetch, so a retry is a real retry", async () => {
    let calls = 0;
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        if (calls === 1) throw new Error("boom");
        return payload;
      },
    });

    await assert.rejects(() => cache.load(), /boom/);
    assert.equal(cache.hasCached(), false);

    assert.equal(await cache.load(), payload);
    assert.equal(calls, 2);
  });

  it("keeps the previous payload when a refresh fails", async () => {
    let calls = 0;
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        if (calls > 1) throw new Error("boom");
        return payload;
      },
    });

    await cache.load();
    await assert.rejects(() => cache.load({ force: true }), /boom/);

    assert.equal(cache.getCached(), payload);
  });

  it("invalidate drops the entry and makes the next load fetch again", async () => {
    let calls = 0;
    const cache = createBlogListCache({
      fetcher: async () => {
        calls += 1;
        return payload;
      },
    });

    await cache.load();
    cache.invalidate();
    assert.equal(cache.getCached(), null);

    await cache.load();
    assert.equal(calls, 2);
  });

  it("defaults to a five minute TTL", () => {
    assert.equal(DEFAULT_TTL_MS, 5 * 60 * 1000);
  });
});
