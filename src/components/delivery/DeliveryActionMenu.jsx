import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const rawStatus =
    booking.deliveryStatus || booking.delivery?.status || booking.status || "PENDING";
  const deliveryStatus = rawStatus === "BOOKED" ? "PENDING" : rawStatus;

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 208; // 13rem / w-52
    const dropdownHeight = 240;

    let left = rect.right - dropdownWidth;
    let top = rect.bottom + 6;

    // Viewport bottom boundary protection
    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - 6;
    }

    // Viewport left boundary protection
    if (left < 10) {
      left = 10;
    }

    setCoords({ top, left });
  }, []);

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    if (!dropdownOpen) {
      updatePosition();
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  // Close dropdown on click outside, scroll, resize or press ESC key
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setDropdownOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [dropdownOpen]);

  // Primary Action Button
  const renderPrimaryAction = () => {
    if (deliveryStatus === "OUT_FOR_DELIVERY") {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkDelivered(booking);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          title="Mark Parcel Delivered"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mark Delivered</span>
        </button>
      );
    }

    if (deliveryStatus === "PENDING") {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAssignBoy(booking);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          title="Assign Delivery Boy & Start Delivery"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Assign Boy</span>
        </button>
      );
    }

    if (deliveryStatus === "DELIVERED") {
      return remaining > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3 h-3 text-[#D97706]" />
          <span>Completed (Pending ₹{remaining})</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3 h-3 text-[#059669]" />
          <span>Completed</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] whitespace-nowrap shrink-0">
        <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
        <span>Failed</span>
      </span>
    );
  };

  return (
    <div className="flex items-center justify-end gap-1.5 shrink-0 select-none whitespace-nowrap">
      {/* Primary Contextual CTA */}
      {renderPrimaryAction()}

      {/* 3-Dots Dropdown Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleDropdown}
        className={`p-1 rounded-md border shadow-2xs transition-all cursor-pointer shrink-0 ${
          dropdownOpen
            ? "text-[#0F172A] bg-[#F1F5F9] border-[#CBD5E1]"
            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] bg-white border-[#E2E8F0]"
        }`}
        title="More Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Contextual Action Floating Menu via Portal */}
      {dropdownOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 text-xs text-[#0F172A] animate-in fade-in zoom-in-95 duration-100 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Info */}
            <div className="px-3 py-1.5 border-b border-[#F1F5F9] bg-[#F8FAFC] rounded-t-xl flex items-center justify-between">
              <span className="font-bold text-[#0F172A]">
                LR #{booking.bookingNumber || (booking._id || booking.id)?.slice(-6)}
              </span>
              <span className="text-[9px] font-bold text-[#64748B] uppercase px-1.5 py-0.2 rounded bg-white border border-[#E2E8F0]">
                {deliveryStatus.replace(/_/g, " ")}
              </span>
            </div>

            {/* SECTION: Delivery Operations */}
            <div className="py-1">
              <div className="px-3 py-0.5 text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wider">
                Operations
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
                  className="w-full px-3 py-1.5 text-left hover:bg-[#EFF6FF] text-[#2563EB] flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Assign Delivery Boy</span>
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
                  className="w-full px-3 py-1.5 text-left hover:bg-[#ECFDF5] text-[#059669] flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span>Counter Delivery</span>
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
                  className="w-full px-3 py-1.5 text-left hover:bg-[#ECFDF5] text-[#059669] flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Mark Delivered</span>
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
                  className="w-full px-3 py-1.5 text-left hover:bg-[#FEF2F2] text-[#DC2626] flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Mark Failed</span>
                </button>
              )}
            </div>

            <div className="h-px bg-[#F1F5F9] my-0.5" />

            {/* SECTION: View Details */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                onViewDetails(booking);
              }}
              className="w-full px-3 py-1.5 text-left hover:bg-[#F8FAFC] text-[#0F172A] flex items-center gap-2 font-semibold transition-colors cursor-pointer rounded-b-xl"
            >
              <Eye className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
              <span>View Details & History</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
