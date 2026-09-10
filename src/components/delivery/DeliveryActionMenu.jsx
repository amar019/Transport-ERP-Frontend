import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  UserCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  MoreVertical,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DeliveryActionMenu({
  booking,
  onViewDetails,
  onAssignBoy,
  onStartDelivery,
  onMarkDelivered,
  onMarkFailed,
  onCollectPayment,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  const deliveryStatus =
    booking.deliveryStatus || booking.delivery?.status || booking.status || "PENDING";

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  const isPaid = booking.paymentStatus === "PAID" || remaining <= 0;

  // Close dropdown on click outside or press ESC key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Primary High-Contrast Contextual Action Button
  const renderPrimaryAction = () => {
    // 1. OUT_FOR_DELIVERY -> Mark Delivered
    if (deliveryStatus === "OUT_FOR_DELIVERY") {
      return (
        <button
          type="button"
          onClick={() => onMarkDelivered(booking)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] rounded-lg shadow-2xs transition-all cursor-pointer"
          title="Mark Parcel Delivered to Customer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Deliver</span>
        </button>
      );
    }

    // 2. ASSIGNED -> Mark Out For Delivery
    if (deliveryStatus === "ASSIGNED") {
      return (
        <button
          type="button"
          onClick={() => onStartDelivery(booking)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0891B2] hover:bg-[#0E7490] active:bg-[#155E75] rounded-lg shadow-2xs transition-all cursor-pointer"
          title="Mark Out for Delivery"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Out for Delivery</span>
        </button>
      );
    }

    // 3. PENDING / BOOKED -> Direct Counter Deliver (Fastest flow for branch owner)
    if (deliveryStatus === "PENDING" || deliveryStatus === "BOOKED") {
      return (
        <button
          type="button"
          onClick={() => onMarkDelivered(booking)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] active:bg-[#A7F3D0] rounded-lg border border-[#A7F3D0] transition-all cursor-pointer"
          title="Direct Counter / Self Delivery"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Deliver</span>
        </button>
      );
    }

    // 4. FAILED -> Reassign Delivery Boy
    if (deliveryStatus === "FAILED") {
      return (
        <button
          type="button"
          onClick={() => onAssignBoy(booking)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#D97706] bg-[#FFFBEB] hover:bg-[#FEF3C7] active:bg-[#FDE68A] rounded-lg border border-[#FDE68A] transition-all cursor-pointer"
          title="Reassign Delivery Boy"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Reassign</span>
        </button>
      );
    }

    // 5. DELIVERED but Outstanding Balance Exists -> Collect Cash CTA
    if (deliveryStatus === "DELIVERED" && remaining > 0) {
      return (
        <button
          type="button"
          onClick={() => onCollectPayment(booking)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#9333EA] hover:bg-[#7E22CE] active:bg-[#6B21A8] rounded-lg shadow-2xs transition-all cursor-pointer"
          title={`Collect Outstanding Balance of ₹${remaining}`}
        >
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Collect ₹{remaining}</span>
        </button>
      );
    }

    // 6. DELIVERED & Fully Paid -> Clean Completed Pill
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
        <span>Completed</span>
      </span>
    );
  };

  return (
    <div className="relative inline-flex items-center gap-1" ref={menuRef}>
      {/* Primary CTA */}
      {renderPrimaryAction()}

      {/* Quick View Details Button */}
      <button
        type="button"
        onClick={() => onViewDetails(booking)}
        className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-all cursor-pointer"
        title="View Full Booking & Delivery Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* 3-Dots Dropdown Trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen((prev) => !prev);
        }}
        className={`p-1.5 rounded-lg border shadow-2xs transition-all cursor-pointer ${
          dropdownOpen
            ? "text-[#0F172A] bg-[#F1F5F9] border-[#CBD5E1]"
            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] bg-white border-[#E2E8F0]"
        }`}
        title="All Available Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Contextual Action Floating Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 py-1.5 text-xs text-[#0F172A] animate-in fade-in zoom-in-95 duration-100 select-none">
          {/* Header Info */}
          <div className="px-3 py-2 border-b border-[#F1F5F9] bg-[#F8FAFC] rounded-t-xl flex items-center justify-between">
            <span className="font-bold text-[#0F172A]">
              LR #{booking.bookingNumber || booking._id?.slice(-6)}
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] uppercase px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
              {deliveryStatus.replace(/_/g, " ")}
            </span>
          </div>

          {/* SECTION: Delivery Actions */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Delivery Operations
            </div>

            {/* Direct Counter Delivery */}
            {deliveryStatus !== "DELIVERED" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onMarkDelivered(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#ECFDF5] text-[#059669] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div>
                  <div>Mark Delivered</div>
                  <div className="text-[10px] font-normal text-[#059669]/80">
                    Direct counter or self delivery
                  </div>
                </div>
              </button>
            )}

            {/* Assign Delivery Boy */}
            {(deliveryStatus === "PENDING" || deliveryStatus === "BOOKED") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onAssignBoy(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#EFF6FF] text-[#2563EB] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <div>
                  <div>Assign Delivery Boy</div>
                  <div className="text-[10px] font-normal text-[#2563EB]/80">
                    Dispatch via registered boy
                  </div>
                </div>
              </button>
            )}

            {/* Out For Delivery */}
            {deliveryStatus === "ASSIGNED" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onStartDelivery(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#ECFEFF] text-[#0891B2] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <Truck className="w-4 h-4 shrink-0" />
                <div>
                  <div>Start Delivery Journey</div>
                  <div className="text-[10px] font-normal text-[#0891B2]/80">
                    Set out for delivery
                  </div>
                </div>
              </button>
            )}

            {/* Reassign Boy */}
            {(deliveryStatus === "ASSIGNED" || deliveryStatus === "FAILED") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onAssignBoy(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFFBEB] text-[#D97706] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <div>
                  <div>Reassign Delivery Boy</div>
                  <div className="text-[10px] font-normal text-[#D97706]/80">
                    Change assigned delivery personnel
                  </div>
                </div>
              </button>
            )}

            {/* Mark Failed */}
            {deliveryStatus === "OUT_FOR_DELIVERY" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onMarkFailed(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FEF2F2] text-[#DC2626] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <div>
                  <div>Mark Delivery Failed</div>
                  <div className="text-[10px] font-normal text-[#DC2626]/80">
                    Record reason & reschedule
                  </div>
                </div>
              </button>
            )}
          </div>

          <div className="h-px bg-[#F1F5F9] my-1" />

          {/* SECTION: Payment Actions */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Financial Collections
            </div>

            {remaining > 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onCollectPayment(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FAF5FF] text-[#9333EA] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <IndianRupee className="w-4 h-4 shrink-0" />
                <div>
                  <div>Collect Cash Payment</div>
                  <div className="text-[10px] font-normal text-[#9333EA]/80">
                    Due Balance: ₹{remaining}
                  </div>
                </div>
              </button>
            ) : (
              <div className="px-3 py-1.5 text-[11px] text-[#059669] flex items-center gap-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Payment Fully Settled</span>
              </div>
            )}
          </div>

          <div className="h-px bg-[#F1F5F9] my-1" />

          {/* SECTION: View Details */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              onViewDetails(booking);
            }}
            className="w-full px-3 py-2 text-left hover:bg-[#F8FAFC] text-[#0F172A] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer rounded-b-xl"
          >
            <Eye className="w-4 h-4 text-[#64748B] shrink-0" />
            <span>View Full Details & History</span>
          </button>
        </div>
      )}
    </div>
  );
}
