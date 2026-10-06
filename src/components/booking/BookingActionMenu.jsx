import React, { useState, useRef, useEffect, useCallback } from "react";
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
  MessageCircle,
} from "lucide-react";
import WhatsAppShareModal from "./WhatsAppShareModal";

export default function BookingActionMenu({
  booking,
  onCancelSuccess,
  onDeleteSuccess,
  showToast,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerRef = useRef(null);
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

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 192; // w-48 (12rem)
    const dropdownHeight = 220;

    let left = rect.right - dropdownWidth;
    let top = rect.bottom + 6;

    // Viewport bottom boundary protection
    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - 6;
    }

    // Viewport left boundary protection
    if (left < 10) {
      left = 10;
    }

    setCoords({ top, left });
  }, []);

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    if (!dropdownOpen) {
      updatePosition();
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  // Close dropdown on click outside, scroll, resize or press ESC key
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setDropdownOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [dropdownOpen]);

  // Handlers
  const handleView = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    navigate(`/bookings/${bookingId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    if (!canEdit) return;
    navigate(`/bookings/${bookingId}/edit`);
  };

  const handlePrintBilty = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
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
    <div className="inline-flex items-center gap-1.5 select-none whitespace-nowrap">
      {/* Quick Action: Share WhatsApp */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShareModalOpen(true);
        }}
        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors cursor-pointer shrink-0"
        title="Share Bilty on WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
      </button>

      {/* Quick Action: Print */}
      <button
        type="button"
        onClick={handlePrintBilty}
        className="p-1.5 text-[#64748B] hover:text-[#D90429] hover:bg-[#FFF0F3] bg-white rounded-lg border border-[#E2E8F0] hover:border-[#FCD3DB] transition-colors cursor-pointer shrink-0"
        title="Print / Preview Bilty"
      >
        <Printer className="w-3.5 h-3.5" />
      </button>

      {/* More Actions Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleDropdown}
        className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
          dropdownOpen
            ? "text-[#0F172A] bg-[#F1F5F9] border-[#CBD5E1]"
            : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] bg-white border-[#E2E8F0]"
        }`}
        title="More Actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown Menu via Portal */}
      {dropdownOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1 text-xs font-semibold text-[#0F172A] animate-in fade-in zoom-in-95 duration-100 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleView}
              className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#64748B]" /> View Details
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                setShareModalOpen(true);
              }}
              className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-current" /> Share WhatsApp
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-[#64748B]" /> Edit Booking
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintBilty}
              className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-center gap-2 transition-colors cursor-pointer"
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
          </div>,
          document.body
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

      {/* WhatsApp Sharing Interactive Modal */}
      <WhatsAppShareModal
        booking={booking}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}

