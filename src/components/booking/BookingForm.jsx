import React, { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Calendar,
  User,
  Store,
  Package,
  Calculator,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  IndianRupee,
  CreditCard,
  Building2,
  MapPin,
} from "lucide-react";
import BookingCustomerSelect from "./BookingCustomerSelect";
import { getBranches } from "../../services/branch.service";

export default function BookingForm({
  initialData = null,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Branches list for Destination branch selection
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  useEffect(() => {
    const fetchBranchList = async () => {
      try {
        setBranchesLoading(true);
        const res = await getBranches();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];
        setBranches(list);
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranchList();
  }, []);

  // Filter destination branches: exclude current user's branch if possible, or show active delivery branches
  const destinationBranches = useMemo(() => {
    return branches.filter((b) => {
      if (b.status && b.status !== "ACTIVE") return false;
      const userBranchId = user?.branch?._id || user?.branch?.id || user?.branch;
      if (userBranchId && (b._id === userBranchId || b.id === userBranchId)) {
        return false;
      }
      return true;
    });
  }, [branches, user]);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bookingDate: initialData?.bookingDate
        ? new Date(initialData.bookingDate).toISOString().split("T")[0]
        : todayStr,
      collectionType: initialData?.collectionType || "TO_PAY",

      // Sender
      sender: {
        name: initialData?.sender?.name || "",
        mobile: initialData?.sender?.mobile || "",
        address: initialData?.sender?.address || "",
      },

      // Receiver / Customer
      customer: initialData?.customer?._id || initialData?.customer || "",
      customerInfo: {
        shopName: initialData?.customer?.shopName || "",
        ownerName: initialData?.customer?.ownerName || "",
        mobile: initialData?.customer?.mobile || "",
      },

      // Branches & Delivery
      toBranch: initialData?.toBranch?._id || initialData?.toBranch || "",
      deliveryAddress: initialData?.deliveryAddress || "",

      // Goods
      itemName: initialData?.itemName || "",
      quantity: initialData?.quantity ?? 1,

      // Charges (Direct flat charges)
      freight: initialData?.freight ?? 0,
      crossing: initialData?.crossing ?? 0,
      hamali: initialData?.hamali ?? 0,
      biltyCharge: initialData?.biltyCharge ?? 5,
      otherCharges: initialData?.otherCharges ?? 0,

      notes: initialData?.notes || "",
    },
  });

  // Populate initial values in edit mode using react-hook-form reset
  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.bookingDate
        ? new Date(initialData.bookingDate).toISOString().split("T")[0]
        : todayStr;

      const custId =
        typeof initialData.customer === "object"
          ? initialData.customer._id || initialData.customer.id
          : initialData.customer || "";

      const destBranchId =
        typeof initialData.toBranch === "object"
          ? initialData.toBranch._id || initialData.toBranch.id
          : initialData.toBranch || "";

      reset({
        bookingDate: formattedDate,
        collectionType: initialData.collectionType || "TO_PAY",
        sender: {
          name: initialData.sender?.name || "",
          mobile: initialData.sender?.mobile || "",
          address: initialData.sender?.address || "",
        },
        customer: custId,
        customerInfo: {
          shopName: initialData.customer?.shopName || "",
          ownerName: initialData.customer?.ownerName || "",
          mobile: initialData.customer?.mobile || "",
        },
        toBranch: destBranchId,
        deliveryAddress: initialData.deliveryAddress || "",
        itemName: initialData.itemName || "",
        quantity: initialData.quantity ?? 1,
        freight: initialData.freight ?? 0,
        crossing: initialData.crossing ?? 0,
        hamali: initialData.hamali ?? 0,
        biltyCharge: initialData.biltyCharge ?? 5,
        otherCharges: initialData.otherCharges ?? 0,
        notes: initialData.notes || "",
      });
    }
  }, [initialData, reset, todayStr]);

  // Watch charge fields for live total calculation
  const crossingVal = useWatch({ control, name: "crossing" });
  const freightVal = useWatch({ control, name: "freight" });
  const hamaliVal = useWatch({ control, name: "hamali" });
  const biltyChargeVal = useWatch({ control, name: "biltyCharge" });
  const otherChargesVal = useWatch({ control, name: "otherCharges" });

  const selectedCustomerId = useWatch({ control, name: "customer" });
  const customerInfo = useWatch({ control, name: "customerInfo" });
  const collectionType = useWatch({ control, name: "collectionType" });

  // Calculate Total Amount: freight + crossing + hamali + biltyCharge + otherCharges
  const totalAmount = useMemo(() => {
    const f = Math.max(0, Number(freightVal || 0));
    const c = Math.max(0, Number(crossingVal || 0));
    const h = Math.max(0, Number(hamaliVal || 0));
    const b = Math.max(0, Number(biltyChargeVal || 0));
    const o = Math.max(0, Number(otherChargesVal || 0));
    return f + c + h + b + o;
  }, [freightVal, crossingVal, hamaliVal, biltyChargeVal, otherChargesVal]);

  // Currency Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Customer Selection Handler
  const handleCustomerSelect = (customerObj) => {
    if (!customerObj) {
      setValue("customer", "", { shouldValidate: true });
      setValue("customerInfo.shopName", "");
      setValue("customerInfo.ownerName", "");
      setValue("customerInfo.mobile", "");
      return;
    }

    const custId = customerObj._id || customerObj.id;
    setValue("customer", custId, { shouldValidate: true });
    setValue("customerInfo.shopName", customerObj.shopName || "");
    setValue("customerInfo.ownerName", customerObj.ownerName || "");
    setValue("customerInfo.mobile", customerObj.mobile || "");

    // Auto-fill delivery address if available and currently empty
    const fullAddress = [
      customerObj.deliveryAddress || customerObj.address,
      customerObj.area,
      customerObj.city,
      customerObj.state,
    ]
      .filter(Boolean)
      .join(", ");

    if (fullAddress) {
      setValue("deliveryAddress", fullAddress);
    }
  };

  // On Submit Handler
  const handleFormSubmit = (data) => {
    const payload = {
      bookingDate: data.bookingDate,
      sender: {
        name: data.sender.name,
        mobile: data.sender.mobile,
        address: data.sender.address || "",
      },
      customer: data.customer,
      toBranch: data.toBranch,
      deliveryAddress: data.deliveryAddress || "",
      itemName: data.itemName,
      quantity: Number(data.quantity || 1),
      freight: Number(data.freight || 0),
      crossing: Number(data.crossing || 0),
      hamali: Number(data.hamali || 0),
      biltyCharge: Number(data.biltyCharge || 0),
      otherCharges: Number(data.otherCharges || 0),
      collectionType: data.collectionType,
      notes: data.notes || "",
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 select-none">
      {/* SECTION 1: BOOKING INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            1. Booking Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Booking Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Booking Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register("bookingDate", { required: "Booking Date is required" })}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all"
            />
            {errors.bookingDate && (
              <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.bookingDate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: SENDER INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            2. Sender Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sender Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Rohit Sharma"
              {...register("sender.name", { required: "Sender Name is required" })}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
            />
            {errors.sender?.name && (
              <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.sender.name.message}
              </p>
            )}
          </div>

          {/* Sender Mobile */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Mobile <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              {...register("sender.mobile", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Sender Mobile must be exactly 10 digits",
                },
              })}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
            />
            {errors.sender?.mobile && (
              <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.sender.mobile.message}
              </p>
            )}
          </div>

          {/* Sender Address */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sender Address
            </label>
            <input
              type="text"
              placeholder="e.g. Main Market, Ahmednagar"
              {...register("sender.address")}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: CUSTOMER / RECEIVER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Store className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            3. Customer / Receiver
          </h3>
        </div>

        <div className="space-y-4">
          {/* Customer Search Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Customer <span className="text-rose-500">*</span>
            </label>
            <BookingCustomerSelect
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleCustomerSelect}
              error={Boolean(errors.customer)}
            />
            <input
              type="hidden"
              {...register("customer", { required: "Please select a Customer" })}
            />
            {errors.customer && (
              <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.customer.message}
              </p>
            )}
          </div>

          {/* Customer Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Shop Name</span>
              <input
                type="text"
                readOnly
                value={customerInfo?.shopName || ""}
                placeholder="Auto-filled on select"
                className="w-full mt-0.5 bg-transparent border-0 text-xs font-extrabold text-slate-800 focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Owner Name</span>
              <input
                type="text"
                readOnly
                value={customerInfo?.ownerName || ""}
                placeholder="Auto-filled on select"
                className="w-full mt-0.5 bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-hidden"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Mobile Number</span>
              <input
                type="text"
                readOnly
                value={customerInfo?.mobile || ""}
                placeholder="Auto-filled on select"
                className="w-full mt-0.5 bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: ROUTE & BRANCH INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            4. Route & Destination Branch
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Branch (Current User's Branch) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Origin Branch (Booked At)
              </label>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50/60 border border-orange-200/80 rounded-xl text-xs font-bold text-orange-800">
                <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="truncate">
                  {user?.branch?.name || initialData?.fromBranch?.name || "Origin Branch"}
                </span>
                <span className="ml-auto text-[10px] uppercase px-2 py-0.5 bg-orange-200/70 text-orange-800 rounded-md font-extrabold">
                  {user?.branch?.type || "BOOKING"}
                </span>
              </div>
            </div>

            {/* Destination Branch Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination Branch <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("toBranch", { required: "Destination branch is required" })}
                disabled={branchesLoading}
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-bold text-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">-- Select Destination Branch --</option>
                {destinationBranches.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.name} ({b.type})
                  </option>
                ))}
              </select>
              {errors.toBranch && (
                <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.toBranch.message}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address Override */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Delivery / Drop Address <span className="text-xs text-slate-400 font-normal">(Optional Override)</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Warehouse 4, Market Yard, Pune"
              {...register("deliveryAddress")}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: GOODS INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Package className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            5. Goods Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Name / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Fertilizer Bags, PVC Pipes, Spare Parts"
              {...register("itemName", { required: "Item Name is required" })}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
            />
            {errors.itemName && (
              <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.itemName.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quantity / Cartons <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
              className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-bold text-slate-800 transition-all"
            />
            {errors.quantity && (
              <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.quantity.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 6: CHARGES BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
              6. Charges Breakdown
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Direct Flat Charges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          {/* Freight */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Freight (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              {...register("freight", { min: { value: 0, message: "Minimum 0" } })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 font-bold text-slate-800"
            />
          </div>

          {/* Crossing */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Crossing (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              {...register("crossing", { min: { value: 0, message: "Minimum 0" } })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 font-bold text-slate-800"
            />
          </div>

          {/* Hamali */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Hamali (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              {...register("hamali", { min: { value: 0, message: "Minimum 0" } })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 font-bold text-slate-800"
            />
          </div>

          {/* Bilty Charge */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Bilty Charge (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              {...register("biltyCharge", { min: { value: 0, message: "Minimum 0" } })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 font-bold text-slate-800"
            />
          </div>

          {/* Other Charges */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Other Charges (₹)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              {...register("otherCharges", { min: { value: 0, message: "Minimum 0" } })}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 font-bold text-slate-800"
            />
          </div>
        </div>

        {/* Live Total Calculation Highlight */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Total Booking Amount (Live Calculation)
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                Freight ({formatCurrency(freightVal || 0)}) + Crossing + Hamali + Bilty + Other
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl md:text-2xl font-black text-amber-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 7: PAYMENT LOGIC & COLLECTION TYPE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <CreditCard className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            7. Payment Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Collection Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Collection Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <label
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                  collectionType === "PAID_AT_BOOKING"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  value="PAID_AT_BOOKING"
                  {...register("collectionType")}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Paid at Booking</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-extrabold cursor-pointer transition-all ${
                  collectionType === "TO_PAY"
                    ? "bg-amber-50 text-amber-700 border-amber-300 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  value="TO_PAY"
                  {...register("collectionType")}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>To Pay</span>
              </label>
            </div>
          </div>

          {/* Payment Details Preview Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2">
              Payment State Preview
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">Status</span>
                <span className="text-xs font-extrabold text-slate-700">
                  {collectionType === "PAID_AT_BOOKING"
                    ? "PAID"
                    : initialData?.paymentStatus || "PENDING"}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">Paid</span>
                <span className="text-xs font-extrabold text-emerald-600">
                  {collectionType === "PAID_AT_BOOKING"
                    ? formatCurrency(totalAmount)
                    : formatCurrency(initialData?.paidAmount || 0)}
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">Remaining</span>
                <span className="text-xs font-extrabold text-amber-600">
                  {collectionType === "PAID_AT_BOOKING"
                    ? formatCurrency(0)
                    : formatCurrency(initialData?.remainingAmount ?? totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 8: NOTES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            8. Notes & Special Instructions
          </h3>
        </div>

        <textarea
          rows="2"
          placeholder="Handle with care / Fragile goods..."
          {...register("notes")}
          className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50"
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
              <span>{isEditMode ? "Updating..." : "Saving Booking..."}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditMode ? "Update Booking" : "Save Booking"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
