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
  disclaimer = "सदरहू कुठल्याही मालाची तक्रार ७ दिवसाच्या आत करावी. काचेचे सामान तुट-फुटला ट्रान्सपोर्ट जबाबदार राहणार नाही."
}) => {
  // Format numeric values to 2 decimal places
  const formatVal = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  const chargesRows = [
    { label: "१. क्रॉसिंग (CROSSING)", amount: charges.crossing ?? 0 },
    { label: "२. भाडे (FREIGHT)", amount: charges.freight ?? 0 },
    { label: "३. हमाली (HAMALI)", amount: charges.hamali ?? 0 },
    { label: "४. बिल्टी चार्ज (BILTY CHARGE)", amount: charges.biltyCharge ?? 0 },
    { label: "५. इतर (OTHER CHARGES)", amount: charges.otherCharges ?? 0 }
  ];

  const total = charges.totalAmount ?? 0;

  const displayDisclaimer = notes ? `${disclaimer} (${notes})` : disclaimer;

  return (
    <div className={styles.goodsChargesContainer}>
      {/* LEFT SIDE: Goods Details (100mm Compact) */}
      <div className={styles.goodsSection}>
        {/* Goods Header */}
        <div className={styles.titleRow}>
          <Package size={15} strokeWidth={2.2} color="#EB5A00" className={styles.titleIcon} />
          <span className={styles.titleMarathi}>मालाचे तपशील</span>
          <span className={styles.titleEnglish}>(GOODS DETAILS)</span>
        </div>

        {/* HTML Goods Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>अ.नं.</th>
                <th className={styles.alignLeft} style={{ width: '70%' }}>
                  मालाचे नाव (DESCRIPTION)
                </th>
                <th style={{ width: '20%' }}>नग (QTY)</th>
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
          <span className={styles.disclaimerTitle}>टीप :</span>
          <span className={styles.disclaimerText}>{displayDisclaimer}</span>
        </div>
      </div>

      {/* RIGHT SIDE: Charges Breakdown (80mm Compact) */}
      <div className={styles.chargesSection}>
        {/* Charges Header */}
        <div className={styles.chargesTitleRow}>
          <div className={styles.rupeeCircleIcon}>
            <IndianRupee size={10} strokeWidth={2.5} color="#FFFFFF" />
          </div>
          <span className={styles.titleMarathi}>भाडे तपशील</span>
          <span className={styles.titleEnglish}>(CHARGES)</span>
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
            एकूण रक्कम (TOTAL AMOUNT)
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
