import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { BiCopy } from "react-icons/bi";
import { Check, Download, Share2 } from "lucide-react";
import useCreateInvoice from "@/hooks/data/use-create-invoice";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [5, 10, 25, 50, 100, 250];
const MONO = '"JetBrains Mono", monospace';
const DISPLAY = '"Clash Display", "Satoshi", sans-serif';

type Tab = "qr" | "amount";

// Persistent open-amount payment link. Once we create one, we cache its
// URL in localStorage and never re-create it on subsequent visits. This is
// the QR the merchant prints, sticks next to their till, or shares to a
// WhatsApp status. Namespaced by wallet address so switching accounts
// doesn't show someone else's link.
function persistentKeyFor(address: string): string {
  return `rift_merchant_persistent_url${address ? `_${address}` : ""}`;
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

export default function Merchant() {
  const address = localStorage.getItem("address") || "";
  const storageKey = persistentKeyFor(address);

  const [activeTab, setActiveTab] = useState<Tab>("qr");

  // Primary: the persistent payment URL.
  const [persistentUrl, setPersistentUrl] = useState<string | null>(() =>
    localStorage.getItem(storageKey)
  );
  const [bootstrapping, setBootstrapping] = useState(!persistentUrl);
  const [bootstrapError, setBootstrapError] = useState(false);

  // Specific-amount: form + result state. Preserved across tab switches
  // so the merchant can flip back to "Your QR" and return without losing
  // whatever they were charging.
  const [amountInput, setAmountInput] = useState("");
  const [specificUrl, setSpecificUrl] = useState<string | null>(null);
  const [specificAmount, setSpecificAmount] = useState<number | null>(null);

  // Per-card copy state so the checkmarks animate independently.
  const [copiedPersistent, setCopiedPersistent] = useState(false);
  const [copiedSpecific, setCopiedSpecific] = useState(false);

  const persistentQrRef = useRef<SVGSVGElement>(null);
  const specificQrRef = useRef<SVGSVGElement>(null);

  const createInvoice = useCreateInvoice();

  // Bootstrap the persistent invoice on first visit. We create one open
  // invoice (amount=0) per wallet, cache its URL, and re-use it forever.
  useEffect(() => {
    if (persistentUrl || !address) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await createInvoice.mutateAsync({
          description: "Rift payment link",
          chain: "BASE",
          token: "USDC",
          amount: 0,
        });
        if (cancelled) return;
        const url: string = result?.url || result?.data?.url || "";
        if (!url) throw new Error("no url");
        localStorage.setItem(storageKey, url);
        setPersistentUrl(url);
        setBootstrapping(false);
      } catch {
        if (cancelled) return;
        setBootstrapping(false);
        setBootstrapError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, address]);

  const parsedAmount = parseFloat(amountInput);
  const amountValid = !isNaN(parsedAmount) && parsedAmount > 0;

  const handleCreateSpecific = async () => {
    if (!amountValid) return;
    try {
      const result = await createInvoice.mutateAsync({
        description: `Rift charge for $${parsedAmount.toFixed(2)}`,
        chain: "BASE",
        token: "USDC",
        amount: parsedAmount,
      });
      const url: string = result?.url || result?.data?.url || "";
      if (!url) throw new Error("no url");
      setSpecificUrl(url);
      setSpecificAmount(parsedAmount);
    } catch {
      toast.error("Couldn't create the link. Try again.");
    }
  };

  const handleCopy = (url: string, marker: "persistent" | "specific") => {
    navigator.clipboard.writeText(url);
    if (marker === "persistent") {
      setCopiedPersistent(true);
      setTimeout(() => setCopiedPersistent(false), 1500);
    } else {
      setCopiedSpecific(true);
      setTimeout(() => setCopiedSpecific(false), 1500);
    }
    toast.success("Link copied");
  };

  const handleShare = (url: string, marker: "persistent" | "specific") => {
    if (navigator.share) {
      navigator.share({ url, title: "Pay me via Rift" }).catch(() => {});
    } else {
      handleCopy(url, marker);
    }
  };

  // Render the QR SVG into a square white PNG so it prints cleanly.
  const handleDownloadQr = (svgEl: SVGSVGElement | null, filename: string) => {
    if (!svgEl) return;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement("canvas");
    const size = 640;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([svgStr], { type: "image/svg+xml" })
    );
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      const pad = 48;
      ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = filename;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  };

  const resetAmountForm = () => {
    setSpecificUrl(null);
    setSpecificAmount(null);
    setAmountInput("");
  };

  // ── Tab bar ──────────────────────────────────────────────────────────
  const tabBar = (
    <div className="relative grid grid-cols-2 p-1 rounded-2xl bg-white border border-black/[0.06] shadow-sm mb-6">
      {([
        { id: "qr" as Tab, label: "Your QR" },
        { id: "amount" as Tab, label: "Specific amount" },
      ]).map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "relative py-2.5 text-[13px] font-semibold rounded-xl transition-colors",
            activeTab === tab.id
              ? "text-white"
              : "text-text-default hover:text-accent-primary"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="merchant-tab-pill"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-accent-primary shadow-[0_4px_14px_-4px_rgba(46,140,150,0.6)]"
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  // ── Your QR tab ──────────────────────────────────────────────────────
  const yourQrTab = (
    <div className="rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_28px_-12px_rgba(15,42,56,0.18)] p-6">
      {bootstrapping ? (
        <div className="flex flex-col items-center py-10">
          <div className="h-[220px] w-[220px] rounded-2xl bg-app-background/60 flex items-center justify-center">
            <span className="h-7 w-7 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
          </div>
          <p className="mt-5 text-[13px] text-text-subtle/80">
            Setting up your QR…
          </p>
        </div>
      ) : bootstrapError ? (
        <div className="flex flex-col items-center py-10 text-center">
          <p className="text-[14px] font-medium text-text-default">
            Couldn't set up your QR
          </p>
          <p className="text-[12.5px] text-text-subtle/80 mt-1 max-w-[280px]">
            We hit a snag creating your payment link. Try reloading the page.
          </p>
          <button
            onClick={() => {
              setBootstrapError(false);
              setBootstrapping(true);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-accent-primary text-white text-[13px] font-semibold"
          >
            Try again
          </button>
        </div>
      ) : persistentUrl ? (
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-primary/80 mb-3">
            Your payment QR
          </p>

          <div className="rounded-2xl bg-white border border-black/[0.06] p-5 mb-5">
            <QRCodeSVG
              ref={persistentQrRef}
              value={persistentUrl}
              size={220}
              level="M"
              fgColor="#0B1620"
              bgColor="#ffffff"
            />
          </div>

          <button
            onClick={() => handleCopy(persistentUrl, "persistent")}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 bg-app-background border border-gray-200 hover:border-accent-primary transition-colors active:scale-[0.99] mb-3"
          >
            <span
              className="truncate text-[12px] text-text-default"
              style={{ fontFamily: MONO }}
            >
              {stripProtocol(persistentUrl)}
            </span>
            {copiedPersistent ? (
              <Check className="h-4 w-4 flex-shrink-0 text-accent-primary" />
            ) : (
              <BiCopy className="h-4 w-4 flex-shrink-0 text-text-subtle/60" />
            )}
          </button>

          <div className="grid w-full grid-cols-3 gap-2.5">
            <button
              onClick={() => handleCopy(persistentUrl, "persistent")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-text-default hover:text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            >
              <BiCopy className="h-[18px] w-[18px]" />
              <span className="text-[11.5px] font-semibold">Copy link</span>
            </button>
            <button
              onClick={() => handleShare(persistentUrl, "persistent")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-text-default hover:text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            >
              <Share2 className="h-[18px] w-[18px]" />
              <span className="text-[11.5px] font-semibold">Share</span>
            </button>
            <button
              onClick={() =>
                handleDownloadQr(
                  persistentQrRef.current,
                  "rift-payment-qr.png"
                )
              }
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-text-default hover:text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            >
              <Download className="h-[18px] w-[18px]" />
              <span className="text-[11.5px] font-semibold">Save image</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );

  // ── Specific amount tab ──────────────────────────────────────────────
  const specificAmountTab = (
    <div className="rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_28px_-12px_rgba(15,42,56,0.18)] p-6">
      {!specificUrl ? (
        <>
          <div className="rounded-xl bg-app-background border border-black/[0.04] p-5 mb-4">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-text-subtle/70 mb-3">
              Charge
            </p>
            <div className="flex items-center justify-center gap-1">
              <span
                className="text-2xl font-semibold text-accent-primary/70 mt-1"
                style={{ fontFamily: MONO }}
              >
                $
              </span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                autoFocus
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full max-w-[200px] bg-transparent text-center text-[48px] leading-none font-bold tracking-tight text-text-default placeholder:text-text-subtle/25 focus:outline-none"
                style={{ fontFamily: MONO }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5">
              {QUICK_AMOUNTS.map((amt) => {
                const active = parsedAmount === amt;
                return (
                  <button
                    key={amt}
                    onClick={() => setAmountInput(String(amt))}
                    className={cn(
                      "py-2 rounded-lg text-[12.5px] font-semibold transition-all active:scale-95",
                      active
                        ? "bg-accent-primary text-white"
                        : "bg-white border border-gray-200 text-text-default hover:border-accent-primary"
                    )}
                  >
                    ${amt}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCreateSpecific}
            disabled={!amountValid || createInvoice.isPending}
            className="w-full rounded-xl py-3.5 font-semibold text-[14px] text-white bg-accent-primary disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {createInvoice.isPending ? "Creating…" : "Create link"}
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-primary/80 mb-3">
            Charge for ${specificAmount!.toFixed(2)}
          </p>

          <div className="rounded-2xl bg-white border border-black/[0.06] p-5 mb-5">
            <QRCodeSVG
              ref={specificQrRef}
              value={specificUrl}
              size={220}
              level="M"
              fgColor="#0B1620"
              bgColor="#ffffff"
            />
          </div>

          <button
            onClick={() => handleCopy(specificUrl, "specific")}
            className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 bg-app-background border border-gray-200 hover:border-accent-primary transition-colors active:scale-[0.99] mb-3"
          >
            <span
              className="truncate text-[12px] text-text-default"
              style={{ fontFamily: MONO }}
            >
              {stripProtocol(specificUrl)}
            </span>
            {copiedSpecific ? (
              <Check className="h-4 w-4 flex-shrink-0 text-accent-primary" />
            ) : (
              <BiCopy className="h-4 w-4 flex-shrink-0 text-text-subtle/60" />
            )}
          </button>

          <div className="grid w-full grid-cols-3 gap-2.5">
            <button
              onClick={() => handleCopy(specificUrl, "specific")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-text-default hover:text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            >
              <BiCopy className="h-[18px] w-[18px]" />
              <span className="text-[11.5px] font-semibold">Copy link</span>
            </button>
            <button
              onClick={() => handleShare(specificUrl, "specific")}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-text-default hover:text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            >
              <Share2 className="h-[18px] w-[18px]" />
              <span className="text-[11.5px] font-semibold">Share</span>
            </button>
            <button
              onClick={() =>
                handleDownloadQr(
                  specificQrRef.current,
                  `rift-charge-${specificAmount}.png`
                )
              }
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-text-default hover:text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            >
              <Download className="h-[18px] w-[18px]" />
              <span className="text-[11.5px] font-semibold">Save image</span>
            </button>
          </div>

          <button
            onClick={resetAmountForm}
            className="mt-5 text-[12.5px] font-semibold text-accent-primary"
          >
            Create another
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-app-background">
      <div className="relative z-10 mx-auto w-full max-w-md px-5 pt-7 pb-12">
        <div className="mb-6">
          <h1
            className="text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] text-text-default"
            style={{ fontFamily: DISPLAY }}
          >
            Get paid
          </h1>
          <p className="text-[13.5px] text-text-subtle/85 mt-1.5">
            Anyone with a crypto wallet can scan and pay you.
          </p>
        </div>

        {tabBar}

        <AnimatePresence mode="wait">
          {activeTab === "qr" ? (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {yourQrTab}
            </motion.div>
          ) : (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {specificAmountTab}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
