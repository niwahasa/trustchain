import { useState } from "react";
import {
  Receipt,
  Plus,
  Loader2,
  Trash2,
  DollarSign,
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/providers/trpc";

interface LineItem {
  desc: string;
  qty: number;
  price: number;
}

const themes = [
  { name: "Midnight Blue", key: "midnight", border: "#00d4ff", accent: "#00d4ff", grad: "from-[#0f2040] to-[#1a56db]" },
  { name: "Deep Violet", key: "deep-violet", border: "#a78bfa", accent: "#a78bfa", grad: "from-[#1e1b4b] to-[#312e81]" },
  { name: "Forest Green", key: "forest", border: "#34d399", accent: "#34d399", grad: "from-[#064e3b] to-[#065f46]" },
];

export default function ReceiptsPage() {
  const [showNew, setShowNew] = useState(false);
  const [activeTheme, setActiveTheme] = useState("midnight");
  const [bizName, setBizName] = useState("");
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ desc: "", qty: 1, price: 0 }]);
  const [taxPercent, setTaxPercent] = useState(18);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: receipts, isLoading } = trpc.receipt.list.useQuery();

  const createReceipt = trpc.receipt.create.useMutation({
    onSuccess: () => {
      utils.receipt.list.invalidate();
      setShowNew(false);
      resetForm();
    },
  });

  const markPaid = trpc.receipt.markPaid.useMutation({
    onSuccess: () => utils.receipt.list.invalidate(),
  });

  const resetForm = () => {
    setBizName("");
    setCustName("");
    setCustEmail("");
    setReceiptNo("");
    setItems([{ desc: "", qty: 1, price: 0 }]);
    setTaxPercent(18);
    setDiscountPercent(0);
    setNotes("");
  };

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal + taxAmount - discountAmount;

  const themeConfig = themes.find((t) => t.key === activeTheme) || themes[0];

  const addItem = () => setItems([...items, { desc: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: value };
    setItems(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !custName.trim() || !receiptNo.trim()) return;
    const validItems = items.filter((i) => i.desc.trim());
    if (validItems.length === 0) return;
    createReceipt.mutate({
      receiptNo,
      businessName: bizName,
      customerName: custName,
      customerEmail: custEmail,
      items: validItems,
      currency: "UGX",
      taxPercent,
      discountPercent,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      notes: notes || undefined,
      theme: activeTheme,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-syne font-bold text-2xl text-trust-text">Receipts</h1>
        <button
          onClick={() => setShowNew(!showNew)}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          <Plus className="w-4 h-4" />
          Issue Receipt
        </button>
      </div>

      {showNew && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <GlassCard className="lg:col-span-3">
            <h3 className="font-syne font-bold text-lg text-trust-text mb-5">
              Issue Receipt
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-trust-text uppercase tracking-wider block mb-2">
                  Receipt Number
                </label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="INV-2025-001"
                  className="input-trust w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-trust-text uppercase tracking-wider block mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Your Business"
                  className="input-trust w-full"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-trust-text uppercase tracking-wider block mb-2">
                  Customer
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Customer Name"
                    className="input-trust w-full"
                  />
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="Customer Email"
                    className="input-trust w-full"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <label className="text-xs font-semibold text-trust-text uppercase tracking-wider block mb-2">
                  Line Items
                </label>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.desc}
                        onChange={(e) => updateItem(i, "desc", e.target.value)}
                        placeholder="Description"
                        className="input-trust flex-1 text-sm py-2"
                      />
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                        min={1}
                        className="input-trust w-16 text-sm py-2 text-center"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                        min={0}
                        className="input-trust w-24 text-sm py-2"
                        placeholder="Price"
                      />
                      <span className="font-mono-code text-sm text-trust-text w-20 text-right">
                        UGX {(item.qty * item.price).toLocaleString()}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-trust-danger hover:bg-[rgba(255,64,96,0.1)] p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-cyan text-sm font-medium mt-2 hover:underline"
                >
                  + Add Item
                </button>
              </div>

              {/* Tax, Discount, Theme */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-trust-text-secondary block mb-1">
                    Tax %
                  </label>
                  <input
                    type="number"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="input-trust w-full text-sm py-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-trust-text-secondary block mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="input-trust w-full text-sm py-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-trust-text-secondary block mb-1">
                    Theme
                  </label>
                  <div className="flex gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setActiveTheme(t.key)}
                        className="px-3 py-2 rounded-full text-xs font-medium border transition-all"
                        style={{
                          borderColor: activeTheme === t.key ? t.border : "rgba(0,212,255,0.1)",
                          color: activeTheme === t.key ? t.accent : "#8aa0c0",
                        }}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-trust-text-secondary block mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                  className="input-trust w-full resize-none text-sm"
                />
              </div>

              {/* Totals */}
              <div className="border-t border-[rgba(0,212,255,0.1)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-trust-text-secondary">Subtotal</span>
                  <span className="font-mono-code text-trust-text">
                    UGX {subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-trust-text-secondary">Tax ({taxPercent}%)</span>
                  <span className="font-mono-code text-trust-text">
                    UGX {taxAmount.toLocaleString()}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-trust-text-secondary">
                      Discount ({discountPercent}%)
                    </span>
                    <span className="font-mono-code text-trust-success">
                      -UGX {discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[rgba(0,212,255,0.1)] pt-3">
                  <span className="font-semibold text-trust-text">Total</span>
                  <span className="font-syne font-bold text-xl" style={{ color: themeConfig.accent }}>
                    UGX {total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createReceipt.isPending}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {createReceipt.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Issue Receipt
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

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <GlassCard className="p-0 overflow-hidden">
                <div className={`bg-gradient-to-r ${themeConfig.grad} p-6`}>
                  <h4 className="font-syne font-extrabold text-2xl text-trust-text">
                    RECEIPT
                  </h4>
                  <p className="font-mono-code text-xs text-trust-text/70 mt-1">
                    {receiptNo || "INV-2025-XXX"}
                  </p>
                </div>
                <div className="bg-navy-mid p-6">
                  <p className="font-syne font-bold text-base text-trust-text mb-4">
                    {bizName || "Your Business"}
                  </p>
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-trust-text-secondary uppercase">
                      Bill To
                    </span>
                    <p className="text-sm text-trust-text mt-1">
                      {custName || "Customer Name"}
                    </p>
                    {custEmail && (
                      <p className="text-xs text-trust-text-secondary">{custEmail}</p>
                    )}
                  </div>
                  <div className="border-t border-[rgba(0,212,255,0.1)] pt-3">
                    <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold text-trust-text-secondary uppercase mb-2">
                      <span>Description</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Price</span>
                      <span className="text-right">Total</span>
                    </div>
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-4 gap-2 text-xs text-trust-text py-1"
                      >
                        <span className="truncate">{item.desc || "—"}</span>
                        <span className="text-center">{item.qty}</span>
                        <span className="text-right font-mono-code">
                          {item.price.toLocaleString()}
                        </span>
                        <span className="text-right font-mono-code">
                          {(item.qty * item.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[rgba(0,212,255,0.1)] pt-3 mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-trust-text-secondary">Subtotal</span>
                      <span className="font-mono-code text-trust-text">
                        {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-trust-text-secondary">Tax</span>
                      <span className="font-mono-code text-trust-text">
                        {taxAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-1">
                      <span className="text-trust-text">Total</span>
                      <span className="font-syne" style={{ color: themeConfig.accent }}>
                        UGX {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {notes && (
                    <div className="mt-4 border-l-2 border-cyan/30 pl-3">
                      <p className="text-xs text-trust-text-secondary">{notes}</p>
                    </div>
                  )}
                </div>
                <div className="bg-navy-deepest px-6 py-4">
                  <p className="text-[11px] font-medium text-trust-text-muted">
                    Secured by TrustChain
                  </p>
                  <p className="font-mono-code text-[9px] text-trust-text-muted mt-1">
                    {Array.from({ length: 32 }, () =>
                      "0123456789abcdef".charAt(Math.floor(Math.random() * 16))
                    ).join("")}
                  </p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Receipt List */}
      {!showNew && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-cyan animate-spin" />
            </div>
          ) : receipts?.length === 0 ? (
            <GlassCard className="text-center py-16">
              <Receipt className="w-16 h-16 text-[rgba(0,212,255,0.15)] mx-auto mb-4" />
              <h3 className="font-syne font-bold text-xl text-trust-text mb-2">
                No receipts yet
              </h3>
              <p className="text-sm text-trust-text-secondary mb-6">
                Issue your first receipt to get started.
              </p>
              <button onClick={() => setShowNew(true)} className="btn-primary text-sm">
                Issue Receipt
              </button>
            </GlassCard>
          ) : (
            receipts?.map((r) => (
              <GlassCard key={r.id} className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-syne font-bold text-base text-trust-text">
                      {r.receiptNo}
                    </h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs font-mono-code text-cyan mb-1">{r.receiptId}</p>
                  <div className="flex items-center gap-4 text-xs text-trust-text-secondary">
                    <span>{r.businessName}</span>
                    <span>→</span>
                    <span>{r.customerName}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-syne font-bold text-lg" style={{ color: themeConfig.accent }}>
                    UGX {r.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {r.status !== "paid" && (
                      <button
                        onClick={() => markPaid.mutate({ id: r.id })}
                        disabled={markPaid.isPending}
                        className="p-1.5 rounded hover:bg-[rgba(0,229,160,0.1)] text-trust-success transition-colors"
                        title="Mark Paid"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Delete this receipt?")) {
                          // delete mutation would go here
                        }
                      }}
                      className="p-1.5 rounded hover:bg-[rgba(255,64,96,0.1)] text-trust-text-muted hover:text-trust-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
