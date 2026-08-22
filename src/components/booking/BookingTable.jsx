import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
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
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col select-none overflow-hidden">
      {/* Full Width & Height Responsive Table Container */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[900px] xl:min-w-full">
          {/* Table Header */}
          <thead className="bg-slate-50/90 border-b border-slate-200/90 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
            <tr>
              {/* 1. Checkbox */}
              <th className="py-2.5 px-2.5 w-9 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={() => onToggleSelectAll && onToggleSelectAll()}
                  className="w-3.5 h-3.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                />
              </th>

              {/* 2. Booking No */}
              <th className="py-2.5 px-2.5 whitespace-nowrap w-[110px]">
                Booking No
              </th>

              {/* 3. Date */}
              <th className="py-2.5 px-2 whitespace-nowrap w-[90px]">
                Date
              </th>

              {/* 4. Memo */}
              <th className="py-2.5 px-2 whitespace-nowrap w-[80px]">
                Memo
              </th>

              {/* 5. Customer */}
              <th className="py-2.5 px-2.5 min-w-[150px]">
                Customer
              </th>

              {/* 6. Consignment */}
              <th className="py-2.5 px-2.5 min-w-[130px]">
                Consignment
              </th>

              {/* 7. Total Amount */}
              <th className="py-2.5 px-2.5 text-right whitespace-nowrap w-[100px]">
                Total Amount
              </th>

              {/* 8. Payment */}
              <th className="py-2.5 px-2 whitespace-nowrap w-[115px]">
                Payment
              </th>

              {/* 9. Status */}
              <th className="py-2.5 px-2 whitespace-nowrap w-[90px]">
                Status
              </th>

              {/* 10. Actions */}
              <th className="py-2.5 px-2.5 text-right whitespace-nowrap w-[80px]">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-2.5 px-2.5 text-center">
                    <div className="h-3.5 w-3.5 bg-slate-200 rounded mx-auto"></div>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-3.5 w-14 bg-slate-200 rounded-md"></div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-3.5 w-12 bg-slate-200 rounded-md"></div>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="h-3.5 w-28 bg-slate-200 rounded-md mb-1"></div>
                    <div className="h-2.5 w-20 bg-slate-100 rounded-md"></div>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <div className="h-3.5 w-24 bg-slate-200 rounded-md mb-1"></div>
                    <div className="h-2.5 w-12 bg-slate-100 rounded-md"></div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    <div className="h-4 w-14 bg-slate-200 rounded-md ml-auto"></div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4.5 w-16 bg-slate-200 rounded-full"></div>
                  </td>
                  <td className="py-2.5 px-2">
                    <div className="h-4.5 w-14 bg-slate-200 rounded-full"></div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    <div className="h-6 w-20 bg-slate-200 rounded-lg ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : paginatedBookings.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-16 px-4 text-center">
                  <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3 border border-orange-100 shadow-2xs">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-sm">
                      No bookings found
                    </h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed font-medium">
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

                // Visual row identification stripe
                let rowBorderClass = "border-l-4 border-l-orange-500/80";
                if (isCancelled) rowBorderClass = "bg-rose-50/30 border-l-4 border-l-rose-500/90 opacity-80";

                const customerShop =
                  b.customer?.shopName ||
                  (typeof b.customer === "string" ? b.customer : "N/A");
                const customerOwner = b.customer?.ownerName || "";
                const customerMobile = b.customer?.mobile || "";
                const customerSubInfo = [customerOwner, customerMobile]
                  .filter(Boolean)
                  .join(" · ");

                const memoNumber =
                  typeof b.memo === "object" ? b.memo?.memoNumber : b.memo;

                return (
                  <tr
                    key={bookingId}
                    className={`hover:bg-orange-50/40 transition-colors group ${rowBorderClass} ${
                      isSelected ? "bg-orange-50/60 font-semibold" : ""
                    }`}
                  >
                    {/* 1. Checkbox */}
                    <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect && onToggleSelect(bookingId)}
                        className="w-3.5 h-3.5 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                      />
                    </td>

                    {/* 2. Booking No */}
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200/90 group-hover:bg-orange-100 group-hover:text-orange-900 transition-colors">
                        {b.bookingNumber || "BK-0000"}
                      </span>
                    </td>

                    {/* 3. Booking Date */}
                    <td className="py-2.5 px-2 text-slate-600 font-semibold whitespace-nowrap text-xs">
                      {formatDate(b.bookingDate || b.createdAt)}
                    </td>

                    {/* 4. Dedicated Memo Column */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      {memoNumber ? (
                        <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                          {memoNumber}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-bold px-1">—</span>
                      )}
                    </td>

                    {/* 5. Customer */}
                    <td className="py-2.5 px-2.5">
                      <div
                        className="font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors truncate max-w-[200px] text-xs"
                        title={customerShop}
                      >
                        {customerShop}
                      </div>
                      {customerSubInfo && (
                        <div
                          className="text-[10.5px] text-slate-500 font-medium truncate max-w-[200px] mt-0.5"
                          title={customerSubInfo}
                        >
                          {customerSubInfo}
                        </div>
                      )}
                    </td>

                    {/* 6. Consignment (Item + Quantity) */}
                    <td className="py-2.5 px-2.5">
                      <div
                        className="text-slate-800 font-bold truncate max-w-[160px] text-xs"
                        title={b.itemName || "Goods"}
                      >
                        {b.itemName || "Goods"}
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-semibold mt-0.5">
                        {b.quantity ?? 1} Qty
                      </div>
                    </td>

                    {/* 7. Total Amount */}
                    <td className="py-2.5 px-2.5 text-right font-mono font-black text-slate-900 whitespace-nowrap text-xs">
                      {formatCurrency(b.totalAmount || 0)}
                    </td>

                    {/* 8. Payment */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <BookingStatusBadge
                        type="collection"
                        value={b.collectionType || "TO_PAY"}
                      />
                    </td>

                    {/* 9. Booking Status */}
                    <td className="py-2.5 px-2 whitespace-nowrap">
                      <BookingStatusBadge
                        type="status"
                        value={b.status || "BOOKED"}
                      />
                    </td>

                    {/* 10. Actions */}
                    <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
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
            <span className="ml-2 font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full text-[11px]">
              {selectedIds.length} selected
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
