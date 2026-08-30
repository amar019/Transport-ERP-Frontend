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
  Building2,
  Lock,
  ArrowRight,
  Phone,
  Truck,
  Clock,
  ShieldCheck,
  Tag,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  fetchBookingById,
  cancelBookingThunk,
  deleteBookingThunk,
} from "@/store/slices/bookingSlice";
import BookingStatusBadge from "@/components/booking/BookingStatusBadge";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/paths";

export const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentBooking: booking, isLoading, error } = useSelector(
    (state) => state.bookings
  );

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

  // Role & Memo checks
  const isBookingBranch = user?.branch?.type === "BOOKING";
  const isMemoAssigned = Boolean(booking?.memo);
  const canEdit = isBookingBranch && isBooked && !isMemoAssigned;
  const canCancel = isBookingBranch && isBooked && !isMemoAssigned;
  const canDelete = isBookingBranch && (isBooked || isCancelled) && !isMemoAssigned;

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
        navigate(ROUTES.BOOKINGS.LIST);
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
      <div className="min-h-screen bg-slate-50/60 p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-md flex flex-col items-center gap-3.5 animate-in fade-in">
          <Loader2 className="w-9 h-9 animate-spin text-orange-500" />
          <span className="text-xs font-black tracking-wide text-slate-700">
            Loading consignment details...
          </span>
        </div>
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-4 md:p-8 max-w-4xl mx-auto select-none space-y-4">
        <button
          type="button"
          onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs font-bold transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Bookings List</span>
        </button>

        <div className="bg-white p-10 rounded-3xl border border-rose-200/90 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-2xs">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800">Consignment Not Found</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              {typeof error === "string"
                ? error
                : "The requested booking details could not be found or you may not have access."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            Return to Bookings List
          </button>
        </div>
      </div>
    );
  }

  const sender = booking.sender || {};
  const customer = typeof booking.customer === "object" ? booking.customer : {};
  const memoNumber = typeof booking.memo === "object" ? booking.memo?.memoNumber : booking.memo;
  const memoId = typeof booking.memo === "object" ? booking.memo?._id : booking.memo;

  return (
    <div className="min-h-screen bg-slate-50/60 p-3.5 md:p-6 font-sans antialiased text-slate-800 selection:bg-orange-100 select-none pb-20">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-50/95 text-emerald-900 border-emerald-200/90 shadow-emerald-500/10"
              : "bg-rose-50/95 text-rose-900 border-rose-200/90 shadow-rose-500/10"
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

      {/* Outer Centered Container */}
      <div className="max-w-7xl mx-auto space-y-5">
        {/* TOP COMPACT BREADCRUMB NAVIGATION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200/90 px-3.5 py-2 rounded-xl shadow-2xs hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to Bookings</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Bookings</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-extrabold text-slate-900">
                {booking.bookingNumber || "Consignment Details"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono font-bold bg-slate-100/80 text-slate-700 px-3 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
              System ID: <span className="text-slate-900 font-extrabold">#{id.slice(-6)}</span>
            </span>
          </div>
        </div>

        {/* HERO COMMAND HEADER CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Booking ID, Badges, & Key Metadata */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-base md:text-xl font-black bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 px-4 py-1.5 rounded-2xl border border-orange-200/90 shadow-2xs">
                    {booking.bookingNumber || "BK-0000"}
                  </span>
                  <BookingStatusBadge type="status" value={booking.status || "BOOKED"} />
                  <BookingStatusBadge type="collection" value={booking.collectionType || "TO_PAY"} />
                </div>
              </div>

              {/* Meta Row: Booking Date, Creator, Origin/Destination */}
              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Booked on {formatDate(booking.bookingDate || booking.createdAt)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Created by <b className="text-slate-800">{booking.createdBy?.name || booking.createdBy?.username || "Operator"}</b>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Print Bilty Button (Primary Action) */}
              <button
                type="button"
                onClick={() => navigate(ROUTES.BOOKINGS.PREVIEW(id))}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs md:text-sm cursor-pointer group"
              >
                <Printer className="w-4 h-4 stroke-[2.5] transition-transform duration-300 group-hover:scale-110" />
                <span>Print Bilty</span>
              </button>

              {/* Edit Button */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.BOOKINGS.EDIT(id))}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98] border border-slate-200/90 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              )}

              {/* Cancel Button */}
              {canCancel && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-extrabold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:scale-[1.02] active:scale-[0.98] border border-rose-200/90 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel</span>
                </button>
              )}

              {/* Delete Button */}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2.5 text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:scale-105 active:scale-95 rounded-xl transition-all duration-200 cursor-pointer"
                  title="Delete Booking Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Assigned Manifest / Memo Banner */}
          {isMemoAssigned && (
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50/80 via-amber-50/50 to-orange-50/60 p-4 rounded-2xl border border-amber-200/90 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/80 shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase text-amber-900 tracking-tight block">
                    Assigned to Dispatch Manifest / Memo
                  </span>
                  <span className="text-xs font-semibold text-amber-900">
                    Memo Number: <b className="font-mono font-black">{memoNumber || "N/A"}</b>
                  </span>
                </div>
              </div>

              {memoId && (
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.MEMOS.DETAILS(memoId))}
                  className="inline-flex items-center gap-2 text-xs font-extrabold text-amber-950 bg-white hover:bg-amber-100 hover:scale-105 active:scale-95 px-3.5 py-2 rounded-xl border border-amber-200/90 shadow-2xs transition-all duration-200 cursor-pointer self-start sm:self-auto group"
                >
                  <span>Open Memo</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2-COLUMN SPLIT DASHBOARD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: CONSIGNMENT, ROUTE & PARTY PARTICULARS (8 cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-5">
            {/* CARD 1: ROUTE & TRANSIT PIPELINE */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100 shadow-2xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">
                    Transport Route & Stations
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200/80">
                  Direct Station Line
                </span>
              </div>

              {/* Visual Route Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin Branch */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1.5 transition-all hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Origin Station (From)
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded">
                      {booking.fromBranch?.type || "BOOKING"}
                    </span>
                  </div>
                  <div className="font-black text-slate-800 text-sm md:text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{booking.fromBranch?.name || "N/A"}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    {booking.fromBranch?.city || "Hub Station"}
                  </div>
                </div>

                {/* Destination Branch */}
                <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200/80 space-y-1.5 transition-all hover:bg-orange-50/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-orange-600">
                      Destination Station (To)
                    </span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-orange-100 text-orange-800 rounded">
                      {booking.toBranch?.type || "DELIVERY"}
                    </span>
                  </div>
                  <div className="font-black text-orange-900 text-sm md:text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{booking.toBranch?.name || "N/A"}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-orange-700">
                    {booking.toBranch?.city || "Delivery Station"}
                  </div>
                </div>
              </div>

              {/* Drop Delivery Address */}
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Delivery / Drop Location Address
                </span>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">
                  {booking.deliveryAddress || "Standard Station Pickup (Counter Delivery)"}
                </p>
              </div>
            </div>

            {/* CARD 2: PARTY DETAILS (DUAL SENDER & RECEIVER CARDS) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100 shadow-2xs">
                    <Store className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">
                    Consignor & Consignee Parties
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-extrabold text-slate-400">
                  Party Profiles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SENDER (CONSIGNOR) CARD */}
                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200/60">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      Sender (Consignor)
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Sender Name
                      </span>
                      <span className="font-black text-slate-800 text-sm">
                        {sender.name || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Contact Mobile
                      </span>
                      <span className="font-bold text-slate-700 font-mono">
                        {sender.mobile || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Sender Location / Town
                      </span>
                      <span className="font-semibold text-slate-600">
                        {sender.address || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RECEIVER / CUSTOMER (CONSIGNEE) CARD */}
                <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 space-y-3 hover:border-orange-200 transition-colors">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        Receiver (Consignee)
                      </span>
                    </div>
                    {customer.customerCode && (
                      <span className="text-[9px] font-mono font-black bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md border border-orange-200/80">
                        {customer.customerCode}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 block">
                        Customer / Firm Name
                      </span>
                      <span className="font-black text-slate-800 text-sm">
                        {customer.shopName || (typeof booking.customer === "string" ? booking.customer : "N/A")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block">
                          Owner / Contact
                        </span>
                        <span className="font-bold text-slate-700">
                          {customer.ownerName || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block">
                          Phone Number
                        </span>
                        <span className="font-bold text-slate-700 font-mono">
                          {customer.mobile || "N/A"}
                        </span>
                      </div>
                    </div>

                    {customer.address && (
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 block">
                          Registered Firm Address
                        </span>
                        <span className="font-semibold text-slate-600">
                          {customer.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: CONSIGNMENT GOODS & MATERIAL DETAILS */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100 shadow-2xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">
                    Consignment Goods Description
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Cargo Details
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-8 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Item Description / Goods
                  </span>
                  <span className="font-black text-slate-800 text-sm md:text-base">
                    {booking.itemName || "General Transport Goods"}
                  </span>
                </div>

                <div className="sm:col-span-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 text-center flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                    Total Quantity
                  </span>
                  <span className="font-mono font-black text-xl text-slate-900">
                    {booking.quantity ?? 1} <span className="text-xs font-bold text-slate-500 font-sans">Packages</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 4: NOTES & SPECIAL INSTRUCTIONS (IF ANY) */}
            {booking.notes && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-2">
                <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-orange-600" />
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase">
                    Notes & Special Handling Instructions
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-700 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 leading-relaxed">
                  {booking.notes}
                </p>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: FINANCIAL BREAKDOWN & PAYMENT SETTLEMENT (4 cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-6">
            {/* CHARGES BREAKDOWN CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold border border-orange-100 shadow-2xs">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">
                      Charges Breakdown
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Itemized consignment rate
                    </span>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-md border border-orange-200/80">
                  INR (₹)
                </span>
              </div>

              {/* Line Items */}
              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Freight:</span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {formatCurrency(booking.freight || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Hamali / Labor:</span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {formatCurrency(booking.hamali || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Crossing Charge:</span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {formatCurrency(booking.crossing || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Bilty Charge:</span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {formatCurrency(booking.biltyCharge || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">Other Charges:</span>
                  <span className="font-mono font-extrabold text-slate-800">
                    {formatCurrency(booking.otherCharges || 0)}
                  </span>
                </div>
              </div>

              {/* TOTAL AMOUNT HIGHLIGHT BANNER */}
              <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 block">
                    Total Amount
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    All charges inclusive
                  </span>
                </div>
                <span className="text-2xl md:text-3xl font-black font-mono text-orange-600 tracking-tight">
                  {formatCurrency(booking.totalAmount || 0)}
                </span>
              </div>

              {/* PAYMENT SETTLEMENT DETAILS */}
              <div className="space-y-3.5 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500">
                    Payment Collection Type
                  </span>
                  <BookingStatusBadge type="collection" value={booking.collectionType || "TO_PAY"} />
                </div>

                <div className="grid grid-cols-2 gap-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                      Paid Amount
                    </span>
                    <span className="font-mono font-black text-emerald-600 text-sm">
                      {formatCurrency(booking.paidAmount || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">
                      Remaining Amount
                    </span>
                    <span className="font-mono font-black text-amber-600 text-sm">
                      {formatCurrency(booking.remainingAmount || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500 font-semibold">Payment Status:</span>
                  <BookingStatusBadge type="payment" value={booking.paymentStatus || "PENDING"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
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

              <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-medium leading-relaxed">
                Are you sure you want to cancel this booking consignment? This action will mark it as cancelled.
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
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

              <div className="space-y-1.5 bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100">
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
};

export default BookingDetailsPage;

