import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  Package,
  Truck,
  DollarSign,
  Receipt,
  MapPin,
  Building2,
  ShieldCheck,
  Download,
  Search,
  ArrowRight,
  CheckCircle2,
  Layers,
  Sparkles,
  Filter,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";
import { getBookings, downloadBookingPdf } from "@/services/booking.service";
import { getMemos } from "@/services/memo.service";
import { getExpenses } from "@/services/expense.service";
import { formatDate } from "@/utils/formatters";

export const BookingDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Timeframe selector state: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM_MONTH'
  const [period, setPeriod] = useState("TODAY");

  // Custom Month State format "YYYY-MM" (e.g. "2026-08")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  // Raw API Data states
  const [bookings, setBookings] = useState([]);
  const [memos, setMemos] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Loading & refresh states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Safely extract array from API responses
  const extractArray = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  // Main data fetch function
  const loadDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [bookingsRes, memosRes, expensesRes] = await Promise.allSettled([
        getBookings(),
        getMemos(),
        getExpenses(),
      ]);

      if (bookingsRes.status === "fulfilled") {
        setBookings(extractArray(bookingsRes.value));
      }
      if (memosRes.status === "fulfilled") {
        setMemos(extractArray(memosRes.value));
      }
      if (expensesRes.status === "fulfilled") {
        setExpenses(extractArray(expensesRes.value));
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // 60-Second background auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      loadDashboardData(false);
    }, 60000);
    return () => clearInterval(timer);
  }, [loadDashboardData]);

  // Date filtering helper
  const isDateInPeriod = useCallback((dateInput, targetPeriod) => {
    if (!dateInput) return false;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return false;

    const now = new Date();

    if (targetPeriod === "TODAY") {
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }

    if (targetPeriod === "THIS_WEEK") {
      const dayOfWeek = now.getDay();
      const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - distanceToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek;
    }

    if (targetPeriod === "THIS_MONTH") {
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }

    if (targetPeriod === "CUSTOM_MONTH") {
      if (!selectedMonth) return true;
      const [targetYear, targetMonth] = selectedMonth.split("-").map(Number);
      return (
        d.getFullYear() === targetYear &&
        d.getMonth() + 1 === targetMonth
      );
    }

    return true;
  }, [selectedMonth]);

  // Period Label helper
  const periodLabel = useMemo(() => {
    switch (period) {
      case "THIS_WEEK":
        return "This Week";
      case "THIS_MONTH":
        return "This Month";
      case "CUSTOM_MONTH": {
        if (!selectedMonth) return "Custom Month";
        const [yr, mo] = selectedMonth.split("-");
        const dt = new Date(Number(yr), Number(mo) - 1, 1);
        return dt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
      case "TODAY":
      default:
        return "Today";
    }
  }, [period, selectedMonth]);

  // Filtered Datasets based on selected Timeframe Period
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => isDateInPeriod(b.bookingDate || b.createdAt, period));
  }, [bookings, isDateInPeriod, period]);

  const filteredMemos = useMemo(() => {
    return memos.filter((m) => isDateInPeriod(m.memoDate || m.createdAt, period));
  }, [memos, isDateInPeriod, period]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isDateInPeriod(e.expenseDate || e.createdAt, period));
  }, [expenses, isDateInPeriod, period]);

  // 1. Pending Dispatch Queue (ALWAYS LIVE - un-memoed bookings regardless of period)
  const pendingDispatchBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.status !== "CANCELLED" && (!b.memo || b.memo === null)
    );
  }, [bookings]);

  // 2. Computed KPI Metrics
  const kpiStats = useMemo(() => {
    // Bookings KPI
    const bookingsCount = filteredBookings.length;
    const totalFreightAmount = filteredBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );

    // Pending Dispatch KPI (Always live unassigned queue)
    const pendingCount = pendingDispatchBookings.length;
    const pendingValue = pendingDispatchBookings.reduce(
      (sum, b) => sum + Number(b.totalAmount || 0),
      0
    );

    // Memos Dispatched KPI
    const memosCount = filteredMemos.length;
    const memosTotalValue = filteredMemos.reduce(
      (sum, m) => sum + Number(m.totalMoney || m.totalAmount || 0),
      0
    );

    // Cash Collected KPI (Upfront Cash at booking: PAID_AT_BOOKING + paidAmount)
    const cashCollected = filteredBookings.reduce((sum, b) => {
      if (b.collectionType === "PAID_AT_BOOKING") {
        return sum + Number(b.totalAmount || 0);
      }
      return sum + Number(b.paidAmount || 0);
    }, 0);

    const toPayPending = filteredBookings.reduce((sum, b) => {
      if (b.collectionType === "TO_PAY") {
        return sum + Number(b.remainingAmount !== undefined ? b.remainingAmount : b.totalAmount || 0);
      }
      return sum;
    }, 0);

    // Today's / Period Expenses KPI
    const totalExpensesAmount = filteredExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    return {
      bookingsCount,
      totalFreightAmount,
      pendingCount,
      pendingValue,
      memosCount,
      memosTotalValue,
      cashCollected,
      toPayPending,
      totalExpensesAmount,
    };
  }, [filteredBookings, pendingDispatchBookings, filteredMemos, filteredExpenses]);

  // Search filtered table of recent bookings
  const searchedBookings = useMemo(() => {
    if (!searchQuery.trim()) return filteredBookings.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return filteredBookings.filter(
      (b) =>
        b.bookingNumber?.toLowerCase().includes(q) ||
        b.customer?.shopName?.toLowerCase().includes(q) ||
        b.customer?.ownerName?.toLowerCase().includes(q) ||
        b.toBranch?.name?.toLowerCase().includes(q) ||
        b.itemName?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [filteredBookings, searchQuery]);

  // Currency format helper for KPI (matching BookingListPage.jsx)
  const formatKpiCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-6">

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        {/* Left: Breadcrumbs + Title + Subtitle */}
        <div className="space-y-1">
          {/* Small Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Booking Branch</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="!text-xl !my-0 font-bold text-[#0F172A] tracking-tight leading-snug">
              Dashboard
            </h1>
            <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Building2 className="w-3.5 h-3.5 text-[#F97316]" />
              {user?.branch?.name || "Booking Branch"}
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Real-time operational overview for booking creation, warehouse queue, dispatches, and cash collections
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          {/* Refresh Button & Status */}
          <div className="flex items-center gap-2">
            {isRefreshing && (
              <span className="text-xs font-semibold text-[#F97316] animate-pulse flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Refreshing...
              </span>
            )}
            <button
              type="button"
              onClick={() => loadDashboardData(false)}
              disabled={isRefreshing}
              className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#F97316]" : ""}`} />
            </button>
          </div>

          {/* Quick Action: Create Dispatch Memo */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.MEMOS.NEW)}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold px-3.5 py-2 rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#F97316]" />
            <span className="hidden sm:inline">Create Memo</span>
          </button>

          {/* Quick Action: Log Expense */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.FINANCE.EXPENSES)}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold px-3.5 py-2 rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-[#64748B]" />
            <span className="hidden sm:inline">Log Expense</span>
          </button>

          {/* Primary Action: + New Booking */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.BOOKINGS.NEW)}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* TIMEFRAME SELECTOR (SEGMENTED CONTROL TABS + CUSTOM MONTH PICKER) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex flex-wrap items-center gap-1">

            <button
              type="button"
              onClick={() => setPeriod("TODAY")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${period === "TODAY"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPeriod("THIS_WEEK")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${period === "THIS_WEEK"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setPeriod("THIS_MONTH")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${period === "THIS_MONTH"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPeriod("CUSTOM_MONTH")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${period === "CUSTOM_MONTH"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Select Month</span>
            </button>
          </div>

          {/* Render Month Input Picker if CUSTOM_MONTH selected */}
          {period === "CUSTOM_MONTH" && (
            <div className="flex items-center gap-2 bg-[#FFF7ED] border border-[#FFEDD5] px-2.5 py-1 rounded-lg">
              <span className="text-xs font-semibold text-[#C2410C]">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded px-2 py-0.5 text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          )}
        </div>

        {/* Selected Period Badge Indicator */}
        <div className="text-xs text-[#64748B] font-medium flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
          <span>Filtered Window: <strong className="text-[#0F172A] font-semibold">{periodLabel}</strong></span>
        </div>
      </div>

      {/* KPI METRICS GRID (6 TILES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* KPI 1: Total Bookings Created */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Bookings Created
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiStats.bookingsCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5 truncate">
              Total Freight: <strong className="text-[#0F172A] font-medium">{formatKpiCurrency(kpiStats.totalFreightAmount)}</strong>
            </span>
          </div>
        </div>

        {/* KPI 2: Total Freight Amount */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block font-mono">
              {formatKpiCurrency(kpiStats.totalFreightAmount)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5 truncate">
              {periodLabel} freight revenue
            </span>
          </div>
        </div>

        {/* KPI 3: Pending Dispatch (ALWAYS LIVE Queue) */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors relative overflow-hidden">
          {kpiStats.pendingCount > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#F59E0B] rounded-bl-md"></div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Pending Dispatch
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiStats.pendingCount}
            </span>
            <span className="text-xs text-[#D97706] font-medium block mt-0.5 truncate">
              Unassigned in warehouse
            </span>
          </div>
        </div>

        {/* KPI 4: Dispatch Memos Created */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Dispatches Sent
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiStats.memosCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5 truncate">
              Memos in {periodLabel}
            </span>
          </div>
        </div>

        {/* KPI 5: Booking Cash Collected */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Cash Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block font-mono">
              {formatKpiCurrency(kpiStats.cashCollected)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5 truncate">
              Upfront payment received
            </span>
          </div>
        </div>

        {/* KPI 6: Total Expenses */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Branch Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block font-mono text-[#DC2626]">
              {formatKpiCurrency(kpiStats.totalExpensesAmount)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5 truncate">
              Logged in {periodLabel}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN OPERATIONAL WORKSPACE (2 COLUMNS: UNASSIGNED DISPATCH QUEUE & RECENT BOOKINGS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT / TOP: PENDING DISPATCH QUEUE (ALWAYS LIVE WAREHOUSE STOCK) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse"></div>
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">
                Pending Dispatch Queue ({pendingDispatchBookings.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.MEMOS.NEW)}
              className="text-xs font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1 transition-colors"
            >
              <span>Create Memo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Queue Content list */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[420px] space-y-3 no-scrollbar">
            {pendingDispatchBookings.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8] space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto opacity-80" />
                <p className="text-xs font-medium text-[#64748B]">All booked shipments have been dispatched in memos!</p>
              </div>
            ) : (
              pendingDispatchBookings.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(ROUTES.BOOKINGS.DETAILS(item._id))}
                  className="p-3 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                        {item.bookingNumber || item.lrNumber}
                      </span>
                      <span className="text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-1.5 py-0.5 rounded">
                        {item.totalPackages || 1} Pkg
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${item.collectionType === "PAID_AT_BOOKING"
                          ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                          : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                        }`}>
                        {item.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO PAY"}
                      </span>
                    </div>
                    <div className="text-xs text-[#475569] font-medium truncate">
                      {item.customer?.shopName || item.customer?.name || "Customer"} → <span className="text-[#0F172A] font-semibold">{item.toBranch?.name || "Destination"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#0F172A] font-mono block">
                      {formatKpiCurrency(item.totalAmount)}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">
                      {formatDate(item.bookingDate || item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {pendingDispatchBookings.length > 6 && (
              <button
                type="button"
                onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
                className="w-full py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-xs font-semibold text-[#64748B] rounded-lg border border-[#E2E8F0] transition-colors text-center cursor-pointer block"
              >
                + View all {pendingDispatchBookings.length} unassigned bookings
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: RECENT BOOKINGS TABLE */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F97316]" />
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">
                Recent Bookings ({periodLabel})
              </h2>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search LR, Customer, Destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-md text-xs bg-white border border-[#CBD5E1] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">LR / Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                {searchedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#94A3B8]">
                      No bookings found for the selected timeframe.
                    </td>
                  </tr>
                ) : (
                  searchedBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-[#0F172A] block">
                          {b.bookingNumber || b.lrNumber}
                        </span>
                        <span className="text-[10px] text-[#64748B]">
                          {formatDate(b.bookingDate || b.createdAt)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">
                        {b.customer?.shopName || b.customer?.name || "-"}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B]">
                        {b.toBranch?.name || "-"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {formatKpiCurrency(b.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.memo
                            ? "bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]"
                            : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                          }`}>
                          {b.memo ? "Dispatched" : "In Stock"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => downloadBookingPdf(b._id)}
                          className="p-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="Download Bilty PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B]">
            <span>Showing top {searchedBookings.length} of {filteredBookings.length} bookings</span>
            <button
              type="button"
              onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
              className="font-semibold text-[#F97316] hover:text-[#EA580C] inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Bookings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingDashboard;
