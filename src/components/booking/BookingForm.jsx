import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Building2,
  Lock,
  Search,
  Store,
  User,
  MapPin,
  Package,
  Calculator,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Receipt,
} from "lucide-react";
import { getBranches } from "@/services/branch.service";
import { getCustomers } from "@/services/customer.service";
import { ROUTES } from "@/constants/paths";

// Helper for safe date string formatting (YYYY-MM-DD)
const formatDateForInput = (dateVal) => {
  if (!dateVal) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().split("T")[0];
    }
    return d.toISOString().split("T")[0];
  } catch (e) {
    return new Date().toISOString().split("T")[0];
  }
};

export default function BookingForm({
  initialData = null,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Multi-Item Goods List State
  const [itemList, setItemList] = useState(() => {
    if (initialData?.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
      return initialData.items.map((i) => ({
        description: i?.description || "",
        quantity: Math.max(1, Number(i?.quantity || 1)),
      }));
    }
    if (initialData?.itemName) {
      return [{ description: initialData.itemName, quantity: Math.max(1, Number(initialData.quantity || 1)) }];
    }
    return [{ description: "", quantity: 1 }];
  });

  // Mobile Bottom Sheet / Summary Drawer State
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Branches list for Destination branch selection
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [destSearchTerm, setDestSearchTerm] = useState("");
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const destDropdownRef = useRef(null);

  // Registered customers list for fast party lookup
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [partySearchTerm, setPartySearchTerm] = useState("");
  const [partyDropdownOpen, setPartyDropdownOpen] = useState(false);
  const partyDropdownRef = useRef(null);

  // Selected customer object for live preview chip
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(() => {
    return typeof initialData?.customer === "object" ? initialData.customer : null;
  });

  // Direct Entry (Walk-In Customer) Mode Flag
  const [isDirectEntry, setIsDirectEntry] = useState(() => {
    if (!initialData) return false;
    return Boolean(initialData.isDirectEntry || (!initialData.customer && initialData));
  });

  // Item List Handlers
  const handleAddItem = () => {
    setItemList((prev) => [...prev, { description: "", quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (itemList.length > 1) {
      setItemList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    setItemList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    return formatDateForInput();
  }, []);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranchList = async () => {
      try {
        setBranchesLoading(true);
        const res = await getBranches();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];
        setBranches(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load branches:", err);
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranchList();
  }, []);

  // Fetch registered customers directory on mount
  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        setCustomersLoading(true);
        const res = await getCustomers();
        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res?.data && Array.isArray(res.data)) {
          list = res.data;
        } else if (res?.data?.customers && Array.isArray(res.data.customers)) {
          list = res.data.customers;
        } else if (res?.customers && Array.isArray(res.customers)) {
          list = res.customers;
        }
        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers:", err);
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };
    fetchCustomersList();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setDestDropdownOpen(false);
      }
      if (partyDropdownRef.current && !partyDropdownRef.current.contains(e.target)) {
        setPartyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter destination branches: exclude user's own origin branch
  const destinationBranches = useMemo(() => {
    if (!Array.isArray(branches)) return [];
    return branches.filter((b) => {
      if (!b || typeof b !== "object") return false;
      if (b.status && b.status !== "ACTIVE") return false;
      const userBranchId = user?.branch?._id || user?.branch?.id || user?.branch;
      if (userBranchId && (b._id === userBranchId || b.id === userBranchId)) {
        return false;
      }
      return true;
    });
  }, [branches, user]);

  // Filtered destination branches based on search query
  const filteredDestinationBranches = useMemo(() => {
    if (!Array.isArray(destinationBranches)) return [];
    const q = destSearchTerm.toLowerCase().trim();
    if (!q) return destinationBranches;
    return destinationBranches.filter((b) => {
      if (!b) return false;
      const name = (b.name || "").toLowerCase();
      const code = (b.branchCode || b.code || "").toLowerCase();
      const city = (b.city || "").toLowerCase();
      return name.includes(q) || code.includes(q) || city.includes(q);
    });
  }, [destinationBranches, destSearchTerm]);

  // Filtered customers list based on party search query
  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    const q = partySearchTerm.toLowerCase().trim();
    if (!q) return customers.slice(0, 8);
    return customers.filter((c) => {
      if (!c) return false;
      const shop = (c.shopName || "").toLowerCase();
      const owner = (c.ownerName || "").toLowerCase();
      const mobile = (c.mobile || "").toLowerCase();
      const code = (c.customerCode || "").toLowerCase();
      const city = (c.city || "").toLowerCase();
      return (
        shop.includes(q) ||
        owner.includes(q) ||
        mobile.includes(q) ||
        code.includes(q) ||
        city.includes(q)
      );
    });
  }, [customers, partySearchTerm]);

  // Helper variables to resolve initial values for customer/receiver
  const customerObj = typeof initialData?.customer === "object" ? initialData.customer : null;
  const custId = customerObj ? (customerObj._id || customerObj.id) : (typeof initialData?.customer === "string" ? initialData.customer : "");
  const receiverObj = initialData?.receiver || {};

  const initialReceiverShopName = receiverObj.shopName || customerObj?.shopName || "";
  const initialReceiverOwnerName = receiverObj.ownerName || customerObj?.ownerName || "";
  const initialReceiverMobile = receiverObj.mobile || customerObj?.mobile || "";
  const initialDeliveryAddress = initialData?.deliveryAddress || customerObj?.deliveryAddress || customerObj?.address || receiverObj.address || "";

  const destBranchObj = typeof initialData?.toBranch === "object" ? initialData.toBranch : null;
  const initialDestBranchId = destBranchObj ? (destBranchObj._id || destBranchObj.id) : (typeof initialData?.toBranch === "string" ? initialData.toBranch : "");
  const initialDestBranchName = destBranchObj?.name || "";

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bookingDate: formatDateForInput(initialData?.bookingDate),
      collectionType: initialData?.collectionType || "TO_PAY",

      // Destination Branch
      toBranch: initialDestBranchId,
      toBranchName: initialDestBranchName,

      // Sender
      sender: {
        name: initialData?.sender?.name || "",
        mobile: initialData?.sender?.mobile || "",
        address: initialData?.sender?.address || "",
      },

      // Customer / Receiver
      customer: custId,
      receiver: {
        shopName: initialReceiverShopName,
        ownerName: initialReceiverOwnerName,
        mobile: initialReceiverMobile,
      },
      deliveryAddress: initialDeliveryAddress,

      // Consignment & Goods
      itemName: initialData?.itemName || "",
      quantity: initialData?.quantity ?? 1,
      invoiceNo: initialData?.invoiceNo || "",
      remark: initialData?.remark || "",

      // Charges Matrix
      freight: initialData?.freight || "",
      hamali: initialData?.hamali || "",
      crossing: initialData?.crossing || "",
      biltyCharge: initialData?.biltyCharge || "",
      otherCharges: initialData?.otherCharges || "",

      notes: initialData?.notes || "",
    },
  });

  // Populate form in edit mode if initialData arrives after mount
  useEffect(() => {
    if (initialData) {
      const formattedDate = formatDateForInput(initialData.bookingDate);

      const cObj = typeof initialData.customer === "object" ? initialData.customer : null;
      const cId = cObj ? (cObj._id || cObj.id) : (typeof initialData.customer === "string" ? initialData.customer : "");
      const rObj = initialData.receiver || {};

      const recShop = rObj.shopName || cObj?.shopName || "";
      const recOwner = rObj.ownerName || cObj?.ownerName || "";
      const recMob = rObj.mobile || cObj?.mobile || "";
      const delAddr = initialData.deliveryAddress || cObj?.deliveryAddress || cObj?.address || rObj.address || "";

      const dBranchObj = typeof initialData.toBranch === "object" ? initialData.toBranch : null;
      const dBranchId = dBranchObj ? (dBranchObj._id || dBranchObj.id) : (typeof initialData.toBranch === "string" ? initialData.toBranch : "");
      const dBranchName = dBranchObj?.name || "";

      if (cObj) {
        setSelectedCustomerObj(cObj);
      }

      setIsDirectEntry(Boolean(initialData.isDirectEntry || (!initialData.customer && initialData)));

      if (initialData.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
        setItemList(initialData.items.map((i) => ({ description: i?.description || "", quantity: Math.max(1, Number(i?.quantity || 1)) })));
      } else if (initialData.itemName) {
        setItemList([{ description: initialData.itemName, quantity: Math.max(1, Number(initialData.quantity || 1)) }]);
      } else {
        setItemList([{ description: "", quantity: 1 }]);
      }

      reset({
        bookingDate: formattedDate,
        collectionType: initialData.collectionType || "TO_PAY",
        toBranch: dBranchId,
        toBranchName: dBranchName,
        sender: {
          name: initialData.sender?.name || "",
          mobile: initialData.sender?.mobile || "",
          address: initialData.sender?.address || "",
        },
        customer: cId,
        receiver: {
          shopName: recShop,
          ownerName: recOwner,
          mobile: recMob,
        },
        deliveryAddress: delAddr,
        itemName: initialData.itemName || "",
        quantity: initialData.quantity ?? 1,
        invoiceNo: initialData.invoiceNo || "",
        remark: initialData.remark || "",
        freight: initialData.freight || "",
        hamali: initialData.hamali || "",
        crossing: initialData.crossing || "",
        biltyCharge: initialData.biltyCharge || "",
        otherCharges: initialData.otherCharges || "",
        notes: initialData.notes || "",
      });
    }
  }, [initialData, reset, todayStr]);

  // Live watch charges for real-time calculation
  const freightVal = useWatch({ control, name: "freight" });
  const hamaliVal = useWatch({ control, name: "hamali" });
  const crossingVal = useWatch({ control, name: "crossing" });
  const biltyChargeVal = useWatch({ control, name: "biltyCharge" });
  const otherChargesVal = useWatch({ control, name: "otherCharges" });

  const selectedToBranchId = useWatch({ control, name: "toBranch" });
  const selectedToBranchName = useWatch({ control, name: "toBranchName" });
  const collectionType = useWatch({ control, name: "collectionType" });

  // Calculate live Total Amount
  const totalAmount = useMemo(() => {
    const f = Math.max(0, Number(freightVal || 0));
    const h = Math.max(0, Number(hamaliVal || 0));
    const c = Math.max(0, Number(crossingVal || 0));
    const b = Math.max(0, Number(biltyChargeVal || 0));
    const o = Math.max(0, Number(otherChargesVal || 0));
    return f + h + c + b + o;
  }, [freightVal, hamaliVal, crossingVal, biltyChargeVal, otherChargesVal]);

  // Format Currency Helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Select Destination Branch Handler
  const handleSelectDestinationBranch = (branch) => {
    const bId = branch._id || branch.id;
    setValue("toBranch", bId, { shouldValidate: true });
    setValue("toBranchName", branch.name || "");
    setDestDropdownOpen(false);
    setDestSearchTerm("");
  };

  // Select Customer / Party Handler
  const handleSelectCustomer = (cust) => {
    if (!cust) return;
    const custId = cust._id || cust.id;
    setSelectedCustomerObj(cust);

    setValue("customer", custId, { shouldValidate: true });
    setValue("receiver.shopName", cust.shopName || "", { shouldValidate: true });
    setValue("receiver.ownerName", cust.ownerName || "");
    setValue("receiver.mobile", cust.mobile || "");

    const fullAddr = [cust.deliveryAddress || cust.address, cust.area, cust.city, cust.state]
      .filter(Boolean)
      .join(", ");

    setValue("deliveryAddress", fullAddr || cust.address || "");

    setPartyDropdownOpen(false);
    setPartySearchTerm("");
  };

  // Form Submit Handler
  const handleFormSubmit = (data) => {
    const validItems = itemList
      .filter((i) => i.description && i.description.trim() !== "")
      .map((i) => ({
        description: i.description.trim(),
        quantity: Math.max(1, Number(i.quantity || 1)),
      }));

    const finalItems = validItems.length > 0
      ? validItems
      : [{ description: data.itemName?.trim() || "General Goods", quantity: 1 }];

    const payload = {
      bookingDate: data.bookingDate,
      sender: {
        name: data.sender?.name?.trim(),
        mobile: data.sender?.mobile?.trim() || "",
        address: data.sender?.address?.trim() || "",
      },
      customer: isDirectEntry ? null : (data.customer || null),
      isDirectEntry: isDirectEntry,
      receiver: {
        shopName: data.receiver?.shopName?.trim() || "",
        ownerName: data.receiver?.ownerName?.trim() || "",
        mobile: data.receiver?.mobile?.trim() || "",
      },
      toBranch: data.toBranch,
      deliveryAddress: data.deliveryAddress?.trim() || "",
      items: finalItems,
      itemName: finalItems.map((i) => i.description).join(", "),
      quantity: finalItems.reduce((sum, i) => sum + Number(i.quantity || 1), 0),
      invoiceNo: data.invoiceNo?.trim() || "",
      remark: data.remark?.trim() || "",
      freight: Number(data.freight || 0),
      hamali: Number(data.hamali || 0),
      crossing: Number(data.crossing || 0),
      biltyCharge: Number(data.biltyCharge || 0),
      otherCharges: Number(data.otherCharges || 0),
      totalAmount: totalAmount,
      collectionType: data.collectionType,
      notes: data.notes?.trim() || "",
    };

    onSubmit(payload);
  };

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  const handleKeyDown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit(handleFormSubmit)();
      }
    },
    [handleSubmit, handleFormSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const originBranchName =
    user?.branch?.name || initialData?.fromBranch?.name || "Ahmednagar Booking";
  const originBranchType = user?.branch?.type || "BOOKING";

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="max-w-[1400px] mx-auto font-sans antialiased text-slate-800 select-none pb-28 lg:pb-12"
    >
      {/* TOP COMPACT MOBILE-RESPONSIVE HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bookings</span>
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dashboard /
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-tight">
              {isEditMode ? "Edit Transport Booking" : "New Consignment Booking"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] sm:text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
            Booking ID:{" "}
            <span className="text-orange-600 font-extrabold">
              {initialData?.bookingNumber || "Auto Generated"}
            </span>
          </span>
        </div>
      </div>

      {/* MAIN 70% / 30% SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MAIN DATA ENTRY (70% - lg:col-span-8) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-3.5 sm:space-y-4">
          {/* SECTION 1: ROUTE & PARTICULARS */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80 shrink-0">
                  1
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight uppercase">
                  Route & Particulars
                </h3>
              </div>
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Booking Date:
                </span>
                <input
                  type="date"
                  {...register("bookingDate", { required: "Booking Date is required" })}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-hidden focus:border-orange-500 focus:bg-white cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {/* Origin Branch (Locked) */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 mb-1">
                  Origin Branch <span className="text-slate-400 font-normal">(Locked)</span>
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{originBranchName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] uppercase px-2 py-0.5 bg-orange-100/80 text-orange-800 rounded-md font-black">
                      {originBranchType}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Destination Branch (Searchable Dropdown) */}
              <div className="relative" ref={destDropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-700">
                    Destination Branch <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline-block">
                    Hotkey <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-500">F10</kbd>
                  </span>
                </div>

                <div
                  onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                  className={`w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    errors.toBranch
                      ? "border-rose-400 ring-2 ring-rose-500/10 bg-rose-50/20"
                      : destDropdownOpen
                      ? "border-orange-500 ring-2 ring-orange-500/10 bg-white"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span
                      className={`text-xs font-bold truncate ${
                        selectedToBranchName ? "text-slate-800" : "text-slate-400 font-normal"
                      }`}
                    >
                      {selectedToBranchName || "Search or select destination branch..."}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      destDropdownOpen ? "rotate-180 text-orange-500" : ""
                    }`}
                  />
                </div>

                <input
                  type="hidden"
                  {...register("toBranch", { required: "Please select a Destination branch" })}
                />
                {errors.toBranch && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.toBranch.message}
                  </p>
                )}

                {/* Destination Dropdown Menu */}
                {destDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          autoFocus
                          placeholder="Type city, branch name, or code..."
                          value={destSearchTerm}
                          onChange={(e) => setDestSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="max-h-56 sm:max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {branchesLoading ? (
                        <div className="p-3.5 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          <span>Loading branches...</span>
                        </div>
                      ) : filteredDestinationBranches.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                          No destination branches match "{destSearchTerm}"
                        </div>
                      ) : (
                        filteredDestinationBranches.map((b) => {
                          const bId = b._id || b.id;
                          const isSelected = selectedToBranchId === bId;
                          return (
                            <div
                              key={bId}
                              onClick={() => handleSelectDestinationBranch(b)}
                              className={`p-3 sm:p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-orange-50 text-orange-900 font-bold"
                                  : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <div>
                                <div className="font-extrabold text-slate-800">{b.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  {b.city || "Delivery Station"} • Code: {b.branchCode || "N/A"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">
                                  {b.type || "DELIVERY"}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: PARTY DETAILS (SENDER & RECEIVER) */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80 shrink-0">
                  2
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight uppercase">
                  Party Details (Sender & Receiver)
                </h3>
              </div>

              {/* Direct Entry Toggle Pill */}
              <div className="grid grid-cols-2 sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsDirectEntry(false);
                  }}
                  className={`px-3 py-1.5 sm:py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                    !isDirectEntry
                      ? "bg-white text-orange-700 shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Registered Party</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDirectEntry(true);
                    setValue("customer", "");
                    setSelectedCustomerObj(null);
                    clearErrors("customer");
                  }}
                  className={`px-3 py-1.5 sm:py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                    isDirectEntry
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="text-amber-300">⚡</span>
                  <span>Direct Entry</span>
                </button>
              </div>
            </div>

            {/* Direct Entry Info Banner vs Fast-Search Autocomplete Dropdown */}
            {isDirectEntry ? (
              <div className="mb-4 bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
                <div className="flex items-start sm:items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md font-black text-[10px] sm:text-[11px] shrink-0 mt-0.5 sm:mt-0">
                    ⚡ Direct Entry Active
                  </span>
                  <span className="font-medium text-amber-800 text-[11px] sm:text-xs">
                    Walk-in Mode: Type receiver shop name & details directly below without registering a customer.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDirectEntry(false)}
                  className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer shrink-0"
                >
                  Switch to Registered
                </button>
              </div>
            ) : (
              <div className="mb-4 relative" ref={partyDropdownRef}>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  Search Registered Customer / Receiver
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Shop Name, Owner, Mobile, Code, or City..."
                    value={partySearchTerm}
                    onFocus={() => setPartyDropdownOpen(true)}
                    onChange={(e) => {
                      setPartySearchTerm(e.target.value);
                      setPartyDropdownOpen(true);
                    }}
                    className="w-full pl-9 pr-8 py-2.5 sm:py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
                  />
                  {partySearchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setPartySearchTerm("");
                        setPartyDropdownOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Customer Search Autocomplete Overlay */}
                {partyDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-60 sm:max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {customersLoading ? (
                        <div className="p-3.5 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                          <span>Searching registered customers...</span>
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                          No registered customers matching "{partySearchTerm}"
                        </div>
                      ) : (
                        filteredCustomers.map((c) => {
                          const custId = c._id || c.id;
                          return (
                            <div
                              key={custId}
                              onClick={() => handleSelectCustomer(c)}
                              className="p-3 text-xs flex items-center justify-between hover:bg-orange-50/70 cursor-pointer transition-colors"
                            >
                              <div className="pr-2">
                                <div className="font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                  <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                  <span>{c.shopName}</span>
                                  {c.customerCode && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                                      {c.customerCode}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span>Owner: {c.ownerName || "N/A"}</span>
                                  <span>•</span>
                                  <span>Mob: {c.mobile || "N/A"}</span>
                                  {c.city && <span>• {c.city}</span>}
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/80 px-2 py-1 rounded-md shrink-0">
                                Select
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dual Cards: SENDER (Left) & RECEIVER / CUSTOMER (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* SENDER CARD */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-200/70">
                  <User className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    Sender (Consignor)
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Sender Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ganesh Transport / Rohit Sharma"
                    {...register("sender.name", { required: "Sender Name is required" })}
                    className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                  />
                  {errors.sender?.name?.message && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                      {errors.sender.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    maxLength={10}
                    placeholder="e.g. 8515115151"
                    {...register("sender.mobile", {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "10-digit mobile required",
                      },
                    })}
                    className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Sender Address / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Market Yard, Pune"
                    {...register("sender.address")}
                    className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* RECEIVER / CUSTOMER CARD */}
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-orange-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      Receiver (Consignee)
                    </span>
                  </div>
                  {selectedCustomerObj?.customerCode && (
                    <span className="text-[9px] font-mono font-extrabold bg-orange-50 text-orange-700 px-1.5 py-0.2 rounded border border-orange-200">
                      {selectedCustomerObj.customerCode}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Customer / Shop Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mahavir Agro Center"
                    {...register("receiver.shopName", { required: "Customer Shop Name is required" })}
                    className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-bold text-slate-800"
                  />
                  {errors.receiver?.shopName?.message && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                      {errors.receiver.shopName.message}
                    </p>
                  )}
                </div>

                <input
                  type="hidden"
                  {...register("customer", {
                    required: isDirectEntry ? false : "Please select or assign a Customer",
                  })}
                />
                {!isDirectEntry && errors.customer && (
                  <p className="text-[10px] font-bold text-rose-500">
                    {errors.customer.message}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mahesh Kale"
                      {...register("receiver.ownerName")}
                      className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      maxLength={10}
                      placeholder="e.g. 9423456789"
                      {...register("receiver.mobile")}
                      className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Delivery / Drop Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New Market, Jamkhed"
                    {...register("deliveryAddress")}
                    className="w-full px-3 py-2 sm:py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CONSIGNMENT & GOODS (MULTI-ITEM) */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-5 transition-all">
            <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80 shrink-0">
                  3
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight uppercase">
                  Consignment Goods List ({itemList.length} {itemList.length === 1 ? "Item" : "Items"})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-xl transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Dynamic Multi-Item Rows */}
            <div className="space-y-2.5">
              {itemList.map((item, index) => (
                <div key={index}>
                  {/* MOBILE CARD VIEW (xs / sm screen) */}
                  <div className="block sm:hidden bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                          Item #{index + 1}
                        </span>
                        {index === 0 && (
                          <span className="text-[9px] font-extrabold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-full">
                            Primary Goods
                          </span>
                        )}
                      </div>
                      {itemList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-8">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Description
                        </label>
                        <div className="relative">
                          <Package className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Goods description..."
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 text-center">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full px-2 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-black text-slate-800 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP HORIZONTAL VIEW (sm+ screen) */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-2.5 items-center bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/70 transition-all hover:border-orange-200">
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="text-[11px] font-mono font-black text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="col-span-7">
                      <div className="relative">
                        <Package className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Item Description / Goods Name (e.g. Electric Box, Bags)"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-black text-slate-800 text-center"
                      />
                    </div>

                    <div className="col-span-1 flex items-center justify-center">
                      {itemList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Number Sub-Row */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  Invoice No. / Bill No. <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-001"
                    {...register("invoiceNo")}
                    className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: CHARGES MATRIX */}
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:p-5 transition-all">
            <div className="flex items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80 shrink-0">
                  4
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm tracking-tight uppercase">
                  Charges Matrix (₹)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                5 Standard Charges
              </span>
            </div>

            {/* Responsive Numeric Matrix Grid: Freight prominent on mobile (col-span-2 on mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 mb-4">
              {/* 1. Freight (Prominent) */}
              <div className="col-span-2 sm:col-span-1 bg-orange-50/40 p-2.5 rounded-xl border border-orange-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-orange-800 mb-1 truncate flex items-center justify-between">
                  <span>Freight (₹)</span>
                  <span className="text-[9px] bg-orange-200/70 text-orange-900 px-1 rounded font-black">Main</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  {...register("freight", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-2 sm:py-1.5 text-xs sm:text-sm font-black text-slate-900 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 2. Hamali */}
              <div className="col-span-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Hamali (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  {...register("hamali", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-2 sm:py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 3. Crossing */}
              <div className="col-span-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Crossing (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  {...register("crossing", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-2 sm:py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 4. Bilty Charge */}
              <div className="col-span-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Bilty Charge (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  {...register("biltyCharge", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-2 sm:py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 5. Other Charges */}
              <div className="col-span-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Other (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  {...register("otherCharges", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-2 sm:py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>
            </div>

            {/* Remark & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Remark */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mb-1">
                  Remark <span className="text-slate-400 font-normal">(Prints on Bilty)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fragile / Handle with care / Urgent"
                  {...register("remark")}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Notes & Special Instructions */}
              <div>
                <label className="block text-[10px] sm:text-[11px] font-bold text-slate-600 mb-1">
                  Notes & Special Handling <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deliver during business hours..."
                  {...register("notes")}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: ENTERPRISE LIVE BILLING SUMMARY (30% - lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
          <div className="bg-white text-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight">
                    Billing Overview
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Real-time consignment charges
                  </span>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md border border-orange-200/80 shrink-0">
                INR (₹)
              </span>
            </div>

            {/* Itemized Line Items Breakdown */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Freight:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(freightVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hamali / Labor:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(hamaliVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Crossing Charge:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(crossingVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bilty Charge:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(biltyChargeVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Other Charges:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(otherChargesVal || 0)}
                </span>
              </div>
            </div>

            {/* TOTAL AMOUNT HIGHLIGHT BANNER */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/60 border border-orange-200/90 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-orange-700 block">
                  Total Amount
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold">
                  All charges inclusive
                </span>
              </div>
              <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-orange-600 tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* PAYMENT INFORMATION / COLLECTION TYPE TOGGLE */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-slate-500">
                  Payment Collection Type
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {collectionType === "PAID_AT_BOOKING" ? "Paid at Booking" : "Collect at Delivery"}
                </span>
              </div>

              {/* Segmented Toggle Buttons */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setValue("collectionType", "PAID_AT_BOOKING")}
                  className={`py-2 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    collectionType === "PAID_AT_BOOKING"
                      ? "bg-white text-emerald-700 shadow-xs border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Paid at Booking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("collectionType", "TO_PAY")}
                  className={`py-2 px-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    collectionType === "TO_PAY"
                      ? "bg-white text-orange-700 shadow-xs border border-orange-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>To Pay</span>
                </button>
              </div>

              <input type="hidden" {...register("collectionType")} />

              {/* Status Badge */}
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-1 pt-1">
                <span>Payment Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    collectionType === "PAID_AT_BOOKING"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      collectionType === "PAID_AT_BOOKING" ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  ></span>
                  {collectionType === "PAID_AT_BOOKING" ? "PAID" : "PENDING (TO PAY)"}
                </span>
              </div>
            </div>

            {/* DESKTOP SAVE / CANCEL BUTTONS */}
            <div className="hidden lg:block space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-6 py-3 rounded-xl shadow-md shadow-orange-500/25 active:scale-[0.98] transition-all text-xs md:text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isEditMode ? "Updating Booking..." : "Saving Booking..."}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {isEditMode ? "Update Booking" : "Save Booking"} (Ctrl + Enter)
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
                disabled={isSubmitting}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY FLOATING ACTION BAR & EXPANDABLE DRAWER (lg:hidden) */}
      {/* ========================================================================= */}
      {/* Expandable Mobile Billing Breakdown Overlay */}
      {isMobileSummaryOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileSummaryOpen(false)}
        >
          <div
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl border-t border-slate-200 p-4 space-y-3.5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-600" />
                <h4 className="font-extrabold text-xs uppercase text-slate-800">
                  Consignment Charges Summary
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Line items */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Freight:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(freightVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Hamali / Labor:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(hamaliVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Crossing Charge:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(crossingVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bilty Charge:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(biltyChargeVal || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Other Charges:</span>
                <span className="font-mono font-extrabold text-slate-800">
                  {formatCurrency(otherChargesVal || 0)}
                </span>
              </div>
            </div>

            {/* Total Banner */}
            <div className="bg-orange-50 border border-orange-200/80 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-orange-800">
                Grand Total Amount
              </span>
              <span className="text-xl font-black font-mono text-orange-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            {/* Mobile Payment Mode Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">
                Payment Collection Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setValue("collectionType", "PAID_AT_BOOKING")}
                  className={`py-1.5 text-xs font-extrabold rounded-lg ${
                    collectionType === "PAID_AT_BOOKING"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Paid at Booking
                </button>
                <button
                  type="button"
                  onClick={() => setValue("collectionType", "TO_PAY")}
                  className={`py-1.5 text-xs font-extrabold rounded-lg ${
                    collectionType === "TO_PAY"
                      ? "bg-white text-orange-700 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  To Pay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2.5">
          {/* Live Total & Expandable Summary trigger */}
          <button
            type="button"
            onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
            className="flex items-center gap-2 text-left hover:bg-slate-50 p-1 rounded-xl transition-colors cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <span>Total Amount</span>
                {isMobileSummaryOpen ? (
                  <ChevronDown className="w-3 h-3 text-orange-500" />
                ) : (
                  <ChevronUp className="w-3 h-3 text-orange-500" />
                )}
              </span>
              <span className="text-lg font-black font-mono text-orange-600 leading-tight">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                collectionType === "PAID_AT_BOOKING"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO PAY"}
            </span>
          </button>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditMode ? "Update Bilty" : "Save Bilty"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
