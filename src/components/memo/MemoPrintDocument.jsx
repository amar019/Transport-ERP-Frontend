import React from 'react';
import styles from './MemoPrintDocument.module.css';

/**
 * MemoPrintDocument Component
 * Renders complete Memo / Manifest in A4 Table Structure:
 * - Company Header & Transport Info
 * - Memo Meta Details (No, Date, Route, Branches, CreatedBy, Driver/Vehicle)
 * - Consignments Table (Sr, Bilty No, Consignee Shop, City/Address, Mobile, Item, Qty, Freight, Total, Payment, Sign)
 * - Summary Totals (Total Bilties, Total Cartons, Total Freight, To-Pay Amount, Paid Amount)
 * - Authorized Signatures (Dispatcher, Driver, Receiver)
 */

export const MemoPrintDocument = ({ memo = {}, company = {} }) => {
  const {
    name = "महाकाल",
    subtitle = "ट्रान्सपोर्ट & पार्सल सर्व्हिस",
    tagline = "आपली सेवा, आमची जबाबदारी",
    shree = "॥ श्री ॥",
    logo = "/LOGO.jpg",
    phones = "अ.नगर: 9766149280 • बीड: 8483817081 • जामखेड: 9270848545",
  } = company;

  const bookingsList = Array.isArray(memo.bookings) ? memo.bookings : [];

  // Format currency
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "-");
  };

  // Compute live aggregates across bookings
  let totalQuantity = 0;
  let totalFreight = 0;
  let totalToPay = 0;
  let totalPaidAtBooking = 0;
  let grandTotal = 0;

  bookingsList.forEach((b) => {
    totalQuantity += Number(b.quantity || 1);
    totalFreight += Number(b.freight || 0);
    const amount = Number(b.totalAmount || 0);
    grandTotal += amount;

    if (b.collectionType === "TO_PAY") {
      totalToPay += Number(b.remainingAmount ?? amount);
    } else {
      totalPaidAtBooking += Number(b.paidAmount ?? amount);
    }
  });

  // Fallbacks from memo top-level if bookings array is sparse
  const displayTotalBilties = memo.bookingsCount ?? memo.totalBookings ?? bookingsList.length;
  const displayToPay = memo.totalAmount ?? memo.totalToPay ?? totalToPay;
  const displaySettled = memo.receivedAmount ?? memo.totalCollected ?? 0;

  return (
    <div className={styles.page}>
      {/* UNIFIED HEADER & METADATA SECTION */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerContent}>
          {/* Brand Info (Left) */}
          <div className={styles.brandSection}>
            {logo ? (
              <img src={logo} alt="MTS Logo" className={styles.logoImg} />
            ) : null}
            <div className={styles.brandInfo}>
              <span className={styles.shree}>{shree}</span>
              <div className={styles.titleRow}>
                <span className={styles.companyTitle}>{name} ट्रान्सपोर्ट</span>

              </div>
            </div>
          </div>

          {/* Metadata Box (Right) */}
          <div className={styles.headerMetaBox}>
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>मेमो क्र. (Memo No):</span>
                <span className={styles.highlightValue}>{memo.memoNumber || "MEM-0000"}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>दिनांक (Date):</span>
                <span className={styles.metaValue}>{formatDate(memo.memoDate || memo.date || memo.createdAt)}</span>
              </div>
            </div>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>मार्ग (Route):</span>
                <span className={styles.routeBadge}>
                  {memo.fromBranch?.name || "Origin"} <span className={styles.routeArrow}>→</span> {memo.toBranch?.name || "Destination"}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>पेमेंट स्थिती:</span>
                <span className={styles.statusValue}>{memo.collectionStatus || "PENDING"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONSIGNMENTS TABLE */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '3.5%' }}>अ.नं.<br />(Sr)</th>
              <th style={{ width: '9.5%' }}>बिल्टी क्र.<br />(Bilty No)</th>
              <th className={styles.alignLeft} style={{ width: '18%' }}>घेणारा / दुकान<br />(Consignee Shop)</th>
              <th className={styles.alignLeft} style={{ width: '16%' }}>पत्ता / शहर<br />(Delivery Address)</th>
              <th style={{ width: '9.5%' }}>मोबाईल<br />(Mobile)</th>
              <th className={styles.alignLeft} style={{ width: '12%' }}>मालाचे नाव<br />(Description)</th>
              <th style={{ width: '4.5%' }}>नग<br />(Qty)</th>
              <th className={styles.alignRight} style={{ width: '7%' }}>भाडे<br />(Freight)</th>
              <th className={styles.alignRight} style={{ width: '7.5%' }}>एकूण<br />(Total)</th>
              <th style={{ width: '6.5%' }}>पेमेंट<br />(Type)</th>
              <th style={{ width: '6%' }}>सही<br />(Sign)</th>
            </tr>
          </thead>
          <tbody>
            {bookingsList.length > 0 ? (
              bookingsList.map((b, idx) => {
                const customer = typeof b.customer === 'object' ? b.customer : {};
                const shopName = customer.shopName || (typeof b.customer === 'string' ? b.customer : "-");
                const ownerName = customer.ownerName || "";
                const mobile = customer.mobile || b.sender?.mobile || "-";

                const address =
                  b.deliveryAddress ||
                  customer.deliveryAddress ||
                  customer.address ||
                  [customer.area, customer.city].filter(Boolean).join(", ") ||
                  "-";

                const isToPay = b.collectionType === "TO_PAY";

                return (
                  <tr key={b._id || b.id || idx}>
                    <td className={styles.alignCenter}>{idx + 1}</td>
                    <td className={`${styles.alignCenter} ${styles.biltyNo}`}>
                      {b.bookingNumber || "-"}
                    </td>
                    <td className={styles.alignLeft}>
                      <span className={styles.shopName}>{shopName}</span>
                      {ownerName ? <span className={styles.subText}>({ownerName})</span> : null}
                    </td>
                    <td className={styles.alignLeft}>
                      <span title={address}>{address}</span>
                    </td>
                    <td className={styles.alignCenter}>{mobile}</td>
                    <td className={styles.alignLeft}>{b.itemName || "-"}</td>
                    <td className={styles.alignCenter}>{b.quantity ?? 1}</td>
                    <td className={styles.alignRight}>{formatCurrency(b.freight || 0)}</td>
                    <td className={styles.alignRight}>{formatCurrency(b.totalAmount || 0)}</td>
                    <td className={styles.alignCenter}>
                      <span className={isToPay ? styles.toPayBadge : styles.paidBadge}>
                        {isToPay ? "TO PAY" : "PAID"}
                      </span>
                    </td>
                    <td className={styles.alignCenter}></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className={styles.alignCenter} style={{ padding: '8mm' }}>
                  No bookings attached to this memo.
                </td>
              </tr>
            )}

            {/* SUMMARY TOTALS ROW */}
            <tr className={styles.summaryRow}>
              <td colSpan="6" className={styles.alignRight}>
                एकूण बेरीज (TOTAL SUMMARY):
              </td>
              <td className={styles.alignCenter}>{totalQuantity}</td>
              <td className={styles.alignRight}>{formatCurrency(totalFreight)}</td>
              <td className={`${styles.alignRight} ${styles.totalHighlight}`}>
                {formatCurrency(grandTotal || displayToPay)}
              </td>
              <td colSpan="2" className={styles.alignCenter}>
                {displayTotalBilties} Bilties
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. FOOTER WRAPPER (Renders only once at the end of last page) */}
      <div className={styles.footerContainer}>
        {/* BOTTOM NOTES & FINANCIAL SUMMARY */}
        <div className={styles.bottomSection}>
          {/* Notes Card */}
          <div className={styles.notesCard}>
            <span className={styles.notesTitle}>
              सूचना / रिमार्क (Driver & Delivery Instructionsx):
            </span>

            <span className={styles.notesContent}>
              {memo.notes || (
                <>
                  मेमोमधील सर्व माल काळजीपूर्वक हाताळावा व नमूद
                  तपशीलानुसार संबंधित डिलिव्हरी शाखेत सुरक्षित व वेळेत पोहोचवावा.
                  <br />
                  Please handle all consignments with care and
                  ensure safe and timely delivery to the respective delivery branch as
                  per the details mentioned in this memo.
                </>
              )}
            </span>
          </div>

          {/* Financial Summary Box */}
          <div className={styles.financialSummary}>
            <div className={styles.finRow}>
              <span>एकूण बिल्टी (Total Bilties):</span>
              <span>{displayTotalBilties}</span>
            </div>
            <div className={styles.finRow}>
              <span>एकूण नग (Total Cartons):</span>
              <span>{totalQuantity}</span>
            </div>
            <div className={styles.finRow}>
              <span>एकूण TO_PAY येणे रक्कम:</span>
              <span>{formatCurrency(displayToPay)}</span>
            </div>
            <div className={styles.finRow}>
              <span>जमा रक्कम (Collected):</span>
              <span>{formatCurrency(displaySettled)}</span>
            </div>
          </div>
        </div>

        {/* SIGNATURES FOOTER */}
        <div className={styles.signatureSection}>
          <div className={styles.signBox}>
            <div className={styles.signLine} />
            <span className={styles.signLabel}>
              पाठविणारा प्रतिनिधी<br />(Booking Branch Representative)
            </span>
          </div>

          <div className={styles.signBox}>
            <div className={styles.signLine} />
            <span className={styles.signLabel}>
              चालक / वाहतूक प्रतिनिधी<br />(Driver / Transporter Sign)
            </span>
          </div>

          <div className={styles.signBox}>
            <div className={styles.signLine} />
            <span className={styles.signLabel}>
              स्वीकारणारा प्रतिनिधी सही<br />(Delivery Receiver Sign)
            </span>
          </div>
        </div>

        <div className={styles.disclaimerText}>
          हे संगणकीकृत ट्रान्सपोर्ट मेमो आहे (Computer Generated Transport Memo).
        </div>
      </div>
    </div>
  );
};

export default MemoPrintDocument;
