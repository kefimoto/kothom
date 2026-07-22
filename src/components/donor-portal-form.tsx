"use client";

import { useState } from "react";
import { ctaClassName } from "@/components/cta";

export function DonorPortalForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process portal request.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.message) {
        setMessage(data.message);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="donor-portal-email" className="sr-only">
          Email Address
        </label>
        <input
          id="donor-portal-email"
          type="email"
          required
          placeholder="donor@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-none border border-charcoal/30 bg-cream px-4 py-3 font-body text-base text-charcoal placeholder:text-charcoal/50 focus:border-terracotta focus:outline-none focus:ring-1 focus:ring-terracotta"
        />
        <button
          type="submit"
          disabled={loading}
          className={`${ctaClassName} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {loading ? "Accessing..." : "Access Portal"}
        </button>
      </form>

      {message && (
        <div
          role="status"
          className="border-l-4 border-tan-gold bg-tan-gold/20 p-4 font-body text-base text-charcoal"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="border-l-4 border-red-800 bg-red-900/10 p-4 font-body text-base text-charcoal"
        >
          {error}
        </div>
      )}
    </div>
  );
}
