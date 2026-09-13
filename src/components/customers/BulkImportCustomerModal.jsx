import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCustomer } from "@/store/slices/customerSlice";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  FileText,
} from "lucide-react";

export default function BulkImportCustomerModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();

  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });

  if (!isOpen) return null;

  // Generate Sample CSV file content
  const handleDownloadSampleCSV = () => {
    const csvContent =
      "Shop Name,Owner Name,Mobile,Email,City,District,State,Address,Area,Pincode,Opening Balance,Balance Type\n" +
      "Mahavir Agro Traders,Mahesh Kale,9423456789,mahavir@gmail.com,Jamkhed,Ahilyanagar,Maharashtra,Shop 14 Market Yard,Market Yard,413901,5000,RECEIVABLE\n" +
      "Ganesh Transport,Ganesh Shinde,9822114455,ganesh@gmail.com,Ahilyanagar,Ahilyanagar,Maharashtra,Station Road,Station Area,414001,0,RECEIVABLE\n" +
      "Vijay Enterprise,Vijay Pawar,9766554433,,Beed,Beed,Maharashtra,Mondha Market,Old City,431122,2500,PAYABLE";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_customer_import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Basic CSV Parser
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMsg("Please select a valid .csv file.");
      return;
    }

    setErrorMsg("");
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length <= 1) {
        setErrorMsg("CSV file appears to be empty or missing data rows.");
        return;
      }

      // First line header parsing
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((col) => col.replace(/^"(.*)"$/, "$1").trim());
        if (cols.length >= 3) {
          rows.push({
            shopName: cols[0] || "",
            ownerName: cols[1] || "",
            mobile: cols[2] || "",
            email: cols[3] || "",
            city: cols[4] || "",
            district: cols[5] || "",
            state: cols[6] || "Maharashtra",
            address: cols[7] || "",
            area: cols[8] || "",
            pincode: cols[9] || "",
            openingBalance: Number(cols[10]) || 0,
            openingBalanceType: cols[11]?.toUpperCase() === "PAYABLE" ? "PAYABLE" : "RECEIVABLE",
            isValid: cols[0] && cols[1] && /^[0-9]{10}$/.test(cols[2]),
          });
        }
      }

      setParsedData(rows);
    };

    reader.readAsText(selectedFile);
  };

  // Perform Bulk Registration
  const handleStartImport = async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMsg("No valid customer records found in file. Check mandatory fields (Shop Name, Owner Name, 10-digit Mobile).");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");
    let successCount = 0;
    let failedCount = 0;

    for (const row of validRows) {
      try {
        const payload = {
          shopName: row.shopName,
          ownerName: row.ownerName,
          mobile: row.mobile,
          email: row.email,
          city: row.city,
          district: row.district,
          state: row.state,
          address: row.address,
          area: row.area,
          pincode: row.pincode,
          openingBalance: row.openingBalance,
          openingBalanceType: row.openingBalanceType,
          notes: "[Bulk CSV Import]",
        };
        const res = await dispatch(addCustomer(payload));
        if (!res.error) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
      }
    }

    setImportStats({ success: successCount, failed: failedCount });
    setIsProcessing(false);
    setIsDone(true);
    if (onSuccess) onSuccess(successCount);
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setIsDone(false);
    setErrorMsg("");
    setImportStats({ success: 0, failed: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Bulk Import Customers via CSV / Excel
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Upload 1,000+ customer records in 1 click
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex items-center gap-3 text-[#DC2626] text-xs font-medium">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#DC2626]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isDone ? (
            <>
              {/* Top Banner: Download Template */}
              <div className="bg-[#EFF6FF] p-4 rounded-xl border border-[#BFDBFE] flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-xs text-[#1E40AF]">
                    Step 1: Download Sample CSV Template
                  </h4>
                  <p className="text-[11px] text-[#1E3A8A] mt-0.5">
                    Use our pre-formatted template with columns for Shop Name, Owner, Mobile, City & Address.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCSV}
                  className="px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#2563EB] font-bold text-xs rounded-lg border border-[#93C5FD] shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Sample CSV</span>
                </button>
              </div>

              {/* Step 2: Dropzone */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                  Step 2: Upload Completed CSV File
                </label>
                <div className="border-2 border-dashed border-[#CBD5E1] hover:border-[#2563EB] bg-[#F8FAFC] rounded-2xl p-6 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                  {file ? (
                    <div>
                      <span className="font-bold text-xs text-[#0F172A] block">{file.name}</span>
                      <span className="text-[10px] text-[#059669] font-semibold">
                        {parsedData.length} records parsed ({parsedData.filter((r) => r.isValid).length} ready to import)
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-xs text-[#0F172A] block">
                        Click to Browse or Drag & Drop .CSV File
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Supports standard CSV files containing customer list
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* File Preview Table snippet */}
              {parsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                    <span>File Preview (First 5 Rows)</span>
                    <span className="text-[#059669] font-semibold">
                      {parsedData.filter((r) => r.isValid).length} Valid / {parsedData.length} Total
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-[#E2E8F0] rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-[#F1F5F9] font-bold text-[#475569] sticky top-0">
                        <tr>
                          <th className="p-2">Status</th>
                          <th className="p-2">Shop Name</th>
                          <th className="p-2">Owner Name</th>
                          <th className="p-2">Mobile</th>
                          <th className="p-2">City</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {parsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className={row.isValid ? "bg-white" : "bg-[#FEF2F2]"}>
                            <td className="p-2">
                              {row.isValid ? (
                                <span className="text-[#059669] font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Valid
                                </span>
                              ) : (
                                <span className="text-[#DC2626] font-bold">Invalid</span>
                              )}
                            </td>
                            <td className="p-2 font-semibold text-[#0F172A]">{row.shopName || "-"}</td>
                            <td className="p-2 text-[#475569]">{row.ownerName || "-"}</td>
                            <td className="p-2 font-mono text-[#0F172A]">{row.mobile || "-"}</td>
                            <td className="p-2 text-[#475569]">{row.city || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Import Success Summary */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-xl text-[#0F172A]">
                  Bulk Import Finished!
                </h4>
                <p className="text-xs text-[#64748B] mt-1">
                  Successfully added <strong className="text-[#059669] font-bold">{importStats.success}</strong> new customer profiles to your transport database.
                  {importStats.failed > 0 && ` (${importStats.failed} failed due to duplicate/missing fields)`}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Done & View Directory
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isDone && (
          <div className="bg-[#F8FAFC] px-6 py-3 border-t border-[#E2E8F0] flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              Clear Upload
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-[#F1F5F9] text-[#475569] font-bold text-xs rounded-lg border border-[#CBD5E1] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartImport}
                disabled={isProcessing || parsedData.filter((r) => r.isValid).length === 0}
                className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing Customers...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {parsedData.filter((r) => r.isValid).length} Customers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
