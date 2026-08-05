import React from 'react';
import { IndianRupee } from 'lucide-react';
import styles from './ChargesTable.module.css';

/**
 * ChargesTable Component (~114mm width)
 * Displays Charges Breakdown Section dynamically:
 * 1. Section Header: IndianRupee Icon + भाडे तपशील (CHARGES)
 * 2. Charges List: Crossing, Freight, Hamali, Bilty Charge, Other Charges
 * 3. Total Amount Box: एकूण रक्कम (TOTAL AMOUNT)
 */

export const ChargesTable = ({
  charges = [],
  totalAmount = 0,
  currency = "₹"
}) => {
  const formatVal = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  return (
    <div className={styles.chargesCard}>
      {/* Section Header */}
      <div className={styles.titleRow}>
        <div className={styles.rupeeCircleIcon}>
          <IndianRupee size={10} strokeWidth={2.5} color="#FFFFFF" />
        </div>
        <span className={styles.titleMarathi}>भाडे तपशील</span>
        <span className={styles.titleEnglish}>(CHARGES)</span>
      </div>

      {/* Charges List */}
      <div className={styles.chargesList}>
        {charges.map((item, idx) => (
          <div key={idx} className={styles.chargeRow}>
            <div className={styles.chargeLeft}>
              <span className={styles.chargeLabel}>
                {item.label || `${idx + 1}. Charge`}
              </span>
            </div>
            
            <div className={styles.chargeDots} />

            <div className={styles.chargeRight}>
              <span className={styles.currencySymbol}>{currency}</span>
              <span className={styles.amount}>{formatVal(item.amount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount Box */}
      <div className={styles.totalBox}>
        <span className={styles.totalLabel}>
          एकूण रक्कम (TOTAL AMOUNT)
        </span>

        <div className={styles.totalRight}>
          <span className={styles.totalCurrency}>{currency}</span>
          <span className={styles.totalAmount}>{formatVal(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default ChargesTable;
