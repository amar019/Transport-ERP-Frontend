import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import BookingForm from "@/components/booking/BookingForm";
import {
  addBooking,
  editBooking,
  fetchBookingById,
  clearCurrentBooking,
} from "@/store/slices/bookingSlice";
import { ROUTES } from "@/constants/paths";

export const BookingFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const { currentBooking, isLoading: reduxLoading } = useSelector(
    (state) => state.bookings
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Helper for toast notifications
  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch single booking in edit mode
  useEffect(() => {
    setErrorMsg("");
    if (isEditMode && id) {
      dispatch(clearCurrentBooking());
      dispatch(fetchBookingById(id))
        .unwrap()
        .catch((err) => {
          console.error("Failed to load booking details:", err);
          setErrorMsg(
            typeof err === "string" ? err : "Failed to load booking details"
          );
        });
    }
  }, [isEditMode, id, dispatch]);

  // Form Submission Handler
  const handleSubmitBooking = async (payload) => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (isEditMode) {
        await dispatch(editBooking({ id, bookingData: payload })).unwrap();
        showToast("Booking updated successfully!", "success");
      } else {
        await dispatch(addBooking(payload)).unwrap();
        showToast("Booking created successfully!", "success");
      }

      // Redirect after brief delay
      setTimeout(() => {
        navigate(ROUTES.BOOKINGS.LIST);
      }, 1000);
    } catch (err) {
      console.error("Save booking error:", err);
      const msg =
        typeof err === "string"
          ? err
          : "Failed to save booking. Please check required fields.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBookingId = currentBooking?._id || currentBooking?.id;
  const isBookingLoading = isEditMode && (reduxLoading || !currentBooking || currentBookingId !== id);

  return (
    <div className="min-h-screen bg-slate-50 p-3 md:p-6 font-sans antialiased selection:bg-orange-100">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs md:text-sm font-extrabold">
            {toastMessage.msg}
          </span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[1400px] mx-auto">
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs md:text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isBookingLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-500 font-semibold text-xs flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span>Loading booking details for editing...</span>
          </div>
        ) : errorMsg && isEditMode && !currentBooking ? (
          <div className="bg-white p-10 rounded-3xl border border-rose-200/90 shadow-xs text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Booking Not Found</h3>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                {errorMsg}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer transition-all"
            >
              Return to Bookings List
            </button>
          </div>
        ) : (
          <BookingForm
            key={isEditMode ? (currentBookingId || id) : "new"}
            initialData={isEditMode ? currentBooking : null}
            isEditMode={isEditMode}
            onSubmit={handleSubmitBooking}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default BookingFormPage;

