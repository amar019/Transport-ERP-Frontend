import api from "./api";

/**
 * Fetch Booking Charge Breakdown Report
 * GET /api/bookings/reports/breakdown
 * @param {Object} params - { startDate, endDate, collectionType, toBranch, fromBranch }
 */
export const getBookingChargeBreakdownReport = async (params = {}) => {
  const response = await api.get("/bookings/reports/breakdown", { params });
  return response.data;
};

export default {
  getBookingChargeBreakdownReport,
};

