import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCustomerById } from "@/services/customer.service";
import { removeCustomer } from "@/store/slices/customerSlice";
import { ROUTES } from "@/constants/paths";

import {
  ArrowLeft,
  Store,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Power,
  FileText,
  Package,
  Receipt,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("PROFILE"); // PROFILE | BOOKINGS | LR | PAYMENTS
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCustomerById(id);
      setCustomer(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch customer details.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeactivate = async () => {
    if (
      window.confirm(
        `Are you sure you want to deactivate ${customer?.shopName || "this customer"}?`
      )
    ) {
      const res = await dispatch(removeCustomer(id));
      if (!res.error) {
        showToast("Customer deactivated successfully", "success");
        fetchCustomerDetails();
      } else {
        showToast(res.payload || "Failed to deactivate customer", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-slate-500">Loading Customer Profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Customer Not Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">{error || "Invalid Customer ID"}</p>
          <button
            onClick={() => navigate("/customers")}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all cursor-pointer"
          >
            Back to Customer Directory
          </button>
        </div>
      </div>
    );
  }

  const isActive = customer.status === "ACTIVE" || customer.isActive === true;
  const initial = (customer.shopName || "C").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-orange-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-sm font-semibold">{toastMessage.msg}</span>
        </div>
      )}

      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-4">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs md:text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </button>
      </div>

      {/* Profile Header Banner */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              {initial}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                  {customer.shopName}
                </h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {customer.customerCode || "CUS-0000"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-slate-700 font-semibold">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Owner: {customer.ownerName}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                  </span>
                )}
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {customer.city}, {customer.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/customers/edit/${id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            {isActive && (
              <button
                onClick={handleDeactivate}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Total Business */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Business
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-800">
            ₹0.00
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Lifetime Revenue</p>
        </div>

        {/* Opening Balance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Opening Balance
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              customer.openingBalanceType === "PAYABLE" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className={`text-lg md:text-xl font-black ${
            customer.openingBalanceType === "PAYABLE" ? "text-rose-600" : "text-emerald-600"
          }`}>
            ₹{(customer.openingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
            {customer.openingBalanceType || "RECEIVABLE"}
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-800">
            0
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Orders Processed</p>
        </div>

        {/* LR / Parcel History */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              LR / Parcel Count
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-800">
            0
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Shipments Handled</p>
        </div>
      </div>

      {/* Tabbed Content Box */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 pt-3 flex items-center gap-2 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PROFILE"
                ? "border-orange-500 text-orange-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab("BOOKINGS")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "BOOKINGS"
                ? "border-orange-500 text-orange-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Booking History</span>
          </button>

          <button
            onClick={() => setActiveTab("LR")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "LR"
                ? "border-orange-500 text-orange-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>LR / Parcel History</span>
          </button>

          <button
            onClick={() => setActiveTab("PAYMENTS")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PAYMENTS"
                ? "border-orange-500 text-orange-600 bg-white rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Payment & Billing</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === "PROFILE" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Business Overview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block">Shop / Business Name</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.shopName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Owner Name</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">{customer.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block">Customer Code</span>
                    <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{customer.customerCode || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Contact & Location Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Mobile Number:</span>
                      <span className="font-bold text-slate-800">{customer.mobile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Email Address:</span>
                      <span className="font-bold text-slate-800">{customer.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Area / Locality:</span>
                      <span className="font-bold text-slate-800">{customer.area || "N/A"}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">City / District:</span>
                      <span className="font-bold text-slate-800">{[customer.city, customer.district].filter(Boolean).join(", ") || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">State & Pincode:</span>
                      <span className="font-bold text-slate-800">{customer.state ? `${customer.state} - ${customer.pincode || ""}` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Full Address:</span>
                      <span className="font-bold text-slate-800 text-right max-w-[200px]">{customer.address || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {customer.notes && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Remarks & Notes
                  </h4>
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-xs font-semibold text-slate-700">
                    {customer.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "BOOKINGS" && (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm">No Booking History Found</h4>
              <p className="text-slate-400 text-xs mt-1">Bookings for this customer will appear here once created.</p>
            </div>
          )}

          {activeTab === "LR" && (
            <div className="py-12 text-center">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm">No LR / Parcel Records</h4>
              <p className="text-slate-400 text-xs mt-1">Parcel shipments for this customer will appear here.</p>
            </div>
          )}

          {activeTab === "PAYMENTS" && (
            <div className="py-12 text-center">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm">No Billing Records</h4>
              <p className="text-slate-400 text-xs mt-1">Invoices and payment receipts will be displayed here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
