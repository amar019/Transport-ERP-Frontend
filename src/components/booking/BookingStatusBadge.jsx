import React from "react";

export default function BookingStatusBadge({ type = "booking", value }) {
  if (!value) return null;

  if (type === "collection") {
    switch (value) {
      case "TO_PAY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            To Pay
          </span>
        );
      case "PAID_AT_BOOKING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Paid at Booking
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {value}
          </span>
        );
    }
  }

  if (type === "payment") {
    switch (value) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Partial
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Paid
          </span>
        );
      case "CREDIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Credit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {value}
          </span>
        );
    }
  }

  // Booking Status (type === "booking" or type === "status")
  switch (value) {
    case "BOOKED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Booked
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          {value}
        </span>
      );
  }
}
