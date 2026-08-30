import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Eye,
  Pencil,
  Printer,
  MoreVertical,
  XCircle,
  Trash2,
  AlertTriangle,
  Loader2,
  Lock,
} from "lucide-react";

export default function BookingActionMenu({
  booking,
  onCancelSuccess,
  onDeleteSuccess,
  showToast,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef(null);
  const bookingId = booking._id || booking.id;
  const isCancelled = booking.status === "CANCELLED";
  const isBooked = booking.status === "BOOKED" || !booking.status;

  // Role & Memo checks
  const isBookingBranch = user?.branch?.type === "BOOKING";
  const isMemoAssigned = Boolean(booking.memo);
  const canEdit = isBookingBranch && isBooked && !isMemoAssigned;
  const canCancel = isBookingBranch && isBooked && !isMemoAssigned;
  const canDelete = isBookingBranch && (isBooked || isCancelled) && !isMemoAssigned;

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
    if (!canEdit) return;
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
    <div className="relative inline-flex items-center gap-1.5" ref={menuRef}>
      {/* Quick Action: Print */}
      <button
        type="button"
        onClick={handlePrintBilty}
        className="p-1.5 text-[#64748B] hover:text-[#F97316] hover:bg-[#FFF7ED] bg-white rounded-lg border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors cursor-pointer"
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
        className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] bg-white rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
        title="More Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-30 py-1 text-xs font-semibold text-[#0F172A] animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={handleView}
            className="w-full px-3 py-2 text-left hover:bg-[#FFF7ED] hover:text-[#F97316] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#64748B]" /> View Details
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="w-full px-3 py-2 text-left hover:bg-[#FFF7ED] hover:text-[#F97316] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#64748B]" /> Edit Booking
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintBilty}
            className="w-full px-3 py-2 text-left hover:bg-[#FFF7ED] hover:text-[#F97316] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#64748B]" /> Print Bilty
          </button>

          {isMemoAssigned && (
            <div className="px-3 py-1.5 bg-[#FFFBEB] text-[#D97706] text-[10px] font-semibold flex items-center gap-1.5 my-1 border-y border-[#FDE68A]">
              <Lock className="w-3 h-3 text-[#D97706] shrink-0" />
              <span>Assigned to Memo</span>
            </div>
          )}

          {canCancel && (
            <>
              <div className="h-px bg-[#E2E8F0] my-1"></div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  setCancelModalOpen(true);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FEF2F2] text-[#DC2626] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel Booking
              </button>
            </>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                setDeleteModalOpen(true);
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#FEF2F2] text-[#DC2626] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Booking
            </button>
          )}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-900/50 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-base">
                    Cancel Booking?
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium">
                    {booking.bookingNumber || "This booking"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#475569] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0] font-medium">
                Are you sure you want to cancel this booking?
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            className="fixed inset-0 bg-slate-900/50 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0 border border-[#FECACA]">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-base">
                    Delete Booking?
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium">
                    {booking.bookingNumber || "This booking"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 bg-[#FEF2F2] p-3 rounded-lg border border-[#FECACA]">
                <p className="text-xs text-[#0F172A] font-semibold">
                  Are you sure you want to permanently delete this booking?
                </p>
                <p className="text-[11px] text-[#DC2626] font-semibold">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

