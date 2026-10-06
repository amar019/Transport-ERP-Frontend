import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Inbox, Store, Package } from "lucide-react";
import BookingStatusBadge from "./BookingStatusBadge";
import BookingActionMenu from "./BookingActionMenu";

export default function BookingTable({
  bookings = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onCancelSuccess,
  onDeleteSuccess,
  showToast,
}) {
  const navigate = useNavigate();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Format INR Currency helper
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format Date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Paginated data
  const totalItems = bookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return bookings.slice(start, start + itemsPerPage);
  }, [bookings, currentPage, itemsPerPage]);

  const isAllSelected = useMemo(() => {
    return bookings.length > 0 && selectedIds.length === bookings.length;
  }, [bookings.length, selectedIds.length]);

  const isSomeSelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < bookings.length;
  }, [bookings.length, selectedIds.length]);

  return (
    <div className="w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs flex flex-col select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. MOBILE CARDS VIEW (lg:hidden) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden">
        {/* Mobile Header / Select All Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={() => onToggleSelectAll && onToggleSelectAll()}
              className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
            />
            <span>Select All ({totalItems})</span>
          </label>

          {selectedIds.length > 0 && (
            <span className="font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md text-[11px]">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        {/* Mobile Card List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="p-4 space-y-3 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-200 rounded"></div>
                  <div className="h-5 w-16 bg-slate-200 rounded"></div>
                </div>
                <div className="h-4 w-40 bg-slate-200 rounded"></div>
                <div className="h-4 w-28 bg-slate-100 rounded"></div>
              </div>
            ))
          ) : paginatedBookings.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-2.5 border border-orange-100">
                  <Inbox className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No bookings found</h4>
                <p className="text-slate-500 text-xs mt-1">
                  No bookings match your current search query or active filters.
                </p>
              </div>
            </div>
          ) : (
            paginatedBookings.map((b) => {
              const bookingId = b._id || b.id;
              const isSelected = selectedIds.includes(bookingId);
              const isCancelled = b.status === "CANCELLED";

              const isDirectEntry = Boolean(
                b.isDirectEntry || (!b.customer && b.receiver?.shopName)
              );
              const customerShop =
                b.customer?.shopName ||
                b.receiver?.shopName ||
                (typeof b.customer === "string" ? b.customer : "Walk-in Customer");
              const customerOwner = b.customer?.ownerName || b.receiver?.ownerName || "";
              const customerMobile = b.customer?.mobile || b.receiver?.mobile || "";

              const memoNumber =
                typeof b.memo === "object" ? b.memo?.memoNumber : b.memo;

              return (
                <div
                  key={bookingId}
                  onClick={() => navigate(`/bookings/${bookingId}`)}
                  className={`p-3.5 space-y-2.5 transition-colors cursor-pointer ${
                    isCancelled
                      ? "bg-rose-50/30"
                      : isSelected
                      ? "bg-orange-50/70"
                      : "hover:bg-slate-50/80 bg-white"
                  }`}
                >
                  {/* Top Row: Checkbox, Booking Number, Statuses & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect && onToggleSelect(bookingId)}
                          className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                        {b.bookingNumber || "BK-0000"}
                      </span>
                      {memoNumber && (
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Memo #{memoNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <BookingStatusBadge type="status" value={b.status || "BOOKED"} />
                      <BookingActionMenu
                        booking={b}
                        onCancelSuccess={onCancelSuccess}
                        onDeleteSuccess={onDeleteSuccess}
                        showToast={showToast}
                      />
                    </div>
                  </div>

                  {/* Middle Row: Customer Info */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      {isDirectEntry && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                          ⚡ Direct
                        </span>
                      )}
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                        {customerShop}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap">
                      {customerOwner && <span>Owner: {customerOwner}</span>}
                      {customerOwner && customerMobile && <span>•</span>}
                      {customerMobile && <span>Mob: {customerMobile}</span>}
                      <span>•</span>
                      <span>{formatDate(b.bookingDate || b.createdAt)}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Goods Detail, Collection Status & Total Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <span className="font-semibold text-slate-700 truncate">
                        {b.itemName || "Goods"} ({b.quantity ?? 1} Qty)
                      </span>
                      <BookingStatusBadge type="collection" value={b.collectionType || "TO_PAY"} />
                    </div>

                    <span className="font-mono font-black text-orange-600 text-sm shrink-0">
                      {formatCurrency(b.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP SPREADSHEET TABLE VIEW (lg:block) */}
      {/* ========================================================================= */}
      <div className="hidden lg:block w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[900px] xl:min-w-full">
          {/* Sticky Table Header */}
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] select-none sticky top-0 z-10">
            <tr>
              <th className="py-3 px-3 w-9 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={() => onToggleSelectAll && onToggleSelectAll()}
                  className="w-3.5 h-3.5 text-[#F97316] border-[#CBD5E1] rounded focus:ring-[#F97316] cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 whitespace-nowrap w-[110px]">Booking No</th>
              <th className="py-3 px-3 whitespace-nowrap w-[95px]">Date</th>
              <th className="py-3 px-3 whitespace-nowrap w-[85px]">Memo</th>
              <th className="py-3 px-3 min-w-[160px]">Customer</th>
              <th className="py-3 px-3 min-w-[140px]">Consignment</th>
              <th className="py-3 px-3 text-right whitespace-nowrap w-[110px]">Total Amount</th>
              <th className="py-3 px-3 whitespace-nowrap w-[120px]">Payment</th>
              <th className="py-3 px-3 whitespace-nowrap w-[95px]">Status</th>
              <th className="py-3 px-3 text-right whitespace-nowrap w-[90px]">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#F1F5F9] text-xs">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-3 px-3 text-center">
                    <div className="h-3.5 w-3.5 bg-slate-200 rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-16 bg-slate-200 rounded"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 w-14 bg-slate-200 rounded"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 w-12 bg-slate-200 rounded"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-28 bg-slate-200 rounded mb-1"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 w-24 bg-slate-200 rounded mb-1"></div>
                    <div className="h-3 w-12 bg-slate-100 rounded"></div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="h-4 w-16 bg-slate-200 rounded ml-auto"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4.5 w-16 bg-slate-200 rounded"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4.5 w-14 bg-slate-200 rounded"></div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="h-6 w-16 bg-slate-200 rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-16 px-4 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-2.5 border border-[#FFEDD5]">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-[#0F172A] text-sm">No bookings found</h4>
                    <p className="text-[#64748B] text-xs mt-1 leading-relaxed font-normal">
                      No transport bookings match your current search query or active filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => {
                const bookingId = b._id || b.id;
                const isSelected = selectedIds.includes(bookingId);
                const isCancelled = b.status === "CANCELLED";

                const isDirectEntry = Boolean(
                  b.isDirectEntry || (!b.customer && b.receiver?.shopName)
                );
                const customerShop =
                  b.customer?.shopName ||
                  b.receiver?.shopName ||
                  (typeof b.customer === "string" ? b.customer : "Walk-in Customer");
                const customerOwner = b.customer?.ownerName || b.receiver?.ownerName || "";
                const customerMobile = b.customer?.mobile || b.receiver?.mobile || "";
                const customerSubInfo = [customerOwner, customerMobile]
                  .filter(Boolean)
                  .join(" · ");

                const memoNumber =
                  typeof b.memo === "object" ? b.memo?.memoNumber : b.memo;

                return (
                  <tr
                    key={bookingId}
                    onClick={() => navigate(`/bookings/${bookingId}`)}
                    className={`hover:bg-[#F8FAFC] transition-colors group cursor-pointer ${
                      isCancelled ? "bg-[#FEF2F2]/30" : ""
                    } ${isSelected ? "bg-[#FFF7ED]/70 font-medium" : ""}`}
                  >
                    <td
                      className="py-3 px-3 text-center whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect && onToggleSelect(bookingId)}
                        className="w-3.5 h-3.5 text-[#F97316] border-[#CBD5E1] rounded focus:ring-[#F97316] cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] px-2 py-0.5 rounded-md border border-[#E2E8F0] group-hover:bg-[#FFF7ED] group-hover:text-[#C2410C] group-hover:border-[#FFEDD5] transition-colors">
                        {b.bookingNumber || "BK-0000"}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#475569] font-medium whitespace-nowrap text-xs">
                      {formatDate(b.bookingDate || b.createdAt)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {memoNumber ? (
                        <span className="font-mono text-[11px] font-medium text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded-md border border-[#E2E8F0]">
                          {memoNumber}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] font-normal px-1">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 max-w-[210px]">
                        {isDirectEntry && (
                          <span className="text-[9px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200 shrink-0">
                            ⚡ Direct
                          </span>
                        )}
                        <div
                          className="font-semibold text-[#0F172A] text-xs truncate"
                          title={customerShop}
                        >
                          {customerShop}
                        </div>
                      </div>
                      {customerSubInfo && (
                        <div
                          className="text-[11px] text-[#64748B] font-normal truncate max-w-[210px] mt-0.5"
                          title={customerSubInfo}
                        >
                          {customerSubInfo}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div
                        className="text-[#0F172A] font-medium text-xs truncate max-w-[160px]"
                        title={b.itemName || "Goods"}
                      >
                        {b.itemName || "Goods"}
                      </div>
                      <div className="text-[11px] text-[#64748B] font-normal mt-0.5">
                        {b.quantity ?? 1} Qty
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A] whitespace-nowrap text-xs">
                      {formatCurrency(b.totalAmount || 0)}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <BookingStatusBadge
                        type="collection"
                        value={b.collectionType || "TO_PAY"}
                      />
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <BookingStatusBadge
                        type="status"
                        value={b.status || "BOOKED"}
                      />
                    </td>

                    <td
                      className="py-3 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookingActionMenu
                        booking={b}
                        onCancelSuccess={onCancelSuccess}
                        onDeleteSuccess={onDeleteSuccess}
                        showToast={showToast}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
