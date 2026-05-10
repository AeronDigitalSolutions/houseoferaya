export type AdminPermissionSet = {
  canViewDashboard: boolean;
  canViewProducts: boolean;
  canEditProducts: boolean;
  canViewOrders: boolean;
  canViewShipments: boolean;
  canViewPayments: boolean;
  canViewPricing: boolean;
  canViewCustomers: boolean;
  canManageHomepageMedia: boolean;
  canManageAdmins: boolean;
};

export const defaultAdminPermissions: AdminPermissionSet = {
  canViewDashboard: true,
  canViewProducts: true,
  canEditProducts: false,
  canViewOrders: true,
  canViewShipments: true,
  canViewPayments: true,
  canViewPricing: true,
  canViewCustomers: true,
  canManageHomepageMedia: false,
  canManageAdmins: false
};

export const superAdminPermissions: AdminPermissionSet = {
  canViewDashboard: true,
  canViewProducts: true,
  canEditProducts: true,
  canViewOrders: true,
  canViewShipments: true,
  canViewPayments: true,
  canViewPricing: true,
  canViewCustomers: true,
  canManageHomepageMedia: true,
  canManageAdmins: true
};

export const adminPermissionKeys = [
  "canViewDashboard",
  "canViewProducts",
  "canEditProducts",
  "canViewOrders",
  "canViewShipments",
  "canViewPayments",
  "canViewPricing",
  "canViewCustomers",
  "canManageHomepageMedia",
  "canManageAdmins"
] as const;

export type AdminPermissionKey = (typeof adminPermissionKeys)[number];

export function sanitizeAdminPermissions(input?: Partial<AdminPermissionSet> | null): AdminPermissionSet {
  const source = input || {};
  return {
    canViewDashboard: Boolean(source.canViewDashboard ?? defaultAdminPermissions.canViewDashboard),
    canViewProducts: Boolean(source.canViewProducts ?? defaultAdminPermissions.canViewProducts),
    canEditProducts: Boolean(source.canEditProducts ?? defaultAdminPermissions.canEditProducts),
    canViewOrders: Boolean(source.canViewOrders ?? defaultAdminPermissions.canViewOrders),
    canViewShipments: Boolean(source.canViewShipments ?? defaultAdminPermissions.canViewShipments),
    canViewPayments: Boolean(source.canViewPayments ?? defaultAdminPermissions.canViewPayments),
    canViewPricing: Boolean(source.canViewPricing ?? defaultAdminPermissions.canViewPricing),
    canViewCustomers: Boolean(source.canViewCustomers ?? defaultAdminPermissions.canViewCustomers),
    canManageHomepageMedia: Boolean(source.canManageHomepageMedia ?? defaultAdminPermissions.canManageHomepageMedia),
    canManageAdmins: Boolean(source.canManageAdmins ?? defaultAdminPermissions.canManageAdmins)
  };
}

export function getPermissionsForAdminRole(
  role: string,
  storedPermissions?: Partial<AdminPermissionSet> | null
): AdminPermissionSet {
  if (role === "SUPER_ADMIN") {
    return superAdminPermissions;
  }
  return sanitizeAdminPermissions(storedPermissions);
}
