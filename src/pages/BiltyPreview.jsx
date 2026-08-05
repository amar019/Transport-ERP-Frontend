import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import api from "../services/api";
import Bilty from "../components/Bilty/WireframeBilty";

const BiltyPreview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  
  // Extract booking ID from query parameter ?id=... or route param /:id
  const bookingId = searchParams.get("id") || params.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Single source of truth ref for react-to-print
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    content: () => printRef.current,
    documentTitle: booking?.bookingNumber ? `Bilty-${booking.bookingNumber}` : "Bilty",
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        html, body {
          width: 297mm !important;
          height: 210mm !important;
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
        let response;
        try {
          response = await api.get(`/bookings/${bookingId}`);
        } catch (apiErr) {
          const token = localStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          response = await axios.get(`http://localhost:3000/api/bookings/${bookingId}`, { headers });
        }

        const data = response.data?.data || response.data;
        if (data && Object.keys(data).length > 0) {
          setBooking(data);
        } else {
          setBooking(null);
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(err.response?.data?.message || "Booking not found");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased">
      {/* Top Application Header - Hidden strictly during printing */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 sticky top-0 z-50 flex items-center justify-between shadow-xs no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-800 tracking-tight">
              Bilty Preview
            </h1>
            {booking?.bookingNumber && (
              <span className="text-xs font-semibold text-slate-500">
                Booking No: <span className="font-mono text-orange-600 font-bold">{booking.bookingNumber}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Print Bilty Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={loading || !booking || Boolean(error)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Print Bilty</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* On-Screen Bilty Preview Container */}
      <main className="p-4 md:p-8 flex justify-center overflow-x-auto">
        {!bookingId ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center font-bold text-slate-600 text-sm">
            Booking ID not provided
          </div>
        ) : loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center font-bold text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span>Loading booking bilty...</span>
          </div>
        ) : error || !booking ? (
          <div className="bg-white p-8 rounded-2xl border border-rose-200 text-rose-600 font-bold text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error || "Booking details not found"}</span>
          </div>
        ) : (
          /* Single Bilty Instance referenced by printRef */
          <div ref={printRef} className="printable-bilty shadow-md bg-white">
            <Bilty booking={booking} />
          </div>
        )}
      </main>
    </div>
  );
};

export default BiltyPreview;
