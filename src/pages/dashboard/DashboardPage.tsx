import { Link } from "react-router";
import {
  FileText,
  FileSignature,
  Receipt,
  Search,
  Upload,
  FilePlus2,
  ReceiptText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import GlassCard from "@/components/shared/GlassCard";
import BlockchainViz from "@/components/shared/BlockchainViz";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";

const quickActions = [
  { icon: Upload, label: "Upload Document", sub: "Anchor a new file", path: "/documents", color: "#00d4ff" },
  { icon: FilePlus2, label: "Create Contract", sub: "Draft & finalize", path: "/contracts/new", color: "#1a56db" },
  { icon: ReceiptText, label: "Issue Receipt", sub: "Generate receipt", path: "/receipts/new", color: "#00e5a0" },
  { icon: Search, label: "Verify ID", sub: "Check authenticity", path: "/verify", color: "#00d4ff" },
];

export default function DashboardPage() {
  const { data: docs } = trpc.document.list.useQuery();
  const { data: receipts } = trpc.receipt.list.useQuery();
  const { data: contractsList } = trpc.contract.list.useQuery();

  const pendingSigs = (contractsList || []).filter(
    (c) => c.status === "draft"
  ).length;

  const recentActivity = [
    ...(docs || []).slice(0, 3).map((d) => ({
      icon: d.status === "verified" ? CheckCircle2 : Clock,
      text: `Document "${d.title}" ${d.status}`,
      time: new Date(d.createdAt).toLocaleDateString(),
      color: d.status === "verified" ? "#00e5a0" : "#ffb800",
    })),
    ...(receipts || []).slice(0, 2).map((r) => ({
      icon: Receipt,
      text: `Receipt ${r.receiptNo} issued`,
      time: new Date(r.issuedAt).toLocaleDateString(),
      color: "#00d4ff",
    })),
    ...(contractsList || []).slice(0, 2).map((c) => ({
      icon: c.status === "finalized" ? CheckCircle2 : AlertCircle,
      text: `Contract "${c.title}" ${c.status}`,
      time: c.finalizedAt
        ? new Date(c.finalizedAt).toLocaleDateString()
        : "Draft",
      color: c.status === "finalized" ? "#00e5a0" : "#ffb800",
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={docs?.length || 0}
          trend="+12% this month"
          trendUp
          icon={<FileText className="w-5 h-5 text-cyan" />}
          accentColor="#00d4ff"
        />
        <StatCard
          label="Pending Signatures"
          value={pendingSigs}
          trend="2 urgent"
          trendUp={false}
          icon={<FileSignature className="w-5 h-5 text-trust-warning" />}
          accentColor="#ffb800"
        />
        <StatCard
          label="Receipts Issued"
          value={receipts?.length || 0}
          trend="+8% this month"
          trendUp
          icon={<Receipt className="w-5 h-5 text-cyan" />}
          accentColor="#00d4ff"
        />
        <StatCard
          label="Chain Status"
          value="Active"
          trend="Synced #42,891,023"
          trendUp
          icon={<Link2 className="w-5 h-5 text-trust-success" />}
          accentColor="#00e5a0"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="glass-card p-5 hover:-translate-y-0.5 hover:border-[rgba(0,212,255,0.3)] hover:shadow-[0_4px_20px_rgba(0,212,255,0.08)] transition-all duration-300"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <p className="font-semibold text-sm text-trust-text mb-0.5">
              {action.label}
            </p>
            <p className="text-xs text-trust-text-secondary">{action.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity + Blockchain Viz */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-trust-text-muted text-center py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 pb-3 border-b border-[rgba(0,212,255,0.06)] last:border-0"
                >
                  <item.icon
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-trust-text truncate">
                      {item.text}
                    </p>
                    <p className="text-xs text-trust-text-muted mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
            Network Status
          </h3>
          <BlockchainViz />
          <div className="mt-4 pt-4 border-t border-[rgba(0,212,255,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-trust-text-secondary mb-1">
                  Polygon PoS Mainnet
                </p>
                <p className="font-mono-code font-medium text-xl text-cyan">
                  #42,891,023
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-trust-success">~0.001 MATIC</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-trust-success animate-pulse" />
                  <span className="text-xs text-trust-text-secondary">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Documents */}
      {(docs || []).length > 0 && (
        <GlassCard>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-syne font-bold text-lg text-trust-text">
              Recent Documents
            </h3>
            <Link
              to="/documents"
              className="text-xs text-cyan hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.08)]">
                  {["Name", "Type", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-trust-text-secondary uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(docs || []).slice(0, 5).map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.02)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-trust-text-muted" />
                        <span className="text-sm text-trust-text font-medium">
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono-code bg-[rgba(0,212,255,0.08)] text-cyan">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-4 py-3 font-mono-code text-xs text-trust-text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
