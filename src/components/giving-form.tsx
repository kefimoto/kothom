"use client";

import { useState } from "react";
import { ctaClassName } from "@/components/cta";

type Frequency = "monthly" | "annual" | "one-time";
type TShirtSize = "S" | "M" | "L" | "XL" | "2XL" | "3XL";

const FREQUENCIES: { id: Frequency; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual" },
  { id: "one-time", label: "One-Time" },
];

const PRESETS = [
  { amount: 25, label: "$25 Knights", tier: "Knights Member" },
  { amount: 50, label: "$50 Family Support", tier: "Family Support" },
  { amount: 100, label: "$100 Crisis Aid", tier: "Crisis Aid Partner" },
];

const TSHIRT_SIZES: TShirtSize[] = ["S", "M", "L", "XL", "2XL", "3XL"];

export function GivingForm() {
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [presetAmount, setPresetAmount] = useState<number | "custom">(25);
  const [customAmount, setCustomAmount] = useState<string>("25");
  const [tShirtSize, setTShirtSize] = useState<TShirtSize>("L");
  const [displayName, setDisplayName] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedAmount =
    presetAmount === "custom"
      ? Number.parseFloat(customAmount) || 0
      : presetAmount;

  const isEligibleForTShirt = selectedAmount >= 25;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedAmount || selectedAmount <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedAmount,
          frequency,
          tShirtSize: isEligibleForTShirt ? tShirtSize : undefined,
          displayName: isAnonymous ? "" : displayName,
          isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An error occurred during checkout.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="giving-options" className="bg-cream px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl border border-charcoal/20 bg-cream p-6 sm:p-10 rounded-none">
        <h2 className="font-headline text-2xl sm:text-3xl text-charcoal mb-3">
          Select Your Giving Options
        </h2>
        <p className="font-body text-charcoal/80 text-base sm:text-lg mb-8 leading-relaxed">
          Your tax-deductible contribution supports single-parent families in
          Central Florida with direct financial relief and 24/7 pastoral care.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Frequency Switcher */}
          <div>
            <label
              htmlFor="frequency-switcher"
              className="block font-headline text-sm font-semibold uppercase tracking-wider text-charcoal mb-3"
            >
              Giving Frequency
            </label>
            <div
              id="frequency-switcher"
              className="grid grid-cols-3 gap-2 border border-charcoal/20 p-1 bg-cream rounded-none"
            >
              {FREQUENCIES.map((freq) => (
                <button
                  type="button"
                  key={freq.id}
                  onClick={() => setFrequency(freq.id)}
                  className={`py-3 px-2 font-headline text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-none transition-colors ${
                    frequency === freq.id
                      ? "bg-terracotta text-cream"
                      : "bg-transparent text-charcoal hover:bg-charcoal/5"
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <label
              htmlFor="amount-presets"
              className="block font-headline text-sm font-semibold uppercase tracking-wider text-charcoal mb-3"
            >
              Gift Amount ($ USD)
            </label>
            <div
              id="amount-presets"
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4"
            >
              {PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.amount}
                  onClick={() => {
                    setPresetAmount(preset.amount);
                    setCustomAmount(preset.amount.toString());
                  }}
                  className={`p-3 text-center border font-headline text-sm font-semibold rounded-none transition-colors ${
                    presetAmount === preset.amount
                      ? "border-terracotta bg-terracotta/10 text-terracotta"
                      : "border-charcoal/20 bg-cream text-charcoal hover:border-charcoal/40"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPresetAmount("custom")}
                className={`p-3 text-center border font-headline text-sm font-semibold rounded-none transition-colors ${
                  presetAmount === "custom"
                    ? "border-terracotta bg-terracotta/10 text-terracotta"
                    : "border-charcoal/20 bg-cream text-charcoal hover:border-charcoal/40"
                }`}
              >
                Custom Amount
              </button>
            </div>

            {presetAmount === "custom" && (
              <div className="mt-3">
                <label
                  htmlFor="custom-amount-input"
                  className="block font-body text-xs font-semibold text-charcoal/80 mb-1"
                >
                  Enter Custom Amount ($)
                </label>
                <input
                  id="custom-amount-input"
                  type="number"
                  min="1"
                  step="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full border border-charcoal/30 bg-cream p-3 font-body text-charcoal text-base focus:border-terracotta focus:outline-none rounded-none"
                />
              </div>
            )}
          </div>

          {/* Knights T-Shirt Visual Mockup Card */}
          {isEligibleForTShirt && (
            <div
              id="tshirt-card"
              className="border border-tan-gold/40 bg-ink p-6 text-cream rounded-none"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-cream/20">
                <div>
                  <span className="font-semibold text-xs text-tan-gold uppercase tracking-wider block mb-1">
                    Complimentary Knights Gift
                  </span>
                  <h3 className="font-headline text-xl text-cream">
                    Knights of the Higher Order T-Shirt
                  </h3>
                </div>
                <div className="bg-charcoal/80 border border-tan-gold/30 px-3 py-1 font-headline text-xs text-tan-gold uppercase rounded-none">
                  Included with $25+ Gift
                </div>
              </div>

              <p className="font-body text-cream/80 text-sm mb-6 leading-relaxed">
                As a thank you for your Knights-level support, choose your size
                for the official Knights of the Higher Order Ministry T-shirt.
              </p>

              <div>
                <label
                  htmlFor="tshirt-size-selector"
                  className="block font-headline text-xs font-semibold uppercase tracking-wider text-tan-gold mb-2"
                >
                  Select T-Shirt Size
                </label>
                <div id="tshirt-size-selector" className="flex flex-wrap gap-2">
                  {TSHIRT_SIZES.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setTShirtSize(size)}
                      className={`h-11 min-w-[44px] px-3 border font-headline text-sm font-semibold rounded-none transition-colors ${
                        tShirtSize === size
                          ? "border-tan-gold bg-terracotta text-cream"
                          : "border-cream/30 bg-charcoal/60 text-cream/80 hover:border-cream/60"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Display Name & Anonymous Preferences */}
          <div className="flex flex-col gap-4 border-t border-charcoal/10 pt-6">
            <div>
              <label
                htmlFor="displayName"
                className="block font-headline text-xs font-semibold uppercase tracking-wider text-charcoal mb-2"
              >
                Display Name / Business Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isAnonymous}
                placeholder="e.g. Jane Doe or Altamonte Enterprises"
                className="w-full border border-charcoal/30 bg-cream p-3 font-body text-charcoal text-base disabled:opacity-50 focus:border-terracotta focus:outline-none rounded-none"
              />
              <p className="font-body text-xs text-charcoal/60 mt-1">
                Name to display on the Supporter Roll of Honor.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-1">
              <input
                id="isAnonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-5 w-5 border border-charcoal/40 bg-cream text-terracotta accent-terracotta rounded-none"
              />
              <label
                htmlFor="isAnonymous"
                className="font-body text-sm text-charcoal cursor-pointer"
              >
                Keep gift anonymous on the Roll of Honor
              </label>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="border border-terracotta/40 bg-terracotta/10 p-4 font-body text-sm text-terracotta rounded-none"
            >
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${ctaClassName} w-full sm:w-auto justify-center rounded-none text-center cursor-pointer`}
            >
              {isSubmitting
                ? "Processing..."
                : `Donate $${selectedAmount || 0} ${frequency === "one-time" ? "One-Time" : frequency.charAt(0).toUpperCase() + frequency.slice(1)}`}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
