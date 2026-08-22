import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout as logoutAction } from "@/store/slices/authSlice";
import {
  Truck,
  LogOut,
  Package,
  Users,
  DollarSign,
  Activity,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
} from "lucide-react";
import { ROUTES } from "@/constants/paths";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate(ROUTES.AUTH.LOGIN);
  };

  // Mock ERP data for visualization
  const stats = [
    {
      label: "Active Shipments",
      value: "1,248",
      icon: Package,
      change: "+12.4%",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Fleet Utilization",
      value: "94.2%",
      icon: Truck,
      change: "+3.1%",
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Daily Revenue",
      value: "₹32,840",
      icon: DollarSign,
      change: "+8.2%",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Active Drivers",
      value: "184 / 200",
      icon: Users,
      change: "Optimal",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  const recentShipments = [
    {
      id: "TRK-9824",
      dest: "Chicago, IL",
      status: "In Transit",
      driver: "John Doe",
      eta: "4h 20m",
    },
    {
      id: "TRK-9823",
      dest: "Houston, TX",
      status: "Delivered",
      driver: "Jane Smith",
      eta: "Delivered",
    },
    {
      id: "TRK-9822",
      dest: "Atlanta, GA",
      status: "Pending Dispatch",
      driver: "Mike Johnson",
      eta: "Pending",
    },
    {
      id: "TRK-9821",
      dest: "Los Angeles, CA",
      status: "In Transit",
      driver: "Robert Lee",
      eta: "14h 45m",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-orange-100 antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        {/* Page Title */}
        <div className="text-left select-none">
          <h2 className="font-extrabold text-slate-800 text-sm md:text-base tracking-tight m-0">
            Dashboard Overview
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
            Control Center
          </p>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-semibold text-slate-800 text-xs">
              {user?.name || "ERP Administrator"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              @{user?.username || "admin"}
            </span>
          </div>
          <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs select-none">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : user?.username
              ? user.username.charAt(0).toUpperCase()
              : "A"}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition-all duration-200 cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl py-4 px-6 text-white relative overflow-hidden shadow-md shadow-orange-500/10 border border-orange-500/20">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>

          <div className="z-10 relative text-left">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight m-0 text-white">
                Welcome back, {user?.name || "Administrator"}!
              </h1>
              <span className="bg-white/20 text-white border border-white/25 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-0.5 select-none">
                <ShieldCheck className="w-2.5 h-2.5" /> Secure Session
              </span>
            </div>
            <p className="text-orange-50 text-xs font-light leading-relaxed max-w-2xl">
              Your Transport ERP workspace is online. You have full access to
              manage bookings, track deliveries, and monitor operational
              performance.
            </p>
          </div>
        </section>

        {/* Operational Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow"
            >
              <div className="space-y-1 text-left">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-800 m-0">
                  {stat.value}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.change}</span>
                  <span className="text-slate-400 font-medium ml-0.5">
                    vs last week
                  </span>
                </div>
              </div>
              <div
                className={`${stat.bg} ${stat.color} p-3.5 rounded-xl group-hover:scale-105 transition-transform`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </section>

        {/* Detailed Grid: Shipments & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shipments Table */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-extrabold text-slate-800 text-sm m-0">
                  Recent Shipments
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  Real-time status of tracking dispatches
                </p>
              </div>
              <span
                onClick={() => navigate(ROUTES.BOOKINGS.LIST)}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 cursor-pointer flex items-center gap-1"
              >
                View All <Activity className="w-3 h-3" />
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    <th className="py-2.5 px-3">Shipment ID</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">ETA</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentShipments.map((ship, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {ship.id}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {ship.dest}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {ship.driver}
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {ship.eta}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            ship.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : ship.status === "In Transit"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}
                        >
                          {ship.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Actions Panel */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="text-left">
              <h3 className="font-extrabold text-slate-800 text-sm m-0">
                Quick Operations
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Control ERP activities instantly
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate(ROUTES.BOOKINGS.NEW)}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" /> Create New Shipment
              </button>
              <button
                onClick={() => navigate(ROUTES.MEMOS.NEW)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-3 px-4 rounded-xl shadow-inner transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4 text-slate-500" /> Create Dispatch Memo
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Logs
              </span>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-[10px] text-slate-600">
                <div className="flex justify-between">
                  <span>API Response:</span>
                  <span className="text-green-600 font-semibold">200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Security Layer:</span>
                  <span className="text-slate-800 font-semibold">
                    Bearer Token verified
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
