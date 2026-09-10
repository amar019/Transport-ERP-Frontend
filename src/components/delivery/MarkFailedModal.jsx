import React, { useState } from "react";
import { X, AlertTriangle, Loader2, AlertCircle, XCircle } from "lucide-react";

export default function MarkFailedModal({
  isOpen,
  onClose,
  booking,
  onFail,
}) {
  const [remarks, setRemarks] = useState("Customer unavailable / shop closed");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const failureReasons = [
    "Customer unavailable / shop closed",
    "Incorrect delivery address",
    "Customer refused delivery",
    "Payment not ready",
    "Parcel damaged in transit",
    "Other reason",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError("Failure reason / remarks are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onFail(booking._id, { remarks });
      onClose();
    } catch (err) {
      console.error("Mark failed error:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to log delivery failure"
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
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Mark Delivery Failed
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

          {/* Quick Select Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155]">
              Select Quick Failure Reason
            </label>
            <select
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition-all outline-none cursor-pointer"
            >
              {failureReasons.map((reason, i) => (
                <option key={i} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155]">
              Additional Failure Remarks / Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter detailed reason why delivery could not be completed..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 transition-all outline-none resize-none"
              required
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
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl shadow-md shadow-[#DC2626]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  Mark as Failed
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
