import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Receipt,
  RefreshCw,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileText,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
} from "lucide-react";
import { getPaymentTransactions } from "@/services/paymentTransaction.service";
import { ROUTES } from "@/constants/paths";

export default function PaymentTransactionsPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const branchType = user?.branch?.type || user?.branchType;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "ALL",
    collectedBy: "ALL",
    paymentMode: "ALL",
  });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const activeParams = {};
      if (filters.type && filters.type !== "ALL") activeParams.type = filters.type;
      if (filters.collectedBy && filters.collectedBy !== "ALL") activeParams.collectedBy = filters.collectedBy;

      const res = await getPaymentTransactions(activeParams);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTransactions(list);
    } catch (err) {
      console.error("Error fetching payment transactions:", err);
      showToast("Failed to load payment transactions.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters.type, filters.collectedBy, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Compute Summary stats
  const totals = useMemo(() => {
    let customerCollections = 0;
    let deliveryBoySettlements = 0;
    let cashTotal = 0;
    let digitalTotal = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount || 0);
      if (tx.type === "CUSTOMER_COLLECTION") customerCollections += amt;
      if (tx.type === "DELIVERY_BOY_SETTLEMENT") deliveryBoySettlements += amt;

      if (tx.paymentMode === "CASH") cashTotal += amt;
      else digitalTotal += amt;
    });

    return {
      customerCollections,
      deliveryBoySettlements,
      cashTotal,
      digitalTotal,
      totalVolume: customerCollections + deliveryBoySettlements,
    };
  }, [transactions]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesMode = filters.paymentMode === "ALL" || tx.paymentMode === filters.paymentMode;
      const q = filters.search.toLowerCase().trim();
      const bookingNo = tx.booking?.bookingNumber?.toLowerCase() || "";
      const custName = tx.customer?.name?.toLowerCase() || "";
      const boyName = tx.deliveryBoy?.name?.toLowerCase() || "";
      const remarks = tx.remarks?.toLowerCase() || "";
      const matchesSearch =
        !q ||
        bookingNo.includes(q) ||
        custName.includes(q) ||
        boyName.includes(q) ||
        remarks.includes(q);

      return matchesMode && matchesSearch;
    });
  }, [transactions, filters.paymentMode, filters.search]);

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" /> Customer Collection
          </span>
        );
      case "DELIVERY_BOY_SETTLEMENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <UserCheck className="w-3.5 h-3.5 text-[#D97706]" /> Delivery Boy Settlement
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

  const getCollectedByBadge = (collectedBy) => {
    if (collectedBy === "DELIVERY_BOY") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
          <UserCheck className="w-3 h-3 text-[#F97316]" /> Delivery Boy
        </span>
      );
    }
    if (collectedBy === "BRANCH_OWNER") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
          <Building2 className="w-3 h-3 text-[#2563EB]" /> Branch Counter
        </span>
      );
    }
    return <span className="text-[#94A3B8]">N/A</span>;
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
            Payment Transactions Access Restricted
          </h2>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Payment transactions registers are available exclusively for <strong className="text-[#0F172A]">DELIVERY</strong> branches. Your current branch ({user?.branch?.name || "Logged-in Branch"}) is registered as a <strong className="text-[#D97706]">BOOKING</strong> branch.
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
            <span className="font-semibold text-[#0F172A]">Transactions</span>
          </div>
          <h1 className="!text-xl !my-0 font-bold text-[#0F172A] tracking-tight leading-snug">
            Payment Transactions
          </h1>
          <p className="text-xs text-[#64748B] font-normal">
            Centralized payment transactions register across customer collections and office cash settlements
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Transactions"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-[#059669]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Customer Collections */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Customer Collections
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.customerCollections)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Total TO_PAY collections received from customers
            </span>
          </div>
        </div>

        {/* Card 2: Delivery Boy Settlements */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Delivery Boy Settlements
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.deliveryBoySettlements)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Total cash deposited by delivery boys to office
            </span>
          </div>
        </div>

        {/* Card 3: Payment Modes Breakdown */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Cash vs Digital Split
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-[#0F172A] tracking-tight font-mono">
                Cash: {formatCurrency(totals.cashTotal)}
              </span>
              <span className="text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                Digital: {formatCurrency(totals.digitalTotal)}
              </span>
            </div>
            <span className="text-xs text-[#64748B] font-normal block mt-1">
              Cash collections vs UPI / Bank Transfer
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR SECTION */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search bilty #, customer, delivery boy..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC]/50 hover:bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] font-medium text-[#0F172A]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, type: e.target.value }))
            }
            className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] cursor-pointer"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="CUSTOMER_COLLECTION">Customer Collection</option>
            <option value="DELIVERY_BOY_SETTLEMENT">Delivery Boy Settlement</option>
          </select>

          {/* Collected By Filter */}
          <select
            value={filters.collectedBy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, collectedBy: e.target.value }))
            }
            className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] cursor-pointer"
          >
            <option value="ALL">All Collectors</option>
            <option value="BRANCH_OWNER">Branch Counter</option>
            <option value="DELIVERY_BOY">Delivery Boy</option>
          </select>

          {/* Mode Filter */}
          <select
            value={filters.paymentMode}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, paymentMode: e.target.value }))
            }
            className="w-full px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] cursor-pointer"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* MAIN DATA TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center border border-[#A7F3D0]">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider m-0">
              Payment Transaction Register
            </h2>
          </div>
          <span className="bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full text-xs font-bold border border-[#A7F3D0]">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#64748B]">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#059669] mb-3" />
            <p className="text-xs font-semibold text-[#0F172A]">Fetching transaction register...</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">Please wait while entries are calculated.</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mx-auto mb-3 border border-[#E2E8F0]">
              <Receipt className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">No Transactions Found</p>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto leading-relaxed">
              Transactions will automatically populate when customer collections or settlements are recorded.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#0F172A]">
              <thead className="bg-[#F1F5F9]/80 text-[#475569] font-bold text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Date & Time</th>
                  <th className="py-3.5 px-4 font-bold">Type</th>
                  <th className="py-3.5 px-4 font-bold">Collected By</th>
                  <th className="py-3.5 px-4 font-bold">Customer</th>
                  <th className="py-3.5 px-4 font-bold">Delivery Boy</th>
                  <th className="py-3.5 px-4 font-bold">Bilty Ref</th>
                  <th className="py-3.5 px-4 font-bold">Payment Mode</th>
                  <th className="py-3.5 px-4 text-right font-bold">Amount</th>
                  <th className="py-3.5 px-4 font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTransactions.map((item) => {
                  const itemDate = new Date(item.transactionDate || item.createdAt);
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
                      <td className="py-3.5 px-4">{getCollectedByBadge(item.collectedBy)}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A] text-xs whitespace-nowrap">
                        {item.customer?.name ? (
                          <div>
                            <span className="font-bold text-[#0F172A]">{item.customer.name}</span>
                            {item.customer.mobile && (
                              <span className="block text-[11px] text-[#94A3B8] font-mono font-normal">
                                {item.customer.mobile}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#0F172A] whitespace-nowrap">
                        {item.deliveryBoy?.name ? (
                          <div>
                            <span className="font-bold text-[#0F172A]">{item.deliveryBoy.name}</span>
                            {item.deliveryBoy.mobile && (
                              <span className="block text-[11px] text-[#94A3B8] font-mono font-normal">
                                {item.deliveryBoy.mobile}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.booking?.bookingNumber ? (
                          <span className="inline-flex items-center gap-1.5 text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-[#BFDBFE]">
                            <Receipt className="w-3.5 h-3.5 text-[#2563EB]" />
                            #{item.booking.bookingNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-medium">Direct</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <CreditCard className="w-3.5 h-3.5 text-[#64748B]" />
                          {item.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0F172A] whitespace-nowrap">
                        <span className="bg-[#EFF6FF] text-[#1E40AF] px-2.5 py-1 rounded-lg border border-[#BFDBFE] text-xs">
                          {formatCurrency(item.amount)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#64748B] max-w-xs truncate">
                        {item.remarks ? (
                          <span title={item.remarks}>{item.remarks}</span>
                        ) : (
                          <span className="text-slate-300">--</span>
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
  );
}
