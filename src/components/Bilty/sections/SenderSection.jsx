import React from 'react';
import { User } from 'lucide-react';
import styles from './SenderSection.module.css';

/**
 * SenderSection Component (~90mm width)
 * Displays Consignor (Sender) details card dynamically:
 * - Lucide User vector icon & Marathi title "पाठविणार (SENDER)"
 * - नाव (Name), मोबाईल (Mobile), पत्ता (Address) rows
 */

export const SenderSection = ({ sender = {} }) => {
  const {
    name = "",
    mobile = "",
    address = ""
  } = sender;

  return (
    <div className={styles.senderCard}>
      {/* Title */}
      <div className={styles.titleRow}>
        <User size={14} strokeWidth={2.2} color="#EB5A00" className={styles.titleIcon} />
        {/* <span className={styles.titleMarathi}>पाठविणार</span> */}
        <span className={styles.titleEnglish}>SENDER</span>
      </div>

      {/* Details */}
      <div className={styles.detailsList}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Name</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{name || "-"}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Mobile</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{mobile || "-"}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Address</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{address || "-"}</span>
        </div>
      </div>
    </div>
  );
};

export default SenderSection;
