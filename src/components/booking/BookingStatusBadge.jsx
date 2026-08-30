import React from "react";

export default function BookingStatusBadge({ type = "booking", value }) {
  if (!value) return null;

  if (type === "collection") {
    switch (value) {
      case "TO_PAY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
            To Pay
          </span>
        );
      case "PAID_AT_BOOKING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            Paid at Booking
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            {value}
          </span>
        );
    }
  }

  if (type === "payment") {
    switch (value) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
            Pending
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
            Partial
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            Paid
          </span>
        );
      case "CREDIT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></span>
            Credit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            {value}
          </span>
        );
    }
  }

  // Booking Status (type === "booking" or type === "status")
  switch (value) {
    case "BOOKED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
          Booked
        </span>
      );
    case "DELIVERED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
          Delivered
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]"></span>
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
          {value}
        </span>
      );
  }
}

