import React from 'react';
import { Package, IndianRupee, Globe } from 'lucide-react';
import styles from './GoodsTable.module.css';

/**
 * Unified GoodsTable Component (Full Width Row 3)
 * Traditional Mahakal Transport bilty layout:
 * - Left Side (100mm): Goods Details Table (Sr | Description | Qty) + Disclaimer Note
 * - Right Side (80mm): Charges Breakdown List + Highlighted Total Amount Box + Service Areas Strip
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
    { label: "1.CROSSING", amount: charges.crossing ?? 0 },
    { label: "2.FREIGHT", amount: charges.freight ?? 0 },
    { label: "3.HAMALI", amount: charges.hamali ?? 0 },
    { label: "4.PLATFORM CHARGES", amount: charges.biltyCharge ?? 0 },
    { label: "5.OTHER CHARGES", amount: charges.otherCharges ?? 0 }
  ];

  const total = charges.totalAmount ?? 0;

  const displayDisclaimer = notes ? `${disclaimer} (${notes})` : disclaimer;

  return (
    <div className={styles.goodsChargesContainer}>
      {/* LEFT SIDE: Goods Details (100mm Compact) */}
      <div className={styles.goodsSection}>
        {/* Goods Header */}
        <div className={styles.titleRow}>
          <Package size={15} strokeWidth={2.2} color="#D90429" className={styles.titleIcon} />
          {/* <span className={styles.titleMarathi}>मालाचे तपशील</span> */}
          <span className={styles.titleEnglish}>GOODS DETAILS</span>
        </div>

        {/* HTML Goods Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>NO.</th>
                <th className={styles.alignLeft} style={{ width: '70%' }}>
                  DESCRIPTION
                </th>
                <th style={{ width: '20%' }}>QTY</th>
              </tr>
            </thead>
            <tbody>
              {goodsItems && goodsItems.length > 0 ? (
                goodsItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.srNo || idx + 1}</td>
                    <td className={styles.alignLeft}>{item.description || "-"}</td>
                    <td>{item.quantity ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>1</td>
                  <td className={styles.alignLeft}>-</td>
                  <td>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Disclaimer Note */}
        <div className={styles.disclaimerBox}>
          <span className={styles.disclaimerTitle}>NOTE :</span>
          <span className={styles.disclaimerText}>{displayDisclaimer}</span>
        </div>
      </div>

      {/* RIGHT SIDE: Charges Breakdown (80mm Compact) */}
      <div className={styles.chargesSection}>
        {/* Circular Green Paid Stamp (Only when paid upfront at booking) */}
        {isPaidAtBooking && (
          <div className={styles.paidStamp}>
            <div className={styles.paidStampInner}>
              <span className={styles.stampHeader}>MAHAKAL TRANSPORT</span>
              <span className={styles.stampTitle}>PAID</span>
              <span className={styles.stampSub}>PAID AT BOOKING</span>
            </div>
          </div>
        )}
        {/* Charges Header */}
        <div className={styles.chargesTitleRow}>
          <div className={styles.rupeeCircleIcon}>
            <IndianRupee size={10} strokeWidth={2.5} color="#FFFFFF" />
          </div>
          <span className={styles.titleMarathi}></span>
          <span className={styles.titleEnglish}>CHARGES</span>
        </div>

        {/* Charges List */}
        <div className={styles.chargesList}>
          {chargesRows.map((item, idx) => (
            <div key={idx} className={styles.chargeRow}>
              <div className={styles.chargeLeft}>
                <span className={styles.chargeLabel}>{item.label}</span>
              </div>

              <div className={styles.chargeDots} />

              <div className={styles.chargeRight}>
                <span className={styles.currencySymbol}>₹</span>
                <span className={styles.amount}>{formatVal(item.amount)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL AMOUNT BOX AT BOTTOM OF CHARGES */}
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>
            TOTAL AMOUNT
          </span>

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
