import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Customers from "./pages/customer";
import CustomerForm from "./components/customers/CustomerForm";
import CustomerDetails from "./components/customers/CustomerDetails";

import BookingList from "./pages/Booking/BookingList";
import BookingFormPage from "./pages/Booking/BookingFormPage";
import BookingDetails from "./pages/Booking/BookingDetails";
import MemoList from "./pages/Memo/MemoList";
import MemoFormPage from "./pages/Memo/MemoFormPage";
import MemoDetails from "./pages/Memo/MemoDetails";
import PlaceholderPage from "./pages/PlaceholderPage";
import BiltyPreview from "./pages/BiltyPreview";
import MemoPreview from "./pages/Memo/MemoPreview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Booking Routes */}
          <Route path="/booking" element={<BookingList />} />
          <Route path="/bookings/new" element={<BookingFormPage />} />
          <Route path="/bookings/:id/edit" element={<BookingFormPage />} />
          <Route path="/bookings/:id" element={<BookingDetails />} />

          {/* Memo / Manifest Routes */}
          <Route path="/memos" element={<MemoList />} />
          <Route path="/memos/new" element={<MemoFormPage />} />
          <Route path="/memos/:id" element={<MemoDetails />} />

          {/* Operations & Masters */}
          <Route path="/lr-parcel" element={<PlaceholderPage />} />
          <Route path="/delivery" element={<PlaceholderPage />} />
          <Route path="/trips" element={<PlaceholderPage />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/add" element={<CustomerForm />} />
          <Route path="/customers/edit/:id" element={<CustomerForm />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/vehicles" element={<PlaceholderPage />} />
          <Route path="/drivers" element={<PlaceholderPage />} />
          <Route path="/branches" element={<PlaceholderPage />} />
          <Route path="/locations" element={<PlaceholderPage />} />
          <Route path="/billing" element={<PlaceholderPage />} />
          <Route path="/payments" element={<PlaceholderPage />} />
          <Route path="/expenses" element={<PlaceholderPage />} />
          <Route path="/booking-reports" element={<PlaceholderPage />} />
          <Route path="/delivery-reports" element={<PlaceholderPage />} />
          <Route path="/financial-reports" element={<PlaceholderPage />} />
          <Route path="/users" element={<PlaceholderPage />} />
          <Route path="/roles-permissions" element={<PlaceholderPage />} />
          <Route path="/settings" element={<PlaceholderPage />} />
        </Route>

        <Route path="/bilty-preview" element={<BiltyPreview />} />
        <Route path="/bilty-preview/:id" element={<BiltyPreview />} />

        <Route path="/memo-preview" element={<MemoPreview />} />
        <Route path="/memo-preview/:id" element={<MemoPreview />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;