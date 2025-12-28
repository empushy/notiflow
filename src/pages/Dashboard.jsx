// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { LockIcon } from "lucide-react";

import Header from "../partials/Header";
import Footer from "../partials/Footer";
import NotificationStatCard from "../partials/dashboard/NotificationStatCard";
import EmotionalToneTrends from "../partials/dashboard/NotificationToneCard";
import Loader from "../partials/dashboard/Loader";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

function Dashboard() {
  // Filter constants
  const filters = [
    "Emotional Tone",
    "Context Awareness",
    "Behavioral Triggers",
    "Call-to-Emotion",
    "Promotions",
  ];
  const LOCKED_FILTERS = [
    "Behavioral Triggers",
    "Call-to-Emotion",
    "Promotions",
  ];
  const PARTIAL_FILTERS = ["Emotional Tone", "Context Awareness"];
  const itemsPerPage = 6;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState();
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Emotional Tone");
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchTotalStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`${API_URL}/web/total-stats`, {
          method: "GET",
          headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setTotalStats(data);
      } catch (error) {
        console.error("Error fetching total stats:", error);
        setTotalStats(undefined);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchTotalStats();
  }, []);

  // Determine if current filter is locked or partial lock applies
  const isLocked = LOCKED_FILTERS.includes(selectedFilter) && !isAuthenticated;
  const isPartialLocked =
    PARTIAL_FILTERS.includes(selectedFilter) &&
    !isAuthenticated &&
    currentPage > 3;

  // Disable going beyond page 3 for partial lock filters
  const goToPage = (page) => {
    if (
      PARTIAL_FILTERS.includes(selectedFilter) &&
      !isAuthenticated &&
      page > 3
    ) {
      return;
    }
    setCurrentPage(page);
  };

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto">
            {/* HERO SECTION */}
            <section className="relative w-full rounded-3xl mb-20 shadow-xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-900 text-white">
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-indigo-500 blur-[120px] opacity-40" />
                <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-amber-400 blur-[140px] opacity-30" />
                <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-400 blur-[100px] opacity-30" />
              </div>
              <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-14 lg:py-18 grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-10 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                    Real-time notification radar
                  </div>
                  <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight">
                    See the next surge <span className="text-amber-300">before</span> it lands in your inbox.
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-100/80 max-w-2xl">
                    Track 10,000+ brands, spot creative spikes, and act on cadence shifts faster than competitors. NotiFlow turns the notification graph into your early-warning system.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => (window.location.href = "/auth")}
                      className="px-6 py-3 rounded-xl font-semibold bg-white text-slate-900 text-base shadow-lg transition hover:-translate-y-1 hover:shadow-xl duration-200"
                    >
                      Try for Free
                    </button>
                    <button className="px-6 py-3 rounded-xl font-semibold text-white border border-white/30 bg-white/10 hover:bg-white/20 transition text-base shadow">
                      Watch Demo
                    </button>
                    <button className="px-6 py-3 rounded-xl font-semibold text-amber-200 border border-amber-200/40 bg-amber-50/10 hover:bg-amber-50/20 transition text-base shadow">
                      See playbooks
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-100/90">
                    {[
                      { label: "Signals monitored", value: "2.4M+" },
                      { label: "Brands tracked", value: "1.3k" },
                      { label: "Daily pushes", value: "15k+" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/15 bg-white/5 p-4 shadow-sm">
                        <p className="text-2xl font-semibold text-white">{item.value}</p>
                        <p className="text-xs text-slate-100/80">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="rounded-2xl bg-white/95 backdrop-blur border border-white/30 shadow-2xl overflow-hidden">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800">Live signal snapshot</p>
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

            {/* Stats section */}
            <div className="w-full max-w-7xl mx-auto mb-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">Live totals</p>
                  <h3 className="text-2xl font-semibold text-slate-900">Signals across the graph</h3>
                  <p className="text-sm text-slate-500">Auto-refreshing snapshots from the last crawl.</p>
                </div>
                {!loadingStats && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {loadingStats ? (
                  <div className="col-span-3 flex justify-center">
                    <Loader />
                  </div>
                ) : totalStats ? (
                  <>
                    <NotificationStatCard
                      stat={"Notifications"}
                      initialQuantity={totalStats["total_notifications"]}
                      autoIncrease={true}
                    />
                    <NotificationStatCard
                      stat={"Brands"}
                      initialQuantity={totalStats["total_brands"]}
                      autoIncrease={false}
                    />
                    <NotificationStatCard
                      stat={"Markets"}
                      initialQuantity={totalStats["total_markets"]}
                      autoIncrease={false}
                    />
                  </>
                ) : (
                  <div className="col-span-3 text-center text-slate-500 text-sm">No stats available.</div>
                )}
              </div>
            </div>

            {/* Filters container with lock overlay */}
            {/* Emotional tone trends chart */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">Trends feed</p>
                  <h3 className="text-2xl font-semibold text-slate-900">Explore notification tone and cadence</h3>
                </div>
              </div>
              <div className="relative mb-8">
                {isLocked && (
                  <div
                    className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 pointer-events-none"
                    title="Available to PRO users"
                    aria-label="Available to PRO users"
                  >
                    <LockIcon className="w-10 h-10 text-blue-500 mb-2" />
                    <span className="text-blue-700 font-semibold text-sm select-none">
                      Available to PRO users
                    </span>
                  </div>
                )}
                <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
                  {filters.map((filter) => {
                    const filterLocked =
                      LOCKED_FILTERS.includes(filter) && !isAuthenticated;

                    return (
                      <div key={filter} className="relative group">
                        {/* Button */}
                        <button
                          onClick={() =>
                            !filterLocked && handleFilterClick(filter)
                          }
                          disabled={filterLocked}
                          className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-300 focus:outline-none relative
          ${
            selectedFilter === filter
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-900 hover:shadow-md"
          }
          ${filterLocked ? "cursor-not-allowed" : ""}
        `}
                          style={{ transformOrigin: "center" }}
                        >
                          {filterLocked && (
                            <LockIcon className="w-4 h-4 text-blue-400 inline-block mr-2" />
                          )}
                          {filter}
                        </button>

                        {/* Lock overlay */}
                        {filterLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl pointer-events-none">
                            <LockIcon className="w-6 h-6 text-blue-500" />
                          </div>
                        )}

                        {/* Hover tooltip */}
                        {filterLocked && (
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded bg-gray-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow z-30 whitespace-nowrap">
                            Available to PRO users
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <EmotionalToneTrends
                trendType={selectedFilter}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Payment Plans Section */}
            <section className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 space-y-2">
                <p className="text-sm font-semibold text-indigo-600">Pick your track</p>
                <h2 className="text-3xl font-bold text-gray-900">Plans for builders, analysts, and teams</h2>
                <p className="text-gray-500 text-sm">Start free. Upgrade when you need deeper signal coverage.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    id: "buy_btn_free",
                    name: "Starter",
                    price: "Free",
                    meta: "50 requests / month",
                    description: "Core notification tracking with curated signals.",
                    cta: "Try for Free",
                    featured: false,
                  },
                  {
                    id: "buy_btn_5e",
                    name: "Growth",
                    price: "€5",
                    meta: "200 requests / month",
                    description: "Deeper analytics, more brands, and CSV exports.",
                    cta: "Coming soon",
                    featured: true,
                  },
                  {
                    id: "buy_btn_25e",
                    name: "Scale",
                    price: "€25",
                    meta: "5000 requests / month",
                    description: "Full signal coverage, API-first workflows, and priority support.",
                    cta: "Coming soon",
                    featured: false,
                  },
                ].map(({ id, name, price, meta, description, cta, featured }) => (
                  <div
                    key={id}
                    className={`bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border ${
                      featured ? "border-indigo-200 shadow-2xl scale-[1.02]" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl font-semibold">{name}</h3>
                      {featured && (
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-4xl font-extrabold text-gray-900 mb-1">{price}</p>
                    <p className="text-sm text-indigo-600 mb-3">{meta}</p>
                    <p className="text-gray-500 text-sm mb-8">{description}</p>

                    {price === "Free" ? (
                      <button
                        onClick={() => (window.location.href = "/auth")}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition duration-200 shadow"
                      >
                        {cta}
                      </button>
                    ) : (
                      <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition duration-200">
                        {cta}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
