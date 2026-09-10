import React, { useState, useEffect } from "react";
import {
  X,
  IndianRupee,
  Loader2,
  AlertCircle,
  CreditCard,
  Building2,
  CheckCircle2,
  Wallet,
} from "lucide-react";

export default function CollectPaymentModal({
  isOpen,
  onClose,
  booking,
  onCollect,
}) {
  const [amount, setAmount] = useState("");
  const [collectedBy, setCollectedBy] = useState("DELIVERY_BOY");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("Payment collected upon delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      setError(null);
      const remaining = Number(
        booking.remainingAmount ??
          (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
      );
      setAmount(remaining > 0 ? remaining : "");
      if (booking.delivery?.deliveryBoy) {
        setCollectedBy("DELIVERY_BOY");
      } else {
        setCollectedBy("BRANCH_OWNER");
      }
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const maxRemaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment collection amount");
      return;
    }

    if (numAmount > maxRemaining) {
      setError(`Payment amount cannot exceed remaining balance of ₹${maxRemaining}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onCollect(booking._id, {
        amount: numAmount,
        collectedBy,
        paymentMode,
        remarks,
      });
      onClose();
    } catch (err) {
      console.error("Payment collection error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to record customer payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF] flex items-center justify-center shrink-0 shadow-2xs">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Collect Payment
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                LR <strong className="text-[#0F172A]">#{booking.bookingNumber || booking._id?.slice(-6)}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Financial Breakdown Card */}
          <div className="p-4 rounded-xl bg-[#FAF5FF]/60 border border-[#E9D5FF] text-xs space-y-2">
            <div className="flex justify-between items-center text-[#475569]">
              <span className="text-[#64748B]">Total Freight Charges:</span>
              <span className="font-semibold text-[#0F172A]">₹{booking.totalAmount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[#475569]">
              <span className="text-[#64748B]">Paid Previously:</span>
              <span className="font-semibold text-[#059669]">₹{booking.paidAmount || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#E9D5FF] font-bold text-[#0F172A]">
              <span className="text-[#9333EA]">Remaining Balance Due:</span>
              <span className="text-[#9333EA] text-sm font-mono">₹{maxRemaining}</span>
            </div>
          </div>

          {/* Collection Amount Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#9333EA]" />
                Collection Amount (₹)
              </label>
              <button
                type="button"
                onClick={() => setAmount(maxRemaining)}
                className="text-[11px] font-semibold text-[#9333EA] hover:underline cursor-pointer"
              >
                Full Due (₹{maxRemaining})
              </button>
            </div>
            <input
              type="number"
              step="any"
              min="1"
              max={maxRemaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount up to ₹${maxRemaining}`}
              className="w-full px-3.5 py-2.5 text-sm font-bold font-mono bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 transition-all outline-none"
              required
            />
          </div>

          {/* Collected By & Payment Mode Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#334155]">
                Collected By
              </label>
              <select
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 transition-all outline-none cursor-pointer"
              >
                <option value="DELIVERY_BOY">Delivery Boy</option>
                <option value="BRANCH_OWNER">Branch Owner / Counter</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#334155]">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 transition-all outline-none cursor-pointer"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155]">
              Remarks / Payment Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Received via Cash upon parcel delivery"
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#9333EA] focus:ring-2 focus:ring-[#9333EA]/20 transition-all outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !amount}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#9333EA] hover:bg-[#7E22CE] rounded-xl shadow-md shadow-[#9333EA]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Collect & Save Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
