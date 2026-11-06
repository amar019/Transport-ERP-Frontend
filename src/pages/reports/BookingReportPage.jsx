import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  FileText,
  Truck,
  Package,
  Layers,
  Receipt,
  AlertCircle,
  Building2,
  CalendarRange,
  CalendarDays,
  CreditCard,
  X,
  SlidersHorizontal,
  MapPin,
} from "lucide-react";
import { getBookingChargeBreakdownReport } from "@/services/booking.service";
import { getBranches } from "@/services/branch.service";

// Helpers for Indian Currency & Date Formatting
const formatINR = (val) => {
  const num = Number(val || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return "-";
  }
};

const formatDateForInput = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Compute start/end dates for preset buttons
const getPresetRange = (preset) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case "ALL":
      return { start: "", end: "", label: "All Memos" };
    case "TODAY":
      return { start: formatDateForInput(today), end: formatDateForInput(today), label: "Today" };
    case "YESTERDAY": {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      return { start: formatDateForInput(y), end: formatDateForInput(y), label: "Yesterday" };
    }
    case "THIS_WEEK": {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const mon = new Date(d.setDate(diff));
      return { start: formatDateForInput(mon), end: formatDateForInput(today), label: "This Week" };
    }
    case "THIS_MONTH": {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: formatDateForInput(first), end: formatDateForInput(today), label: "This Month" };
    }
    case "LAST_MONTH": {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: formatDateForInput(first), end: formatDateForInput(last), label: "Last Month" };
    }
    case "CUSTOM": {
      const day = formatDateForInput(today);
      return { start: day, end: day, label: "Select Date" };
    }
    default:
      return { start: "", end: "", label: "All Memos" };
  }
};

const monthNames = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const monthFullNames = [
  "", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

const getIsoWeekDateRangeString = (year, week) => {
  if (!year || !week) return `Week ${week || "-"}`;
  try {
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const start = new Date(simple);
    if (dow <= 4) {
      start.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    } else {
      start.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    }
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    const sDay = String(start.getUTCDate()).padStart(2, "0");
    const sMon = monthNames[start.getUTCMonth() + 1];
    const eDay = String(end.getUTCDate()).padStart(2, "0");
    const eMon = monthNames[end.getUTCMonth() + 1];

    return `Week ${week} (${sDay} ${sMon} - ${eDay} ${eMon} ${year})`;
  } catch (e) {
    return `Week ${week}, ${year}`;
  }
};

export default function BookingReportPage() {
  const { user } = useSelector((state) => state.auth);

  // Clean, focused Filter States - By default show ALL memos (no date restriction)
  const [activePreset, setActivePreset] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [collectionType, setCollectionType] = useState("ALL");
  const [selectedToBranch, setSelectedToBranch] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");

  // Toggle for custom date picker popover / dropdown
  const [showCustomDateInputs, setShowCustomDateInputs] = useState(false);

  // Active Tab: 'MEMO' | 'MONTHLY' | 'WEEKLY' | 'DETAILED'
  const [activeTab, setActiveTab] = useState("MEMO");

  // Report Data
  const [reportData, setReportData] = useState({
    summary: {
      totalBookings: 0,
      totalPackages: 0,
      totalFreight: 0,
      totalHamali: 0,
      totalCrossing: 0,
      totalBiltyCharge: 0,
      totalOtherCharges: 0,
      grandTotal: 0,
      totalToPay: 0,
      totalPaid: 0,
    },
    memoWise: [],
    monthly: [],
    weekly: [],
    detailedBookings: [],
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [branches, setBranches] = useState([]);
  const [expandedMemos, setExpandedMemos] = useState({});

  const toggleMemoExpand = (memoKey) => {
    setExpandedMemos((prev) => ({
      ...prev,
      [memoKey]: !prev[memoKey],
    }));
  };

  // Fetch branches for destination filter
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await getBranches();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];
        setBranches(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to load branches:", e);
      }
    };
    loadBranches();
  }, []);

  // Fetch Report Data
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (collectionType && collectionType !== "ALL") params.collectionType = collectionType;
      if (selectedToBranch && selectedToBranch !== "ALL") params.toBranch = selectedToBranch;

      const res = await getBookingChargeBreakdownReport(params);
      if (res?.data) {
        setReportData(res.data);
      } else if (res && typeof res === "object") {
        setReportData(res);
      }
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setErrorMsg(
        err?.response?.data?.message || err?.message || "Failed to load report data."
      );
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, collectionType, selectedToBranch]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle Preset Change
  const handlePresetSelect = (presetKey) => {
    setActivePreset(presetKey);
    if (presetKey === "ALL") {
      setShowCustomDateInputs(false);
      setStartDate("");
      setEndDate("");
    } else if (presetKey === "CUSTOM") {
      setShowCustomDateInputs(true);
      const singleDay = startDate || formatDateForInput(new Date());
      setStartDate(singleDay);
      setEndDate(singleDay);
    } else {
      setShowCustomDateInputs(false);
      const range = getPresetRange(presetKey);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  };

  // Handle Single Date Selection (sets both start and end date to the exact same day)
  const handleSingleDateChange = (val) => {
    if (!val) return;
    setStartDate(val);
    setEndDate(val);
  };

  const summary = reportData.summary || {};
  const memoWise = reportData.memoWise || [];
  const monthly = reportData.monthly || [];
  const weekly = reportData.weekly || [];
  const detailedBookings = reportData.detailedBookings || [];

  // Group detailed bookings by Memo
  const detailedByMemo = useMemo(() => {
    const map = {};
    detailedBookings.forEach((b) => {
      const key = b.memoId ? String(b.memoId) : "unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [detailedBookings]);

  // Filtered detailed list
  const filteredDetailedBookings = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return detailedBookings;
    return detailedBookings.filter((b) => {
      const bNo = (b.bookingNumber || "").toLowerCase();
      const mNo = (b.memoNumber || "").toLowerCase();
      const sender = (b.senderName || "").toLowerCase();
      const receiver = (b.receiverName || "").toLowerCase();
      const dest = (b.destinationBranchName || "").toLowerCase();
      const item = (b.itemName || "").toLowerCase();
      return (
        bNo.includes(q) ||
        mNo.includes(q) ||
        sender.includes(q) ||
        receiver.includes(q) ||
        dest.includes(q) ||
        item.includes(q)
      );
    });
  }, [detailedBookings, searchFilter]);

  // Filtered Memo list
  const filteredMemoWise = useMemo(() => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return memoWise;
    return memoWise.filter((m) => {
      const mNo = (m.memoNumber || "").toLowerCase();
      const dest = (m.destinationBranchName || "").toLowerCase();
      const city = (m.destinationBranchCity || "").toLowerCase();
      return mNo.includes(q) || dest.includes(q) || city.includes(q);
    });
  }, [memoWise, searchFilter]);

  // CSV Export
  const handleExportCSV = () => {
    if (!detailedBookings || detailedBookings.length === 0) {
      alert("No data available to export for the selected date range.");
      return;
    }

    const headers = [
      "Booking Date",
      "Bilty Number",
      "Memo Number",
      "Destination Branch",
      "Sender",
      "Receiver",
      "Item Description",
      "Quantity",
      "Freight (INR)",
      "Hamali (INR)",
      "Crossing (INR)",
      "Bilty Charge (INR)",
      "Other Charges (INR)",
      "Total Amount (INR)",
      "Collection Type",
      "Payment Status",
    ];

    const rows = detailedBookings.map((b) => [
      `"${formatDate(b.bookingDate)}"`,
      `"${b.bookingNumber || ""}"`,
      `"${b.memoNumber || "Unassigned"}"`,
      `"${b.destinationBranchName || ""}"`,
      `"${(b.senderName || "").replace(/"/g, '""')}"`,
      `"${(b.receiverName || "").replace(/"/g, '""')}"`,
      `"${(b.itemName || "").replace(/"/g, '""')}"`,
      b.quantity || 1,
      b.freight || 0,
      b.hamali || 0,
      b.crossing || 0,
      b.biltyCharge || 0,
      b.otherCharges || 0,
      b.totalAmount || 0,
      `"${b.collectionType || ""}"`,
      `"${b.paymentStatus || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Booking_Charges_Report_${startDate || "all"}_to_${endDate || "all"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const branchName = user?.branch?.name || "Booking Branch";

  const isFilterActive =
    activePreset !== "ALL" ||
    collectionType !== "ALL" ||
    selectedToBranch !== "ALL" ||
    Boolean(searchFilter);

  const handleResetFilters = () => {
    setActivePreset("ALL");
    setShowCustomDateInputs(false);
    setStartDate("");
    setEndDate("");
    setCollectionType("ALL");
    setSelectedToBranch("ALL");
    setSearchFilter("");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 lg:p-6 font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. MINIMAL HEADER BAR (Print-Hidden) */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-200/70 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-md">
              Revenue Reports
            </span>
            <span className="text-xs text-slate-300 font-bold">•</span>
            <span className="text-xs text-slate-500 font-semibold">{branchName}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Booking Charges Breakdown
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={fetchReport}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-600" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNIFIED CLEAN FILTER BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 mb-5 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Date Segment Pill Controls */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-extrabold overflow-x-auto scrollbar-none shrink-0">
            {[
              { key: "ALL", label: "All Memos" },
              { key: "TODAY", label: "Today" },
              { key: "THIS_WEEK", label: "This Week" },
              { key: "THIS_MONTH", label: "This Month" },
              { key: "LAST_MONTH", label: "Last Month" },
              { key: "CUSTOM", label: "Select Date" },
            ].map((p) => {
              const isSelected = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePresetSelect(p.key)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap text-xs ${
                    isSelected
                      ? "bg-white text-orange-600 shadow-2xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Secondary Filters Strip (Branch, Collection, Search) */}
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap w-full lg:w-auto">
            {/* Branch and Collection in a 2-col grid on mobile for a clean fit */}
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:flex sm:items-center">
              {/* Branch Filter */}
              <div className="relative">
                <select
                  value={selectedToBranch}
                  onChange={(e) => setSelectedToBranch(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-3 pr-7 py-2 sm:py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer appearance-none transition-all"
                >
                  <option value="ALL">All Destinations</option>
                  {branches.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      To: {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Collection Type Filter */}
              <div className="relative">
                <select
                  value={collectionType}
                  onChange={(e) => setCollectionType(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-3 pr-7 py-2 sm:py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer appearance-none transition-all"
                >
                  <option value="ALL">All Payments</option>
                  <option value="TO_PAY">TO-PAY (हस्तांतरण)</option>
                  <option value="PAID_AT_BOOKING">PAID (रोख)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Row Search */}
            <div className="relative w-full sm:min-w-[180px] sm:flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search memo, bilty, party..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-7 py-2 sm:py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 text-slate-800 transition-all placeholder:text-slate-400"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reset Filters Pill */}
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer whitespace-nowrap text-center"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Single Date Selector (only appears when "Select Date" is active) */}
        {showCustomDateInputs && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3 flex-wrap animate-in fade-in duration-150">
            <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>Select Date:</span>
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleSingleDateChange(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-xl px-3 py-1.5 text-slate-700 focus:bg-white focus:outline-hidden focus:border-orange-500 cursor-pointer transition-all"
            />
            <span className="text-[11px] text-slate-500 font-semibold">
              Showing report for {formatDate(startDate)}
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HERO OVERVIEW PANEL (Compact, Integrated, Elegant) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Hero Revenue Box (Left 4 cols) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Consignment Revenue
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {!startDate && !endDate
                  ? "All Memos"
                  : startDate === endDate
                  ? formatDate(startDate)
                  : `${formatDate(startDate)} - ${formatDate(endDate)}`}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatINR(summary.grandTotal)}
            </div>

            {/* Counts & Split badges */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {summary.totalBookings || 0} Biltys
              </span>
              <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                {summary.totalPackages || 0} Packages
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
              <span className="font-extrabold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                To-Pay: {formatINR(summary.totalToPay)}
              </span>
              <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                Paid: {formatINR(summary.totalPaid)}
              </span>
            </div>
          </div>

          {/* Separated Charges Breakdown Grid (Right 8 cols) */}
          <div className="lg:col-span-8">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Separated Charges Distribution</span>
              <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                Sum of components = Total Revenue
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Freight */}
              <div className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                <div className="text-[10px] font-extrabold text-blue-600 uppercase flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span className="truncate">Freight</span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono">
                  {formatINR(summary.totalFreight)}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {summary.grandTotal > 0
                    ? `${Math.round(((summary.totalFreight || 0) / summary.grandTotal) * 100)}% of total`
                    : "0%"}
                </div>
              </div>

              {/* Hamali */}
              <div className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                <div className="text-[10px] font-extrabold text-amber-600 uppercase flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="truncate">Hamali</span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono">
                  {formatINR(summary.totalHamali)}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Labor fee
                </div>
              </div>

              {/* Crossing */}
              <div className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                <div className="text-[10px] font-extrabold text-purple-600 uppercase flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                  <span className="truncate">Crossing</span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono">
                  {formatINR(summary.totalCrossing)}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Inter-hub
                </div>
              </div>

              {/* Bilty Charge */}
              <div className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                <div className="text-[10px] font-extrabold text-emerald-600 uppercase flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">Bilty Chg</span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono">
                  {formatINR(summary.totalBiltyCharge)}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Doc fee (₹5)
                </div>
              </div>

              {/* Other */}
              <div className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors col-span-2 sm:col-span-1">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                  <span className="truncate">Other</span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono">
                  {formatINR(summary.totalOtherCharges)}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Door / Extra
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DATA SECTION WITH CLEAN SEGMENTED TABS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Table Top Header with View Switcher */}
        <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          {/* Segmented View Mode Tabs */}
          <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto">
            {[
              { key: "MEMO", label: "Memo-Wise", count: memoWise.length },
              { key: "MONTHLY", label: "Monthly", count: monthly.length },
              { key: "WEEKLY", label: "Weekly", count: weekly.length },
              { key: "DETAILED", label: "Consignments Ledger", count: filteredDetailedBookings.length },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                    isActive
                      ? "bg-white text-slate-900 font-black shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isActive ? "bg-slate-100 text-slate-700" : "bg-white/60 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {activeTab === "MEMO" && "Click any memo to inspect child biltys"}
            {activeTab === "MONTHLY" && "Month-by-month financial summary"}
            {activeTab === "WEEKLY" && "ISO calendar week aggregation"}
            {activeTab === "DETAILED" && "Itemized consignment ledger"}
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* TAB 1: MEMO-WISE VIEW */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "MEMO" && (
          <>
            {/* Desktop Table View (hidden on mobile) */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-3 w-8"></th>
                    <th className="p-3">Memo Number</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3 text-center">Biltys</th>
                    <th className="p-3 text-center">Pkgs</th>
                    <th className="p-3 text-right">Freight</th>
                    <th className="p-3 text-right">Hamali</th>
                    <th className="p-3 text-right">Crossing</th>
                    <th className="p-3 text-right">Bilty Chg</th>
                    <th className="p-3 text-right">Other</th>
                    <th className="p-3 text-right font-black text-slate-900">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMemoWise.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="p-8 text-center text-slate-400 font-semibold">
                        No memos found for the selected range and filters.
                      </td>
                    </tr>
                  ) : (
                    filteredMemoWise.map((memo, idx) => {
                      const memoKey = memo.memoId ? String(memo.memoId) : "unassigned";
                      const isExpanded = Boolean(expandedMemos[memoKey]);
                      const childBiltys = detailedByMemo[memoKey] || [];

                      return (
                        <React.Fragment key={memoKey + idx}>
                          <tr
                            onClick={() => toggleMemoExpand(memoKey)}
                            className={`hover:bg-orange-50/40 cursor-pointer transition-colors ${
                              isExpanded ? "bg-orange-50/30" : ""
                            }`}
                          >
                            <td className="p-3 text-slate-400">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-orange-600" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </td>
                            <td className="p-3 font-mono font-black text-slate-800">
                              <span className="text-orange-600 hover:underline">
                                {memo.memoNumber}
                              </span>
                              {memo.memoStatus && (
                                <span className="ml-1.5 text-[9px] uppercase font-bold px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {memo.memoStatus}
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-semibold text-slate-500">
                              {formatDate(memo.memoDate)}
                            </td>
                            <td className="p-3 font-bold text-slate-700">
                              {memo.destinationBranchName || "Unassigned"}
                              {memo.destinationBranchCity && (
                                <span className="text-[10px] text-slate-400 font-normal ml-1">
                                  ({memo.destinationBranchCity})
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center font-extrabold text-slate-700">
                              {memo.totalBookings || 0}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-500">
                              {memo.totalPackages || 0}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-700">
                              {formatINR(memo.totalFreight)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-700">
                              {formatINR(memo.totalHamali)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-700">
                              {formatINR(memo.totalCrossing)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-700">
                              {formatINR(memo.totalBiltyCharge)}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-700">
                              {formatINR(memo.totalOtherCharges)}
                            </td>
                            <td className="p-3 text-right font-mono font-black text-slate-900">
                              {formatINR(memo.totalAmount)}
                            </td>
                          </tr>

                          {/* Inline Expandable Child Consignments */}
                          {isExpanded && (
                            <tr className="bg-slate-50/70 border-b border-orange-100">
                              <td colSpan="12" className="p-3 pl-8">
                                <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
                                  <div className="text-[11px] font-black text-slate-700 uppercase tracking-wide mb-2 flex items-center justify-between">
                                    <span>
                                      Consignments inside {memo.memoNumber} ({childBiltys.length} biltys)
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      Click headers to sort or collapse
                                    </span>
                                  </div>
                                  {childBiltys.length === 0 ? (
                                    <p className="text-xs text-slate-400 font-medium py-2">
                                      No detailed booking records found in memory.
                                    </p>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-[11px] border-collapse">
                                        <thead>
                                          <tr className="border-b border-slate-100 text-slate-400 uppercase font-black text-[9px]">
                                            <th className="py-1.5 px-2">Bilty #</th>
                                            <th className="py-1.5 px-2">Date</th>
                                            <th className="py-1.5 px-2">Sender</th>
                                            <th className="py-1.5 px-2">Receiver</th>
                                            <th className="py-1.5 px-2">Item</th>
                                            <th className="py-1.5 px-2 text-center">Qty</th>
                                            <th className="py-1.5 px-2 text-right">Freight</th>
                                            <th className="py-1.5 px-2 text-right">Hamali</th>
                                            <th className="py-1.5 px-2 text-right">Crossing</th>
                                            <th className="py-1.5 px-2 text-right">Bilty Chg</th>
                                            <th className="py-1.5 px-2 text-right">Other</th>
                                            <th className="py-1.5 px-2 text-right font-bold text-slate-700">Total</th>
                                            <th className="py-1.5 px-2 text-center">Type</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {childBiltys.map((b) => (
                                            <tr key={b._id} className="hover:bg-slate-50">
                                              <td className="py-1.5 px-2 font-mono font-bold text-orange-600">
                                                {b.bookingNumber}
                                              </td>
                                              <td className="py-1.5 px-2 text-slate-500">
                                                {formatDate(b.bookingDate)}
                                              </td>
                                              <td className="py-1.5 px-2 font-medium text-slate-700 truncate max-w-[120px]">
                                                {b.senderName || "-"}
                                              </td>
                                              <td className="py-1.5 px-2 font-bold text-slate-800 truncate max-w-[140px]">
                                                {b.receiverName || "-"}
                                              </td>
                                              <td className="py-1.5 px-2 text-slate-600 truncate max-w-[100px]">
                                                {b.itemName || "-"}
                                              </td>
                                              <td className="py-1.5 px-2 text-center font-bold">
                                                {b.quantity || 1}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono">
                                                {formatINR(b.freight)}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono">
                                                {formatINR(b.hamali)}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono">
                                                {formatINR(b.crossing)}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono">
                                                {formatINR(b.biltyCharge)}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono">
                                                {formatINR(b.otherCharges)}
                                              </td>
                                              <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                                                {formatINR(b.totalAmount)}
                                              </td>
                                              <td className="py-1.5 px-2 text-center">
                                                <span
                                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                                    b.collectionType === "PAID_AT_BOOKING"
                                                      ? "bg-emerald-100 text-emerald-800"
                                                      : "bg-amber-100 text-amber-800"
                                                  }`}
                                                >
                                                  {b.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO-PAY"}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
                {filteredMemoWise.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                      <td colSpan="4" className="p-3 text-right uppercase">
                        Total ({filteredMemoWise.length} Memos):
                      </td>
                      <td className="p-3 text-center">{summary.totalBookings}</td>
                      <td className="p-3 text-center">{summary.totalPackages}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalFreight)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalHamali)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalCrossing)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalBiltyCharge)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalOtherCharges)}</td>
                      <td className="p-3 text-right font-mono text-slate-900 text-sm">
                        {formatINR(summary.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mobile Touch-Friendly Card List (block md:hidden) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredMemoWise.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                  No memos found for the selected range and filters.
                </div>
              ) : (
                filteredMemoWise.map((memo, idx) => {
                  const memoKey = memo.memoId ? String(memo.memoId) : "unassigned";
                  const isExpanded = Boolean(expandedMemos[memoKey]);
                  const childBiltys = detailedByMemo[memoKey] || [];

                  return (
                    <div key={memoKey + idx} className="p-3.5 space-y-2.5 bg-white">
                      {/* Memo Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-black text-sm text-orange-600">
                            {memo.memoNumber}
                          </span>
                          {memo.memoStatus && (
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {memo.memoStatus}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 shrink-0">
                          {formatDate(memo.memoDate)}
                        </span>
                      </div>

                      {/* Destination & Volumes */}
                      <div className="flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-1 font-bold text-slate-700 truncate">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="truncate">{memo.destinationBranchName || "Unassigned"}</span>
                          {memo.destinationBranchCity && (
                            <span className="text-slate-400 font-normal text-[11px] truncate">
                              ({memo.destinationBranchCity})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 shrink-0">
                          <span>{memo.totalBookings || 0} Biltys</span>
                          <span>•</span>
                          <span>{memo.totalPackages || 0} Pkgs</span>
                        </div>
                      </div>

                      {/* 6-stat Micro Charges Grid */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50/80 p-2.5 rounded-xl text-xs font-mono border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Freight</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(memo.totalFreight)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Hamali</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(memo.totalHamali)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Crossing</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(memo.totalCrossing)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Bilty Chg</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(memo.totalBiltyCharge)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Other</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(memo.totalOtherCharges)}</span>
                        </div>
                        <div className="bg-orange-100/70 p-1 rounded-lg text-right">
                          <span className="text-orange-950 font-sans block text-[9px] uppercase font-black">Total</span>
                          <span className="font-black text-orange-600 text-xs">{formatINR(memo.totalAmount)}</span>
                        </div>
                      </div>

                      {/* Toggle Expand Button */}
                      <button
                        type="button"
                        onClick={() => toggleMemoExpand(memoKey)}
                        className="w-full py-2 px-3 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Consignments" : `View ${childBiltys.length} Consignments`}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {/* Child Biltys Mobile Cards */}
                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {childBiltys.map((b) => (
                            <div key={b._id} className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/70 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-black text-orange-600">{b.bookingNumber}</span>
                                <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${b.collectionType === "PAID_AT_BOOKING" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                  {b.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO-PAY"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-700 flex items-center justify-between font-semibold">
                                <span className="truncate max-w-[160px]">{b.senderName} ➔ {b.receiverName}</span>
                                <span className="font-mono font-black text-slate-900">{formatINR(b.totalAmount)}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                                <span>{b.itemName} ({b.quantity}p)</span>
                                <span>•</span>
                                <span>Fr: {formatINR(b.freight)}</span>
                                <span>•</span>
                                <span>Hm: {formatINR(b.hamali)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Mobile Summary Footer Card */}
              {filteredMemoWise.length > 0 && (
                <div className="p-3.5 bg-slate-100/90 border-t-2 border-slate-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-900">
                      Total ({filteredMemoWise.length} Memos)
                    </span>
                    <span className="text-base font-black text-orange-600 font-mono">
                      {formatINR(summary.grandTotal)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono text-slate-700">
                    <div>Biltys: <span className="font-bold">{summary.totalBookings}</span></div>
                    <div>Pkgs: <span className="font-bold">{summary.totalPackages}</span></div>
                    <div>Fr: <span className="font-bold">{formatINR(summary.totalFreight)}</span></div>
                    <div>Hm: <span className="font-bold">{formatINR(summary.totalHamali)}</span></div>
                    <div>Cr: <span className="font-bold">{formatINR(summary.totalCrossing)}</span></div>
                    <div>Doc: <span className="font-bold">{formatINR(summary.totalBiltyCharge)}</span></div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* TAB 2: MONTHLY REPORT */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "MONTHLY" && (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-3">Month / Year</th>
                    <th className="p-3 text-center">Biltys</th>
                    <th className="p-3 text-center">Pkgs</th>
                    <th className="p-3 text-right">Freight</th>
                    <th className="p-3 text-right">Hamali</th>
                    <th className="p-3 text-right">Crossing</th>
                    <th className="p-3 text-right">Bilty Chg</th>
                    <th className="p-3 text-right">Other</th>
                    <th className="p-3 text-right font-black text-slate-900">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthly.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-slate-400 font-semibold">
                        No monthly data available for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    monthly.map((m, idx) => {
                      const monthNum = m._id?.month;
                      const yearNum = m._id?.year;
                      const monthLabel = `${monthFullNames[monthNum] || "Month"} ${yearNum}`;

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-slate-800 flex items-center gap-2">
                            <CalendarRange className="w-3.5 h-3.5 text-orange-500" />
                            <span>{monthLabel}</span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">
                            {m.totalBookings || 0}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">
                            {m.totalPackages || 0}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(m.totalFreight)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(m.totalHamali)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(m.totalCrossing)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(m.totalBiltyCharge)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(m.totalOtherCharges)}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">
                            {formatINR(m.totalAmount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {monthly.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                      <td className="p-3 uppercase">Total ({monthly.length} Months):</td>
                      <td className="p-3 text-center">{summary.totalBookings}</td>
                      <td className="p-3 text-center">{summary.totalPackages}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalFreight)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalHamali)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalCrossing)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalBiltyCharge)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalOtherCharges)}</td>
                      <td className="p-3 text-right font-mono text-slate-900 text-sm">
                        {formatINR(summary.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {monthly.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                  No monthly data available.
                </div>
              ) : (
                monthly.map((m, idx) => {
                  const monthNum = m._id?.month;
                  const yearNum = m._id?.year;
                  const monthLabel = `${monthFullNames[monthNum] || "Month"} ${yearNum}`;
                  return (
                    <div key={idx} className="p-3.5 space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <CalendarRange className="w-3.5 h-3.5 text-orange-500" />
                          {monthLabel}
                        </span>
                        <span className="font-mono font-black text-sm text-orange-600">
                          {formatINR(m.totalAmount)}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                        <span>{m.totalBookings || 0} Biltys</span>
                        <span>•</span>
                        <span>{m.totalPackages || 0} Packages</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-xl text-xs font-mono border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Freight</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(m.totalFreight)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Hamali</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(m.totalHamali)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Crossing</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(m.totalCrossing)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Bilty Chg</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(m.totalBiltyCharge)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Other</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(m.totalOtherCharges)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Avg/Bilty</span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {m.totalBookings > 0 ? formatINR(m.totalAmount / m.totalBookings) : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* TAB 3: WEEKLY REPORT */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "WEEKLY" && (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-3">Week / Date Range</th>
                    <th className="p-3 text-center">Biltys</th>
                    <th className="p-3 text-center">Pkgs</th>
                    <th className="p-3 text-right">Freight</th>
                    <th className="p-3 text-right">Hamali</th>
                    <th className="p-3 text-right">Crossing</th>
                    <th className="p-3 text-right">Bilty Chg</th>
                    <th className="p-3 text-right">Other</th>
                    <th className="p-3 text-right font-black text-slate-900">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {weekly.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-8 text-center text-slate-400 font-semibold">
                        No weekly data available for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    weekly.map((w, idx) => {
                      const weekNum = w._id?.week;
                      const yearNum = w._id?.year;
                      const weekLabel = getIsoWeekDateRangeString(yearNum, weekNum);

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-extrabold text-slate-800 flex items-center gap-2">
                            <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                            <span>{weekLabel}</span>
                          </td>
                          <td className="p-3 text-center font-bold text-slate-700">
                            {w.totalBookings || 0}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-500">
                            {w.totalPackages || 0}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(w.totalFreight)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(w.totalHamali)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(w.totalCrossing)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(w.totalBiltyCharge)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            {formatINR(w.totalOtherCharges)}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">
                            {formatINR(w.totalAmount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {weekly.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                      <td className="p-3 uppercase">Total ({weekly.length} Weeks):</td>
                      <td className="p-3 text-center">{summary.totalBookings}</td>
                      <td className="p-3 text-center">{summary.totalPackages}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalFreight)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalHamali)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalCrossing)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalBiltyCharge)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalOtherCharges)}</td>
                      <td className="p-3 text-right font-mono text-slate-900 text-sm">
                        {formatINR(summary.grandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {weekly.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                  No weekly data available.
                </div>
              ) : (
                weekly.map((w, idx) => {
                  const weekNum = w._id?.week;
                  const yearNum = w._id?.year;
                  const weekLabel = getIsoWeekDateRangeString(yearNum, weekNum);
                  return (
                    <div key={idx} className="p-3.5 space-y-2 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                          {weekLabel}
                        </span>
                        <span className="font-mono font-black text-sm text-orange-600">
                          {formatINR(w.totalAmount)}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                        <span>{w.totalBookings || 0} Biltys</span>
                        <span>•</span>
                        <span>{w.totalPackages || 0} Packages</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-xl text-xs font-mono border border-slate-100">
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Freight</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(w.totalFreight)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Hamali</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(w.totalHamali)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Crossing</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(w.totalCrossing)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Bilty Chg</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(w.totalBiltyCharge)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Other</span>
                          <span className="font-bold text-slate-800 text-[11px]">{formatINR(w.totalOtherCharges)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Avg/Bilty</span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {w.totalBookings > 0 ? formatINR(w.totalAmount / w.totalBookings) : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* TAB 4: ALL CONSIGNMENTS LEDGER */}
        {/* --------------------------------------------------------------------- */}
        {activeTab === "DETAILED" && (
          <>
            {/* Desktop Table View */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="p-3">Bilty #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Memo #</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Sender</th>
                    <th className="p-3">Receiver</th>
                    <th className="p-3">Item (Qty)</th>
                    <th className="p-3 text-right">Freight</th>
                    <th className="p-3 text-right">Hamali</th>
                    <th className="p-3 text-right">Crossing</th>
                    <th className="p-3 text-right">Bilty</th>
                    <th className="p-3 text-right">Other</th>
                    <th className="p-3 text-right font-black text-slate-900">Total (₹)</th>
                    <th className="p-3 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDetailedBookings.length === 0 ? (
                    <tr>
                      <td colSpan="14" className="p-8 text-center text-slate-400 font-semibold">
                        No consignment bookings match the current search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDetailedBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-black text-orange-600">
                          {b.bookingNumber}
                        </td>
                        <td className="p-3 font-semibold text-slate-500">
                          {formatDate(b.bookingDate)}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-600">
                          {b.memoNumber !== "-" ? (
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {b.memoNumber}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">None</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-700">
                          {b.destinationBranchName || "-"}
                        </td>
                        <td className="p-3 font-medium text-slate-700 truncate max-w-[120px]">
                          {b.senderName || "-"}
                        </td>
                        <td className="p-3 font-bold text-slate-800 truncate max-w-[140px]">
                          {b.receiverName || "-"}
                        </td>
                        <td className="p-3 text-slate-600">
                          <span className="font-semibold">{b.itemName || "Consignment"}</span>{" "}
                          <span className="text-[10px] text-slate-400 font-bold">
                            ({b.quantity || 1} p)
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700">
                          {formatINR(b.freight)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700">
                          {formatINR(b.hamali)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700">
                          {formatINR(b.crossing)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700">
                          {formatINR(b.biltyCharge)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-700">
                          {formatINR(b.otherCharges)}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-900">
                          {formatINR(b.totalAmount)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              b.collectionType === "PAID_AT_BOOKING"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO-PAY"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredDetailedBookings.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100/90 font-black text-slate-900 border-t-2 border-slate-300">
                      <td colSpan="7" className="p-3 text-right uppercase">
                        Total ({filteredDetailedBookings.length} Consignments):
                      </td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalFreight)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalHamali)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalCrossing)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalBiltyCharge)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(summary.totalOtherCharges)}</td>
                      <td className="p-3 text-right font-mono text-slate-900 text-sm">
                        {formatINR(summary.grandTotal)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredDetailedBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                  No consignments found for the selected filters.
                </div>
              ) : (
                filteredDetailedBookings.map((b) => (
                  <div key={b._id} className="p-3.5 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-orange-600">
                        {b.bookingNumber}
                      </span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${b.collectionType === "PAID_AT_BOOKING" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {b.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO-PAY"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 flex items-center justify-between font-bold">
                      <span className="truncate max-w-[180px]">{b.senderName} ➔ {b.receiverName}</span>
                      <span className="font-mono font-black text-slate-900">{formatINR(b.totalAmount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{formatDate(b.bookingDate)} • Memo: {b.memoNumber || "None"}</span>
                      <span className="font-medium">To: {b.destinationBranchName || "-"}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded-xl text-xs font-mono border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Item</span>
                        <span className="font-bold text-slate-700 text-[10px] truncate block">{b.itemName || "-"} ({b.quantity}p)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Freight</span>
                        <span className="font-bold text-slate-800 text-[11px]">{formatINR(b.freight)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Hamali</span>
                        <span className="font-bold text-slate-800 text-[11px]">{formatINR(b.hamali)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Crossing</span>
                        <span className="font-bold text-slate-800 text-[11px]">{formatINR(b.crossing)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Bilty Chg</span>
                        <span className="font-bold text-slate-800 text-[11px]">{formatINR(b.biltyCharge)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-sans block text-[9px] uppercase font-bold">Other</span>
                        <span className="font-bold text-slate-800 text-[11px]">{formatINR(b.otherCharges)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
