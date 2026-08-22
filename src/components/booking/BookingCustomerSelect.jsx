import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, Store, User, Phone, MapPin, ChevronDown, Check, X, Loader2 } from "lucide-react";
import { getCustomers } from "@/services/customer.service";


export default function BookingCustomerSelect({
  selectedCustomerId,
  onSelectCustomer,
  error,
}) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef(null);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomersList = async () => {
      try {
        setLoading(true);
        const res = await getCustomers();
        const list = res?.data ? res.data : Array.isArray(res) ? res : [];
        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomersList();
  }, []);

  // Close dropdown when clicking outside
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
      (c) => (c._id || c.id) === selectedCustomerId || c.customerCode === selectedCustomerId
    );
  }, [selectedCustomerId, customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter((c) => {
      const shop = (c.shopName || "").toLowerCase();
      const owner = (c.ownerName || "").toLowerCase();
      const mobile = (c.mobile || "").toLowerCase();
      const code = (c.customerCode || "").toLowerCase();
      const city = (c.city || "").toLowerCase();
      return (
        shop.includes(q) ||
        owner.includes(q) ||
        mobile.includes(q) ||
        code.includes(q) ||
        city.includes(q)
      );
    });
  }, [customers, searchTerm]);

  const handleSelect = (customer) => {
    onSelectCustomer(customer);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelectCustomer(null);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Dropdown Selector Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
          error
            ? "border-rose-400 ring-2 ring-rose-500/10"
            : isOpen
            ? "border-orange-500 ring-2 ring-orange-500/10 bg-white"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {selectedCustomer ? (
          <div className="flex items-center justify-between w-full pr-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                {(selectedCustomer.shopName || "C").charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-extrabold text-slate-800 text-xs md:text-sm">
                  {selectedCustomer.shopName}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                  <span>Code: {selectedCustomer.customerCode || "N/A"}</span>
                  <span>•</span>
                  <span>Owner: {selectedCustomer.ownerName || "N/A"}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Clear customer selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm font-medium">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Select or search receiver customer...</span>
          </div>
        )}

        {!selectedCustomer && (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180 text-orange-500" : ""
            }`}
          />
        )}
      </div>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box inside Dropdown */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Search by shop, owner, mobile, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
            {loading ? (
              <div className="p-4 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                <span>Loading customers directory...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-xs font-semibold text-slate-400">
                No customers found matching "{searchTerm}"
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const customerId = c._id || c.id;
                const isSelected = selectedCustomerId === customerId;
                return (
                  <div
                    key={customerId}
                    onClick={() => handleSelect(c)}
                    className={`p-3 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-orange-50/80 text-orange-900 font-bold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{c.shopName}</span>
                        {c.customerCode && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">
                            {c.customerCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-300" />
                          {c.ownerName || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-300" />
                          {c.mobile || "N/A"}
                        </span>
                        {c.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-300" />
                            {c.city}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
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
