import React from "react";
import { Search, RotateCcw, Calendar, Filter } from "lucide-react";

export default function DeliveryFilters({
  filters,
  setFilters,
  onReset,
}) {
  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Bar */}
        <div className="relative">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleInputChange("search", e.target.value)}
              placeholder="LR no, customer, item, delivery boy..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#FF5500] font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
            />
          </div>
        </div>

        {/* Payment Status Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus || "ALL"}
            onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#FF5500] font-medium text-[#0F172A] transition-colors"
          >
            <option value="ALL">All Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            From Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#FF5500] font-medium text-[#0F172A] transition-colors"
            />
          </div>
        </div>

        {/* Date Range End & Reset */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            To Date
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#FF5500] font-medium text-[#0F172A] transition-colors"
            />
            <button
              type="button"
              onClick={onReset}
              className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors shrink-0 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
