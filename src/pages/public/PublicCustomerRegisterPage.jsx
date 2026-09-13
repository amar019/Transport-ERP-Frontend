import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCustomer } from "@/store/slices/customerSlice";
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Building2,
  Hash,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Truck,
  Sparkles,
  ShieldCheck,
  Check,
  Flame,
  Star,
  Award,
  Zap,
  ArrowRight,
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

export default function PublicCustomerRegisterPage() {
  const dispatch = useDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleCopyShopToOwner = () => {
    if (formData.shopName) {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.shopName,
      }));
    }
  };

  const handleQuickCitySelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      city: preset.city,
      district: preset.district,
      state: preset.state,
    }));
  };

  const isShopNameValid = formData.shopName.trim().length > 0;
  const isOwnerNameValid = formData.ownerName.trim().length > 0;
  const isMobileValid = /^[0-9]{10}$/.test(formData.mobile.trim());
  const isPincodeValid = !formData.pincode || /^[0-9]{6}$/.test(formData.pincode.trim());

  // Progress percentage
  const requiredCount = (isShopNameValid ? 1 : 0) + (isOwnerNameValid ? 1 : 0) + (isMobileValid ? 1 : 0);
  const optionalCount =
    (formData.address ? 1 : 0) +
    (formData.city ? 1 : 0) +
    (formData.district ? 1 : 0) +
    (formData.pincode ? 1 : 0) +
    (formData.email ? 1 : 0);
  const completionPercentage = Math.min(100, Math.round((requiredCount / 3) * 70 + (optionalCount / 5) * 30));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isShopNameValid || !isOwnerNameValid || !isMobileValid) {
      setErrorMsg("Please complete all required fields marked with * correctly.");
      return;
    }
    if (!isPincodeValid) {
      setErrorMsg("Pincode must be exactly 6 digits.");
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
      openingBalance: 0,
      notes: formData.notes ? `[Self Registered] ${formData.notes}` : "[Self Registered]",
    };

    try {
      const res = await dispatch(addCustomer(payload));
      if (!res.error) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(res.payload || "Failed to register profile. Please try again.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] via-[#FFF7ED] to-[#FFFBF7] flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-800">
        <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl border border-orange-200/80 shadow-[0_25px_60px_-15px_rgba(234,88,12,0.15)] p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 relative overflow-hidden">
          {/* Top Decorative Orange Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FF9900]" />

          {/* Success Check Badge with Pulsing Glow */}
          <div className="relative pt-2">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#FF5500] to-[#FF8800] text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <span className="inline-flex items-center gap-1 mt-3 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-200">
              <Sparkles className="w-3 h-3" /> VERIFIED REGISTRATION
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Registration Successful!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your business profile for <strong className="text-orange-600 font-bold">{formData.shopName}</strong> has been saved in the Mahakal Transport master ledger.
            </p>
          </div>

          {/* Registered Details Receipt Card */}
          <div className="bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 text-left space-y-2.5 text-xs font-medium">
            <div className="flex items-center justify-between text-slate-500">
              <span>Proprietor Name:</span>
              <strong className="text-slate-900 font-bold">{formData.ownerName}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Mobile Contact:</span>
              <strong className="font-mono text-orange-600 font-bold">{formData.mobile}</strong>
            </div>
            {formData.city && (
              <div className="flex items-center justify-between text-slate-500">
                <span>City Location:</span>
                <strong className="text-slate-900 font-bold">{formData.city}</strong>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200/80">
              <span>Account Status:</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Ready for Booking
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-black text-orange-600 tracking-wider uppercase">
              MAHAKAL TRANSPORT LOGISTICS
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              You may close this page now.
            </p>
          </div>

          {/* DEVELOPER ADVERTISEMENT BANNER */}
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-2xl border border-orange-200/80 p-4 text-center space-y-2 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                <Zap className="w-3 h-3 text-orange-600" />
                <span>Custom AI Software Development</span>
              </div>
              <p className="text-xs font-black text-slate-900 leading-snug">
                Build AI-Powered Softwares or Mobile Apps for your Shop & Business!
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href="tel:7744949305"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#FF5500] hover:bg-[#E64C00] text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call: 7744949305</span>
                </a>
                <a
                  href="https://wa.me/917744949305?text=Hello!%20I%20want%20to%20build%20AI%20powered%20software%20for%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN FORM PAGE (ULTRA PREMIUM ORANGE & WHITE DESIGN)
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF7] via-[#FFF7ED] to-[#FFFBF7] py-6 px-3 sm:px-6 md:py-10 font-sans antialiased text-slate-800 selection:bg-orange-100 selection:text-orange-600">
      {/* Background Soft Floating Ambient Spheres */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-5 relative z-10 pb-20 sm:pb-8">
        {/* HERO HEADER BANNER */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-orange-200/80 shadow-[0_15px_40px_-10px_rgba(234,88,12,0.1)] relative overflow-hidden transition-all">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5500] via-[#FF6B00] to-[#FFAA00] text-white flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0 transform transition-transform hover:scale-105">
                <Truck className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-200">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                  <span>MAHAKAL TRANSPORT</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
                  Merchant Registration
                </h1>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Official ERP Portal</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-3 sm:mt-2 leading-relaxed">
            Register your shop profile for express booking, electronic bilty, and real-time delivery notifications.
          </p>
        </div>

        {/* PROGRESS TRACKER BAR */}
        <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-2xl border border-orange-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#FF8800] text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/20 shrink-0">
              {completionPercentage}%
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Form Readiness Status
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {requiredCount < 3
                  ? `Required missing: ${!isShopNameValid ? "Shop Name, " : ""}${!isOwnerNameValid ? "Proprietor, " : ""}${!isMobileValid ? "Mobile (10 digits)" : ""}`
                  : "Mandatory credentials filled! Ready to register."}
              </span>
            </div>
          </div>

          <div className="w-24 sm:w-40 bg-orange-50 h-2.5 rounded-full overflow-hidden shrink-0 border border-orange-200/60">
            <div
              className="h-full bg-gradient-to-r from-[#FF5500] to-[#FF8800] transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* MAIN REGISTRATION FORM CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-orange-200/80 shadow-[0_20px_50px_-15px_rgba(234,88,12,0.1)] p-5 sm:p-8 space-y-6"
        >
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: BUSINESS & PROPRIETOR CREDENTIALS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  1. Shop & Proprietor Credentials
                </h3>
              </div>
              <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                * Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shop Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    Shop / Commercial Business Name <span className="text-orange-600">*</span>
                  </label>
                  {isShopNameValid && (
                    <span className="text-[10px] font-bold text-orange-600 flex items-center gap-0.5">
                      <Check className="w-3.5 h-3.5" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Agro Center / Ganesh Traders"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    Proprietor / Owner Name <span className="text-orange-600">*</span>
                  </label>
                  {formData.shopName && (
                    <button
                      type="button"
                      onClick={handleCopyShopToOwner}
                      className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200 active:scale-95 transition-transform"
                    >
                      <Sparkles className="w-3 h-3" /> Same as Shop
                    </button>
                  )}
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahesh Kale"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    Mobile Contact <span className="text-orange-600">*</span>
                  </label>
                  {formData.mobile && (
                    <span
                      className={`text-[10px] font-bold ${
                        isMobileValid ? "text-orange-600" : "text-amber-600"
                      }`}
                    >
                      {isMobileValid ? "10 Digits Valid" : `${formData.mobile.length}/10 digits`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
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
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-mono font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Email Address <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: LOCATION & DELIVERY ADDRESS */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2.5 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
                  2. Location & Delivery Drop-off Address
                </h3>
              </div>
            </div>

            {/* Quick City Presets (Horizontal Scrollable Chips) */}
            <div className="bg-orange-50/80 p-3.5 rounded-2xl border border-orange-200/80 space-y-2">
              <span className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider block">
                Tap Transport Hub City:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                {CITY_PRESETS.map((preset) => {
                  const isSelected = formData.city === preset.city;
                  return (
                    <button
                      key={preset.city}
                      type="button"
                      onClick={() => handleQuickCitySelect(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 active:scale-95 ${
                        isSelected
                          ? "bg-gradient-to-r from-[#FF5500] to-[#FF8800] text-white shadow-md shadow-orange-500/20"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-orange-50"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{preset.city}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Street Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Street / Shop Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shop No. 14, Main Market Yard"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Market Yard"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  City Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jamkhed"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahilyanagar"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    Pincode
                  </label>
                  {formData.pincode && (
                    <span
                      className={`text-[10px] font-bold ${
                        isPincodeValid ? "text-orange-600" : "text-red-600"
                      }`}
                    >
                      {isPincodeValid ? "Valid 6 Digits" : "Must be 6 digits"}
                    </span>
                  )}
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
                  className="w-full px-3.5 py-3 text-xs bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-mono font-bold text-slate-900 placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* DESKTOP SUBMIT BUTTON */}
          <div className="hidden sm:block pt-4 border-t border-orange-100">
            <button
              type="submit"
              disabled={isSubmitting || requiredCount < 3}
              className="w-full py-4 bg-gradient-to-r from-[#FF5500] via-[#FF6B00] to-[#FF7700] hover:from-[#E64C00] hover:to-[#E64C00] text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>REGISTER WITH MAHAKAL TRANSPORT</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* DEVELOPER ADVERTISEMENT CARD */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-orange-200/80 p-4.5 sm:p-6 text-center space-y-2.5 shadow-[0_10px_30px_-5px_rgba(234,88,12,0.06)] transition-all">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider border border-orange-200">
            <Zap className="w-3.5 h-3.5 text-orange-600" />
            <span>Custom AI & Mobile App Development</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
            Want AI-Powered Software or Mobile Apps for your Shop & Business?
          </h4>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <a
              href="tel:7744949305"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF5500] hover:bg-[#E64C00] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: 7744949305</span>
            </a>
            <a
              href="https://wa.me/917744949305?text=Hello!%20I%20want%20to%20build%20AI%20powered%20software%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* MOBILE STICKY FLOATING SUBMIT BUTTON BAR */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t border-orange-200/80 z-50 shadow-xl">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || requiredCount < 3}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>SUBMIT PROFILE ({completionPercentage}%)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
