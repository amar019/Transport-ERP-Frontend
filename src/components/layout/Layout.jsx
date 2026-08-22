import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "@/store/slices/authSlice";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { ROUTES } from "@/constants/paths";

export const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync active path with window location
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("dashboard")) setActiveItem("Dashboard");
    else if (path.includes("booking")) setActiveItem("Booking");
    else if (path.includes("memo")) setActiveItem("Memos");
    else if (path.includes("lr-parcel")) setActiveItem("LR / Parcel");
    else if (path.includes("delivery")) setActiveItem("Delivery");
    else if (path.includes("trips")) setActiveItem("Trips");
    else if (path.includes("customers")) setActiveItem("Customers");
    else if (path.includes("vehicles")) setActiveItem("Vehicles");
    else if (path.includes("drivers")) setActiveItem("Drivers");
    else if (path.includes("branches")) setActiveItem("Branches");
    else if (path.includes("locations")) setActiveItem("Locations");
    else if (path.includes("billing")) setActiveItem("Billing");
    else if (path.includes("payments")) setActiveItem("Payments");
    else if (path.includes("expenses")) setActiveItem("Expenses");
    else if (path.includes("booking-reports")) setActiveItem("Booking Reports");
    else if (path.includes("delivery-reports")) setActiveItem("Delivery Reports");
    else if (path.includes("financial-reports")) setActiveItem("Financial Reports");
    else if (path.includes("users")) setActiveItem("Users");
    else if (path.includes("roles-permissions")) setActiveItem("Roles & Permissions");
    else if (path.includes("settings")) setActiveItem("Settings");
  }, [location]);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate(ROUTES.AUTH.LOGIN);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-orange-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-30 shadow-xs">
        <div className="flex items-center space-x-2">
          <img
            src="/top-navbar.png"
            alt="Mahakal Transport ERP"
            className="h-9 w-auto object-contain"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar: Desktop */}
      <aside
        className={`hidden md:block flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 z-20 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          handleLogout={handleLogout}
        />
        {/* Collapse Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 bottom-12 w-7 h-7 bg-white border border-slate-200 rounded-full shadow-md items-center justify-center cursor-pointer hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all z-30"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </aside>

      {/* Sidebar: Mobile Backdrop & Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl animate-slide-in flex flex-col h-full">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-h-screen md:pt-0 pt-14">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default Layout;
