import React from 'react';
import { Globe } from 'lucide-react';
import styles from './Footer.module.css';

/**
 * Footer Component (~285mm width, ~5mm height)
 * Displays bottom service coverage towns & website URL with Lucide Globe icon:
 * - Left: आमच्या सेवा क्षेत्र : [serviceAreas]
 * - Right: Globe Icon + [website]
 * 
 * Accepts props: serviceAreas (string), website (string)
 */

export const Footer = ({
  serviceAreas = "अ.नगर • बीड • जामखेड • कडा • आष्टी • भूम • पाटोदा • खर्डा • इ.",
  website = "www.mahakaltransport.in"
}) => {
  return (
    <footer className={styles.footerStrip}>
      {/* Left: Service Coverage Towns */}
      <div className={styles.serviceLeft}>
        <span className={styles.serviceTitle}>आमच्या सेवा क्षेत्र :</span>
        <span className={styles.serviceLocations}>{serviceAreas}</span>
      </div>

      {/* Right: Website URL */}
      <div className={styles.websiteRight}>
        <Globe size={12} strokeWidth={2.2} color="#222222" className={styles.globeIcon} />
        <span className={styles.websiteUrl}>{website}</span>
      </div>
    </footer>
  );
};

export default Footer;
