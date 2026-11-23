import { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles, Building, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing & Featured Vacancy Packages | Prime Hire",
  description: "Promote your vacancies and reach top Sri Lankan talent with featured listing packages.",
};

const TIERS = [
  {
    name: "Standard Listing",
    price: "Free",
    period: "Per Job",
    desc: "Perfect for single vacancies, startups and small businesses hiring locally.",
    features: [
      "Live listing for 30 days",
      "Standard applicant tracking (ATS)",
      "Screening questions (Yes/No & Text)",
      "Indexed on Google Jobs (JSON-LD)",
      "Direct email or platform apply",
    ],
    cta: "Post Free Job",
    href: "/employer/jobs/new",
    highlight: false,
  },
  {
    name: "Featured Vacancy",
    price: "LKR 15,000",
    period: "30 Days Active",
    desc: "Maximum reach. Pinned to top of search results and featured on the homepage carousel.",
    features: [
      "Everything in Standard",
      "Pinned to Top of Search results",
      "Homepage Featured Spotlight carousel",
      "Prominent 'Featured' badge",
      "Up to 4x higher applicant volume",
      "Priority customer & moderation support",
      "Pay via Bank Transfer / Online Deposit",
    ],
    cta: "Promote a Vacancy",
    href: "/employer/jobs",
    highlight: true,
  },
  {
    name: "Enterprise Pro Pack",
    price: "LKR 45,000",
    period: "90 Days Active",
    desc: "For high-volume recruiters, blue-chip corporations and group hiring drives.",
    features: [
      "5 Featured Job vacancies included",
      "Branded employer showcase page",
      "Social media flyer post boost",
      "Direct Admin posting assistance",
      "Dedicated account manager",
      "Custom invoice / PO support",
    ],
    cta: "Contact Enterprise",
    href: "mailto:support@primehire.lk?subject=Enterprise%20Pro%20Inquiry",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 px-4 max-w-6xl mx-auto space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Transparent Sri Lankan Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Accelerate Your Hiring with Featured Exposure
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Simple pricing in Sri Lankan Rupees (LKR). Post standard listings for free or boost urgent vacancies to reach over 100,000 job seekers across the island.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`rounded-2xl p-7 flex flex-col justify-between transition ${
              tier.highlight
                ? "border-2 border-emerald-500 bg-white dark:bg-slate-900 shadow-xl relative"
                : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            }`}
          >
            {tier.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Most Popular
              </span>
            )}

            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                {tier.name}
              </h3>
              <p className="text-xs text-slate-500 mb-5">{tier.desc}</p>

              <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {tier.price}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ {tier.period}</span>
              </div>

              <div className="space-y-3 mb-8">
                {tier.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href={tier.href}>
              <Button
                className={`w-full font-semibold ${
                  tier.highlight
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Direct Bank Transfer Information Banner */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <Building className="w-5 h-5 text-emerald-600" />
          <span>Manual Bank Deposit &amp; Transfer Settlement</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          We accept direct online bank transfers and cash deposits across all major Sri Lankan commercial banks (Commercial Bank, Bank of Ceylon, Sampath Bank, HNB). Simply deposit the promotion fee, upload your transfer slip in your Employer Portal, and our administration team will activate your featured placement within 2 hours.
        </p>
      </div>
    </div>
  );
}
