import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBranches,
  createBranch,
  updateBranch,
  deactivateBranch,
} from "@/services/branch.service";
import { confirmAction } from "@/utils/swal";
import {
  Building,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Store,
  Truck,
  Layers,
  X,
  Save,
  Loader2,
} from "lucide-react";

export default function BranchListPage() {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL | BOOKING | DELIVERY
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | ACTIVE | INACTIVE

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null); // null for create
  const [modalData, setModalData] = useState({
    name: "",
    type: "BOOKING",
    status: "ACTIVE",
  });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    fetchBranchesList();
  }, []);

  const fetchBranchesList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBranches();
      const list = Array.isArray(res) ? res : res.data || [];
      setBranches(list);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branch directory.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = branches.length;
    const bookingCount = branches.filter((b) => b.type === "BOOKING").length;
    const deliveryCount = branches.filter((b) => b.type === "DELIVERY").length;
    const activeCount = branches.filter((b) => b.status === "ACTIVE").length;
    return { total, bookingCount, deliveryCount, activeCount };
  }, [branches]);

  // Filtered List
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchSearch = (b.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      let matchType = true;
      if (typeFilter !== "ALL") matchType = b.type === typeFilter;
      let matchStatus = true;
      if (statusFilter !== "ALL") matchStatus = b.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [branches, searchTerm, typeFilter, statusFilter]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingBranch(null);
    setModalData({ name: "", type: "BOOKING", status: "ACTIVE" });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch, e) => {
    e.stopPropagation();
    setEditingBranch(branch);
    setModalData({
      name: branch.name || "",
      type: branch.type || "BOOKING",
      status: branch.status || "ACTIVE",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!modalData.name.trim()) {
      setModalError("Branch name is required");
      return;
    }

    setModalSubmitting(true);
    try {
      if (editingBranch) {
        const id = editingBranch._id || editingBranch.id;
        await updateBranch(id, modalData);
        showToast("Branch updated successfully!", "success");
      } else {
        await createBranch(modalData);
        showToast("New branch created successfully!", "success");
      }
      setIsModalOpen(false);
      fetchBranchesList();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to save branch");
    } finally {
      setModalSubmitting(false);
    }
  };

  // Deactivate / Activate Toggle Handler
  const handleToggleStatus = async (branch, e) => {
    e.stopPropagation();
    const id = branch._id || branch.id;
    const isActive = branch.status === "ACTIVE";

    const isConfirmed = await confirmAction({
      title: isActive ? "Deactivate Branch?" : "Activate Branch?",
      text: `Are you sure you want to ${isActive ? "deactivate" : "activate"} ${branch.name}?`,
      icon: isActive ? "warning" : "question",
      confirmButtonText: isActive ? "Yes, Deactivate" : "Yes, Activate",
      cancelButtonText: "Cancel",
      isDanger: isActive,
    });

    if (isConfirmed) {
      try {
        if (isActive) {
          await deactivateBranch(id);
          showToast("Branch deactivated successfully", "success");
        } else {
          await updateBranch(id, { status: "ACTIVE" });
          showToast("Branch activated successfully", "success");
        }
        fetchBranchesList();
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to update branch status", "error");
      }
    }
  };

  const statusTabs = [
    { label: "All Hubs", typeFilter: "ALL", statusFilter: "ALL", count: stats.total },
    { label: "Booking Hubs", typeFilter: "BOOKING", statusFilter: "ALL", count: stats.bookingCount },
    { label: "Delivery Hubs", typeFilter: "DELIVERY", statusFilter: "ALL", count: stats.deliveryCount },
    { label: "Active", typeFilter: "ALL", statusFilter: "ACTIVE", count: stats.activeCount },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none flex flex-col flex-1 space-y-6">
      {/* Toast Notification */}
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

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Masters</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Branches</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
              Branch Directory
            </h1>
            <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-[11px] font-semibold px-2.5 py-0.5 rounded-md shrink-0">
              {stats.total} Total Hubs
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Manage transport booking and delivery hubs across all operational network locations
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchBranchesList}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Branches"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Branch</span>
          </button>
        </div>
      </div>

      {/* KPI STATISTICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Card 1: Total Branches */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Branches
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.total}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Registered operational hubs
            </span>
          </div>
        </div>

        {/* Card 2: Booking Hubs */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Booking Hubs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.bookingCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Consignment origin centers
            </span>
          </div>
        </div>

        {/* Card 3: Delivery Hubs */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Delivery Hubs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.deliveryCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Destination payout centers
            </span>
          </div>
        </div>

        {/* Card 4: Active Hubs */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Active Branches
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {stats.activeCount}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Fully operational locations
            </span>
          </div>
        </div>
      </div>

      {/* SEGMENTED STATUS & TYPE TABS */}
      <div className="no-print">
        <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1 overflow-x-auto">
          {statusTabs.map((tab, idx) => {
            const isTabActive =
              typeFilter === tab.typeFilter && statusFilter === tab.statusFilter;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTypeFilter(tab.typeFilter);
                  setStatusFilter(tab.statusFilter);
                }}
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

      {/* SEARCH TOOLBAR */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branch by name..."
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

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-3 text-[#DC2626] text-xs font-medium no-print">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
          <span>{error}</span>
        </div>
      )}

      {/* ENTERPRISE DATA TABLE */}
      <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col select-none overflow-hidden">
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full text-left border-collapse min-w-[700px] lg:min-w-full">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] select-none sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 min-w-[220px]">Branch Name</th>
                <th className="py-3 px-4 whitespace-nowrap w-[150px]">Branch Type</th>
                <th className="py-3 px-4 whitespace-nowrap w-[120px]">Status</th>
                <th className="py-3 px-4 whitespace-nowrap w-[160px]">Created Date</th>
                <th className="py-3 px-4 text-right whitespace-nowrap w-[120px]">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-36 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-20 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-16 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-6 w-16 bg-slate-200 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 px-4 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center mb-2.5 border border-[#FFEDD5]">
                        <Building className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-[#0F172A] text-sm">
                        No branches found
                      </h4>
                      <p className="text-[#64748B] text-xs mt-1 leading-relaxed font-normal">
                        {searchTerm || typeFilter !== "ALL" || statusFilter !== "ALL"
                          ? "Try adjusting your search filters."
                          : "Get started by adding your first operational branch location."}
                      </p>
                      {!searchTerm && typeFilter === "ALL" && statusFilter === "ALL" && (
                        <button
                          type="button"
                          onClick={handleOpenCreateModal}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold text-xs rounded-lg shadow-2xs cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Create New Branch</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const isActive = branch.status === "ACTIVE";
                  const isBooking = branch.type === "BOOKING";

                  return (
                    <tr
                      key={branch._id || branch.id}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      {/* Branch Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#0F172A] text-xs flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#94A3B8] shrink-0" />
                          <span>{branch.name}</span>
                        </div>
                      </td>

                      {/* Branch Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                            isBooking
                              ? "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]"
                              : "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                          }`}
                        >
                          {isBooking ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                          {branch.type}
                        </span>
                      </td>

                      {/* Status Badge */}
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

                      {/* Created Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#64748B] font-medium text-xs">
                        {branch.createdAt
                          ? new Date(branch.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(branch, e)}
                            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] transition-colors cursor-pointer"
                            title="Edit Branch"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(branch, e)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isActive
                                ? "text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] border-[#E2E8F0] hover:border-[#FECACA]"
                                : "text-[#059669] bg-[#ECFDF5] hover:bg-[#A7F3D0]/30 border-[#A7F3D0]"
                            }`}
                            title={isActive ? "Deactivate Branch" : "Activate Branch"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
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
            Showing <b className="text-[#0F172A]">{filteredBranches.length}</b> of <b className="text-[#0F172A]">{stats.total}</b> branches
          </span>
          <span>Transport ERP Network Master</span>
        </div>
      </div>

      {/* CREATE / EDIT BRANCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-base">
                    {editingBranch ? "Edit Branch Location" : "Create New Branch"}
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    {editingBranch
                      ? "Update operational branch parameters"
                      : "Register a new booking or delivery hub location"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Error Alert */}
            {modalError && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-2 text-[#DC2626] text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Branch Name */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                  Branch Name <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahilyanagar Main / Jamkhed Hub"
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] transition-colors"
                />
              </div>

              {/* Branch Type Radio Segment */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                  Branch Operational Type <span className="text-[#DC2626]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 select-none">
                  <button
                    type="button"
                    onClick={() => setModalData({ ...modalData, type: "BOOKING" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      modalData.type === "BOOKING"
                        ? "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5] shadow-2xs"
                        : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>BOOKING Hub</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalData({ ...modalData, type: "DELIVERY" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      modalData.type === "DELIVERY"
                        ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] shadow-2xs"
                        : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>DELIVERY Hub</span>
                  </button>
                </div>
              </div>

              {/* Status Toggle (if editing) */}
              {editingBranch && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                    Account Status
                  </label>
                  <div className="grid grid-cols-2 gap-2 select-none">
                    <button
                      type="button"
                      onClick={() => setModalData({ ...modalData, status: "ACTIVE" })}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        modalData.status === "ACTIVE"
                          ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                          : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                      }`}
                    >
                      ACTIVE
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalData({ ...modalData, status: "INACTIVE" })}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        modalData.status === "INACTIVE"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                          : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                      }`}
                    >
                      INACTIVE
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs cursor-pointer disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 stroke-[2.5]" />
                      <span>{editingBranch ? "Save Changes" : "Create Branch"}</span>
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
