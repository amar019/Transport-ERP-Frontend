import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Store,
  User,
  MapPin,
  ChevronDown,
  Check,
  X,
  Loader2,
  Building2,
} from "lucide-react";

export default function CustomerLedgerSelect({
  customers = [],
  selectedCustomerId,
  onSelectCustomer,
  loading = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Currently selected customer object
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find(
      (c) => (c._id || c.id) === selectedCustomerId
    );
  }, [selectedCustomerId, customers]);

  // Filtered customer list for 300+ customers
  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) => {
      const shop = (c.shopName || "").toLowerCase();
      const owner = (c.ownerName || "").toLowerCase();
      const address = (c.address || c.deliveryAddress || "").toLowerCase();
      const city = (c.city || c.area || "").toLowerCase();
      const code = (c.customerCode || "").toLowerCase();
      const mobile = (c.mobile || "").toLowerCase();
      return (
        shop.includes(q) ||
        owner.includes(q) ||
        address.includes(q) ||
        city.includes(q) ||
        code.includes(q) ||
        mobile.includes(q)
      );
    });
  }, [customers, searchTerm]);

  const handleSelect = (customer) => {
    onSelectCustomer(customer._id || customer.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full sm:w-80 md:w-96" ref={dropdownRef}>
      {/* Dropdown Selector Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3.5 py-2 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs ${
          isOpen
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/10 bg-white"
            : "border-[#E2E8F0] hover:border-slate-300"
        }`}
      >
        {selectedCustomer ? (
          <div className="flex items-center justify-between w-full pr-1 overflow-hidden">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] font-bold text-xs flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                <Store className="w-4 h-4" />
              </div>
              <div className="text-left truncate">
                <div className="font-bold text-[#0F172A] text-xs truncate">
                  {selectedCustomer.shopName || selectedCustomer.name}
                </div>
                <div className="text-[11px] font-medium text-[#64748B] truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                  <span className="truncate">
                    {selectedCustomer.address ||
                      selectedCustomer.area ||
                      selectedCustomer.city ||
                      "No Address"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search & select customer...</span>
          </div>
        )}

        <ChevronDown
          className={`w-4 h-4 text-[#64748B] transition-transform ml-2 shrink-0 ${
            isOpen ? "rotate-180 text-[#2563EB]" : ""
          }`}
        />
      </div>

      {/* Floating Menu Overlay */}
      {isOpen && (
        <div className="absolute right-0 left-0 sm:left-auto sm:w-96 top-full mt-1.5 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search 300+ customers by shop, owner, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 font-medium placeholder:text-[#94A3B8]"
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#64748B] px-1 font-medium">
              <span>Matching: {filteredCustomers.length} of {customers.length}</span>
              <span>Instant Search</span>
            </div>
          </div>

          {/* Scrollable Customer List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
            {loading ? (
              <div className="p-6 text-center text-xs font-medium text-[#64748B] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Loading directory...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-6 text-center text-xs font-medium text-[#64748B]">
                No customers found matching "{searchTerm}"
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const customerId = c._id || c.id;
                const isSelected = selectedCustomerId === customerId;
                const addressStr = c.address || c.area || c.city || "";

                return (
                  <div
                    key={customerId}
                    onClick={() => handleSelect(c)}
                    className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#EFF6FF] text-[#1E40AF] font-bold"
                        : "hover:bg-[#F8FAFC] text-[#0F172A]"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5 truncate">
                        <Store className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        <span className="truncate">{c.shopName || c.name}</span>
                        {c.customerCode && (
                          <span className="text-[10px] bg-slate-100 text-[#475569] px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                            {c.customerCode}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[#64748B]">
                        {c.ownerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#94A3B8]" />
                            {c.ownerName}
                          </span>
                        )}
                        {addressStr && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-[#94A3B8] shrink-0" />
                            <span className="truncate">{addressStr}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
