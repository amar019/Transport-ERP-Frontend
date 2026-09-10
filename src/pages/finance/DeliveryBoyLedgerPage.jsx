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
  Phone,
  Calendar,
  Clock,
  Filter,
  ShieldAlert,
  ArrowLeft,
  Receipt,
  CreditCard,
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
  const [activeTab, setActiveTab] = useState("OUTSTANDING"); // "OUTSTANDING" | "TRANSACTIONS"
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

  const selectedBoyObj = useMemo(() => {
    return deliveryBoys.find((b) => b._id === selectedDeliveryBoyId);
  }, [deliveryBoys, selectedDeliveryBoyId]);

  // Calculate summary stats
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

  // Filtered ledger entries
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
            <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626]" /> Cash Collected
          </span>
        );
      case "SETTLEMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" /> Settled to Branch
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
            Delivery boy ledger balances are available exclusively for <strong className="text-[#0F172A]">DELIVERY</strong> branches. Your current branch ({user?.branch?.name || "Logged-in Branch"}) is registered as a <strong className="text-[#D97706]">BOOKING</strong> branch.
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
      {/* Toast Notification */}
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
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
            Delivery Boy Ledger
          </h1>
          <p className="text-xs text-[#64748B] font-normal">
            Monitor cash collections, office settlements, and pending cash balances
          </p>
        </div>

        {/* Right: Actions & Delivery Boy Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Delivery Boy Selector Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs">
            <UserCheck className="w-4 h-4 text-[#F97316] shrink-0" />
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
              className={`w-4 h-4 ${loadingLedger ? "animate-spin text-[#F97316]" : ""}`}
            />
          </button>

          {/* Daily Collection Memo Button */}
          <button
            type="button"
            onClick={() => setIsDailyReportModalOpen(true)}
            disabled={!selectedBoyObj}
            className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#0F172A] font-semibold px-3.5 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-[#F97316]" />
            <span>Daily Collection Memo</span>
          </button>

          {/* Settle Cash Button */}
          <button
            type="button"
            onClick={() => setIsSettleModalOpen(true)}
            disabled={!selectedBoyObj}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer disabled:opacity-50"
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
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.balance)}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] px-2 py-0.5 rounded border border-[#FDE68A]">
                Cash with {selectedBoyObj?.name?.split(" ")[0] || "Delivery Boy"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Customer Collections */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Customer Collections
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
              Total Cash Settled
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
              Cash deposited to office counter
            </span>
          </div>
        </div>
      </div>

      {/* CHROME-STYLE TAB SWITCHER CONTAINER */}
      <div className="space-y-0 select-none">
        {/* Tab Navigation Header Bar (Chrome Style) */}
        <div className="flex items-center gap-1 border-b border-[#E2E8F0] pt-2 px-2 bg-[#F1F5F9]/80 rounded-t-2xl">
          {/* Tab 1: Outstanding Collections */}
          <button
            type="button"
            onClick={() => setActiveTab("OUTSTANDING")}
            className={`relative flex items-center gap-2.5 px-5 py-3 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === "OUTSTANDING"
                ? "bg-white text-[#0F172A] border-[#E2E8F0] border-b-white -mb-px shadow-2xs"
                : "bg-slate-200/60 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 border-transparent"
            }`}
          >
            {activeTab === "OUTSTANDING" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981] rounded-t-xl" />
            )}
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${activeTab === "OUTSTANDING" ? "bg-[#ECFDF5] text-[#10B981]" : "bg-slate-300/60 text-slate-500"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold">Outstanding Collections</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "OUTSTANDING"
                  ? "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]"
                  : "bg-slate-300/70 text-slate-700"
              }`}
            >
              {unpaidCollections.length} Unpaid / {outstandingData.collections.length} Total
            </span>
          </button>

          {/* Tab 2: Transaction History Register */}
          <button
            type="button"
            onClick={() => setActiveTab("TRANSACTIONS")}
            className={`relative flex items-center gap-2.5 px-5 py-3 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === "TRANSACTIONS"
                ? "bg-white text-[#0F172A] border-[#E2E8F0] border-b-white -mb-px shadow-2xs"
                : "bg-slate-200/60 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200 border-transparent"
            }`}
          >
            {activeTab === "TRANSACTIONS" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563EB] rounded-t-xl" />
            )}
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${activeTab === "TRANSACTIONS" ? "bg-[#EFF6FF] text-[#2563EB]" : "bg-slate-300/60 text-slate-500"}`}>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold">Transaction History Register</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                activeTab === "TRANSACTIONS"
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                  : "bg-slate-300/70 text-slate-700"
              }`}
            >
              {ledgerEntries.length} Records
            </span>
          </button>
        </div>

        {/* TAB 1 CONTENT: OUTSTANDING COLLECTIONS */}
        {activeTab === "OUTSTANDING" && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 bg-[#FFFBEB]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center border border-[#FDE68A]">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider m-0">
                    Delivery Boy Customer Collections
                  </h2>
                  <p className="text-[11px] text-[#64748B] font-medium m-0">
                    Select unpaid collected bills handed over by {selectedBoyObj?.name || "Delivery Boy"} to settle
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#64748B]">
                  Total Outstanding (Unpaid):
                </span>
                <span className="text-sm font-bold font-mono text-[#D97706] bg-[#FFFBEB] px-3 py-1 rounded-lg border border-[#FDE68A]">
                  {formatCurrency(outstandingData.totalOutstanding)}
                </span>
              </div>
            </div>

            {outstandingData.collections.length === 0 ? (
              <div className="p-12 text-center bg-white">
                <CheckCircle2 className="w-10 h-10 text-[#059669] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#0F172A]">No Customer Collections Registered</p>
                <p className="text-xs text-[#64748B] mt-1 max-w-md mx-auto">
                  There are no customer collections recorded for this delivery boy.
                </p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#0F172A]">
                    <thead className="bg-[#F8FAFC] text-[#475569] font-bold text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                      <tr>
                        <th className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={
                              unpaidCollections.length > 0 &&
                              selectedLedgerIds.length === unpaidCollections.length
                            }
                            disabled={unpaidCollections.length === 0}
                            onChange={handleSelectAllOutstanding}
                            className="w-4 h-4 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          />
                        </th>
                        <th className="py-3.5 px-4 font-bold">Bill No.</th>
                        <th className="py-3.5 px-4 font-bold">Shop / Customer</th>
                        <th className="py-3.5 px-4 font-bold">Address</th>
                        <th className="py-3.5 px-4 text-right font-bold">Collected Amount</th>
                        <th className="py-3.5 px-4 text-center font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {outstandingData.collections.map((item) => {
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
                            className={`transition-colors ${
                              isPaid
                                ? "bg-slate-50/70 opacity-85 cursor-default"
                                : isSelected
                                ? "bg-[#FFF7ED] cursor-pointer"
                                : "hover:bg-[#F8FAFC] cursor-pointer"
                            }`}
                          >
                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                disabled={isPaid}
                                checked={isSelected}
                                onChange={() => handleToggleSelect(item)}
                                className="w-4 h-4 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-[#2563EB]">
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
                            <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate">
                              {address}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-[#DC2626] whitespace-nowrap">
                              <span className="bg-[#FEF2F2] px-2.5 py-1 rounded-lg border border-[#FECACA]">
                                +{formatCurrency(item.debit || 0)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                                  <Clock className="w-3.5 h-3.5" /> UNPAID
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* SELECTION SETTLEMENT ACTION FOOTER */}
                <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#0F172A]">
                    <span className="font-semibold text-[#64748B]">Selected:</span>
                    <span className="font-bold font-mono text-[#F97316] bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      {selectedLedgerIds.length} {selectedLedgerIds.length === 1 ? "Bill" : "Bills"} ({formatCurrency(selectedTotalAmount)})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSettleSelectedSubmit}
                    disabled={selectedLedgerIds.length === 0 || submittingSettleSelected}
                    className="inline-flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold px-5 py-2 rounded-xl shadow-2xs transition-colors text-xs cursor-pointer disabled:opacity-50"
                  >
                    {submittingSettleSelected ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    <span>Settle Selected ({formatCurrency(selectedTotalAmount)})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2 CONTENT: TRANSACTION HISTORY REGISTER */}
        {activeTab === "TRANSACTIONS" && (
          <div className="bg-white rounded-b-2xl border border-t-0 border-[#E2E8F0] shadow-sm overflow-hidden space-y-4 p-4 sm:p-5">
            {/* FILTER TOOLBAR */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search bilty #, remarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium text-[#0F172A]"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Type:
                </span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
                >
                  <option value="ALL">All Ledger Entries</option>
                  <option value="CUSTOMER_COLLECTION">Cash Collected (Debit)</option>
                  <option value="SETTLEMENT">Settlement (Credit)</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>
            </div>

            {/* REGISTER TABLE */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider m-0">
                    Complete Transaction History Audit Log
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
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">Please wait while cash balances are updated.</p>
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
                          <tr
                            key={item._id}
                            className="hover:bg-[#F8FAFC] transition-colors group"
                          >
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-[#0F172A] flex-col">
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
                                <span className="bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                                  +{formatCurrency(item.debit)}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-[#059669] whitespace-nowrap">
                              {item.credit > 0 ? (
                                <span className="bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
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
          </div>
        )}
      </div>

      {/* Settlement Modal */}
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
