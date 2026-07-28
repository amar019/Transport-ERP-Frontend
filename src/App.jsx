import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Customers from "./pages/customer";
import CustomerForm from "./components/customers/CustomerForm";
import CustomerDetails from "./components/customers/CustomerDetails";

import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<PlaceholderPage />} />
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;