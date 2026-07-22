import { NextResponse } from "next/server";
import { Resend } from "resend";
import { signPortalToken } from "@/lib/portal-token";

const GENERIC_MESSAGE =
  "If an active donor subscription is associated with this email address, we've sent access instructions to it.";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not defined in environment variables");
  }
  return new Resend(apiKey);
}

// Whether a Stripe customer exists for this email is intentionally never
// checked here — only at /api/portal/verify, once the requester has proven
// control of the inbox by clicking the emailed link. Checking (or not) here
// would let the response itself leak which emails have donor subscriptions.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const token = signPortalToken(cleanEmail);
    const verifyUrl = `${origin}/api/portal/verify?token=${encodeURIComponent(token)}`;

    const resend = getResendClient();
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Knights of the Higher Order Ministries <onboarding@resend.dev>",
      to: cleanEmail,
      subject: "Access your donor portal",
      html: `<p>Use the link below to access your donor portal, where you can update your payment method, pause giving, or cancel your subscription.</p><p><a href="${verifyUrl}">Access donor portal</a></p><p>This link expires in 15 minutes. If you didn't request it, you can safely ignore this email.</p>`,
    });

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error: unknown) {
    console.error("Error processing donor portal request:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process portal request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
