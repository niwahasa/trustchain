import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  Receipt,
  Search,
  ClipboardList,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: FileSignature, label: "Contracts", path: "/contracts" },
  { icon: Receipt, label: "Receipts", path: "/receipts" },
  { icon: Search, label: "Verify", path: "/verify" },
  { icon: ClipboardList, label: "Audit Log", path: "/audit" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminItems = [
  { icon: ShieldCheck, label: "Admin", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: BarChart3, label: "Analytics", path: "/admin/stats" },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-navy-mid border-r border-[rgba(0,212,255,0.08)] z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[rgba(0,212,255,0.08)]">
        <div className="w-8 h-8 rounded-lg bg-cyan/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-cyan" />
        </div>
        {!collapsed && (
          <span className="font-syne font-bold text-lg text-trust-text whitespace-nowrap overflow-hidden">
            TRUST<span className="text-cyan">CHAIN</span>
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[rgba(0,212,255,0.08)] text-cyan border-l-[3px] border-cyan"
                  : "text-trust-text-secondary hover:bg-[rgba(0,212,255,0.04)] hover:text-trust-text border-l-[3px] border-transparent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-cyan" : "text-trust-text-muted group-hover:text-trust-text"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-3">
                <span className="text-[10px] font-semibold text-trust-text-muted uppercase tracking-widest">
                  Admin
                </span>
              </div>
            )}
            {adminItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-[rgba(0,212,255,0.08)] text-cyan border-l-[3px] border-cyan"
                      : "text-trust-text-secondary hover:bg-[rgba(0,212,255,0.04)] hover:text-trust-text border-l-[3px] border-transparent"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive ? "text-cyan" : "text-trust-text-muted group-hover:text-trust-text"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Card */}
      <div className="px-3 py-4 border-t border-[rgba(0,212,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan/30 to-trust-blue/30 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-cyan">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-trust-text truncate">
                {user?.name || "User"}
              </p>
              <span className="text-[11px] text-trust-text-muted bg-navy-surface px-2 py-0.5 rounded capitalize">
                {user?.role || "individual"}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-2 mt-3 text-sm text-trust-text-muted hover:text-trust-danger transition-colors",
            collapsed ? "justify-center px-0" : "px-3"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-navy-mid border border-[rgba(0,212,255,0.15)] rounded-full flex items-center justify-center text-cyan hover:border-cyan transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
