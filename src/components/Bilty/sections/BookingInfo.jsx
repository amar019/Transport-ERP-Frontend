import React from 'react';
import styles from './BookingInfo.module.css';

/**
 * BookingInfo Component (~46mm width, 27mm height)
 * Displays Bilty Number, Date, and Collection Payment Status (Paid at Booking / To Pay).
 * Formatted for Black & White printing without colored backgrounds.
 */

export const BookingInfo = ({ booking = {} }) => {
  const {
    bookingNumber = "",
    bookingDate = "",
    collectionType = "",
    paymentStatus = ""
  } = booking;

  // Format bookingDate dynamically
  const formattedDate = bookingDate
    ? (typeof bookingDate === 'string' && bookingDate.includes('T')
        ? new Date(bookingDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
        : bookingDate)
    : "-";

  // Operational payment collection status (PAID AT BOOKING vs TO PAY)
  const getPaymentStatusText = () => {
    const col = (collectionType || "").toUpperCase().replace(/[\s-]+/g, '_');
    const stat = (paymentStatus || "").toUpperCase();

    if (col === "PAID_AT_BOOKING" || stat === "PAID") {
      return "PAID AT BOOKING";
    }
    return "TO PAY";
  };

  const paymentText = getPaymentStatusText();

  return (
    <div className={styles.bookingCard}>
      {/* Field 1: Bilty Number */}
      <div className={styles.fieldGroup}>
        <span className={styles.biltyLabel}>बिल्टी क्र.</span>
        <span className={styles.biltyNumber}>{bookingNumber || "-"}</span>
      </div>

      <div className={styles.divider} />

      {/* Field 2: Date */}
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>दिनांक :</span>
        <span className={styles.dateValue}>{formattedDate}</span>
      </div>

      <div className={styles.divider} />

      {/* Field 3: Payment Collection Status (Plain bold text for B&W print) */}
      <div className={styles.statusGroup}>
        <span className={styles.statusLabel}>PAYMENT :</span>
        <span className={styles.statusText}>{paymentText}</span>
      </div>
    </div>
  );
};

export default BookingInfo;
