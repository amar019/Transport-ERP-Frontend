import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  RefreshCw,
  Truck,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  IndianRupee,
  AlertCircle,
  Search,
  ChevronRight,
  Inbox,
  X,
  RotateCcw,
  Trash2,
  Building2,
} from "lucide-react";
import { createPortal } from "react-dom";
import MemoStatusBadge from "@/components/memo/MemoStatusBadge";
import MemoActionMenu from "@/components/memo/MemoActionMenu";
import {
  fetchMemos,
  deleteMemoThunk,
  markMemoOnRouteThunk,
  markMemoReceivedThunk,
  updateMemoCollectionThunk,
} from "@/store/slices/memoSlice";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/paths";

export const MemoListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { list: rawMemos, isLoading, error } = useSelector((state) => state.memos);

  const [toast, setToast] = useState(null);

  // Search & Filter State
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL", // "ALL" | "CREATED" | "IN_TRANSIT" | "RECEIVED"
    collectionStatus: "ALL", // "ALL" | "PENDING" | "PARTIAL" | "COMPLETED"
    dateRange: "ALL", // "ALL" | "TODAY" | "YESTERDAY" | "THIS_WEEK" | "CUSTOM"
    startDate: "",
    endDate: "",
  });

  // Active quick status tab filter ("ALL" | "CREATED" | "IN_TRANSIT" | "RECEIVED" | "PENDING_COLLECTION")
  const [activeTab, setActiveTab] = useState("ALL");

  // Action Modals State
  const [dispatchModalMemo, setDispatchModalMemo] = useState(null);
  const [receiveModalMemo, setReceiveModalMemo] = useState(null);
  const [deleteModalMemo, setDeleteModalMemo] = useState(null);
  const [collectionModalMemo, setCollectionModalMemo] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isBookingBranch = user?.branch?.type === "BOOKING";
  const isDeliveryBranch = user?.branch?.type === "DELIVERY";

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadMemos = useCallback(() => {
    dispatch(fetchMemos());
  }, [dispatch]);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  // Memo lifecycle status calculator
  const getMemoStatus = useCallback((memo) => {
    if (!memo) return "CREATED";
    if (memo.status === "RECEIVED") return "RECEIVED";
    if (memo.status === "ON_ROUTE" || (memo.dispatchedAt && !memo.receivedAt)) {
      return "IN_TRANSIT";
    }
    return "CREATED";
  }, []);

  // Summary Metrics Calculator
  const kpiMetrics = useMemo(() => {
    if (!Array.isArray(rawMemos)) {
      return {
        total: 0,
        created: 0,
        inTransit: 0,
        received: 0,
        pendingCollection: 0,
        outstandingAmount: 0,
      };
    }

    let created = 0;
    let inTransit = 0;
    let received = 0;
    let pendingCollection = 0;
    let outstandingAmount = 0;

    rawMemos.forEach((m) => {
      const st = getMemoStatus(m);
      if (st === "CREATED") created++;
      if (st === "IN_TRANSIT") inTransit++;
      if (st === "RECEIVED") received++;

      const pending = Number(m.pendingAmount ?? 0);
      if (pending > 0 || m.collectionStatus === "PENDING" || m.collectionStatus === "PARTIAL") {
        pendingCollection++;
      }
      outstandingAmount += pending;
    });

    return {
      total: rawMemos.length,
      created,
      inTransit,
      received,
      pendingCollection,
      outstandingAmount,
    };
  }, [rawMemos, getMemoStatus]);

  // Client filtering
  const filteredMemos = useMemo(() => {
    if (!Array.isArray(rawMemos)) return [];

    return rawMemos.filter((m) => {
      const memoSt = getMemoStatus(m);
      const q = (filters.search || "").toLowerCase().trim();
      const memoNo = (m.memoNumber || "").toLowerCase();
      const fromBranch = (m.fromBranch?.name || "").toLowerCase();
      const toBranch = (m.toBranch?.name || "").toLowerCase();

      // Search matching memo number, from branch, or to branch
      const matchSearch =
        !q ||
        memoNo.includes(q) ||
        fromBranch.includes(q) ||
        toBranch.includes(q);

      // Status dropdown filter
      let matchStatus = true;
      if (filters.status !== "ALL") {
        matchStatus = memoSt === filters.status;
      }

      // Settlement dropdown filter
      let matchCollection = true;
      if (filters.collectionStatus !== "ALL") {
        matchCollection = m.collectionStatus === filters.collectionStatus;
      }

      // Date Range filter
      let matchDate = true;
      const memoDateVal = new Date(m.memoDate || m.date || m.createdAt);
      if (!isNaN(memoDateVal.getTime())) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filters.dateRange === "TODAY") {
          const itemDate = new Date(memoDateVal);
          itemDate.setHours(0, 0, 0, 0);
          matchDate = itemDate.getTime() === today.getTime();
        } else if (filters.dateRange === "YESTERDAY") {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const itemDate = new Date(memoDateVal);
          itemDate.setHours(0, 0, 0, 0);
          matchDate = itemDate.getTime() === yesterday.getTime();
        } else if (filters.dateRange === "THIS_WEEK") {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          matchDate = memoDateVal >= weekAgo;
        } else if (filters.dateRange === "CUSTOM") {
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0, 0, 0, 0);
            matchDate = matchDate && memoDateVal >= start;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            matchDate = matchDate && memoDateVal <= end;
          }
        }
      }

      // Segmented Status Tab Override
      let matchTab = true;
      if (activeTab === "CREATED") matchTab = memoSt === "CREATED";
      else if (activeTab === "IN_TRANSIT") matchTab = memoSt === "IN_TRANSIT";
      else if (activeTab === "RECEIVED") matchTab = memoSt === "RECEIVED";
      else if (activeTab === "PENDING_COLLECTION") {
        matchTab = Number(m.pendingAmount ?? 0) > 0 || m.collectionStatus === "PENDING";
      }

      return matchSearch && matchStatus && matchCollection && matchDate && matchTab;
    });
  }, [rawMemos, filters, activeTab, getMemoStatus]);

  // Actions Handlers
  const handleConfirmDispatch = async () => {
    if (!dispatchModalMemo) return;
    try {
      setActionLoading(true);
      await dispatch(markMemoOnRouteThunk(dispatchModalMemo._id)).unwrap();
      showToast(`Manifest ${dispatchModalMemo.memoNumber} dispatched on route!`, "success");
      setDispatchModalMemo(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to dispatch manifest", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceive = async () => {
    if (!receiveModalMemo) return;
    try {
      setActionLoading(true);
      await dispatch(markMemoReceivedThunk(receiveModalMemo._id)).unwrap();
      showToast(`Manifest ${receiveModalMemo.memoNumber} marked as received!`, "success");
      setReceiveModalMemo(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to receive manifest", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalMemo) return;
    try {
      setActionLoading(true);
      await dispatch(deleteMemoThunk(deleteModalMemo._id)).unwrap();
      showToast(`Manifest ${deleteModalMemo.memoNumber} deleted`, "success");
      setDeleteModalMemo(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to delete manifest", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCollection = async (e) => {
    e.preventDefault();
    if (!collectionModalMemo) return;
    const amount = Number(settlementAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid settlement amount", "error");
      return;
    }

    try {
      setActionLoading(true);
      await dispatch(
        updateMemoCollectionThunk({
          id: collectionModalMemo._id,
          amountReceived: amount,
        })
      ).unwrap();
      showToast("Payment recorded successfully", "success");
      setCollectionModalMemo(null);
      setSettlementAmount("");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to record payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "ALL" ||
    filters.collectionStatus !== "ALL" ||
    filters.dateRange !== "ALL" ||
    activeTab !== "ALL";

  const handleResetAllFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      collectionStatus: "ALL",
      dateRange: "ALL",
      startDate: "",
      endDate: "",
    });
    setActiveTab("ALL");
  };

  // Status tabs array
  const statusTabs = [
    { label: "All Memos", value: "ALL", count: kpiMetrics.total },
    { label: "Created", value: "CREATED", count: kpiMetrics.created },
    { label: "In Transit", value: "IN_TRANSIT", count: kpiMetrics.inTransit },
    { label: "Received", value: "RECEIVED", count: kpiMetrics.received },
    { label: "Pending Payment", value: "PENDING_COLLECTION", count: kpiMetrics.pendingCollection },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* 1. PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        {/* Left: Breadcrumbs + Title + Subtitle */}
        <div className="space-y-1">
          {/* Small Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Memos</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
              Memos
            </h1>

            <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
              <Building2 className="w-3 h-3 text-[#F97316]" />
              {user?.branch?.name || "Ahilyanagar Branch"} · {user?.branch?.type || "BOOKING"}
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Manage, dispatch and track transport dispatch manifests
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadMemos}
            disabled={isLoading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Memos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>

          {/* Primary Action: + Create Memo */}
          {isBookingBranch && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.MEMOS.NEW)}
              className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Memo</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Card 1: Total Memos */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Memos
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {isLoading ? "..." : kpiMetrics.total}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              All dispatch manifests
            </span>
          </div>
        </div>

        {/* Card 2: In Transit */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              In Transit
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {isLoading ? "..." : kpiMetrics.inTransit}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Awaiting branch receipt
            </span>
          </div>
        </div>

        {/* Card 3: Received */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {isLoading ? "..." : kpiMetrics.received}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Received at destination
            </span>
          </div>
        </div>

        {/* Card 4: Outstanding To-Pay */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Outstanding To-Pay
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {isLoading ? "..." : formatCurrency(kpiMetrics.outstandingAmount)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              {kpiMetrics.pendingCollection} memos pending
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED CONTROL STATUS TABS */}
      <div className="no-print">
        <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1 overflow-x-auto">
          {statusTabs.map((tab) => {
            const isTabActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
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

      {/* 4. FILTER TOOLBAR */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5 no-print">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full lg:flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memo number, from branch, to branch..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Dropdown */}
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters((f) => ({ ...f, status: e.target.value }));
                setActiveTab("ALL");
              }}
              className="px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A] focus:outline-none focus:border-[#F97316] cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="ALL">All Statuses</option>
              <option value="CREATED">Created</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="RECEIVED">Received</option>
            </select>

            {/* Payment Status Dropdown */}
            <select
              value={filters.collectionStatus}
              onChange={(e) => {
                setFilters((f) => ({ ...f, collectionStatus: e.target.value }));
                setActiveTab("ALL");
              }}
              className="px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A] focus:outline-none focus:border-[#F97316] cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PENDING">Pending Payment</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="COMPLETED">Fully Paid</option>
            </select>

            {/* Date Filter */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters((f) => ({ ...f, dateRange: e.target.value }))}
              className="px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg font-semibold text-[#0F172A] focus:outline-none focus:border-[#F97316] cursor-pointer flex-1 sm:flex-initial"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="CUSTOM">Custom Range</option>
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker Row (if CUSTOM selected) */}
        {filters.dateRange === "CUSTOM" && (
          <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0] text-xs">
            <span className="text-[11px] font-semibold text-[#64748B]">From:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium"
            />
            <span className="text-[11px] font-semibold text-[#64748B]">To:</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-medium"
            />
          </div>
        )}
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between text-[#DC2626] text-xs font-medium no-print">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
            <span>{typeof error === "string" ? error : "Unable to load dispatch memos."}</span>
          </div>
          <button
            type="button"
            onClick={loadMemos}
            className="px-3 py-1 bg-white text-[#DC2626] border border-[#FECACA] rounded-lg hover:bg-[#FEF2F2] font-semibold cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 5. ENTERPRISE DATA TABLE */}
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col select-none overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[850px] lg:min-w-full">
            {/* Sticky Table Header */}
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] select-none sticky top-0 z-10">
              <tr>
                {/* 1. Memo */}
                <th className="py-3 px-3 whitespace-nowrap w-[120px]">
                  Memo No
                </th>

                {/* 2. Route */}
                <th className="py-3 px-3 min-w-[170px]">
                  Route
                </th>

                {/* 3. Contents */}
                <th className="py-3 px-3 whitespace-nowrap w-[110px]">
                  Contents
                </th>

                {/* 4. Total Amount */}
                <th className="py-3 px-3 text-right whitespace-nowrap w-[115px]">
                  Total Amount
                </th>

                {/* 5. To Pay */}
                <th className="py-3 px-3 text-right whitespace-nowrap w-[110px]">
                  To Pay
                </th>

                {/* 6. Memo Status */}
                <th className="py-3 px-2.5 whitespace-nowrap w-[110px] text-center">
                  Memo Status
                </th>

                {/* 7. Collection */}
                <th className="py-3 px-3 whitespace-nowrap w-[130px]">
                  Collection
                </th>

                {/* 8. Actions */}
                <th className="py-3 px-3 text-right whitespace-nowrap w-[165px]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-3 px-3">
                      <div className="h-4 w-20 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-14 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-28 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-3.5 w-16 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-16 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-3 px-2.5 text-center">
                      <div className="h-5 w-20 bg-slate-200 rounded-md mx-auto"></div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="h-4.5 w-16 bg-slate-200 rounded-md mb-1"></div>
                      <div className="h-3 w-20 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="h-6 w-28 bg-slate-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredMemos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-2.5 border border-[#FFEDD5]">
                        <Inbox className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-[#0F172A] text-sm">
                        No dispatch memos found
                      </h4>
                      <p className="text-[#64748B] text-xs mt-1 leading-relaxed font-normal">
                        {hasActiveFilters
                          ? "No memos match your current search query or active filters."
                          : "Create your first memo to dispatch bookings from this branch."}
                      </p>
                      {isBookingBranch && !hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.MEMOS.NEW)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Create Memo</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMemos.map((m) => {
                  const mId = m._id || m.id;
                  const memoStatus = getMemoStatus(m);
                  const biltyCount = m.totalBookings ?? m.bookingsCount ?? m.bookings?.length ?? 0;
                  const packageCount = m.totalPackages ?? 0;
                  const totalMoneyVal = Number(m.totalMoney ?? m.totalAmount ?? m.totalToPay ?? 0);
                  const totalToPayVal = Number(m.totalToPay ?? m.totalAmount ?? 0);
                  const receivedVal = Number(m.receivedAmount ?? m.totalCollected ?? 0);
                  const pendingVal = Number(m.pendingAmount ?? (totalToPayVal - receivedVal));

                  return (
                    <tr
                      key={mId}
                      onClick={() => navigate(ROUTES.MEMOS.DETAILS(mId))}
                      className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    >
                      {/* 1. Memo (Memo No + Date) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] px-2 py-0.5 rounded-md border border-[#E2E8F0] group-hover:bg-[#FFF7ED] group-hover:text-[#C2410C] group-hover:border-[#FFEDD5] transition-colors">
                          {m.memoNumber || "MEM-0000"}
                        </span>
                        <div className="text-[11px] text-[#64748B] font-normal mt-1">
                          {formatDate(m.memoDate ?? m.date ?? m.createdAt)}
                        </div>
                      </td>

                      {/* 2. Route (Origin -> Destination) */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-semibold text-[#0F172A] truncate" title={m.fromBranch?.name || "Origin Branch"}>
                          {m.fromBranch?.name || "Ahilyanagar Branch"}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-[#64748B] truncate mt-0.5" title={m.toBranch?.name || "Destination Branch"}>
                          <span className="text-[#F97316] font-bold">→</span>
                          <span className="truncate">{m.toBranch?.name || "Jamkhed Branch"}</span>
                        </div>
                      </td>

                      {/* 3. Contents (Bilties + Packages) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-xs font-semibold text-[#0F172A]">
                          {biltyCount} {biltyCount === 1 ? "Bilty" : "Bilties"}
                        </div>
                        <div className="text-[11px] text-[#64748B] font-normal mt-0.5">
                          {packageCount} Pkgs
                        </div>
                      </td>

                      {/* 4. Total Amount */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A] whitespace-nowrap text-xs">
                        {formatCurrency(totalMoneyVal)}
                      </td>

                      {/* 5. To Pay */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#C2410C] whitespace-nowrap text-xs">
                        {formatCurrency(totalToPayVal)}
                      </td>

                      {/* 6. Memo Status */}
                      <td className="py-3 px-2.5 whitespace-nowrap text-center">
                        <MemoStatusBadge type="status" value={memoStatus} />
                      </td>

                      {/* 7. Collection */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div>
                          <MemoStatusBadge type="collection" value={m.collectionStatus || "PENDING"} />
                        </div>
                        <div className="text-[11px] font-mono font-medium text-[#64748B] mt-1">
                          {pendingVal > 0 ? (
                            <span className="text-[#D97706] font-semibold">{formatCurrency(pendingVal)} pending</span>
                          ) : (
                            <span className="text-[#059669] font-semibold">₹0 pending</span>
                          )}
                        </div>
                      </td>

                      {/* 8. Actions */}
                      <td
                        className="py-3 px-3 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MemoActionMenu
                          memo={m}
                          memoStatus={memoStatus}
                          onDispatch={(memo) => setDispatchModalMemo(memo)}
                          onReceive={(memo) => setReceiveModalMemo(memo)}
                          onSettlement={(memo) => {
                            setCollectionModalMemo(memo);
                            setSettlementAmount(String(memo.pendingAmount || memo.totalAmount || ""));
                          }}
                          onDelete={(memo) => setDeleteModalMemo(memo)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION CONFIRMATION MODALS (Portal Dialogs) */}

      {/* DISPATCH MODAL */}
      {dispatchModalMemo &&
        createPortal(
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">
                    Dispatch Manifest?
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {dispatchModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] space-y-1 text-xs text-[#0F172A]">
                <p className="font-medium">
                  Mark this memo as <b>In Transit</b> to <b>{dispatchModalMemo.toBranch?.name}</b>?
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Total {dispatchModalMemo.totalBookings ?? dispatchModalMemo.bookingsCount ?? 0} bilties will be set on route.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDispatchModalMemo(null)}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching...
                    </>
                  ) : (
                    "Confirm Dispatch"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* RECEIVE MODAL */}
      {receiveModalMemo &&
        createPortal(
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">
                    Receive Manifest?
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {receiveModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] space-y-1 text-xs text-[#0F172A]">
                <p className="font-medium">
                  Confirm arrival and acknowledge receipt of goods at your branch?
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReceiveModalMemo(null)}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceive}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#059669] hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Receiving...
                    </>
                  ) : (
                    "Confirm Receipt"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* SETTLEMENT MODAL */}
      {collectionModalMemo &&
        createPortal(
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">
                    Record Payment
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {collectionModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmCollection} className="space-y-3">
                <div className="bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] text-xs space-y-1">
                  <div className="flex justify-between text-[#64748B] font-medium">
                    <span>Total To-Pay:</span>
                    <span className="font-mono font-bold text-[#0F172A]">
                      {formatCurrency(collectionModalMemo.totalAmount ?? collectionModalMemo.totalToPay ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#64748B] font-medium">
                    <span>Pending To-Pay:</span>
                    <span className="font-mono font-bold text-[#D97706]">
                      {formatCurrency(collectionModalMemo.pendingAmount ?? 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                    Amount Received (₹) <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    placeholder="Enter received amount in ₹..."
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] font-bold font-mono text-[#0F172A]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCollectionModalMemo(null)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#059669] hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Payment"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE MODAL */}
      {deleteModalMemo &&
        createPortal(
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left select-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 border border-[#FECACA]">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">
                    Delete Manifest?
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {deleteModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-1 bg-[#FEF2F2]/60 p-3 rounded-lg border border-[#FECACA]">
                <p className="text-xs text-[#0F172A] font-semibold">
                  Are you sure you want to delete this draft manifest?
                </p>
                <p className="text-[11px] text-[#DC2626] font-medium">
                  Associated bilties will be unlinked and returned to pending dispatch.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalMemo(null)}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-red-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MemoListPage;
