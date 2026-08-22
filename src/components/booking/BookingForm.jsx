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
  Phone,
  MapPin,
  Package,
  Calculator,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  IndianRupee,
  Check,
  X,
  CreditCard,
  Truck,
  ChevronDown,
} from "lucide-react";
import { getBranches } from "@/services/branch.service";
import { getCustomers } from "@/services/customer.service";
import { ROUTES } from "@/constants/paths";

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
  const [selectedCustomerObj, setSelectedCustomerObj] = useState(null);

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Fetch branches on mount
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

  // Fetch registered customers directory on mount
  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        setCustomersLoading(true);
        const res = await getCustomers();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];
        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers:", err);
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
    return branches.filter((b) => {
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
    const q = destSearchTerm.toLowerCase().trim();
    if (!q) return destinationBranches;
    return destinationBranches.filter((b) => {
      const name = (b.name || "").toLowerCase();
      const code = (b.branchCode || b.code || "").toLowerCase();
      const city = (b.city || "").toLowerCase();
      return name.includes(q) || code.includes(q) || city.includes(q);
    });
  }, [destinationBranches, destSearchTerm]);

  // Filtered customers list based on party search query
  const filteredCustomers = useMemo(() => {
    const q = partySearchTerm.toLowerCase().trim();
    if (!q) return customers.slice(0, 8);
    return customers.filter((c) => {
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

  // Initialize react-hook-form
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

      // Destination Branch
      toBranch: initialData?.toBranch?._id || initialData?.toBranch || "",
      toBranchName: initialData?.toBranch?.name || "",

      // Sender
      sender: {
        name: initialData?.sender?.name || "",
        mobile: initialData?.sender?.mobile || "",
        address: initialData?.sender?.address || "",
      },

      // Customer / Receiver
      customer: initialData?.customer?._id || initialData?.customer || "",
      receiver: {
        shopName: initialData?.customer?.shopName || "",
        ownerName: initialData?.customer?.ownerName || "",
        mobile: initialData?.customer?.mobile || "",
      },
      deliveryAddress: initialData?.deliveryAddress || initialData?.customer?.address || "",

      // Consignment & Goods
      itemName: initialData?.itemName || "",
      quantity: initialData?.quantity ?? 1,

      // Charges Matrix
      freight: initialData?.freight ?? 0,
      hamali: initialData?.hamali ?? 0,
      crossing: initialData?.crossing ?? 0,
      biltyCharge: initialData?.biltyCharge ?? 5,
      otherCharges: initialData?.otherCharges ?? 0,

      notes: initialData?.notes || "",
    },
  });

  // Populate form in edit mode
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

      const destBranchName =
        typeof initialData.toBranch === "object" ? initialData.toBranch.name : "";

      if (typeof initialData.customer === "object" && initialData.customer) {
        setSelectedCustomerObj(initialData.customer);
      }

      reset({
        bookingDate: formattedDate,
        collectionType: initialData.collectionType || "TO_PAY",
        toBranch: destBranchId,
        toBranchName: destBranchName,
        sender: {
          name: initialData.sender?.name || "",
          mobile: initialData.sender?.mobile || "",
          address: initialData.sender?.address || "",
        },
        customer: custId,
        receiver: {
          shopName: initialData.customer?.shopName || "",
          ownerName: initialData.customer?.ownerName || "",
          mobile: initialData.customer?.mobile || "",
        },
        deliveryAddress: initialData.deliveryAddress || initialData.customer?.address || "",
        itemName: initialData.itemName || "",
        quantity: initialData.quantity ?? 1,
        freight: initialData.freight ?? 0,
        hamali: initialData.hamali ?? 0,
        crossing: initialData.crossing ?? 0,
        biltyCharge: initialData.biltyCharge ?? 0,
        otherCharges: initialData.otherCharges ?? 0,
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
    const payload = {
      bookingDate: data.bookingDate,
      sender: {
        name: data.sender?.name?.trim(),
        mobile: data.sender?.mobile?.trim() || "",
        address: data.sender?.address?.trim() || "",
      },
      customer: data.customer,
      toBranch: data.toBranch,
      deliveryAddress: data.deliveryAddress?.trim() || "",
      itemName: data.itemName?.trim(),
      quantity: Number(data.quantity || 1),
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
      className="max-w-[1400px] mx-auto font-sans antialiased text-slate-800 select-none pb-12"
    >
      {/* TOP COMPACT HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bookings</span>
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Dashboard /
            </span>
            <span className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight">
              {isEditMode ? "Edit Transport Booking" : "Create New Consignment Booking"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
            Booking ID:{" "}
            <span className="text-orange-600 font-extrabold">
              {initialData?.bookingNumber || "Auto Generated"}
            </span>
          </span>
        </div>
      </div>

      {/* 70% / 30% SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MAIN DATA ENTRY (70% - lg:col-span-8) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* SECTION 1: ROUTE & PARTICULARS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-5 transition-all">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80">
                  1
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm tracking-tight uppercase">
                  Route & Particulars
                </h3>
              </div>
              <div className="flex items-center gap-2">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Origin Branch (Locked) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
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
                  <label className="text-[11px] font-bold text-slate-700">
                    Destination Branch <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Hotkey hint <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-500">F10</kbd>
                  </span>
                </div>

                <div
                  onClick={() => setDestDropdownOpen(!destDropdownOpen)}
                  className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${errors.toBranch
                      ? "border-rose-400 ring-2 ring-rose-500/10 bg-rose-50/20"
                      : destDropdownOpen
                        ? "border-orange-500 ring-2 ring-orange-500/10 bg-white"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span
                      className={`text-xs font-bold truncate ${selectedToBranchName ? "text-slate-800" : "text-slate-400 font-normal"
                        }`}
                    >
                      {selectedToBranchName || "Search or select destination branch..."}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${destDropdownOpen ? "rotate-180 text-orange-500" : ""
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
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {branchesLoading ? (
                        <div className="p-3 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
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
                              className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${isSelected
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-5 transition-all">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80">
                  2
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm tracking-tight uppercase">
                  Party Details (Sender & Receiver)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Customer Quick-Fill
              </span>
            </div>

            {/* Unified Fast-Search Dropdown */}
            <div className="mb-4 relative" ref={partyDropdownRef}>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
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
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {customersLoading ? (
                      <div className="p-3 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
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
                            <div>
                              <div className="font-extrabold text-slate-800 flex items-center gap-2">
                                <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                <span>{c.shopName}</span>
                                {c.customerCode && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                                    {c.customerCode}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-3 mt-0.5">
                                <span>Owner: {c.ownerName || "N/A"}</span>
                                <span>•</span>
                                <span>Mob: {c.mobile || "N/A"}</span>
                                {c.city && <span>• {c.city}</span>}
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md">
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

            {/* Dual Cards: SENDER (Left) & RECEIVER / CUSTOMER (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                  />
                  {errors.sender?.name && (
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
                    maxLength={10}
                    placeholder="e.g. 8515115151"
                    {...register("sender.mobile", {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "10-digit mobile required",
                      },
                    })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
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
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-800"
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
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-bold text-slate-800"
                  />
                  {errors.receiver?.shopName && (
                    <p className="text-[10px] font-bold text-rose-500 mt-0.5">
                      {errors.receiver.shopName.message}
                    </p>
                  )}
                </div>

                <input
                  type="hidden"
                  {...register("customer", { required: "Please select or assign a Customer" })}
                />
                {errors.customer && (
                  <p className="text-[10px] font-bold text-rose-500">
                    {errors.customer.message}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mahesh Kale"
                      {...register("receiver.ownerName")}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9423456789"
                      {...register("receiver.mobile")}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
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
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CONSIGNMENT & GOODS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-5 transition-all">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80">
                  3
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm tracking-tight uppercase">
                  Consignment & Goods
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                Use <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border text-slate-500">TAB</kbd> key to jump between inputs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Item Description (8 cols) */}
              <div className="sm:col-span-8">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Item Description / Goods Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Package className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Electrical Material box, PVC Pipes, Bags..."
                    {...register("itemName", { required: "Item description is required" })}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-bold text-slate-800"
                  />
                </div>
                {errors.itemName && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">
                    {errors.itemName.message}
                  </p>
                )}
              </div>

              {/* Quantity / Cartons (4 cols) */}
              <div className="sm:col-span-4">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Quantity / Packages <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: { value: 1, message: "Min 1" },
                  })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-black text-slate-800 text-center"
                />
                {errors.quantity && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: CHARGES MATRIX */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-5 transition-all">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-black text-xs flex items-center justify-center border border-orange-200/80">
                  4
                </span>
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm tracking-tight uppercase">
                  Charges Matrix (₹)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                5 Standard Charge Heads
              </span>
            </div>

            {/* 5-Column Numeric Input Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
              {/* 1. Freight */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Freight (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register("freight", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-1.5 text-xs font-black text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 2. Hamali */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Hamali (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register("hamali", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 3. Crossing */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Crossing (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register("crossing", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 4. Bilty Charge */}
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Bilty Charge (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register("biltyCharge", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>

              {/* 5. Other Charges */}
              <div className="col-span-2 sm:col-span-1 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/10 transition-all">
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 truncate">
                  Other Charges (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  {...register("otherCharges", { min: { value: 0, message: "Min 0" } })}
                  className="w-full bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-lg text-right focus:outline-hidden"
                />
              </div>
            </div>

            {/* Notes & Special Instructions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Notes & Special Instructions <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Handle with care, deliver during business hours..."
                {...register("notes")}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-medium text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: CLEAN ENTERPRISE LIVE BILLING SUMMARY (30% - lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-4 space-y-4">
          <div className="bg-white text-slate-800 rounded-3xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                    Billing Overview
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    Real-time consignment charges
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md border border-orange-200/80">
                INR (₹)
              </span>
            </div>

            {/* Itemized Line Items Breakdown */}
            <div className="space-y-2.5 text-xs font-semibold">
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
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/60 border border-orange-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 block">
                  Total Amount
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  All charges inclusive
                </span>
              </div>
              <span className="text-2xl md:text-3xl font-black font-mono text-orange-600 tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
            </div>


            {/* PAYMENT INFORMATION / COLLECTION TYPE TOGGLE */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase text-slate-500">
                  Payment Collection Type
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {collectionType === "PAID_AT_BOOKING" ? "Settled at Booking" : "Collect at Delivery"}
                </span>
              </div>

              {/* Segmented Toggle Buttons */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setValue("collectionType", "PAID_AT_BOOKING")}
                  className={`py-2 px-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${collectionType === "PAID_AT_BOOKING"
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
                  className={`py-2 px-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${collectionType === "TO_PAY"
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
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${collectionType === "PAID_AT_BOOKING"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${collectionType === "PAID_AT_BOOKING" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                  ></span>
                  {collectionType === "PAID_AT_BOOKING" ? "PAID" : "PENDING (TO PAY)"}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-2">
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
    </form>
  );
}
