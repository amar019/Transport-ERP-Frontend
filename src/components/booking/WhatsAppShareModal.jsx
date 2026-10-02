import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X, Copy, Check, Send, Phone, User } from "lucide-react";
import {
  formatWhatsAppPhone,
  generateBiltyWhatsAppMessage,
  shareBiltyOnWhatsApp,
} from "@/utils/whatsappShare";

export default function WhatsAppShareModal({ booking, isOpen, onClose }) {
  const [recipientType, setRecipientType] = useState("consignee"); // 'consignee' | 'consignor' | 'custom'
  const [customPhone, setCustomPhone] = useState("");
  const [copied, setCopied] = useState(false);

  // Extract phone numbers
  const consigneeName =
    booking?.customer?.shopName ||
    booking?.receiver?.name ||
    booking?.customer?.name ||
    "Consignee";
  const consigneePhone =
    booking?.customer?.mobile ||
    booking?.customer?.phone ||
    booking?.receiver?.mobile ||
    booking?.receiver?.phone ||
    "";

  const consignorName = booking?.sender?.name || "Consignor";
  const consignorPhone = booking?.sender?.mobile || "";

  // Target phone number based on selected recipient type
  const targetPhone =
    recipientType === "consignee"
      ? consigneePhone
      : recipientType === "consignor"
      ? consignorPhone
      : customPhone;

  const formattedTargetPhone = formatWhatsAppPhone(targetPhone);
  const messageText = booking ? generateBiltyWhatsAppMessage(booking) : "";

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleSend = () => {
    if (!booking) return;
    shareBiltyOnWhatsApp(targetPhone, booking);
    onClose();
  };

  if (!isOpen || !booking) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <MessageCircle className="w-5 h-5 text-white fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Share Bilty on WhatsApp
              </h3>
              <p className="text-xs text-emerald-100 font-medium">
                LR #{booking.bookingNumber || "N/A"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Recipient Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Recipient
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Consignee */}
              <button
                type="button"
                onClick={() => setRecipientType("consignee")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  recipientType === "consignee"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">Consignee</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1 truncate">
                  {consigneeName}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {consigneePhone || "No Mobile"}
                </div>
              </button>

              {/* Option 2: Consignor */}
              <button
                type="button"
                onClick={() => setRecipientType("consignor")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  recipientType === "consignor"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate">Consignor</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1 truncate">
                  {consignorName}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {consignorPhone || "No Mobile"}
                </div>
              </button>

              {/* Option 3: Custom Number */}
              <button
                type="button"
                onClick={() => setRecipientType("custom")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  recipientType === "custom"
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom Phone</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-1">
                  Enter Number
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Any 10-digit
                </div>
              </button>
            </div>
          </div>

          {/* Custom Phone Input */}
          {recipientType === "custom" && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Enter Mobile Number (with or without +91)
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Phone Target Display */}
          <div className="flex items-center justify-between text-xs bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 font-mono">
            <span className="text-slate-500 font-sans font-medium">WhatsApp Target:</span>
            <span className="font-bold text-slate-800">
              {formattedTargetPhone ? `+${formattedTargetPhone}` : "(Direct Share Prompt)"}
            </span>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Message Preview
              </label>

              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <pre className="bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-xl text-[11px] font-sans text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-medium">
              {messageText}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs md:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
