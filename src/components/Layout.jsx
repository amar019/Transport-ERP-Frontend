import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../store/slice/authSlice.js";
import {
  Truck,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Route,
  Users,
  User,
  Building2,
  MapPin,
  Receipt,
  CreditCard,
  Coins,
  BarChart3,
  PieChart,
  LineChart,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const Layout = ({ children }) => {
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
    navigate("/login");
  };

  const menuGroups = [
    {
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      ],
    },
    {
      group: "OPERATIONS",
      items: [
        { name: "Booking", icon: FileText, path: "/booking" },
        { name: "Memos", icon: ClipboardCheck, path: "/memos" },

        { name: "Delivery", icon: Truck, path: "/delivery" },
      ],
    },
    {
      group: "MASTERS",
      items: [
        { name: "Customers", icon: Users, path: "/customers" },
        { name: "Vehicles", icon: Truck, path: "/vehicles" },
        { name: "Drivers", icon: User, path: "/drivers" },
        { name: "Branches", icon: Building2, path: "/branches" },

      ],
    },
    {
      group: "FINANCE",
      items: [
        { name: "Billing", icon: Receipt, path: "/billing" },
        { name: "Payments", icon: CreditCard, path: "/payments" },
        { name: "Expenses", icon: Coins, path: "/expenses" },
      ],
    },
    {
      group: "REPORTS",
      items: [
        { name: "Booking Reports", icon: BarChart3, path: "/booking-reports" },
        { name: "Delivery Reports", icon: PieChart, path: "/delivery-reports" },
        { name: "Financial Reports", icon: LineChart, path: "/financial-reports" },
      ],
    },
    {
      group: "SETTINGS",
      items: [
        { name: "Users", icon: Users, path: "/users" },
        { name: "Roles & Permissions", icon: Shield, path: "/roles-permissions" },
        { name: "Settings", icon: Settings, path: "/settings" },
      ],
    },
  ];

  // Component Sidebar View
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Banner Graphic Header */}
      <div className="w-full relative overflow-hidden bg-[#e05000] shrink-0">
        {!isCollapsed ? (
          <img
            src="/top-navbar.png"
            alt="Mahakal Transport ERP"
            className="w-full h-auto object-cover select-none"
          />
        ) : (
          <div className="p-3 py-4 bg-gradient-to-b from-[#ff5400] to-[#e04800] flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-xs shadow-inner">
              🕉️
            </div>
          </div>
        )}
      </div>

      {/* Curved White Mask Overlap */}
      <div className="rounded-t-[1.75rem] bg-white -mt-4 pt-3 flex-1 flex flex-col overflow-hidden z-10 relative">
        {/* Trishul Ornament Emblem in Center of Curve */}
        {!isCollapsed && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-white px-2 py-0.5 rounded-full flex items-center justify-center border border-amber-300/80 shadow-xs">
            <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L10 6V13H8V9L5 7L7 13C7 15.2 8.8 17 11 17V22H13V17C15.2 17 17 15.2 17 13L19 7L16 9V13H14V6L12 2Z" />
            </svg>
          </div>
        )}




        {/* Scrollable Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* Group Header */}
              {group.group && !isCollapsed && (
                <div className="flex items-center justify-center gap-2 px-2 pt-2.5 pb-1 text-[10px] font-extrabold tracking-wider text-orange-600 uppercase select-none">
                  <span className="h-px bg-gradient-to-r from-transparent via-orange-300 to-orange-400 flex-1"></span>
                  <span className="flex items-center gap-1">
                    <span className="text-[7px]">◆</span> {group.group} <span className="text-[7px]">◆</span>
                  </span>
                  <span className="h-px bg-gradient-to-l from-transparent via-orange-300 to-orange-400 flex-1"></span>
                </div>
              )}

              {group.group && isCollapsed && (
                <div className="h-px bg-slate-100 my-2 mx-2"></div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.name;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => {
                        setActiveItem(item.name);
                        setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 relative group text-left ${isActive
                        ? "bg-[#fff4ed] text-[#ff5400] font-bold border border-orange-200/60 shadow-xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-orange-50/60"
                        }`}
                    >
                      {/* Active Left Indicator Pill */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-md bg-[#ff5400]"></div>
                      )}

                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors text-[#ff5400]`} />

                      {!isCollapsed && <span className="truncate">{item.name}</span>}

                      {/* Tooltip for collapsed states */}
                      {isCollapsed && (
                        <div className="absolute left-16 bg-slate-800 text-white text-[10px] font-medium py-1.5 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 shadow-md z-50 whitespace-nowrap">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Logout Action */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-all duration-200 text-left cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0 text-slate-400 group-hover:text-rose-500" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Collapse Toggle Button (Floating on Sidebar Border) */}
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
    </div>
  );

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
        className={`hidden md:block flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 z-20 ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar: Mobile Backdrop & Slideout Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          <aside className="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl animate-slide-in flex flex-col h-full">
            <SidebarContent />
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
