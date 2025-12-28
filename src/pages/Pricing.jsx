import React from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "€0",
    cadence: "50 requests / month",
    description: "Core notification tracking with curated signals.",
    badge: "Get started",
    cta: "Start free",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "€5",
    cadence: "200 requests / month",
    description: "Deeper analytics, more brands, and CSV exports.",
    badge: "Popular",
    cta: "Coming soon",
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "€25",
    cadence: "5000 requests / month",
    description: "Full signal coverage, API-first workflows, and priority support.",
    badge: "Teams",
    cta: "Coming soon",
    highlight: false,
  },
];

const benefits = [
  "Realtime signal snapshots and tone tracking",
  "Benchmarks across 10k+ brands and categories",
  "API-ready data for automation and analysis",
  "Zero scraping guesswork - direct notification graph",
];

function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-indigo-500 blur-[120px] opacity-40" />
            <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-amber-400 blur-[140px] opacity-30" />
            <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-400 blur-[100px] opacity-30" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              Choose the signal coverage that matches your team.
            </h1>
            <p className="text-slate-100/80 text-base sm:text-lg max-w-3xl">
              Start free, ship fast, and upgrade when you need deeper analytics, automation, and export options.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-100/90">
              {benefits.map((item) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/10 text-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-200">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.414 0l-3.04-3.04a1 1 0 111.414-1.415l2.333 2.334 6.543-6.544a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-semibold text-indigo-600">Plans</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Signal coverage for every stage</h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Pick a plan now, change later. We keep billing simple and transparent.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl bg-white border ${
                  plan.highlight ? "border-indigo-200 shadow-2xl scale-[1.02]" : "border-slate-100 shadow-lg"
                } p-6 flex flex-col gap-4`}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      plan.highlight ? "text-indigo-700 bg-indigo-50 border-indigo-100" : "text-slate-700 bg-slate-50 border-slate-200"
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-slate-900">{plan.price}</p>
                  <p className="text-sm text-indigo-600">{plan.cadence}</p>
                </div>
                <p className="text-sm text-slate-600">{plan.description}</p>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live signal snapshots
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    Brand and cadence benchmarks
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    API-first workflows
                  </div>
                </div>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition duration-200 ${
                    plan.price === "Free"
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  onClick={() => (plan.id === "starter" ? (window.location.href = "/auth") : null)}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ / Support */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Need something custom?</p>
              <h3 className="text-xl font-semibold text-slate-900">Let us tailor data coverage for your team.</h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                Enterprise coverage, dedicated SLAs, and custom datasets are available. Tell us what you need and we will design the right plan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition"
                onClick={() => (window.location.href = "/auth")}
              >
                Talk to us
              </button>
              <button className="px-5 py-3 rounded-xl border border-slate-200 text-slate-800 font-semibold hover:border-slate-300 transition">
                View docs
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Pricing;
