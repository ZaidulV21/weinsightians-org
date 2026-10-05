/* ==========================================
   ROUTES
   ==========================================
   Single source of truth for paths that are referenced from more than one
   place. The admin login URL in particular was written out as a literal in
   four different files, which is exactly the kind of duplication that lets a
   link quietly point somewhere that no longer exists.

   This module only holds strings. It has no side effects, so importing it
   from a router guard, an axios interceptor or a presentational component is
   safe, and it changes no authentication behaviour: the admin screens and the
   JWT session are exactly as they were.
   ========================================== */

export const ADMIN_LOGIN_ROUTE = '/admin/login';
