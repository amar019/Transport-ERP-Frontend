import React from 'react';
import { User } from 'lucide-react';
import styles from './ReceiverSection.module.css';

/**
 * ReceiverSection Component (~75mm width)
 * Displays Consignee (Receiver) details card dynamically:
 * - Lucide User vector icon & Marathi title "घेणारा (RECEIVER)"
 * - shopName, ownerName, mobile, deliveryAddress
 */

export const ReceiverSection = ({ customer = {}, deliveryAddress = "", receiver = {} }) => {
  const shopName = customer?.shopName || receiver?.shopName || receiver?.name || "-";
  const ownerName = customer?.ownerName || receiver?.ownerName || "";
  const mobile = customer?.mobile || receiver?.mobile || "-";
  const address = deliveryAddress || receiver?.address || "-";

  return (
    <div className={styles.receiverCard}>
      {/* Title */}
      <div className={styles.titleRow}>
        <User size={14} strokeWidth={2.2} color="#EB5A00" className={styles.titleIcon} />
        <span className={styles.titleMarathi}>घेणारा</span>
        <span className={styles.titleEnglish}>(RECEIVER)</span>
      </div>

      {/* Details */}
      <div className={styles.detailsList}>
        <div className={styles.detailRow}>
          <span className={styles.label}>नाव</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{shopName}</span>
        </div>

        {ownerName ? (
          <div className={styles.detailRow}>
            <span className={styles.label}>मालक</span>
            <span className={styles.colon}>:</span>
            <span className={styles.value}>{ownerName}</span>
          </div>
        ) : null}

        <div className={styles.detailRow}>
          <span className={styles.label}>मोबाईल</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{mobile}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>पत्ता</span>
          <span className={styles.colon}>:</span>
          <span className={styles.value}>{address}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiverSection;
