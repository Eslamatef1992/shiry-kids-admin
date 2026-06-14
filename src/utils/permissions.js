// Central map of admin-panel routes -> the role permission(s) required to
// view them. This must stay in sync with the backend's route guards in
// shiry-kids-backend/src/routes/index.js.
//
// - `null`  => accessible to any logged-in admin (e.g. the dashboard).
// - `[]`    => super admin only (role permissions include '*').
// - `[...]` => admin needs AT LEAST ONE of these permissions, OR '*'.
export const PAGE_PERMISSIONS = {
  '/': null,
  '/admins': [],
  '/roles': [],
  '/users': ['manage_users'],
  '/vendors': ['manage_products', 'manage_coupons'],
  '/categories': ['manage_products'],
  '/products': ['manage_products'],
  '/coupons': ['manage_coupons'],
  '/discount-coupons': ['manage_coupons'],
  '/banners': ['manage_settings'],
  '/ads': ['manage_settings'],
  '/notifications': ['manage_settings'],
  '/landing-page': ['manage_settings'],
  '/orders': ['manage_orders'],
  '/guest-orders': ['manage_orders'],
  '/qr-scanner': ['scan_qr'],
  '/qr-generator': ['scan_qr'],
  '/settings': ['manage_settings'],
  '/seo': ['manage_settings'],
  '/cms': ['manage_settings'],
};

/// Returns true if `admin`'s role grants one of the `required` permissions.
/// `required` follows the same convention as PAGE_PERMISSIONS values above.
export function hasPermission(admin, required) {
  const perms = admin?.role?.permissions || [];
  if (perms.includes('*')) return true;
  if (required === null || required === undefined) return true;
  if (!required.length) return false; // super-admin-only page
  return required.some((p) => perms.includes(p));
}

/// Returns true if `admin` can access `path` (must be a key of PAGE_PERMISSIONS).
export function canAccess(admin, path) {
  return hasPermission(admin, PAGE_PERMISSIONS[path]);
}
