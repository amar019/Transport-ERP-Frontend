import React from "react";
import { Clock, Truck, CheckCircle2, AlertCircle } from "lucide-react";

export default function MemoStatusBadge({ type = "status", value = "CREATED" }) {
  if (type === "status") {
    switch (value) {
      case "CREATED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>Draft</span>
          </span>
        );
      case "ON_ROUTE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
            <Truck className="w-3 h-3 text-sky-600 animate-pulse" />
            <span>In Transit</span>
          </span>
        );
      case "RECEIVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Received</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {value}
          </span>
        );
    }
  }

  if (type === "collection") {
    switch (value) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case "PARTIAL":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
            <Clock className="w-3 h-3 text-indigo-600" />
            <span>Partial</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Settled</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {value}
          </span>
        );
    }
  }

  return null;
}
