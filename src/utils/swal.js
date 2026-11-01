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

/**
 * Official Server Payment Reminder Notice Popup
 * Designed like an authentic server / infrastructure billing advisory notice.
 * Non-blocking, informative notice displayed whenever the login page is opened.
 */
export const showPaymentReminder = () => {
  if (document.querySelector(".server-notice-popup")) {
    return;
  }

  return Swal.fire({
    icon: "warning",
    iconColor: "#ea580c",
    title: "Important Payment Notice",
    html: `
      <div class="server-notice-container">
        <!-- Official System Notice Tag -->
        <div class="server-notice-meta-bar">
          <span class="server-notice-badge">
            <span class="server-pulse-dot"></span>
            SERVER ADVISORY
          </span>
          <span class="server-notice-id">REF: SRV-HOST-BILLING</span>
        </div>

        <!-- Infrastructure Details Card -->
        <div class="server-notice-info-card">
          <div class="server-notice-info-row">
            <span class="server-notice-label">INFRASTRUCTURE:</span>
            <span class="server-notice-value">Cloud Application & Database Server</span>
          </div>
          <div class="server-notice-info-row">
            <span class="server-notice-label">BILLING STATUS:</span>
            <span class="server-notice-status">PAYMENT PENDING</span>
          </div>
        </div>

        <!-- Official Notice Message -->
        <div class="server-notice-statement-box">
          <p class="server-notice-statement">
            Your application server bill is currently pending. Please clear the outstanding server payment to continue using this application without interruption.
          </p>
        </div>

        <!-- Secondary Directive Notice -->
        <div class="server-notice-action-callout">
          <div class="server-notice-callout-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="server-notice-callout-text">
            <strong>Action Required:</strong> Please contact the administrator for payment details.
          </div>
        </div>

        <!-- Document Security / Verification Footer -->
        <div class="server-notice-doc-footer">
          <span>AUTOMATED SERVER BILLING NOTIFICATION • SYSTEM CODE: SRV-503-PENDING</span>
        </div>
      </div>
    `,
    confirmButtonText: "Understood",
    confirmButtonColor: "#f97316",
    showCancelButton: false,
    showCloseButton: true,
    allowOutsideClick: true,
    allowEscapeKey: true,
    focusConfirm: true,
    buttonsStyling: true,
    customClass: {
      popup: "server-notice-popup select-none",
      title: "server-notice-title",
      htmlContainer: "server-notice-html",
      confirmButton: "server-notice-btn",
      closeButton: "server-notice-close",
    },
  });
};

