import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import {
  Printer,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import api from "@/services/api";
import WireframeBilty from "@/components/Bilty/WireframeBilty";

export const BiltyPreviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  // Extract booking ID from query parameter ?id=... or route param /:id
  const bookingId = searchParams.get("id") || params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Viewport Zoom & Copy Mode States
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState("both"); // "both" | "customer" | "office"

  // Ref for react-to-print
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    content: () => printRef.current,
    documentTitle: booking?.bookingNumber ? `Bilty-${booking.bookingNumber}` : "Bilty-LR",
    pageStyle: `
      @page {
        size: A4 portrait !important;
        size: portrait !important;
        margin: 0 !important;
      }
      @media print {
        @page {
          size: A4 portrait !important;
          size: portrait !important;
          margin: 0 !important;
        }
        html, body {
          width: 210mm !important;
          height: 297mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          overflow: hidden !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print, .no-print * {
          display: none !important;
        }
      }
    `,
  });

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/bookings/${bookingId}`);
        const data = response.data?.data || response.data;
        if (data && Object.keys(data).length > 0) {
          setBooking(data);
        } else {
          setBooking(null);
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(err.response?.data?.message || "Booking details not found");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Adjust default initial zoom based on screen width
  useEffect(() => {
    const adjustZoomForMobile = () => {
      if (window.innerWidth < 640) {
        setZoomLevel(0.65);
      } else if (window.innerWidth < 1024) {
        setZoomLevel(0.85);
      } else {
        setZoomLevel(1);
      }
    };
    adjustZoomForMobile();
  }, []);

  // Keyboard shortcut listener for Print (Ctrl+P / Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (!loading && booking && !error) {
          handlePrint();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, booking, error, handlePrint]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.45));
  const handleZoomReset = () => {
    if (window.innerWidth < 640) setZoomLevel(0.65);
    else setZoomLevel(1);
  };

  // Operational payment status check
  const isPaidAtBooking =
    (booking?.collectionType || "").toUpperCase().replace(/[\s-]+/g, "_") === "PAID_AT_BOOKING";
  const isPaid = (booking?.paymentStatus || "").toUpperCase() === "PAID" || isPaidAtBooking;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-orange-500 selection:text-white pb-20 lg:pb-0">
      {/* ================= TOP EXECUTIVE TOOLBAR ================= */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5 sm:px-6 sm:py-2.5 sticky top-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-xl no-print">
        {/* Row 1: Back Button & LR Number Identity Chip */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
              title="Back to previous page"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span>Back</span>
            </button>

            {booking && (
              <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700/50">
                <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-xs font-mono font-black text-slate-200">
                  LR #{booking.bookingNumber || "N/A"}
                </span>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {booking && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black rounded-full border ${isPaid
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>PAID</span>
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>TO PAY</span>
                </>
              )}
            </span>
          )}
        </div>

        {/* Row 2: Viewport Controls (View Mode Toggle & Zoom Controls) */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {/* View Mode Segmented Pill Bar */}
          <div className="grid grid-cols-3 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-center text-xs font-bold w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode("both")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${viewMode === "both"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
                }`}
              title="Show Both Copies (Portrait A4)"
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setViewMode("customer")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${viewMode === "customer"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
                }`}
              title="Customer Copy Only"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setViewMode("office")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${viewMode === "office"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
                }`}
              title="Office Copy Only"
            >
              Office
            </button>
          </div>

          {/* Zoom Buttons (Touch-friendly for mobile and desktop) */}
          <div className="flex items-center gap-0.5 border-l border-slate-800 pl-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.45}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 w-10 text-center select-none">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 1.6}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleZoomReset}
              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Side Desktop Primary Action Button */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={loading || !booking || Boolean(error)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50 select-none group"
            title="Print Bilty Document (Ctrl + P)"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Preparing...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Print Bilty</span>
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-md font-mono text-orange-100 font-normal">
                  Ctrl+P
                </span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ================= INTERACTIVE VIEWPORT CANVAS ================= */}
      <main className="flex-1 p-2 sm:p-6 md:p-8 flex flex-col items-center justify-start overflow-auto bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
        {!bookingId ? (
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl text-center max-w-md my-auto shadow-2xl">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">Booking ID Missing</h3>
            <p className="text-xs text-slate-400">
              Please select a valid booking from the bookings list to view its bilty document.
            </p>
          </div>
        ) : loading ? (
          <div className="bg-slate-900 border border-slate-800 p-8 sm:p-12 rounded-2xl text-center my-auto shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-xs sm:text-sm font-semibold text-slate-300">
              Generating High-Resolution Bilty Preview...
            </span>
          </div>
        ) : error || !booking ? (
          <div className="bg-slate-900 border border-rose-900/50 p-6 sm:p-8 rounded-2xl text-center max-w-md my-auto shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">Unable to Load Bilty</h3>
            <p className="text-xs text-slate-400 mb-4">{error || "Booking record not found."}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          /* Scalable Document Viewport Canvas */
          <div className="w-full flex flex-col items-center justify-start overflow-x-auto py-2">
            <div
              className="transition-transform duration-150 ease-out origin-top my-2 sm:my-4"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Single Bilty Instance referenced by printRef */}
              <div
                ref={printRef}
                className="printable-bilty shadow-2xl shadow-black/80 rounded-sm bg-white overflow-hidden"
              >
                <WireframeBilty booking={booking} viewMode={viewMode} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= STICKY BOTTOM MOBILE ACTION BAR (lg:hidden) ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 p-3 shadow-2xl flex items-center justify-between gap-2.5 lg:hidden no-print">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-3 py-2 text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700/80 rounded-xl transition-colors shrink-0"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handlePrint}
          disabled={loading || !booking || Boolean(error)}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Preparing...</span>
            </>
          ) : (
            <>
              <Printer className="w-4 h-4" />
              <span>Print Bilty</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BiltyPreviewPage;
