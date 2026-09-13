import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  UserCheck,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Receipt,
  CreditCard,
  CheckSquare,
  Square,
  BookOpen,
} from "lucide-react";
import { getDeliveryBoys } from "@/services/deliveryBoy.service";
import {
  getDeliveryBoyLedger,
  getDeliveryBoyBalance,
  getOutstandingCollections,
  settleSelectedCollections,
} from "@/services/deliveryBoyLedger.service";
import SettleDeliveryBoyModal from "@/components/finance/SettleDeliveryBoyModal";
import DailyReportModal from "@/components/finance/DailyReportModal";
import { ROUTES } from "@/constants/paths";

export default function DeliveryBoyLedgerPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const branchType = user?.branch?.type || user?.branchType;

  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedDeliveryBoyId, setSelectedDeliveryBoyId] = useState("");
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState({ balance: 0 });
  const [loadingBoys, setLoadingBoys] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isDailyReportModalOpen, setIsDailyReportModalOpen] = useState(false);
  const [outstandingData, setOutstandingData] = useState({
    collections: [],
    totalOutstanding: 0,
  });
  const [selectedLedgerIds, setSelectedLedgerIds] = useState([]);
  const [submittingSettleSelected, setSubmittingSettleSelected] = useState(false);
  const [activeTab, setActiveTab] = useState("OUTSTANDING"); // "OUTSTANDING" | "STATEMENT"
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch Delivery Boys list
  const fetchBoys = useCallback(async () => {
    setLoadingBoys(true);
    try {
      const res = await getDeliveryBoys();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDeliveryBoys(list);
      if (list.length > 0 && !selectedDeliveryBoyId) {
        setSelectedDeliveryBoyId(list[0]._id);
      }
    } catch (err) {
      console.error("Error fetching delivery boys:", err);
      showToast("Failed to load delivery boys list.", "error");
    } finally {
      setLoadingBoys(false);
    }
  }, [selectedDeliveryBoyId, showToast]);

  useEffect(() => {
    fetchBoys();
  }, [fetchBoys]);

  // Fetch selected delivery boy ledger, balance, and outstanding collections
  const fetchLedgerData = useCallback(async () => {
    if (!selectedDeliveryBoyId) {
      setLedgerEntries([]);
      setBalanceInfo({ balance: 0 });
      setOutstandingData({ collections: [], totalOutstanding: 0 });
      setSelectedLedgerIds([]);
      return;
    }
    setLoadingLedger(true);
    try {
      const [ledgerRes, balanceRes, outstandingRes] = await Promise.all([
        getDeliveryBoyLedger(selectedDeliveryBoyId),
        getDeliveryBoyBalance(selectedDeliveryBoyId),
        getOutstandingCollections(selectedDeliveryBoyId),
      ]);
      setLedgerEntries(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
      if (balanceRes.data) {
        setBalanceInfo(balanceRes.data);
      }
      if (outstandingRes.data) {
        setOutstandingData({
          collections: Array.isArray(outstandingRes.data.collections)
            ? outstandingRes.data.collections
            : [],
          totalOutstanding: Number(outstandingRes.data.totalOutstanding || 0),
        });
      }
      setSelectedLedgerIds([]);
    } catch (err) {
      console.error("Error fetching delivery boy ledger:", err);
      showToast("Failed to load delivery boy ledger.", "error");
    } finally {
      setLoadingLedger(false);
    }
  }, [selectedDeliveryBoyId, showToast]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const selectedBoyObj = useMemo(() => {
    return deliveryBoys.find((b) => (b._id || b.id) === selectedDeliveryBoyId);
  }, [deliveryBoys, selectedDeliveryBoyId]);

  // Selection & Bill-wise Settlement Handlers
  const unpaidCollections = useMemo(() => {
    return outstandingData.collections.filter(
      (item) => !item.settlementTransaction && item.status !== "PAID"
    );
  }, [outstandingData.collections]);

  const handleToggleSelect = (item) => {
    if (!item) return;
    const isPaid = !!item.settlementTransaction || item.status === "PAID";
    if (isPaid) return;
    const id = typeof item === "string" ? item : item._id;
    setSelectedLedgerIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllOutstanding = () => {
    if (
      selectedLedgerIds.length === unpaidCollections.length &&
      unpaidCollections.length > 0
    ) {
      setSelectedLedgerIds([]);
    } else {
      setSelectedLedgerIds(unpaidCollections.map((item) => item._id));
    }
  };

  const selectedTotalAmount = useMemo(() => {
    return outstandingData.collections
      .filter((item) => selectedLedgerIds.includes(item._id))
      .reduce((sum, item) => sum + Number(item.debit || 0), 0);
  }, [outstandingData.collections, selectedLedgerIds]);

  const handleSettleSelectedSubmit = async () => {
    if (selectedLedgerIds.length === 0) return;
    setSubmittingSettleSelected(true);
    try {
      await settleSelectedCollections(selectedDeliveryBoyId, {
        ledgerIds: selectedLedgerIds,
        paymentMode: "CASH",
        remarks: `Bill-wise cash settlement for ${selectedLedgerIds.length} collections`,
      });
      showToast(
        `Successfully settled ${formatCurrency(selectedTotalAmount)} (${selectedLedgerIds.length} bills)!`
      );
      fetchLedgerData();
    } catch (err) {
      console.error("Error settling selected collections:", err);
      showToast(
        err.response?.data?.message || "Failed to settle selected collections.",
        "error"
      );
    } finally {
      setSubmittingSettleSelected(false);
    }
  };

  // Calculate summary totals
  const totals = useMemo(() => {
    let collections = 0;
    let settlements = 0;
    ledgerEntries.forEach((entry) => {
      collections += Number(entry.debit || 0);
      settlements += Number(entry.credit || 0);
    });
    return {
      collections,
      settlements,
      balance: balanceInfo.balance ?? (collections - settlements),
    };
  }, [ledgerEntries, balanceInfo]);

  // Filtered ledger statement entries
  const filteredLedger = useMemo(() => {
    return ledgerEntries.filter((entry) => {
      const matchesType = typeFilter === "ALL" || entry.type === typeFilter;
      const q = searchQuery.toLowerCase().trim();
      const bookingNo = entry.booking?.bookingNumber?.toLowerCase() || "";
      const remarks = entry.remarks?.toLowerCase() || "";
      const matchesSearch = !q || bookingNo.includes(q) || remarks.includes(q);
      return matchesType && matchesSearch;
    });
  }, [ledgerEntries, typeFilter, searchQuery]);

  // Filtered outstanding collections table
  const filteredOutstandingCollections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return outstandingData.collections;
    return outstandingData.collections.filter((item) => {
      const bookingNo = item.booking?.bookingNumber?.toLowerCase() || "";
      const shopName = (
        item.paymentTransaction?.customer?.shopName ||
        item.booking?.customer?.shopName ||
        item.booking?.customer?.name ||
        ""
      ).toLowerCase();
      return bookingNo.includes(q) || shopName.includes(q);
    });
  }, [outstandingData.collections, searchQuery]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "CUSTOMER_COLLECTION":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626]" /> Cash Collected (Debit)
          </span>
        );
      case "SETTLEMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" /> Settled to Office (Credit)
          </span>
        );
      case "ADJUSTMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Adjustment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
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
            Delivery Boy Ledger Access Restricted
          </h2>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Delivery Boy Ledgers are available exclusively for <strong className="text-[#0F172A]">DELIVERY</strong> branches. Your current branch ({user?.branch?.name || "Logged-in Branch"}) is registered as a <strong className="text-[#D97706]">BOOKING</strong> branch.
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
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] space-y-6 select-none">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "error"
              ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
              : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Breadcrumb + Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Finance</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Delivery Boy Ledger</span>
          </div>
          <h1 className="!text-xl !my-0 font-bold text-[#0F172A] tracking-tight leading-snug">
            Delivery Boy Ledger & Cash Settlement
          </h1>
          <p className="text-xs text-[#64748B] font-normal">
            Monitor cash collections, office settlements, and pending cash balances
          </p>
        </div>

        {/* Right: Actions & Delivery Boy Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Delivery Boy Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
            <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
            <select
              value={selectedDeliveryBoyId}
              onChange={(e) => setSelectedDeliveryBoyId(e.target.value)}
              disabled={loadingBoys}
              className="bg-transparent text-xs font-semibold text-[#0F172A] focus:outline-none cursor-pointer py-1 max-w-[220px]"
            >
              {deliveryBoys.length === 0 ? (
                <option value="">No Delivery Boys</option>
              ) : (
                deliveryBoys.map((boy) => (
                  <option key={boy._id} value={boy._id}>
                    {boy.name} {boy.mobile ? `(${boy.mobile})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchLedgerData}
            disabled={loadingLedger || !selectedDeliveryBoyId}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingLedger ? "animate-spin text-orange-600" : ""}`}
            />
          </button>

          {/* Daily Collection Memo Button */}
          <button
            type="button"
            onClick={() => setIsDailyReportModalOpen(true)}
            disabled={!selectedBoyObj}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#0F172A] font-semibold px-3.5 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Daily Memo</span>
          </button>

          {/* Settle Cash Button */}
          <button
            type="button"
            onClick={() => setIsSettleModalOpen(true)}
            disabled={!selectedBoyObj}
            className="inline-flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            <span>Settle Cash</span>
          </button>
        </div>
      </div>

      {/* STATISTICS / KPI CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pending Cash Balance */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Pending Cash Balance
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-orange-600 tracking-tight font-mono block">
              {formatCurrency(totals.balance)}
            </span>
            <span className="text-xs text-[#64748B] font-medium block mt-0.5 truncate max-w-[220px]">
              Cash held by {selectedBoyObj?.name || "Delivery Boy"}
            </span>
          </div>
        </div>

        {/* Card 2: Total Customer Collections */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Collections (Debit)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.collections)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Cumulative cash collected from deliveries
            </span>
          </div>
        </div>

        {/* Card 3: Total Cash Settled */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Settled (Credit)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.settlements)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Cumulative cash deposited to office counter
            </span>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION & SEARCH (MATCHING CUSTOMER LEDGER PAGE) */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("OUTSTANDING")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "OUTSTANDING"
                ? "bg-white text-orange-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Outstanding Collections</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === "OUTSTANDING"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {unpaidCollections.length} Unpaid
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("STATEMENT")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "STATEMENT"
                ? "bg-white text-blue-600 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Statement History</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                activeTab === "STATEMENT"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {ledgerEntries.length}
            </span>
          </button>
        </div>

        {/* Right Search & Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder={
                activeTab === "OUTSTANDING"
                  ? "Search bilty #, customer..."
                  : "Search bilty #, remarks..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC]/50 hover:bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium text-[#0F172A]"
            />
          </div>

          {activeTab === "STATEMENT" && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">All Entries</option>
              <option value="CUSTOMER_COLLECTION">Cash Collected (Debit)</option>
              <option value="SETTLEMENT">Settlement (Credit)</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          )}
        </div>
      </div>

      {/* OUTSTANDING COLLECTIONS TAB CONTENT */}
      {activeTab === "OUTSTANDING" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden space-y-0">
          {/* Action Header & Selection Summary */}
          <div className="px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllOutstanding}
                disabled={unpaidCollections.length === 0}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer disabled:opacity-50"
              >
                {selectedLedgerIds.length > 0 &&
                selectedLedgerIds.length === unpaidCollections.length ? (
                  <CheckSquare className="w-4 h-4 text-orange-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({unpaidCollections.length})</span>
              </button>

              {selectedLedgerIds.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 border-l border-slate-200 pl-3">
                  Selected: <strong className="text-slate-800 font-mono">{selectedLedgerIds.length} Collections</strong>
                </span>
              )}
            </div>

            {/* Selected Total & Settle Button */}
            <div className="flex items-center gap-3">
              {selectedLedgerIds.length > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Selected Settlement Amount
                  </span>
                  <span className="text-sm font-bold text-orange-600 font-mono">
                    {formatCurrency(selectedTotalAmount)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSettleSelectedSubmit}
                disabled={selectedLedgerIds.length === 0 || submittingSettleSelected}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingSettleSelected ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                <span>Settle Selected Cash {selectedLedgerIds.length > 0 ? `(${formatCurrency(selectedTotalAmount)})` : ""}</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {loadingLedger ? (
            <div className="p-16 text-center text-[#64748B]">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-orange-600 mb-3" />
              <p className="text-xs font-semibold text-[#0F172A]">Fetching delivery boy customer collections...</p>
            </div>
          ) : filteredOutstandingCollections.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#0F172A]">No Outstanding Cash Collections</p>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto leading-relaxed">
                All customer collections for this delivery boy have been settled to the office counter!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#0F172A]">
                <thead className="bg-[#F1F5F9]/80 text-[#475569] font-bold text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3.5 px-4 w-10 text-center font-bold">Select</th>
                    <th className="py-3.5 px-4 font-bold">Bilty Number</th>
                    <th className="py-3.5 px-4 font-bold">Customer / Shop Name</th>
                    <th className="py-3.5 px-4 font-bold">Delivery Address</th>
                    <th className="py-3.5 px-4 text-right font-bold">Collected Cash Amount</th>
                    <th className="py-3.5 px-4 text-center font-bold">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredOutstandingCollections.map((item) => {
                    const isPaid = !!item.settlementTransaction || item.status === "PAID";
                    const isSelected = selectedLedgerIds.includes(item._id);
                    const shopName =
                      item.paymentTransaction?.customer?.shopName ||
                      item.booking?.customer?.shopName ||
                      item.booking?.customer?.name ||
                      "Direct Customer";
                    const address = item.booking?.deliveryAddress || "--";

                    return (
                      <tr
                        key={item._id}
                        onClick={() => handleToggleSelect(item)}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          isPaid
                            ? "bg-slate-50/70 opacity-80 cursor-default"
                            : isSelected
                            ? "bg-orange-50/40 cursor-pointer"
                            : "cursor-pointer"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            disabled={isPaid}
                            checked={isSelected}
                            onChange={() => handleToggleSelect(item)}
                            className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">
                          {item.booking?.bookingNumber ? (
                            <span className="inline-flex items-center gap-1.5 text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-[#BFDBFE]">
                              <Receipt className="w-3.5 h-3.5 text-[#2563EB]" />
                              #{item.booking.bookingNumber}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8]">Direct</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                          {shopName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {address}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-orange-600">
                          <span className="bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                            +{formatCurrency(item.debit || 0)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> SETTLED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <Clock className="w-3.5 h-3.5" /> UNSETTLED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STATEMENT HISTORY TAB CONTENT */}
      {activeTab === "STATEMENT" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider m-0">
                Delivery Boy Ledger Statement
              </h2>
            </div>
            <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-xs font-bold border border-[#BFDBFE]">
              {filteredLedger.length} {filteredLedger.length === 1 ? "Record" : "Records"}
            </span>
          </div>

          {loadingLedger ? (
            <div className="p-16 text-center text-[#64748B]">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#2563EB] mb-3" />
              <p className="text-xs font-semibold text-[#0F172A]">Fetching delivery boy ledger statement...</p>
            </div>
          ) : filteredLedger.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mx-auto mb-3 border border-[#E2E8F0]">
                <Wallet className="w-6 h-6 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-bold text-[#0F172A]">No Ledger Transactions Found</p>
              <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto leading-relaxed">
                Transactions will automatically populate when deliveries are collected or cash is settled to the counter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#0F172A]">
                <thead className="bg-[#F1F5F9]/80 text-[#475569] font-bold text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Date & Time</th>
                    <th className="py-3.5 px-4 font-bold">Entry Type</th>
                    <th className="py-3.5 px-4 font-bold">Linked Ref</th>
                    <th className="py-3.5 px-4 text-right font-bold">Debit (Collected)</th>
                    <th className="py-3.5 px-4 text-right font-bold">Credit (Settled)</th>
                    <th className="py-3.5 px-4 text-right font-bold">Running Balance</th>
                    <th className="py-3.5 px-4 font-bold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredLedger.map((item) => {
                    const itemDate = new Date(item.createdAt);
                    const dateStr = itemDate.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const timeStr = itemDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={item._id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0F172A] text-xs">
                              {dateStr}
                            </span>
                            <span className="text-[11px] text-[#94A3B8] font-mono font-medium">
                              {timeStr}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getTypeBadge(item.type)}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.booking?.bookingNumber ? (
                            <span className="inline-flex items-center gap-1.5 text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-[#BFDBFE]">
                              <Receipt className="w-3.5 h-3.5 text-[#2563EB]" />
                              Bilty: #{item.booking.bookingNumber}
                            </span>
                          ) : item.paymentTransaction ? (
                            <span className="inline-flex items-center gap-1.5 text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-[#A7F3D0]">
                              <CreditCard className="w-3.5 h-3.5 text-[#059669]" />
                              Txn: #{item.paymentTransaction.type || "SETTLEMENT"}
                            </span>
                          ) : (
                            <span className="text-[#94A3B8] text-xs font-medium">Direct Entry</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#DC2626] whitespace-nowrap">
                          {item.debit > 0 ? (
                            <span className="bg-[#FEF2F2] px-2.5 py-1 rounded-lg border border-[#FECACA]">
                              +{formatCurrency(item.debit)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#059669] whitespace-nowrap">
                          {item.credit > 0 ? (
                            <span className="bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
                              -{formatCurrency(item.credit)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F172A] whitespace-nowrap">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                            {formatCurrency(item.balance || 0)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#64748B] max-w-xs truncate">
                          {item.remarks ? (
                            <span title={item.remarks}>{item.remarks}</span>
                          ) : (
                            <span className="text-[#94A3B8]">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settlement & Daily Memo Modals */}
      {selectedBoyObj && (
        <>
          <SettleDeliveryBoyModal
            isOpen={isSettleModalOpen}
            deliveryBoy={selectedBoyObj}
            currentBalance={totals.balance}
            onClose={() => setIsSettleModalOpen(false)}
            onSuccess={() => {
              showToast("Settlement recorded successfully!");
              fetchLedgerData();
            }}
          />
          <DailyReportModal
            isOpen={isDailyReportModalOpen}
            deliveryBoy={selectedBoyObj}
            onClose={() => setIsDailyReportModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
