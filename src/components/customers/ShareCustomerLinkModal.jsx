import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  QrCode,
  Printer,
  MessageCircle,
  Truck,
  Flame,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function ShareCustomerLinkModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate public registration URL based on deployed domain or current origin
  const baseUrl =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "https://transport-erp-frontend.vercel.app"
      : window.location.origin;
  const registrationUrl = `${baseUrl}/customers/add`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🚩 *MAHAKAL TRANSPORT*\n\nHello! Please register your shop details with Mahakal Transport for fast booking, electronic bilty, and real-time delivery updates:\n\n👉 ${registrationUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mahakal Transport - Customer Registration Poster</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
            * { box-sizing: border-box; }
            body {
              font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #0F172A;
              color: #0F172A;
            }
            .poster {
              width: 440px;
              background: white;
              border: 4px solid #EA580C;
              border-radius: 32px;
              padding: 36px 32px;
              text-align: center;
              box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
              margin: auto;
              position: relative;
              overflow: hidden;
            }
            .top-stripe {
              background: linear-gradient(90deg, #EA580C, #F97316, #F59E0B);
              height: 10px;
              width: 100%;
              position: absolute;
              top: 0;
              left: 0;
            }
            .brand-badge {
              background: #FFF7ED;
              color: #EA580C;
              border: 1px solid #FFEDD5;
              padding: 6px 16px;
              border-radius: 99px;
              font-weight: 900;
              font-size: 11px;
              letter-spacing: 2px;
              text-transform: uppercase;
              display: inline-block;
              margin-top: 8px;
            }
            .brand-name {
              font-size: 28px;
              color: #0F172A;
              margin: 12px 0 2px;
              font-weight: 900;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              font-weight: 800;
              color: #64748B;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              margin-bottom: 20px;
            }
            .divider {
              height: 1px;
              background: #E2E8F0;
              margin: 16px 0;
            }
            .title {
              font-size: 18px;
              font-weight: 900;
              color: #0F172A;
              margin-bottom: 6px;
            }
            .subtitle {
              font-size: 12px;
              color: #64748B;
              margin-bottom: 20px;
              line-height: 1.4;
            }
            .qr-container {
              background: #FFF7ED;
              border: 2px dashed #EA580C;
              border-radius: 24px;
              padding: 20px;
              display: inline-block;
              box-shadow: 0 10px 15px -3px rgba(234, 88, 12, 0.1);
            }
            .qr-img {
              width: 220px;
              height: 220px;
              display: block;
              border-radius: 12px;
            }
            .steps {
              margin-top: 24px;
              display: flex;
              justify-[#0F172A];
              gap: 8px;
              text-align: left;
            }
            .step-item {
              flex: 1;
              background: #F8FAFC;
              border: 1px solid #E2E8F0;
              padding: 10px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: 700;
              color: #334155;
              text-align: center;
            }
            .step-num {
              display: block;
              color: #EA580C;
              font-weight: 900;
              font-size: 12px;
              margin-bottom: 2px;
            }
            .footer-text {
              margin-top: 24px;
              font-size: 11px;
              font-weight: 800;
              color: #0F172A;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="poster">
            <div class="top-stripe"></div>
            <div class="brand-badge">Official Onboarding</div>
            <div class="brand-name">MAHAKAL TRANSPORT</div>
            <div class="brand-sub">Express Freight & Cargo Logistics</div>
            
            <div class="divider"></div>

            <div class="title">SCAN QR TO REGISTER YOUR SHOP</div>
            <div class="subtitle">Scan with camera or WhatsApp to complete registration in 1 minute.</div>

            <div class="qr-container">
              <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationUrl)}" alt="Mahakal Transport QR Code" />
            </div>

            <div class="steps">
              <div class="step-item">
                <span class="step-num">1</span>
                Scan QR Code
              </div>
              <div class="step-item">
                <span class="step-num">2</span>
                Fill Shop Details
              </div>
              <div class="step-item">
                <span class="step-num">3</span>
                Submit Form
              </div>
            </div>

            <div class="footer-text">
              ⚡ Ahilyanagar • Beed • Jamkhed • Pune • Sambhaji Nagar
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(registrationUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#334155] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#F97316] text-white flex items-center justify-center shadow-lg shadow-orange-950/40 shrink-0">
              <Truck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#FDBA74] uppercase tracking-wider">
                <Flame className="w-3 h-3 text-[#EA580C]" />
                Mahakal Transport ERP
              </div>
              <h3 className="font-extrabold text-base text-white leading-tight">
                Customer Onboarding Link & QR Code
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#94A3B8] hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* QR Code Card */}
          <div className="bg-[#FFF7ED] rounded-2xl border-2 border-dashed border-[#FFEDD5] p-5 text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-[#EA580C]/20">
              <img
                src={qrImageUrl}
                alt="Mahakal Transport Registration QR"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-[#0F172A] block">
                Counter Display QR Code
              </span>
              <span className="text-[11px] text-[#64748B]">
                Shop owners scan to register their profile in 1 minute.
              </span>
            </div>

            <button
              type="button"
              onClick={handlePrintQR}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print Mahakal Transport Counter Poster</span>
            </button>
          </div>

          {/* Share Links */}
          <div className="space-y-3">
            {/* Copy URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                Public Registration URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={registrationUrl}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl font-mono text-[#0F172A] select-all focus:outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    copied
                      ? "bg-[#059669] text-white"
                      : "bg-[#0F172A] hover:bg-[#1E293B] text-white"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Broadcast Registration Link via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8FAFC] px-6 py-3 border-t border-[#E2E8F0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F1F5F9] text-[#475569] font-bold text-xs rounded-xl border border-[#CBD5E1] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
