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
  Menu
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

  // Sync active path with window location if applicable
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("dashboard")) setActiveItem("Dashboard");
    else if (path.includes("booking")) setActiveItem("Booking");
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
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" }
      ]
    },
    {
      group: "OPERATIONS",
      items: [
        { name: "Booking", icon: FileText, path: "/booking" },
        { name: "LR / Parcel", icon: ClipboardCheck, path: "/lr-parcel" },
        { name: "Delivery", icon: Truck, path: "/delivery" },
        { name: "Trips", icon: Route, path: "/trips" }
      ]
    },
    {
      group: "MASTERS",
      items: [
        { name: "Customers", icon: Users, path: "/customers" },
        { name: "Vehicles", icon: Truck, path: "/vehicles" },
        { name: "Drivers", icon: User, path: "/drivers" },
        { name: "Branches", icon: Building2, path: "/branches" },
        { name: "Locations", icon: MapPin, path: "/locations" }
      ]
    },
    {
      group: "FINANCE",
      items: [
        { name: "Billing", icon: Receipt, path: "/billing" },
        { name: "Payments", icon: CreditCard, path: "/payments" },
        { name: "Expenses", icon: Coins, path: "/expenses" }
      ]
    },
    {
      group: "REPORTS",
      items: [
        { name: "Booking Reports", icon: BarChart3, path: "/booking-reports" },
        { name: "Delivery Reports", icon: PieChart, path: "/delivery-reports" },
        { name: "Financial Reports", icon: LineChart, path: "/financial-reports" }
      ]
    },
    {
      group: "SETTINGS",
      items: [
        { name: "Users", icon: Users, path: "/users" },
        { name: "Roles & Permissions", icon: Shield, path: "/roles-permissions" },
        { name: "Settings", icon: Settings, path: "/settings" }
      ]
    }
  ];

  // Component Sidebar View
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white relative">
      {/* Brand Header */}
      <div className="bg-[#ff5c00] text-white p-5 pb-9 relative flex items-center space-x-3 select-none">
        <div className="bg-white/15 p-2 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
          <Truck className="w-6 h-6 text-white transform -scale-x-100" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-base tracking-tight text-white leading-tight">MAHAKAL</span>
            <span className="font-bold text-[10px] text-orange-200 tracking-wider uppercase mt-0.5 leading-none">TRANSPORT ERP</span>
          </div>
        )}
      </div>

      {/* Curved Card Overlap Mask */}
      <div className="rounded-t-[1.75rem] bg-white -mt-5 pt-5 flex-1 flex flex-col overflow-hidden z-10">
        
        {/* Scrollable Navigation Menu List */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {group.group && !isCollapsed && (
                <div className="px-3.5 pt-2 pb-1 text-[10px] font-extrabold tracking-wider text-orange-600 uppercase text-left select-none opacity-85">
                  {group.group}
                </div>
              )}
              {group.group && isCollapsed && (
                <div className="h-px bg-slate-100 my-2 mx-2"></div>
              )}
              <div className="space-y-0.5">
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
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 relative group text-left ${
                        isActive
                          ? "bg-orange-50/70 text-[#ff5c00]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {/* Left vertical border line for active state */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-[#ff5c00]"></div>
                      )}
                      
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 transition-colors ${
                        isActive ? "text-[#ff5c00]" : "text-slate-400 group-hover:text-slate-600"
                      }`} />
                      
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
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide text-slate-600 hover:text-rose-600 hover:bg-rose-50/60 transition-all duration-200 text-left"
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
      <div className="md:hidden w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="bg-[#ff5c00] p-1.5 rounded-lg shadow-sm flex items-center justify-center">
            <Truck className="w-4 h-4 text-white transform -scale-x-100" />
          </div>
          <span className="font-extrabold text-sm text-slate-800">MAHAKAL</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar: Desktop */}
      <aside className={`hidden md:block flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 z-20 ${
        isCollapsed ? "w-20" : "w-64"
      }`}>
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
