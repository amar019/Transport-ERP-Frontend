import React, { useState } from "react";
import { X, Wallet, AlertCircle, CheckCircle2, IndianRupee } from "lucide-react";
import { settleDeliveryBoyLedger } from "@/services/deliveryBoyLedger.service";

export default function SettleDeliveryBoyModal({
  deliveryBoy,
  currentBalance = 0,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !deliveryBoy) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid positive settlement amount.");
      return;
    }

    if (numAmount > currentBalance) {
      setError(`Settlement amount cannot exceed current balance of ₹${currentBalance.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      await settleDeliveryBoyLedger(deliveryBoy._id, {
        amount: numAmount,
        remarks: remarks.trim(),
      });
      setAmount("");
      setRemarks("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error settling delivery boy ledger:", err);
      setError(err.response?.data?.message || err.message || "Failed to record settlement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settle Cash Collection</h3>
              <p className="text-xs text-slate-500">{deliveryBoy.name} ({deliveryBoy.mobile || "N/A"})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Alert Box */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Pending Cash with Delivery Boy:</span>
          </div>
          <span className="text-sm font-extrabold text-amber-900">₹{currentBalance.toLocaleString()}</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Settlement Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Settlement Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                max={currentBalance || undefined}
                required
                placeholder={`Max ₹${currentBalance}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
            {currentBalance > 0 && (
              <button
                type="button"
                onClick={() => setAmount(currentBalance.toString())}
                className="mt-1 text-[11px] font-semibold text-orange-600 hover:underline"
              >
                Settle Full Amount (₹{currentBalance.toLocaleString()})
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Remarks / Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Received cash payment at office counter"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? "Recording..." : "Record Settlement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
