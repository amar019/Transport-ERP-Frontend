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

export const DashboardPage = () => {
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
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
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
        </div>

        {/* Custom Month Selector Picker */}
        {period === "CUSTOM_MONTH" && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
            <span className="text-xs font-semibold text-[#64748B] shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#F97316]" /> Month:
            </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedMonth(e.target.value);
                  setPeriod("CUSTOM_MONTH");
                }
              }}
              className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#F97316] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 5 STATISTICS CARDS SECTION (Matching BookingListPage visual style) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 no-print">

        {/* Card 1: Bookings Count & Value */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {periodLabel}'s Bookings
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {isInitialLoading ? "..." : `${kpiStats.bookingsCount}`}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Freight: <span className="font-mono font-semibold text-[#0F172A]">{formatKpiCurrency(kpiStats.totalFreightAmount)}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Pending Dispatch (ALWAYS LIVE) */}
        <div className={`bg-white p-4.5 rounded-xl border flex flex-col justify-between transition-all ${kpiStats.pendingCount > 0
            ? "border-[#FDE68A] bg-[#FFFBEB]/30 shadow-2xs"
            : "border-[#E2E8F0] shadow-2xs"
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D97706]">
                Pending Dispatch
              </span>
              <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[9px] font-bold px-1.5 py-0.2 rounded">
                LIVE
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {isInitialLoading ? "..." : `${kpiStats.pendingCount} Bilties`}
            </span>
            <span className="text-xs text-[#D97706] font-normal block mt-0.5">
              Queue: <span className="font-mono font-semibold text-[#0F172A]">{formatKpiCurrency(kpiStats.pendingValue)}</span>
            </span>
          </div>
        </div>

        {/* Card 3: Memos Dispatched */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Memos Dispatched
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {isInitialLoading ? "..." : `${kpiStats.memosCount} Memos`}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Value: <span className="font-mono font-semibold text-[#0F172A]">{formatKpiCurrency(kpiStats.memosTotalValue)}</span>
            </span>
          </div>
        </div>

        {/* Card 4: Cash Collected (Upfront) */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Cash Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {isInitialLoading ? "..." : formatKpiCurrency(kpiStats.cashCollected)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Upfront at booking
            </span>
          </div>
        </div>

        {/* Card 5: Branch Expenses */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              {periodLabel}'s Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#DC2626] tracking-tight font-mono block">
              {isInitialLoading ? "..." : formatKpiCurrency(kpiStats.totalExpensesAmount)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Branch outflow
            </span>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">

        {/* LEFT COLUMN (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. WAREHOUSE PENDING DISPATCH QUEUE (Always Live) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F5F9] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#0F172A] text-sm m-0 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#F97316]" />
                    Pending Dispatch Queue (Warehouse)
                  </h3>
                  <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {pendingDispatchBookings.length} Waiting
                  </span>
                </div>
                <p className="text-xs text-[#64748B] font-normal m-0 mt-0.5">
                  Active bilties residing in booking warehouse ready for dispatch memo assignment
                </p>
              </div>

              {pendingDispatchBookings.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MEMOS.NEW)}
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Create Memo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {pendingDispatchBookings.length === 0 ? (
              <div className="py-8 text-center space-y-2 bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0]">
                <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto opacity-80" />
                <p className="text-xs font-semibold text-[#0F172A] m-0">Warehouse Queue Clear!</p>
                <p className="text-[11px] text-[#64748B] m-0">All active bookings have been packed into dispatch memos.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC]">
                      <th className="py-2.5 px-3">Bilty No</th>
                      <th className="py-2.5 px-3">Destination Branch</th>
                      <th className="py-2.5 px-3">Customer / Goods</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {pendingDispatchBookings.slice(0, 5).map((booking) => (
                      <tr key={booking._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#F97316]">
                          {booking.bookingNumber || "BK-TEMP"}
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-medium text-[#0F172A]">
                            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                            {booking.toBranch?.name || "Destination Branch"}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[#0F172A]">
                            {booking.customer?.shopName || booking.sender?.name || "Customer"}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {booking.itemName} ({booking.quantity || 1} Qty)
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${booking.collectionType === "PAID_AT_BOOKING"
                              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                              : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                            }`}>
                            {booking.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO PAY"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A]">
                          {formatKpiCurrency(booking.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingDispatchBookings.length > 5 && (
                  <div className="pt-2 text-center border-t border-[#F1F5F9]">
                    <span
                      onClick={() => navigate(ROUTES.MEMOS.NEW)}
                      className="text-xs font-semibold text-[#F97316] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      + {pendingDispatchBookings.length - 5} more bilties ready for dispatch memo
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. RECENT BOOKINGS LOG TABLE */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm m-0">
                  Recent Bookings ({periodLabel})
                </h3>
                <p className="text-xs text-[#64748B] font-normal m-0 mt-0.5">
                  Latest consignments issued at this branch
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search bilty #, customer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A]"
                  />
                </div>
                <span
                  onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
                  className="text-xs font-semibold text-[#F97316] hover:underline cursor-pointer whitespace-nowrap"
                >
                  View All
                </span>
              </div>
            </div>

            {searchedBookings.length === 0 ? (
              <div className="py-8 text-center space-y-1 bg-[#F8FAFC] rounded-lg">
                <Package className="w-8 h-8 text-[#94A3B8] mx-auto opacity-60" />
                <p className="text-xs font-medium text-[#64748B] m-0">No booking records found for {periodLabel.toLowerCase()}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC]">
                      <th className="py-2.5 px-3">Bilty No</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Destination</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {searchedBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#0F172A]">
                          {b.bookingNumber}
                        </td>
                        <td className="py-3 px-3 text-[#64748B] text-[11px]">
                          {formatDate(b.bookingDate || b.createdAt)}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#0F172A]">
                          {b.toBranch?.name || "Branch"}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${b.collectionType === "PAID_AT_BOOKING"
                              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                              : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                            }`}>
                            {b.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO PAY"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                          {formatKpiCurrency(b.totalAmount)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => downloadBookingPdf(b._id, b.bookingNumber)}
                            className="p-1.5 text-[#64748B] hover:text-[#F97316] hover:bg-[#FFF7ED] rounded-md transition-colors cursor-pointer"
                            title="Download Bilty PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 Width - Operational Sidebar) */}
        <div className="space-y-6">

          {/* 1. DISPATCHED MEMOS STATUS */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm m-0">
                  Dispatch Memos ({periodLabel})
                </h3>
                <p className="text-xs text-[#64748B] font-normal m-0 mt-0.5">
                  Outgoing dispatches from this branch
                </p>
              </div>
              <span
                onClick={() => navigate(ROUTES.MEMOS.LIST)}
                className="text-xs font-semibold text-[#F97316] hover:underline cursor-pointer"
              >
                View All
              </span>
            </div>

            {filteredMemos.length === 0 ? (
              <div className="py-6 text-center bg-[#F8FAFC] rounded-lg space-y-1">
                <Truck className="w-6 h-6 text-[#94A3B8] mx-auto opacity-60" />
                <p className="text-xs font-medium text-[#64748B] m-0">No dispatches for {periodLabel.toLowerCase()}.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredMemos.slice(0, 4).map((memo) => (
                  <div
                    key={memo._id}
                    onClick={() => navigate(ROUTES.MEMOS.DETAILS(memo._id))}
                    className="p-3 bg-[#F8FAFC] hover:bg-slate-100/70 rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-[#0F172A] text-xs flex items-center gap-1.5">
                        <span>{memo.memoNumber}</span>
                        <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${memo.status === "RECEIVED"
                            ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                            : memo.status === "ON_ROUTE"
                              ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                              : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                          }`}>
                          {memo.status === "ON_ROUTE" ? "IN TRANSIT" : memo.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#94A3B8]" />
                        <span>To: {memo.toBranch?.name || "Branch"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[#0F172A]">
                        {formatKpiCurrency(memo.totalMoney || memo.totalAmount)}
                      </div>
                      <div className="text-[10px] text-[#64748B]">
                        {memo.bookingsCount || memo.bookings?.length || 0} Bilties
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. BRANCH EXPENSES SUMMARY */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-5 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
              <div>
                <h3 className="font-bold text-[#0F172A] text-sm m-0">
                  Branch Expenses ({periodLabel})
                </h3>
                <p className="text-xs text-[#64748B] font-normal m-0 mt-0.5">
                  Operational cost tally
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.FINANCE.EXPENSES)}
                className="text-xs font-semibold text-[#F97316] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="p-3 bg-[#FEF2F2] rounded-lg border border-[#FECACA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#DC2626]" />
                <span className="text-xs font-semibold text-[#991B1B] uppercase tracking-wider">
                  Total Outflow
                </span>
              </div>
              <span className="text-base font-bold font-mono text-[#DC2626]">
                {formatKpiCurrency(kpiStats.totalExpensesAmount)}
              </span>
            </div>

            {filteredExpenses.length === 0 ? (
              <p className="text-xs text-[#64748B] text-center py-2 m-0">No expenses logged for {periodLabel.toLowerCase()}.</p>
            ) : (
              <div className="space-y-2">
                {filteredExpenses.slice(0, 3).map((exp) => (
                  <div key={exp._id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F1F5F9] last:border-0">
                    <div>
                      <div className="font-medium text-[#0F172A]">{exp.title || exp.category}</div>
                      <div className="text-[10px] text-[#64748B]">{exp.category} • {formatDate(exp.expenseDate || exp.createdAt)}</div>
                    </div>
                    <div className="font-mono font-bold text-[#DC2626]">
                      {formatKpiCurrency(exp.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. CASH COLLECTION BREAKDOWN WIDGET */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs p-5 space-y-3 text-left">
            <h3 className="font-bold text-[#0F172A] text-sm m-0">
              Payment Distribution ({periodLabel})
            </h3>
            <p className="text-xs text-[#64748B] font-normal m-0">
              Upfront Cash vs To-Pay Collection Ratio
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#059669]">Paid at Booking:</span>
                <span className="font-mono">{formatKpiCurrency(kpiStats.cashCollected)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#D97706]">To Pay at Delivery:</span>
                <span className="font-mono">{formatKpiCurrency(kpiStats.toPayPending)}</span>
              </div>

              {/* Progress Bar */}
              {kpiStats.cashCollected + kpiStats.toPayPending > 0 && (
                <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden flex mt-2">
                  <div
                    className="bg-[#059669] h-full transition-all"
                    style={{
                      width: `${Math.round(
                        (kpiStats.cashCollected /
                          (kpiStats.cashCollected + kpiStats.toPayPending)) *
                        100
                      )}%`,
                    }}
                    title="Paid Upfront"
                  />
                  <div
                    className="bg-[#D97706] h-full transition-all"
                    style={{
                      width: `${Math.round(
                        (kpiStats.toPayPending /
                          (kpiStats.cashCollected + kpiStats.toPayPending)) *
                        100
                      )}%`,
                    }}
                    title="To Pay"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
