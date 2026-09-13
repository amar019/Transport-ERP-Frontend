import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getPayments,
  getPaymentSummary,
  reversePayment,
  recordRefund,
  recordMemoSettlement,
} from "@/services/payment.service";
import { getMemos } from "@/services/memo.service";
import {
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  Receipt,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  User,
  RotateCcw,
  Eye,
} from "lucide-react";

export default function PaymentListPage() {
  // Main Data States
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    todayInflow: 0,
    todayOutflow: 0,
    todayNetMovement: 0,
    periodInflow: 0,
    periodOutflow: 0,
    periodNetMovement: 0,
  });
  const [loading, setLoading] = useState(false);
  const [memosLoading, setMemosLoading] = useState(false);
  const [memos, setMemos] = useState([]);
  const [toast, setToast] = useState(null);

  // Filter States
  const [filters, setFilters] = useState({
    search: "",
    type: "ALL",
    category: "ALL",
    paymentMode: "ALL",
    startDate: "",
    endDate: "",
  });

  // Modals State
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  const [reversalTarget, setReversalTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Settlement Form State
  const [settlementForm, setSettlementForm] = useState({
    memoId: "",
    amount: "",
    paymentMode: "BANK_TRANSFER",
    referenceNumber: "",
    remarks: "",
  });

  // Refund Form State
  const [refundForm, setRefundForm] = useState({
    amount: "",
    paymentMode: "CASH",
    referenceNumber: "",
    remarks: "",
  });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 1. Fetch Payments and Summary
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const activeParams = {};
      if (filters.type && filters.type !== "ALL") activeParams.type = filters.type;
      if (filters.category && filters.category !== "ALL") activeParams.category = filters.category;
      if (filters.paymentMode && filters.paymentMode !== "ALL") activeParams.paymentMode = filters.paymentMode;
      if (filters.startDate) activeParams.startDate = filters.startDate;
      if (filters.endDate) activeParams.endDate = filters.endDate;
      if (filters.search) activeParams.search = filters.search;

      const [payRes, sumRes] = await Promise.all([
        getPayments(activeParams),
        getPaymentSummary(activeParams),
      ]);

      const list = Array.isArray(payRes.data) ? payRes.data : payRes.data?.data || [];
      setPayments(list);
      if (sumRes.data) {
        setSummary(sumRes.data);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      showToast(err.response?.data?.message || "Failed to load payment transactions.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch pending Memos for settlement dropdown
  const fetchEligibleMemos = async () => {
    setMemosLoading(true);
    try {
      const res = await getMemos({ status: "RECEIVED" });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      // Filter memos with pending amounts
      const pendingList = list.filter(
        (m) => (m.pendingAmount !== undefined ? m.pendingAmount : (m.totalToPay || m.totalAmount || 0) - (m.receivedAmount || 0)) > 0
      );
      setMemos(pendingList);
    } catch (err) {
      console.error("Error fetching memos:", err);
    } finally {
      setMemosLoading(false);
    }
  };

  const handleOpenSettlementModal = () => {
    fetchEligibleMemos();
    setSettlementForm({
      memoId: "",
      amount: "",
      paymentMode: "BANK_TRANSFER",
      referenceNumber: "",
      remarks: "",
    });
    setIsSettlementModalOpen(true);
  };

  // Selected memo calculations
  const selectedMemoObj = useMemo(() => {
    return memos.find((m) => m._id === settlementForm.memoId);
  }, [memos, settlementForm.memoId]);

  const selectedMemoPending = useMemo(() => {
    if (!selectedMemoObj) return 0;
    if (selectedMemoObj.pendingAmount !== undefined) return selectedMemoObj.pendingAmount;
    const totalToPay = selectedMemoObj.totalToPay || selectedMemoObj.totalAmount || 0;
    const received = selectedMemoObj.receivedAmount || 0;
    return Math.max(totalToPay - received, 0);
  }, [selectedMemoObj]);

  // Submit Settlement
  const handleSettlementSubmit = async (e) => {
    e.preventDefault();
    if (!settlementForm.memoId) {
      showToast("Please select a memo to settle.", "error");
      return;
    }
    const amt = Number(settlementForm.amount);
    if (!amt || amt <= 0) {
      showToast("Please enter a valid positive settlement amount.", "error");
      return;
    }
    if (amt > selectedMemoPending) {
      showToast(`Settlement amount (₹${amt}) cannot exceed pending memo amount (₹${selectedMemoPending}).`, "error");
      return;
    }

    setSubmitting(true);
    try {
      await recordMemoSettlement(settlementForm.memoId, {
        amountReceived: amt,
        amount: amt,
        paymentMode: settlementForm.paymentMode,
        referenceNumber: settlementForm.referenceNumber,
        remarks: settlementForm.remarks,
      });
      showToast("Memo settlement recorded successfully!");
      setIsSettlementModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error recording memo settlement:", err);
      showToast(err.response?.data?.message || "Failed to record settlement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Refund
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(refundForm.amount);
    if (!amt || amt <= 0) {
      showToast("Please enter a valid refund amount.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await recordRefund(refundForm);
      showToast("Refund recorded successfully!");
      setIsRefundModalOpen(false);
      setRefundForm({ amount: "", paymentMode: "CASH", referenceNumber: "", remarks: "" });
      fetchData();
    } catch (err) {
      console.error("Error recording refund:", err);
      showToast(err.response?.data?.message || "Failed to record refund.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Reversal
  const handleConfirmReversal = async () => {
    if (!reversalReason.trim()) {
      showToast("Please enter a reason for reversal.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await reversePayment(reversalTarget._id, reversalReason.trim());
      showToast("Payment transaction reversed successfully.");
      setReversalTarget(null);
      setReversalReason("");
      fetchData();
    } catch (err) {
      console.error("Error reversing payment:", err);
      showToast(err.response?.data?.message || "Failed to reverse payment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper Badge Renderers
  const getCategoryBadge = (category) => {
    switch (category) {
      case "BOOKING_PAYMENT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Booking Paid</span>;
      case "MEMO_SETTLEMENT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Memo Settlement</span>;
      case "EXPENSE_PAYOUT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Expense Payout</span>;
      case "REFUND":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Refund</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{category}</span>;
    }
  };

  const getTypeBadge = (type) => {
    if (type === "INFLOW") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> INFLOW
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> OUTFLOW
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${toast.type === "error"
            ? "bg-rose-50 text-rose-800 border-rose-200"
            : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
        >
          {toast.type === "error" ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 bg-white py-2.5 px-4 rounded-xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="!text-xl !my-0 font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            Payment Transactions
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsRefundModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            Record Refund
          </button>
          <button
            onClick={handleOpenSettlementModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Memo Settlement
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Inflow */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase">Total Inflow</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-700">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">₹{(summary.periodInflow ?? summary.todayInflow ?? 0).toLocaleString()}</span>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Today: ₹{(summary.todayInflow || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Paid Bookings + Memo Settlements received</p>
        </div>

        {/* Total Outflow */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white p-5 rounded-2xl border border-rose-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 tracking-wider uppercase">Total Outflow</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">₹{(summary.periodOutflow ?? summary.todayOutflow ?? 0).toLocaleString()}</span>
            <span className="text-xs font-medium text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              Today: ₹{(summary.todayOutflow || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Expenses paid + Refunds issued</p>
        </div>

        {/* Net Movement */}
        <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-50/50 to-white p-5 rounded-2xl border border-indigo-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 tracking-wider uppercase">Net Movement</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`text-2xl font-extrabold ${(summary.periodNetMovement ?? summary.todayNetMovement ?? 0) >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
            >
              {(summary.periodNetMovement ?? summary.todayNetMovement ?? 0) >= 0 ? "+" : ""}₹{(summary.periodNetMovement ?? summary.todayNetMovement ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
              Today: {summary.todayNetMovement >= 0 ? "+" : ""}₹{(summary.todayNetMovement || 0).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Net cash movement (Inflow minus Outflow)</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search Pay #, Ref #, remarks..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Type */}
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="ALL">All Types (Inflow & Outflow)</option>
            <option value="INFLOW">INFLOW (Money In)</option>
            <option value="OUTFLOW">OUTFLOW (Money Out)</option>
          </select>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="BOOKING_PAYMENT">Booking Paid</option>
            <option value="MEMO_SETTLEMENT">Memo Settlement</option>
            <option value="EXPENSE_PAYOUT">Expense Payout</option>
            <option value="REFUND">Refund</option>
          </select>

          {/* Mode */}
          <select
            value={filters.paymentMode}
            onChange={(e) => setFilters((prev) => ({ ...prev, paymentMode: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI (GPay/PhonePe)</option>
            <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
            <option value="CHEQUE">Cheque</option>
          </select>

          {/* Date Picker Start */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Transaction History ({payments.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-sm">Loading payment transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-base font-medium text-slate-600">No payment transactions found</p>
            <p className="text-xs text-slate-400 mt-1">
              Transactions will automatically appear here when bookings are paid upfront, memo settlements are recorded, or expenses are added.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Transaction #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Linked Source</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((item) => {
                  const isReversed = item.status === "REVERSED";
                  return (
                    <tr key={item._id} className={`hover:bg-slate-50/80 transition-colors ${isReversed ? "bg-slate-50/50 opacity-60" : ""}`}>
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600">{item.transactionNumber}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                        {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                        <span className="text-slate-400 ml-1">
                          {new Date(item.transactionDate || item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">{getTypeBadge(item.type)}</td>
                      <td className="py-3.5 px-4">{getCategoryBadge(item.category)}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {item.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-800">
                        {item.booking?.bookingNumber ? (
                          <span className="text-blue-600 font-mono">Bilty: {item.booking.bookingNumber}</span>
                        ) : item.memo?.memoNumber ? (
                          <span className="text-emerald-600 font-mono">Memo: {item.memo.memoNumber}</span>
                        ) : item.expense?.category ? (
                          <span className="text-amber-600">Exp: {item.expense.category}</span>
                        ) : (
                          <span className="text-slate-400">Direct</span>
                        )}
                        {item.referenceNumber && <span className="block text-[11px] text-slate-400 font-mono">Ref: {item.referenceNumber}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                        <span className={item.type === "INFLOW" ? "text-emerald-600" : "text-slate-800"}>
                          {item.type === "INFLOW" ? "+" : "-"}₹{(item.amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isReversed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600 line-through">
                            REVERSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPaymentDetails(item)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isReversed && (
                            <button
                              onClick={() => setReversalTarget(item)}
                              title="Reverse Payment"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Memo Settlement Modal */}
      {isSettlementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Record Memo Settlement
              </h3>
              <button
                onClick={() => setIsSettlementModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettlementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Memo (Received / Pending Collection)
                </label>
                {memosLoading ? (
                  <p className="text-xs text-slate-400">Loading memos...</p>
                ) : (
                  <select
                    value={settlementForm.memoId}
                    onChange={(e) => setSettlementForm((prev) => ({ ...prev, memoId: e.target.value, amount: "" }))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Choose Memo --</option>
                    {memos.map((m) => {
                      const pending = m.pendingAmount !== undefined ? m.pendingAmount : (m.totalToPay || m.totalAmount || 0) - (m.receivedAmount || 0);
                      return (
                        <option key={m._id} value={m._id}>
                          {m.memoNumber} | Destination: {m.toBranch?.name || "Branch"} | Pending: ₹{pending.toLocaleString()}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {selectedMemoObj && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                  <div className="flex justify-between text-indigo-900 font-medium">
                    <span>Memo Total TO_PAY:</span>
                    <span>₹{(selectedMemoObj.totalToPay || selectedMemoObj.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Already Received:</span>
                    <span>₹{(selectedMemoObj.receivedAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-indigo-900 font-bold border-t border-indigo-200 pt-1">
                    <span>Server Pending Limit:</span>
                    <span className="text-indigo-700">₹{selectedMemoPending.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Settlement Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMemoPending || undefined}
                    step="any"
                    required
                    placeholder={`Max ₹${selectedMemoPending}`}
                    value={settlementForm.amount}
                    onChange={(e) => setSettlementForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Payment Mode</label>
                  <select
                    value={settlementForm.paymentMode}
                    onChange={(e) => setSettlementForm((prev) => ({ ...prev, paymentMode: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reference Number / UTR (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UTR123456789"
                  value={settlementForm.referenceNumber}
                  onChange={(e) => setSettlementForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Remarks (Optional)</label>
                <input
                  type="text"
                  placeholder="Settlement notes..."
                  value={settlementForm.remarks}
                  onChange={(e) => setSettlementForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettlementModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Record Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                Record Refund Outflow
              </h3>
              <button onClick={() => setIsRefundModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Refund Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="Enter amount"
                    value={refundForm.amount}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Payment Mode</label>
                  <select
                    value={refundForm.paymentMode}
                    onChange={(e) => setRefundForm((prev) => ({ ...prev, paymentMode: e.target.value }))}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reference Number (Optional)</label>
                <input
                  type="text"
                  placeholder="UPI transaction ID / UTR"
                  value={refundForm.referenceNumber}
                  onChange={(e) => setRefundForm((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Reason for issuing refund..."
                  value={refundForm.remarks}
                  onChange={(e) => setRefundForm((prev) => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Issue Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPaymentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                Transaction {selectedPaymentDetails.transactionNumber}
              </h3>
              <button onClick={() => setSelectedPaymentDetails(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Transaction Type:</span>
                <span>{getTypeBadge(selectedPaymentDetails.type)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Category:</span>
                <span>{getCategoryBadge(selectedPaymentDetails.category)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-slate-900 text-base">₹{(selectedPaymentDetails.amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-medium text-slate-800">{selectedPaymentDetails.paymentMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Date & Time:</span>
                <span>{new Date(selectedPaymentDetails.transactionDate || selectedPaymentDetails.createdAt).toLocaleString()}</span>
              </div>
              {selectedPaymentDetails.referenceNumber && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reference Number:</span>
                  <span className="font-mono text-slate-800">{selectedPaymentDetails.referenceNumber}</span>
                </div>
              )}
              {selectedPaymentDetails.remarks && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-0.5">Remarks:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">{selectedPaymentDetails.remarks}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPaymentDetails(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reversal Confirmation Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                Reverse Transaction {reversalTarget.transactionNumber}?
              </h3>
              <button onClick={() => setReversalTarget(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Reversing transaction <strong className="text-slate-900 font-mono">{reversalTarget.transactionNumber}</strong> (₹{reversalTarget.amount}) will mark its status as <strong className="text-rose-600">REVERSED</strong>. This action cannot be undone.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Reason for Reversal *</label>
              <textarea
                rows="2"
                required
                placeholder="State why this payment is being reversed..."
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReversalTarget(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReversal}
                disabled={submitting || !reversalReason.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {submitting ? "Reversing..." : "Confirm Reversal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
