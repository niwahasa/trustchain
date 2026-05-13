import { useState } from "react";
import {
  FileText,
  Search,
  Upload,
  MoreVertical,
  FilePlus,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";

const filters = ["all", "document", "contract", "receipt", "certificate"];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: docs, isLoading } = trpc.document.list.useQuery();

  const createDoc = trpc.document.create.useMutation({
    onSuccess: () => {
      utils.document.list.invalidate();
      setShowUpload(false);
      setTitle("");
      setDescription("");
    },
  });

  const anchorDoc = trpc.document.anchor.useMutation({
    onSuccess: () => utils.document.list.invalidate(),
  });

  const deleteDoc = trpc.document.delete.useMutation({
    onSuccess: () => utils.document.list.invalidate(),
  });

  const filtered = (docs || []).filter((d) => {
    const matchesSearch =
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.verificationId.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || d.docType === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const mockHash = Array.from({ length: 64 }, () =>
      "0123456789abcdef".charAt(Math.floor(Math.random() * 16))
    ).join("");
    createDoc.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      fileHash: mockHash,
      docType: "document",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-syne font-bold text-2xl text-trust-text">
          Documents
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trust-text-muted" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-navy-surface border border-[rgba(0,212,255,0.1)] rounded-lg pl-9 pr-4 py-2.5 text-sm text-trust-text placeholder:text-trust-text-muted focus:outline-none focus:border-cyan/30 w-64"
            />
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary flex items-center gap-2 text-sm py-2.5"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <GlassCard className="animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-syne font-bold text-lg text-trust-text mb-4">
            Upload Document
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="input-trust w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-trust-text-secondary mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={3}
                className="input-trust w-full resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={createDoc.isPending}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {createDoc.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FilePlus className="w-4 h-4" />
                )}
                Create Document
              </button>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-md text-[13px] font-medium transition-all",
              activeFilter === f
                ? "bg-[rgba(0,212,255,0.1)] text-cyan"
                : "text-trust-text-secondary hover:bg-[rgba(0,212,255,0.04)]"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-cyan animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="w-16 h-16 text-[rgba(0,212,255,0.15)] mb-4" />
            <h3 className="font-syne font-bold text-xl text-trust-text mb-2">
              {docs?.length === 0 ? "No documents yet" : "No matching documents"}
            </h3>
            <p className="text-sm text-trust-text-secondary mb-6">
              {docs?.length === 0
                ? "Upload your first document to get started."
                : "Try adjusting your search or filters."}
            </p>
            {docs?.length === 0 && (
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary text-sm"
              >
                Upload Document
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(0,212,255,0.08)]">
                  {["Name", "Type", "Status", "Verification ID", "Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold text-trust-text-secondary uppercase tracking-wider px-6 py-4"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-[rgba(0,212,255,0.04)] hover:bg-[rgba(0,212,255,0.02)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-trust-text-muted flex-shrink-0" />
                        <span className="text-sm text-trust-text font-medium">
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono-code bg-[rgba(0,212,255,0.08)] text-cyan">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 font-mono-code text-xs text-cyan">
                      {doc.verificationId}
                    </td>
                    <td className="px-6 py-4 font-mono-code text-xs text-trust-text-muted">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.status === "draft" && (
                          <button
                            onClick={() => anchorDoc.mutate({ id: doc.id })}
                            disabled={anchorDoc.isPending}
                            className="p-1.5 rounded hover:bg-[rgba(0,229,160,0.1)] text-trust-success transition-colors"
                            title="Anchor to blockchain"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Delete this document?")) {
                              deleteDoc.mutate({ id: doc.id });
                            }
                          }}
                          className="p-1.5 rounded hover:bg-[rgba(255,64,96,0.1)] text-trust-text-muted hover:text-trust-danger transition-colors"
                          title="Delete"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
