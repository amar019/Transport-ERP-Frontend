import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchCustomers,
  addCustomer,
  editCustomer,
} from "@/store/slices/customerSlice";
import {
  ArrowLeft,
  Store,
  Building,
  MapPin,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Coins,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  User,
  Hash,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Check,
  Building2,
  HelpCircle,
  Command,
  ShieldCheck,
} from "lucide-react";

const CITY_PRESETS = [
  { city: "Ahilyanagar", district: "Ahilyanagar", state: "Maharashtra" },
  { city: "Jamkhed", district: "Ahilyanagar", state: "Maharashtra" },
  { city: "Beed", district: "Beed", state: "Maharashtra" },
  { city: "Kharda", district: "Ahilyanagar", state: "Maharashtra" },
  { city: "Kada", district: "Beed", state: "Maharashtra" },
  { city: "Ashti", district: "Beed", state: "Maharashtra" },
  { city: "Patoda", district: "Beed", state: "Maharashtra" },
  { city: "Pune", district: "Pune", state: "Maharashtra" },
  { city: "Chhatrapati Sambhajinagar", district: "Chhatrapati Sambhajinagar", state: "Maharashtra" },
];

const BALANCE_PRESETS = [0, 1000, 5000, 10000, 25000, 50000];

export default function CustomerForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const isEditMode = Boolean(id);
  const { list: customers } = useSelector((state) => state.customers);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    mobile: "",
    email: "",
    address: "",
    area: "",
    city: "",
    district: "",
    state: "Maharashtra",
    pincode: "",
    openingBalance: 0,
    openingBalanceType: "RECEIVABLE",
    notes: "",
  });

  useEffect(() => {
    if (customers.length === 0) {
      dispatch(fetchCustomers());
    }
  }, [dispatch, customers.length]);

  useEffect(() => {
    if (isEditMode && customers.length > 0) {
      const existing = customers.find((c) => (c._id || c.id) === id);
      if (existing) {
        setFormData({
          shopName: existing.shopName || "",
          ownerName: existing.ownerName || "",
          mobile: existing.mobile || "",
          email: existing.email || "",
          address: existing.address || "",
          area: existing.area || "",
          city: existing.city || "",
          district: existing.district || "",
          state: existing.state || "Maharashtra",
          pincode: existing.pincode || "",
          openingBalance: existing.openingBalance ?? 0,
          openingBalanceType: existing.openingBalanceType || "RECEIVABLE",
          notes: existing.notes || "",
        });
      }
    }
  }, [isEditMode, id, customers]);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut (Ctrl/Cmd + S to submit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const submitBtn = document.getElementById("customer-form-submit-btn");
        if (submitBtn) submitBtn.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fast auto-fill location by city preset
  const handleQuickCitySelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      city: preset.city,
      district: preset.district,
      state: preset.state,
    }));
  };

  // Fast copy shop name to owner name
  const handleCopyShopToOwner = () => {
    if (formData.shopName) {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.shopName,
      }));
    }
  };

  // Reset Form
  const handleResetForm = () => {
    setFormData({
      shopName: "",
      ownerName: "",
      mobile: "",
      email: "",
      address: "",
      area: "",
      city: "",
      district: "",
      state: "Maharashtra",
      pincode: "",
      openingBalance: 0,
      openingBalanceType: "RECEIVABLE",
      notes: "",
    });
    setErrorMsg("");
  };

  // Validation Checks
  const isShopNameValid = formData.shopName.trim().length > 0;
  const isOwnerNameValid = formData.ownerName.trim().length > 0;
  const isMobileValid = /^[0-9]{10}$/.test(formData.mobile.trim());
  const isEmailValid = !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const isPincodeValid = !formData.pincode || /^[0-9]{6}$/.test(formData.pincode.trim());

  // Completion calculation
  const requiredCount = (isShopNameValid ? 1 : 0) + (isOwnerNameValid ? 1 : 0) + (isMobileValid ? 1 : 0);
  const optionalCount =
    (formData.address ? 1 : 0) +
    (formData.city ? 1 : 0) +
    (formData.district ? 1 : 0) +
    (formData.pincode ? 1 : 0) +
    (formData.email ? 1 : 0) +
    (formData.notes ? 1 : 0);
  const completionPercentage = Math.min(100, Math.round((requiredCount / 3) * 65 + (optionalCount / 6) * 35));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isShopNameValid || !isOwnerNameValid || !isMobileValid) {
      setErrorMsg("Please fill out all required fields marked with * correctly.");
      return;
    }
    if (!isPincodeValid) {
      setErrorMsg("Pincode must be exactly 6 digits.");
      return;
    }
    if (!isEmailValid) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      ...formData,
      shopName: formData.shopName.trim(),
      ownerName: formData.ownerName.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      openingBalance: Number(formData.openingBalance) || 0,
    };

    try {
      if (isEditMode) {
        const res = await dispatch(editCustomer({ id, customerData: payload }));
        if (!res.error) {
          showToast("Customer profile updated successfully!", "success");
          setTimeout(() => navigate("/customers"), 800);
        } else {
          setErrorMsg(res.payload || "Failed to update customer profile");
        }
      } else {
        const res = await dispatch(addCustomer(payload));
        if (!res.error) {
          showToast("New customer registered successfully!", "success");
          setTimeout(() => navigate("/customers"), 800);
        } else {
          setErrorMsg(res.payload || "Failed to register customer");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans antialiased text-[#0F172A] space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
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

      {/* Top Header & Navigation Bar */}
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Breadcrumb Trail */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
            <span
              onClick={() => navigate("/customers")}
              className="hover:text-[#0F172A] cursor-pointer transition-colors"
            >
              Customers Directory
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">
              {isEditMode ? "Edit Profile" : "Register New Customer"}
            </span>
          </div>

          {/* Shortcut hint */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#64748B] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
            <Command className="w-3 h-3 text-[#94A3B8]" />
            <span>Press <kbd className="px-1 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[10px] font-mono font-bold text-[#334155]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] rounded text-[10px] font-mono font-bold text-[#334155]">S</kbd> to save</span>
          </div>
        </div>

        {/* Page Title & Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="p-2.5 text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] shadow-xs transition-all cursor-pointer group"
              title="Back to Customers Directory"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                  {isEditMode ? "Edit Customer Profile" : "Register New Customer"}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                    isEditMode
                      ? "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]"
                      : "bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20"
                  }`}
                >
                  {isEditMode ? "Edit Mode" : "New Account"}
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                {isEditMode
                  ? "Update customer credentials, branch location, and financial ledger parameters."
                  : "Add a new commercial shop or client to your Transport ERP master ledger."}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isEditMode && (
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#94A3B8]" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0">
              {completionPercentage}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A]">Form Completion Status</span>
                {requiredCount === 3 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                    <ShieldCheck className="w-3 h-3" /> Ready to Submit
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748B]">
                {requiredCount < 3
                  ? `Required missing: ${!isShopNameValid ? "Shop Name, " : ""}${!isOwnerNameValid ? "Owner Name, " : ""}${!isMobileValid ? "Mobile (10 digits)" : ""}`
                  : "All mandatory fields satisfied. You can add optional address & financial balance details."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-[#F1F5F9] h-2 rounded-full overflow-hidden shrink-0">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                completionPercentage === 100
                  ? "bg-[#059669]"
                  : completionPercentage >= 65
                  ? "bg-[#EA580C]"
                  : "bg-[#F59E0B]"
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form (8 Cols) + Right Live Preview (4 Cols) */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FORM SECTIONS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Error Alert Banner */}
          {errorMsg && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-3 text-[#DC2626] text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Validation Error</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* SECTION 1: BUSINESS & CONTACT INFO */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm leading-none">
                    1. Business & Primary Contact
                  </h3>
                  <span className="text-[11px] text-[#64748B]">Shop name, proprietor, and mobile number</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                * Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shop Name */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
                    Shop / Business Name <span className="text-[#DC2626]">*</span>
                  </label>
                  {isShopNameValid && (
                    <span className="text-[10px] font-semibold text-[#059669] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Store className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Agro Center / Ganesh Traders"
                    value={formData.shopName}
                    onChange={(e) =>
                      setFormData({ ...formData, shopName: e.target.value })
                    }
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border rounded-lg focus:bg-white focus:outline-none font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all ${
                      isShopNameValid
                        ? "border-[#CBD5E1] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
                        : "border-[#E2E8F0] focus:border-[#EA580C]"
                    }`}
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
                    Owner / Contact Person <span className="text-[#DC2626]">*</span>
                  </label>
                  {formData.shopName && (
                    <button
                      type="button"
                      onClick={handleCopyShopToOwner}
                      className="text-[10px] font-semibold text-[#EA580C] hover:underline cursor-pointer flex items-center gap-1 bg-[#EA580C]/10 px-2 py-0.5 rounded border border-[#EA580C]/20 transition-all hover:bg-[#EA580C]/20"
                    >
                      <Sparkles className="w-3 h-3" /> Same as Shop
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahesh Kale"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
                    Mobile Number <span className="text-[#DC2626]">*</span>
                  </label>
                  {formData.mobile && (
                    <span
                      className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                        isMobileValid ? "text-[#059669]" : "text-[#D97706]"
                      }`}
                    >
                      {isMobileValid ? (
                        <>
                          <Check className="w-3 h-3" /> 10 Digits
                        </>
                      ) : (
                        `${formData.mobile.length}/10 digits`
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9423456789"
                    value={formData.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, mobile: val });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border rounded-lg focus:bg-white focus:outline-none font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-all ${
                      formData.mobile && !isMobileValid
                        ? "border-[#FDE68A] focus:border-[#D97706]"
                        : "border-[#E2E8F0] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20"
                    }`}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    Email Address <span className="text-[10px] font-normal text-[#94A3B8]">(Optional - For e-invoices)</span>
                  </label>
                  {formData.email && (
                    <span
                      className={`text-[10px] font-semibold ${
                        isEmailValid ? "text-[#059669]" : "text-[#DC2626]"
                      }`}
                    >
                      {isEmailValid ? "Valid format" : "Invalid email format"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS & LOCATION DETAILS */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm leading-none">
                    2. Address & Delivery Location
                  </h3>
                  <span className="text-[11px] text-[#64748B]">Shop location for goods drop-off & billing</span>
                </div>
              </div>
            </div>

            {/* Fast City Presets Bar */}
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  Quick City Presets (Auto-fills City, District & State)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CITY_PRESETS.map((preset) => {
                  const isSelected = formData.city === preset.city;
                  return (
                    <button
                      key={preset.city}
                      type="button"
                      onClick={() => handleQuickCitySelect(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#2563EB] text-white shadow-xs"
                          : "bg-white text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9] hover:border-[#94A3B8]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{preset.city}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street Address */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  Street / Shop Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. New Market Yard, Shop No. 14"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  Area / Locality
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Market Yard / Borate Vasti"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  City / Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Jamkhed / Ahilyanagar"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahilyanagar"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                />
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                />
              </div>

              {/* Pincode */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    Pincode
                  </label>
                  {formData.pincode && (
                    <span
                      className={`text-[10px] font-semibold ${
                        isPincodeValid ? "text-[#059669]" : "text-[#DC2626]"
                      }`}
                    >
                      {isPincodeValid ? "Valid 6-digit Pincode" : "Must be 6 digits"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 413901"
                    value={formData.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, pincode: val });
                    }}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: FINANCIAL & OPENING BALANCE */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-lg bg-[#059669]/10 text-[#059669] border border-[#059669]/20 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm leading-none">
                  3. Financial Ledger & Opening Balance
                </h3>
                <span className="text-[11px] text-[#64748B]">Set initial opening balance & payment direction</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Balance Amount with Preset Buttons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    Opening Balance Amount (₹)
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#94A3B8]">Presets:</span>
                    {BALANCE_PRESETS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setFormData({ ...formData, openingBalance: amt })}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                          Number(formData.openingBalance) === amt
                            ? "bg-[#059669] text-white"
                            : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <IndianRupee className="w-4 h-4 text-[#059669]" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.openingBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, openingBalance: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* Opening Balance Direction Type Cards */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  Balance Direction Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                  {/* RECEIVABLE Card */}
                  <div
                    onClick={() =>
                      setFormData({ ...formData, openingBalanceType: "RECEIVABLE" })
                    }
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      formData.openingBalanceType === "RECEIVABLE"
                        ? "bg-[#ECFDF5] border-[#059669] shadow-xs"
                        : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.openingBalanceType === "RECEIVABLE"
                          ? "bg-[#059669] text-white"
                          : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0F172A]">RECEIVABLE</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#059669]/10 text-[#059669]">
                          Customer Owes Us
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Customer will pay this amount for past pending balance.
                      </p>
                    </div>
                  </div>

                  {/* PAYABLE Card */}
                  <div
                    onClick={() =>
                      setFormData({ ...formData, openingBalanceType: "PAYABLE" })
                    }
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      formData.openingBalanceType === "PAYABLE"
                        ? "bg-[#FEF2F2] border-[#DC2626] shadow-xs"
                        : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        formData.openingBalanceType === "PAYABLE"
                          ? "bg-[#DC2626] text-white"
                          : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0F172A]">PAYABLE</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#DC2626]/10 text-[#DC2626]">
                          We Owe Customer
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Advance payment or credit balance held for the customer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: ADDITIONAL REMARKS */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-lg bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm leading-none">
                  4. Delivery Notes & Special Terms
                </h3>
                <span className="text-[11px] text-[#64748B]">Optional instructions for drivers & accountants</span>
              </div>
            </div>

            <textarea
              rows="3"
              placeholder="Write any specific delivery instructions, billing terms, or preferred timing..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
            />
          </div>

          {/* BOTTOM FORM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="customer-form-submit-btn"
              type="submit"
              disabled={isSubmitting || requiredCount < 3}
              className="inline-flex items-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold px-6 py-2.5 rounded-lg shadow-sm transition-all text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{isEditMode ? "Save Changes" : "Register Customer"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY LIVE PROFILE PREVIEW CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-4">
            {/* Real-time Business Card Preview */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden transition-all">
              {/* Card Header Gradient */}
              <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] p-5 text-white relative">
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                      {formData.shopName ? formData.shopName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1 leading-tight">
                        {formData.shopName || "Your Shop Name"}
                      </h4>
                      <p className="text-xs text-[#94A3B8] font-medium flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-[#EA580C]" />
                        {formData.ownerName || "Proprietor Name"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/20 backdrop-blur-xs shrink-0">
                    PREVIEW
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-5 space-y-4">
                {/* Contact Badges */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2.5 text-[#334155] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                    <Phone className="w-4 h-4 text-[#EA580C] shrink-0" />
                    <span className="font-mono font-bold text-[#0F172A]">
                      {formData.mobile || "10-Digit Mobile"}
                    </span>
                  </div>

                  {formData.email && (
                    <div className="flex items-center gap-2.5 text-[#334155] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
                      <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <span className="font-medium text-[#0F172A] truncate">
                        {formData.email}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location Line */}
                <div className="pt-2 border-t border-[#E2E8F0] space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Delivery Address
                  </span>
                  <p className="text-xs text-[#334155] font-medium leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                    <span>
                      {formData.address && `${formData.address}, `}
                      {formData.area && `${formData.area}, `}
                      {formData.city || "City"}
                      {formData.district && `, ${formData.district}`}
                      {formData.state && `, ${formData.state}`}
                      {formData.pincode && ` - ${formData.pincode}`}
                    </span>
                  </p>
                </div>

                {/* Opening Balance Summary Card */}
                <div className="pt-2 border-t border-[#E2E8F0]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      Opening Ledger Balance
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        formData.openingBalanceType === "RECEIVABLE"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : "bg-[#FEF2F2] text-[#DC2626]"
                      }`}
                    >
                      {formData.openingBalanceType}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {formData.openingBalanceType === "RECEIVABLE" ? (
                        <TrendingUp className="w-4 h-4 text-[#059669]" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-[#DC2626]" />
                      )}
                      <span className="text-xs font-semibold text-[#475569]">Initial Balance</span>
                    </div>
                    <span
                      className={`font-mono font-bold text-sm ${
                        formData.openingBalanceType === "RECEIVABLE"
                          ? "text-[#059669]"
                          : "text-[#DC2626]"
                      }`}
                    >
                      ₹{Number(formData.openingBalance || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Notes preview if present */}
                {formData.notes && (
                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block mb-1">
                      Delivery Remarks
                    </span>
                    <p className="text-[11px] text-[#475569] italic bg-[#FFF7ED] p-2.5 rounded-lg border border-[#FFEDD5]">
                      "{formData.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#BFDBFE] space-y-2">
              <div className="flex items-center gap-2 text-[#1E40AF] font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Pro Tips for Fast Entry</span>
              </div>
              <ul className="text-[11px] text-[#1E3A8A] space-y-1.5 pl-5 list-disc font-medium">
                <li>Click <strong>Quick City</strong> chips to fill City, District & State in 1 tap.</li>
                <li>Use <strong>Same as Shop</strong> to quickly duplicate shop name to owner.</li>
                <li>Press <kbd className="px-1 py-0.2 bg-white rounded border border-[#93C5FD] text-[10px] font-mono">Ctrl + S</kbd> anytime to submit the profile.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
