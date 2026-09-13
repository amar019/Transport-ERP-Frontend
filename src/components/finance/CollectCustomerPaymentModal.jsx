import React, { useState, useEffect } from "react";
import {
  X,
  Receipt,
  AlertCircle,
  IndianRupee,
  Building2,
  UserCheck,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { collectCustomerPayment } from "@/services/paymentTransaction.service";

export default function CollectCustomerPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedBooking = null,
}) {
  const [bookingId, setBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [collectedBy, setCollectedBy] = useState("BRANCH_OWNER");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
      setAmount("");
      setRemarks("");
      setCollectedBy("BRANCH_OWNER");
      setPaymentMode("CASH");
      setBookingId(preselectedBooking?._id || "");

      // Pre-fill full remaining amount if available
      if (preselectedBooking) {
        const rem = Number(
          preselectedBooking.remainingAmount ??
            (Number(preselectedBooking.totalAmount || 0) - Number(preselectedBooking.paidAmount || 0))
        );
        if (rem > 0) {
          setAmount(String(rem));
        }
      }
    }
  }, [isOpen, preselectedBooking]);

  if (!isOpen) return null;

  const remainingDue = preselectedBooking
    ? Number(
        preselectedBooking.remainingAmount ??
          (Number(preselectedBooking.totalAmount || 0) - Number(preselectedBooking.paidAmount || 0))
      )
    : 0;

  const handleFillFullDue = () => {
    if (remainingDue > 0) {
      setAmount(String(remainingDue));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const targetBookingId = preselectedBooking?._id || bookingId;
    if (!targetBookingId) {
      setError("Please specify a valid Booking ID.");
      return;
    }

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    setSubmitting(true);
    try {
      await collectCustomerPayment(targetBookingId, {
        amount: numAmount,
        collectedBy,
        paymentMode,
        remarks: remarks.trim(),
      });

      setAmount("");
      setRemarks("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error collecting customer payment:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to collect payment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const paymentModes = [
    { value: "CASH", label: "Cash", icon: Banknote, color: "text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]" },
    { value: "UPI", label: "UPI (GPay/PhonePe)", icon: QrCode, color: "text-[#2563EB] bg-[#EFF6FF] border-[#BFDBFE]" },
    { value: "BANK_TRANSFER", label: "Bank Transfer", icon: CreditCard, color: "text-[#7C3AED] bg-[#F5F3FF] border-[#DDD6FE]" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] flex items-center justify-center shrink-0 shadow-2xs font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Collect Customer Payment
              </h3>
              <p className="text-xs text-[#64748B] font-medium">
                Record collection for outstanding TO_PAY booking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#DC2626] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Booking Info Banner */}
          {preselectedBooking ? (
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#64748B] font-medium">Bilty / LR Number:</span>
                <span className="font-mono font-bold text-[#0F172A] bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">
                  #{preselectedBooking.bookingNumber}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#64748B]">
                <span>Customer:</span>
                <span className="font-semibold text-[#0F172A]">
                  {preselectedBooking.customer?.shopName || preselectedBooking.customer?.name || "Customer"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-[#E2E8F0]">
                <span className="text-[#64748B] font-medium">Net Due Outstanding:</span>
                <span className="font-mono font-bold text-[#16A34A] text-sm">
                  ₹{remainingDue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#334155] uppercase tracking-wider">
                Booking ID / Bilty Number
              </label>
              <input
                type="text"
                required
                placeholder="Enter Booking ID or Bilty Number"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] focus:bg-white focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none"
              />
            </div>
          )}

          {/* Amount Field with Quick Preset */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#334155] flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-[#16A34A]" />
                Collection Amount (₹)
              </label>
              {remainingDue > 0 && Number(amount) !== remainingDue && (
                <button
                  type="button"
                  onClick={handleFillFullDue}
                  className="text-[11px] font-bold text-[#16A34A] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Full Due (₹{remainingDue})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] font-bold text-sm">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="Enter collected amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm font-mono font-bold bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] focus:bg-white focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A] outline-none"
              />
            </div>
          </div>

          {/* Collected By Options (Segmented Selector) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] block">
              Collected By
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCollectedBy("BRANCH_OWNER")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  collectedBy === "BRANCH_OWNER"
                    ? "bg-[#F0FDF4] border-[#16A34A] text-[#16A34A] shadow-2xs font-bold"
                    : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Branch Owner / Office
              </button>

              <button
                type="button"
                onClick={() => setCollectedBy("DELIVERY_BOY")}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  collectedBy === "DELIVERY_BOY"
                    ? "bg-[#F5F3FF] border-[#7C3AED] text-[#7C3AED] shadow-2xs font-bold"
                    : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Delivery Boy
              </button>
            </div>
          </div>

          {/* Payment Mode Options */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] block">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = paymentMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setPaymentMode(mode.value)}
                    className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? `${mode.color} shadow-2xs font-bold border-2`
                        : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#334155] block">
              Payment Remarks (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Cash collected at counter / UPI reference..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#16A34A] outline-none"
            />
          </div>

          {/* Action Buttons */}
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
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-md shadow-[#16A34A]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Collect Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
