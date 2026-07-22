import { ctaClassName } from "@/components/cta";
import { CAN_ACCEPT_ONLINE_DONATIONS, MINISTRY } from "@/lib/ministry";

// This is the only component that should ever need to change to wire up real
// checkout. Today every giving path opens a mailto: — see COMPLIANCE.md's
// "Before switching on real payments" checklist for what has to be true
// before that changes. When it's time, swap the <a> below for a real Stripe
// Checkout redirect (or embedded form) and leave every call site untouched;
// they only know about `intent` and `children`, never about mailto vs. Stripe.
const SUBJECTS: Record<"knight" | "legacy", string> = {
  knight: "Become a Knight",
  legacy: "Legacy Donations Inquiry",
};

export function DonateButton({
  intent,
  children,
}: {
  intent: "knight" | "legacy";
  children: React.ReactNode;
}) {
  const mailtoHref = `mailto:${MINISTRY.email}?subject=${encodeURIComponent(SUBJECTS[intent])}`;
  const href = CAN_ACCEPT_ONLINE_DONATIONS
    ? `/give?intent=${intent}`
    : mailtoHref;

  return (
    <a href={href} className={ctaClassName}>
      {children}
    </a>
  );
}
