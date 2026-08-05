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

  const goodsItems = [
    {
      srNo: 1,
      description: booking.itemName || "-",
      quantity: booking.quantity ?? "-"
    }
  ];

  const charges = {
    parcelCharge: booking.parcelCharge ?? 0,
    crossing: booking.crossing ?? 0,
    freight: booking.freight ?? 0,
    hamali: booking.hamali ?? 0,
    biltyCharge: booking.biltyCharge ?? 0,
    otherCharges: booking.otherCharges ?? 0,
    totalAmount: booking.totalAmount ?? 0
  };

  return (
    <div className={styles.copyContainer}>
      {/* Top Section: Header & Sender/Route/Receiver on Left, PaymentQR Panel on Right */}
      <div className={styles.topSection}>
        <div className={styles.leftColumn}>
          {/* Row 1: Header (Logo, Company, Branches, Booking Info) */}
          <div className={styles.row1}>
            <Header type={type} booking={booking} />
          </div>

          {/* Row 2: Sender, Route & Receiver Sections */}
          <div className={styles.row2}>
            <SenderSection sender={sender} />
            <RouteSection fromCity={booking.from} toCity={booking.to} />
            <ReceiverSection customer={customer} deliveryAddress={booking.deliveryAddress} />
          </div>
        </div>

        {/* Right Column: Copy Ribbon + Payment QR Card */}
        <PaymentQR type={type} qrCode={booking.qrCode || "/qr.jpeg"} upiId={booking.upiId} />
      </div>

      {/* Row 3: Unified Goods Details & Charges Table */}
      <div className={styles.row3}>
        <GoodsTable goodsItems={goodsItems} charges={charges} notes={booking.notes} />
      </div>

      {/* Row 4: Signatures Section */}
      <div className={styles.row4}>
        <SignatureSection />
      </div>
    </div>
  );
};

export const WireframeBilty = ({ booking = {} }) => {
  return (
    <div className="bilty-page-container">
      <div className={styles.page}>
        {/* Customer Copy Wireframe */}
        <WireframeCopy type="customer" booking={booking} />

        {/* Dashed Cut Line Divider */}
        <div className={styles.cutLine}>
          ✂ ------------------------------------------ CUT HERE ------------------------------------------ ✂
        </div>

        {/* Office Copy Wireframe */}
        <WireframeCopy type="office" booking={booking} />
      </div>
    </div>
  );
};

export default WireframeBilty;
