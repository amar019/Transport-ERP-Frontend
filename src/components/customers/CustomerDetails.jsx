import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getCustomerById } from "@/services/customer.service";
import { removeCustomer, activateCustomerThunk } from "@/store/slices/customerSlice";
import { confirmAction } from "@/utils/swal";
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
  IndianRupee,
  User,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  ChevronRight,
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
    const isConfirmed = await confirmAction({
      title: "Deactivate Customer?",
      text: `Are you sure you want to deactivate ${customer?.shopName || "this customer"}?`,
      icon: "warning",
      confirmButtonText: "Yes, Deactivate",
      cancelButtonText: "Keep Active",
      isDanger: true,
    });

    if (isConfirmed) {
      const res = await dispatch(removeCustomer(id));
      if (!res.error) {
        showToast("Customer deactivated successfully", "success");
        fetchCustomerDetails();
      } else {
        showToast(res.payload || "Failed to deactivate customer", "error");
      }
    }
  };

  const handleActivate = async () => {
    const isConfirmed = await confirmAction({
      title: "Activate Customer?",
      text: `Are you sure you want to activate ${customer?.shopName || "this customer"}?`,
      icon: "question",
      confirmButtonText: "Yes, Activate",
      cancelButtonText: "Cancel",
      isDanger: false,
    });

    if (isConfirmed) {
      const res = await dispatch(activateCustomerThunk(id));
      if (!res.error) {
        showToast("Customer activated successfully", "success");
        fetchCustomerDetails();
      } else {
        showToast(res.payload || "Failed to activate customer", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-semibold text-[#64748B]">Loading Customer Profile...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-[#E2E8F0] shadow-2xs text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">Customer Not Found</h3>
          <p className="text-xs text-[#64748B] mt-1 mb-4">{error || "Invalid Customer ID"}</p>
          <button
            onClick={() => navigate("/customers")}
            className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Back to Customer Directory
          </button>
        </div>
      </div>
    );
  }

  const isActive = customer.status === "ACTIVE" || customer.isActive === true;
  const initial = (customer.shopName || "C").charAt(0).toUpperCase();

  const tabOptions = [
    { label: "Profile Details", value: "PROFILE", icon: Store },
    { label: "Booking History", value: "BOOKINGS", icon: FileText },
    { label: "LR / Parcel History", value: "LR", icon: Package },
    { label: "Payment & Billing", value: "PAYMENTS", icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toastMessage.msg}</span>
        </div>
      )}

      {/* Back Button & Breadcrumbs */}
      <div className="flex flex-col gap-2 max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
          <span onClick={() => navigate("/customers")} className="hover:text-[#0F172A] cursor-pointer">Customers</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-semibold text-[#0F172A]">Profile Details</span>
        </div>

        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-1.5 text-[#64748B] hover:text-[#0F172A] text-xs font-semibold transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] font-bold text-xl flex items-center justify-center shrink-0 shadow-2xs">
              {initial}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
                  {customer.shopName}
                </h1>
                <span className="font-mono text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {customer.customerCode || "CUS-0000"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    isActive
                      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-[#059669]" : "bg-[#94A3B8]"
                    }`}
                  />
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs font-normal text-[#64748B] mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-[#0F172A] font-semibold">
                  <User className="w-3.5 h-3.5 text-[#94A3B8]" /> Owner: {customer.ownerName}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8]" /> {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#94A3B8]" /> {customer.email}
                  </span>
                )}
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" /> {customer.city}, {customer.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate(`/customers/edit/${id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#0F172A] hover:bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Edit Profile</span>
            </button>

            {isActive ? (
              <button
                onClick={handleDeactivate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] border border-[#E2E8F0] hover:border-[#FECACA] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Deactivate</span>
              </button>
            ) : (
              <button
                onClick={handleActivate}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ECFDF5] text-[#059669] hover:bg-[#A7F3D0]/30 border border-[#A7F3D0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Activate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Business */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Business
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] font-mono tracking-tight block">
              ₹0.00
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Lifetime Revenue
            </span>
          </div>
        </div>

        {/* Opening Balance */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Opening Balance
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
              customer.openingBalanceType === "PAYABLE"
                ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
            }`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold font-mono tracking-tight block ${
              customer.openingBalanceType === "PAYABLE" ? "text-[#DC2626]" : "text-[#059669]"
            }`}>
              ₹{(customer.openingBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-[#64748B] font-normal uppercase tracking-wider block mt-0.5">
              {customer.openingBalanceType || "RECEIVABLE"}
            </span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              0
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Orders Processed
            </span>
          </div>
        </div>

        {/* LR / Parcel History */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              LR / Parcel Count
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              0
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Shipments Handled
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Control Status Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1 overflow-x-auto">
          {tabOptions.map((tab) => {
            const IconComp = tab.icon;
            const isTabActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  isTabActive
                    ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Body Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden p-6">
        {/* TAB 1: PROFILE DETAILS */}
        {activeTab === "PROFILE" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                Business Overview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs">
                <div>
                  <span className="text-[#64748B] font-medium block">Shop / Business Name</span>
                  <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">{customer.shopName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] font-medium block">Owner Name</span>
                  <span className="font-bold text-[#0F172A] text-sm mt-0.5 block">{customer.ownerName}</span>
                </div>
                <div>
                  <span className="text-[#64748B] font-medium block">Customer Code</span>
                  <span className="font-mono font-bold text-[#0F172A] text-sm mt-0.5 block">{customer.customerCode || "N/A"}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-3">
                Contact & Location Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Mobile Number:</span>
                    <span className="font-semibold text-[#0F172A]">{customer.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Email Address:</span>
                    <span className="font-semibold text-[#0F172A]">{customer.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Area / Locality:</span>
                    <span className="font-semibold text-[#0F172A]">{customer.area || "N/A"}</span>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">City / District:</span>
                    <span className="font-semibold text-[#0F172A]">{[customer.city, customer.district].filter(Boolean).join(", ") || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">State & Pincode:</span>
                    <span className="font-semibold text-[#0F172A]">{customer.state ? `${customer.state} - ${customer.pincode || ""}` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B] font-medium">Full Address:</span>
                    <span className="font-semibold text-[#0F172A] text-right max-w-[200px]">{customer.address || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {customer.notes && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                  Remarks & Notes
                </h4>
                <div className="p-4 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl text-xs font-medium text-[#C2410C]">
                  {customer.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "BOOKINGS" && (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
            <h4 className="font-bold text-[#0F172A] text-sm">No Booking History Found</h4>
            <p className="text-[#64748B] text-xs mt-1">Bookings for this customer will appear here once created.</p>
          </div>
        )}

        {activeTab === "LR" && (
          <div className="py-12 text-center">
            <Package className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
            <h4 className="font-bold text-[#0F172A] text-sm">No LR / Parcel Records</h4>
            <p className="text-[#64748B] text-xs mt-1">Parcel shipments for this customer will appear here.</p>
          </div>
        )}

        {activeTab === "PAYMENTS" && (
          <div className="py-12 text-center">
            <Receipt className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
            <h4 className="font-bold text-[#0F172A] text-sm">No Billing Records</h4>
            <p className="text-[#64748B] text-xs mt-1">Invoices and payment receipts will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
