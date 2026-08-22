import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Package,
  IndianRupee,
  FileText,
  Printer,
  Trash2,
  Check,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { createPortal } from "react-dom";
import MemoStatusBadge from "@/components/memo/MemoStatusBadge";
import {
  fetchMemoById,
  deleteMemoThunk,
  markMemoOnRouteThunk,
  markMemoReceivedThunk,
  updateMemoCollectionThunk,
} from "@/store/slices/memoSlice";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { ROUTES } from "@/constants/paths";

export const MemoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { currentMemo: memo, isLoading, error } = useSelector((state) => state.memos);

  const [toast, setToast] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [settlementAmount, setSettlementAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isBookingBranch = user?.branch?.type === "BOOKING";
  const isDeliveryBranch = user?.branch?.type === "DELIVERY";

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchMemoById(id));
    }
  }, [id, dispatch]);

  // Actions
  const handleConfirmDispatch = async () => {
    try {
      setActionLoading(true);
      await dispatch(markMemoOnRouteThunk(id)).unwrap();
      showToast("Memo dispatched on route!", "success");
      setDispatchModalOpen(false);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to dispatch memo", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReceive = async () => {
    try {
      setActionLoading(true);
      await dispatch(markMemoReceivedThunk(id)).unwrap();
      showToast("Memo marked as received!", "success");
      setReceiveModalOpen(false);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to receive memo", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setActionLoading(true);
      await dispatch(deleteMemoThunk(id)).unwrap();
      showToast("Memo deleted successfully", "success");
      setDeleteModalOpen(false);
      setTimeout(() => {
        navigate(ROUTES.MEMOS.LIST);
      }, 1000);
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to delete memo", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCollection = async (e) => {
    e.preventDefault();
    const amount = Number(settlementAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    try {
      setActionLoading(true);
      await dispatch(
        updateMemoCollectionThunk({
          id,
          amountReceived: amount,
        })
      ).unwrap();
      showToast("Settlement recorded successfully", "success");
      setCollectionModalOpen(false);
      setSettlementAmount("");
    } catch (err) {
      showToast(typeof err === "string" ? err : "Failed to record settlement", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span>Loading memo manifest...</span>
        </div>
      </div>
    );
  }

  if (!memo || error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(ROUTES.MEMOS.LIST)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Memos
        </button>

        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-slate-800">Memo Not Found</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 mb-4">
            {typeof error === "string" ? error : "The requested memo could not be loaded."}
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.MEMOS.LIST)}
            className="px-4 py-2 bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Return to List
          </button>
        </div>
      </div>
    );
  }

  const canDispatch = isBookingBranch && memo.status === "CREATED";
  const canReceive = isDeliveryBranch && memo.status === "ON_ROUTE";
  const canSettle = isBookingBranch && memo.status === "RECEIVED" && memo.collectionStatus !== "COMPLETED";
  const canDelete = isBookingBranch && memo.status === "CREATED";

  const bookingsList = Array.isArray(memo.bookings) ? memo.bookings : [];
  const totalBilties = memo.bookingsCount ?? memo.totalBookings ?? bookingsList.length;

  let grossCargoValue = 0;
  let toPayAmount = 0;
  let paidAtBookingAmount = 0;

  bookingsList.forEach((b) => {
    const amt = Number(b.totalAmount || 0);
    grossCargoValue += amt;
    if (b.collectionType === "TO_PAY") {
      toPayAmount += Number(b.remainingAmount !== undefined ? b.remainingAmount : amt);
    } else if (b.collectionType === "PAID_AT_BOOKING") {
      paidAtBookingAmount += amt;
    }
  });

  if (grossCargoValue === 0 && memo.totalAmount) {
    grossCargoValue = Number(memo.totalMoney ?? memo.totalAmount);
    toPayAmount = Number(memo.totalToPay ?? memo.totalAmount);
  }

  const totalToPay = toPayAmount || Number(memo.totalToPay ?? memo.totalAmount ?? 0);
  const settledAmount = Number(memo.receivedAmount ?? memo.totalCollected ?? 0);
  const pendingBalance = Number(memo.pendingAmount ?? (totalToPay - settledAmount));
  const totalQuantity =
    memo.totalPackages ??
    bookingsList.reduce((sum, b) => sum + Number(b.quantity || 1), 0);

  return (
    <div className="w-full min-h-screen bg-slate-50 p-3.5 md:p-6 font-sans antialiased selection:bg-orange-100 select-none pb-16 space-y-4">
      {/* Toast Alert */}
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

      {/* Header Bar */}
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate(ROUTES.MEMOS.LIST)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 text-xs md:text-sm font-bold mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Memo Management</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base md:text-lg font-black bg-orange-50 text-orange-700 px-3 py-1 rounded-xl border border-orange-200">
                {memo.memoNumber}
              </span>
              <MemoStatusBadge type="status" value={memo.status} />
              <MemoStatusBadge type="collection" value={memo.collectionStatus} />
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Created on {formatDate(memo.memoDate || memo.date || memo.createdAt)}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Print Manifest */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.MEMOS.PREVIEW(id))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Manifest</span>
            </button>

            {/* Dispatch Button (BOOKING only) */}
            {canDispatch && (
              <button
                type="button"
                onClick={() => setDispatchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Memo</span>
              </button>
            )}

            {/* Mark Received Button (DELIVERY only) */}
            {canReceive && (
              <button
                type="button"
                onClick={() => setReceiveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Received</span>
              </button>
            )}

            {/* Record Payment Button (BOOKING only) */}
            {canSettle && (
              <button
                type="button"
                onClick={() => {
                  setSettlementAmount(pendingBalance > 0 ? pendingBalance : "");
                  setCollectionModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            {/* Delete (BOOKING only, when CREATED) */}
            {canDelete && (
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="w-full space-y-4">
        {/* Route & Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Origin Branch</span>
                <span className="text-sm font-extrabold text-slate-800">{memo.fromBranch?.name || "N/A"}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              {memo.fromBranch?.type || "BOOKING"}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Destination Branch</span>
                <span className="text-sm font-extrabold text-slate-800">{memo.toBranch?.name || "N/A"}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
              {memo.toBranch?.type || "DELIVERY"}
            </span>
          </div>
        </div>

        {/* Financial & Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Cargo Value (एकूण)
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {formatCurrency(grossCargoValue)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
              {totalBilties} Bilties · {totalQuantity} Pkgs
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block">
              TO_PAY Value (येणे रक्कम)
            </span>
            <span className="text-xl font-black text-orange-600 mt-1 block">
              {formatCurrency(totalToPay)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
              To collect on delivery
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
              Paid at Origin (Booking)
            </span>
            <span className="text-xl font-black text-emerald-700 mt-1 block">
              {formatCurrency(paidAtBookingAmount)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
              Pre-collected at origin
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
              Pending Balance
            </span>
            <span className="text-xl font-black text-amber-700 mt-1 block">
              {formatCurrency(pendingBalance)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">
              {formatCurrency(settledAmount)} collected
            </span>
          </div>
        </div>

        {/* Bilties Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Consignments in this Manifest ({bookingsList.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Bilty No</th>
                  <th className="py-3 px-4">Customer / Shop</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Freight</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bookingsList.map((b, idx) => {
                  const isToPay = b.collectionType === "TO_PAY";
                  const bId = b._id || b.id;

                  return (
                    <tr
                      key={bId || idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.BOOKINGS.DETAILS(bId))}
                          className="font-mono font-black text-orange-600 hover:underline cursor-pointer"
                        >
                          {b.bookingNumber || "BK-0000"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-800">
                          {b.customer?.shopName || (typeof b.customer === "string" ? b.customer : "N/A")}
                        </div>
                        {b.customer?.mobile && (
                          <div className="text-[11px] text-slate-400">{b.customer.mobile}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{b.itemName || "Goods"}</td>
                      <td className="py-3 px-4 text-center font-bold">{b.quantity ?? 1}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(b.freight || 0)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-800">
                        {formatCurrency(b.totalAmount || 0)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isToPay
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isToPay ? "TO PAY" : "PAID"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {memo.notes && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-orange-500" />
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
                Driver / Vehicle Notes
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {memo.notes}
            </p>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {dispatchModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Dispatch Memo?</h3>
                  <p className="text-xs text-slate-500 font-medium">{memo.memoNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Mark this manifest as <b>In Transit</b> to {memo.toBranch?.name}.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Dispatch"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Receive Modal */}
      {receiveModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Mark Memo Received?</h3>
                  <p className="text-xs text-slate-500 font-medium">{memo.memoNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Confirm vehicle arrival and receive {totalBilties} bilties at your delivery branch.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReceiveModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReceive}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Arrival"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Modal */}
      {deleteModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Delete Memo?</h3>
                  <p className="text-xs text-slate-500 font-medium">{memo.memoNumber}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                Are you sure you want to delete this draft manifest? Linked bilties will be unlocked.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Collection Settlement Modal */}
      {collectionModalOpen &&
        createPortal(
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <form
              onSubmit={handleConfirmCollection}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Record Payment</h3>
                  <p className="text-xs text-slate-500 font-medium">{memo.memoNumber}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Total TO_PAY Value:</span>
                  <span>{formatCurrency(totalToPay)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Already Received:</span>
                  <span>{formatCurrency(settledAmount)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-amber-700 pt-1 border-t border-slate-200">
                  <span>Pending Balance:</span>
                  <span>{formatCurrency(pendingBalance)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Received (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  placeholder="Enter received amount in ₹"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 font-extrabold text-slate-800"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Payment"}
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MemoDetailsPage;
