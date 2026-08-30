import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchCustomers,
  addCustomer,
  editCustomer,
} from "@/store/slices/customerSlice";
import { ROUTES } from "@/constants/paths";

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
} from "lucide-react";

export default function CustomerForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // If present, edit mode

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

  // Quick preset city helper
  const handleQuickCitySelect = (cityName) => {
    setFormData((prev) => ({
      ...prev,
      city: cityName,
    }));
  };

  // Quick copy shop name to owner name
  const handleCopyShopToOwner = () => {
    if (formData.shopName) {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.shopName,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const payload = {
      ...formData,
      openingBalance: Number(formData.openingBalance) || 0,
    };

    try {
      if (isEditMode) {
        const res = await dispatch(editCustomer({ id, customerData: payload }));
        if (!res.error) {
          showToast("Customer updated successfully!", "success");
          setTimeout(() => navigate("/customers"), 800);
        } else {
          setErrorMsg(res.payload || "Failed to update customer");
        }
      } else {
        const res = await dispatch(addCustomer(payload));
        if (!res.error) {
          showToast("Customer registered successfully!", "success");
          setTimeout(() => navigate("/customers"), 800);
        } else {
          setErrorMsg(res.payload || "Failed to create customer");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickCities = ["Ahilyanagar", "Jamkhed", "Beed", "Kharda", "kada", "Ashti", "Patoda"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${toastMessage.type === "success"
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

      {/* Top Header & Breadcrumbs */}
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
          <span onClick={() => navigate("/customers")} className="hover:text-[#0F172A] cursor-pointer">Customers</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="font-semibold text-[#0F172A]">
            {isEditMode ? "Edit Customer" : "Register Customer"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer"
              title="Back to Customer Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
                {isEditMode ? "Edit Customer Profile" : "Register New Customer"}
              </h1>
              <p className="text-xs text-[#64748B] font-normal">
                {isEditMode
                  ? "Update business contact and address details"
                  : "Add a new client profile to your Transport ERP master directory"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-3 text-[#DC2626] text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SECTION 1: BUSINESS & CONTACT INFO */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] flex items-center justify-center shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F172A] text-sm">
                1. Business & Contact Information
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Shop / Business Name <span className="text-[#DC2626]">*</span>
                </label>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Mahavir Agro Center / Ganesh Transport"
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* Owner Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Owner Name <span className="text-[#DC2626]">*</span>
                </label>
                {formData.shopName && (
                  <button
                    type="button"
                    onClick={handleCopyShopToOwner}
                    className="text-[10px] font-semibold text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Same as Shop
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Mahesh Kale"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Mobile Number <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="e.g. 9423456789"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* Email Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. customer@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ADDRESS & LOCATION DETAILS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F172A] text-sm">
                2. Address & Location Details
              </h3>
            </div>

            {/* Quick City Presets */}
            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[10px] font-semibold text-[#64748B] mr-1">Quick City:</span>
              {quickCities.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleQuickCitySelect(c)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${formData.city === c
                    ? "bg-[#F97316] text-white"
                    : "bg-[#F1F5F9] text-[#475569] hover:bg-slate-200"
                    }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Street / Shop Address
              </label>
              <input
                type="text"
                placeholder="e.g. New Market Yard, Shop No. 14"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* Area */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Area / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Market Yard / Borate Vasti"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                City / Branch Location
              </label>
              <input
                type="text"
                placeholder="e.g. Jamkhed / Ahilyanagar / Beed"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* District */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                District
              </label>
              <input
                type="text"
                placeholder="e.g. Ahilyanagar"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* State */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* Pincode */}
            <div className="col-span-1 md:col-span-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Pincode
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 413901"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: FINANCIAL & OPENING BALANCE */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <div className="w-7 h-7 rounded-md bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#0F172A] text-sm">
              3. Opening Balance & Financial Ledger
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opening Balance Amount */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Opening Balance Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) =>
                  setFormData({ ...formData, openingBalance: e.target.value })
                }
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-mono font-bold text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
              />
            </div>

            {/* Opening Balance Type Segmented Control */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                Balance Direction Type
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, openingBalanceType: "RECEIVABLE" })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${formData.openingBalanceType === "RECEIVABLE"
                    ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] shadow-2xs"
                    : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-200/50"
                    }`}
                >
                  RECEIVABLE (To Receive)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, openingBalanceType: "PAYABLE" })
                  }
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${formData.openingBalanceType === "PAYABLE"
                    ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] shadow-2xs"
                    : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-200/50"
                    }`}
                >
                  PAYABLE (To Pay)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: ADDITIONAL REMARKS */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <div className="w-7 h-7 rounded-md bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[#0F172A] text-sm">
              4. Additional Remarks & Notes
            </h3>
          </div>

          <textarea
            rows="3"
            placeholder="Write any specific delivery instructions, billing terms, or general remarks..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
          />
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2.5 rounded-lg shadow-2xs transition-colors text-xs cursor-pointer disabled:opacity-50"
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
      </form>
    </div>
  );
}
