import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchCustomers,
  removeCustomer,
  activateCustomerThunk,
} from "@/store/slices/customerSlice";
import { confirmAction } from "@/utils/swal";
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
  ChevronRight,
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
    const isConfirmed = await confirmAction({
      title: "Deactivate Customer?",
      text: `Are you sure you want to deactivate ${customer.shopName || "this customer"}?`,
      icon: "warning",
      confirmButtonText: "Yes, Deactivate",
      cancelButtonText: "Keep Active",
      isDanger: true,
    });

    if (isConfirmed) {
      const res = await dispatch(removeCustomer(id));
      if (!res.error) {
        showToast("Customer deactivated successfully", "success");
      } else {
        showToast(res.payload || "Failed to deactivate customer", "error");
      }
    }
  };

  // Activate handler
  const handleActivate = async (customer, e) => {
    e.stopPropagation();
    const id = customer._id || customer.id;
    const isConfirmed = await confirmAction({
      title: "Activate Customer?",
      text: `Are you sure you want to activate ${customer.shopName || "this customer"}?`,
      icon: "question",
      confirmButtonText: "Yes, Activate",
      cancelButtonText: "Cancel",
      isDanger: false,
    });

    if (isConfirmed) {
      const res = await dispatch(activateCustomerThunk(id));
      if (!res.error) {
        showToast("Customer activated successfully", "success");
      } else {
        showToast(res.payload || "Failed to activate customer", "error");
      }
    }
  };

  const statusTabs = [
    { label: "All Clients", value: "ALL", count: stats.total },
    { label: "Active", value: "ACTIVE", count: stats.active },
    { label: "Inactive", value: "INACTIVE", count: stats.inactive },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
              : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        {/* Left: Breadcrumbs + Title + Subtitle */}
        <div className="space-y-1">
          {/* Small Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Customers</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Directory</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
              Customers
            </h1>
            <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
              {stats.total} Registered
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Manage customer profiles, contact information, and billing master records
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => dispatch(fetchCustomers())}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Customers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>

          {/* Primary Action: + Register New Customer */}
          <button
            type="button"
            onClick={() => navigate("/customers/add")}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Register New Customer</span>
          </button>
        </div>
      </div>

      {/* 2. STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Card 1: Total Clients */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Clients
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.total}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Registered customer profiles
            </span>
          </div>
        </div>

        {/* Card 2: Active Accounts */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Active Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.active}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Verified active accounts
            </span>
          </div>
        </div>

        {/* Card 3: Inactive Accounts */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Inactive Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.inactive}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Deactivated profiles
            </span>
          </div>
        </div>

        {/* Card 4: Cities Covered */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Cities Covered
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.cities}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Coverage locations
            </span>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED CONTROL STATUS TABS */}
      <div className="no-print">
        <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1 overflow-x-auto">
          {statusTabs.map((tab) => {
            const isTabActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  isTabActive
                    ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isTabActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200/70 text-[#475569]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FILTER TOOLBAR & SEARCH */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shop, owner, mobile, code, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between text-[#DC2626] text-xs font-medium no-print">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
            <span>{typeof error === "string" ? error : "Unable to load customer directory."}</span>
          </div>
        </div>
      )}

      {/* 5. ENTERPRISE DATA TABLE */}
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col select-none overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[850px] lg:min-w-full">
            {/* Sticky Table Header */}
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] select-none sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 whitespace-nowrap w-[110px]">Code</th>
                <th className="py-3 px-4 min-w-[220px]">Customer / Shop Name</th>
                <th className="py-3 px-4 min-w-[180px]">Contact Info</th>
                <th className="py-3 px-4 whitespace-nowrap w-[140px]">Location</th>
                <th className="py-3 px-4 whitespace-nowrap w-[110px]">Status</th>
                <th className="py-3 px-4 text-right whitespace-nowrap w-[120px]">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {loading ? (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-36 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-24 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-28 bg-slate-200 rounded mb-1"></div>
                      <div className="h-3 w-32 bg-slate-100 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4.5 w-16 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-6 w-20 bg-slate-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-2.5 border border-[#FFEDD5]">
                        <Store className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-[#0F172A] text-sm">
                        No customers found
                      </h4>
                      <p className="text-[#64748B] text-xs mt-1 leading-relaxed font-normal">
                        {searchTerm || statusFilter !== "ALL"
                          ? "Try adjusting your search query or status filter."
                          : "Get started by adding your first customer profile."}
                      </p>
                      {!searchTerm && statusFilter === "ALL" && (
                        <button
                          type="button"
                          onClick={() => navigate("/customers/add")}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Register New Customer</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const isActive = c.status === "ACTIVE" || c.isActive === true;
                  const customerId = c._id || c.id;

                  return (
                    <tr
                      key={customerId}
                      onClick={() => navigate(`/customers/${customerId}`)}
                      className="hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    >
                      {/* 1. Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold bg-[#F1F5F9] text-[#0F172A] px-2 py-0.5 rounded-md border border-[#E2E8F0] group-hover:bg-[#FFF7ED] group-hover:text-[#C2410C] group-hover:border-[#FFEDD5] transition-colors">
                          {c.customerCode || "CUS-0000"}
                        </span>
                      </td>

                      {/* 2. Customer Shop & Owner */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F172A] text-xs group-hover:text-[#C2410C] transition-colors">
                          {c.shopName}
                        </div>
                        {c.ownerName && (
                          <div className="text-[11px] text-[#64748B] font-normal mt-0.5">
                            Owner: <span className="text-[#334155] font-medium">{c.ownerName}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#0F172A] text-xs">
                          <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>{c.mobile || "N/A"}</span>
                        </div>
                        {c.email && (
                          <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-normal mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                            <span className="truncate max-w-[160px]">{c.email}</span>
                          </div>
                        )}
                      </td>

                      {/* 4. Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[#475569] font-medium text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                          <span>{[c.city, c.state].filter(Boolean).join(", ") || "N/A"}</span>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            isActive
                              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                              : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-[#059669]" : "bg-[#94A3B8]"
                            }`}
                          />
                          {isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>

                      {/* 6. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => navigate(`/customers/${customerId}`)}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                            title="View Customer Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/customers/edit/${customerId}`)}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                            title="Edit Customer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {isActive ? (
                            <button
                              type="button"
                              onClick={(e) => handleDeactivate(c, e)}
                              className="p-1.5 text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg border border-[#E2E8F0] hover:border-[#FECACA] transition-colors cursor-pointer"
                              title="Deactivate Customer"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleActivate(c, e)}
                              className="p-1.5 text-[#059669] bg-[#ECFDF5] hover:bg-[#A7F3D0]/30 rounded-lg border border-[#A7F3D0] transition-colors cursor-pointer"
                              title="Activate Customer"
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

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-[#64748B] font-medium select-none">
          <span>
            Showing <b className="text-[#0F172A]">{filteredCustomers.length}</b> of <b className="text-[#0F172A]">{stats.total}</b> customers
          </span>
          <span>Transport ERP Master Directory</span>
        </div>
      </div>
    </div>
  );
}

