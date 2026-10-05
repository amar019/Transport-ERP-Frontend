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
  IndianRupee,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Check,
  Building2,
  HelpCircle,
  Command,
} from "lucide-react";

const CITY_PRESETS = [
  "Ahilyanagar",
  "Jamkhed",
  "Beed",
  "Kharda",
  "Kada",
  "Ashti",
  "Patoda",
  "Pune",
  "Chhatrapati Sambhajinagar",
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
    city: "",
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
          city: existing.city || "",
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
  const handleQuickCitySelect = (cityName) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
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
      city: "",
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isShopNameValid || !isOwnerNameValid || !isMobileValid) {
      setErrorMsg("Please fill out all required fields marked with * correctly.");
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
    <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-6 md:p-8 font-sans antialiased text-[#0F172A] space-y-4 sm:space-y-6 select-none pb-28 lg:pb-12">
      {/* Toast Alert Banner */}
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
      <div className="max-w-7xl mx-auto space-y-2.5">
        {/* Header Row: Back Button, Title, Badge & Reset Action */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200/90 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
              title="Back to Customers Directory"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back</span>
            </button>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span
                onClick={() => navigate("/customers")}
                className="hover:text-slate-900 cursor-pointer transition-colors hidden sm:inline-block"
              >
                Customers
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline-block" />
              <h1 className="font-extrabold text-slate-900 text-sm sm:text-lg tracking-tight">
                {isEditMode ? "Edit Customer Profile" : "Register New Customer"}
              </h1>
            </div>
          </div>

          {/* Right Action Controls: Status Badge, Reset Button & Hotkey */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isEditMode
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-orange-100/80 text-orange-700 border border-orange-200/80"
              }`}
            >
              {isEditMode ? "Edit Mode" : "New Account"}
            </span>

            {!isEditMode && (
              <button
                type="button"
                onClick={handleResetForm}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Reset Form"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              <Command className="w-3 h-3 text-slate-400" />
              <span>Ctrl+S</span>
            </div>
          </div>
        </div>

        {/* Subtitle Description */}
        <p className="text-[11px] sm:text-xs text-slate-500 pb-2 border-b border-slate-200/80">
          {isEditMode
            ? "Update customer credentials, branch location, and financial ledger parameters."
            : "Add a new commercial shop or client to your Transport ERP master ledger."}
        </p>
      </div>

      {/* Main Grid: Left Form (8 Cols) + Right Live Preview (4 Cols) */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* LEFT COLUMN: FORM SECTIONS */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Error Alert Banner */}
          {errorMsg && (
            <div className="p-3.5 sm:p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-start gap-3 text-[#DC2626] text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626] mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Validation Error</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* SECTION 1: BUSINESS & CONTACT INFO */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm leading-none uppercase tracking-tight">
                    1. Business & Primary Contact
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-[#64748B]">Shop name, proprietor, and mobile number</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA] shrink-0">
                * Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Shop Name */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
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
                    className={`w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F8FAFC] border rounded-lg focus:bg-white focus:outline-none font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-all ${
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
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
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
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1">
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
                    inputMode="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9423456789"
                    value={formData.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setFormData({ ...formData, mobile: val });
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F8FAFC] border rounded-lg focus:bg-white focus:outline-none font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-all ${
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
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569]">
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
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ADDRESS & LOCATION DETAILS */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm leading-none uppercase tracking-tight">
                    2. Address & Delivery Location
                  </h3>
                  <span className="text-[10px] sm:text-[11px] text-[#64748B]">Shop location for goods drop-off & billing</span>
                </div>
              </div>
            </div>

            {/* Fast City Presets Bar */}
            <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#2563EB]" />
                  Quick City Presets (Auto-fills City in 1 tap)
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CITY_PRESETS.map((cityName) => {
                  const isSelected = formData.city === cityName;
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => handleQuickCitySelect(cityName)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#2563EB] text-white shadow-xs"
                          : "bg-white text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9] hover:border-[#94A3B8]"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{cityName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Street Address */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569]">
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
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div className="col-span-1 md:col-span-2 space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569]">
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
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: FINANCIAL & OPENING BALANCE */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-lg bg-[#059669]/10 text-[#059669] border border-[#059669]/20 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm leading-none uppercase tracking-tight">
                  3. Financial Ledger & Opening Balance
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#64748B]">Set initial opening balance & payment direction</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Balance Amount with Preset Buttons */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    Opening Balance Amount (₹)
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
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
                    inputMode="decimal"
                    placeholder="0.00"
                    value={formData.openingBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, openingBalance: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
                  />
                </div>
              </div>

              {/* Opening Balance Direction Type Cards */}
              <div className="space-y-1.5">
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#475569]">
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
                      <div className="flex items-center gap-1.5 flex-wrap">
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
                      <div className="flex items-center gap-1.5 flex-wrap">
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
          <div className="bg-white rounded-xl sm:rounded-2xl border border-[#E2E8F0] shadow-2xs p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-lg bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-[#0F172A] text-xs sm:text-sm leading-none uppercase tracking-tight">
                  4. Delivery Notes & Special Terms
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#64748B]">Optional instructions for drivers & accountants</span>
              </div>
            </div>

            <textarea
              rows="3"
              placeholder="Write any specific delivery instructions, billing terms, or preferred timing..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20 font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-all"
            />
          </div>

          {/* DESKTOP FORM BOTTOM ACTIONS */}
          <div className="hidden lg:flex items-center justify-end gap-3 pt-2">
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
              disabled={isSubmitting || !isShopNameValid || !isOwnerNameValid || !isMobileValid}
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

        {/* RIGHT COLUMN: STICKY LIVE PROFILE PREVIEW CARD (lg:block) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-6 space-y-4">
            {/* Real-time Business Card Preview */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all">
              {/* Card Header Gradient */}
              <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] p-4 sm:p-5 text-white relative">
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center font-black text-base sm:text-lg shadow-md shrink-0">
                      {formData.shopName ? formData.shopName.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1 leading-tight">
                        {formData.shopName || "Your Shop Name"}
                      </h4>
                      <p className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-[#EA580C]" />
                        {formData.ownerName || "Proprietor Name"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 text-white border border-white/20 backdrop-blur-xs shrink-0">
                    PREVIEW
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 sm:p-5 space-y-3.5">
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
                      {formData.city || "City"}
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

                  <div className="bg-[#F8FAFC] p-2.5 sm:p-3 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
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
            <div className="bg-[#EFF6FF] p-3.5 sm:p-4 rounded-xl border border-[#BFDBFE] space-y-2">
              <div className="flex items-center gap-2 text-[#1E40AF] font-bold text-xs">
                <HelpCircle className="w-4 h-4 text-[#2563EB]" />
                <span>Pro Tips for Fast Entry</span>
              </div>
              <ul className="text-[11px] text-[#1E3A8A] space-y-1 pl-4 list-disc font-medium">
                <li>Click <strong>Quick City</strong> chips to fill City in 1 tap.</li>
                <li>Use <strong>Same as Shop</strong> to quickly duplicate shop name to owner.</li>
                <li>Press <kbd className="px-1 py-0.2 bg-white rounded border border-[#93C5FD] text-[10px] font-mono">Ctrl + S</kbd> anytime to submit the profile.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>

      {/* ========================================================================= */}
      {/* MOBILE STICKY FLOATING ACTION BAR (lg:hidden) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
              {formData.shopName ? "Registering" : "Customer Entry"}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
              {formData.shopName || "Enter Shop Name"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isShopNameValid || !isOwnerNameValid || !isMobileValid}
            className="inline-flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
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
    </div>
  );
}
