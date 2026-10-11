/* ==========================================
   SESSION VERIFICATION — DATA LOGIC
   ==========================================
   Pure and free of JSX and network code, so the rule that decides whether a
   /auth/me response is genuinely an authenticated session can be tested on its
   own.

   The server is the only authority on who is signed in. A 2xx status is not
   proof of anything by itself: a host that is not really the API can return its
   own page (HTML, 200) for every path, including /auth/me. Only a JSON body
   carrying the authenticated admin's user object counts as a session here.
   A localStorage flag or a hardcoded boolean is never part of this decision.
   ========================================== */

// The shape the API's GET /auth/me returns for a real session:
//   { msg, message, user: { name, email, role } }
export const isAuthenticatedSession = (data) =>
  Boolean(
    data &&
      typeof data === "object" &&
      !Array.isArray(data) &&
      data.user &&
      typeof data.user === "object" &&
      !Array.isArray(data.user)
  );