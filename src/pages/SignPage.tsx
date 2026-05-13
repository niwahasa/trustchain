import { useParams } from "react-router";
import { ShieldCheck, Loader2, FileText, CheckCircle2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";

export default function SignPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading } = trpc.document.getByToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  const signMutation = trpc.document.signByToken.useMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-deepest flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-navy-deepest flex items-center justify-center px-4">
        <GlassCard className="text-center py-12 max-w-md">
          <ShieldCheck className="w-16 h-16 text-trust-text-muted mx-auto mb-4" />
          <h2 className="font-syne font-bold text-xl text-trust-text mb-2">
            Invalid Link
          </h2>
          <p className="text-sm text-trust-text-secondary">
            This signing link is invalid or has expired.
          </p>
        </GlassCard>
      </div>
    );
  }

  const { signer, document: doc } = data;
  const alreadySigned = !!signer.signedAt;

  return (
    <div className="min-h-screen bg-navy-deepest flex items-center justify-center px-4 py-12">
      <GlassCard className="max-w-xl w-full p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-cyan" />
          </div>
          <h2 className="font-syne font-bold text-2xl text-trust-text mb-1">
            Document Signature Request
          </h2>
          <p className="text-sm text-trust-text-secondary">
            Review and sign the document below
          </p>
        </div>

        {/* Document Info */}
        <div className="bg-navy-mid rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-syne font-bold text-lg text-trust-text">
              {doc?.title || "Untitled Document"}
            </h3>
            <StatusBadge status={alreadySigned ? "verified" : "pending"} />
          </div>
          {doc?.verificationId && (
            <p className="font-mono-code text-sm text-cyan mb-2">
              {doc.verificationId}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-trust-text-secondary">
            <span>Requested by: {signer.role}</span>
          </div>
        </div>

        {/* Signature Area */}
        {!alreadySigned && !signMutation.isSuccess && (
          <div className="border-2 border-dashed border-[rgba(0,212,255,0.2)] rounded-xl h-48 flex items-center justify-center mb-6 bg-navy-mid/50">
            <p className="text-sm text-trust-text-secondary">
              Click the button below to sign this document
            </p>
          </div>
        )}

        {/* Sign Button */}
        {alreadySigned ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-trust-success mx-auto mb-3" />
            <p className="font-syne font-bold text-lg text-trust-success mb-1">
              Already Signed
            </p>
            <p className="text-sm text-trust-text-secondary">
              You signed this document on{" "}
              {new Date(signer.signedAt!).toLocaleString()}
            </p>
          </div>
        ) : signMutation.isSuccess ? (
          <div className="text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-trust-success mx-auto mb-3" />
            <p className="font-syne font-bold text-lg text-trust-success mb-1">
              Signed Successfully
            </p>
            <p className="text-sm text-trust-text-secondary">
              Your signature has been permanently recorded on the blockchain.
            </p>
            {signMutation.data?.txHash && (
              <p className="font-mono-code text-xs text-trust-text-muted mt-2">
                TX: {signMutation.data.txHash.slice(0, 20)}...
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => token && signMutation.mutate({ token })}
            disabled={signMutation.isPending}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
          >
            {signMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            {signMutation.isPending ? "Signing..." : "Sign Document"}
          </button>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[rgba(0,212,255,0.08)] text-center">
          <p className="text-xs text-trust-text-muted">
            By signing, you agree that your signature will be permanently
            recorded on the TrustChain blockchain.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
