import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  Truck,
  Building2,
  Calendar,
  IndianRupee,
  Eye,
  Printer,
  Trash2,
  ArrowRight,
  Inbox,
  Clock,
  Check,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { createPortal } from "react-dom";
import MemoStatusBadge from "../../components/memo/MemoStatusBadge";
import {
  fetchMemos,
  deleteMemoThunk,
  markMemoOnRouteThunk,
  markMemoReceivedThunk,
  updateMemoCollectionThunk,
} from "../../store/thunk/memoThunk";

export default function MemoList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { list: rawMemos, isLoading, error } = useSelector((state) => state.memos);

  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    collectionStatus: "ALL",
  });

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

  // Client filtering
  const filteredMemos = useMemo(() => {
    if (!Array.isArray(rawMemos)) return [];

    return rawMemos.filter((m) => {
      const q = (filters.search || "").toLowerCase().trim();
      const memoNo = (m.memoNumber || "").toLowerCase();
      const fromBranch = (m.fromBranch?.name || "").toLowerCase();
      const toBranch = (m.toBranch?.name || "").toLowerCase();
      const notes = (m.notes || "").toLowerCase();

      const matchSearch =
        !q ||
        memoNo.includes(q) ||
        fromBranch.includes(q) ||
        toBranch.includes(q) ||
        notes.includes(q);

      let matchStatus = true;
      if (filters.status !== "ALL") {
        matchStatus = m.status === filters.status;
      }

      let matchCollection = true;
      if (filters.collectionStatus !== "ALL") {
        matchCollection = m.collectionStatus === filters.collectionStatus;
      }

      return matchSearch && matchStatus && matchCollection;
    });
  }, [rawMemos, filters]);

  // KPI Metrics
  const kpiMetrics = useMemo(() => {
    if (!Array.isArray(rawMemos)) {
      return { total: 0, onRoute: 0, received: 0, toPayTotal: 0 };
    }

    let onRoute = 0;
    let received = 0;
    let toPayTotal = 0;

    rawMemos.forEach((m) => {
      if (m.status === "ON_ROUTE") onRoute++;
      if (m.status === "RECEIVED") received++;
      toPayTotal += Number(m.totalAmount ?? m.totalToPay ?? 0);
    });

    return {
      total: rawMemos.length,
      onRoute,
      received,
      toPayTotal,
    };
  }, [rawMemos]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Actions
  const handleConfirmDispatch = async () => {
    if (!dispatchModalMemo) return;
    try {
      setActionLoading(true);
      await dispatch(markMemoOnRouteThunk(dispatchModalMemo._id)).unwrap();
      showToast(`Memo ${dispatchModalMemo.memoNumber} dispatched on route!`, "success");
      setDispatchModalMemo(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to dispatch memo", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceive = async () => {
    if (!receiveModalMemo) return;
    try {
      setActionLoading(true);
      await dispatch(markMemoReceivedThunk(receiveModalMemo._id)).unwrap();
      showToast(`Memo ${receiveModalMemo.memoNumber} marked as received!`, "success");
      setReceiveModalMemo(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to receive memo", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalMemo) return;
    try {
      setActionLoading(true);
      await dispatch(deleteMemoThunk(deleteModalMemo._id)).unwrap();
      showToast(`Memo ${deleteModalMemo.memoNumber} deleted`, "success");
      setDeleteModalMemo(null);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to delete memo", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCollection = async (e) => {
    e.preventDefault();
    if (!collectionModalMemo) return;
    const amount = Number(settlementAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid received amount", "error");
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
      showToast("Settlement collection recorded successfully", "success");
      setCollectionModalMemo(null);
      setSettlementAmount("");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to record collection", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-3.5 md:p-5 font-sans antialiased selection:bg-orange-100 select-none space-y-4">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs md:text-sm font-bold">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {isDeliveryBranch ? "Incoming Memos & Deliveries" : "Dispatch Memos & Manifests"}
            </h1>
            <span className="bg-orange-100 text-orange-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
              {user?.branch?.name || "Branch"} • {user?.branch?.type || "BOOKING"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {isDeliveryBranch
              ? "Receive incoming vehicle shipments and manage deliveries."
              : "Generate dispatch manifests, track transit, and settle collections."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center flex-wrap gap-2">
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
              onClick={() => navigate("/memos/new")}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Memo</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Memos
            </span>
            <span className="text-xl md:text-2xl font-black text-slate-800 mt-0.5 block">
              {kpiMetrics.total}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
            <Truck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              In Transit
            </span>
            <span className="text-xl md:text-2xl font-black text-sky-600 mt-0.5 block">
              {kpiMetrics.onRoute}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Received
            </span>
            <span className="text-xl md:text-2xl font-black text-emerald-600 mt-0.5 block">
              {kpiMetrics.received}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Check className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total To-Pay Value
            </span>
            <span className="text-xl md:text-2xl font-black text-amber-600 mt-0.5 block">
              {formatCurrency(kpiMetrics.toPayTotal)}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <input
          type="text"
          placeholder="Search by Memo No, Branch, or Vehicle..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="w-full md:flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-1/2 md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Draft (Created)</option>
            <option value="ON_ROUTE">In Transit (On Route)</option>
            <option value="RECEIVED">Received</option>
          </select>

          <select
            value={filters.collectionStatus}
            onChange={(e) => setFilters((f) => ({ ...f, collectionStatus: e.target.value }))}
            className="w-1/2 md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Settlements</option>
            <option value="PENDING">Pending Collection</option>
            <option value="PARTIAL">Partial Settled</option>
            <option value="COMPLETED">Fully Settled</option>
          </select>
        </div>
      </div>

      {/* Memos Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-3">Memo No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3 text-center">Bilties</th>
                <th className="py-3 px-3 text-center">Packages</th>
                <th className="py-3 px-3 text-right">To-Pay (₹)</th>
                <th className="py-3 px-3 text-right">Settled (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Settlement</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-200 rounded"></div></td>
                    <td className="py-3 px-3"><div className="h-4 w-16 bg-slate-200 rounded"></div></td>
                    <td className="py-3 px-3"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                    <td className="py-3 px-3 text-center"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="py-3 px-3 text-center"><div className="h-4 w-8 bg-slate-200 rounded mx-auto"></div></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div></td>
                    <td className="py-3 px-3 text-right"><div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div></td>
                    <td className="py-3 px-3 text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="py-3 px-3 text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                    <td className="py-3 px-3 text-right"><div className="h-7 w-20 bg-slate-200 rounded ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredMemos.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3 border border-orange-100">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-slate-800 text-base">
                        No Memos Found
                      </h4>
                      <p className="text-slate-400 text-xs mt-1">
                        No dispatch manifests match your current filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMemos.map((m) => {
                  const mId = m._id || m.id;
                  const canDispatch = isBookingBranch && m.status === "CREATED";
                  const canReceive = isDeliveryBranch && m.status === "ON_ROUTE";
                  const canSettle = isBookingBranch && m.status === "RECEIVED" && m.collectionStatus !== "COMPLETED";
                  const canDelete = isBookingBranch && m.status === "CREATED";

                  return (
                    <tr key={mId} className="hover:bg-orange-50/50 transition-colors group">
                      {/* Memo No */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 group-hover:bg-orange-100 group-hover:text-orange-800 transition-colors">
                          {m.memoNumber}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-600 font-semibold whitespace-nowrap">
                        {formatDate(m.memoDate || m.date || m.createdAt)}
                      </td>

                      {/* Route */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <span className="truncate max-w-[100px]">{m.fromBranch?.name || "Origin"}</span>
                          <span className="text-orange-500 font-black">→</span>
                          <span className="truncate max-w-[100px] text-orange-700 font-extrabold">{m.toBranch?.name || "Dest"}</span>
                        </div>
                      </td>

                      {/* Bilties count */}
                      <td className="py-3 px-3 text-center font-extrabold text-slate-800">
                        {m.bookingsCount ?? m.totalBookings ?? m.bookings?.length ?? 0}
                      </td>

                      {/* Packages count */}
                      <td className="py-3 px-3 text-center font-bold text-slate-600">
                        {m.totalPackages ?? 0}
                      </td>

                      {/* Total To-Pay */}
                      <td className="py-3 px-3 text-right font-black text-amber-600 whitespace-nowrap">
                        {formatCurrency(m.totalAmount ?? m.totalToPay ?? 0)}
                      </td>

                      {/* Settled / Received Amount */}
                      <td className="py-3 px-3 text-right font-black text-emerald-600 whitespace-nowrap">
                        {formatCurrency(m.receivedAmount ?? m.totalCollected ?? 0)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <MemoStatusBadge type="status" value={m.status} />
                      </td>

                      {/* Settlement */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <MemoStatusBadge type="collection" value={m.collectionStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => navigate(`/memos/${mId}`)}
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            title="View Manifest"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Manifest */}
                          <button
                            type="button"
                            onClick={() => navigate(`/memo-preview?id=${mId}`)}
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                            title="Print Manifest (A4)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Dispatch (Booking branch only, when CREATED) */}
                          {canDispatch && (
                            <button
                              type="button"
                              onClick={() => setDispatchModalMemo(m)}
                              className="px-2.5 py-1 text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              title="Dispatch On Route"
                            >
                              <Send className="w-3 h-3" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {/* Mark Received (Delivery branch only, when ON_ROUTE) */}
                          {canReceive && (
                            <button
                              type="button"
                              onClick={() => setReceiveModalMemo(m)}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              title="Confirm Arrival"
                            >
                              <Check className="w-3 h-3" />
                              <span>Receive</span>
                            </button>
                          )}

                          {/* Record Settlement (Booking branch only, when RECEIVED) */}
                          {canSettle && (
                            <button
                              type="button"
                              onClick={() => {
                                setCollectionModalMemo(m);
                                const toPay = m.totalAmount ?? m.totalToPay ?? 0;
                                const collected = m.receivedAmount ?? m.totalCollected ?? 0;
                                setSettlementAmount(m.pendingAmount ?? Math.max(0, toPay - collected));
                              }}
                              className="px-2.5 py-1 text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                              title="Record Collection Settlement"
                            >
                              <IndianRupee className="w-3 h-3" />
                              <span>Settle</span>
                            </button>
                          )}

                          {/* Delete (Booking branch only, when CREATED) */}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteModalMemo(m)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="Delete Draft Memo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchModalMemo &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Dispatch Memo?</h3>
                  <p className="text-xs text-slate-500 font-medium">{dispatchModalMemo.memoNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Mark this memo as <b>In Transit / On Route</b> to {dispatchModalMemo.toBranch?.name}.
              </p>

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
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Dispatch"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Receive Modal */}
      {receiveModalMemo &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Mark Memo Received?</h3>
                  <p className="text-xs text-slate-500 font-medium">{receiveModalMemo.memoNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Confirm vehicle arrival and receive {receiveModalMemo.totalBookings || receiveModalMemo.bookings?.length} bilties at your delivery branch.
              </p>

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
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Arrival"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Modal */}
      {deleteModalMemo &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Delete Memo?</h3>
                  <p className="text-xs text-slate-500 font-medium">{deleteModalMemo.memoNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Are you sure you want to delete this draft memo? Linked bilties will be unlocked.
              </p>

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
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Collection Settlement Modal */}
      {collectionModalMemo &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <form
              onSubmit={handleConfirmCollection}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Record Settlement</h3>
                  <p className="text-xs text-slate-500 font-medium">{collectionModalMemo.memoNumber}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Total TO_PAY Value:</span>
                  <span>{formatCurrency(collectionModalMemo.totalAmount ?? collectionModalMemo.totalToPay ?? 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Already Collected:</span>
                  <span>{formatCurrency(collectionModalMemo.receivedAmount ?? collectionModalMemo.totalCollected ?? 0)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-amber-700 pt-1 border-t border-slate-200">
                  <span>Pending Balance:</span>
                  <span>
                    {formatCurrency(
                      collectionModalMemo.pendingAmount ??
                        ((collectionModalMemo.totalAmount ?? collectionModalMemo.totalToPay ?? 0) -
                          (collectionModalMemo.receivedAmount ?? collectionModalMemo.totalCollected ?? 0))
                    )}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Received from Delivery Branch (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="Enter amount in ₹"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-extrabold text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
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
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Settlement"}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
}
