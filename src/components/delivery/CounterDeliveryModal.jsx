import React, { useState, useEffect } from "react";
import {
  X,
  IndianRupee,
  Loader2,
  AlertCircle,
  Building2,
  CheckCircle2,
  Store,
} from "lucide-react";

export default function CounterDeliveryModal({
  isOpen,
  onClose,
  booking,
  onCounterDeliver,
}) {
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("Counter Delivery");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && booking) {
      setError(null);
      const remaining = Number(
        booking.remainingAmount ??
          (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
      );
      setAmount(remaining > 0 ? remaining : 0);
      setPaymentMode("CASH");
      setRemarks("Counter Delivery");
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const totalAmount = Number(booking.totalAmount || 0);
  const remaining = Number(
    booking.remainingAmount ??
      (totalAmount - Number(booking.paidAmount || 0))
  );

  const customerName =
    booking.customer?.shopName ||
    booking.customer?.name ||
    booking.customer?.ownerName ||
    "Walk-in Customer";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);

    if (remaining > 0 && (isNaN(numAmount) || numAmount < 0)) {
      setError("Please enter a valid amount");
      return;
    }

    if (numAmount > remaining) {
      setError(`Payment amount cannot exceed remaining balance of ₹${remaining}`);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onCounterDeliver(booking._id, {
        amount: numAmount,
        paymentMode,
        remarks,
      });
      onClose();
    } catch (err) {
      console.error("Counter delivery error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to process counter delivery"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const paymentModes = [
    { label: "Cash", value: "CASH" },
    { label: "UPI", value: "UPI" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Other", value: "OTHER" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Counter Delivery
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                LR <strong className="text-[#0F172A]">#{booking.bookingNumber || booking._id?.slice(-6)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-xs font-semibold text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Customer:</span>
              <span className="font-bold text-[#0F172A]">{customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] font-medium">Bill Amount:</span>
              <span className="font-bold text-[#0F172A]">₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
              <span className="text-[#64748B] font-semibold">Remaining:</span>
              <span className="font-extrabold text-[#D97706] text-sm">
                ₹{remaining.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Payment Options if remaining > 0 */}
          {remaining > 0 ? (
            <>
              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-2 uppercase tracking-wider">
                  Payment Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentModes.map((mode) => (
                    <label
                      key={mode.value}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                        paymentMode === mode.value
                          ? "bg-[#F0FDF4] border-[#059669] text-[#059669] shadow-2xs"
                          : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        value={mode.value}
                        checked={paymentMode === mode.value}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="accent-[#059669]"
                      />
                      <span>{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1.5 uppercase tracking-wider">
                  Amount:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] font-bold text-sm">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={remaining}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition-all"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-semibold text-[#059669] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Payment is already collected at booking. Ready for counter pickup.</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Collect & Deliver</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
