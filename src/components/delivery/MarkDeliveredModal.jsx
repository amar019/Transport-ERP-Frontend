import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  UserCheck,
  IndianRupee,
} from "lucide-react";

export default function MarkDeliveredModal({
  isOpen,
  onClose,
  booking,
  onDeliver,
}) {
  const [remarks, setRemarks] = useState("Delivered successfully to customer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onDeliver(booking._id, { remarks });
      onClose();
    } catch (err) {
      console.error("Mark delivered error:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to mark as delivered"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Mark as Delivered
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

          {/* Delivery Context Card */}
          <div className="p-4 rounded-xl bg-[#ECFDF5]/60 border border-[#A7F3D0] text-xs space-y-2">
            <div className="flex justify-between items-center text-[#475569]">
              <span className="text-[#64748B] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#059669]" /> Recipient:
              </span>
              <span className="font-bold text-[#0F172A]">
                {booking.customer?.shopName || booking.customer?.ownerName || booking.customer?.name || "Walk-in Customer"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#475569]">
              <span className="text-[#64748B] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" /> Delivery Boy:
              </span>
              <span className="font-semibold text-[#0F172A]">
                {booking.delivery?.deliveryBoy?.name || "Direct Counter / Branch Owner"}
              </span>
            </div>

            {booking.collectionType === "TO_PAY" && remaining > 0 && (
              <div className="mt-2 pt-2 border-t border-[#A7F3D0] flex justify-between items-center text-[#9333EA] font-bold">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" /> Outstanding COD Balance:
                </span>
                <span className="font-mono text-sm">₹{remaining}</span>
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155]">
              Delivery Remarks / Handover Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter delivery notes or recipient proof details..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 transition-all outline-none resize-none"
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-md shadow-[#059669]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirm Delivered
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
