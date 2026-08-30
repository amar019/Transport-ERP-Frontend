import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { MENU_GROUPS } from "@/constants/navigation";

export const Sidebar = ({
  isCollapsed,
  activeItem,
  setActiveItem,
  setIsMobileOpen,
  handleLogout,
}) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-white select-none relative overflow-hidden">
      {/* Top Banner Graphic & Branding Header */}
      <div className="w-full relative shrink-0 bg-gradient-to-br from-[#e05000] via-[#ea580c] to-[#c2410c] overflow-hidden">
        {!isCollapsed ? (
          <div className="relative group">
            <img
              src="/top-navbar.png"
              alt="Mahakal Transport ERP"
              className="w-full h-auto object-cover select-none transition-transform duration-500 group-hover:scale-[1.02]"
            />
            {/* Subtle Gradient & Shimmer Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15 pointer-events-none" />
          </div>
        ) : (
          <div className="p-3 py-4 flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-black/10 backdrop-blur-xs transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer">
              🕉️
            </div>
          </div>
        )}
      </div>

      {/* Decorative Curved Transition Mask */}
      <div className="rounded-t-2xl bg-white -mt-3.5 pt-3.5 flex-1 flex flex-col overflow-hidden z-10 relative border-t border-slate-100/50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        {/* Emblem Badge Overlay in Header Curve */}
        {!isCollapsed && (
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 bg-white px-2.5 py-0.5 rounded-full flex items-center justify-center border border-amber-200/80 shadow-xs group cursor-default">
            <svg
              className="w-3.5 h-3.5 text-amber-600 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L10 6V13H8V9L5 7L7 13C7 15.2 8.8 17 11 17V22H13V17C15.2 17 17 15.2 17 13L19 7L16 9V13H14V6L12 2Z" />
            </svg>
          </div>
        )}

        {/* Scrollable Navigation Menu Item List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 pt-1 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {MENU_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* Group Header */}
              {group.group && !isCollapsed && (
                <div className="flex items-center justify-between px-2.5 pt-2 pb-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase select-none">
                  <div className="flex items-center gap-1.5 text-orange-600/90">
                    <span className="w-1 h-1 rounded-full bg-orange-500"></span>
                    <span>{group.group}</span>
                  </div>
                  <span className="h-px bg-gradient-to-r from-slate-200 to-transparent flex-1 ml-2"></span>
                </div>
              )}

              {group.group && isCollapsed && (
                <div className="h-px bg-slate-100 my-2.5 mx-2"></div>
              )}

              {/* Menu Items */}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive =
                    activeItem === item.name || location.pathname === item.path;

                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => {
                        setActiveItem(item.name);
                        if (setIsMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`relative flex items-center transition-all duration-200 ease-out group rounded-xl text-xs font-semibold tracking-wide select-none outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${
                        isCollapsed
                          ? "justify-center py-2.5 px-0"
                          : "px-3 py-2.5 space-x-3"
                      } ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent text-orange-600 font-bold border-l-3 border-orange-500 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:translate-x-0.5"
                      }`}
                    >
                      {/* Icon with smooth micro-animation */}
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-all duration-200 ease-out ${
                          isActive
                            ? "text-orange-600 scale-110 drop-shadow-[0_2px_4px_rgba(249,115,22,0.25)]"
                            : "text-slate-400 group-hover:text-slate-700 group-hover:scale-110"
                        }`}
                      />

                      {/* Label Text for Expanded State */}
                      {!isCollapsed && (
                        <span className="truncate flex-1 font-medium transition-colors duration-200">
                          {item.name}
                        </span>
                      )}

                      {/* Active Right Glow Dot when Expanded */}
                      {!isCollapsed && isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)] animate-pulse"></span>
                      )}

                      {/* Floating Glass Tooltip for Collapsed State */}
                      {isCollapsed && (
                        <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-100 bg-slate-900/95 backdrop-blur-xs shadow-xl border border-slate-800 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-x-0 opacity-0 -translate-x-2 transition-all duration-200 z-50 whitespace-nowrap flex items-center gap-1.5 before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-slate-900/95">
                          <span>{item.name}</span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Logout & User Status Area */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center transition-all duration-200 ease-out rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50/80 active:bg-rose-100/70 border border-transparent hover:border-rose-200/50 cursor-pointer group ${
              isCollapsed ? "justify-center py-2.5 px-0" : "px-3 py-2.5 space-x-3"
            }`}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-all duration-200" />
            {!isCollapsed && <span>Logout</span>}

            {/* Collapsed Tooltip for Logout */}
            {isCollapsed && (
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white bg-rose-600 shadow-xl border border-rose-500 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-x-0 opacity-0 -translate-x-2 transition-all duration-200 z-50 whitespace-nowrap before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-rose-600">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
