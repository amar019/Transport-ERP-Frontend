import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Building2,
  Package,
  Calendar,
  IndianRupee,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  CheckSquare,
  Square,
  Truck,
  ArrowRight,
  Inbox,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from "lucide-react";
import { getBranches } from "@/services/branch.service";
import { getBookings } from "@/services/booking.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/paths";

export default function MemoForm({ onSubmit, isSubmitting = false }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [selectedToBranch, setSelectedToBranch] = useState("");
  const [notes, setNotes] = useState("");

  const [availableBookings, setAvailableBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedBookingIds, setSelectedBookingIds] = useState([]);

  // Local table search and type filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // "ALL" | "TO_PAY" | "PAID_AT_BOOKING"

  const [formError, setFormError] = useState(null);

  // Fetch branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        setBranchesLoading(true);
        const res = await getBranches();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];
        setBranches(list);
      } catch (err) {
        console.error("Failed to load branches:", err);
      } finally {
        setBranchesLoading(false);
      }
    };
    loadBranches();
  }, []);

  // Filter destination branches (active branches excluding user's origin branch)
  const destinationBranches = useMemo(() => {
    const userBranchId = user?.branch?._id || user?.branch?.id || user?.branch;
    return branches.filter((b) => {
      if (b.status && b.status !== "ACTIVE") return false;
      if (userBranchId && (b._id === userBranchId || b.id === userBranchId)) {
        return false;
      }
      return true;
    });
  }, [branches, user]);

  // When toBranch is selected, fetch eligible un-memoed bookings
  useEffect(() => {
    if (!selectedToBranch) {
      setAvailableBookings([]);
      setSelectedBookingIds([]);
      return;
    }

    const loadEligibleBookings = async () => {
      try {
        setBookingsLoading(true);
        setFormError(null);
        const res = await getBookings();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];

        const userBranchId = user?.branch?._id || user?.branch?.id || user?.branch;

        // Filter bookings for this destination branch and not in any memo
        const eligible = list.filter((b) => {
          const bToBranchId = b.toBranch?._id || b.toBranch;
          const bFromBranchId = b.fromBranch?._id || b.fromBranch;

          const matchDest = bToBranchId === selectedToBranch;
          const matchOrigin = !userBranchId || bFromBranchId === userBranchId;
          const notInMemo = !b.memo;
          const notCancelled = b.status !== "CANCELLED";

          return matchDest && matchOrigin && notInMemo && notCancelled;
        });

        setAvailableBookings(eligible);
        // Pre-select all eligible bookings by default for quick 1-click dispatch
        setSelectedBookingIds(eligible.map((b) => b._id || b.id));
      } catch (err) {
        console.error("Failed to load eligible bookings:", err);
        setFormError("Failed to load consignments for this destination branch");
      } finally {
        setBookingsLoading(false);
      }
    };

    loadEligibleBookings();
  }, [selectedToBranch, user]);

  // Filter available bookings by local search query and type filter
  const displayedBookings = useMemo(() => {
    return availableBookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const bNum = (b.bookingNumber || "").toLowerCase();
      const shop = (b.customer?.shopName || b.customer?.name || b.customer || "").toLowerCase();
      const owner = (b.customer?.ownerName || "").toLowerCase();
      const item = (b.itemName || "").toLowerCase();

      const matchSearch = !q || bNum.includes(q) || shop.includes(q) || owner.includes(q) || item.includes(q);

      let matchType = true;
      if (typeFilter !== "ALL") {
        matchType = b.collectionType === typeFilter;
      }

      return matchSearch && matchType;
    });
  }, [availableBookings, searchQuery, typeFilter]);

  // Selection helpers
  const toggleSelectBooking = (id) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBookingIds.length === availableBookings.length) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(availableBookings.map((b) => b._id || b.id));
    }
  };

  // Metrics summary for selected bookings
  const summaryMetrics = useMemo(() => {
    const selected = availableBookings.filter((b) =>
      selectedBookingIds.includes(b._id || b.id)
    );

    let totalQty = 0;
    let totalFreight = 0;
    let grossTotal = 0;
    let totalToPay = 0;
    let totalPaidAtBooking = 0;

    selected.forEach((b) => {
      totalQty += Number(b.quantity || 1);
      totalFreight += Number(b.freight || 0);

      const amount = Number(b.totalAmount || 0);
      grossTotal += amount;
      if (b.collectionType === "TO_PAY") {
        totalToPay += Number(b.remainingAmount !== undefined ? b.remainingAmount : amount);
      } else {
        totalPaidAtBooking += amount;
      }
    });

    return {
      count: selected.length,
      totalQty,
      totalFreight,
      grossTotal,
      totalToPay,
      totalPaidAtBooking,
    };
  }, [availableBookings, selectedBookingIds]);

  const selectedDestinationBranchObj = useMemo(() => {
    return branches.find((b) => (b._id || b.id) === selectedToBranch);
  }, [branches, selectedToBranch]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!selectedToBranch) {
      setFormError("Please select a Destination Branch");
      return;
    }

    if (selectedBookingIds.length === 0) {
      setFormError("Please select at least one bilty/consignment to include in this memo");
      return;
    }

    setFormError(null);
    onSubmit({
      toBranch: selectedToBranch,
      bookings: selectedBookingIds,
      notes: notes.trim(),
    });
  };

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedToBranch, selectedBookingIds, notes]);

  return (
    <form onSubmit={handleSubmit} className="select-none space-y-4">
      {/* Error Alert */}
      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* 2-COLUMN ENTERPRISE LAYOUT (70% Data Entry / 30% Live Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Data Entry & Consignment Selection (8 of 12 cols = ~67%) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 1. ROUTE & DESTINATION BRANCH SELECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                1. Dispatch Route & Destination Branch
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Origin Branch (Fixed) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Origin Station (Dispatch From)
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-orange-50/70 border border-orange-200/90 rounded-xl text-xs font-bold text-orange-900">
                  <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span className="truncate">
                    {user?.branch?.name || "Ahmednagar Booking"}
                  </span>
                  <span className="ml-auto text-[10px] uppercase px-2 py-0.5 bg-orange-200/80 text-orange-900 rounded-md font-black">
                    {user?.branch?.type || "BOOKING"}
                  </span>
                </div>
              </div>

              {/* Destination Branch (Dropdown) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Destination Station (Dispatch To) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedToBranch}
                  onChange={(e) => setSelectedToBranch(e.target.value)}
                  disabled={branchesLoading || isSubmitting}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-bold text-slate-800 transition-all cursor-pointer disabled:opacity-50"
                  autoFocus
                >
                  <option value="">-- Select Destination Branch --</option>
                  {destinationBranches.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name} ({b.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. CONSIGNMENTS & BILTY SELECTION */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 md:p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                  2. Select Consignments to Include
                </h3>
                {availableBookings.length > 0 && (
                  <span className="bg-slate-100 text-slate-700 text-xs font-black px-2 py-0.5 rounded-full">
                    {selectedBookingIds.length} / {availableBookings.length}
                  </span>
                )}
              </div>

              {/* Quick Select / Deselect All */}
              {availableBookings.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer self-start sm:self-auto"
                >
                  {selectedBookingIds.length === availableBookings.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 text-orange-600" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 text-slate-400" />
                      <span>Select All ({availableBookings.length})</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Filter & Search Bar for Available Bilties */}
            {selectedToBranch && availableBookings.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by Bilty No, Shop, Item..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setTypeFilter("ALL")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      typeFilter === "ALL"
                        ? "bg-orange-500 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    All ({availableBookings.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter("TO_PAY")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      typeFilter === "TO_PAY"
                        ? "bg-amber-500 text-white shadow-2xs"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                    }`}
                  >
                    To-Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeFilter("PAID_AT_BOOKING")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      typeFilter === "PAID_AT_BOOKING"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>
            )}

            {/* Table Area */}
            {!selectedToBranch ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3 border border-orange-100">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-700 text-sm">
                  Select a Destination Branch First
                </h4>
                <p className="text-slate-400 text-xs mt-1">
                  Eligible pending bilties for that route will be listed here automatically.
                </p>
              </div>
            ) : bookingsLoading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
                <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                <span>Fetching pending bilties for selected destination...</span>
              </div>
            ) : availableBookings.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
                  <Inbox className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-700 text-sm">
                  No pending bilties found for this destination
                </h4>
                <p className="text-slate-400 text-xs mt-1">
                  All consignments for this route have already been dispatched in other manifests.
                </p>
              </div>
            ) : displayedBookings.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-400 font-semibold">
                No consignments match your current search filter.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={selectedBookingIds.length === availableBookings.length && availableBookings.length > 0}
                          onChange={toggleSelectAll}
                          className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Bilty No</th>
                      <th className="py-2.5 px-3">Customer / Shop</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                      <th className="py-2.5 px-3 text-center">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {displayedBookings.map((b) => {
                      const bId = b._id || b.id;
                      const isChecked = selectedBookingIds.includes(bId);
                      const isToPay = b.collectionType === "TO_PAY";

                      return (
                        <tr
                          key={bId}
                          onClick={() => toggleSelectBooking(bId)}
                          className={`hover:bg-orange-50/50 cursor-pointer transition-colors ${
                            isChecked ? "bg-orange-50/60 font-semibold" : ""
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectBooking(bId)}
                              className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-black text-slate-900 whitespace-nowrap">
                            {b.bookingNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-extrabold text-slate-800">
                              {b.customer?.shopName || b.customer?.name || b.customer || "N/A"}
                            </div>
                            {b.customer?.ownerName && (
                              <div className="text-[11px] text-slate-400">
                                {b.customer.ownerName}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">{b.itemName || "General Goods"}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{b.quantity ?? 1}</td>
                          <td className="py-2.5 px-3 text-right font-black font-mono text-slate-800 whitespace-nowrap">
                            {formatCurrency(b.totalAmount || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                isToPay
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {isToPay ? "TO PAY" : "PAID"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. DRIVER & VEHICLE DISPATCH NOTES */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                3. Driver, Vehicle & Transport Notes
              </h3>
            </div>

            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vehicle: MH-12-AB-1234, Driver: Rajesh (9876543210), Dispatch via Pune Bypass..."
              className="w-full px-3.5 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-semibold text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Live Sticky Manifest Summary Card (4 of 12 cols = ~33%) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 md:p-5 sticky top-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                  Manifest Summary
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                Auto
              </span>
            </div>

            {/* Route summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Origin:</span>
                <span className="font-bold text-slate-800 truncate max-w-[150px]">
                  {user?.branch?.name || "Ahmednagar Booking"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Destination:</span>
                <span className="font-black text-orange-600 truncate max-w-[150px]">
                  {selectedDestinationBranchObj?.name || "Not Selected"}
                </span>
              </div>
            </div>

            {/* Key counts */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Selected Bilties
                </span>
                <span className="text-lg font-black text-slate-800 block mt-0.5">
                  {summaryMetrics.count}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Total Quantity
                </span>
                <span className="text-lg font-black text-slate-800 block mt-0.5">
                  {summaryMetrics.totalQty} <span className="text-xs text-slate-400 font-medium">Pkgs</span>
                </span>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600 font-bold">
                <span>Paid at Booking (Origin):</span>
                <span className="font-mono text-emerald-700 font-black">
                  {formatCurrency(summaryMetrics.totalPaidAtBooking)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 font-bold">
                <span>TO_PAY to Collect:</span>
                <span className="font-mono text-orange-600 font-black">
                  {formatCurrency(summaryMetrics.totalToPay)}
                </span>
              </div>

              {/* Highlight Total Gross Value Banner */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/60 p-3.5 rounded-xl border border-orange-200/90 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-900 block">
                    Gross Cargo Value (एकूण)
                  </span>
                  <span className="text-xl font-black font-mono text-orange-600 block mt-0.5">
                    {formatCurrency(summaryMetrics.grossTotal)}
                  </span>
                </div>
                <div className="text-right text-[10px] font-bold text-orange-800/80">
                  {summaryMetrics.count} Consignments
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || selectedBookingIds.length === 0 || !selectedToBranch}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-3 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Manifest...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create & Save Memo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(ROUTES.MEMOS.LIST)}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer text-center disabled:opacity-50"
              >
                Cancel
              </button>

              <div className="text-center text-[10.5px] text-slate-400 font-medium pt-1">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono font-bold">Ctrl + Enter</kbd> to save
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
