import React from 'react';
import { Navigation, ArrowRight } from 'lucide-react';
import styles from './RouteSection.module.css';

/**
 * RouteSection Component (~38mm width, 20mm height)
 * Displays FROM city and TO city dynamically with transport route styling.
 */

export const RouteSection = ({
  fromCity = "-",
  toCity = "-"
}) => {
  return (
    <div className={styles.routeCard}>
      {/* Header Badge */}
      <div className={styles.titleRow}>
        <Navigation size={10} strokeWidth={2.4} color="#EB5A00" className={styles.titleIcon} />
        <span className={styles.titleMarathi}>मार्ग</span>
        <span className={styles.titleEnglish}>(ROUTE)</span>
      </div>

      {/* Route Details: FROM -> TO */}
      <div className={styles.routeDetails}>
        {/* FROM */}
        <div className={styles.routeBlock}>
          <span className={styles.routeLabel}>FROM</span>
          <span className={styles.routeCity} title={fromCity}>{fromCity || "-"}</span>
        </div>

        {/* Connector Arrow */}
        <div className={styles.arrowContainer}>
          <ArrowRight size={11} strokeWidth={2.5} color="#EB5A00" />
        </div>

        {/* TO */}
        <div className={styles.routeBlock}>
          <span className={styles.routeLabel}>TO</span>
          <span className={styles.routeCityHighlight} title={toCity}>{toCity || "-"}</span>
        </div>
      </div>
    </div>
  );
};

export default RouteSection;
