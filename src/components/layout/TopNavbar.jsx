import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "@/store/slices/authSlice";
import {
  Menu,
  Search,
  RefreshCw,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Building,
  ChevronDown,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";

export default function TopNavbar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onRefresh,
  searchValue,
  onSearchChange,
  handleLogout: propsHandleLogout,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserLogout = () => {
    setIsUserMenuOpen(false);
    if (propsHandleLogout) {
      propsHandleLogout();
    } else {
      dispatch(logoutAction());
      navigate(ROUTES.AUTH.LOGIN);
    }
  };

  const userInitial = (user?.name || "A").charAt(0).toUpperCase();

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 select-none shadow-2xs">
      {/* Left: Sidebar Toggle + Global Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Desktop Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Search Bar */}
        <div className="relative max-w-sm w-full hidden sm:block">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bookings, customers, vehicles, branches..."
            value={searchValue || ""}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#FF5500] font-medium text-[#0F172A] placeholder:text-[#94A3B8] transition-colors"
          />
        </div>
      </div>

      {/* Right Toolbar Actions */}
      <div className="flex items-center gap-2">


        {/* Notification Bell with Red Badge */}
        <button
          type="button"
          className="relative p-2 text-[#64748B] hover:text-[#0F172A] bg-white border border-[#E2E8F0] rounded-xl shadow-2xs transition-colors cursor-pointer ml-1"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>

        {/* User Profile Avatar & Dropdown Menu */}
        <div className="relative ml-1" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[#F8FAFC] border border-[#E2E8F0] transition-colors cursor-pointer"
            title={user?.name || "User Menu"}
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] flex items-center justify-center font-bold text-xs shadow-2xs">
              {userInitial}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] mr-1 hidden sm:block" />
          </button>

          {/* User Profile Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              {/* User Header */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1 mb-2">
                <div className="font-bold text-[#0F172A] text-sm truncate">
                  {user?.name || "Admin User"}
                </div>
                <div className="text-[11px] text-[#64748B] font-medium truncate">
                  {user?.email || "admin@mahakal.com"}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]">
                    <ShieldCheck className="w-3 h-3" />
                    {user?.role || "SYSTEM ADMIN"}
                  </span>
                  {user?.branch?.name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white text-[#475569] border border-[#E2E8F0] truncate">
                      <Building className="w-3 h-3 text-[#94A3B8]" />
                      {user.branch.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Menu Actions */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleUserLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#DC2626]" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
