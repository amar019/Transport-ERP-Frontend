import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { MENU_GROUPS } from "@/constants/navigation";

export const Sidebar = ({ isCollapsed, activeItem, setActiveItem, setIsMobileOpen, handleLogout }) => {
  const location = useLocation();

  return (
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
          {MENU_GROUPS.map((group, groupIdx) => (
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
                  const isActive = activeItem === item.name || location.pathname === item.path;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      onClick={() => {
                        setActiveItem(item.name);
                        if (setIsMobileOpen) setIsMobileOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-200 relative group text-left ${
                        isActive
                          ? "bg-[#fff4ed] text-[#ff5400] font-bold border border-orange-200/60 shadow-xs"
                          : "text-slate-700 hover:text-slate-900 hover:bg-orange-50/60"
                      }`}
                    >
                      {/* Active Left Indicator Pill */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-md bg-[#ff5400]"></div>
                      )}

                      <Icon className="w-4.5 h-4.5 flex-shrink-0 transition-colors text-[#ff5400]" />

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
    </div>
  );
};

export default Sidebar;
