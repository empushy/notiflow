import React from "react";
import { NavLink } from "react-router-dom";
import Header from "../partials/Header";
import Footer from "../partials/Footer";

const whoFor = [
  {
    title: "Marketing & Growth Teams",
    body: "Monitor competitor campaigns and messaging strategies.",
    iconBg: "bg-amber-50 text-amber-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    ),
  },
  {
    title: "Product & CRM Teams",
    body: "Understand cadence, urgency, and engagement approaches.",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    title: "Analysts & Agencies",
    body: "Power reports and automated insights via API.",
    iconBg: "bg-sky-50 text-sky-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
      </svg>
    ),
  },
];

const howItWorks = [
  { title: "Collect", body: "Proprietary listening algorithms gather mobile and web push notifications." },
  { title: "Analyze", body: "Campaign detection, timing patterns, and messaging signals." },
  { title: "Access", body: "Insights via dashboard and API." },
];

const whatItems = [
  {
    title: "Capture",
    body: "Proprietary listening algorithms gather mobile and web push notifications.",
    accent: "bg-indigo-50 text-indigo-800 border-indigo-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10" />
      </svg>
    ),
  },
  {
    title: "Pattern detection",
    body: "Identifies recurring campaigns, creative patterns, and CTAs.",
    accent: "bg-emerald-50 text-emerald-800 border-emerald-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Timing signals",
    body: "Reveals timing, volume spikes, and urgency signals.",
    accent: "bg-amber-50 text-amber-800 border-amber-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Searchable",
    body: "Makes notification data searchable by brand and category.",
    accent: "bg-sky-50 text-sky-800 border-sky-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z" />
      </svg>
    ),
  },
];

const differentiators = [
  {
    label: "Built specifically for push notifications",
    color: "bg-indigo-50 text-indigo-800 border-indigo-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m8-8h-1M5 12H4m13.364-7.364l-.707.707M7.343 16.657l-.707.707m12.728 0l-.707-.707M7.343 7.343l-.707-.707" />
      </svg>
    ),
  },
  {
    label: "Designed for competitive intelligence, not just first-party data",
    color: "bg-emerald-50 text-emerald-800 border-emerald-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    label: "API-first and automation-ready",
    color: "bg-amber-50 text-amber-800 border-amber-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7H7v10h6m4-10v10m-4-5h4" />
      </svg>
    ),
  },
  {
    label: "No personal user data collected",
    color: "bg-rose-50 text-rose-800 border-rose-100",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.5l15 15m-9-18.5a4 4 0 018 0v2.75c0 2.485-2.686 4.5-6 4.5-1.3 0-2.48-.303-3.4-.81" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 14v-.25A2.75 2.75 0 016.75 11h.5" />
      </svg>
    ),
  },
];

function About() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -left-10 -top-20 h-64 w-64 rounded-full bg-indigo-500 blur-[120px] opacity-40" />
            <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-amber-400 blur-[140px] opacity-30" />
            <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-400 blur-[100px] opacity-30" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                About NotiFlow
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                Turn every push notification into a signal you can act on.
              </h1>
              <p className="text-base sm:text-lg text-slate-100/80 max-w-3xl">
                Track competitor campaigns, timing, and creative angles across mobile and web push. NotiFlow listens to the notification graph so you can move from guessing to knowing.
              </p>
              <div className="flex flex-wrap gap-3">
                <NavLink
                  to="/auth/"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 font-semibold shadow-sm hover:bg-slate-100 transition"
                >
                  Try for Free
                </NavLink>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/70 text-white font-semibold shadow-sm hover:bg-slate-800 transition">
                  View Demo
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white font-semibold border border-white/20 hover:border-white/40 transition">
                  View Docs
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-100/90">
                {[
                  { label: "Signals monitored", value: "2.4M+" },
                  { label: "Brands tracked", value: "18k" },
                  { label: "Fresh pushes daily", value: "15k+" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 p-4 shadow-sm">
                    <p className="text-2xl font-semibold text-white">{item.value}</p>
                    <p className="text-xs text-slate-100/80">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-white/95 backdrop-blur border border-white/40 shadow-2xl overflow-hidden">
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Live snapshot</p>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Fresh data
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { title: "Promo spikes", value: "+42%", tone: "text-emerald-600" },
                      { title: "Lifecycle nudges", value: "31%", tone: "text-indigo-700" },
                      { title: "Avg. cadence", value: "4.3 pushes/week", tone: "text-slate-700" },
                      { title: "CTA mix", value: "Shop / Save / Return", tone: "text-slate-700" },
                    ].map((card) => (
                      <div key={card.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{card.title}</p>
                        <p className={`text-sm font-semibold ${card.tone}`}>{card.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2">
                    <p className="text-sm font-semibold text-indigo-800">Signal radar</p>
                    <p className="text-xs text-slate-700">
                      Identify timing clusters, creative angles, and alert-worthy spikes before your competitors do.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8 py-10">
          {/* What NotiFlow Does */}
          <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">What NotiFlow does</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {whatItems.map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border ${item.accent} p-4 shadow-sm flex items-start gap-3`}
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/60 border border-white/70 shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-700 mt-1">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-600 italic">Think of it as social listening - but for push notifications.</p>
          </section>

          {/* Who it's for */}
          <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">Who it is for</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {whoFor.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm">
                  <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${item.iconBg} mb-3`}>
                    {item.icon}
                  </div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {howItWorks.map((step, idx) => (
                <div key={step.title} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm mb-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-xs">
                      {idx + 1}
                    </span>
                    {step.title}
                  </div>
                  <p className="text-sm text-slate-700">{step.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why NotiFlow */}
          <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-8 sm:p-10 space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900">Why NotiFlow</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {differentiators.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-start gap-3 rounded-2xl border ${item.color} p-4 shadow-sm`}
                >
                  <div className="h-9 w-9 rounded-lg bg-white/70 border border-white/80 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Founder & credibility */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white shadow-sm p-8 sm:p-10">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -left-10 -top-20 h-64 w-64 rounded-full bg-indigo-500 blur-[120px] opacity-40" />
              <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-amber-400 blur-[140px] opacity-30" />
              <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-400 blur-[100px] opacity-30" />
            </div>
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                Founder
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-6 items-start">
                <div className="flex flex-col gap-4 rounded-2xl bg-white/10 border border-white/20 p-5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://media.licdn.com/dms/image/v2/D4E03AQGiNU8sReKBXg/profile-displayphoto-scale_200_200/B4EZdb49ZeHQAY-/0/1749593348706?e=1768435200&v=beta&t=Uc0lkoxdpwvJ63rYtGkWj33oYJEVqNcS_46HfgIRepU"
                      alt="Kieran Fraser LinkedIn headshot"
                      className="h-20 w-20 rounded-2xl object-cover border border-white/40 shadow"
                      loading="lazy"
                    />
                    <div className="space-y-1">
                      <p className="text-lg font-semibold">Kieran Fraser, PhD</p>
                      <p className="text-sm text-slate-200">Founder and Research Engineer</p>
                      <a
                        href="https://www.linkedin.com/in/kieran-fraser-phd-608a54a7/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-amber-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8.47h4.56V24H.22V8.47zm7.56 0h4.37v2.12h.06c.61-1.16 2.1-2.38 4.32-2.38 4.62 0 5.47 3.04 5.47 6.99V24h-4.56v-7.24c0-1.73-.03-3.95-2.4-3.95-2.4 0-2.77 1.87-2.77 3.81V24H7.78V8.47z" />
                        </svg>
                        LinkedIn
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-100">
                    {[
                      { label: "PhD on notification data", tone: "bg-indigo-500/20 border-indigo-300/30 text-white" },
                      { label: "10+ years applied AI", tone: "bg-emerald-500/20 border-emerald-300/30 text-white" },
                      { label: "Built production data systems", tone: "bg-amber-500/20 border-amber-300/30 text-white" },
                    ].map((chip) => (
                      <div
                        key={chip.label}
                        className={`rounded-lg border px-3 py-2 font-semibold shadow-sm ${chip.tone}`}
                      >
                        {chip.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 text-slate-100">
                  <p>
                    Founded by <strong>Kieran Fraser</strong>, a research engineer with a PhD focused on push notifications and large-scale notification data.
                  </p>
                  <p>Over 10 years building and shipping notification systems, experimentation pipelines, and behavioral analytics at the ADAPT Center, IBM, and PayPal.</p>
                  <p>Applied AI practitioner designing production-grade data and ML systems to power insights and automation.</p>
                  <p>NotiFlow comes from studying how notifications shape behavior - not from scraped dashboards or self-reported metrics.</p>
                  <p className="italic text-slate-200">NotiFlow exists because this data did not exist anywhere else.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Trust & data responsibility */}
          <section className="rounded-3xl bg-white shadow-sm border border-slate-100 p-8 sm:p-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Trust & data responsibility</h2>
            <p className="text-slate-700 leading-relaxed">
              NotiFlow does not collect personal user data. Insights are derived from notification content, app metadata, and aggregated patterns. The platform is designed for market research, creative analysis, and competitive intelligence.
            </p>
          </section>

          {/* Final CTA */}
          <section className="rounded-3xl bg-slate-900 text-white shadow-sm p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Start exploring push-notification trends today.</h2>
              <p className="text-slate-200 mt-1">Get API access or book a demo with the team.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <NavLink
                to="/auth/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 font-semibold shadow-sm hover:bg-slate-100 transition"
              >
                Try for Free
              </NavLink>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default About;
