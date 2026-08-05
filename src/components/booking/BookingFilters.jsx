import React, { useState } from "react";
import { Search, RotateCcw, Filter, Calendar, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

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
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs mb-5 select-none transition-all">
      <form onSubmit={handleFormSubmit} className="p-3.5 space-y-3">
        {/* Primary Toolbar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Left Inputs Group */}
          <div className="flex flex-1 items-center flex-wrap gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[220px] flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Booking, Customer, Address..."
                value={filters.search || ""}
                onChange={(e) => handleInputChange("search", e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Booking Status Dropdown */}
            <div className="w-full sm:w-40">
              <select
                value={filters.status || "ALL"}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">Booking Status: All</option>
                <option value="BOOKED">Booked</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Dropdown */}
            <div className="w-full sm:w-40">
              <select
                value={filters.paymentStatus || "ALL"}
                onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all font-semibold text-slate-700 cursor-pointer"
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                showAdvanced || activeFiltersCount > 0
                  ? "bg-orange-50 text-orange-700 border-orange-300"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-orange-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black">
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
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-all cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-lg shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Container */}
        {showAdvanced && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            {/* Collection Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Collection Type
              </label>
              <select
                value={filters.collectionType || "ALL"}
                onChange={(e) => handleInputChange("collectionType", e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Collection Types</option>
                <option value="PAID_AT_BOOKING">Paid at Booking</option>
                <option value="TO_PAY">To Pay</option>
              </select>
            </div>

            {/* From Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                From Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-700"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                To Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-orange-500 font-medium text-slate-700"
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
