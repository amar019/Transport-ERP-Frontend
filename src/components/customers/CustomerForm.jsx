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
    state: "",
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
          state: existing.state || "",
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
          setTimeout(() => navigate("/customers"), 1000);
        } else {
          setErrorMsg(res.payload || "Failed to update customer");
        }
      } else {
        const res = await dispatch(addCustomer(payload));
        if (!res.error) {
          showToast("Customer registered successfully!", "success");
          setTimeout(() => navigate("/customers"), 1000);
        } else {
          setErrorMsg(res.payload || "Failed to create customer");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred");
    } font: {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-orange-100">
      {/* Toast Alert */}
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

      {/* Top Header & Navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs md:text-sm font-bold mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                {isEditMode ? "Edit Customer Profile" : "Register New Customer"}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {isEditMode
                  ? "Update business contact and address details"
                  : "Add a new client profile to your Transport ERP master directory"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs md:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Business & Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
              Business & Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop Name */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Shop / Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shree Ganesh General Store"
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vishal Patil"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Email Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. customer@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Address & Location Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
              Address & Location Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Street Address */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Street / Shop Address
              </label>
              <input
                type="text"
                placeholder="e.g. Main Market, Shop No. 12"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Area / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Camp"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Pune"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District
              </label>
              <input
                type="text"
                placeholder="e.g. Pune"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Pincode */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                placeholder="e.g. 411001"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Opening Balance & Financial Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <Coins className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
              Opening Balance & Financial Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opening Balance Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Opening Balance Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Balance Type
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1 select-none">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, openingBalanceType: "RECEIVABLE" })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                    formData.openingBalanceType === "RECEIVABLE"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  RECEIVABLE (To Receive)
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, openingBalanceType: "PAYABLE" })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                    formData.openingBalanceType === "PAYABLE"
                      ? "bg-rose-50 text-rose-700 border-rose-300 shadow-xs"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  PAYABLE (To Pay)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Additional Notes */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
            <FileText className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
              Additional Notes
            </h3>
          </div>

          <textarea
            rows="3"
            placeholder="Write any specific delivery instructions, billing terms, or general remarks..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/customers")}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? "Save Changes" : "Register Customer"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
