import React from 'react';
import styles from './SenderSection.module.css';

/**
 * SenderSection Component (~104mm width)
 * Corporate ERP Consignor Card:
 * - Clear hierarchy: CONSIGNOR heading
 * - Name (High visual importance bold dark navy text)
 * - Mobile (Aligned label & value)
 * - Address (Aligned label & value)
 */

export const SenderSection = ({ sender = {} }) => {
  const {
    name = "",
    mobile = "",
    address = ""
  } = sender;

  return (
    <div className={styles.senderCard}>
      {/* Section Title */}
      <div className={styles.titleRow}>
        <span className={styles.titleEnglish}>CONSIGNOR</span>
      </div>

      {/* Details List */}
      <div className={styles.detailsList}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Name</span>
          <span className={styles.colon}>:</span>
          <span className={styles.nameValue}>{name || "-"}</span>
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
