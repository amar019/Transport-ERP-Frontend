import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertCircle,
  Info,
  CheckSquare,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import BookingFilters from "@/components/booking/BookingFilters";
import BookingTable from "@/components/booking/BookingTable";
import BulkBiltyPrinter from "@/components/booking/BulkBiltyPrinter";
import {
  fetchBookings,
  cancelBookingThunk,
  deleteBookingThunk,
} from "@/store/slices/bookingSlice";
import { ROUTES } from "@/constants/paths";

export const BookingListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { user } = useSelector((state) => state.auth);
  const { list: rawBookings, isLoading, error: reduxError } = useSelector(
    (state) => state.bookings
  );

  // Local Toast & Error State
  const [toast, setToast] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Selection State for Bulk Printing
  const [selectedIds, setSelectedIds] = useState([]);
  const bulkPrinterRef = useRef(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    paymentStatus: "ALL",
    collectionType: "ALL",
    startDate: "",
    endDate: "",
  });

  // Helper for Toast alerts
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch Bookings Data
  const loadBookings = useCallback(async () => {
    try {
      setLocalError(null);
      await dispatch(fetchBookings()).unwrap();
    } catch (err) {
      console.error("Error loading bookings:", err);
      setLocalError(typeof err === "string" ? err : "Failed to load bookings");
    }
  }, [dispatch]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Client-side Filter Logic
  const filteredBookings = useMemo(() => {
    if (!Array.isArray(rawBookings)) return [];

    return rawBookings.filter((b) => {
      // 1. Search text
      const q = (filters.search || "").toLowerCase().trim();
      const bookingNo = (b.bookingNumber || "").toLowerCase();
      const shopName = (b.customer?.shopName || (typeof b.customer === "string" ? b.customer : "")).toLowerCase();
      const ownerName = (b.customer?.ownerName || "").toLowerCase();
      const fromLoc = (b.from || "").toLowerCase();
      const toLoc = (b.to || "").toLowerCase();
      const deliveryAddress = (b.deliveryAddress || "").toLowerCase();
      const itemName = (b.itemName || "").toLowerCase();

      const matchSearch =
        !q ||
        bookingNo.includes(q) ||
        shopName.includes(q) ||
        ownerName.includes(q) ||
        fromLoc.includes(q) ||
        toLoc.includes(q) ||
        (b.fromBranch?.name || "").toLowerCase().includes(q) ||
        (b.toBranch?.name || "").toLowerCase().includes(q) ||
        deliveryAddress.includes(q) ||
        itemName.includes(q);

      // 2. Booking Status
      let matchStatus = true;
      if (filters.status !== "ALL") {
        matchStatus = b.status === filters.status;
      }

      // 3. Payment Status
      let matchPaymentStatus = true;
      if (filters.paymentStatus !== "ALL") {
        matchPaymentStatus = b.paymentStatus === filters.paymentStatus;
      }

      // 4. Collection Type
      let matchCollectionType = true;
      if (filters.collectionType !== "ALL") {
        matchCollectionType = b.collectionType === filters.collectionType;
      }

      // 5. Date Range match
      let matchDate = true;
      const bookingTime = new Date(b.bookingDate || b.createdAt).getTime();
      if (filters.startDate) {
        const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
        if (bookingTime < start) matchDate = false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
        if (bookingTime > end) matchDate = false;
      }

      return (
        matchSearch &&
        matchStatus &&
        matchPaymentStatus &&
        matchCollectionType &&
        matchDate
      );
    });
  }, [rawBookings, filters]);

  // Dynamic KPI Summary Metrics Calculation
  const kpiMetrics = useMemo(() => {
    if (!Array.isArray(rawBookings)) {
      return { totalCount: 0, todayCount: 0, toPayTotal: 0, paidTotal: 0 };
    }

    const todayStr = new Date().toDateString();

    let totalCount = rawBookings.length;
    let todayCount = 0;
    let toPayTotal = 0;
    let paidTotal = 0;

    rawBookings.forEach((b) => {
      const bDate = b.bookingDate || b.createdAt;
      if (bDate && new Date(bDate).toDateString() === todayStr) {
        todayCount++;
      }

      const amount = Number(b.totalAmount || 0);

      if (b.collectionType === "TO_PAY" && b.status !== "CANCELLED") {
        toPayTotal += amount;
      }

      if (
        (b.collectionType === "PAID_AT_BOOKING" || b.paymentStatus === "PAID") &&
        b.status !== "CANCELLED"
      ) {
        paidTotal += amount;
      }
    });

    return { totalCount, todayCount, toPayTotal, paidTotal };
  }, [rawBookings]);

  // Selected Booking Objects for Bulk Print
  const selectedBookingsList = useMemo(() => {
    return filteredBookings.filter((b) => selectedIds.includes(b._id || b.id));
  }, [filteredBookings, selectedIds]);

  // Selection Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const allFilteredIds = filteredBookings.map((b) => b._id || b.id);
    if (selectedIds.length === allFilteredIds.length && allFilteredIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      paymentStatus: "ALL",
      collectionType: "ALL",
      startDate: "",
      endDate: "",
    });
  };

  // Cancel Booking Handler
  const handleCancelBooking = async (id) => {
    try {
      await dispatch(cancelBookingThunk(id)).unwrap();
      showToast("Booking cancelled successfully", "success");
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      showToast(typeof err === "string" ? err : "Failed to cancel booking", "error");
    }
  };

  // Delete Booking Handler
  const handleDeleteBooking = async (id) => {
    try {
      await dispatch(deleteBookingThunk(id)).unwrap();
      showToast("Booking deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete booking:", err);
      showToast(typeof err === "string" ? err : "Failed to delete booking", "error");
    }
  };

  // Export to Excel / CSV
  const handleExportCsv = () => {
    if (filteredBookings.length === 0) {
      showToast("No data to export", "info");
      return;
    }

    const headers = [
      "Booking No",
      "Date",
      "Customer",
      "Delivery Address",
      "Item",
      "Qty",
      "Total Amount",
      "Collection Type",
      "Payment Status",
      "Booking Status",
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.bookingNumber || ""}"`,
      `"${b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN") : ""}"`,
      `"${b.customer?.shopName || (typeof b.customer === "string" ? b.customer : "")}"`,
      `"${b.deliveryAddress || ""}"`,
      `"${b.itemName || ""}"`,
      b.quantity || 1,
      b.totalAmount || 0,
      `"${b.collectionType || ""}"`,
      `"${b.paymentStatus || ""}"`,
      `"${b.status || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bookings_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Bookings exported to CSV", "success");
  };

  // Bulk Print Trigger Handler
  const handlePrintSelected = () => {
    if (selectedIds.length === 0) {
      showToast("Please select at least one booking to print", "info");
      return;
    }
    if (bulkPrinterRef.current) {
      bulkPrinterRef.current.print();
    }
  };

  // Currency format helper for KPI
  const formatKpiCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const displayError = localError || reduxError;

  // Quick Status Tab Switch Options
  const statusTabs = [
    { label: "All Bookings", value: "ALL", count: rawBookings?.length || 0 },
    {
      label: "Active",
      value: "BOOKED",
      count: rawBookings?.filter((b) => b.status === "BOOKED" || !b.status).length || 0,
    },
    {
      label: "Delivered",
      value: "DELIVERED",
      count: rawBookings?.filter((b) => b.status === "DELIVERED").length || 0,
    },
    {
      label: "Cancelled",
      value: "CANCELLED",
      count: rawBookings?.filter((b) => b.status === "CANCELLED").length || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] printable-area select-none space-y-6">
      {/* Hidden Bulk Printer Component */}
      <BulkBiltyPrinter
        ref={bulkPrinterRef}
        selectedBookings={selectedBookingsList}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
              : toast.type === "error"
              ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
              : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[#2563EB] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        {/* Left: Breadcrumbs + Title + Subtitle */}
        <div className="space-y-1">
          {/* Small Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Bookings</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
              Bookings
            </h1>

            {selectedIds.length > 0 && (
              <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
                <CheckSquare className="w-3 h-3 text-[#F97316]" />
                {selectedIds.length} Selected
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Manage and track all transport bookings
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadBookings}
            disabled={isLoading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>

          {/* Export Excel / CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Export Bookings to CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {/* Print Selected Bulk Bilty Button */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handlePrintSelected}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5] hover:bg-[#FFEDD5] shadow-2xs transition-colors cursor-pointer animate-in fade-in"
              title={`Print ${selectedIds.length} Selected Bilty Documents`}
            >
              <Printer className="w-4 h-4 text-[#F97316]" />
              <span>Print Selected ({selectedIds.length})</span>
            </button>
          )}

          {/* Primary Action: + New Booking */}
          {user?.branch?.type === "BOOKING" && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.BOOKINGS.NEW)}
              className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Booking</span>
            </button>
          )}
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Card 1: Total Bookings */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiMetrics.totalCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Lifetime consignments
            </span>
          </div>
        </div>

        {/* Card 2: Today's Bookings */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Today's Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiMetrics.todayCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Created today
            </span>
          </div>
        </div>

        {/* Card 3: Pending Collection */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Pending Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatKpiCurrency(kpiMetrics.toPayTotal)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              To pay at delivery
            </span>
          </div>
        </div>

        {/* Card 4: Paid Amount */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Paid Amount
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatKpiCurrency(kpiMetrics.paidTotal)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Settled at booking
            </span>
          </div>
        </div>
      </div>

      {/* SEGMENTED CONTROL STATUS TABS */}
      <div className="no-print">
        <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1 overflow-x-auto">
          {statusTabs.map((tab) => {
            const isTabActive = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: tab.value }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  isTabActive
                    ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isTabActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/70 text-[#475569]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {displayError && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-3 text-[#DC2626] text-xs font-medium no-print">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
          <span>{typeof displayError === "string" ? displayError : "An error occurred while loading bookings."}</span>
        </div>
      )}

      {/* Filter Form Controls Section */}
      <div className="no-print">
        <BookingFilters
          filters={filters}
          onChange={setFilters}
          onSearch={loadBookings}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Enterprise Data Table */}
      <BookingTable
        bookings={filteredBookings}
        loading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onCancelSuccess={handleCancelBooking}
        onDeleteSuccess={handleDeleteBooking}
        showToast={showToast}
      />
    </div>
  );
};

export default BookingListPage;
