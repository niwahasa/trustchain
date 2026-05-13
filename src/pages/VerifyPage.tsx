import { useState } from "react";
import { Search, Upload, CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";

export default function VerifyPage() {
  const [id, setId] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: result, isLoading } = trpc.verify.byId.useQuery(
    { id },
    { enabled: searched && id.length > 0, retry: false }
  );

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    setSearched(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-syne font-bold text-3xl md:text-4xl text-trust-text mb-3">
          Verify Document
        </h1>
        <p className="text-trust-text-secondary">
          Enter a TrustChain ID or upload a document to verify its authenticity.
        </p>
      </div>

      <GlassCard className="p-10">
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setSearched(false);
            }}
            placeholder="TC-XXXX-XXXX or RCP-XXXX-XXXX"
            className="input-trust w-full font-mono-code text-lg text-center tracking-[0.08em]"
          />
          <button
            type="submit"
            disabled={isLoading || !id.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {isLoading ? "Verifying..." : "Verify Document"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(0,212,255,0.1)]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[rgba(10,22,40,0.65)] px-4 text-trust-text-muted font-medium">
              or
            </span>
          </div>
        </div>

        <div className="border-2 border-dashed border-[rgba(0,212,255,0.15)] rounded-xl p-10 text-center hover:border-[rgba(0,212,255,0.3)] transition-colors cursor-pointer">
          <Upload className="w-10 h-10 text-trust-text-muted mx-auto mb-3" />
          <p className="text-sm text-trust-text-secondary">
            Drop document here or click to browse
          </p>
        </div>
      </GlassCard>

      {/* Results */}
      {searched && result && (
        <GlassCard className="mt-6 p-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {result.found ? (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <CheckCircle2 className="w-8 h-8 text-trust-success" />
                <div>
                  <StatusBadge status="verified" />
                </div>
              </div>

              <h3 className="font-syne font-bold text-xl text-trust-text mb-6">
                {result.type === "document"
                  ? (result.data as { title: string })?.title
                  : `Receipt ${(result.data as { receiptNo: string })?.receiptNo}`}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-navy-mid rounded-lg p-4">
                  <span className="text-xs text-trust-text-secondary block mb-1">
                    {result.type === "document" ? "Anchored" : "Issued"}
                  </span>
                  <span className="font-mono-code text-sm text-trust-text-secondary">
                    {result.data
                      ? new Date(
                          (result.data as { anchoredAt?: Date | null; issuedAt?: Date | null }).anchoredAt ||
                          (result.data as { anchoredAt?: Date | null; issuedAt?: Date | null }).issuedAt ||
                          Date.now()
                        ).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="bg-navy-mid rounded-lg p-4">
                  <span className="text-xs text-trust-text-secondary block mb-1">
                    Verification ID
                  </span>
                  <span className="font-mono-code text-sm text-cyan">
                    {(result.data as { verificationId?: string; receiptId?: string })?.verificationId ||
                      (result.data as { receiptId?: string })?.receiptId ||
                      "N/A"}
                  </span>
                </div>
                <div className="bg-navy-mid rounded-lg p-4">
                  <span className="text-xs text-trust-text-secondary block mb-1">
                    File Hash
                  </span>
                  <span className="font-mono-code text-sm text-trust-text-secondary">
                    {result.data?.fileHash
                      ? `${result.data.fileHash.slice(0, 12)}...${result.data.fileHash.slice(-8)}`
                      : "N/A"}
                  </span>
                </div>
                <div className="bg-navy-mid rounded-lg p-4">
                  <span className="text-xs text-trust-text-secondary block mb-1">
                    Status
                  </span>
                  <StatusBadge status={result.data?.status || "unknown"} />
                </div>
              </div>

              {result.chain && (
                <div className="mt-6 pt-5 border-t border-[rgba(0,212,255,0.08)]">
                  <h4 className="font-syne font-bold text-sm text-trust-text mb-3">
                    Blockchain Proof
                  </h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-trust-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-trust-success" />
                      {result.chain.exists ? "Confirmed on-chain" : "Pending"}
                    </span>
                    <a
                      href="#"
                      className="text-cyan hover:underline flex items-center gap-1"
                    >
                      View on PolygonScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-trust-danger mx-auto mb-4" />
              <h3 className="font-syne font-bold text-xl text-trust-text mb-2">
                Not Found
              </h3>
              <p className="text-sm text-trust-text-secondary">
                {(result as { message?: string })?.message || "Document not found"}
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
