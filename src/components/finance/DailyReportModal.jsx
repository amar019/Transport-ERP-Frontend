import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Calendar,
  X,
  RefreshCw,
  Printer,
  AlertCircle,
  FileText,
} from "lucide-react";
import { getDeliveryBoyDailyReport } from "@/services/deliveryBoyLedger.service";

export default function DailyReportModal({
  isOpen,
  deliveryBoy,
  onClose,
}) {
  // Today's date in YYYY-MM-DD format (IST local date)
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [reportDate, setReportDate] = useState(getTodayStr());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    if (!deliveryBoy?._id || !reportDate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getDeliveryBoyDailyReport(deliveryBoy._id, reportDate);
      if (res.data) {
        setReportData(res.data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.error("Error fetching daily report:", err);
      setError(err.response?.data?.message || "Failed to load daily report.");
    } finally {
      setLoading(false);
    }
  }, [deliveryBoy, reportDate]);

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, fetchReport]);

  if (!isOpen) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "--";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handlePrint = () => {
    window.print();
  };

  const summary = reportData?.summary || { totalCollections: 0, totalAmountCollected: 0 };
  const collections = reportData?.collections || [];

  // Compute table column totals
  let totalBillAmount = 0;
  let totalCollected = 0;

  collections.forEach((item) => {
    totalBillAmount += Number(item.booking?.totalAmount || 0);
    totalCollected += Number(item.paymentTransaction?.amount || item.debit || 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Print Specific CSS Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-memo-wrapper, #printable-memo-wrapper * {
            visibility: visible !important;
          }
          #printable-memo-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL TOOLBAR (HIDDEN IN PRINT) */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Date:
              </span>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-1 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-500 cursor-pointer"
              />
            </div>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-slate-700" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || collections.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Memo</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE MEMO DOCUMENT CONTAINER */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 font-sans" id="printable-memo-wrapper">
          {error && (
            <div className="p-3 mb-4 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 no-print">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MEMO FORMAL HEADER */}
          <div className="text-center pb-3 border-b-2 border-slate-900 mb-4">
            <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900 font-serif">
              MAHAKAL TRANSPORT
            </h1>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mt-1">
              DAILY DELIVERY COLLECTION MEMO
            </h2>
          </div>

          {/* METADATA INFO BAR */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 bg-slate-50 text-xs mb-4">
            <div>
              <span className="font-bold text-slate-600 uppercase text-[11px]">Delivery Boy Name: </span>
              <span className="font-bold text-slate-900 text-sm ml-1">
                {reportData?.deliveryBoy?.name || deliveryBoy?.name || "--"}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 uppercase text-[11px]">Memo Date: </span>
              <span className="font-bold text-slate-900 text-sm ml-1">
                {formatDateDisplay(reportDate)}
              </span>
            </div>
          </div>

          {/* MAIN COLLECTION TABLE */}
          <div className="mb-4">
            <table className="w-full text-left text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-300 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-2 px-2 border border-slate-300 text-center w-10">Sr.</th>
                  <th className="py-2 px-3 border border-slate-300 text-center whitespace-nowrap">Bill No.</th>
                  <th className="py-2 px-3 border border-slate-300">Shop / Customer</th>
                  <th className="py-2 px-3 border border-slate-300">Address</th>
                  <th className="py-2 px-3 border border-slate-300 text-right whitespace-nowrap">Bill Amount</th>
                  <th className="py-2 px-3 border border-slate-300 text-right whitespace-nowrap">Collected</th>
                  <th className="py-2 px-3 border border-slate-300 text-right whitespace-nowrap">Amount Received</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 font-medium border border-slate-300">
                      Loading collection records...
                    </td>
                  </tr>
                ) : collections.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 font-medium border border-slate-300">
                      No delivery collection entries recorded for {formatDateDisplay(reportDate)}.
                    </td>
                  </tr>
                ) : (
                  collections.map((item, idx) => {
                    const shopName =
                      item.paymentTransaction?.customer?.shopName ||
                      item.booking?.customer?.shopName ||
                      item.booking?.customer?.name ||
                      "";
                    const address = item.booking?.deliveryAddress || "";
                    const totalAmt = item.booking?.totalAmount || 0;
                    const collectedAmt = item.paymentTransaction?.amount || item.debit || 0;

                    return (
                      <tr key={item._id || idx} className="border-b border-slate-200">
                        <td className="py-2 px-2 border border-slate-300 text-center font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-center font-mono font-bold whitespace-nowrap">
                          {item.booking?.bookingNumber || "--"}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 font-semibold text-slate-900">
                          {shopName || "--"}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-slate-700">
                          {address || "--"}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono font-medium">
                          {formatCurrency(totalAmt)}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(collectedAmt)}
                        </td>
                        <td className="py-2 px-3 border border-slate-300 text-right font-mono font-medium text-slate-300 min-w-[110px]">
                          &nbsp;
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* TABLE SUMMARY / TOTAL ROW */}
              {collections.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900 text-xs">
                    <td colSpan="4" className="py-2.5 px-3 border border-slate-300 text-right font-bold uppercase tracking-wider">
                      Total:
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold">
                      {formatCurrency(totalBillAmount)}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold">
                      {formatCurrency(summary.totalAmountCollected || totalCollected)}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-300 text-right font-mono font-bold">
                      &nbsp;
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* MEMO SUMMARY BLOCK */}
          <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 bg-slate-50 text-xs mb-8">
            <div>
              <span className="font-bold text-slate-600 uppercase text-[11px]">Total Collections / Bills: </span>
              <span className="font-bold text-slate-900 ml-1">
                {summary.totalCollections || collections.length}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-600 uppercase text-[11px]">Total Cash Collected: </span>
              <span className="font-bold text-slate-900 text-sm ml-1 font-mono">
                {formatCurrency(summary.totalAmountCollected || totalCollected)}
              </span>
            </div>
          </div>

          {/* SIGNATURE SECTION AT BOTTOM */}
          <div className="pt-12 mt-8 grid grid-cols-2 gap-12 text-xs">
            <div className="text-center">
              <div className="border-b border-slate-400 pb-1 mb-1 w-3/4 mx-auto"></div>
              <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                Receiver / Counter Cashier Signature
              </span>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 pb-1 mb-1 w-3/4 mx-auto"></div>
              <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                Delivery Boy Signature
              </span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER (HIDDEN IN PRINT) */}
        <div className="px-6 py-3 bg-[#F8FAFC] border-t border-slate-200 flex justify-between items-center no-print">
          <span className="text-xs text-slate-500 font-medium">
            Formatted for A4 paper printout
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={loading || collections.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Print Memo</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
