import {
  Users,
  FileText,
  Receipt,
  FileSignature,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: users } = trpc.admin.users.useQuery();
  const { data: documents } = trpc.admin.documents.useQuery();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-syne font-bold text-2xl text-trust-text">
        Admin Panel
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats?.users || 0}
          icon={<Users className="w-5 h-5 text-cyan" />}
          accentColor="#00d4ff"
        />
        <StatCard
          label="Documents"
          value={stats?.documents || 0}
          icon={<FileText className="w-5 h-5 text-trust-success" />}
          accentColor="#00e5a0"
        />
        <StatCard
          label="Receipts"
          value={stats?.receipts || 0}
          icon={<Receipt className="w-5 h-5 text-trust-warning" />}
          accentColor="#ffb800"
        />
        <StatCard
          label="Contracts"
          value={stats?.contracts || 0}
          icon={<FileSignature className="w-5 h-5 text-trust-blue" />}
          accentColor="#1a56db"
        />
      </div>

      {/* Chain Stats */}
      {stats?.chain && (
        <GlassCard className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-trust-success" />
            <div>
              <p className="text-sm font-medium text-trust-text">
                Blockchain Status
              </p>
              <p className="text-xs text-trust-text-secondary capitalize">
                {stats.chain.network}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono-code text-lg text-cyan">
              #{stats.chain.lastBlock.toLocaleString()}
            </p>
            <p className="text-xs text-trust-text-muted">Latest Block</p>
          </div>
        </GlassCard>
      )}

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
          <h3 className="font-syne font-bold text-lg text-trust-text">
            Users
          </h3>
          <span className="text-xs text-trust-text-muted">
            {users?.length || 0} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,212,255,0.08)]">
                {["Name", "Email", "Role", "Status", "Joined"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-trust-text-secondary uppercase tracking-wider px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.02)] transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan/20 to-trust-blue/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-cyan">
                          {(u.name || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-trust-text font-medium">
                        {u.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-trust-text-secondary">
                    {u.email}
                  </td>
                  <td className="px-6 py-3">
                    <span className="capitalize text-xs font-medium px-2.5 py-0.5 rounded bg-navy-surface text-trust-text-secondary">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge
                      status={u.isVerified ? "verified" : "draft"}
                    />
                  </td>
                  <td className="px-6 py-3 font-mono-code text-xs text-trust-text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Recent Documents */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[rgba(0,212,255,0.08)] flex items-center justify-between">
          <h3 className="font-syne font-bold text-lg text-trust-text">
            Recent Documents
          </h3>
          <span className="text-xs text-trust-text-muted">
            {documents?.length || 0} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(0,212,255,0.08)]">
                {["Title", "Type", "Status", "Owner", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-trust-text-secondary uppercase tracking-wider px-6 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(documents || []).slice(0, 10).map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.02)] transition-colors"
                >
                  <td className="px-6 py-3 text-sm text-trust-text font-medium truncate max-w-[200px]">
                    {d.title}
                  </td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[rgba(0,212,255,0.08)] text-cyan">
                      {d.docType}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-6 py-3 text-sm text-trust-text-secondary">
                    #{d.ownerId}
                  </td>
                  <td className="px-6 py-3 font-mono-code text-xs text-trust-text-muted">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
