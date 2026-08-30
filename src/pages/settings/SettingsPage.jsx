import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  changePassword,
  updateUserProfile,
  logoutUser,
} from "@/services/auth.service";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { confirmAction } from "@/utils/swal";
import { ROUTES } from "@/constants/paths";
import {
  User,
  KeyRound,
  ShieldCheck,
  Building,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Mail,
  UserCheck,
  Pencil,
  X,
} from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  // Active Tab: PROFILE | SECURITY
  const [activeTab, setActiveTab] = useState("PROFILE");

  // User Profile State
  const [userProfile, setUserProfile] = useState(authUser || null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: "",
    username: "",
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Change Password Form State
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState("");

  // Fetch Current User on Mount
  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    setLoadingUser(true);
    try {
      const res = await getCurrentUser();
      const userData = res?.data || res;
      if (userData) {
        setUserProfile(userData);
        setProfileFormData({
          name: userData.name || "",
          username: userData.username || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  const showToastMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Profile Update Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (!profileFormData.name.trim()) {
      setProfileError("Full Name is required");
      return;
    }
    if (!profileFormData.username.trim()) {
      setProfileError("Username is required");
      return;
    }

    setProfileSubmitting(true);
    try {
      const res = await updateUserProfile({
        name: profileFormData.name.trim(),
        username: profileFormData.username.trim(),
      });

      const updated = res?.data || res;
      setUserProfile(updated);
      setIsEditingProfile(false);
      showToastMsg("Profile details updated successfully!", "success");
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile details."
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!passData.currentPassword) {
      setFormError("Please enter your current password");
      return;
    }
    if (passData.newPassword.length < 6) {
      setFormError("New password must be at least 6 characters long");
      return;
    }
    if (passData.newPassword !== passData.confirmPassword) {
      setFormError("Confirm password does not match new password");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
        confirmPassword: passData.confirmPassword,
      });

      showToastMsg("Password changed successfully!", "success");
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to update password. Please check your current password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout Handler
  const handleLogoutClick = async () => {
    const isConfirmed = await confirmAction({
      title: "Sign Out?",
      text: "Are you sure you want to end your current session?",
      icon: "question",
      confirmButtonText: "Yes, Sign Out",
      cancelButtonText: "Cancel",
      isDanger: true,
    });

    if (isConfirmed) {
      try {
        await logoutUser();
      } catch (err) {
        // Ignore errors on logout
      } finally {
        dispatch(logoutAction());
        navigate(ROUTES.AUTH.LOGIN);
      }
    }
  };

  const initial = (userProfile?.name || authUser?.name || "A")
    .charAt(0)
    .toUpperCase();

  const tabOptions = [
    { label: "Profile Overview", value: "PROFILE", icon: User },
    { label: "Security & Password", value: "SECURITY", icon: KeyRound },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-6 md:p-8 font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C] select-none flex flex-col flex-1 space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-4 ${toast.type === "success"
            ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
            : "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
            }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
          )}
          <span className="text-xs md:text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* COMPACT & SMALL HEADING ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full border-b border-[#E2E8F0] pb-4">
        {/* Left: Small Breadcrumb + Compact Title */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
            <span>Settings</span>
            <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
            <span className="font-semibold text-[#0F172A]">Account & Security</span>
          </div>
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight leading-tight m-0 p-0">
            Account Settings
          </h1>
        </div>

        {/* Right: Tab Switcher & Sign Out Button */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {/* Segmented Tab Switcher */}
          <div className="bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] inline-flex items-center gap-1">
            {tabOptions.map((tab) => {
              const IconComp = tab.icon;
              const isTabActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${isTabActive
                    ? "bg-[#F97316] text-white font-semibold shadow-2xs"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50 font-medium"
                    }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#DC2626] hover:bg-[#FEF2F2] border border-[#E2E8F0] hover:border-[#FECACA] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* FULL WIDTH 2-COLUMN GRID LAYOUT */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        {/* LEFT COLUMN: USER PROFILE SUMMARY (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 space-y-5">
          <div className="flex flex-col items-center text-center p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-2xs">
              {initial}
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0F172A]">
                {userProfile?.name || authUser?.name || "Admin User"}
              </h2>
              <p className="text-xs text-[#64748B] font-medium">
                @{userProfile?.username || authUser?.username || "admin"}
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {userProfile?.role || authUser?.role || "SYSTEM ADMIN"}
            </span>
          </div>

          <div className="space-y-3 text-xs">


            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#94A3B8]" /> Branch
              </span>
              <span className="font-semibold text-[#0F172A]">
                {userProfile?.branch?.name || "Main Branch"}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#94A3B8]" /> Status
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TAB MAIN CONTENT (8 cols on lg) */}
        <div className="lg:col-span-8 w-full space-y-5">
          {/* TAB 1: PROFILE OVERVIEW & EDIT */}
          {activeTab === "PROFILE" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#FFF7ED] text-[#F97316] border border-[#FFEDD5] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-sm">
                      User Account Credentials
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Primary profile details linked to your transport ERP account
                    </p>
                  </div>
                </div>

                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileFormData({
                        name: userProfile?.name || authUser?.name || "",
                        username: userProfile?.username || authUser?.username || "",
                      });
                      setIsEditingProfile(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#64748B] border border-[#E2E8F0] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {/* Profile Edit Error Alert */}
              {profileError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center gap-2 text-[#DC2626] text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Profile View / Edit Mode */}
              {!isEditingProfile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
                    <span className="text-[#64748B] font-medium block">Full Name</span>
                    <span className="font-bold text-[#0F172A] text-sm block">
                      {userProfile?.name || authUser?.name || "N/A"}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
                    <span className="text-[#64748B] font-medium block">System Username</span>
                    <span className="font-mono font-bold text-[#0F172A] text-sm block">
                      {userProfile?.username || authUser?.username || "N/A"}
                    </span>
                  </div>



                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
                    <span className="text-[#64748B] font-medium block">System Role</span>
                    <span className="font-bold text-[#F97316] text-sm block uppercase">
                      {userProfile?.role || authUser?.role || "ADMIN"}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                  {/* Full Name Input */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                      Full Name <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahakal Admin"
                      value={profileFormData.name}
                      onChange={(e) =>
                        setProfileFormData({ ...profileFormData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] transition-colors"
                    />
                  </div>

                  {/* Username Input */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                      System Username <span className="text-[#DC2626]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. booking"
                      value={profileFormData.username}
                      onChange={(e) =>
                        setProfileFormData({ ...profileFormData, username: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-mono font-semibold text-[#0F172A] transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={profileSubmitting}
                      className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2.5 rounded-lg shadow-2xs transition-colors text-xs cursor-pointer disabled:opacity-50"
                    >
                      {profileSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 stroke-[2.5]" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="p-4 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl flex items-center gap-3 text-xs font-semibold text-[#C2410C]">
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>Need to update role permissions or branch assignment? Contact your System Super Administrator.</span>
              </div>
            </div>
          )}

          {/* TAB 2: SECURITY & CHANGE PASSWORD */}
          {activeTab === "SECURITY" && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
                <div className="w-7 h-7 rounded-md bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] text-sm">
                    Change Access Password
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Update your security password to protect your Transport ERP account
                  </p>
                </div>
              </div>

              {/* Form Error Banner */}
              {formError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center gap-2.5 text-[#DC2626] text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                {/* Current Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                    Current Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      required
                      placeholder="Enter your existing password"
                      value={passData.currentPassword}
                      onChange={(e) =>
                        setPassData({ ...passData, currentPassword: e.target.value })
                      }
                      className="w-full pl-3 pr-9 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                    New Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Enter new password (min. 6 characters)"
                      value={passData.newPassword}
                      onChange={(e) =>
                        setPassData({ ...passData, newPassword: e.target.value })
                      }
                      className="w-full pl-3 pr-9 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1 block">
                    Confirm New Password <span className="text-[#DC2626]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="Re-enter new password"
                      value={passData.confirmPassword}
                      onChange={(e) =>
                        setPassData({ ...passData, confirmPassword: e.target.value })
                      }
                      className="w-full pl-3 pr-9 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:bg-white focus:outline-none focus:border-[#F97316] font-semibold text-[#0F172A] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-5 py-2.5 rounded-lg shadow-2xs transition-colors text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 stroke-[2.5]" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
