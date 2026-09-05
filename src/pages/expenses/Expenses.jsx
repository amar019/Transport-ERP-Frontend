import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  getExpenses,
  createExpense,
  updateExpense,
  cancelExpense,
} from "@/services/expense.service";
import { EXPENSE_CATEGORIES } from "@/constants/EXPENSE_CATEGORIES";
import {
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  IndianRupee,
  Pencil,
  Trash2,
  X,
  Receipt,
  Tag,
  ChevronRight,
  Search,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function ExpensesPage() {
  // Main Data States
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    category: "ALL",
    startDate: "",
    endDate: "",
  });

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "FUEL",
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  // Helper for Toast alerts
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 1. Fetch Expenses from API
  const fetchExpensesList = useCallback(async () => {
    setLoading(true);
    setLocalError(null);
    try {
      const activeParams = {};
      if (filters.category && filters.category !== "ALL") activeParams.category = filters.category;
      if (filters.startDate) activeParams.startDate = filters.startDate;
      if (filters.endDate) activeParams.endDate = filters.endDate;

      const res = await getExpenses(activeParams);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setExpenses(list);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setLocalError(err.response?.data?.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchExpensesList();
  }, [fetchExpensesList]);

  // 2. Client-side Search Filtering
  const filteredExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return [];

    return expenses.filter((item) => {
      const q = (filters.search || "").toLowerCase().trim();
      const desc = (item.description || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();
      const userStr = (item.createdBy?.name || item.createdBy?.username || "").toLowerCase();
      const amountStr = String(item.amount || "");

      const matchSearch =
        !q ||
        desc.includes(q) ||
        cat.includes(q) ||
        userStr.includes(q) ||
        amountStr.includes(q);

      return matchSearch;
    });
  }, [expenses, filters.search]);

  // 3. Dynamic KPI Summary Metrics Calculation
  const kpiMetrics = useMemo(() => {
    if (!Array.isArray(expenses)) {
      return { totalAmount: 0, todayAmount: 0, count: 0, topCategory: "N/A" };
    }

    const todayStr = new Date().toDateString();
    let totalAmount = 0;
    let todayAmount = 0;
    const categoryCounts = {};

    expenses.forEach((exp) => {
      const amt = Number(exp.amount) || 0;
      totalAmount += amt;

      const expDate = exp.expenseDate || exp.createdAt;
      if (expDate && new Date(expDate).toDateString() === todayStr) {
        todayAmount += amt;
      }

      if (exp.category) {
        categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + amt;
      }
    });

    let topCategory = "N/A";
    let maxCatAmt = 0;
    Object.entries(categoryCounts).forEach(([cat, catTotal]) => {
      if (catTotal > maxCatAmt) {
        maxCatAmt = catTotal;
        topCategory = cat;
      }
    });

    return { totalAmount, todayAmount, count: expenses.length, topCategory };
  }, [expenses]);

  // 4. Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      category: "FUEL",
      amount: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category || "FUEL",
      amount: expense.amount || "",
      description: expense.description || "",
      expenseDate: expense.expenseDate
        ? new Date(expense.expenseDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (editingExpense) {
        await updateExpense(editingExpense._id, payload);
        showToast("Expense record updated successfully", "success");
      } else {
        await createExpense(payload);
        showToast("Expense record created successfully", "success");
      }

      closeModal();
      fetchExpensesList();
    } catch (err) {
      console.error("Expense operation failed:", err);
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Handler
  const handleCancelExpense = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this expense record?")) return;

    try {
      await cancelExpense(id);
      showToast("Expense cancelled successfully", "success");
      fetchExpensesList();
    } catch (err) {
      console.error("Failed to cancel expense:", err);
      showToast(err.response?.data?.message || "Failed to cancel expense", "error");
    }
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredExpenses.length === 0) {
      showToast("No data to export", "info");
      return;
    }

    const headers = ["Date", "Category", "Amount (INR)", "Description", "Created By", "Status"];
    const rows = filteredExpenses.map((e) => [
      `"${e.expenseDate ? new Date(e.expenseDate).toLocaleDateString("en-IN") : ""}"`,
      `"${e.category || ""}"`,
      e.amount || 0,
      `"${(e.description || "").replace(/"/g, '""')}"`,
      `"${e.createdBy?.name || e.createdBy?.username || ""}"`,
      `"${e.status || "ACTIVE"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expenses_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Expenses exported to CSV", "success");
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "ALL",
      startDate: "",
      endDate: "",
    });
  };

  // Currency Formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Category Color Badge System
  const getCategoryBadgeClass = (category) => {
    const colors = {
      FUEL: "bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]",
      TOLL: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
      REPAIR: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
      MAINTENANCE: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]",
      DRIVER_EXPENSE: "bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]",
      LOADING: "bg-[#ECFEFF] text-[#0E7490] border-[#A5F3FC]",
      OFFICE_EXPENSE: "bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]",
      OFFICE_RENT: "bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]",
      SALARY: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
      OTHER: "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]",
    };
    return colors[category] || "bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]";
  };

  // Quick Segment Tabs
  const quickCategoryTabs = [
    { label: "All Expenses", value: "ALL" },
    { label: "Fuel", value: "FUEL" },
    { label: "Toll", value: "TOLL" },
    { label: "Repair", value: "REPAIR" },
    { label: "Salaries", value: "SALARY" },
    { label: "Driver Expense", value: "DRIVER_EXPENSE" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] space-y-6">
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
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
            <span>Expenses</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Overview</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-bold !text-[#0F172A] tracking-tight leading-tight m-0 p-0" style={{ color: "#0F172A" }}>
              Expense Management
            </h1>
          </div>
          <p className="text-xs text-[#64748B] font-normal">
            Record, filter, and monitor all branch operating expenses
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchExpensesList}
            disabled={loading}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-white bg-white rounded-lg border border-[#E2E8F0] shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Expenses"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F97316]" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0F172A] bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Export Expenses to CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-4 py-2 rounded-lg shadow-2xs transition-colors text-xs select-none cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* STATISTICS METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Expense */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(kpiMetrics.totalAmount)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Accumulated expenses
            </span>
          </div>
        </div>

        {/* Card 2: Today's Expense */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Today's Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight font-mono block">
              {formatCurrency(kpiMetrics.todayAmount)}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Recorded today
            </span>
          </div>
        </div>

        {/* Card 3: Top Spend Category */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Top Spend Category
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#0F172A] tracking-tight block truncate">
              {kpiMetrics.topCategory}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Highest expenditure category
            </span>
          </div>
        </div>

        {/* Card 4: Total Records */}
        <div className="bg-white p-4.5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Entries
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#0F172A] tracking-tight block">
              {kpiMetrics.count}
            </span>
            <span className="text-xs text-[#64748B] font-normal block mt-0.5">
              Active expense transactions
            </span>
          </div>
        </div>
      </div>

      {/* SEGMENTED CONTROL QUICK CATEGORY TABS */}
      <div>
        <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1 overflow-x-auto max-w-full">
          {quickCategoryTabs.map((tab) => {
            const isActive = filters.category === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: tab.value }))}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {localError && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center justify-between text-[#DC2626] text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{localError}</span>
          </div>
          <button onClick={() => setLocalError(null)} className="text-[#DC2626] hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILTER TOOLBAR SECTION */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search description, category..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* All Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Toolbar Reset Button */}
        {(filters.search || filters.category !== "ALL" || filters.startDate || filters.endDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs font-medium text-[#F97316] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ENTERPRISE EXPENSES TABLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#64748B] flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#F97316]" />
            <p className="text-xs font-medium">Fetching expense records...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] flex flex-col items-center justify-center gap-2">
            <Receipt className="w-10 h-10 text-[#94A3B8]" />
            <p className="font-bold text-[#0F172A] text-sm">No expenses found</p>
            <p className="text-xs text-[#64748B]">Try adjusting your search criteria or create a new expense entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Expense Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Created By</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredExpenses.map((item) => (
                  <tr key={item._id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#0F172A] font-medium">
                      {item.expenseDate ? new Date(item.expenseDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getCategoryBadgeClass(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-[#0F172A]">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-[#64748B] max-w-xs truncate">
                      {item.description || "-"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-[#64748B] font-medium">
                      {item.createdBy?.name || item.createdBy?.username || "-"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded-lg transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancelExpense(item._id)}
                        className="p-1.5 text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                        title="Cancel Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="font-bold text-[#0F172A] text-base">
                  {editingExpense ? "Edit Expense Entry" : "Record New Expense"}
                </h3>
                <p className="text-xs text-[#64748B]">Fill in the details to save branch operational costs.</p>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[#94A3B8] font-bold">₹</span>
                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="any"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    className="w-full text-xs font-mono font-semibold text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg pl-7 pr-3 py-2.5 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mb-1">
                  Description / Notes
                </label>
                <textarea
                  name="description"
                  rows="3"
                  maxLength="500"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter details like vehicle number, receipt notes, vendor..."
                  className="w-full text-xs font-medium text-[#0F172A] bg-white border border-[#E2E8F0] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none shadow-2xs"
                ></textarea>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold border border-[#E2E8F0] text-[#0F172A] bg-white hover:bg-[#F8FAFC] rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg shadow-2xs disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingExpense ? "Save Changes" : "Create Record"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
