import { useState } from "react";
import {
  FileSignature,
  Plus,
  Loader2,
  FilePlus,
  ShieldCheck,
  Users,
  Trash2,
  Edit3,
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";

const templates = [
  { icon: FileSignature, title: "Non-Disclosure Agreement", desc: "Protect confidential information" },
  { icon: FileSignature, title: "Service Agreement", desc: "Define service terms" },
  { icon: FileSignature, title: "Employment Contract", desc: "Employee agreement" },
  { icon: FilePlus, title: "Start from Blank", desc: "Create custom contract" },
];

export default function ContractsPage() {
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const utils = trpc.useUtils();
  const { data: contracts, isLoading } = trpc.contract.list.useQuery();

  const createContract = trpc.contract.create.useMutation({
    onSuccess: () => {
      utils.contract.list.invalidate();
      setShowNew(false);
      setTitle("");
      setContent("");
    },
  });

  const finalizeContract = trpc.contract.finalize.useMutation({
    onSuccess: () => utils.contract.list.invalidate(),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createContract.mutate({ title: title.trim(), content: content.trim() });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-syne font-bold text-2xl text-trust-text">Contracts</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </button>
      </div>

      {showNew && (
        <GlassCard className="animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-syne font-bold text-lg text-trust-text mb-6">
            Create Contract
          </h3>

          {/* Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {templates.map((t, i) => (
              <button
                key={i}
                onClick={() => {
                  setTitle(t.title);
                  setContent(
                    t.title === "Start from Blank"
                      ? ""
                      : `\n\n${t.title}\n\nThis agreement is entered into between the parties as of the effective date.\n\n1. TERM\nThis agreement shall commence on the effective date and continue for the specified term.\n\n2. OBLIGATIONS\nEach party agrees to fulfill their respective obligations as outlined herein.\n\n3. CONFIDENTIALITY\nAll confidential information shall be protected.\n\n4. SIGNATURES\n\n_________________          _________________\nParty A                      Party B\n`
                  );
                }}
                className={cn(
                  "glass-card p-5 text-left hover:-translate-y-0.5 hover:border-[rgba(0,212,255,0.25)] transition-all",
                  title === t.title && "border-cyan bg-[rgba(0,212,255,0.05)]"
                )}
              >
                <t.icon className="w-7 h-7 text-cyan mb-3" />
                <h4 className="font-syne font-bold text-sm text-trust-text mb-1">
                  {t.title}
                </h4>
                <p className="text-xs text-trust-text-secondary">{t.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contract title"
                className="input-trust w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Contract content..."
                rows={12}
                className="input-trust w-full resize-none font-mono-code text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={createContract.isPending}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {createContract.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Contract
              </button>
              <button
                type="button"
                onClick={() => setShowNew(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Contract List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-cyan animate-spin" />
          </div>
        ) : contracts?.length === 0 ? (
          <GlassCard className="text-center py-16">
            <FileSignature className="w-16 h-16 text-[rgba(0,212,255,0.15)] mx-auto mb-4" />
            <h3 className="font-syne font-bold text-xl text-trust-text mb-2">
              No contracts yet
            </h3>
            <p className="text-sm text-trust-text-secondary mb-6">
              Create your first contract to get started.
            </p>
            <button onClick={() => setShowNew(true)} className="btn-primary text-sm">
              Create Contract
            </button>
          </GlassCard>
        ) : (
          contracts?.map((c) => (
            <GlassCard key={c.id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-syne font-bold text-base text-trust-text truncate">
                    {c.title}
                  </h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-trust-text-secondary font-mono-code mb-2">
                  {c.verificationId}
                </p>
                <p className="text-sm text-trust-text-secondary line-clamp-2">
                  {c.content.slice(0, 200)}...
                </p>
                {c.txHash && (
                  <p className="text-xs text-trust-text-muted mt-2 font-mono-code">
                    TX: {c.txHash.slice(0, 20)}...
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {c.status === "draft" && (
                  <button
                    onClick={() => finalizeContract.mutate({ id: c.id })}
                    disabled={finalizeContract.isPending}
                    className="p-2 rounded hover:bg-[rgba(0,229,160,0.1)] text-trust-success transition-colors"
                    title="Finalize"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 rounded hover:bg-[rgba(0,212,255,0.08)] text-trust-text-muted hover:text-cyan transition-colors">
                  <Users className="w-4 h-4" />
                </button>
                <button className="p-2 rounded hover:bg-[rgba(0,212,255,0.08)] text-trust-text-muted hover:text-cyan transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded hover:bg-[rgba(255,64,96,0.1)] text-trust-text-muted hover:text-trust-danger transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
