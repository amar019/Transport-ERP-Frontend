import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  CheckSquare,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";
import DeliveryKPICards from "@/components/delivery/DeliveryKPICards";
import DeliveryFilters from "@/components/delivery/DeliveryFilters";
import DeliveryTable from "@/components/delivery/DeliveryTable";
import AssignDeliveryBoyModal from "@/components/delivery/AssignDeliveryBoyModal";
import CounterDeliveryModal from "@/components/delivery/CounterDeliveryModal";
import MarkDeliveredModal from "@/components/delivery/MarkDeliveredModal";
import MarkFailedModal from "@/components/delivery/MarkFailedModal";
import CollectPaymentModal from "@/components/delivery/CollectPaymentModal";
import DeliveryDetailsModal from "@/components/delivery/DeliveryDetailsModal";

import {
  getDeliveryBookings,
  assignDeliveryBoy,
  counterDelivery,
  markDelivered,
  markDeliveryFailed,
  collectCustomerPayment,
} from "@/services/deliveryBooking.service";

export const DeliveryPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const branchType = user?.branch?.type || user?.branchType;

  const [rawBookings, setRawBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Selection State for Bulk Operations
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    paymentStatus: "ALL",
    startDate: "",
    endDate: "",
  });

  // Active Modals State
  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'counter' | 'deliver' | 'fail' | 'collect' | 'details'
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Toast Helper
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch Delivery Bookings
  const loadDeliveryBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDeliveryBookings();
      const bookingsList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setRawBookings(bookingsList);
    } catch (err) {
      console.error("Error loading delivery bookings:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load delivery bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveryBookings();
  }, [loadDeliveryBookings]);

  // Client-side Filter Logic
  const filteredBookings = useMemo(() => {
    if (!Array.isArray(rawBookings)) return [];

    return rawBookings.filter((b) => {
      // 1. Search Query
      const q = (filters.search || "").toLowerCase().trim();
      const bookingNo = (b.bookingNumber || b._id || "").toLowerCase();
      const shopName = (b.customer?.shopName || b.customer?.name || "").toLowerCase();
      const ownerName = (b.customer?.ownerName || "").toLowerCase();
      const deliveryBoyName = (b.delivery?.deliveryBoy?.name || "").toLowerCase();
      const deliveryAddress = (b.deliveryAddress || "").toLowerCase();
      const itemName = (b.itemName || "").toLowerCase();

      const matchSearch =
        !q ||
        bookingNo.includes(q) ||
        shopName.includes(q) ||
        ownerName.includes(q) ||
        deliveryBoyName.includes(q) ||
        deliveryAddress.includes(q) ||
        itemName.includes(q);

      // 2. Status Match
      const rawStatus = b.delivery?.status || b.deliveryStatus || b.status || "PENDING";
      const deliveryStatus = rawStatus === "BOOKED" ? "PENDING" : rawStatus;

      let matchStatus = true;
      if (filters.status !== "ALL") {
        if (filters.status === "PENDING") {
          matchStatus = deliveryStatus === "PENDING" || deliveryStatus === "BOOKED";
        } else {
          matchStatus = deliveryStatus === filters.status;
        }
      }

      // 3. Payment Status Match
      let matchPaymentStatus = true;
      if (filters.paymentStatus !== "ALL") {
        matchPaymentStatus = b.paymentStatus === filters.paymentStatus;
      }

      // 4. Date Range
      let matchDate = true;
      const bTime = new Date(b.bookingDate || b.createdAt).getTime();
      if (filters.startDate) {
        const start = new Date(filters.startDate).setHours(0, 0, 0, 0);
        if (bTime < start) matchDate = false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
        if (bTime > end) matchDate = false;
      }

      return matchSearch && matchStatus && matchPaymentStatus && matchDate;
    });
  }, [rawBookings, filters]);

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

  // KPI Metrics Calculation
  const kpiMetrics = useMemo(() => {
    let total = rawBookings.length;
    let pending = 0;
    let outForDelivery = 0;
    let delivered = 0;
    let failed = 0;
    let totalCollected = 0;

    rawBookings.forEach((b) => {
      const rawSt = b.delivery?.status || b.deliveryStatus || b.status || "PENDING";
      const st = rawSt === "BOOKED" ? "PENDING" : rawSt;

      if (st === "PENDING") pending++;
      else if (st === "OUT_FOR_DELIVERY") outForDelivery++;
      else if (st === "DELIVERED") delivered++;
      else if (st === "FAILED") failed++;

      totalCollected += Number(b.paidAmount || 0);
    });

    return {
      total,
      pending,
      outForDelivery,
      delivered,
      failed,
      totalCollected,
    };
  }, [rawBookings]);

  // Segmented Control Status Tabs
  const statusTabs = [
    { label: "All Deliveries", value: "ALL", count: kpiMetrics.total },
    { label: "Pending", value: "PENDING", count: kpiMetrics.pending },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY", count: kpiMetrics.outForDelivery },
    { label: "Delivered", value: "DELIVERED", count: kpiMetrics.delivered },
    { label: "Failed", value: "FAILED", count: kpiMetrics.failed },
  ];

  // Action Handlers
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      paymentStatus: "ALL",
      startDate: "",
      endDate: "",
    });
  };

  const handleOpenModal = (modalType, booking) => {
    setSelectedBooking(booking);
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedBooking(null);
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredBookings.length === 0) {
      showToast("No delivery data to export", "info");
      return;
    }

    const headers = [
      "LR Number",
      "Booking Date",
      "Customer",
      "Delivery Address",
      "Delivery Boy",
      "Delivery Status",
      "Total Amount",
      "Paid Amount",
      "Remaining",
      "Payment Status",
    ];

    const rows = filteredBookings.map((b) => {
      const remaining = Number(
        b.remainingAmount ?? (Number(b.totalAmount || 0) - Number(b.paidAmount || 0))
      );
      return [
        `"${b.bookingNumber || ""}"`,
        `"${b.bookingDate ? new Date(b.bookingDate).toLocaleDateString("en-IN") : ""}"`,
        `"${b.customer?.shopName || b.customer?.name || ""}"`,
        `"${b.deliveryAddress || ""}"`,
        `"${b.delivery?.deliveryBoy?.name || "Counter Pickup"}"`,
        `"${b.delivery?.status || b.status || "PENDING"}"`,
        b.totalAmount || 0,
        b.paidAmount || 0,
        remaining,
        `"${b.paymentStatus || "PENDING"}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Deliveries_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Deliveries exported to CSV", "success");
  };

  // 1. Assign Delivery Boy
  const handleAssignBoy = async (bookingId, deliveryBoyId) => {
    await assignDeliveryBoy(bookingId, deliveryBoyId);
    showToast("Delivery boy assigned & parcel set out for delivery");
    loadDeliveryBookings();
  };

  // 2. Counter Delivery
  const handleCounterDeliver = async (bookingId, payload) => {
    await counterDelivery(bookingId, payload);
    showToast("Counter delivery completed successfully");
    loadDeliveryBookings();
  };

  // 3. Mark Delivered
  const handleDeliver = async (bookingId, payload) => {
    await markDelivered(bookingId, payload);
    showToast("Booking marked as delivered successfully");
    loadDeliveryBookings();
  };

  // 4. Mark Failed
  const handleFail = async (bookingId, payload) => {
    await markDeliveryFailed(bookingId, payload);
    showToast("Delivery marked as failed", "error");
    loadDeliveryBookings();
  };

  // 5. Collect Payment
  const handleCollect = async (bookingId, payload) => {
    await collectCustomerPayment(bookingId, payload);
    showToast("Customer payment collected & ledger updated");
    loadDeliveryBookings();
  };

  // Branch Access Restriction View
  if (branchType === "BOOKING") {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto my-12 text-center space-y-6 select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#0F172A]">
            Delivery Operations Access Restricted
          </h2>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Delivery management operations are available exclusively for <strong className="text-[#0F172A]">DELIVERY</strong> branches. Your current branch ({user?.branch?.name || "Logged-in Branch"}) is registered as a <strong className="text-[#D97706]">BOOKING</strong> branch.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Bookings
          </button>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="px-4 py-2.5 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] printable-area select-none space-y-6">
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
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Operations</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Delivery Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="!text-xl !my-0 font-bold text-[#0F172A] tracking-tight leading-snug">
              Delivery Management
            </h1>

            {selectedIds.length > 0 && (
              <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
                <CheckSquare className="w-3 h-3 text-[#F97316]" />
                {selectedIds.length} Selected
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Manage parcel dispatch, delivery boy assignments, counter pickup, and customer COD collections
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadDeliveryBookings}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Deliveries"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>

          {/* Export Excel / CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Export Deliveries to CSV/Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between text-[#DC2626] text-xs font-medium no-print">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDeliveryBookings}
            className="font-semibold underline hover:text-[#B91C1C] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATISTICS CARDS SECTION */}
      <DeliveryKPICards metrics={kpiMetrics} />

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

      {/* Filter Controls Section */}
      <div className="no-print">
        <DeliveryFilters
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Main Enterprise Data Table */}
      <DeliveryTable
        bookings={filteredBookings}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewDetails={(b) => handleOpenModal("details", b)}
        onAssignBoy={(b) => handleOpenModal("assign", b)}
        onCounterDeliver={(b) => handleOpenModal("counter", b)}
        onMarkDelivered={(b) => handleOpenModal("deliver", b)}
        onMarkFailed={(b) => handleOpenModal("fail", b)}
        onCollectPayment={(b) => handleOpenModal("collect", b)}
      />

      {/* Modal Dialogs */}
      <AssignDeliveryBoyModal
        isOpen={activeModal === "assign"}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onAssign={handleAssignBoy}
      />

      <CounterDeliveryModal
        isOpen={activeModal === "counter"}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onCounterDeliver={handleCounterDeliver}
      />

      <MarkDeliveredModal
        isOpen={activeModal === "deliver"}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onDeliver={handleDeliver}
      />

      <MarkFailedModal
        isOpen={activeModal === "fail"}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onFail={handleFail}
      />

      <CollectPaymentModal
        isOpen={activeModal === "collect"}
        onClose={handleCloseModal}
        booking={selectedBooking}
        onCollect={handleCollect}
      />

      <DeliveryDetailsModal
        isOpen={activeModal === "details"}
        onClose={handleCloseModal}
        booking={selectedBooking}
      />
    </div>
  );
};

export default DeliveryPage;
