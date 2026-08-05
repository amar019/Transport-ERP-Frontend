import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Pencil,
  Printer,
  MoreVertical,
  XCircle,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function BookingActionMenu({
  booking,
  onCancelSuccess,
  onDeleteSuccess,
  showToast,
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef(null);
  const bookingId = booking._id || booking.id;
  const isCancelled = booking.status === "CANCELLED";
  const isBooked = booking.status === "BOOKED" || !booking.status;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handlers
  const handleView = (e) => {
    e.stopPropagation();
    navigate(`/bookings/${bookingId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/bookings/${bookingId}/edit`);
  };

  const handlePrintBilty = (e) => {
    e.stopPropagation();
    navigate(`/bilty-preview?id=${bookingId}`);
  };

  // Confirm Cancel
  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);
      if (onCancelSuccess) {
        await onCancelSuccess(bookingId);
      }
      setCancelModalOpen(false);
    } catch (error) {
      console.error("Cancel booking error:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      if (onDeleteSuccess) {
        await onDeleteSuccess(bookingId);
      }
      setDeleteModalOpen(false);
    } catch (error) {
      console.error("Delete booking error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1" ref={menuRef}>
      {/* Quick Action Icons */}
      <button
        type="button"
        onClick={handleView}
        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer"
        title="View Details"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {isBooked && (
        <button
          type="button"
          onClick={handleEdit}
          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer"
          title="Edit Booking"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={handlePrintBilty}
        className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer"
        title="Print / Preview Bilty"
      >
        <Printer className="w-3.5 h-3.5" />
      </button>

      {/* More Actions Trigger */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDropdownOpen(!dropdownOpen);
        }}
        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all cursor-pointer"
        title="More Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={handleView}
            className="w-full px-3 py-2 text-left hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" /> View Details
          </button>

          {isBooked && (
            <button
              type="button"
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-400" /> Edit Booking
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintBilty}
            className="w-full px-3 py-2 text-left hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" /> Print Bilty
          </button>

          <div className="h-px bg-slate-100 my-1"></div>

          {/* Cancel Option (Only for BOOKED) */}
          {isBooked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                setCancelModalOpen(true);
              }}
              className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel Booking
            </button>
          )}

          {/* Delete Option (For BOOKED and CANCELLED) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(false);
              setDeleteModalOpen(true);
            }}
            className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Booking
          </button>
        </div>
      )}

      {/* Cancel Confirmation Modal using createPortal to mount on document.body */}
      {cancelModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Cancel Booking?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {booking.bookingNumber || "This booking"}
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

      {/* Delete Confirmation Modal using createPortal to mount on document.body */}
      {deleteModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">
                    Delete Booking?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {booking.bookingNumber || "This booking"}
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
