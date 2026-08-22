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
      // 1. Search text (Booking Number, Shop Name / Owner Name, From / To Route, Delivery Address, Item)
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

  return (
    <div className="min-h-screen bg-slate-50 p-3.5 md:p-5 font-sans antialiased selection:bg-orange-100 printable-area select-none space-y-4">
      {/* Hidden Bulk Printer Component */}
      <BulkBiltyPrinter
        ref={bulkPrinterRef}
        selectedBookings={selectedBookingsList}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${toast.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-sky-50 text-sky-800 border-sky-200"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-sky-600 shrink-0" />
          )}
          <span className="text-xs md:text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* Page Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-slate-800 tracking-tight">
                Bookings List
              </h1>

              {selectedIds.length > 0 && (
                <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-orange-600" />
                  {selectedIds.length} Selected
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {kpiMetrics.totalCount} bookings · {kpiMetrics.todayCount} today ·{" "}
              {formatKpiCurrency(kpiMetrics.toPayTotal)} to pay
            </p>
          </div>
        </div>


        {/* Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Refresh */}
          <button
            type="button"
            onClick={loadBookings}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 bg-white rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-orange-500" : ""}`} />
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Export CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {/* Print Selected Bulk Bilty Button */}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handlePrintSelected}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100 shadow-xs transition-all cursor-pointer"
              title={`Print ${selectedIds.length} Selected Bilty Documents`}
            >
              <Printer className="w-4 h-4 text-orange-600" />
              <span>Print Selected ({selectedIds.length})</span>
            </button>
          )}

          {/* Primary Action: + New Booking */}
          {user?.branch?.type === "BOOKING" && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.BOOKINGS.NEW)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm select-none cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Booking</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        {/* Card 1: Total Bookings */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Bookings
            </span>
            <span className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 block">
              {kpiMetrics.totalCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Today's Bookings */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Today's Bookings
            </span>
            <span className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 block">
              {kpiMetrics.todayCount}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Calendar className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: To Pay Total */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              To Pay
            </span>
            <span className="text-xl md:text-2xl font-black text-amber-600 mt-0.5 block">
              {formatKpiCurrency(kpiMetrics.toPayTotal)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Paid Total */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Paid
            </span>
            <span className="text-xl md:text-2xl font-black text-emerald-600 mt-0.5 block">
              {formatKpiCurrency(kpiMetrics.paidTotal)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {displayError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold no-print">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{typeof displayError === "string" ? displayError : "An error occurred"}</span>
        </div>
      )}

      {/* Filter Section */}
      <div className="no-print">
        <BookingFilters
          filters={filters}
          onChange={setFilters}
          onSearch={loadBookings}
          onReset={handleResetFilters}
        />
      </div>

      {/* Booking Table Section */}
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
