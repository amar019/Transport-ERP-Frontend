import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col select-none overflow-hidden">
      {/* Full Width & Height Responsive Table Container */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[900px] xl:min-w-full">
          {/* Sticky Table Header */}
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] select-none sticky top-0 z-10">
            <tr>
              {/* 1. Checkbox */}
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

              {/* 2. Booking No */}
              <th className="py-3 px-3 whitespace-nowrap w-[110px]">
                Booking No
              </th>

              {/* 3. Date */}
              <th className="py-3 px-3 whitespace-nowrap w-[95px]">
                Date
              </th>

              {/* 4. Memo */}
              <th className="py-3 px-3 whitespace-nowrap w-[85px]">
                Memo
              </th>

              {/* 5. Customer */}
              <th className="py-3 px-3 min-w-[160px]">
                Customer
              </th>

              {/* 6. Consignment */}
              <th className="py-3 px-3 min-w-[140px]">
                Consignment
              </th>

              {/* 7. Total Amount */}
              <th className="py-3 px-3 text-right whitespace-nowrap w-[110px]">
                Total Amount
              </th>

              {/* 8. Payment */}
              <th className="py-3 px-3 whitespace-nowrap w-[120px]">
                Payment
              </th>

              {/* 9. Status */}
              <th className="py-3 px-3 whitespace-nowrap w-[95px]">
                Status
              </th>

              {/* 10. Actions */}
              <th className="py-3 px-3 text-right whitespace-nowrap w-[90px]">
                Actions
              </th>
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
                    <h4 className="font-bold text-[#0F172A] text-sm">
                      No bookings found
                    </h4>
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
                    onClick={() => navigate(`/bookings/${bookingId}`)}
                    className={`hover:bg-[#F8FAFC] transition-colors group cursor-pointer ${
                      isCancelled ? "bg-[#FEF2F2]/30" : ""
                    } ${isSelected ? "bg-[#FFF7ED]/70 font-medium" : ""}`}
                  >
                    {/* 1. Checkbox */}
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

                    {/* 2. Booking No */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] px-2 py-0.5 rounded-md border border-[#E2E8F0] group-hover:bg-[#FFF7ED] group-hover:text-[#C2410C] group-hover:border-[#FFEDD5] transition-colors">
                        {b.bookingNumber || "BK-0000"}
                      </span>
                    </td>

                    {/* 3. Booking Date */}
                    <td className="py-3 px-3 text-[#475569] font-medium whitespace-nowrap text-xs">
                      {formatDate(b.bookingDate || b.createdAt)}
                    </td>

                    {/* 4. Dedicated Memo Column */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {memoNumber ? (
                        <span className="font-mono text-[11px] font-medium text-[#475569] bg-[#F1F5F9] px-1.5 py-0.5 rounded-md border border-[#E2E8F0]">
                          {memoNumber}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] font-normal px-1">—</span>
                      )}
                    </td>

                    {/* 5. Customer Details */}
                    <td className="py-3 px-3">
                      <div
                        className="font-semibold text-[#0F172A] text-xs truncate max-w-[200px]"
                        title={customerShop}
                      >
                        {customerShop}
                      </div>
                      {customerSubInfo && (
                        <div
                          className="text-[11px] text-[#64748B] font-normal truncate max-w-[200px] mt-0.5"
                          title={customerSubInfo}
                        >
                          {customerSubInfo}
                        </div>
                      )}
                    </td>

                    {/* 6. Consignment Details */}
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

                    {/* 7. Total Amount */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0F172A] whitespace-nowrap text-xs">
                      {formatCurrency(b.totalAmount || 0)}
                    </td>

                    {/* 8. Payment Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <BookingStatusBadge
                        type="collection"
                        value={b.collectionType || "TO_PAY"}
                      />
                    </td>

                    {/* 9. Booking Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <BookingStatusBadge
                        type="status"
                        value={b.status || "BOOKED"}
                      />
                    </td>

                    {/* 10. Actions */}
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

      {/* Table Footer / Pagination */}
      <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B] font-medium select-none">
        <div>
          Showing <b className="text-[#0F172A]">{paginatedBookings.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</b> to{" "}
          <b className="text-[#0F172A]">{Math.min(currentPage * itemsPerPage, totalItems)}</b> of <b className="text-[#0F172A]">{totalItems}</b> bookings
          {selectedIds.length > 0 && (
            <span className="ml-2 font-semibold text-[#C2410C] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md text-[11px]">
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
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-[#0F172A]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

