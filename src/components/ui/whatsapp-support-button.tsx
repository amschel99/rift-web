interface Props {
  /**
   * "mobile" — anchored inside the centered mobile card, lifted above the
   * bottom tabs. "desktop" — anchored to the viewport corner.
   */
  position?: "mobile" | "desktop";
  /**
   * Phone number in international format **without** the leading "+".
   * Defaults to the Rift support line.
   */
  phone?: string;
  /** Pre-filled message that opens in WhatsApp. */
  message?: string;
}

/**
 * Floating "Chat with us on WhatsApp" support button.
 *
 *   <WhatsAppSupportButton position="mobile" />
 *
 * Renders a green FAB with the real WhatsApp glyph (served by Simple Icons'
 * CDN — `https://cdn.simpleicons.org/whatsapp/FFFFFF` is the canonical
 * white-on-transparent SVG of the WhatsApp mark). Clicking opens
 * `https://wa.me/<phone>?text=<message>` in a new tab, which on mobile
 * deep-links straight into the WhatsApp app and on desktop opens WhatsApp
 * Web / the desktop client.
 */
export default function WhatsAppSupportButton({
  position = "desktop",
  phone = "33674547186",
  message = "Hi Rift support, I need help with…",
}: Props) {
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  // Mobile: pin to the bottom-right of the mobile card (the parent uses
  // `position: relative`), and lift above the bottom tabs.
  // Desktop: pin to the bottom-right of the viewport with comfy margins.
  const positionClass =
    position === "mobile"
      ? "absolute right-4 bottom-[5.5rem] z-40"
      : "fixed right-6 bottom-6 z-40";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Rift support on WhatsApp"
      className={`${positionClass} group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_8px_24px_-4px_rgba(37,211,102,0.55)] hover:shadow-[0_10px_28px_-4px_rgba(37,211,102,0.65)] hover:scale-[1.04] active:scale-95 transition-all`}
    >
      <img
        src="https://cdn.simpleicons.org/whatsapp/FFFFFF"
        alt=""
        width={28}
        height={28}
        className="w-7 h-7 select-none"
        draggable={false}
      />
      {/* Subtle pulsing ring to draw attention on first paint. */}
      <span
        className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-60"
        style={{ animationDuration: "2.4s" }}
        aria-hidden
      />
    </a>
  );
}
