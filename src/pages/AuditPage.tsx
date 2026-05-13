import { Loader2, FileText, FileSignature, Receipt, UserPlus, ShieldCheck, Lock, Unlock, AlertCircle } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { trpc } from "@/providers/trpc";

const eventIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  document_created: FileText,
  document_anchored: ShieldCheck,
  document_signed: FileSignature,
  document_deleted: AlertCircle,
  contract_created: FileText,
  contract_finalized: ShieldCheck,
  contract_updated: FileText,
  contract_revoked: AlertCircle,
  receipt_issued: Receipt,
  receipt_paid: Lock,
  receipt_cancelled: AlertCircle,
  signer_invited: UserPlus,
  user_registered: UserPlus,
  user_login: Unlock,
};

const eventColors: Record<string, string> = {
  document_created: "#00d4ff",
  document_anchored: "#00e5a0",
  document_signed: "#1a56db",
  document_deleted: "#ff4060",
  contract_created: "#00d4ff",
  contract_finalized: "#00e5a0",
  contract_updated: "#ffb800",
  contract_revoked: "#ff4060",
  receipt_issued: "#00d4ff",
  receipt_paid: "#00e5a0",
  receipt_cancelled: "#ff4060",
  signer_invited: "#a78bfa",
  user_registered: "#00e5a0",
  user_login: "#00d4ff",
};

export default function AuditPage() {
  const { data: logs, isLoading } = trpc.audit.list.useQuery();

  return (
    <div className="space-y-6">
      <h1 className="font-syne font-bold text-2xl text-trust-text">Audit Log</h1>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-cyan animate-spin" />
          </div>
        ) : logs?.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck className="w-12 h-12 text-trust-text-muted mx-auto mb-4" />
            <h3 className="font-syne font-bold text-lg text-trust-text mb-2">
              No audit entries
            </h3>
            <p className="text-sm text-trust-text-secondary">
              Activity will appear here as you use TrustChain.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[rgba(0,212,255,0.1)]" />

            <div className="space-y-0">
              {(logs || []).map((log) => {
                const Icon = eventIcons[log.event] || FileText;
                const color = eventColors[log.event] || "#8aa0c0";
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-5 px-6 py-4 hover:bg-[rgba(0,212,255,0.02)] transition-colors relative"
                  >
                    {/* Dot */}
                    <div
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 z-10"
                      style={{
                        backgroundColor: `${color}20`,
                        borderColor: color,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
                        <span className="text-sm font-medium text-trust-text capitalize">
                          {log.event.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-trust-text-muted ml-auto flex-shrink-0">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-trust-text-secondary">
                        {log.entityType}: {log.entityId}
                      </p>
                      {log.metadata ? (
                        <p className="text-xs text-trust-text-muted mt-1 font-mono-code">
                          {(() => {
                            try {
                              return JSON.stringify(log.metadata).slice(0, 100);
                            } catch {
                              return String(log.metadata).slice(0, 100);
                            }
                          })()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
