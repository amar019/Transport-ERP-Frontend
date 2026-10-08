import React from 'react';
import styles from './MemoPrintDocument.module.css';

/**
 * MemoPrintDocument Component
 * Renders Mahakal Transport Dispatch Manifest in A4 Landscape (297mm x 210mm).
 * Exactly matches the reference ERP print layout.
 */

export const MemoPrintDocument = ({ memo = {}, company = {} }) => {
  const {
    name = "Mahakal Transport",
    logo = "/LOGO.jpg",
    phones = "A. Nagar: 9766148289  |  Jamkhed: 9370445558",
  } = company;

  const rawBookings = Array.isArray(memo.bookings) ? memo.bookings : [];

  // Sort bookings in ASCENDING order by bookingNumber / bookingDate
  const bookingsList = [...rawBookings].sort((a, b) => {
    if (!a || !b) return 0;
    const numA = a.bookingNumber || "";
    const numB = b.bookingNumber || "";
    if (numA && numB) {
      const cmp = numA.localeCompare(numB, undefined, { numeric: true, sensitivity: "base" });
      if (cmp !== 0) return cmp;
    }
    const dateA = new Date(a.bookingDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.bookingDate || b.createdAt || 0).getTime();
    return dateA - dateB;
  });

  // Format currency
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  // Extract server-provided aggregates from API, fallback to client computation if needed
  let totalQuantity = memo.totalQuantity ?? memo.totalPackages ?? 0;
  let totalFreight = memo.totalFreight ?? 0;
  let totalToPay = memo.totalToPay ?? 0;
  let totalPaidAtBooking = memo.totalPaid ?? 0;
  let grandTotal = memo.grandTotal ?? memo.totalMoney ?? 0;

  // Fallback calculation from bookings list if API fields are not populated
  if (grandTotal === 0 && bookingsList.length > 0) {
    totalQuantity = 0;
    totalFreight = 0;
    totalToPay = 0;
    totalPaidAtBooking = 0;
    grandTotal = 0;

    bookingsList.forEach((b) => {
      if (!b || typeof b !== 'object') return;
      const qty = Number(b.quantity || 1);
      const frt = Number(b.freight || 0);
      const amount = Number(b.totalAmount || 0);

      if (b.collectionType === "PAID_AT_BOOKING") {
        totalPaidAtBooking += amount;
        grandTotal += amount;
        totalQuantity += qty;
        totalFreight += frt;
      } else if (b.collectionType === "TO_PAY") {
        totalToPay += amount;
        grandTotal += amount;
        totalQuantity += qty;
        totalFreight += frt;
      }
    });
  }

  const displayTotalBilties = memo.bookingsCount ?? memo.totalBookings ?? bookingsList.length;

  // DYNAMIC PAGINATION CHUNKING FOR A4 LANDSCAPE: Strictly 30 booking rows per page
  const ITEMS_PER_PAGE = 30;
  const pageChunks = [];

  if (bookingsList.length > 0) {
    for (let i = 0; i < bookingsList.length; i += ITEMS_PER_PAGE) {
      pageChunks.push(bookingsList.slice(i, i + ITEMS_PER_PAGE));
    }
  } else {
    pageChunks.push([]);
  }

  const totalPages = pageChunks.length;

  return (
    <div className={styles.printWrapper}>
      {pageChunks.map((chunk, pageIndex) => {
        const isFirstPage = pageIndex === 0;
        const isLastPage = pageIndex === totalPages - 1;
        const pageNumber = pageIndex + 1;

        // Calculate global starting Sr No for current page chunk
        const previousRowsCount = pageChunks
          .slice(0, pageIndex)
          .reduce((sum, c) => sum + c.length, 0);

        return (
          <div
            key={pageIndex}
            className={`${styles.page} ${!isLastPage ? styles.pageBreak : ''}`}
          >
            {/* 1. FIRST PAGE ONLY: MAIN HEADER & METADATA SECTION */}
            {isFirstPage ? (
              <div className={styles.headerWrapper}>
                <div className={styles.headerContent}>
                  {/* Brand Info (Left) */}
                  <div className={styles.brandSection}>
                    {logo ? (
                      <img src={logo} alt="MTS Logo" className={styles.logoImg} />
                    ) : null}
                    <div className={styles.brandInfo}>
                      <div className={styles.titleRow}>
                        <span className={styles.companyTitle}>{name}</span>
                      </div>
                      <span className={styles.phoneStrip}>{phones}</span>
                    </div>
                  </div>

                  {/* Metadata (Right) - Unboxed Executive Header */}
                  <div className={styles.headerMetaBox}>
                    <div className={styles.metaRowPrimary}>
                      <div className={styles.metaItemBig}>
                        <span className={styles.metaLabelBig}>Memo No:</span>
                        <span className={styles.memoNoValue}>{memo.memoNumber || "MEM-0000"}</span>
                      </div>
                      <div className={styles.metaItemBig}>
                        <span className={styles.metaLabelBig}>Date:</span>
                        <span className={styles.dateValue}>{formatDate(memo.memoDate || memo.date || memo.createdAt)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Page:</span>
                        <span className={styles.pageBadge}>{pageNumber} of {totalPages}</span>
                      </div>
                    </div>

                    <div className={styles.metaRowSecondary}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Payment Status:</span>
                        <span className={styles.statusValue}>{memo.collectionStatus || "PENDING"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SUBSEQUENT PAGES (PAGE 2+): COMPACT CONTINUATION HEADER BAR ONLY */
              <div className={styles.subsequentHeaderBar}>
                <div className={styles.subHeaderLeft}>
                  <span className={styles.subHeaderBrand}>{name}</span>
                  <span className={styles.subHeaderDivider}>|</span>
                  <span className={styles.subHeaderTitle}>MANIFEST (CONTINUATION)</span>
                  <span className={styles.subHeaderDivider}>|</span>
                  <span className={styles.subHeaderMemoNo}>Memo No: <strong>{memo.memoNumber || "MEM-0000"}</strong></span>
                </div>
                <div className={styles.subHeaderRight}>
                  <span className={styles.subHeaderRoute}>
                    {memo.fromBranch?.name || "Origin"} <span className={styles.routeArrow}>→</span> {memo.toBranch?.name || "Destination"}
                  </span>
                  <span className={styles.subHeaderPageBadge}>Page {pageNumber} of {totalPages}</span>
                </div>
              </div>
            )}

            {/* 2. CONSIGNMENTS TABLE */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '4.5%', paddingLeft: '2mm' }}>
                      Sr.No.<br /><span className={styles.subTh}>(क्र.)</span>
                    </th>
                    <th style={{ width: '9.5%' }}>
                      Bilty No.<br /><span className={styles.subTh}>(बील्टी नं.)</span>
                    </th>
                    <th className={styles.alignLeft} style={{ width: '17.5%' }}>
                      Consignee Name<br /><span className={styles.subTh}>(Consignee Name)</span>
                    </th>
                    <th className={styles.alignLeft} style={{ width: '13.5%' }}>
                      From / To<br /><span className={styles.subTh}>(Delivery Address)</span>
                    </th>
                    <th style={{ width: '9.5%' }}>
                      Mobile<br /><span className={styles.subTh}>(Contact)</span>
                    </th>
                    <th className={styles.alignLeft} style={{ width: '18.5%' }}>
                      Goods<br /><span className={styles.subTh}>(Description)</span>
                    </th>
                    <th style={{ width: '4.5%' }}>
                      Qty.<br /><span className={styles.subTh}>(Qty.)</span>
                    </th>
                    <th className={styles.alignRight} style={{ width: '7.0%' }}>
                      Freight<br /><span className={styles.subTh}>(Freight)</span>
                    </th>
                    <th className={styles.alignRight} style={{ width: '7.5%' }}>
                      Total<br /><span className={styles.subTh}>(Total)</span>
                    </th>
                    <th style={{ width: '8.0%', paddingRight: '2mm' }}>
                      Status<br /><span className={styles.subTh}>(Status)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.length > 0 ? (
                    chunk.map((b, idx) => {
                      if (!b || typeof b !== 'object') return null;
                      const globalSrNo = previousRowsCount + idx + 1;
                      const customer = typeof b.customer === 'object' && b.customer !== null ? b.customer : {};
                      const receiver = typeof b.receiver === 'object' && b.receiver !== null ? b.receiver : {};

                      const shopName =
                        customer.shopName ||
                        receiver.shopName ||
                        (typeof b.customer === 'string' ? b.customer : (receiver.ownerName || b.sender?.name || "-"));
                      const ownerName = customer.ownerName || receiver.ownerName || "";
                      const mobile = customer.mobile || receiver.mobile || b.sender?.mobile || "-";

                      const address =
                        b.deliveryAddress ||
                        customer.deliveryAddress ||
                        customer.address ||
                        [customer.area, customer.city].filter(Boolean).join(", ") ||
                        "-";

                      const isToPay = b.collectionType === "TO_PAY";

                      return (
                        <tr key={b._id || b.id || idx}>
                          <td className={styles.alignCenter}>{globalSrNo}</td>
                          <td className={`${styles.alignCenter} ${styles.biltyNo}`}>
                            {b.bookingNumber || "-"}
                          </td>
                          <td className={styles.alignLeft}>
                            <span className={styles.shopName}>{shopName}</span>
                            {ownerName ? <span className={styles.subText}>({ownerName})</span> : null}
                          </td>
                          <td className={styles.alignLeft}>
                            <span title={address}>{address}</span>
                          </td>
                          <td className={styles.alignCenter}>{mobile}</td>
                          <td className={styles.alignLeft}>{b.itemName || "-"}</td>
                          <td className={styles.alignCenter}>{b.quantity ?? 1}</td>
                          <td className={styles.alignRight}>{formatCurrency(b.freight || 0)}</td>
                          <td className={styles.alignRight}>{formatCurrency(b.totalAmount || 0)}</td>
                          <td className={styles.alignCenter}>
                            <span className={isToPay ? styles.toPayBadge : styles.paidBadge}>
                              {isToPay ? "TO PAY" : "PAID"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className={styles.alignCenter} style={{ padding: '8mm' }}>
                        No bookings attached to this memo.
                      </td>
                    </tr>
                  )}

                  {/* SUMMARY TOTALS ROW — RENDERED ONLY ON FINAL PAGE */}
                  {isLastPage && (
                    <tr className={styles.summaryRow}>
                      <td colSpan="6" className={styles.alignRight}>
                        TOTAL SUMMARY :
                      </td>
                      <td className={styles.alignCenter}>{totalQuantity}</td>
                      <td className={styles.alignRight}>{formatCurrency(totalFreight)}</td>
                      <td className={`${styles.alignRight} ${styles.totalHighlight}`}>
                        {formatCurrency(grandTotal)}
                      </td>
                      <td className={styles.alignCenter}>
                        {displayTotalBilties} Bilties
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 3. FOOTER WRAPPER — RENDERED ONLY ON FINAL PAGE */}
            {isLastPage && (
              <div className={styles.footerContainer}>
                {/* FINANCIAL SUMMARY BOX (FULL WIDTH & PROMINENT 5-CARD BREAKDOWN) */}
                <div className={styles.bottomSection}>
                  <div className={styles.financialSummary}>
                    <div className={styles.finGrid}>
                      <div className={styles.finBox}>
                        <span className={styles.finLabel}>एकूण बिल्टी (Total Bilties)</span>
                        <span className={styles.finValue}>{displayTotalBilties}</span>
                      </div>
                      <div className={styles.finBox}>
                        <span className={styles.finLabel}>एकूण नग (Total Cartons)</span>
                        <span className={styles.finValue}>{totalQuantity}</span>
                      </div>
                      <div className={styles.finBox}>
                        <span className={styles.finLabel}>एकूण पेड (Total Paid)</span>
                        <span className={styles.finValue}>{formatCurrency(totalPaidAtBooking)}</span>
                      </div>
                      <div className={styles.finBox}>
                        <span className={styles.finLabel}>TO PAY (Total Unpaid)</span>
                        <span className={styles.finValue}>{formatCurrency(totalToPay)}</span>
                      </div>
                      <div className={`${styles.finBox} ${styles.finBoxGrand}`}>
                        <span className={styles.finLabel}>एकूण मेमो रक्कम (Grand Total)</span>
                        <span className={`${styles.finValue} ${styles.finValueGrand}`}>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIGNATURES FOOTER */}


                <div className={styles.disclaimerText}>
                  Computer Generated Transport Memo.
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemoPrintDocument;
