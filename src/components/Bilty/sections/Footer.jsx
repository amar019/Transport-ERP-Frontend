import React from 'react';
import { Sparkles, Globe, PhoneCall } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * Footer Component (~285mm width, ~5.5mm height)
 * - Starting Corner (Left): Build AI-Powered Softwares for your Business
 * - Middle: Service Areas
 * - End Corner (Right): 7744949305
 */

export const Footer = ({
  contactNumber = "7744949305",
  serviceAreas = "Ahilyanagar • Beed • Jamkhed • Kada • Ashti • Bhum • Patoda • Kharda"
}) => {
  const formattedServiceAreas = typeof serviceAreas === 'string' ? serviceAreas.trim() : serviceAreas;

  return (
    <footer className={styles.footerStrip}>
      {/* 1. STARTING CORNER (LEFT AD TEXT) */}
      <div className={styles.adLeft}>
        <Sparkles size={9} strokeWidth={2.2} color="#EA580C" className={styles.sparkleIcon} />
        <span className={styles.adText}>Build AI-Powered Softwares for your Business</span>
      </div>

      {/* 2. MIDDLE SECTION (SERVICE AREAS) */}
      <div className={styles.serviceMiddle}>
        <Globe size={10} strokeWidth={2.4} className={styles.globeIcon} />
        <span className={styles.serviceTitle}>Service Areas :</span>
        <span className={styles.serviceLocations}>{formattedServiceAreas}</span>
      </div>

      {/* 3. END CORNER (RIGHT CONTACT NUMBER) */}
      <div className={styles.contactRight}>
        <PhoneCall size={9} strokeWidth={2.2} color="#EA580C" />
        <span className={styles.contactNumber}>{contactNumber}</span>
      </div>
    </footer>
  );
};

export default Footer;
