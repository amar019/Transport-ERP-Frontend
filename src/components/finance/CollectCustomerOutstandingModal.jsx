import React, { useState, useEffect, useMemo } from "react";
import { X, Receipt, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { collectCustomerOutstandingPayment } from "@/services/customerLedger.service";

export default function CollectCustomerOutstandingModal({
  isOpen,
  onClose,
  onSuccess,
  customer,
  selectedBookings = [],
}) {
  const [collectionAmount, setCollectionAmount] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSelectedOutstanding = useMemo(() => {
    return selectedBookings.reduce(
      (sum, b) => sum + Number(b.remainingAmount || 0),
      0
    );
  }, [selectedBookings]);

  // Recalculate FIFO allocation whenever modal opens, selectedBookings change, or collectionAmount changes
  useEffect(() => {
    if (isOpen) {
      const initialAmount = totalSelectedOutstanding;
      setCollectionAmount(initialAmount ? String(initialAmount) : "");
      
      let unallocated = initialAmount;
      const initialAllocations = selectedBookings.map((b) => {
        const remaining = Number(b.remainingAmount || 0);
        const alloc = Math.min(Math.max(0, unallocated), remaining);
        unallocated -= alloc;
        return {
          bookingId: b._id,
          bookingNumber: b.bookingNumber,
          bookingDate: b.bookingDate,
          totalAmount: b.totalAmount,
          remainingAmount: remaining,
          allocatedAmount: alloc,
        };
      });
      setAllocations(initialAllocations);
      setError("");
      setRemarks("");
      setPaymentMode("CASH");
    }
  }, [isOpen, selectedBookings, totalSelectedOutstanding]);

  // Handle total collection amount input change (FIFO distribution)
  const handleTotalAmountChange = (val) => {
    setCollectionAmount(val);
    const numVal = Number(val || 0);

    let unallocated = numVal;
    const updated = selectedBookings.map((b) => {
      const remaining = Number(b.remainingAmount || 0);
      const alloc = Math.min(Math.max(0, unallocated), remaining);
      unallocated -= alloc;
      return {
        bookingId: b._id,
        bookingNumber: b.bookingNumber,
        bookingDate: b.bookingDate,
        totalAmount: b.totalAmount,
        remainingAmount: remaining,
        allocatedAmount: alloc,
      };
    });
    setAllocations(updated);
  };

  // Handle manual allocation override per booking bill
  const handleIndividualAllocChange = (bookingId, val) => {
    const numVal = Math.max(0, Number(val || 0));
    const updated = allocations.map((item) => {
      if (item.bookingId === bookingId) {
        return {
          ...item,
          allocatedAmount: Math.min(numVal, item.remainingAmount),
        };
      }
      return item;
    });
    setAllocations(updated);

    const sumAllocated = updated.reduce((sum, item) => sum + item.allocatedAmount, 0);
    setCollectionAmount(String(sumAllocated));
  };

  const totalAllocated = useMemo(() => {
    return allocations.reduce((sum, a) => sum + Number(a.allocatedAmount || 0), 0);
  }, [allocations]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!customer?._id) {
      setError("Invalid customer selected.");
      return;
    }

    if (totalAllocated <= 0) {
      setError("Total payment collection amount must be greater than ₹0.");
      return;
    }

    if (totalAllocated > totalSelectedOutstanding) {
      setError(`Total payment amount (₹${totalAllocated}) cannot exceed total selected outstanding (₹${totalSelectedOutstanding}).`);
      return;
    }

    const payloadPayments = allocations
      .filter((a) => Number(a.allocatedAmount) > 0)
      .map((a) => ({
        bookingId: a.bookingId,
        amount: Number(a.allocatedAmount),
      }));

    if (payloadPayments.length === 0) {
      setError("Please allocate a valid payment amount to at least one selected bill.");
      return;
    }

    setSubmitting(true);
    try {
      await collectCustomerOutstandingPayment(customer._id, {
        payments: payloadPayments,
        paymentMode,
        remarks: remarks.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error collecting customer outstanding payment:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to process payment collection."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold shadow-2xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Collect Customer Payment
              </h3>
              <p className="text-xs text-slate-500">
                {customer?.shopName || customer?.ownerName || "Customer Collection"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Selected Bills Count
              </span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {selectedBookings.length} {selectedBookings.length === 1 ? "Bill" : "Bills"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Selected Outstanding
              </span>
              <span className="text-base font-bold text-orange-600 font-mono">
                {formatCurrency(totalSelectedOutstanding)}
              </span>
            </div>
          </div>

          {/* Total Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Total Collection Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                max={totalSelectedOutstanding}
                required
                placeholder="Enter collection amount"
                value={collectionAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm font-bold font-mono text-slate-900 border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Amount is automatically allocated across selected bills in chronological (FIFO) order.
            </p>
          </div>

          {/* Bill-wise Allocations List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bill-Wise Payment Allocations
              </span>
              <span className="text-xs font-bold font-mono text-emerald-600">
                Allocated: {formatCurrency(totalAllocated)}
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
              {allocations.map((alloc) => (
                <div
                  key={alloc.bookingId}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-slate-800">
                      Bilty #{alloc.bookingNumber}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Outstanding: <strong className="text-slate-700 font-mono">{formatCurrency(alloc.remainingAmount)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Paying:</span>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={alloc.remainingAmount}
                        value={alloc.allocatedAmount}
                        onChange={(e) =>
                          handleIndividualAllocChange(alloc.bookingId, e.target.value)
                        }
                        className="w-full pl-6 pr-2 py-1.5 rounded-lg text-xs font-bold font-mono text-emerald-700 border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-emerald-50/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Mode & Remarks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-slate-800"
              >
                <option value="CASH">Cash Payment</option>
                <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="Reference or note..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || totalAllocated <= 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? "Processing Collection..." : `Collect ${formatCurrency(totalAllocated)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
