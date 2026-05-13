import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface HashDisplayProps {
  hash: string;
  truncate?: boolean;
  length?: number;
  className?: string;
  showCopy?: boolean;
}

export default function HashDisplay({
  hash,
  truncate = true,
  length = 12,
  className,
  showCopy = true,
}: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const display = truncate && hash.length > length * 2
    ? `${hash.slice(0, length)}...${hash.slice(-length)}`
    : hash;

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span
      className={cn(
        "font-mono-code text-sm inline-flex items-center gap-2",
        className
      )}
    >
      {display}
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-trust-text-muted hover:text-cyan transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-trust-success" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </span>
  );
}
