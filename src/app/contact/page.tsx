import type { Metadata } from "next";
import { ctaClassName } from "@/components/cta";
import { PageHeader } from "@/components/page-header";
import { MINISTRY } from "@/lib/ministry";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach Knights of the Higher Order Ministries by phone, email, or mail — and pastoral care, available 24 hours a day, 7 days a week.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="main">
      <PageHeader
        title="Contact Us"
        description="A real person answers. Reach out by phone, email, or mail."
      />
      <div className="bg-cream px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              {MINISTRY.founder.name}
            </h2>
            <p className="font-body text-lg text-charcoal">
              {MINISTRY.founder.title}, {MINISTRY.name}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Phone
            </h2>
            <a
              href={MINISTRY.phone.tel}
              className={`self-start ${ctaClassName}`}
            >
              Call {MINISTRY.phone.display}
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Email
            </h2>
            <a
              href={`mailto:${MINISTRY.email}`}
              className="font-body text-lg text-terracotta underline decoration-1 underline-offset-2 hover:text-terracotta-dark"
            >
              {MINISTRY.email}
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Mailing Address
            </h2>
            <address className="font-body text-lg not-italic leading-relaxed text-charcoal">
              {MINISTRY.name}
              <br />
              {MINISTRY.address.street}
              <br />
              {MINISTRY.address.city}, {MINISTRY.address.state}{" "}
              {MINISTRY.address.zip}
            </address>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Office Hours
            </h2>
            <p className="font-body text-lg leading-relaxed text-charcoal">
              {MINISTRY.officeHours}
            </p>
          </div>

          <div className="flex flex-col gap-4 border-t border-charcoal/15 pt-10">
            <h2 className="font-headline text-2xl text-charcoal sm:text-3xl">
              Pastoral Care
            </h2>
            <p className="text-pretty font-body text-lg leading-relaxed text-charcoal">
              {MINISTRY.founder.familiarName} is available for pastoral care by
              call or appointment, {MINISTRY.pastoralAvailability}.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
