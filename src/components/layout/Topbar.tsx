import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/documents": "Documents",
  "/contracts": "Contracts",
  "/contracts/new": "Create Contract",
  "/receipts": "Receipts",
  "/receipts/new": "Issue Receipt",
  "/verify": "Verify Document",
  "/audit": "Audit Log",
  "/settings": "Settings",
  "/admin": "Admin Panel",
  "/admin/users": "User Management",
  "/admin/stats": "Analytics",
};

export default function Topbar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "TrustChain";

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[rgba(0,212,255,0.08)] bg-navy-deepest/80 backdrop-blur-md sticky top-0 z-30">
      <h1 className="font-syne font-bold text-xl text-trust-text">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trust-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-navy-surface border border-[rgba(0,212,255,0.1)] rounded-lg pl-9 pr-4 py-2 text-sm text-trust-text placeholder:text-trust-text-muted focus:outline-none focus:border-cyan/30 w-64"
          />
        </div>
        <button className="relative p-2 text-trust-text-secondary hover:text-trust-text transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-trust-danger rounded-full" />
        </button>
      </div>
    </header>
  );
}
