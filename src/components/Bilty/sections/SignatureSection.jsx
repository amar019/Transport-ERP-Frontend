import React from 'react';
import styles from './SignatureSection.module.css';

/**
 * SignatureSection Component (~11mm height)
 * Clean, spacious & un-crowded 2-column signature strip:
 * 1. Left: Receiver Signature & Stamp (घेणाऱ्याची सही व शिक्का)
 * 2. Right: Authorized Signatory for MAHAKAL TRANSPORT (अधिकृत स्वाक्षरी)
 */

export const SignatureSection = ({
  companyName = "MAHAKAL TRANSPORT",
  receiverSigMarathi = "घेणाऱ्याची सही व शिक्का",
  receiverSigEnglish = "(Receiver Signature & Stamp)",
  authorizedSigMarathi = "अधिकृत स्वाक्षरी",
  authorizedSigEnglish = "(Authorized Signatory)"
}) => {
  return (
    <div className={styles.signatureWrapper}>
      {/* 1. Receiver Signature (Left) */}
      <div className={styles.sigCol}>
        <div className={styles.textGroup}>
          <span className={styles.primaryText}>{receiverSigMarathi}</span>
          <span className={styles.subText}>{receiverSigEnglish}</span>
        </div>
        <div className={styles.lineArea}>
          <div className={styles.sigLine} />
        </div>
      </div>

      {/* Subtle Vertical Divider */}
      <div className={styles.divider} />

      {/* 2. Authorized Signatory (Right) */}
      <div className={styles.sigCol}>
        <div className={styles.textGroupRight}>
          <span className={styles.companyHeader}>For {companyName}</span>
          <span className={styles.subText}>
            {authorizedSigMarathi} {authorizedSigEnglish}
          </span>
        </div>
        <div className={styles.lineArea}>
          <div className={styles.sigLine} />
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;


