import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { getBranches } from "../../services/branch.service";
import { getBookings } from "../../services/booking.service";

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

  // Filter destination branches
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
        // Pre-select all eligible bookings by default for quick dispatch
        setSelectedBookingIds(eligible.map((b) => b._id || b.id));
      } catch (err) {
        console.error("Failed to load eligible bookings:", err);
        setFormError("Failed to load bookings for this branch");
      } finally {
        setBookingsLoading(false);
      }
    };

    loadEligibleBookings();
  }, [selectedToBranch, user]);

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
    let totalToPay = 0;
    let totalPaidAtBooking = 0;

    selected.forEach((b) => {
      totalQty += Number(b.quantity || 1);
      totalFreight += Number(b.freight || 0);

      const amount = Number(b.totalAmount || 0);
      if (b.collectionType === "TO_PAY") {
        totalToPay += amount;
      } else {
        totalPaidAtBooking += amount;
      }
    });

    return {
      count: selected.length,
      totalQty,
      totalFreight,
      totalToPay,
      totalPaidAtBooking,
    };
  }, [availableBookings, selectedBookingIds]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedToBranch) {
      setFormError("Please select a Destination Branch");
      return;
    }

    if (selectedBookingIds.length === 0) {
      setFormError("Please select at least one booking to include in this memo");
      return;
    }

    setFormError(null);
    onSubmit({
      toBranch: selectedToBranch,
      bookings: selectedBookingIds,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none">
      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* SECTION 1: ROUTE & BRANCH SELECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            1. Memo Route & Destination Branch
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Origin Branch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Origin Branch (Dispatch From)
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50/60 border border-orange-200/80 rounded-xl text-xs font-bold text-orange-800">
              <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="truncate">
                {user?.branch?.name || "My Branch"}
              </span>
              <span className="ml-auto text-[10px] uppercase px-2 py-0.5 bg-orange-200/70 text-orange-800 rounded-md font-extrabold">
                {user?.branch?.type || "BOOKING"}
              </span>
            </div>
          </div>

          {/* Destination Branch */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Destination Branch (Dispatch To) <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedToBranch}
              onChange={(e) => setSelectedToBranch(e.target.value)}
              disabled={branchesLoading || isSubmitting}
              className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-bold text-slate-800 transition-all cursor-pointer disabled:opacity-50"
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

      {/* SECTION 2: SELECT BOOKINGS / BILTY LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
              2. Consignments & Bilties to Include
            </h3>
          </div>
          {availableBookings.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
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

        {!selectedToBranch ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3 border border-orange-100">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-700 text-sm">
              Please select a Destination Branch first
            </h4>
            <p className="text-slate-400 text-xs mt-1">
              Eligible un-memoed bilties for that route will be listed here automatically.
            </p>
          </div>
        ) : bookingsLoading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span>Loading consignments for selected route...</span>
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
              All bookings for this branch have already been dispatched in other memos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">Select</th>
                  <th className="py-3 px-3">Bilty No</th>
                  <th className="py-3 px-3">Customer / Shop</th>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-center">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {availableBookings.map((b) => {
                  const bId = b._id || b.id;
                  const isChecked = selectedBookingIds.includes(bId);
                  const isToPay = b.collectionType === "TO_PAY";

                  return (
                    <tr
                      key={bId}
                      onClick={() => toggleSelectBooking(bId)}
                      className={`hover:bg-orange-50/50 cursor-pointer transition-colors ${
                        isChecked ? "bg-orange-50/70 font-semibold" : ""
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        {b.bookingNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-800">
                          {b.customer?.shopName || b.customer || "N/A"}
                        </div>
                        {b.customer?.ownerName && (
                          <div className="text-[11px] text-slate-400">
                            {b.customer.ownerName}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">{b.itemName || "Goods"}</td>
                      <td className="py-3 px-3 text-center font-bold">{b.quantity ?? 1}</td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-800">
                        {formatCurrency(b.totalAmount || 0)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isToPay
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
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

        {/* Live Summary Bar */}
        {selectedBookingIds.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-md grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Selected Bilties
              </span>
              <span className="text-lg font-black text-white">
                {summaryMetrics.count} Consignments
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Total Quantity
              </span>
              <span className="text-lg font-black text-amber-400">
                {summaryMetrics.totalQty} Cartons
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Total Freight
              </span>
              <span className="text-lg font-black text-white">
                {formatCurrency(summaryMetrics.totalFreight)}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                To-Pay Collection
              </span>
              <span className="text-lg font-black text-emerald-400">
                {formatCurrency(summaryMetrics.totalToPay)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: NOTES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <FileText className="w-4 h-4 text-orange-500" />
          <h3 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight">
            3. Driver & Vehicle Notes / Special Instructions
          </h3>
        </div>

        <textarea
          rows="2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Vehicle MH-12-AB-1234, Driver: Rajesh (9876543210)..."
          className="w-full px-4 py-2 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-semibold text-slate-800 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/memos")}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs md:text-sm transition-all cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || selectedBookingIds.length === 0}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Manifest...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Create Memo / Manifest</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
