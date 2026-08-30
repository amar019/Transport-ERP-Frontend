import React, { useState } from "react";
import { Search, RotateCcw, Calendar, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

export default function BookingFilters({
  filters,
  onChange,
  onSearch,
  onReset,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  // Count active filter pills
  const activeFiltersCount = [
    filters.status !== "ALL" && filters.status,
    filters.paymentStatus !== "ALL" && filters.paymentStatus,
    filters.collectionType !== "ALL" && filters.collectionType,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs mb-4 select-none">
      <form onSubmit={handleFormSubmit} className="p-3.5 space-y-3">
        {/* Primary Toolbar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left Inputs Group */}
          <div className="flex flex-1 items-center flex-wrap gap-2.5">
            {/* Search Input (Maximum available space) */}
            <div className="relative min-w-[240px] flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bookings, customers, address..."
                value={filters.search || ""}
                onChange={(e) => handleInputChange("search", e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-1 focus:ring-[#F97316] transition-colors font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
              />
            </div>

            {/* Booking Status Dropdown */}
            <div className="w-full sm:w-40">
              <select
                value={filters.status || "ALL"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-1 focus:ring-[#F97316] transition-colors font-semibold text-[#0F172A] cursor-pointer"
              >
                <option value="ALL">Booking Status: All</option>
                <option value="BOOKED">Booked</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Dropdown */}
            <div className="w-full sm:w-40">
              <select
                value={filters.paymentStatus || "ALL"}
                onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-1 focus:ring-[#F97316] transition-colors font-semibold text-[#0F172A] cursor-pointer"
              >
                <option value="ALL">Payment Status: All</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
                <option value="CREDIT">Credit</option>
              </select>
            </div>

            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                showAdvanced || activeFiltersCount > 0
                  ? "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]"
                  : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#F97316] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Container */}
        {showAdvanced && (
          <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            {/* Collection Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                Collection Type
              </label>
              <select
                value={filters.collectionType || "ALL"}
                onChange={(e) => handleInputChange("collectionType", e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A] cursor-pointer"
              >
                <option value="ALL">All Collection Types</option>
                <option value="PAID_AT_BOOKING">Paid at Booking</option>
                <option value="TO_PAY">To Pay</option>
              </select>
            </div>

            {/* From Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                From Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A]"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                To Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A]"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

