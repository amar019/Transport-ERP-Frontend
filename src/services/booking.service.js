import api from "./api";

/**
 * 1. Create a new transport booking (POST /api/bookings)
 * @param {Object} bookingData
 */
export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

/**
 * 2. Get all booking records (GET /api/bookings)
 * @param {Object} params - Query parameters (search, dates, status filters)
 */
export const getBookings = async (params = {}) => {
  const response = await api.get("/bookings", { params });
  return response.data;
};

/**
 * 3. Get complete booking details by ID (GET /api/bookings/:id)
 * @param {string} id
 */
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

/**
 * 4. Update existing booking (PATCH /api/bookings/:id)
 * @param {string} id
 * @param {Object} bookingData
 */
export const updateBooking = async (id, bookingData) => {
  const response = await api.patch(`/bookings/${id}`, bookingData);
  return response.data;
};

/**
 * 5. Cancel a booking (PATCH /api/bookings/:id/cancel)
 * @param {string} id
 */
export const cancelBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

/**
 * 6. Delete a booking (DELETE /api/bookings/:id)
 * @param {string} id
 */
export const deleteBooking = async (id) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

/**
 * 7. Generate and download Booking Bilty PDF (GET /api/bookings/:id/pdf)
 * @param {string} id
 * @param {string} bookingNumber
 */
export const downloadBookingPdf = async (id, bookingNumber = "Bilty") => {
  const response = await api.get(`/bookings/${id}/pdf`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `Bilty-${bookingNumber}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};
