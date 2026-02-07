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
            <section className="relative w-full rounded-3xl mb-20 overflow-hidden border border-white/70 ring-1 ring-pink-200/55 bg-white/34 backdrop-blur-md shadow-[0_24px_80px_-30px_rgba(245,63,133,0.24)] text-slate-900">
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -left-10 -top-16 h-64 w-64 rounded-full bg-pink-300 blur-[120px] opacity-20" />
                <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-gold-300 blur-[140px] opacity-25" />
                <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-300 blur-[100px] opacity-20" />
              </div>
              <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-14 lg:py-18 grid grid-cols-1 gap-10 items-center">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-pink-100 text-xs font-semibold tracking-wide text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                    Real-time notification radar
                  </div>
                  <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight text-slate-950">
                    See the next surge <span className="bg-gradient-to-r from-pink-500 to-gold-500 bg-clip-text text-transparent">before</span> it lands in your inbox.
                  </h1>
                  <p className="text-lg sm:text-xl text-slate-800 max-w-2xl">
                    Track 10,000+ brands, spot creative spikes, and act on cadence shifts faster than competitors. NotiFlow turns the notification graph into your early-warning system.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => (window.location.href = "/auth")}
                      className="px-6 py-3 rounded-xl font-semibold bg-pink-500 text-white text-base shadow-lg transition hover:-translate-y-1 hover:bg-pink-600 hover:shadow-xl duration-200"
                    >
                      Try for Free
                    </button>
                    <button className="px-6 py-3 rounded-xl font-semibold text-slate-900 border border-white/80 bg-white/92 hover:bg-white transition text-base shadow">
                      Watch Demo
                    </button>
                    <button className="px-6 py-3 rounded-xl font-semibold text-amber-800 border border-amber-200 bg-amber-100/85 hover:bg-amber-100 transition text-base shadow">
                      See playbooks
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-700">
                    {[
                      { label: "Signals monitored", value: "2.4M+" },
                      { label: "Brands tracked", value: "1.3k" },
                      { label: "Daily pushes", value: "15k+" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/90 bg-white/90 p-4 shadow-sm backdrop-blur-md">
                        <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                        <p className="text-xs text-slate-700">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Stats section */}
            <div className="w-full max-w-7xl mx-auto mb-16 px-4 sm:px-6 lg:px-8 rounded-2xl border border-white/85 bg-white/86 backdrop-blur-sm py-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold text-pink-600">Live totals</p>
                  <h3 className="text-2xl font-semibold text-slate-900">Signals across the graph</h3>
                  <p className="text-sm text-slate-600">Auto-refreshing snapshots from the last crawl.</p>
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
                  <p className="text-sm font-semibold text-pink-600">Trends feed</p>
                  <h3 className="text-2xl font-semibold text-slate-900">Explore notification tone and cadence</h3>
                </div>
              </div>
              <div className="relative mb-8 rounded-2xl border border-white/75 bg-white/90 backdrop-blur-sm p-4 shadow-sm">
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
              ? "bg-pink-500 text-white shadow-lg"
              : "bg-white/95 text-slate-800 hover:shadow-md border border-white/80"
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
                  <p className="text-sm font-semibold text-pink-600">Pick your track</p>
                <h2 className="text-3xl font-bold text-slate-900">Plans for builders, analysts, and teams</h2>
                <p className="text-slate-600 text-sm">Start free. Upgrade when you need deeper signal coverage.</p>
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
                    price: "EUR 5",
                    meta: "200 requests / month",
                    description: "Deeper analytics, more brands, and CSV exports.",
                    cta: "Coming soon",
                    featured: true,
                  },
                  {
                    id: "buy_btn_25e",
                    name: "Scale",
                    price: "EUR 25",
                    meta: "5000 requests / month",
                    description: "Full signal coverage, API-first workflows, and priority support.",
                    cta: "Coming soon",
                    featured: false,
                  },
                ].map(({ id, name, price, meta, description, cta, featured }) => (
                  <div
                    key={id}
                    className={`bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border ${
                      featured ? "border-pink-200 shadow-2xl scale-[1.02]" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-xl font-semibold">{name}</h3>
                      {featured && (
                        <span className="text-[11px] font-semibold text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-4xl font-extrabold text-slate-900 mb-1">{price}</p>
                    <p className="text-sm text-pink-600 mb-3">{meta}</p>
                    <p className="text-slate-600 text-sm mb-8">{description}</p>

                    {price === "Free" ? (
                      <button
                        onClick={() => (window.location.href = "/auth")}
                        className="w-full bg-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-pink-600 transition duration-200 shadow"
                      >
                        {cta}
                      </button>
                    ) : (
                      <button className="w-full bg-white/90 border border-white/75 text-slate-700 py-3 px-4 rounded-xl font-semibold hover:bg-white transition duration-200">
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


