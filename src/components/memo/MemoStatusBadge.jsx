import React from "react";
import { Clock, Truck, CheckCircle2, AlertCircle } from "lucide-react";

export default function MemoStatusBadge({ type = "status", value = "CREATED" }) {
  if (!value) return null;

  if (type === "status") {
    const norm = String(value).toUpperCase();
    if (norm === "CREATED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span>Created</span>
        </span>
      );
    }

    if (norm === "IN_TRANSIT" || norm === "ON_ROUTE") {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap">
          <Truck className="w-3 h-3 text-blue-600" />
          <span>In Transit</span>
        </span>
      );
    }

    if (norm === "RECEIVED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Received</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
        {value}
      </span>
    );
  }

  if (type === "collection") {
    const norm = String(value).toUpperCase();
    if (norm === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/90 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Pending</span>
        </span>
      );
    }

    if (norm === "PARTIAL") {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          <span>Partial</span>
        </span>
      );
    }

    if (norm === "COMPLETED" || norm === "SETTLED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Settled</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
        {value}
      </span>
    );
  }

  return null;
}
