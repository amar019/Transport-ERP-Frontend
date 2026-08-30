import React from 'react';
import { Sparkles, PhoneCall } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * Footer Component (~285mm width, ~5.5mm height)
 * Low-contrast tech credit bar / Advertisement Strip:
 * ✨ AI-POWERED SOFTWARE • Build Custom Software & Websites for your Business | Call/WhatsApp: 7744949305
 */

export const Footer = ({
  contactNumber = "7744949305"
}) => {
  return (
    <footer className={styles.footerStrip}>
      {/* Left: Software Offer Text */}
      <div className={styles.adLeft}>
        <div className={styles.badgeIcon}>
          <Sparkles size={10} strokeWidth={2.4} color="#EA580C" />
        </div>
        <span className={styles.adTag}>AI-POWERED SOFTWARE</span>
        <span className={styles.dotDivider}>•</span>
        <span className={styles.adTextEnglish}>
          Build Custom Software & Websites for your Business
        </span>
      </div>

      {/* Right: Contact Number */}
      <div className={styles.contactRight}>
        <PhoneCall size={10} strokeWidth={2.4} color="#EA580C" />
        <span className={styles.contactLabel}>Call / WhatsApp:</span>
        <span className={styles.contactNumber}>{contactNumber}</span>
      </div>
    </footer>
  );
};

export default Footer;


