import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  User,
  Store,
  MapPin,
  Package,
  Calculator,
  CreditCard,
  FileText,
  Pencil,
  XCircle,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";
import { fetchBookingById, cancelBookingThunk, deleteBookingThunk } from "../../store/thunk/bookingThunk";
import BookingStatusBadge from "../../components/booking/BookingStatusBadge";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBooking: booking, isLoading, error } = useSelector((state) => state.bookings);

  const [toast, setToast] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchBookingById(id));
    }
  }, [id, dispatch]);

  const isBooked = booking?.status === "BOOKED" || !booking?.status;
  const isCancelled = booking?.status === "CANCELLED";

  // Currency formatter
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Cancel Handler
  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      await dispatch(cancelBookingThunk(id)).unwrap();
      showToast("Booking cancelled successfully", "success");
      setCancelModalOpen(false);
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      showToast(typeof err === "string" ? err : "Failed to cancel booking", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteBookingThunk(id)).unwrap();
      showToast("Booking deleted successfully", "success");
      setDeleteModalOpen(false);
      setTimeout(() => {
        navigate("/booking");
      }, 1000);
    } catch (err) {
      console.error("Failed to delete booking:", err);
      showToast(typeof err === "string" ? err : "Failed to delete booking", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span>Loading booking details...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 font-bold text-xs md:text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Booking Management
        </button>

        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800">Booking Not Found</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
            {typeof error === "string" ? error : "The requested booking details could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/booking")}
            className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Return to List
          </button>
        </div>
      </div>
    );
  }

  const sender = booking.sender || {};
  const customer = typeof booking.customer === "object" ? booking.customer : {};

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-orange-100 select-none">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs md:text-sm font-extrabold">{toast.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          type="button"
          onClick={() => navigate("/booking")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs md:text-sm font-bold mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Booking Management</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm md:text-base font-black bg-orange-50 text-orange-700 px-3 py-1 rounded-xl border border-orange-200">
                {booking.bookingNumber || "BK-0000"}
              </span>
              <BookingStatusBadge type="status" value={booking.status || "BOOKED"} />
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created on {formatDate(booking.bookingDate || booking.createdAt)}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* View / Print Bilty */}
            <button
              type="button"
              onClick={() => navigate(`/bilty-preview?id=${id}`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Bilty</span>
            </button>

            {/* Edit (BOOKED only) */}
            {isBooked && (
              <button
                type="button"
                onClick={() => navigate(`/bookings/${id}/edit`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            )}

            {/* Cancel (BOOKED only) */}
            {isBooked && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Booking</span>
              </button>
            )}

            {/* Delete (BOOKED or CANCELLED) */}
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Row 1: Sender & Customer Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SENDER INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <User className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Sender Information
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Name</span>
                <span className="font-extrabold text-slate-800 text-sm">{sender.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile Number</span>
                <span className="font-semibold text-slate-700">{sender.mobile || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Address</span>
                <span className="font-medium text-slate-600">{sender.address || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* CUSTOMER INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Store className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Customer Information
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Shop Name</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {customer.shopName || (typeof booking.customer === "string" ? booking.customer : "N/A")}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Owner Name</span>
                <span className="font-semibold text-slate-700">{customer.ownerName || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile / Contact</span>
                <span className="font-semibold text-slate-700">{customer.mobile || "N/A"}</span>
              </div>
              {customer.address && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Registered Address</span>
                  <span className="font-medium text-slate-600">{customer.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Delivery & Goods Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TRANSPORT ROUTE & DELIVERY INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Transport Route & Delivery
              </h3>
            </div>

            {/* From & To Route */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">From</span>
                <span className="font-extrabold text-slate-800">{booking.from || "N/A"}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">To</span>
                <span className="font-extrabold text-slate-800">{booking.to || "N/A"}</span>
              </div>
            </div>

            {/* Transport Route Banner */}
            <div className="bg-orange-50/60 p-2.5 rounded-xl border border-orange-100 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-orange-600">Transport Route</span>
              <span className="font-extrabold text-xs text-orange-800">
                {booking.from || "N/A"} → {booking.to || "N/A"}
              </span>
            </div>

            {/* Delivery Address */}
            <div className="text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Delivery Address</span>
              <p className="font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {booking.deliveryAddress || "N/A"}
              </p>
            </div>
          </div>

          {/* GOODS INFORMATION */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <Package className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Goods Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Item Description</span>
                <span className="font-extrabold text-slate-800">{booking.itemName || "N/A"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Quantity</span>
                <span className="font-extrabold text-slate-800">{booking.quantity ?? 1} Cartons / Boxes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Charges Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Calculator className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
              Charges Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Parcel Charge</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(booking.parcelCharge || 0)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Crossing</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(booking.crossing || 0)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Freight</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(booking.freight || 0)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Hamali</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(booking.hamali || 0)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Bilty Charge</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(booking.biltyCharge || 0)}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Other Charges</span>
              <span className="font-extrabold text-slate-800 text-sm">{formatCurrency(booking.otherCharges || 0)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Total Amount
              </span>
            </div>
            <span className="text-xl md:text-2xl font-black text-amber-400">
              {formatCurrency(booking.totalAmount || 0)}
            </span>
          </div>
        </div>

        {/* Row 4: Payment Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-orange-500" />
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
              Payment Information
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Collection Type</span>
              <BookingStatusBadge type="collection" value={booking.collectionType || "TO_PAY"} />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Payment Status</span>
              <BookingStatusBadge type="payment" value={booking.paymentStatus || "PENDING"} />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Paid Amount</span>
              <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(booking.paidAmount || 0)}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Remaining Amount</span>
              <span className="font-extrabold text-amber-600 text-sm">{formatCurrency(booking.remainingAmount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Row 5: Notes */}
        {booking.notes && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Notes & Special Instructions
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {booking.notes}
            </p>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Cancel Booking?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {booking.bookingNumber}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Are you sure you want to cancel this booking?
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    "Confirm Cancel"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Delete Booking?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {booking.bookingNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <p className="text-xs text-slate-700 font-bold">
                  Are you sure you want to permanently delete this booking?
                </p>
                <p className="text-[11px] text-rose-600 font-extrabold">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
