import React from 'react';
import styles from './GoodsTable.module.css';

/**
 * Single Unified GoodsTable Component (Row 3)
 * Renders a single unified table containing Goods Details on the left
 * and Charges Breakdown in two dedicated columns (Charge Name + Price) on the right.
 */

export const GoodsTable = ({
  goodsItems = [],
  charges = {},
  notes = "",
  disclaimer = "Any complaint regarding the goods must be reported within 7 days of receipt. Complaints received after this period may not be accepted.",
  booking = {}
}) => {
  // Format numeric values to 2 decimal places
  const formatVal = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Display rubber stamp strictly when customer paid upfront at booking
  const isPaidAtBooking =
    (booking.collectionType || "").toUpperCase().replace(/[\s-]+/g, '_') === "PAID_AT_BOOKING";

  const chargesRows = [
    { label: "1. CROSSING", amount: charges.crossing ?? 0 },
    { label: "2. FREIGHT", amount: charges.freight ?? 0 },
    { label: "3. HANDLING CHARGES", amount: charges.hamali ?? 0 },
    { label: "4. PLATFORM CHARGES", amount: charges.biltyCharge ?? 0 },
    { label: "5. OTHER CHARGES", amount: charges.otherCharges ?? 0 }
  ];

  const total = charges.totalAmount ?? 0;
  const displayDisclaimer = notes ? `${disclaimer} (${notes})` : disclaimer;

  // Extract Invoice No. and Remark from booking or notes props
  const invoiceNo =
    booking.invoiceNo ||
    booking.invoiceNumber ||
    booking.invNo ||
    booking.billNo ||
    "-";

  const remark =
    booking.remark ||
    booking.remarks ||
    booking.notes ||
    notes ||
    "-";

  // Combine goods items and charges rows into unified table rows (at least 5 rows)
  const baseCount = Math.max(goodsItems ? goodsItems.length : 0, chargesRows.length);
  const rowCount = baseCount > 5 ? baseCount + 1 : 5;

  const combinedRows = Array.from({ length: rowCount }, (_, idx) => {
    const item = goodsItems && goodsItems[idx];
    const charge = chargesRows[idx];
    return {
      srNo: item ? (item.srNo || idx + 1) : (idx === 0 ? 1 : null),
      description: item ? (item.description || "-") : null,
      quantity: item ? (item.quantity ?? "-") : null,
      chargeLabel: charge ? charge.label : null,
      chargeAmount: charge ? formatVal(charge.amount) : null
    };
  });

  return (
    <div className={styles.goodsChargesContainer}>
      {/* Authentic Dotted Stamp for PAID Status */}
      {isPaidAtBooking && (
        <div className={styles.paidStamp}>
          <div className={styles.paidStampInner}>
            <span className={styles.stampHeader}>MAHAKAL TRANSPORT</span>
            <span className={styles.stampTitle}>PAID</span>
            <span className={styles.stampSub}>PAID AT BOOKING</span>
          </div>
        </div>
      )}

      {/* SINGLE UNIFIED GOODS & CHARGES TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '6%' }}>NO.</th>
              <th className={styles.alignLeft} style={{ width: '40%' }}>
                DESCRIPTION OF GOODS
              </th>
              <th style={{ width: '10%' }}>QTY</th>
              <th className={styles.alignLeft} style={{ width: '28%' }}>
                CHARGES
              </th>
              <th className={styles.alignRight} style={{ width: '16%' }}>
                AMOUNT (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {combinedRows.map((row, idx) => {
              const isLastRow = idx === combinedRows.length - 1;

              return (
                <tr key={idx}>
                  {isLastRow ? (
                    <td colSpan={3} className={styles.metaRowCell}>
                      <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>INVOICE NO :</span>
                          <span className={styles.metaValue}>{invoiceNo}</span>
                        </div>
                        <div className={styles.metaDivider} />
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>REMARK :</span>
                          <span className={styles.metaValue}>{remark}</span>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td>{row.srNo ?? ""}</td>
                      <td className={styles.alignLeft}>{row.description ?? ""}</td>
                      <td>{row.quantity ?? ""}</td>
                    </>
                  )}
                  <td className={`${styles.alignLeft} ${styles.chargeCell}`}>
                    {row.chargeLabel ?? ""}
                  </td>
                  <td className={`${styles.alignRight} ${styles.amountCell}`}>
                    {row.chargeAmount !== null ? `₹ ${row.chargeAmount}` : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* BOTTOM BAR: DISCLAIMER NOTE ON LEFT, TOTAL AMOUNT ON RIGHT */}
      <div className={styles.bottomBar}>
        <div className={styles.disclaimerBox}>
          <span className={styles.disclaimerTitle}>NOTE :</span>
          <span className={styles.disclaimerText}>{displayDisclaimer}</span>
        </div>

        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>TOTAL AMOUNT</span>
          <div className={styles.totalRight}>
            <span className={styles.totalCurrency}>₹</span>
            <span className={styles.totalAmount}>{formatVal(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsTable;
