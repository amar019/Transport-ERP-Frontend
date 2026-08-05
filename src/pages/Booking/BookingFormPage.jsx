import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import BookingForm from "../../components/booking/BookingForm";
import { addBooking, editBooking, fetchBookingById } from "../../store/thunk/bookingThunk";
import { clearCurrentBooking } from "../../store/slice/bookingSlice";

export default function BookingFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams(); // Edit mode if id exists

  const isEditMode = Boolean(id);

  const { currentBooking, isLoading: reduxLoading } = useSelector((state) => state.bookings);

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
    dispatch(clearCurrentBooking());
    if (isEditMode && id) {
      console.log("[BookingEdit] Opening edit mode for booking ID:", id);
      dispatch(fetchBookingById(id))
        .unwrap()
        .catch((err) => {
          console.error("Failed to load booking details:", err);
          setErrorMsg(typeof err === "string" ? err : "Failed to load booking details");
        });
    }
  }, [isEditMode, id, dispatch]);

  // Form Submission Handler
  const handleSubmitBooking = async (payload) => {
    try {
      setIsSubmitting(true);
      setErrorMsg("");

      if (isEditMode) {
        console.log(`[BookingEdit] Submitting PATCH /api/bookings/${id} with payload:`, payload);
        await dispatch(editBooking({ id, bookingData: payload })).unwrap();
        showToast("Booking updated successfully!", "success");
      } else {
        await dispatch(addBooking(payload)).unwrap();
        showToast("Booking created successfully!", "success");
      }

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/booking");
      }, 1000);
    } catch (err) {
      console.error("Save booking error:", err);
      const msg = typeof err === "string" ? err : "Failed to save booking. Please check required fields.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-orange-100">
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
          <span className="text-xs md:text-sm font-extrabold">{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs md:text-sm font-bold mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Booking Management</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              {isEditMode ? "Edit Transport Booking" : "Create Booking"}
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {isEditMode
                ? "Update transport booking details and charges"
                : "Register a new transport consignment booking"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto">
        {errorMsg && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs md:text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isEditMode && reduxLoading && !currentBooking ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-12 text-center text-slate-400 font-semibold text-xs animate-pulse">
            Loading booking details for editing...
          </div>
        ) : (
          <BookingForm
            initialData={isEditMode ? currentBooking : null}
            isEditMode={isEditMode}
            onSubmit={handleSubmitBooking}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
