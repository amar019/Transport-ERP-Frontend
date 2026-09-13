import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  CheckCircle2,
  ShieldCheck,
  IndianRupee,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingBoys, setLoadingBoys] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSearchQuery("");
      setSelectedBoyId(
        booking?.delivery?.deliveryBoy?._id ||
          booking?.delivery?.deliveryBoy ||
          ""
      );
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

  const filteredBoys = useMemo(() => {
    if (!searchQuery.trim()) return deliveryBoys;
    const q = searchQuery.toLowerCase().trim();
    return deliveryBoys.filter(
      (b) =>
        b.name?.toLowerCase().includes(q) ||
        b.mobile?.toLowerCase().includes(q)
    );
  }, [deliveryBoys, searchQuery]);

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
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to assign delivery boy"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !booking) return null;

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
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
                Dispatch shipment for local delivery
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

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 no-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Summary Context Card */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-[#0F172A]">
                  #{booking.bookingNumber || booking._id?.slice(-6)}
                </span>
                <span className="text-[10px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-1.5 py-0.5 rounded">
                  {booking.totalPackages || 1} Pkg
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  booking.collectionType === "PAID_AT_BOOKING"
                    ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                    : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                }`}
              >
                {booking.collectionType === "PAID_AT_BOOKING"
                  ? "PAID AT BOOKING"
                  : `TO PAY (₹${remaining > 0 ? remaining : booking.totalAmount || 0})`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Recipient</span>
                <span className="font-bold text-[#0F172A] truncate block">
                  {booking.customer?.shopName || booking.customer?.ownerName || booking.customer?.name || "Walk-in Customer"}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Phone</span>
                <span className="font-medium text-[#0F172A] block">
                  {booking.customer?.mobile || "N/A"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Delivery Address</span>
              <span className="font-medium text-[#0F172A] block truncate" title={booking.deliveryAddress || booking.customer?.address}>
                {booking.deliveryAddress || booking.customer?.address || "Branch Pickup / Destination Hub"}
              </span>
            </div>
          </div>

          {/* Delivery Boy Selection Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#2563EB]" />
                Select Delivery Personnel
              </label>
              <span className="text-[11px] text-[#64748B] font-medium">
                {deliveryBoys.length} Active
              </span>
            </div>

            {/* Quick Search if more than 3 boys */}
            {deliveryBoys.length > 3 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search delivery boy by name or mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>
            )}

            {/* Delivery Boy Cards List */}
            {loadingBoys ? (
              <div className="flex items-center justify-center py-8 text-xs font-semibold text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB] mr-2" />
                Loading active delivery boys...
              </div>
            ) : deliveryBoys.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-xs font-semibold space-y-1">
                <p>No active delivery boys found in your branch.</p>
                <p className="text-[11px] text-[#B45309] font-normal">
                  Please register a delivery boy under Masters → Delivery Boys before assigning shipments.
                </p>
              </div>
            ) : filteredBoys.length === 0 ? (
              <div className="p-3 text-center text-xs text-[#94A3B8]">
                No delivery boy matching "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                {filteredBoys.map((boy) => {
                  const isSelected = selectedBoyId === boy._id;
                  return (
                    <div
                      key={boy._id}
                      onClick={() => setSelectedBoyId(boy._id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-[#EFF6FF] border-[#2563EB] shadow-xs"
                          : "bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {boy.name?.charAt(0)?.toUpperCase() || "B"}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-[#0F172A] block">
                            {boy.name}
                          </span>
                          <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#94A3B8]" />
                            {boy.mobile || "No Mobile"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] px-2 py-0.5 rounded-full">
                          Active
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[#2563EB] shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedBoyId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-md shadow-[#2563EB]/20 transition-all cursor-pointer disabled:opacity-50"
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
