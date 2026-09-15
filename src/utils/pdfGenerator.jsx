import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import WireframeBilty from "@/components/Bilty/WireframeBilty";


/**
 * Generate and download Bilty PDF purely on the frontend (No backend API required)
 * @param {Object} booking - Booking data object
 * @param {string} bookingNumber - e.g. "BK-0001"
 */
export const downloadBiltyPdfFrontend = async (booking, bookingNumber = "Bilty") => {
  if (!booking) throw new Error("No booking data provided for PDF generation");

  // Create temporary container rendered on-DOM but hidden
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "0";
  container.style.width = "297mm";
  container.style.background = "#ffffff";
  container.style.zIndex = "-9999";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    // Render Bilty into temporary container
    await new Promise((resolve) => {
      root.render(
        <div style={{ width: "297mm", padding: "4mm 8.5mm", background: "#ffffff" }}>
          <WireframeBilty booking={booking} />
        </div>
      );
      setTimeout(resolve, 400);
    });

    // Wait for all <img> elements inside container to load & decode
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
        }
        return new Promise((res) => {
          img.onload = async () => {
            if (img.decode) {
              try { await img.decode(); } catch (e) {}
            }
            res();
          };
          img.onerror = res;
        });
      })
    );

    const targetEl = container.querySelector(".bilty-page-container") || container;

    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 15000,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    pdf.addImage(imgData, "PNG", 0, 0, 297, 210);
    pdf.save(`Bilty-${bookingNumber || "Document"}.pdf`);
  } catch (err) {
    console.error("Frontend PDF generation error:", err);
    throw err;
  } finally {
    // Clean up DOM node
    root.unmount();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
