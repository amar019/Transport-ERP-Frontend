import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import MemoForm from "../../components/memo/MemoForm";
import { createMemoThunk } from "../../store/thunk/memoThunk";

export default function MemoFormPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSubmitting } = useSelector((state) => state.memos);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateMemo = async (formData) => {
    try {
      const res = await dispatch(createMemoThunk(formData)).unwrap();
      showToast("Memo created successfully!", "success");
      setTimeout(() => {
        navigate(res?._id ? `/memos/${res._id}` : "/memos");
      }, 1000);
    } catch (err) {
      console.error("Failed to create memo:", err);
      showToast(typeof err === "string" ? err : "Failed to create memo", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans antialiased selection:bg-orange-100 select-none">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs md:text-sm font-extrabold">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          type="button"
          onClick={() => navigate("/memos")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs md:text-sm font-bold mb-4 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Memo Management</span>
        </button>

        <div className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Create New Memo / Manifest
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Group booked bilties into a dispatch manifest for transport to another branch.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="max-w-4xl mx-auto">
        <MemoForm onSubmit={handleCreateMemo} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
