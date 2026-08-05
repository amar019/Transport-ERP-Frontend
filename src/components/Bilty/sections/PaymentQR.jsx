import React from 'react';
import styles from './PaymentQR.module.css';

/**
 * PaymentQR Component (~46mm width)
 * Displays Top Copy Ribbon (CUSTOMER COPY / OFFICE COPY), SCAN & PAY title,
 * high-fidelity QR image, and UPI ID.
 * 
 * Accepts props: type ("customer" | "office"), qrCode (base64 or URL), upiId (string)
 */

export const PaymentQR = ({
  type = "customer",
  qrCode = "/qr.jpeg",
  upiId = "mahakaltransport@okaxis"
}) => {
  const isOffice = type === "office";
  const ribbonText = isOffice ? "OFFICE COPY" : "CUSTOMER COPY";
  const ribbonClass = isOffice ? styles.copyRibbonOffice : styles.copyRibbon;

  return (
    <div className={styles.paymentQrPanel}>
      {/* Copy Ribbon at top right of container */}
      <div className={ribbonClass}>
        {ribbonText}
      </div>

      {/* QR Card - Slightly down from top with increased height */}
      <div className={styles.qrCard}>
        {/* Title */}
        <div className={styles.titleGroup}>
          <span className={styles.scanPayTitle}>SCAN & PAY</span>
          <span className={styles.upiTitle}>UPI PAYMENT</span>
        </div>

        {/* QR Code Container */}
        <div className={styles.qrContainer}>
          {qrCode ? (
            <img src={qrCode} alt="Payment QR" className={styles.qrImage} />
          ) : (
            /* High-density authentic QR Code matrix SVG */
            <svg viewBox="0 0 100 100" className={styles.qrImage}>
              <rect width="100" height="100" fill="#FFFFFF" />

              {/* Top Left Position Pattern */}
              <rect x="5" y="5" width="28" height="28" fill="#111111" />
              <rect x="9" y="9" width="20" height="20" fill="#FFFFFF" />
              <rect x="13" y="13" width="12" height="12" fill="#111111" />

              {/* Top Right Position Pattern */}
              <rect x="67" y="5" width="28" height="28" fill="#111111" />
              <rect x="71" y="9" width="20" height="20" fill="#FFFFFF" />
              <rect x="75" y="13" width="12" height="12" fill="#111111" />

              {/* Bottom Left Position Pattern */}
              <rect x="5" y="67" width="28" height="28" fill="#111111" />
              <rect x="9" y="71" width="20" height="20" fill="#FFFFFF" />
              <rect x="13" y="75" width="12" height="12" fill="#111111" />

              {/* Data Modules & Alignment Pattern */}
              <rect x="40" y="8" width="6" height="6" fill="#111111" />
              <rect x="52" y="8" width="6" height="6" fill="#111111" />
              <rect x="40" y="20" width="18" height="6" fill="#111111" />

              <rect x="8" y="40" width="6" height="18" fill="#111111" />
              <rect x="20" y="40" width="12" height="6" fill="#111111" />

              <rect x="40" y="40" width="12" height="12" fill="#111111" />
              <rect x="58" y="40" width="12" height="6" fill="#111111" />
              <rect x="75" y="40" width="18" height="6" fill="#111111" />
              <rect x="85" y="50" width="8" height="12" fill="#111111" />

              <rect x="40" y="58" width="6" height="18" fill="#111111" />
              <rect x="52" y="67" width="12" height="6" fill="#111111" />
              <rect x="67" y="58" width="6" height="12" fill="#111111" />
              <rect x="78" y="67" width="14" height="14" fill="#111111" />

              <rect x="40" y="80" width="12" height="12" fill="#111111" />
              <rect x="58" y="82" width="14" height="10" fill="#111111" />
            </svg>
          )}
        </div>

        {/* UPI Details */}
        <div className={styles.upiDetails}>
          <span className={styles.upiLabel}>UPI ID:</span>
          <span className={styles.upiId}>{upiId}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentQR;
