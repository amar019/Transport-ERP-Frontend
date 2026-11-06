import Swal from "sweetalert2";

/**
 * Enterprise SweetAlert2 Confirmation Dialog Helper
 */
export const confirmAction = async ({
  title = "Are you sure?",
  text = "",
  icon = "warning",
  confirmButtonText = "Yes, proceed",
  cancelButtonText = "Cancel",
  isDanger = false,
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: isDanger ? "#DC2626" : "#F97316",
    cancelButtonColor: "#64748B",
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    buttonsStyling: true,
    customClass: {
      popup: "rounded-2xl shadow-2xl border border-[#E2E8F0] font-sans p-6 select-none",
      title: "text-[#0F172A] font-bold text-lg tracking-tight",
      htmlContainer: "text-[#64748B] text-xs font-medium mt-1",
      confirmButton: "px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer mx-1",
      cancelButton: "px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer mx-1",
    },
  });

  return result.isConfirmed;
};

/**
 * Toast / Alert Success Popup
 */
export const showSuccessToast = (title) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: "rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-semibold shadow-lg",
    },
  });
};

/**
 * Toast / Alert Error Popup
 */
export const showErrorToast = (title) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title,
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    customClass: {
      popup: "rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold shadow-lg",
    },
  });
};
