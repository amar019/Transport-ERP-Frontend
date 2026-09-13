import React, { useState, useMemo } from "react";
import {
  Eye,
  UserCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  MapPin,
  Phone,
  Building2,
  Package,
  Calendar,
  UserPlus,
  Hash,
} from "lucide-react";
import DeliveryActionMenu from "./DeliveryActionMenu";

export default function DeliveryTable({
  bookings = [],
  loading = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onViewDetails,
  onAssignBoy,
  onCounterDeliver,
  onMarkDelivered,
  onMarkFailed,
  onCollectPayment,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalItems = bookings.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Ensure current page is valid when total items change
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return bookings.slice(start, start + itemsPerPage);
  }, [bookings, validCurrentPage, itemsPerPage]);

  const isAllSelected = useMemo(() => {
    return bookings.length > 0 && selectedIds.length === bookings.length;
  }, [bookings.length, selectedIds.length]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  };

  // Helpers
  const getInitials = (name) => {
    if (!name) return "DB";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Status Badge Component
  const getStatusBadge = (status) => {
    const st = status || "PENDING";
    switch (st) {
      case "PENDING":
      case "BOOKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
            Pending Delivery
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFEFF] text-[#0891B2] border border-[#CFFAFE] shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-[#0891B2] animate-bounce" />
            Out for Delivery
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
            Delivered
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
            Delivery Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
            {st}
          </span>
        );
    }
  };

  // Payment Badge Component
  const getPaymentBadge = (b) => {
    const status = b.paymentStatus || "PENDING";
    const collectionType = b.collectionType || "TO_PAY";

    if (status === "PAID") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          <CheckCircle2 className="w-3 h-3" />
          PAID
        </span>
      );
    }
    if (status === "PARTIAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          PARTIAL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
        {collectionType}
      </span>
    );
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
          <div className="h-4 bg-[#E2E8F0] rounded w-32 animate-pulse" />
          <div className="h-4 bg-[#E2E8F0] rounded w-24 animate-pulse" />
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3 w-1/4">
                <div className="w-4 h-4 bg-[#E2E8F0] rounded" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-[#E2E8F0] rounded w-24" />
                  <div className="h-3 bg-[#F1F5F9] rounded w-16" />
                </div>
              </div>
              <div className="h-4 bg-[#E2E8F0] rounded w-1/5" />
              <div className="h-4 bg-[#E2E8F0] rounded w-1/6" />
              <div className="h-6 bg-[#E2E8F0] rounded-full w-24" />
              <div className="h-8 bg-[#E2E8F0] rounded-lg w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center shadow-2xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] text-[#F97316] mx-auto flex items-center justify-center border border-[#FFEDD5] shadow-2xs">
          <Inbox className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-[#0F172A]">
            No Delivery Bookings Found
          </h4>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
            There are no delivery records matching your search or filter criteria. Try resetting filters or search query.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col w-full">
      {/* Enterprise Data Table */}
      <div className="overflow-x-auto min-h-[480px] w-full">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-[#CBD5E1] text-[#F97316] focus:ring-[#F97316] cursor-pointer w-4 h-4"
                  title="Select All Deliveries"
                />
              </th>
              <th className="py-3.5 px-4 min-w-[130px]">LR / Booking</th>
              <th className="py-3.5 px-4 min-w-[190px]">Customer</th>
              <th className="py-3.5 px-4 min-w-[220px]">Delivery Address</th>
              <th className="py-3.5 px-4 min-w-[170px]">Delivery Boy</th>
              <th className="py-3.5 px-4 min-w-[150px]">Delivery Status</th>
              <th className="py-3.5 px-4 min-w-[140px]">Payment</th>
              <th className="py-3.5 px-4 text-right min-w-[190px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E2E8F0] text-[#0F172A]">
            {paginatedBookings.map((b) => {
              const deliveryStatus =
                b.deliveryStatus || b.delivery?.status || b.status || "PENDING";
              const deliveryBoy = b.delivery?.deliveryBoy;
              const deliveryBoyName = deliveryBoy?.name;
              const deliveryBoyMobile = deliveryBoy?.mobile;

              const remaining = Number(
                b.remainingAmount ??
                (Number(b.totalAmount || 0) - Number(b.paidAmount || 0))
              );
              const isSelected = selectedIds.includes(b._id || b.id);

              return (
                <tr
                  key={b._id || b.id}
                  className={`transition-colors duration-150 hover:bg-[#F8FAFC]/90 ${
                    isSelected ? "bg-[#FFF7ED]/70" : ""
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(b._id || b.id)}
                      className="rounded border-[#CBD5E1] text-[#F97316] focus:ring-[#F97316] cursor-pointer w-4 h-4"
                    />
                  </td>

                  {/* Column 1: LR Number & Date */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#0F172A] tracking-tight">
                        #{b.bookingNumber || b._id?.slice(-6)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5 font-medium">
                      <Calendar className="w-3 h-3 text-[#94A3B8]" />
                      <span>{formatDate(b.bookingDate || b.createdAt)}</span>
                    </div>
                  </td>

                  {/* Column 2: Consignee / Customer Details */}
                  <td className="py-3.5 px-4 max-w-[220px]">
                    <div className="font-bold text-[#0F172A] truncate flex items-center gap-1.5" title={b.customer?.shopName || b.customer?.name}>
                      <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      <span className="truncate">
                        {b.customer?.shopName || b.customer?.ownerName || b.customer?.name || b.sender?.name || "Walk-in Customer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      {b.customer?.mobile ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B]">
                          <Phone className="w-3 h-3 text-[#94A3B8]" />
                          {b.customer.mobile}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">No Mobile</span>
                      )}
                    </div>
                  </td>

                  {/* Column 3: Delivery Address */}
                  <td className="py-3.5 px-4 max-w-[280px]">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0 mt-0.5" />
                      <div className="font-medium text-[#0F172A] leading-normal text-xs line-clamp-2" title={b.deliveryAddress || b.customer?.address}>
                        {b.deliveryAddress || b.customer?.address || "Address Not Specified"}
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Assigned Delivery Boy */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {deliveryBoyName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-[11px] flex items-center justify-center border border-[#BFDBFE] shrink-0">
                          {getInitials(deliveryBoyName)}
                        </div>
                        <div>
                          <div className="font-bold text-[#0F172A] text-xs">
                            {deliveryBoyName}
                          </div>
                          {deliveryBoyMobile && (
                            <div className="text-[10px] font-medium text-[#64748B] flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-[#94A3B8]" />
                              {deliveryBoyMobile}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAssignBoy(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#D97706] bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] transition-colors cursor-pointer"
                        title="Click to assign delivery boy"
                      >
                        <UserPlus className="w-3 h-3 text-[#D97706]" />
                        <span>Unassigned</span>
                      </button>
                    )}
                  </td>

                  {/* Column 5: Delivery Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(deliveryStatus)}
                  </td>

                  {/* Column 6: Financials & Payment Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {getPaymentBadge(b)}
                    </div>
                    <div className="text-xs font-bold text-[#0F172A] mt-0.5 font-mono flex items-center gap-1">
                      <span>₹{(b.totalAmount || 0).toLocaleString("en-IN")}</span>
                      {remaining > 0 && (
                        <span className="text-[10px] font-semibold text-[#DC2626] font-sans bg-[#FEF2F2] px-1.5 py-0.2 rounded border border-[#FECACA]">
                          Due: ₹{remaining.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 7: Action Menu */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <DeliveryActionMenu
                      booking={b}
                      onViewDetails={onViewDetails}
                      onAssignBoy={onAssignBoy}
                      onCounterDeliver={onCounterDeliver}
                      onMarkDelivered={onMarkDelivered}
                      onMarkFailed={onMarkFailed}
                      onCollectPayment={onCollectPayment}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Senior UI/UX Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B] select-none">
        {/* Left: Summary & Items Per Page Selector */}
        <div className="flex items-center gap-4">
          <div className="font-medium text-[#475569]">
            Showing <strong className="text-[#0F172A]">{(validCurrentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-[#0F172A]">{Math.min(validCurrentPage * itemsPerPage, totalItems)}</strong> of{" "}
            <strong className="text-[#0F172A]">{totalItems}</strong> deliveries
          </div>

          <div className="flex items-center gap-1.5 border-l border-[#E2E8F0] pl-4">
            <span className="text-[11px] text-[#64748B]">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1 text-xs font-semibold text-[#0F172A] focus:ring-1 focus:ring-[#F97316] outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Right: Page Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={validCurrentPage === 1}
              className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Indicator Badge */}
            <div className="px-3.5 py-1 text-xs font-semibold text-[#0F172A] bg-white rounded-lg border border-[#E2E8F0]">
              Page <span className="text-[#F97316]">{validCurrentPage}</span> of {totalPages}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={validCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

