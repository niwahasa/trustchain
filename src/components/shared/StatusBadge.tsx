import { cn } from "@/lib/utils";

type Status = "verified" | "pending" | "draft" | "revoked" | "active" | "failed" | "issued" | "paid" | "cancelled" | "finalized";

const statusMap: Record<string, { class: string; label: string }> = {
  verified: { class: "status-verified", label: "Verified" },
  pending: { class: "status-pending", label: "Pending" },
  draft: { class: "status-draft", label: "Draft" },
  revoked: { class: "status-revoked", label: "Revoked" },
  active: { class: "status-verified", label: "Active" },
  failed: { class: "status-revoked", label: "Failed" },
  issued: { class: "status-verified", label: "Issued" },
  paid: { class: "status-verified", label: "Paid" },
  cancelled: { class: "status-revoked", label: "Cancelled" },
  finalized: { class: "status-verified", label: "Finalized" },
};

interface StatusBadgeProps {
  status: Status | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status.toLowerCase()] || {
    class: "status-draft",
    label: status,
  };

  return <span className={cn(config.class, className)}>{config.label}</span>;
}
