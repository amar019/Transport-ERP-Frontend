import React from 'react';
import styles from './PaymentMode.module.css';

/**
 * PaymentMode Component (~48mm width)
 * Displays PAYMENT MODE card with CASH, UPI, CREDIT checkboxes dynamically.
 */

export const PaymentMode = ({ paymentMode = "" }) => {
  const modes = [
    { id: "CASH", label: "CASH" },
    { id: "UPI", label: "UPI" },
    { id: "CREDIT", label: "CREDIT" }
  ];

  return (
    <div className={styles.paymentModeCard}>
      <div className={styles.title}>PAYMENT MODE</div>
      
      <div className={styles.optionsList}>
        {modes.map((mode) => {
          const isChecked = (paymentMode || "").toUpperCase() === mode.id;
          return (
            <div key={mode.id} className={styles.optionItem}>
              <span className={isChecked ? styles.checkedBox : styles.checkbox}>
                {isChecked ? "✓" : ""}
              </span>
              <span>{mode.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMode;
