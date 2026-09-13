import React from "react";
import {
  X,
  Package,
  MapPin,
  User,
  Truck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Phone,
  Building2,
  ShieldCheck,
  Tag,
} from "lucide-react";

export default function DeliveryDetailsModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const statusConfig = {
    PENDING: { label: "Pending Dispatch", bg: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", bg: "bg-[#ECFEFF] text-[#0891B2] border-[#CFFAFE]" },
    DELIVERED: { label: "Delivered", bg: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]" },
    FAILED: { label: "Delivery Failed", bg: "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]" },
  };

  const deliveryStatus = booking.deliveryStatus || booking.delivery?.status || booking.status || "PENDING";
  const st = statusConfig[deliveryStatus] || statusConfig.PENDING;

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] flex items-center justify-center shrink-0 shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                  LR #{booking.bookingNumber || booking._id?.slice(-6)}
                </h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${st.bg}`}>
                  {st.label}
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                Booked on {formatDate(booking.bookingDate || booking.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Section 1: Customer Info & Delivery Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs pb-2 border-b border-[#E2E8F0]">
                <Building2 className="w-4 h-4 text-[#F97316]" />
                Consignee / Customer Details
              </div>
              <p className="font-bold text-[#0F172A] text-xs">
                {booking.customer?.shopName || booking.customer?.ownerName || booking.customer?.name || "Walk-in Customer"}
              </p>
              {booking.customer?.ownerName && (
                <p className="text-[#64748B]">
                  Owner: <strong className="text-[#334155]">{booking.customer.ownerName}</strong>
                </p>
              )}
              {booking.customer?.mobile ? (
                <p className="text-[#64748B] flex items-center gap-1.5 font-medium">
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                  {booking.customer.mobile}
                </p>
              ) : (
                <p className="text-[#94A3B8]">No Mobile Contact</p>
              )}
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs pb-2 border-b border-[#E2E8F0]">
                <MapPin className="w-4 h-4 text-[#F97316]" />
                Destination & Delivery Address
              </div>
              <p className="text-[#334155] font-medium leading-relaxed">
                {booking.deliveryAddress || booking.customer?.address || "Branch Pickup / Standard Address"}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[11px] text-[#64748B] font-medium">
                <span>From: <strong className="text-[#0F172A]">{booking.fromBranch?.name || booking.from || "Main Branch"}</strong></span>
                <span>→</span>
                <span>To: <strong className="text-[#0F172A]">{booking.toBranch?.name || booking.to || "Destination Branch"}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Boy & Status Lifecycle */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
                <Truck className="w-4 h-4 text-[#0891B2]" />
                Delivery Personnel & Status Lifecycle
              </div>
              {booking.delivery?.assignedAt && (
                <span className="text-[11px] font-medium text-[#64748B]">
                  Assigned: {formatDate(booking.delivery.assignedAt)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#64748B] font-medium">Assigned Delivery Boy:</span>
                <p className="font-bold text-[#0F172A] mt-0.5">
                  {booking.delivery?.deliveryBoy?.name ? (
                    `${booking.delivery.deliveryBoy.name} (${booking.delivery.deliveryBoy.mobile || "No Mobile"})`
                  ) : (
                    <span className="text-[#D97706] font-semibold italic">Unassigned</span>
                  )}
                </p>
              </div>

              <div>
                <span className="text-[#64748B] font-medium">Delivered Timestamp:</span>
                <p className="font-semibold text-[#0F172A] mt-0.5">
                  {booking.delivery?.deliveredAt
                    ? formatDate(booking.delivery.deliveredAt)
                    : "Pending Delivery Completion"}
                </p>
              </div>
            </div>

            {booking.delivery?.remarks && (
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] text-[#334155] space-y-0.5">
                <span className="font-bold text-[#0F172A]">Delivery Notes / Remarks: </span>
                <p className="text-xs text-[#64748B] mt-0.5">{booking.delivery.remarks}</p>
              </div>
            )}
          </div>

          {/* Section 3: Financial & Payment Status */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-1.5 font-bold text-[#0F172A] text-xs">
                <IndianRupee className="w-4 h-4 text-[#059669]" />
                Financial Collections & Payment Summary
              </div>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                  booking.paymentStatus === "PAID"
                    ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                    : booking.paymentStatus === "PARTIAL"
                    ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                    : "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                }`}
              >
                {booking.paymentStatus || "PENDING"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Type</span>
                <p className="font-bold text-[#0F172A] mt-1">
                  {booking.collectionType || "TO_PAY"}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Freight Amount</span>
                <p className="font-mono font-bold text-[#0F172A] mt-1 text-xs">
                  ₹{(booking.totalAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Paid Amount</span>
                <p className="font-mono font-bold text-[#059669] mt-1 text-xs">
                  ₹{(booking.paidAmount || 0).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Due Remaining</span>
                <p className="font-mono font-bold text-[#DC2626] mt-1 text-xs">
                  ₹{remaining.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] hover:bg-[#F1F5F9] rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
