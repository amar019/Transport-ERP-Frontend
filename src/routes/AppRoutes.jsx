import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "@/components/layout/Layout";
import { ROUTES } from "@/constants/paths";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import BookingListPage from "@/pages/bookings/BookingListPage";
import BookingFormPage from "@/pages/bookings/BookingFormPage";
import BookingDetailsPage from "@/pages/bookings/BookingDetailsPage";
import BiltyPreviewPage from "@/pages/bookings/BiltyPreviewPage";
import MemoListPage from "@/pages/memos/MemoListPage";
import MemoFormPage from "@/pages/memos/MemoFormPage";
import MemoDetailsPage from "@/pages/memos/MemoDetailsPage";
import MemoPreviewPage from "@/pages/memos/MemoPreviewPage";
import CustomerListPage from "@/pages/customers/CustomerListPage";
import CustomerFormPage from "@/pages/customers/CustomerFormPage";
import CustomerDetailsPage from "@/pages/customers/CustomerDetailsPage";
import PlaceholderPage from "@/pages/placeholder/PlaceholderPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />

      {/* Protected Application Routes (with Sidebar & Shell Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          {/* Bookings */}
          <Route path={ROUTES.BOOKINGS.LIST} element={<BookingListPage />} />
          <Route path={ROUTES.BOOKINGS.NEW} element={<BookingFormPage />} />
          <Route path={ROUTES.BOOKINGS.EDIT(":id")} element={<BookingFormPage />} />
          <Route path={ROUTES.BOOKINGS.DETAILS(":id")} element={<BookingDetailsPage />} />

          {/* Memos */}
          <Route path={ROUTES.MEMOS.LIST} element={<MemoListPage />} />
          <Route path={ROUTES.MEMOS.NEW} element={<MemoFormPage />} />
          <Route path={ROUTES.MEMOS.DETAILS(":id")} element={<MemoDetailsPage />} />

          {/* Customers */}
          <Route path={ROUTES.CUSTOMERS.LIST} element={<CustomerListPage />} />
          <Route path={ROUTES.CUSTOMERS.ADD} element={<CustomerFormPage />} />
          <Route path={ROUTES.CUSTOMERS.EDIT(":id")} element={<CustomerFormPage />} />
          <Route path={ROUTES.CUSTOMERS.DETAILS(":id")} element={<CustomerDetailsPage />} />

          {/* Operations Placeholders */}
          <Route path={ROUTES.OPERATIONS.LR_PARCEL} element={<PlaceholderPage />} />
          <Route path={ROUTES.OPERATIONS.DELIVERY} element={<PlaceholderPage />} />
          <Route path={ROUTES.OPERATIONS.TRIPS} element={<PlaceholderPage />} />

          {/* Masters Placeholders */}
          <Route path={ROUTES.MASTERS.VEHICLES} element={<PlaceholderPage />} />
          <Route path={ROUTES.MASTERS.DRIVERS} element={<PlaceholderPage />} />
          <Route path={ROUTES.MASTERS.BRANCHES} element={<PlaceholderPage />} />
          <Route path={ROUTES.MASTERS.LOCATIONS} element={<PlaceholderPage />} />

          {/* Finance Placeholders */}
          <Route path={ROUTES.FINANCE.BILLING} element={<PlaceholderPage />} />
          <Route path={ROUTES.FINANCE.PAYMENTS} element={<PlaceholderPage />} />
          <Route path={ROUTES.FINANCE.EXPENSES} element={<PlaceholderPage />} />

          {/* Reports Placeholders */}
          <Route path={ROUTES.REPORTS.BOOKING} element={<PlaceholderPage />} />
          <Route path={ROUTES.REPORTS.DELIVERY} element={<PlaceholderPage />} />
          <Route path={ROUTES.REPORTS.FINANCIAL} element={<PlaceholderPage />} />

          {/* Settings Placeholders */}
          <Route path={ROUTES.SETTINGS.USERS} element={<PlaceholderPage />} />
          <Route path={ROUTES.SETTINGS.ROLES} element={<PlaceholderPage />} />
          <Route path={ROUTES.SETTINGS.SETTINGS} element={<PlaceholderPage />} />
        </Route>

        {/* Full-Screen Print Previews (Protected, Standalone Shell) */}
        <Route path={ROUTES.BOOKINGS.PREVIEW_BLANK} element={<BiltyPreviewPage />} />
        <Route path={ROUTES.BOOKINGS.PREVIEW(":id")} element={<BiltyPreviewPage />} />
        <Route path={ROUTES.MEMOS.PREVIEW_BLANK} element={<MemoPreviewPage />} />
        <Route path={ROUTES.MEMOS.PREVIEW(":id")} element={<MemoPreviewPage />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;
