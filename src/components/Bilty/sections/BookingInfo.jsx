import React from 'react';
import styles from './BookingInfo.module.css';

/**
 * BookingInfo Component (~46mm width, 23mm height)
 * Premium Enterprise Bilty Info Card:
 * - Bilty Number (BK-XXXX) in prominent bold orange font
 * - Booking Date
 * - Payment Status Badge (TO PAY vs PAID AT BOOKING)
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

  // Operational payment collection status
  const isPaid =
    (collectionType || "").toUpperCase().replace(/[\s-]+/g, '_') === "PAID_AT_BOOKING" ||
    (paymentStatus || "").toUpperCase() === "PAID";
  const paymentText = isPaid ? "PAID AT BOOKING" : "TO PAY";

  return (
    <div className={styles.bookingCard}>
      {/* Top Row: Bilty Number */}
      <div className={styles.biltyRow}>
        <span className={styles.biltyLabel}>Bilty No.</span>
        <span className={styles.biltyNumber}>{bookingNumber || "-"}</span>
      </div>

      <div className={styles.divider} />

      {/* Middle Row: Date */}
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>Date :</span>
        <span className={styles.dateValue}>{formattedDate}</span>
      </div>

      <div className={styles.divider} />

      {/* Bottom Row: Payment Collection Badge */}
      <div className={styles.statusRow}>
        <span className={styles.statusLabel}>PAYMENT :</span>
        <span className={isPaid ? styles.paidBadge : styles.toPayBadge}>
          {paymentText}
        </span>
      </div>
    </div>
  );
};

export default BookingInfo;

