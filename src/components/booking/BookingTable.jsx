import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, MapPin, Inbox } from "lucide-react";
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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col select-none">
      {/* Scrollable Container */}
      <div className="overflow-x-auto max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none shadow-xs">
            <tr>
              {/* Checkbox Column */}
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={() => onToggleSelectAll && onToggleSelectAll()}
                  className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 whitespace-nowrap">Booking No</th>
              <th className="py-3 px-3 whitespace-nowrap">Date</th>
              <th className="py-3 px-3 min-w-[200px] whitespace-nowrap">Customer</th>
              <th className="py-3 px-3 whitespace-nowrap">Item</th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Qty</th>
              <th className="py-3 px-3 text-right whitespace-nowrap">Total Amount</th>
              <th className="py-3 px-3 whitespace-nowrap">Collection</th>
              <th className="py-3 px-3 whitespace-nowrap">Status</th>
              <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-3 px-3 text-center">
                    <div className="h-4 w-4 bg-slate-200 rounded mx-auto"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-3.5 w-16 bg-slate-200 rounded-md"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-36 bg-slate-200 rounded-md mb-1"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="h-4 w-8 bg-slate-200 rounded-md mx-auto"></div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="h-4 w-16 bg-slate-200 rounded-md ml-auto"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="h-7 w-24 bg-slate-200 rounded-lg ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-16 px-4 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3 border border-orange-100 shadow-xs">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-base">
                      No bookings found
                    </h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
                      No transport bookings match your search query or filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedBookings.map((b) => {
                const bookingId = b._id || b.id;
                const isSelected = selectedIds.includes(bookingId);
                const isCancelled = b.status === "CANCELLED";

                // Row border styling for ERP visual identification
                let rowBorderClass = "border-l-4 border-l-orange-500";
                if (isCancelled) rowBorderClass = "bg-rose-50/40 border-l-4 border-l-rose-500 opacity-80";

                const customerShop = b.customer?.shopName || (typeof b.customer === "string" ? b.customer : "N/A");
                const customerOwner = b.customer?.ownerName || "";

                return (
                  <tr
                    key={bookingId}
                    className={`hover:bg-orange-50/50 transition-colors group ${rowBorderClass} ${isSelected ? "bg-orange-50/70 font-semibold" : ""
                      }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect && onToggleSelect(bookingId)}
                        className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                      />
                    </td>

                    {/* Booking No */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 group-hover:bg-orange-100 group-hover:text-orange-800 transition-colors">
                        {b.bookingNumber || "BK-0000"}
                      </span>
                    </td>

                    {/* Booking Date */}
                    <td className="py-3 px-3 text-slate-600 font-semibold whitespace-nowrap">
                      {formatDate(b.bookingDate || b.createdAt)}
                    </td>

                    {/* Customer / Shop Name */}
                    <td className="py-3 px-3 min-w-[200px] max-w-[260px] whitespace-nowrap">
                      <div
                        className="font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors whitespace-nowrap truncate text-xs"
                        title={customerShop}
                      >
                        {customerShop}
                      </div>
                      {customerOwner && (
                        <div
                          className="text-[11px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap truncate"
                          title={customerOwner}
                        >
                          {customerOwner}
                        </div>
                      )}
                    </td>

                    {/* Item */}
                    <td className="py-3 px-3 text-slate-700 font-bold max-w-[120px] truncate" title={b.itemName}>
                      {b.itemName || "Goods"}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-center font-extrabold text-slate-800 whitespace-nowrap">
                      {b.quantity ?? 1}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-3 text-right font-black text-slate-800 whitespace-nowrap">
                      {formatCurrency(b.totalAmount || 0)}
                    </td>

                    {/* Collection */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <BookingStatusBadge type="collection" value={b.collectionType || "TO_PAY"} />
                    </td>

                    {/* Booking Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <BookingStatusBadge type="status" value={b.status || "BOOKED"} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
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

      {/* Table Footer / Pagination */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium select-none">
        <div>
          Showing <b>{paginatedBookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to{" "}
          <b>{Math.min(currentPage * itemsPerPage, totalItems)}</b> of <b>{totalItems}</b> bookings
          {selectedIds.length > 0 && (
            <span className="ml-2 font-bold text-orange-600">
              ({selectedIds.length} selected)
            </span>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
