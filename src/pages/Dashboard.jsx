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
            <section className="relative w-full rounded-2xl mb-20 shadow-lg overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900">
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                style={{ zIndex: 0 }}
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="hero-grid"
                    width="48"
                    height="48"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M48 0 L0 0 0 48"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hero-grid)" />
              </svg>

              <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-14 lg:py-18">
                <div className="grid col-span-2">
                  <h1 className="font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                    Discover Notification Trends
                    <br />
                    Before Everyone Else
                  </h1>

                  <p className="text-lg sm:text-xl text-blue-100 mb-8 font-medium max-w-2xl">
                    Track 10,000+ brands discovered by users. Detect trends,
                    shape campaigns, and stay{" "}
                    <span className="font-semibold text-blue-100 underline underline-offset-4 decoration-blue-300">
                      ahead of the curve
                    </span>
                    .
                  </p>

                  <div className="flex gap-4 flex-wrap">
                    <button
                      onClick={() => (window.location.href = "/auth")}
                      className="px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white text-lg shadow-lg transition hover:-translate-y-1 duration-200"
                    >
                      Try for Free
                    </button>
                    <button className="px-7 py-3 rounded-xl font-semibold text-blue-200 border border-blue-300/70 bg-white/10 hover:bg-white/20 transition text-lg shadow">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats section */}
            <div className="w-full max-w-7xl mx-auto text-center mb-12 px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-12 gap-6 mb-12">
                {loadingStats ? (
                  <div className="col-span-12 flex justify-center">
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
                ) : null}
              </div>
            </div>

            {/* Filters container with lock overlay */}
            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Lock icon overlay */}
              {isLocked && (
                <div
                  className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-20 pointer-events-none"
                  title="Available to PRO users"
                  aria-label="Available to PRO users"
                >
                  <LockIcon className="w-12 h-12 text-blue-500 mb-2" />
                  <span className="text-blue-700 font-semibold text-lg select-none">
                    Available to PRO users
                  </span>
                </div>
              )}

              {/* Filters */}
              <div className="flex justify-center mt-16 sm:mt-20 gap-3 sm:gap-4 mb-12 sm:mb-16 flex-wrap">
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

            {/* Emotional tone trends chart */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
              <EmotionalToneTrends
                trendType={selectedFilter}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>

            {/* Payment Plans Section */}
            <section className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Choose Your Plan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  {
                    id: "buy_btn_free",
                    name: "50 Requests / month",
                    price: "Free",
                    description:
                      "Basic notification tracking with limited features.",
                  },
                  {
                    id: "buy_btn_5e",
                    name: "200 Requests / month",
                    price: "€5",
                    description: "Includes additional analytics and reports.",
                  },
                  {
                    id: "buy_btn_25e",
                    name: "5000 Requests / month",
                    price: "€25",
                    description:
                      "Full access to all features and premium support.",
                  },
                ].map(({ id, name, price, description }) => (
                  <div
                    key={id}
                    className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center"
                  >
                    <h3 className="text-xl font-semibold mb-4">{name}</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mb-4">
                      {price}
                    </p>
                    <p className="text-gray-500 mb-8">{description}</p>

                    {price === "Free" ? (
                      <button
                        onClick={() => (window.location.href = "/auth")}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition duration-200"
                      >
                        Try for Free
                      </button>
                    ) : (
                      <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition duration-200">
                        Coming Soon
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