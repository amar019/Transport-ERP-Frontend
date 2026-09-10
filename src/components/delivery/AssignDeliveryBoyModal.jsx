import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Truck,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Package,
} from "lucide-react";
import { getDeliveryBoys } from "@/services/deliveryBoy.service";

export default function AssignDeliveryBoyModal({
  isOpen,
  onClose,
  booking,
  onAssign,
}) {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [selectedBoyId, setSelectedBoyId] = useState("");
  const [loadingBoys, setLoadingBoys] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSelectedBoyId(booking?.delivery?.deliveryBoy?._id || booking?.delivery?.deliveryBoy || "");
      loadDeliveryBoys();
    }
  }, [isOpen, booking]);

  const loadDeliveryBoys = async () => {
    try {
      setLoadingBoys(true);
      const res = await getDeliveryBoys();
      const rawList = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      const activeBoys = rawList.filter(
        (boy) => !boy.status || boy.status === "ACTIVE"
      );
      setDeliveryBoys(activeBoys);
    } catch (err) {
      console.error("Failed to load delivery boys:", err);
      setError("Failed to fetch active delivery boys for your branch.");
    } finally {
      setLoadingBoys(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBoyId) {
      setError("Please select a delivery boy to proceed");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onAssign(booking._id, selectedBoyId);
      onClose();
    } catch (err) {
      console.error("Assign error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to assign delivery boy");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0 shadow-2xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
                Assign Delivery Boy
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

          {/* Booking Summary Context Card */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-2">
            <div className="flex justify-between items-center text-[#475569]">
              <span className="text-[#64748B] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" /> Customer:
              </span>
              <span className="font-bold text-[#0F172A]">
                {booking.customer?.shopName || booking.customer?.ownerName || booking.customer?.name || "Walk-in Customer"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#475569]">
              <span className="text-[#64748B] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> Address:
              </span>
              <span className="font-medium text-[#0F172A] truncate max-w-[200px]" title={booking.deliveryAddress || booking.customer?.address}>
                {booking.deliveryAddress || booking.customer?.address || "Branch Address"}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#E2E8F0] text-[#475569]">
              <span className="text-[#64748B]">Payment Type:</span>
              <span className="font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE] text-[10px]">
                {booking.collectionType || "TO_PAY"} (₹{booking.totalAmount || 0})
              </span>
            </div>
          </div>

          {/* Select Delivery Boy */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#334155] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#2563EB]" />
              Select Active Delivery Boy
            </label>
            {loadingBoys ? (
              <div className="flex items-center justify-center py-4 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB] mr-2" />
                Loading branch delivery boys...
              </div>
            ) : deliveryBoys.length === 0 ? (
              <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-xs font-semibold">
                No active delivery boys found in your branch. Please add one under Delivery Boys master.
              </div>
            ) : (
              <select
                value={selectedBoyId}
                onChange={(e) => setSelectedBoyId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all outline-none cursor-pointer"
                required
              >
                <option value="">-- Choose Delivery Boy --</option>
                {deliveryBoys.map((boy) => (
                  <option key={boy._id} value={boy._id}>
                    {boy.name} {boy.mobile ? `(${boy.mobile})` : ""}
                  </option>
                ))}
              </select>
            )}
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
              disabled={submitting || !selectedBoyId}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-md shadow-[#2563EB]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  Confirm Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
