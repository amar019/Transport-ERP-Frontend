import React, { useState } from "react";
import { X, Receipt, AlertCircle, IndianRupee } from "lucide-react";
import { collectCustomerPayment } from "@/services/paymentTransaction.service";

export default function CollectCustomerPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedBooking = null,
}) {
  const [bookingId, setBookingId] = useState(preselectedBooking?._id || "");
  const [amount, setAmount] = useState("");
  const [collectedBy, setCollectedBy] = useState("BRANCH_OWNER");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
      setError(err.response?.data?.message || err.message || "Failed to collect payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Collect Customer Payment</h3>
              <p className="text-xs text-slate-500">Record payment collection for TO_PAY booking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!preselectedBooking ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Booking ID / Bilty ID
              </label>
              <input
                type="text"
                required
                placeholder="Enter Mongo Booking ID"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Bilty Number:</span>
                <span className="font-mono font-bold text-indigo-600">{preselectedBooking.bookingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Amount:</span>
                <span className="font-semibold text-slate-800">₹{(preselectedBooking.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-indigo-700 font-bold border-t border-slate-200 pt-1">
                <span>Remaining Due:</span>
                <span>₹{(preselectedBooking.remainingAmount ?? preselectedBooking.totalAmount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  required
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Collected By
              </label>
              <select
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="BRANCH_OWNER">Branch Owner / Office</option>
                <option value="DELIVERY_BOY">Delivery Boy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI (GPay/PhonePe)</option>
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
                placeholder="Payment notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? "Collecting..." : "Collect Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
