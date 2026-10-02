/**
 * WhatsApp Sharing Utility for Transport & Logistics ERP
 * Handles phone formatting, message templates, and WhatsApp Web/App deep links.
 */

/**
 * Clean phone number for WhatsApp deep link
 * @param {string} phone 
 * @returns {string} e.g. "919856562521"
 */
export const formatWhatsAppPhone = (phone = "") => {
  if (!phone) return "";
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  return cleaned;
};

/**
 * Format Date helper
 * @param {string|Date} dateStr 
 * @returns {string} e.g. "13-09-2026"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
};

/**
 * Generate formatted WhatsApp message for Bilty / LR Document
 * @param {Object} booking 
 * @returns {string} Plain text WhatsApp message
 */
export const generateBiltyWhatsAppMessage = (booking = {}) => {
  const bookingNo = booking.bookingNumber || "N/A";
  const dateStr = formatDateShort(booking.bookingDate || booking.createdAt);

  const senderName = booking.sender?.name || "N/A";
  const senderMobile = booking.sender?.mobile || "";

  const consigneeName =
    booking.customer?.shopName ||
    booking.receiver?.shopName ||
    booking.receiver?.name ||
    booking.customer?.name ||
    "N/A";

  const consigneeMobile =
    booking.customer?.mobile ||
    booking.customer?.phone ||
    booking.receiver?.mobile ||
    booking.receiver?.phone ||
    "";

  const deliveryAddr =
    booking.deliveryAddress ||
    booking.customer?.address ||
    booking.receiver?.address ||
    "-";

  const itemName = booking.itemName || "Goods";
  const quantity = booking.quantity ?? 1;
  const totalAmount = parseFloat(booking.totalAmount || 0).toFixed(2);

  const isPaid =
    (booking.collectionType || "").toUpperCase().replace(/[\s-]+/g, "_") === "PAID_AT_BOOKING" ||
    (booking.paymentStatus || "").toUpperCase() === "PAID";

  const paymentStatusText = isPaid ? "PAID AT BOOKING ✅" : "TO PAY (Collect at Delivery) ⏳";

  const previewUrl = window.location.origin ? `${window.location.origin}/bilty-preview?id=${booking._id || booking.id}` : "";

  return `🚛 *MAHAKAL TRANSPORT - BILTY DETAILS* 🚛
=================================
📄 *Bilty No:* ${bookingNo}
📅 *Date:* ${dateStr}
---------------------------------
👤 *Consignor (Sender):* ${senderName} ${senderMobile ? `(${senderMobile})` : ''}
👤 *Consignee (Receiver):* ${consigneeName} ${consigneeMobile ? `(${consigneeMobile})` : ''}
📍 *Delivery Address:* ${deliveryAddr}
---------------------------------
📦 *Goods:* ${itemName} (Qty: ${quantity})
💰 *Total Freight Amount:* ₹${totalAmount}
💳 *Payment:* ${paymentStatusText}

=================================
Thank you for shipping with Mahakal Transport! 🙏`;
};

/**
 * Deep-link trigger for WhatsApp Web / App
 * @param {string} phone 
 * @param {Object} booking 
 */
export const shareBiltyOnWhatsApp = (phone, booking) => {
  const formattedPhone = formatWhatsAppPhone(phone);
  const message = generateBiltyWhatsAppMessage(booking);
  const encodedMsg = encodeURIComponent(message);

  let url = "";
  if (formattedPhone) {
    url = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
  } else {
    url = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  }

  window.open(url, "_blank", "noopener,noreferrer");
};
