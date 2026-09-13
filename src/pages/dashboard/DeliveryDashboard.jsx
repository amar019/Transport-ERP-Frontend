import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Calendar,
  Clock,
  ChevronRight,
  Package,
  Truck,
  Building2,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";
import { getDeliveryDashboard } from "@/services/dashboard.service";

export const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Timeframe selector state: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM_MONTH'
  const [period, setPeriod] = useState("TODAY");

  // Custom Month State format "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  // API Data State
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Currency format helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  // Main data fetch function
  const fetchDashboardData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const res = await getDeliveryDashboard({
        period,
        selectedMonth: period === "CUSTOM_MONTH" ? selectedMonth : undefined,
      });

      const data = res?.data || res;
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error loading delivery dashboard:", err);
      setError(err?.response?.data?.message || err.message || "Unable to load delivery dashboard data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period, selectedMonth]);

  // Initial & period change fetch
  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // 60-Second background auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      fetchDashboardData(false);
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

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

  const summary = dashboardData?.summary || {};
  const payments = dashboardData?.payments || {};
  const pendingAssignments = dashboardData?.pendingAssignments || [];
  const deliveryBoys = dashboardData?.deliveryBoys || [];
  const recentDeliveries = dashboardData?.recentDeliveries || [];
  const recentCollections = dashboardData?.recentCollections || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-6 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-4">

      {/* COMPACT HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        {/* Left: Breadcrumbs + Compact Title */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Delivery Branch</span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="!text-xl !my-0 font-bold text-[#0F172A] tracking-tight leading-snug">
              Delivery Dashboard
            </h1>
            <span className="bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Building2 className="w-3 h-3 text-[#2563EB]" />
              {user?.branch?.name || "Delivery Branch"}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B] font-normal">
            Real-time delivery operations, boy assignments, counter pickups, and cash collections overview
          </p>
        </div>

        {/* Right Toolbar Quick Actions */}
        <div className="flex items-center flex-wrap gap-1.5 shrink-0 self-start sm:self-auto">
          {/* Refresh Status & Button */}
          <div className="flex items-center gap-1.5">
            {isRefreshing && (
              <span className="text-[11px] font-semibold text-[#F97316] animate-pulse flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Refreshing...
              </span>
            )}
            <button
              type="button"
              onClick={() => fetchDashboardData(false)}
              disabled={isRefreshing || isLoading}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#F97316]" : ""}`} />
            </button>
          </div>

          {/* Quick Action: Customer Ledger */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.FINANCE.CUSTOMER_LEDGER)}
            className="inline-flex items-center justify-center gap-1 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors text-xs cursor-pointer"
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Customer Ledger</span>
          </button>

          {/* Quick Action: Delivery Boy Ledger */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.FINANCE.DELIVERY_BOY_LEDGER)}
            className="inline-flex items-center justify-center gap-1 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors text-xs cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Boy Ledger</span>
          </button>

          {/* Primary Action: Delivery Management */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.OPERATIONS.DELIVERY)}
            className="inline-flex items-center justify-center gap-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors text-xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Delivery Operations</span>
          </button>
        </div>
      </div>

      {/* TIMEFRAME SELECTOR */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="bg-[#F1F5F9] p-0.5 rounded-lg border border-[#E2E8F0] inline-flex flex-wrap items-center gap-0.5">
            <button
              type="button"
              onClick={() => setPeriod("TODAY")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                period === "TODAY"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPeriod("THIS_WEEK")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                period === "THIS_WEEK"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setPeriod("THIS_MONTH")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                period === "THIS_MONTH"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPeriod("CUSTOM_MONTH")}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                period === "CUSTOM_MONTH"
                  ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                  : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Select Month</span>
            </button>
          </div>

          {period === "CUSTOM_MONTH" && (
            <div className="flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-lg">
              <span className="text-[11px] font-semibold text-[#C2410C]">Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-[#CBD5E1] rounded px-1.5 py-0.5 text-xs text-[#0F172A] font-medium focus:outline-none focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
          )}
        </div>

        <div className="text-[11px] text-[#64748B] font-medium flex items-center gap-2">
          {lastUpdated && (
            <span>Updated: <strong className="text-[#0F172A]">{lastUpdated.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}</strong></span>
          )}
          <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
          <span>Window: <strong className="text-[#0F172A] font-semibold">{periodLabel}</strong></span>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            className="px-2.5 py-1 bg-white hover:bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs font-semibold text-[#DC2626] transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING SKELETON */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-[#E2E8F0] h-24 animate-pulse bg-slate-100/60"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-[#E2E8F0] h-20 animate-pulse bg-slate-100/60"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* OPERATIONAL KPI METRICS GRID (5 CARDS - COMPACT) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Shipments Arrived */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Arrived Shipments
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] flex items-center justify-center shrink-0">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-[#0F172A] tracking-tight block">
                  {summary.shipmentsArrived || 0}
                </span>
                <span className="text-[11px] text-[#64748B] font-normal block mt-0.5 truncate">
                  In {periodLabel}
                </span>
              </div>
            </div>

            {/* 2. Pending Assignment */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors relative overflow-hidden">
              {(summary.pendingAssignment || 0) > 0 && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#F59E0B] rounded-bl"></div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Pending Assignment
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-[#0F172A] tracking-tight block">
                  {summary.pendingAssignment || 0}
                </span>
                <span className="text-[11px] text-[#D97706] font-medium block mt-0.5 truncate">
                  Awaiting boy / counter
                </span>
              </div>
            </div>

            {/* 3. Out for Delivery */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Out for Delivery
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE] flex items-center justify-center shrink-0">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-[#0F172A] tracking-tight block">
                  {summary.outForDelivery || 0}
                </span>
                <span className="text-[11px] text-[#0891B2] font-medium block mt-0.5 truncate">
                  Currently in transit
                </span>
              </div>
            </div>

            {/* 4. Delivered */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Delivered
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-[#0F172A] tracking-tight block">
                  {summary.delivered || 0}
                </span>
                <span className="text-[11px] text-[#059669] font-medium block mt-0.5 truncate">
                  Completed in {periodLabel}
                </span>
              </div>
            </div>

            {/* 5. Failed Deliveries */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between hover:border-[#CBD5E1] transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Failed Attempts
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold text-[#DC2626] tracking-tight block">
                  {summary.failed || 0}
                </span>
                <span className="text-[11px] text-[#DC2626] font-medium block mt-0.5 truncate">
                  Requires re-attempt
                </span>
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY CARDS (3 CARDS - COMPACT) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Financial Card 1: TO PAY Outstanding */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  TO PAY Outstanding
                </span>
                <span className="text-xl font-bold text-[#0F172A] tracking-tight font-mono block mt-0.5">
                  {formatCurrency(payments.toPayOutstanding)}
                </span>
                <span className="text-[11px] text-[#64748B] font-normal block mt-0.5">
                  Pending customer payment at branch
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>

            {/* Financial Card 2: Customer Collections */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Collections ({periodLabel})
                </span>
                <span className="text-xl font-bold text-[#16A34A] tracking-tight font-mono block mt-0.5">
                  {formatCurrency(payments.collectedToday)}
                </span>
                <span className="text-[11px] text-[#64748B] font-normal block mt-0.5">
                  Collected by Boys & Branch Owner
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Financial Card 3: Delivery Boy Outstanding */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                  Boy Cash to Settle
                </span>
                <span className="text-xl font-bold text-[#7C3AED] tracking-tight font-mono block mt-0.5">
                  {formatCurrency(payments.deliveryBoyOutstanding)}
                </span>
                <span className="text-[11px] text-[#64748B] font-normal block mt-0.5">
                  Unsettled cash held by delivery boys
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* TWO COLUMN OPERATIONAL LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* LEFT COLUMN: PENDING ASSIGNMENTS QUEUE (SCROLLBAR HIDDEN) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></div>
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                    Pending Assignment Queue ({pendingAssignments.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.OPERATIONS.DELIVERY)}
                  className="text-xs font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* HIDDEN SCROLLBAR CONTAINER */}
              <div className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[340px] no-scrollbar">
                {pendingAssignments.length === 0 ? (
                  <div className="py-8 text-center text-[#94A3B8] space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-[#10B981] mx-auto opacity-80" />
                    <p className="text-xs font-medium text-[#64748B]">No pending delivery assignments!</p>
                  </div>
                ) : (
                  pendingAssignments.map((b) => (
                    <div
                      key={b._id}
                      className="p-2.5 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-all flex items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-[#0F172A]">
                            {b.bookingNumber || b.lrNumber}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                            b.collectionType === "PAID_AT_BOOKING"
                              ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                              : "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                          }`}>
                            {b.collectionType === "PAID_AT_BOOKING" ? "PAID" : "TO PAY"}
                          </span>
                        </div>
                        <div className="text-xs text-[#475569] font-medium truncate">
                          {b.customer?.shopName || b.customer?.name || "Customer"}
                        </div>
                        {b.fromBranch && (
                          <div className="text-[10px] text-[#94A3B8]">
                            From: {b.fromBranch.name}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-xs font-bold text-[#0F172A] font-mono block">
                          {formatCurrency(b.totalAmount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.OPERATIONS.DELIVERY)}
                          className="px-2 py-0.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                        >
                          Assign Boy
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: DELIVERY BOY ACTIVITY SUMMARY (SCROLLBAR HIDDEN) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                    Delivery Boy Performance ({deliveryBoys.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.FINANCE.DELIVERY_BOY_LEDGER)}
                  className="text-xs font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ledger</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar max-h-[340px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase text-[9px] tracking-wider">
                      <th className="py-2 px-3">Delivery Boy</th>
                      <th className="py-2 px-2 text-center">Assigned</th>
                      <th className="py-2 px-2 text-center">Delivered</th>
                      <th className="py-2 px-3 text-right">Collection</th>
                      <th className="py-2 px-3 text-right">To Settle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                    {deliveryBoys.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-[#94A3B8]">
                          No delivery boys active for this branch.
                        </td>
                      </tr>
                    ) : (
                      deliveryBoys.map((boy) => (
                        <tr
                          key={boy._id}
                          onClick={() => navigate(ROUTES.FINANCE.DELIVERY_BOY_LEDGER)}
                          className="hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                        >
                          <td className="py-2 px-3">
                            <span className="font-semibold text-[#0F172A] block">{boy.name}</span>
                            <span className="text-[10px] text-[#64748B]">{boy.mobile}</span>
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-[#0891B2]">
                            {boy.assignedCount}
                          </td>
                          <td className="py-2 px-2 text-center font-bold text-[#059669]">
                            {boy.deliveredCount}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium">
                            {formatCurrency(boy.collectionAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#7C3AED]">
                            {formatCurrency(boy.toSettleAmount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* LOWER SECTION: RECENT ACTIVITY (2 TABLES) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* RECENT DELIVERIES TABLE (SCROLLBAR HIDDEN) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#F97316]" />
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                    Recent Delivery Activity
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.OPERATIONS.DELIVERY)}
                  className="text-xs font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase text-[9px] tracking-wider">
                      <th className="py-2 px-3">Bill / LR</th>
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">Delivery Boy</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                    {recentDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-[#94A3B8]">
                          No recent delivery activity.
                        </td>
                      </tr>
                    ) : (
                      recentDeliveries.map((b) => (
                        <tr key={b._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-[#0F172A]">
                            {b.bookingNumber || b.lrNumber}
                          </td>
                          <td className="py-2 px-3 font-medium truncate max-w-[120px]">
                            {b.customer?.shopName || b.customer?.name || "-"}
                          </td>
                          <td className="py-2 px-3 text-[#64748B]">
                            {b.delivery?.deliveryBoy?.name || "Counter / Direct"}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              b.delivery?.status === "DELIVERED"
                                ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                                : b.delivery?.status === "OUT_FOR_DELIVERY"
                                ? "bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE]"
                                : "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                            }`}>
                              {b.delivery?.status || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RECENT COLLECTIONS TABLE (SCROLLBAR HIDDEN) */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-[#16A34A]" />
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                    Recent Collections
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.FINANCE.PAYMENT_TRANSACTIONS)}
                  className="text-xs font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>All Transactions</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-[#E2E8F0] uppercase text-[9px] tracking-wider">
                      <th className="py-2 px-3">Customer</th>
                      <th className="py-2 px-3">Bill / LR</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-3 text-center">Collected By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
                    {recentCollections.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-[#94A3B8]">
                          No recent customer collections.
                        </td>
                      </tr>
                    ) : (
                      recentCollections.map((tx) => (
                        <tr key={tx._id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-2 px-3 font-medium truncate max-w-[120px]">
                            {tx.customer?.shopName || tx.customer?.name || "-"}
                          </td>
                          <td className="py-2 px-3 font-mono text-[#64748B]">
                            {tx.booking?.bookingNumber || "-"}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[#16A34A]">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              tx.collectedBy === "DELIVERY_BOY"
                                ? "bg-[#F5F3FF] text-[#7C3AED]"
                                : "bg-[#EFF6FF] text-[#2563EB]"
                            }`}>
                              {tx.collectedBy === "DELIVERY_BOY"
                                ? tx.deliveryBoy?.name || "Delivery Boy"
                                : "Branch Owner"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryDashboard;
