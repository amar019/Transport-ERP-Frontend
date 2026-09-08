import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  getDeliveryBoys,
  createDeliveryBoy,
  updateDeliveryBoy,
  deactivateDeliveryBoy,
} from "@/services/deliveryBoy.service";
import { confirmAction } from "@/utils/swal";
import {
  Plus,
  RefreshCw,
  FileSpreadsheet,
  UserCheck,
  Pencil,
  Power,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  Search,
  X,
  User,
  Phone,
  Building2,
  ShieldAlert,
  Loader2,
  CheckSquare,
  Clock,
  Save,
} from "lucide-react";

export default function DeliveryBoyListPage() {
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    status: "ALL", // ALL | ACTIVE | INACTIVE
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null for create
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    status: "ACTIVE",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Toast helper
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch Delivery Boys Data
  const loadDeliveryBoys = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDeliveryBoys();
      const list = res.data || (Array.isArray(res) ? res : []);
      setDeliveryBoys(list);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load delivery boys directory."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveryBoys();
  }, [loadDeliveryBoys]);

  // KPI Summary Metrics Calculation
  const kpiMetrics = useMemo(() => {
    const total = deliveryBoys.length;
    const active = deliveryBoys.filter((d) => d.status === "ACTIVE").length;
    const inactive = deliveryBoys.filter((d) => d.status === "INACTIVE").length;
    return { total, active, inactive };
  }, [deliveryBoys]);

  // Client-side Filter Logic
  const filteredDeliveryBoys = useMemo(() => {
    return deliveryBoys.filter((d) => {
      const q = (filters.search || "").toLowerCase().trim();
      const matchSearch =
        !q ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.mobile || "").toLowerCase().includes(q) ||
        (d.branch?.name || "").toLowerCase().includes(q) ||
        (d.branch?.code || "").toLowerCase().includes(q);

      const matchStatus =
        filters.status === "ALL" || d.status === filters.status;

      return matchSearch && matchStatus;
    });
  }, [deliveryBoys, filters]);

  // Status Tab Definitions
  const statusTabs = [
    { label: "All Personnel", value: "ALL", count: kpiMetrics.total },
    { label: "Active", value: "ACTIVE", count: kpiMetrics.active },
    { label: "Inactive", value: "INACTIVE", count: kpiMetrics.inactive },
  ];

  // Modal Open Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: "", mobile: "", status: "ACTIVE" });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item, e) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      mobile: item.mobile || "",
      status: item.status || "ACTIVE",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Modal Form Submission
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const nameTrimmed = formData.name.trim();
    const mobileTrimmed = formData.mobile.trim();

    if (!nameTrimmed) {
      setModalError("Delivery boy name is required");
      return;
    }

    if (!mobileTrimmed) {
      setModalError("Mobile number is required");
      return;
    }

    if (!/^\d{10}$/.test(mobileTrimmed)) {
      setModalError("Mobile number must be exactly 10 digits");
      return;
    }

    setModalSubmitting(true);

    try {
      if (editingItem) {
        // Update Delivery Boy
        const payload = {
          name: nameTrimmed,
          mobile: mobileTrimmed,
          status: formData.status,
        };
        const res = await updateDeliveryBoy(editingItem._id, payload);
        const updated = res.data || res;

        setDeliveryBoys((prev) =>
          prev.map((item) => (item._id === editingItem._id ? updated : item))
        );

        showToast("Delivery boy updated successfully", "success");
      } else {
        // Create Delivery Boy
        const payload = {
          name: nameTrimmed,
          mobile: mobileTrimmed,
        };
        const res = await createDeliveryBoy(payload);
        const created = res.data || res;

        setDeliveryBoys((prev) => [created, ...prev]);
        showToast("Delivery boy registered successfully", "success");
      }

      setIsModalOpen(false);
    } catch (err) {
      setModalError(
        err.response?.data?.message || "Failed to save delivery boy details."
      );
    } finally {
      setModalSubmitting(false);
    }
  };

  // Status Deactivation / Re-activation Action Handler
  const handleToggleDeactivate = async (item, e) => {
    e.stopPropagation();

    if (item.status === "INACTIVE") {
      const confirmed = await confirmAction({
        title: "Activate Delivery Boy?",
        text: `Are you sure you want to set ${item.name} to ACTIVE status?`,
        confirmButtonText: "Yes, Activate",
        icon: "question",
      });

      if (!confirmed) return;

      try {
        const res = await updateDeliveryBoy(item._id, { status: "ACTIVE" });
        const updated = res.data || res;
        setDeliveryBoys((prev) =>
          prev.map((d) => (d._id === item._id ? updated : d))
        );
        showToast("Delivery boy activated successfully", "success");
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to activate delivery boy",
          "error"
        );
      }
    } else {
      const confirmed = await confirmAction({
        title: "Deactivate Delivery Boy?",
        text: `Are you sure you want to deactivate ${item.name}?`,
        confirmButtonText: "Yes, Deactivate",
        isDanger: true,
        icon: "warning",
      });

      if (!confirmed) return;

      try {
        const res = await deactivateDeliveryBoy(item._id);
        const updated = res.data || res;
        setDeliveryBoys((prev) =>
          prev.map((d) => (d._id === item._id ? updated : d))
        );
        showToast("Delivery boy deactivated successfully", "success");
      } catch (err) {
        showToast(
          err.response?.data?.message || "Failed to deactivate delivery boy",
          "error"
        );
      }
    }
  };

  // Export to CSV / Excel Helper
  const handleExportCsv = () => {
    if (filteredDeliveryBoys.length === 0) {
      showToast("No data available to export", "info");
      return;
    }

    const headers = [
      "Name",
      "Mobile Number",
      "Branch",
      "Branch Code",
      "Status",
      "Registered Date",
    ];

    const rows = filteredDeliveryBoys.map((d) => [
      `"${d.name || ""}"`,
      `"${d.mobile || ""}"`,
      `"${d.branch?.name || ""}"`,
      `"${d.branch?.code || ""}"`,
      `"${d.status || ""}"`,
      `"${d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN") : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Delivery_Boys_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Delivery boys directory exported to CSV", "success");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
              : toast.type === "error"
              ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
              : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          ) : toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[#2563EB] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* PAGE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Breadcrumbs + Title + Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Masters</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Delivery Boys</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
              Delivery Boys
            </h1>
            <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md flex items-center gap-1 shrink-0 whitespace-nowrap">
              <UserCheck className="w-3.5 h-3.5 text-[#F97316]" />
              {kpiMetrics.total} Total
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Manage and assign delivery personnel for local transport operations
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadDeliveryBoys}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin text-[#F97316]" : ""}`}
            />
          </button>

          {/* Export Excel / CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Export Directory to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          {/* Primary Action Button: + Add Delivery Boy */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Delivery Boy</span>
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Personnel */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Personnel
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiMetrics.total}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Registered in your branch
            </span>
          </div>
        </div>

        {/* Card 2: Active Personnel */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#059669]">
              Active Personnel
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#059669] tracking-tight block">
              {kpiMetrics.active}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Available for parcel assignments
            </span>
          </div>
        </div>

        {/* Card 3: Inactive Personnel */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Inactive Personnel
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#475569] tracking-tight block">
              {kpiMetrics.inactive}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Deactivated accounts
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS & CONTROL CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-4 space-y-4">
        {/* Quick Status Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#E2E8F0] pb-3 overflow-x-auto">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilters({ ...filters, status: tab.value })}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#0F172A] text-white shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by delivery boy name or 10-digit mobile..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316] transition-all placeholder:text-[#94A3B8]"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filters.search && (
            <button
              onClick={() => setFilters({ ...filters, search: "" })}
              className="text-xs font-semibold text-[#F97316] hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDeliveryBoys}
            className="underline text-xs font-bold hover:text-[#991B1B]"
          >
            Retry
          </button>
        </div>
      )}

      {/* DATA TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#F97316] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#64748B]">
              Loading delivery boys directory...
            </p>
          </div>
        ) : filteredDeliveryBoys.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">
              No delivery boys found
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              {filters.search || filters.status !== "ALL"
                ? "No personnel match your search or filter options."
                : "Add your branch's first delivery boy to get started."}
            </p>
            {(filters.search || filters.status !== "ALL") && (
              <button
                onClick={() => setFilters({ search: "", status: "ALL" })}
                className="text-xs font-semibold text-[#F97316] hover:underline pt-1 inline-block"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-extrabold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Mobile Number</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium text-[#0F172A]">
                {filteredDeliveryBoys.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-[#F8FAFC]/80 transition-colors group"
                  >
                    {/* Delivery Boy Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] flex items-center justify-center font-bold text-xs shrink-0">
                          {item.name ? item.name.charAt(0).toUpperCase() : "D"}
                        </div>
                        <div>
                          <p className="font-bold text-[#0F172A] group-hover:text-[#F97316] transition-colors">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mobile Number */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[#334155]">
                        <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className="font-mono text-xs">{item.mobile}</span>
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span className="font-semibold text-[#0F172A]">
                          {item.branch?.name || "N/A"}
                        </span>
                        {item.branch?.code && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#F1F5F9] text-[#64748B] font-bold">
                            {item.branch.code}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {item.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
                          INACTIVE
                        </span>
                      )}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3 px-4 text-[#64748B]">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(item, e)}
                          title="Edit Details"
                          className="p-1.5 text-[#64748B] hover:text-[#F97316] hover:bg-[#FFF7ED] rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleToggleDeactivate(item, e)}
                          title={
                            item.status === "ACTIVE"
                              ? "Deactivate Account"
                              : "Activate Account"
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            item.status === "ACTIVE"
                              ? "text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                              : "text-[#059669] hover:bg-[#ECFDF5]"
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-md overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#F97316]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    {editingItem ? "Edit Delivery Boy" : "Add New Delivery Boy"}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-medium">
                    {editingItem
                      ? "Update delivery personnel profile"
                      : "Register new delivery boy for your branch"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#334155]">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Mobile Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#334155]">
                  Mobile Number <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={formData.mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, mobile: val });
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Status Select (only in Edit mode) */}
              {editingItem && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#334155]">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs font-medium bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalSubmitting}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>
                        {editingItem ? "Save Changes" : "Create Delivery Boy"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
