import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  UserCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  MoreVertical,
  Store,
  ShieldCheck,
} from "lucide-react";

export default function DeliveryActionMenu({
  booking,
  onViewDetails,
  onAssignBoy,
  onCounterDeliver,
  onMarkDelivered,
  onMarkFailed,
  onCollectPayment,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef(null);

  const rawStatus =
    booking.deliveryStatus || booking.delivery?.status || booking.status || "PENDING";
  const deliveryStatus = rawStatus === "BOOKED" ? "PENDING" : rawStatus;

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    if (!dropdownOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 280);
    }
    setDropdownOpen((prev) => !prev);
  };

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
          title="Mark Parcel Delivered"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mark Delivered</span>
        </button>
      );
    }

    // 2. PENDING -> Assign Delivery Boy
    if (deliveryStatus === "PENDING") {
      return (
        <button
          type="button"
          onClick={() => onAssignBoy(booking)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] rounded-lg shadow-2xs transition-all cursor-pointer"
          title="Assign Delivery Boy & Start Delivery"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Assign Boy</span>
        </button>
      );
    }

    // 3. DELIVERED but Outstanding Balance Exists -> Collect Cash CTA
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

    // 4. DELIVERED & Fully Paid -> Clean Completed Pill
    if (deliveryStatus === "DELIVERED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
          <span>Completed</span>
        </span>
      );
    }

    // 5. FAILED
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
        <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
        <span>Failed</span>
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
        onClick={handleToggleDropdown}
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
        <div
          className={`absolute right-0 w-60 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl z-50 py-1.5 text-xs text-[#0F172A] animate-in fade-in zoom-in-95 duration-100 select-none ${
            openUpward ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {/* Header Info */}
          <div className="px-3 py-2 border-b border-[#F1F5F9] bg-[#F8FAFC] rounded-t-xl flex items-center justify-between">
            <span className="font-bold text-[#0F172A]">
              LR #{booking.bookingNumber || booking._id?.slice(-6)}
            </span>
            <span className="text-[10px] font-semibold text-[#64748B] uppercase px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
              {deliveryStatus.replace(/_/g, " ")}
            </span>
          </div>

          {/* SECTION: Delivery Operations */}
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Delivery Operations
            </div>

            {/* PENDING: Assign Delivery Boy */}
            {deliveryStatus === "PENDING" && (
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
                    Set Out For Delivery automatically
                  </div>
                </div>
              </button>
            )}

            {/* PENDING: Counter Delivery */}
            {deliveryStatus === "PENDING" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  onCounterDeliver(booking);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#ECFDF5] text-[#059669] flex items-center gap-2.5 font-semibold transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4 shrink-0" />
                <div>
                  <div>Counter Delivery</div>
                  <div className="text-[10px] font-normal text-[#059669]/80">
                    Direct counter pickup & payment
                  </div>
                </div>
              </button>
            )}

            {/* OUT_FOR_DELIVERY: Mark Delivered */}
            {deliveryStatus === "OUT_FOR_DELIVERY" && (
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
                    Mark parcel delivered
                  </div>
                </div>
              </button>
            )}

            {/* OUT_FOR_DELIVERY: Mark Failed */}
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
                    Record reason & update status
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
