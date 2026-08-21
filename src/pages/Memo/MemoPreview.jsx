import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { Printer, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import api from "../../services/api";
import MemoPrintDocument from "../../components/memo/MemoPrintDocument";

export default function MemoPreview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  const memoId = searchParams.get("id") || params.id;

  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Print ref for react-to-print
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    content: () => printRef.current,
    documentTitle: memo?.memoNumber ? `Manifest-${memo.memoNumber}` : "Dispatch-Manifest",
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm !important;
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print, .no-print * {
          display: none !important;
        }
        .print-sheet-wrapper {
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
        }
      }
    `,
  });

  useEffect(() => {
    const fetchMemo = async () => {
      if (!memoId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/memos/${memoId}`);
        const data = response.data?.data || response.data;
        if (data && Object.keys(data).length > 0) {
          setMemo(data);
        } else {
          setMemo(null);
        }
      } catch (err) {
        console.error("Error fetching memo details:", err);
        setError(err.response?.data?.message || "Memo not found");
        setMemo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMemo();
  }, [memoId]);

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased selection:bg-orange-100">
      {/* Top Header - Ultra-compact, hidden during printing */}
      <header className="bg-white border-b border-slate-200 px-3 md:px-6 py-1.5 sticky top-0 z-50 flex items-center justify-between shadow-2xs no-print">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Print / Download Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={loading || !memo || Boolean(error)}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="p-2 md:p-4 flex justify-center overflow-x-auto">
        {!memoId ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center font-bold text-slate-600 text-sm">
            Memo ID not provided
          </div>
        ) : loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center font-bold text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span>Loading memo manifest...</span>
          </div>
        ) : error || !memo ? (
          <div className="bg-white p-8 rounded-2xl border border-rose-200 text-rose-600 font-bold text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error || "Memo details not found"}</span>
          </div>
        ) : (
          /* Printable Memo Document Container */
          <div
            ref={printRef}
            className="print-sheet-wrapper shadow-lg bg-white border border-slate-300 rounded-xs my-4"
            style={{ width: "210mm" }}
          >
            <MemoPrintDocument memo={memo} />
          </div>
        )}
      </main>
    </div>
  );
}
