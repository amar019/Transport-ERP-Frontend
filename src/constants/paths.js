/**
 * Centralized Route Paths for Mahakal Transport ERP
 */
export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
  },
  DASHBOARD: "/dashboard",
  BOOKINGS: {
    LIST: "/booking",
    NEW: "/bookings/new",
    EDIT: (id = ":id") => `/bookings/${id}/edit`,
    DETAILS: (id = ":id") => `/bookings/${id}`,
    PREVIEW: (id = ":id") => `/bilty-preview/${id}`,
    PREVIEW_BLANK: "/bilty-preview",
  },
  MEMOS: {
    LIST: "/memos",
    NEW: "/memos/new",
    DETAILS: (id = ":id") => `/memos/${id}`,
    PREVIEW: (id = ":id") => `/memo-preview/${id}`,
    PREVIEW_BLANK: "/memo-preview",
  },
  CUSTOMERS: {
    LIST: "/customers",
    ADD: "/customers/add",
    EDIT: (id = ":id") => `/customers/edit/${id}`,
    DETAILS: (id = ":id") => `/customers/${id}`,
  },
  OPERATIONS: {
    LR_PARCEL: "/lr-parcel",
    DELIVERY: "/delivery",
    TRIPS: "/trips",
  },
  MASTERS: {
    VEHICLES: "/vehicles",
    DRIVERS: "/drivers",
    BRANCHES: "/branches",
    LOCATIONS: "/locations",
  },
  FINANCE: {
    BILLING: "/billing",
    PAYMENTS: "/payments",
    EXPENSES: "/expenses",
  },
  REPORTS: {
    BOOKING: "/booking-reports",
    DELIVERY: "/delivery-reports",
    FINANCIAL: "/financial-reports",
  },
  SETTINGS: {
    USERS: "/users",
    ROLES: "/roles-permissions",
    SETTINGS: "/settings",
  },
};
