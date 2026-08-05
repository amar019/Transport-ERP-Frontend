import React from 'react';
import { PenTool } from 'lucide-react';
import styles from './SignatureSection.module.css';

/**
 * SignatureSection Component (~11mm height)
 * Displays 2 compact signature cards shifted to the far left & right corners:
 * 1. Receiver Signature (घेणाऱ्याची सही) - Far Left Corner
 * 2. Authorized Signatory (महाकाल ट्रान्सपोर्ट) - Far Right Corner
 */

export const SignatureSection = ({
  receiverSigMarathi = "घेणाऱ्याची सही",
  receiverSigEnglish = "(Receiver Signature & Stamp)"
}) => {
  return (
    <div className={styles.signatureWrapper}>
      {/* Receiver Signature (Single Box) */}
      <div className={styles.sigBox}>
        <PenTool size={14} strokeWidth={2.2} color="#222222" className={styles.sigIcon} />
        <div className={styles.textGroup}>
          <div className={styles.marathiText}>{receiverSigMarathi}</div>
          <div className={styles.englishText}>{receiverSigEnglish}</div>
        </div>
      </div>
    </div>
  );
};

export default SignatureSection;
