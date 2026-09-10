import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  Store,
  MapPin,
  ShieldAlert,
  ArrowLeft,
  Receipt,
  CreditCard,
  Calendar,
  Clock,
} from "lucide-react";
import { getCustomers } from "@/services/customer.service";
import {
  getCustomerLedger,
  getCustomerBalance,
} from "@/services/customerLedger.service";
import CustomerLedgerSelect from "@/components/finance/CustomerLedgerSelect";
import { ROUTES } from "@/constants/paths";

export default function CustomerLedgerPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const branchType = user?.branch?.type || user?.branchType;

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [balanceInfo, setBalanceInfo] = useState({ balance: 0 });
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch Customers list
  const fetchCustomerList = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const res = await getCustomers();
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCustomers(list);
      if (list.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(list[0]._id);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      showToast("Failed to load customer list.", "error");
    } finally {
      setLoadingCustomers(false);
    }
  }, [selectedCustomerId, showToast]);

  useEffect(() => {
    fetchCustomerList();
  }, [fetchCustomerList]);

  // Fetch selected customer ledger & balance
  const fetchLedgerData = useCallback(async () => {
    if (!selectedCustomerId) {
      setLedgerEntries([]);
      setBalanceInfo({ balance: 0 });
      return;
    }
    setLoadingLedger(true);
    try {
      const [ledgerRes, balanceRes] = await Promise.all([
        getCustomerLedger(selectedCustomerId),
        getCustomerBalance(selectedCustomerId),
      ]);
      setLedgerEntries(Array.isArray(ledgerRes.data) ? ledgerRes.data : []);
      if (balanceRes.data) {
        setBalanceInfo(balanceRes.data);
      }
    } catch (err) {
      console.error("Error fetching customer ledger:", err);
      showToast("Failed to load customer ledger.", "error");
    } finally {
      setLoadingLedger(false);
    }
  }, [selectedCustomerId, showToast]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const selectedCustomerObj = useMemo(() => {
    return customers.find((c) => (c._id || c.id) === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  // Calculate summary totals
  const totals = useMemo(() => {
    let debits = 0;
    let credits = 0;
    ledgerEntries.forEach((entry) => {
      debits += Number(entry.debit || 0);
      credits += Number(entry.credit || 0);
    });
    return {
      debits,
      credits,
      balance: balanceInfo.balance ?? (debits - credits),
    };
  }, [ledgerEntries, balanceInfo]);

  // Filtered entries
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
      case "BOOKING_DEBIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#DC2626]" /> Billed Invoice (Debit)
          </span>
        );
      case "PAYMENT_CREDIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" /> Payment Received (Credit)
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
            Customer Ledger Access Restricted
          </h2>
          <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
            Customer ledger statements are available exclusively for <strong className="text-[#0F172A]">DELIVERY</strong> branches. Your current branch ({user?.branch?.name || "Logged-in Branch"}) is registered as a <strong className="text-[#D97706]">BOOKING</strong> branch.
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
            <span className="font-semibold text-[#0F172A]">Customer Ledger</span>
          </div>
          <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
            Customer Ledger
          </h1>
          <p className="text-xs text-[#64748B] font-normal">
            View customer billing debits, payment credits, and outstanding balances
          </p>
        </div>

        {/* Right: Actions & Searchable Customer Selector */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <CustomerLedgerSelect
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={(id) => setSelectedCustomerId(id)}
            loading={loadingCustomers}
          />

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchLedgerData}
            disabled={loadingLedger || !selectedCustomerId}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw
              className={`w-4 h-4 ${loadingLedger ? "animate-spin text-[#2563EB]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Outstanding Balance Due */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Outstanding Balance Due
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.balance)}
            </span>
            <span className="text-xs text-[#64748B] font-medium block mt-0.5 truncate max-w-[220px]">
              {selectedCustomerObj?.shopName || selectedCustomerObj?.name || "Select Customer"}
            </span>
          </div>
        </div>

        {/* Card 2: Total Invoiced (Debit) */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Invoiced (Debit)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.debits)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Cumulative total billed consignments
            </span>
          </div>
        </div>

        {/* Card 3: Total Payments Received (Credit) */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Received (Credit)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(totals.credits)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Cumulative cleared payment credits
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR SECTION */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search bilty #, remarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F8FAFC]/50 hover:bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] font-medium text-[#0F172A]"
          />
        </div>

        {/* Filter Segment / Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            Type:
          </span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-white text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
          >
            <option value="ALL">All Statement Entries</option>
            <option value="BOOKING_DEBIT">Invoiced Debit</option>
            <option value="PAYMENT_CREDIT">Payment Credit</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>
      </div>

      {/* MAIN DATA TABLE SECTION */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-[#BFDBFE]">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider m-0">
              Customer Statement History
            </h2>
          </div>
          <span className="bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-xs font-bold border border-[#BFDBFE]">
            {filteredLedger.length} {filteredLedger.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {loadingLedger ? (
          <div className="p-16 text-center text-[#64748B]">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-[#2563EB] mb-3" />
            <p className="text-xs font-semibold text-[#0F172A]">Fetching customer ledger statement...</p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">Please wait while statement entries are calculated.</p>
          </div>
        ) : filteredLedger.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] text-[#94A3B8] flex items-center justify-center mx-auto mb-3 border border-[#E2E8F0]">
              <BookOpen className="w-6 h-6 text-[#94A3B8]" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">No Statement Records Found</p>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto leading-relaxed">
              Transactions will automatically populate here when bookings or payments are processed for this customer.
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
                  <th className="py-3.5 px-4 text-right font-bold">Debit (Invoiced)</th>
                  <th className="py-3.5 px-4 text-right font-bold">Credit (Paid)</th>
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
                        ) : item.transaction ? (
                          <span className="inline-flex items-center gap-1.5 text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg text-xs font-mono font-bold border border-[#A7F3D0]">
                            <CreditCard className="w-3.5 h-3.5 text-[#059669]" />
                            Txn: #{item.transaction._id?.substring(0, 8)}
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
