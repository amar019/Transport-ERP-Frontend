import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCustomers,
  removeCustomer,
} from "@/store/slices/customerSlice";
import { ROUTES } from "@/constants/paths";

import {
  Users,
  UserCheck,
  UserX,
  MapPin,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Power,
  Store,
  Phone,
  Mail,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CustomerTable() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: rawCustomers, isLoading: loading, error } = useSelector(
    (state) => state.customers
  );

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const customers = useMemo(() => {
    return Array.isArray(rawCustomers) ? rawCustomers : [];
  }, [rawCustomers]);

  // Toast Helper
  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(
      (c) => c.status === "ACTIVE" || c.isActive === true
    ).length;
    const inactive = total - active;
    const cities = new Set(
      customers.map((c) => c.city).filter((city) => Boolean(city))
    ).size;

    return { total, active, inactive, cities };
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        (c.shopName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.ownerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.mobile || "").includes(searchTerm) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.customerCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.city || "").toLowerCase().includes(searchTerm.toLowerCase());

      const isActiveStatus = c.status === "ACTIVE" || c.isActive === true;
      let matchStatus = true;
      if (statusFilter === "ACTIVE") matchStatus = isActiveStatus;
      if (statusFilter === "INACTIVE") matchStatus = !isActiveStatus;

      return matchSearch && matchStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Deactivate handler
  const handleDeactivate = async (customer, e) => {
    e.stopPropagation();
    const id = customer._id || customer.id;
    if (
      window.confirm(
        `Are you sure you want to deactivate ${customer.shopName || "this customer"}?`
      )
    ) {
      const res = await dispatch(removeCustomer(id));
      if (!res.error) {
        showToast("Customer deactivated successfully", "success");
      } else {
        showToast(res.payload || "Failed to deactivate customer", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-orange-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span className="text-sm font-semibold">{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
              Customer Directory
            </h1>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
              {stats.total} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage customer profiles, contact info, and billing addresses
          </p>
        </div>

        <button
          onClick={() => navigate("/customers/add")}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all text-xs md:text-sm select-none cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {/* Card 1: Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Clients
            </p>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 mt-0.5">
              {stats.total}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Accounts
            </p>
            <h3 className="text-xl md:text-2xl font-black text-emerald-600 mt-0.5">
              {stats.active}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inactive Accounts
            </p>
            <h3 className="text-xl md:text-2xl font-black text-slate-500 mt-0.5">
              {stats.inactive}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Cities */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cities Covered
            </p>
            <h3 className="text-xl md:text-2xl font-black text-indigo-600 mt-0.5">
              {stats.cities}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shop, owner, mobile, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all font-medium placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills & Actions */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <div className="bg-slate-200/60 p-1 rounded-xl flex items-center gap-1 text-xs select-none">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-white text-slate-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Inactive
              </button>
            </div>

            <button
              onClick={() => dispatch(fetchCustomers())}
              className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
              title="Refresh Customers"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-orange-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Shop & Owner Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-36 bg-slate-200 rounded-md mb-1.5"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded-md"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-200 rounded-md mb-1.5"></div>
                      <div className="h-3 w-32 bg-slate-100 rounded-md"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 w-24 bg-slate-200 rounded-xl ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                        <Store className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">
                        No Customers Found
                      </h4>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Try adjusting your search query or status filter."
                          : "Get started by adding your first customer profile."}
                      </p>
                      {!searchTerm && statusFilter === "ALL" && (
                        <button
                          onClick={() => navigate("/customers/add")}
                          className="mt-4 inline-flex items-center gap-1.5 bg-orange-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-orange-600 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register New Customer</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isActive =
                    c.status === "ACTIVE" || c.isActive === true;
                  const initial = (c.shopName || "C").charAt(0).toUpperCase();
                  const customerId = c._id || c.id;

                  return (
                    <tr
                      key={customerId}
                      onClick={() => navigate(`/customers/${customerId}`)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/80 group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                          {c.customerCode || "CUS-0000"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                              {c.shopName}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>Owner:</span>
                              <span className="text-slate-600 font-medium">
                                {c.ownerName || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.mobile || "N/A"}</span>
                          </div>
                          {c.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-300" />
                              <span className="truncate max-w-[160px]">
                                {c.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {[c.city, c.state].filter(Boolean).join(", ") ||
                              "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/customers/${customerId}`);
                            }}
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer"
                            title="View Customer Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/customers/edit/${customerId}`);
                            }}
                            className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-slate-200 hover:border-orange-200 transition-all cursor-pointer"
                            title="Edit Customer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {isActive && (
                            <button
                              onClick={(e) => handleDeactivate(c, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                              title="Deactivate Customer"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>
            Showing <b>{filteredCustomers.length}</b> of <b>{stats.total}</b> customers
          </span>
          <span>Transport ERP Masters</span>
        </div>
      </div>
    </div>
  );
}
