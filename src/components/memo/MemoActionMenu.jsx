import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Eye,
  Printer,
  Send,
  CheckCircle2,
  IndianRupee,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";

export default function MemoActionMenu({
  memo,
  memoStatus,
  onDispatch,
  onReceive,
  onSettlement,
  onDelete,
}) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const memoId = memo._id || memo.id;
  const isBookingBranch = user?.branch?.type === "BOOKING";
  const isDeliveryBranch = user?.branch?.type === "DELIVERY";

  // Derive effective uppercase status safely
  const effectiveStatus = (memoStatus || memo?.status || "CREATED").toUpperCase();

  const isPendingPayment =
    Number(memo?.pendingAmount ?? 0) > 0 ||
    (memo?.collectionStatus !== "COMPLETED" && memo?.collectionStatus !== "SETTLED");

  const canRecordPayment =
    isBookingBranch &&
    effectiveStatus === "RECEIVED" &&
    isPendingPayment;

  // Compute position relative to viewport for Portal
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownWidth = 192; // 12rem / w-48
    const dropdownHeight = 180;

    let left = rect.right - dropdownWidth;
    let top = rect.bottom + 6;

    // Boundary protection for bottom of viewport
    if (top + dropdownHeight > window.innerHeight) {
      top = rect.top - dropdownHeight - 6;
    }

    // Boundary protection for left edge
    if (left < 10) {
      left = 10;
    }

    setCoords({ top, left });
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    if (!dropdownOpen) {
      updatePosition();
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  // Close on outside click, window scroll or resize
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleOutsideClick = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [dropdownOpen]);

  const handleView = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    navigate(ROUTES.MEMOS.DETAILS(memoId));
  };

  const handlePrint = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    navigate(ROUTES.MEMOS.PREVIEW(memoId));
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setDropdownOpen(false);
    navigate(ROUTES.MEMOS.EDIT(memoId));
  };

  return (
    <div
      className="inline-flex items-center gap-1.5 justify-end whitespace-nowrap"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Primary Action Button:
          If outstanding payment exists, show [ ₹ Record Payment ].
          Otherwise, show standard [ View ].
      */}
      {canRecordPayment ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onSettlement) onSettlement(memo);
          }}
          className="px-2.5 py-1.5 text-xs font-black text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 shrink-0 whitespace-nowrap active:scale-[0.98]"
          title="Record Payment for this Memo"
        >
          <IndianRupee className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          <span>Record Payment</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleView}
          className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 bg-white hover:bg-orange-50 border border-slate-200 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
          title="View Manifest Details"
        >
          View
        </button>
      )}

      {/* 3-Dots Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
          dropdownOpen
            ? "bg-slate-100 border-slate-300 text-slate-900"
            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-slate-200"
        }`}
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* FLOATING PORTAL DROPDOWN (Zero Table Height Expansion & No Clipping) */}
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
            className="w-48 bg-white border border-slate-200/90 rounded-xl shadow-xl py-1 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* View Details */}
            <button
              type="button"
              onClick={handleView}
              className="w-full px-3.5 py-2 text-left hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View Details</span>
            </button>

            {/* Print Manifest */}
            <button
              type="button"
              onClick={handlePrint}
              className="w-full px-3.5 py-2 text-left hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print Manifest</span>
            </button>

            {/* CREATED state actions */}
            {effectiveStatus === "CREATED" && isBookingBranch && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    if (onDispatch) onDispatch(memo);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-blue-50 text-blue-700 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dispatch Memo</span>
                </button>

                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Memo</span>
                </button>

                <div className="h-px bg-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    if (onDelete) onDelete(memo);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Cancel / Delete</span>
                </button>
              </>
            )}

            {/* IN_TRANSIT state actions */}
            {(effectiveStatus === "IN_TRANSIT" || effectiveStatus === "ON_ROUTE") && isDeliveryBranch && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (onReceive) onReceive(memo);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Receive at Branch</span>
              </button>
            )}

            {/* RECEIVED state actions */}
            {canRecordPayment && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(false);
                  if (onSettlement) onSettlement(memo);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
              >
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>Record Payment</span>
              </button>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
