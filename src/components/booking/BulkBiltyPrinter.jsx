import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import WireframeBilty from "@/components/Bilty/WireframeBilty";


const BulkBiltyPrinter = forwardRef(({ selectedBookings = [] }, ref) => {
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    content: () => printRef.current,
    documentTitle: selectedBookings.length === 1
      ? `Bilty-${selectedBookings[0]?.bookingNumber || "Print"}`
      : `Bilty-Bulk-${selectedBookings.length}-Items`,
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
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print, .no-print * {
          display: none !important;
        }
        .bulk-print-container {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 210mm !important;
          opacity: 1 !important;
        }
        .bulk-bilty-item {
          width: 210mm !important;
          height: 297mm !important;
          page-break-after: always !important;
          break-after: page !important;
          overflow: hidden !important;
        }
        .bulk-bilty-item:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
      }
    `,
  });

  useImperativeHandle(ref, () => ({
    print: () => {
      if (handlePrint) {
        handlePrint();
      }
    },
  }));

  if (!selectedBookings || selectedBookings.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "-9999px",
        left: "-9999px",
        width: "210mm",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -9999,
      }}
    >
      <div ref={printRef} className="bulk-print-container">
        {selectedBookings.map((booking, index) => {
          const key = booking._id || booking.id || index;
          return (
            <div key={key} className="bulk-bilty-item">
              <WireframeBilty booking={booking} />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default BulkBiltyPrinter;
