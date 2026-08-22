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
  Building2,
  ArrowRight,
  Inbox,
  Filter,
  X,
  AlertTriangle,
  RotateCcw,
  DollarSign,
  Calendar,
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

  // Active quick chip filter ("ALL" | "CREATED" | "IN_TRANSIT" | "RECEIVED" | "PENDING_COLLECTION")
  const [activeChip, setActiveChip] = useState("ALL");

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

  // Memo lifecycle status calculator based on specification
  const getMemoStatus = useCallback((memo) => {
    if (!memo) return "CREATED";
    if (memo.status === "RECEIVED") return "RECEIVED";
    if (memo.status === "ON_ROUTE" || (memo.dispatchedAt && !memo.receivedAt)) {
      return "IN_TRANSIT";
    }
    return "CREATED";
  }, []);

  // Quick Chips Counts & Metrics Calculator
  const counts = useMemo(() => {
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

      // Quick Chips Filter Override
      let matchChip = true;
      if (activeChip === "CREATED") matchChip = memoSt === "CREATED";
      else if (activeChip === "IN_TRANSIT") matchChip = memoSt === "IN_TRANSIT";
      else if (activeChip === "RECEIVED") matchChip = memoSt === "RECEIVED";
      else if (activeChip === "PENDING_COLLECTION") {
        matchChip = Number(m.pendingAmount ?? 0) > 0 || m.collectionStatus === "PENDING";
      }

      return matchSearch && matchStatus && matchCollection && matchDate && matchChip;
    });
  }, [rawMemos, filters, activeChip, getMemoStatus]);

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
    activeChip !== "ALL";

  const handleResetAllFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      collectionStatus: "ALL",
      dateRange: "ALL",
      startDate: "",
      endDate: "",
    });
    setActiveChip("ALL");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-3.5 md:p-5 font-sans antialiased text-slate-800 selection:bg-orange-100 select-none pb-16 space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${toast.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs md:text-sm font-extrabold">{toast.msg}</span>
        </div>
      )}

      {/* 1. COMPACT PROFESSIONAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {isDeliveryBranch ? " Memos " : "Memos"}
            </h1>
            <span className="bg-orange-50 text-orange-800 border border-orange-200/90 text-xs font-black px-2.5 py-0.5 rounded-full">
              {user?.branch?.name || "Ahmednagar Booking"} · {user?.branch?.type || "BOOKING"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Create, dispatch and track branch memos.
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadMemos}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 bg-white rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Memos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-orange-500" : ""}`} />
          </button>

          {isBookingBranch && (
            <button
              type="button"
              onClick={() => navigate(ROUTES.MEMOS.NEW)}
              className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Memo</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 4 BUSINESS KPI CARDS (Responsive: 1 col mobile, 2 tablet, 4 desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Memos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Memos
            </span>
            <span className="text-2xl font-black text-slate-800 block">
              {isLoading ? "..." : counts.total}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block">
              All dispatch manifests
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/80">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: In Transit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              In Transit
            </span>
            <span className="text-2xl font-black text-blue-700 block">
              {isLoading ? "..." : counts.inTransit}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block">
              Awaiting branch receipt
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Received */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Received
            </span>
            <span className="text-2xl font-black text-emerald-700 block">
              {isLoading ? "..." : counts.received}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block">
              Received by delivery branch
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Outstanding To-Pay (Calculated strictly from pendingAmount) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Outstanding To-Pay
            </span>
            <span className="text-2xl font-black font-mono text-amber-700 block">
              {isLoading ? "..." : formatCurrency(counts.outstandingAmount)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 block">
              {counts.pendingCollection} memos pending
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH & CONTROLS TOOLBAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex flex-col lg:flex-row items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full lg:flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memo no, from branch, to branch..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, search: "" }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
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
                setActiveChip("ALL");
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:border-orange-500 cursor-pointer flex-1 sm:flex-initial"
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
                setActiveChip("ALL");
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:border-orange-500 cursor-pointer flex-1 sm:flex-initial"
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
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:border-orange-500 cursor-pointer flex-1 sm:flex-initial"
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
                className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Range Picker Row (if CUSTOM selected) */}
        {filters.dateRange === "CUSTOM" && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-500">From:</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            />
            <span className="text-[11px] font-bold text-slate-500">To:</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            />
          </div>
        )}

        {/* 4. COMPACT QUICK FILTER CHIPS */}
        <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-slate-100 text-xs">
          {/* Chip: All */}
          <button
            type="button"
            onClick={() => setActiveChip("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeChip === "ALL"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
          >
            All <span className="opacity-80">({counts.total})</span>
          </button>

          {/* Chip: Created */}
          <button
            type="button"
            onClick={() => setActiveChip("CREATED")}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeChip === "CREATED"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
          >
            Created <span className="opacity-80">({counts.created})</span>
          </button>

          {/* Chip: In Transit */}
          <button
            type="button"
            onClick={() => setActiveChip("IN_TRANSIT")}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeChip === "IN_TRANSIT"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
          >
            In Transit <span className="opacity-80">({counts.inTransit})</span>
          </button>

          {/* Chip: Received */}
          <button
            type="button"
            onClick={() => setActiveChip("RECEIVED")}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeChip === "RECEIVED"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
          >
            Received <span className="opacity-80">({counts.received})</span>
          </button>

          {/* Chip: Pending Payment */}
          <button
            type="button"
            onClick={() => setActiveChip("PENDING_COLLECTION")}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${activeChip === "PENDING_COLLECTION"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
          >
            Pending Payment <span className="opacity-80">({counts.pendingCollection})</span>
          </button>
        </div>
      </div>

      {/* 5. REDESIGNED 7-COLUMN RESPONSIVE ERP TABLE (No Horizontal Scroll on Normal Desktop) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">
        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-rose-800 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{typeof error === "string" ? error : "Unable to load dispatch memos."}</span>
            </div>
            <button
              type="button"
              onClick={loadMemos}
              className="px-3 py-1 bg-white text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 font-bold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[850px] lg:min-w-full">
            {/* Table Header (~50-54px height) */}
            <thead className="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
              <tr>
                {/* 1. Memo */}
                <th className="py-3.5 px-3 whitespace-nowrap w-[120px]">
                  Memo
                </th>

                {/* 2. Route */}
                <th className="py-3.5 px-3 min-w-[170px]">
                  Route
                </th>

                {/* 3. Contents */}
                <th className="py-3.5 px-3 whitespace-nowrap w-[110px]">
                  Contents
                </th>

                {/* 4. Total Amount */}
                <th className="py-3.5 px-3 text-right whitespace-nowrap w-[115px]">
                  Total Amount
                </th>

                {/* 5. To Pay */}
                <th className="py-3.5 px-3 text-right whitespace-nowrap w-[110px]">
                  To Pay
                </th>

                {/* 6. Memo Status */}
                <th className="py-3.5 px-2.5 whitespace-nowrap w-[110px] text-center">
                  Memo Status
                </th>

                {/* 7. Collection */}
                <th className="py-3.5 px-3 whitespace-nowrap w-[130px]">
                  Collection
                </th>

                {/* 8. Actions */}
                <th className="py-3.5 px-3 text-right whitespace-nowrap w-[165px]">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body (~72-80px row height) */}
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {isLoading ? (
                // SKELETON LOADING STATE
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse h-[74px]">
                    <td className="py-3.5 px-3">
                      <div className="h-4 w-20 bg-slate-200 rounded mb-1.5"></div>
                      <div className="h-3 w-14 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4 w-32 bg-slate-200 rounded mb-1.5"></div>
                      <div className="h-3 w-28 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-3.5 w-16 bg-slate-200 rounded mb-1.5"></div>
                      <div className="h-3 w-16 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div>
                    </td>
                    <td className="py-3.5 px-2.5 text-center">
                      <div className="h-5 w-20 bg-slate-200 rounded-md mx-auto"></div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="h-4.5 w-16 bg-slate-200 rounded-md mb-1.5"></div>
                      <div className="h-3 w-20 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="h-7 w-28 bg-slate-200 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredMemos.length === 0 ? (
                // EMPTY STATE
                <tr>
                  <td colSpan="8" className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3 border border-orange-100 shadow-2xs">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-sm">
                        No dispatch memos found
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                        {hasActiveFilters
                          ? "No memos match your current search query or active filters."
                          : "Create your first memo to dispatch bookings from this branch to a delivery branch."}
                      </p>
                      {isBookingBranch && !hasActiveFilters && (
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.MEMOS.NEW)}
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
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
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer border-l-4 border-l-orange-500/90 h-[74px]"
                    >
                      {/* 1. Memo (Memo No + Date) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono text-xs font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                          {m.memoNumber || "MEM-0000"}
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-semibold mt-0.5">
                          {formatDate(m.memoDate ?? m.date ?? m.createdAt)}
                        </div>
                      </td>

                      {/* 2. Route (Origin -> Destination) */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-bold text-slate-800 truncate" title={m.fromBranch?.name || "Origin Branch"}>
                          {m.fromBranch?.name || "Ahmednagar Booking"}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-800 truncate mt-0.5" title={m.toBranch?.name || "Destination Branch"}>
                          <span className="text-orange-500 font-black">→</span>
                          <span className="truncate">{m.toBranch?.name || "Jamkhed Delivery"}</span>
                        </div>
                      </td>

                      {/* 3. Contents (Bilties + Packages) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-xs font-extrabold text-slate-800">
                          {biltyCount} {biltyCount === 1 ? "Bilty" : "Bilties"}
                        </div>
                        <div className="text-[11.5px] text-slate-500 font-semibold mt-0.5">
                          {packageCount} Packages
                        </div>
                      </td>

                      {/* 4. Total Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono text-xs font-black text-slate-900">
                          {formatCurrency(totalMoneyVal)}
                        </div>
                      </td>

                      {/* 5. To Pay */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="font-mono text-xs font-black text-orange-600">
                          {formatCurrency(totalToPayVal)}
                        </div>
                      </td>

                      {/* 6. Memo Status (CREATED | IN_TRANSIT | RECEIVED) */}
                      <td className="py-3 px-2.5 whitespace-nowrap text-center">
                        <MemoStatusBadge type="status" value={memoStatus} />
                      </td>

                      {/* 7. Collection (Badge + Outstanding Amount) */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div>
                          <MemoStatusBadge type="collection" value={m.collectionStatus || "PENDING"} />
                        </div>
                        <div className="text-[11.5px] font-mono font-bold text-slate-500 mt-0.5">
                          {pendingVal > 0 ? (
                            <span className="text-amber-700">{formatCurrency(pendingVal)} outstanding</span>
                          ) : (
                            <span className="text-emerald-700">₹0 outstanding</span>
                          )}
                        </div>
                      </td>

                      {/* 8. Actions (Record Payment / View + Floating Portal Menu) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
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

      {/* ========================================================================= */}
      {/* ACTION CONFIRMATION MODALS (Portal Dialogs) */}
      {/* ========================================================================= */}

      {/* DISPATCH MODAL */}
      {dispatchModalMemo &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Dispatch Manifest?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {dispatchModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                <p className="font-medium leading-relaxed">
                  Mark this memo as <b>In Transit</b> to <b>{dispatchModalMemo.toBranch?.name}</b>?
                </p>
                <p className="text-[11px] text-slate-500">
                  Total {dispatchModalMemo.totalBookings ?? dispatchModalMemo.bookingsCount ?? 0} bilties will be set on route.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDispatchModalMemo(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Receive Manifest?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {receiveModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                <p className="font-medium leading-relaxed">
                  Confirm arrival and acknowledge receipt of goods at your branch?
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReceiveModalMemo(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceive}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Record Payment
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {collectionModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConfirmCollection} className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Total To-Pay:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(collectionModalMemo.totalAmount ?? collectionModalMemo.totalToPay ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Pending To-Pay:</span>
                    <span className="font-mono font-black text-amber-700">
                      {formatCurrency(collectionModalMemo.pendingAmount ?? 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Amount Received (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={settlementAmount}
                    onChange={(e) => setSettlementAmount(e.target.value)}
                    placeholder="Enter received amount in ₹..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500 font-black font-mono text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCollectionModalMemo(null)}
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Delete Manifest?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {deleteModalMemo.memoNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100">
                <p className="text-xs text-slate-700 font-bold">
                  Are you sure you want to delete this draft manifest?
                </p>
                <p className="text-[11px] text-rose-600 font-medium">
                  Associated bilties will be unlinked and returned to pending dispatch.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalMemo(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
