import { useState } from "react";
import { User, Wallet, Bell, Shield, Loader2, Check } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || "");
  const [saved, setSaved] = useState(false);

  const updateProfile = trpc.localAuth.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name: name || undefined,
      walletAddress: walletAddress || undefined,
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-syne font-bold text-2xl text-trust-text">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-[rgba(0,212,255,0.08)] text-cyan border border-[rgba(0,212,255,0.15)]"
                : "text-trust-text-secondary hover:bg-[rgba(0,212,255,0.04)] hover:text-trust-text"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <GlassCard>
          <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
            Profile Information
          </h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="input-trust w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="input-trust w-full opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-trust-text-muted mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Role
              </label>
              <input
                type="text"
                value={user?.role || ""}
                disabled
                className="input-trust w-full opacity-60 cursor-not-allowed capitalize"
              />
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Wallet Tab */}
      {activeTab === "wallet" && (
        <GlassCard>
          <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
            Wallet Settings
          </h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="input-trust w-full font-mono-code"
              />
              <p className="text-xs text-trust-text-muted mt-1">
                Your Polygon wallet address for blockchain transactions
              </p>
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : null}
              {saved ? "Saved!" : "Save Wallet"}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <GlassCard>
          <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { label: "Document Anchored", desc: "Get notified when a document is anchored", default: true },
              { label: "Signature Request", desc: "Get notified when someone requests a signature", default: true },
              { label: "Contract Finalized", desc: "Get notified when a contract is finalized", default: false },
              { label: "Receipt Paid", desc: "Get notified when a receipt is marked paid", default: true },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-[rgba(0,212,255,0.06)] last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-trust-text">{n.label}</p>
                  <p className="text-xs text-trust-text-secondary">{n.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={n.default}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-navy-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan" />
                </label>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <GlassCard>
          <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
            Security Settings
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-trust-text">Two-Factor Authentication</p>
                <p className="text-xs text-trust-text-secondary">
                  Add an extra layer of security to your account
                </p>
              </div>
              <button className="btn-secondary text-sm py-2 px-4">Enable</button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[rgba(0,212,255,0.06)]">
              <div>
                <p className="text-sm font-medium text-trust-text">Change Password</p>
                <p className="text-xs text-trust-text-secondary">
                  Update your account password
                </p>
              </div>
              <button className="btn-secondary text-sm py-2 px-4">Change</button>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-[rgba(0,212,255,0.06)]">
              <div>
                <p className="text-sm font-medium text-trust-text">API Keys</p>
                <p className="text-xs text-trust-text-secondary">
                  Manage your API access keys
                </p>
              </div>
              <button className="btn-secondary text-sm py-2 px-4">Manage</button>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
