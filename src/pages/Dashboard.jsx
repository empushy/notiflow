import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

import Sidebar from "../partials/Sidebar";
import Header from "../partials/Header";
import Footer from "../partials/Footer";
import FilterButton from "../components/DropdownFilter";
import Datepicker from "../components/Datepicker";
import NotificationStatCard from "../partials/dashboard/NotificationStatCard";
import DashboardCard01 from "../partials/dashboard/DashboardCard01";
import DashboardCard02 from "../partials/dashboard/DashboardCard02";
import DashboardCard03 from "../partials/dashboard/DashboardCard03";
import DashboardCard04 from "../partials/dashboard/DashboardCard04";
import DashboardCard05 from "../partials/dashboard/DashboardCard05";
import DashboardCard06 from "../partials/dashboard/DashboardCard06";
import DashboardCard07 from "../partials/dashboard/DashboardCard07";
import DashboardCard08 from "../partials/dashboard/DashboardCard08";
import DashboardCard09 from "../partials/dashboard/DashboardCard09";
import DashboardCard10 from "../partials/dashboard/DashboardCard10";
import DashboardCard11 from "../partials/dashboard/DashboardCard11";
import NotificationHeatmap from "../partials/dashboard/NotificationHeatmap";
import NotificationAppType from "../partials/dashboard/NotificationAppType";
import NotificationVolume from "../partials/dashboard/NotificationVolume";
import EmotionalToneTrends from "../partials/dashboard/NotificationToneCard";
import EmotionalToneHeatmap from "../partials/dashboard/EmotionalToneHeatmap";
import Loader from "../partials/dashboard/Loader";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const NotificationCard = ({ message, iconUrl, posted, appName }) => {
  const timeAgo = moment(posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]").fromNow();

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -30, opacity: 0 }}
      transition={{ type: "spring", stiffness: 230, damping: 25 }}
      className="
        flex items-start bg-white/60 backdrop-blur-[9px] 
        shadow-xl rounded-2xl px-6 py-5 w-full min-h-[110px]
        ring-1 ring-inset ring-white/40
        hover:scale-[1.02] hover:shadow-2xl transition-all duration-300
        border border-gray-100
      "
    >
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center mr-4 shadow-sm ring-2 ring-pink-200">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt="Notification Icon"
            className="w-10 h-10 object-contain rounded-full"
          />
        ) : (
          <span className="text-2xl text-pink-400">🔔</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-400 font-semibold truncate">
            {appName}
          </span>
          <span className="text-xs text-pink-400 font-medium ml-2">
            {timeAgo}
          </span>
        </div>
        <div className="text-sm text-gray-900 font-medium leading-snug line-clamp-3">
          {message}
        </div>
      </div>
    </motion.div>
  );
};

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/web/recent-notifications`, {
          method: "GET",
          headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setNotifications(data.slice(-3)); // Only show the latest 3
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative w-full flex justify-center px-2 sm:px-0 py-5">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center px-2 sm:px-0 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-5xl">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                message={notif.text}
                iconUrl={notif.icon}
                posted={notif.posted}
                appName={notif.appName}
              />
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center text-gray-500">
              No recent notifications
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState();
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Emotional Tone");

  const handleFilterClick = async (filter) => {
    setSelectedFilter(filter);
    // fetch data as needed
  };

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

  const filters = [
    "Emotional Tone",
    "Context Awareness",
    "Behavioral Triggers",
    "Call-to-Emotion",
    "Promotions",
  ];

  // Payment plans info (if needed)
  const plans = [
    {
      id: "buy_btn_free",
      name: "Free",
      price: "€0",
      description: "Basic notification tracking with limited features.",
    },
    {
      id: "buy_btn_5e",
      name: "5 Euros / month",
      price: "€5",
      description: "Includes additional analytics and reports.",
    },
    {
      id: "buy_btn_25e",
      name: "25 Euros / month",
      price: "€25",
      description: "Full access to all features and premium support.",
    },
  ];

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* HERO SECTION - inspired by Exploding Topics */}
            <section className="relative w-full rounded-2xl mb-20 shadow-lg overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900">
              {/* Background grid pattern */}
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

              {/* Content */}
              <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-14 lg:py-18">
                {/* Left: Headline + copy */}
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
                    <button className="px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-400 to-blue-600 text-white text-lg shadow-lg transition hover:-translate-y-1 duration-200">
                      Get Started Free
                    </button>
                    <button className="px-7 py-3 rounded-xl font-semibold text-blue-200 border border-blue-300/70 bg-white/10 hover:bg-white/20 transition text-lg shadow">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats section */}
            <div className="w-2/3 text-center mx-auto mb-12">
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

            {/* Filters */}
            <div className="flex justify-center mt-28 gap-4 mb-16 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-300 focus:outline-none ${
                    selectedFilter === filter
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-white text-gray-900 hover:shadow-md"
                  }`}
                  style={{ transformOrigin: "center" }}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Emotional tone trends chart */}
            <div className="w-4/5 mx-auto mb-24">
              <EmotionalToneTrends trendType={selectedFilter} />
            </div>

            {/* Payment Plans Section */}
            <section className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Choose Your Plan
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {plans.map(({ id, name, price, description }) => (
                  <div
                    key={id}
                    className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center"
                  >
                    <h3 className="text-xl font-semibold mb-4">{name}</h3>
                    <p className="text-4xl font-extrabold text-gray-900 mb-4">
                      {price}
                    </p>
                    <p className="text-gray-500 mb-8">{description}</p>

                    <stripe-buy-button
                      buy-button-id={id}
                      publishable-key="pk_live_51LO28HEcRqjLfVA2ChuRABaHeAGLF3foAIuYXROAa4cj0u1tEPUuzP5fRQKa75Qpeh0OXyOlxMEv5h9EklXcgVo300L2yD7mDG"
                      class="w-full max-w-xs mx-auto"
                    ></stripe-buy-button>
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
