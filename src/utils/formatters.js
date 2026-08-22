/**
 * Utility Formatting Functions
 */

/**
 * Format a number to Indian Rupee string (e.g. ₹1,250.00)
 */
export const formatCurrency = (val, { showSymbol = true, decimals = 0 } = {}) => {
  const num = Number(val || 0);
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return showSymbol ? `₹${formatted}` : formatted;
};

/**
 * Format a date string to DD-MM-YYYY
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date
    .toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
};

/**
 * Format phone numbers consistently
 */
export const formatPhone = (phone) => {
  if (!phone) return "-";
  const clean = String(phone).replace(/\D/g, "");
  if (clean.length === 10) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
};

/**
 * Capitalize first letter of words
 */
export const capitalize = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
