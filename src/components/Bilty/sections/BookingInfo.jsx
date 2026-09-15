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

  const formattedCollectionType = (collectionType || "").toUpperCase().replace(/[\s-]+/g, '_');
  const formattedPaymentStatus = (paymentStatus || "").toUpperCase();

  const isPaidAtBooking = formattedCollectionType === "PAID_AT_BOOKING";
  const isPaidOnDelivery = formattedCollectionType === "TO_PAY" && formattedPaymentStatus === "PAID";

  let paymentText = "TO PAY";
  let isGreenBadge = false;

  if (isPaidAtBooking) {
    paymentText = "PAID AT BOOKING";
    isGreenBadge = true;
  } else if (isPaidOnDelivery) {
    paymentText = "PAID ON DELIVERY";
    isGreenBadge = true;
  } else {
    paymentText = "TO PAY";
    isGreenBadge = false;
  }

  return (
    <div className={styles.bookingCard}>
      {/* Top Row: Bilty Number */}
      <div className={styles.biltyRow}>
        <span className={styles.biltyLabel}>BILTY NO</span>
        <span className={styles.biltyNumber}>{bookingNumber || "-"}</span>
      </div>

      <div className={styles.divider} />

      {/* Middle Row: Date */}
      <div className={styles.dateRow}>
        <span className={styles.dateLabel}>DATE</span>
        <span className={styles.dateValue}>{formattedDate}</span>
      </div>

      <div className={styles.divider} />

      {/* Bottom Row: Payment Collection Badge */}
      <div className={styles.statusRow}>
        <span className={styles.statusLabel}>PAYMENT</span>
        <span className={isGreenBadge ? styles.paidBadge : styles.toPayBadge}>
          {paymentText}
        </span>
      </div>
    </div>
  );
};

export default BookingInfo;

