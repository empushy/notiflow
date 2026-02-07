import React from "react";
import Header from "../partials/Header";
import Footer from "../partials/Footer";

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: "spark",
    price: "EUR 0",
    cadence: "50 requests / month",
    description: "Core notification tracking with curated signals.",
    badge: "Get started",
    cta: "Start free",
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    icon: "rocket",
    price: "EUR 5",
    cadence: "200 requests / month",
    description: "Deeper analytics, more brands, and CSV exports.",
    badge: "Popular",
    cta: "Coming soon",
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    icon: "shield",
    price: "EUR 25",
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
  const planIcon = {
    spark: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M10.7 2.8a1 1 0 00-1.4 0L8.1 4A7 7 0 004 8.1L2.8 9.3a1 1 0 000 1.4l1.2 1.2A7 7 0 008.1 16l1.2 1.2a1 1 0 001.4 0l1.2-1.2A7 7 0 0016 11.9l1.2-1.2a1 1 0 000-1.4L16 8.1A7 7 0 0011.9 4l-1.2-1.2z" />
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M11.5 2C8.6 2.1 6 3.5 4.4 5.8L3 8.1l2.7.6 2.6-2.6a4.8 4.8 0 016.8 0l.4.4c.4.4.4 1 0 1.4l-2.7 2.7.6 2.7 2.3-1.4c2.3-1.6 3.7-4.2 3.8-7.1A1 1 0 0019 2h-7.5zM4.6 10.4L2 13v2h2l2.6-2.6-2-2z" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M10 2l6 2.3v4.5c0 3.6-2.1 6.7-6 9.2-3.9-2.5-6-5.6-6-9.2V4.3L10 2zm2.7 5.8L9 11.5 7.3 9.8 6 11.1l3 3 5-5-1.3-1.3z" />
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-white/50 backdrop-blur border-b border-pink-100 text-slate-900">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-pink-300 blur-[120px] opacity-20" />
            <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-gold-300 blur-[140px] opacity-20" />
            <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-300 blur-[100px] opacity-20" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-pink-100 text-xs font-semibold tracking-wide text-slate-700">
              <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
              Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              Choose the signal coverage that matches your team.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-3xl">
              Start free, ship fast, and upgrade when you need deeper analytics, automation, and export options.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
              {benefits.map((item) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
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
            <p className="text-sm font-semibold text-pink-600">Plans</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Signal coverage for every stage</h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              Pick a plan now, change later. We keep billing simple and transparent.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl bg-white/75 backdrop-blur border ${
                  plan.highlight ? "border-pink-200 shadow-2xl scale-[1.02]" : "border-slate-200 shadow-lg"
                } p-6 flex flex-col gap-4`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                    plan.highlight
                      ? "bg-gradient-to-br from-pink-500 to-amber-400 text-white shadow-md shadow-pink-500/25"
                      : "bg-white/85 border border-white/70 text-pink-600"
                  }`}>
                    {planIcon[plan.icon]}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                  {plan.badge && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      plan.highlight ? "text-pink-700 bg-pink-50 border-pink-100" : "text-slate-700 bg-slate-50 border-slate-200"
                    }`}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-4xl font-extrabold text-slate-900">{plan.price}</p>
                  <p className="text-sm text-pink-600">{plan.cadence}</p>
                </div>
                <p className="text-sm text-slate-600">{plan.description}</p>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Live signal snapshots
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-pink-400" />
                    Brand and cadence benchmarks
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    API-first workflows
                  </div>
                </div>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition duration-200 ${
                    plan.id === "starter"
                      ? "bg-pink-500 text-white hover:bg-pink-600 shadow"
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
          <div className="rounded-2xl bg-white/75 backdrop-blur border border-pink-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-pink-600">Need something custom?</p>
              <h3 className="text-xl font-semibold text-slate-900">Let us tailor data coverage for your team.</h3>
              <p className="text-sm text-slate-600 max-w-2xl">
                Enterprise coverage, dedicated SLAs, and custom datasets are available. Tell us what you need and we will design the right plan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="px-5 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition"
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

