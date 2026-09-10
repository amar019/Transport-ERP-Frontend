import React from "react";
import {
  Package,
  Clock,
  UserCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

export default function DeliveryKPICards({ metrics = {} }) {
  const {
    total = 0,
    pending = 0,
    assigned = 0,
    outForDelivery = 0,
    delivered = 0,
    failed = 0,
    totalCollected = 0,
  } = metrics;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(val || 0));
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 no-print">
      {/* Card 1: Total Deliveries */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Total Deliveries
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
            {total}
          </span>
          <span className="text-xs text-[#64748B] font-normal block mt-0.5">
            Total shipments
          </span>
        </div>
      </div>

      {/* Card 2: Pending / Unassigned */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Pending / Unassigned
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
            {pending}
          </span>
          <span className="text-xs text-[#64748B] font-normal block mt-0.5">
            Awaiting boy assignment
          </span>
        </div>
      </div>

      {/* Card 3: Out for Delivery */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Out for Delivery
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE] flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
            {outForDelivery}
          </span>
          <span className="text-xs text-[#64748B] font-normal block mt-0.5">
            In transit
          </span>
        </div>
      </div>

      {/* Card 4: Delivered */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Delivered
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
            {delivered}
          </span>
          <span className="text-xs text-[#64748B] font-normal block mt-0.5">
            Successfully completed
          </span>
        </div>
      </div>

      {/* Card 5: Failed */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Failed Deliveries
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
            {failed}
          </span>
          <span className="text-xs text-[#64748B] font-normal block mt-0.5">
            Attempt failed
          </span>
        </div>
      </div>

      {/* Card 6: Total Collected */}
      <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Total Collected
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF] flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-xs text-[#64748B] font-normal block mt-0.5">
            COD cash collected
          </span>
        </div>
      </div>
    </div>
  );
}
