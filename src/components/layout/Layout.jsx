import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { ROUTES } from "@/constants/paths";
import { MENU_GROUPS } from "@/constants/navigation";

export const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Synchronize active navigation item with current URL path
  useEffect(() => {
    const currentPath = location.pathname;
    let foundMatch = false;

    for (const group of MENU_GROUPS) {
      for (const item of group.items) {
        if (
          item.path === currentPath ||
          (item.path !== "/" && item.path !== "/dashboard" && currentPath.startsWith(item.path))
        ) {
          setActiveItem(item.name);
          foundMatch = true;
          break;
        }
      }
      if (foundMatch) break;
    }

    if (!foundMatch && currentPath.includes("dashboard")) {
      setActiveItem("Dashboard");
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] selection:bg-[#FFF7ED] selection:text-[#C2410C]">
      {/* Sidebar: Desktop Sticky Container */}
      <aside
        className={`hidden md:block shrink-0 bg-white border-r border-[#E2E8F0] h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 shadow-[1px_0_10px_rgba(0,0,0,0.02)] ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          handleLogout={handleLogout}
        />

        {/* Floating Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-16 w-7 h-7 bg-white border border-[#E2E8F0] rounded-full shadow-md items-center justify-center cursor-pointer text-[#64748B] hover:text-[#FF5500] hover:border-[#FF5500] hover:scale-110 active:scale-95 transition-all duration-200 z-30 outline-none group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          )}
        </button>
      </aside>

      {/* Sidebar: Mobile Backdrop & Animated Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <aside className="md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl flex flex-col h-full animate-slide-in">
            {/* Mobile Header Close Button */}
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-full bg-slate-100/80 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar
              isCollapsed={false}
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              setIsMobileOpen={setIsMobileOpen}
              handleLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Page Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
