import React from 'react';
import styles from './WireframeBilty.module.css';
import './Print.css';

import Header from './sections/Header';
import SenderSection from './sections/SenderSection';
import RouteSection from './sections/RouteSection';
import ReceiverSection from './sections/ReceiverSection';
import PaymentQR from './sections/PaymentQR';
import GoodsTable from './sections/GoodsTable';
import SignatureSection from './sections/SignatureSection';
import Footer from './sections/Footer';

/**
 * WireframeBilty Component
 * Renders full Bilty document dynamically with Customer & Office copies.
 */

const WireframeCopy = ({ type, booking = {} }) => {
  const sender = booking.sender || {};
  const customer = booking.customer || {};

  const goodsItems =
    Array.isArray(booking.items) && booking.items.length > 0
      ? booking.items.map((item, idx) => ({
          srNo: idx + 1,
          description: item.description || "-",
          quantity: item.quantity ?? "-"
        }))
      : [
          {
            srNo: 1,
            description: booking.itemName || "-",
            quantity: booking.quantity ?? "-"
          }
        ];

  const charges = {
    crossing: booking.crossing ?? 0,
    freight: booking.freight ?? 0,
    hamali: booking.hamali ?? 0,
    biltyCharge: booking.biltyCharge ?? 0,
    otherCharges: booking.otherCharges ?? 0,
    totalAmount: booking.totalAmount ?? 0
  };

  return (
    <div className={styles.copyContainer}>
      {/* Row 1: Header (Logo, Company, Branches, Booking Info) + Payment QR Card */}
      <div className={styles.row1}>
        <Header type={type} booking={booking} />
        <PaymentQR type={type} qrCode={booking.qrCode || "/qr.jpeg"} upiId={booking.upiId} />
      </div>

      {/* Row 2: Sender & Receiver Sections */}
      <div className={styles.row2}>
        <SenderSection sender={sender} />
        <ReceiverSection customer={customer} deliveryAddress={booking.deliveryAddress} receiver={booking.receiver} />
      </div>

      {/* Row 3: Unified Goods Details & Charges Table */}
      <div className={styles.row3}>
        <GoodsTable goodsItems={goodsItems} charges={charges} notes={booking.notes} booking={booking} />
      </div>

      {/* Row 4: Signature Section (Receiver & Authorized Signatory) */}
      <div className={styles.row4}>
        <SignatureSection companyName="MAHAKAL TRANSPORT" />
      </div>

      {/* Row 5: Custom Software Advertisement Footer Strip */}
      <div className={styles.row5}>
        <Footer />
      </div>
    </div>
  );
};

export const WireframeBilty = ({ booking = {}, viewMode = "both" }) => {
  const showCustomer = viewMode === "both" || viewMode === "customer";
  const showOffice = viewMode === "both" || viewMode === "office";
  const isSingleCopy = viewMode !== "both";

  return (
    <div className="bilty-page-container">
      <div className={`${styles.page} ${isSingleCopy ? styles.singlePage : ""}`}>
        {/* Customer Copy Wireframe */}
        {showCustomer && <WireframeCopy type="customer" booking={booking} />}

        {/* Dashed Cut Line Divider */}
        {viewMode === "both" && (
          <div className={styles.cutLine}>
            <span className={styles.cutIcon}>✂</span>
            <span className={styles.cutDashGuide}>- - - - - - - - - - - - - - -</span>
            <span className={styles.cutText}>CUT HERE FOR OFFICE COPY</span>
            <span className={styles.cutDashGuide}>- - - - - - - - - - - - - - -</span>
            <span className={styles.cutIcon}>✂</span>
          </div>
        )}

        {/* Office Copy Wireframe */}
        {showOffice && <WireframeCopy type="office" booking={booking} />}
      </div>
    </div>
  );
};

export default WireframeBilty;
