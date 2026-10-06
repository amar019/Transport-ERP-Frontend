import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  UserCheck,
  Wallet,
  Check,
  Package,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function MarkDeliveredModal({
  isOpen,
  onClose,
  booking,
  onDeliver,
}) {
  const [paymentCollected, setPaymentCollected] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const remaining = Number(
    booking.remainingAmount ??
      (Number(booking.totalAmount || 0) - Number(booking.paidAmount || 0))
  );

  const isUnpaidToPay = booking.collectionType === "TO_PAY" && remaining > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        remarks: "Delivered successfully to customer",
        paymentCollected: isUnpaidToPay ? paymentCollected : false,
        paymentMode: isUnpaidToPay && paymentCollected ? "CASH" : null,
      };

      await onDeliver(booking._id || booking.id, payload);
      onClose();
    } catch (err) {
      console.error("Mark delivered error:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to mark as delivered"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white border border-orange-100/90 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* CLEAN WHITE HEADER WITH ORANGE ACCENTS */}
        <div className="bg-white px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  Mark Delivery Completed
                </h3>
                <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
                  #{booking.bookingNumber || (booking._id || booking.id)?.slice(-6)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Log parcel handover & payment collection details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4 max-h-[82vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* SHIPMENT SUMMARY CARD */}
          <div className="p-4 rounded-xl bg-orange-50/40 border border-orange-200/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-orange-200/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-orange-600" />
                Shipment Details
              </span>
              <span className="text-[10px] font-bold bg-white text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-md shadow-2xs">
                {booking.totalPackages || 1} {booking.totalPackages === 1 ? "Package" : "Packages"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700 pt-0.5">
              <div className="space-y-0.5">
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-orange-600" /> Recipient
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {booking.customer?.shopName || booking.receiver?.shopName || booking.customer?.name || "Walk-in Customer"}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-orange-600" /> Delivery Boy
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {booking.delivery?.deliveryBoy?.name || "Branch Counter Pickup"}
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT COLLECTION REPORTING SECTION */}
          {isUnpaidToPay ? (
            <div className="p-4 rounded-2xl bg-white border border-orange-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 border-b border-orange-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                      Payment Collection Status
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Report payment outcome from delivery boy
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold flex items-center gap-1">
                  <span>Due:</span>
                  <span className="text-sm font-bold text-orange-600">₹{remaining}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Did the delivery boy collect the payment?</span>
                </label>

                {/* OPTION 1: YES (GREEN) */}
                <div
                  onClick={() => setPaymentCollected(true)}
                  className={`group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    paymentCollected
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        paymentCollected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white group-hover:border-emerald-400"
                      }`}
                    >
                      {paymentCollected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                        Yes, payment collected
                      </span>
                      {paymentCollected && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                      ₹{remaining} collected by delivery boy → Added to Delivery Boy Ledger
                    </p>
                  </div>
                </div>

                {/* OPTION 2: NO (RED) */}
                <div
                  onClick={() => setPaymentCollected(false)}
                  className={`group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !paymentCollected
                      ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-2xs"
                      : "bg-white border-slate-200 hover:border-rose-300 hover:bg-rose-50/30"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        !paymentCollected
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-slate-300 bg-white group-hover:border-rose-400"
                      }`}
                    >
                      {!paymentCollected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="space-y-0.5 flex-1 pr-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-rose-950 transition-colors">
                        No, payment not collected
                      </span>
                      {!paymentCollected && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-rose-700 font-semibold leading-relaxed">
                      ₹{remaining} remains outstanding → Branch owner can collect it later
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs flex items-center gap-2.5 font-bold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Payment already settled for this shipment</span>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm Delivery</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



