import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import MemoForm from "@/components/memo/MemoForm";
import { createMemoThunk } from "@/store/slices/memoSlice";
import { ROUTES } from "@/constants/paths";

export const MemoFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
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
        navigate(res?._id ? ROUTES.MEMOS.DETAILS(res._id) : ROUTES.MEMOS.LIST);
      }, 1000);
    } catch (err) {
      console.error("Failed to create memo:", err);
      showToast(typeof err === "string" ? err : "Failed to create memo", "error");
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 p-3.5 md:p-6 font-sans antialiased selection:bg-orange-100 select-none pb-16 space-y-4 max-w-[1400px] mx-auto">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${toast.type === "success"
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
      <div className="w-full mb-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.MEMOS.LIST)}
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-orange-600 text-xs font-semibold mb-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Memo Management</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
              <Truck className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                  Create  Memo
                </h4>

                <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {user?.branch?.name || "Ahmednagar Booking"}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Group consignments into a dispatch manifest.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className="w-full">
        <MemoForm onSubmit={handleCreateMemo} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default MemoFormPage;
