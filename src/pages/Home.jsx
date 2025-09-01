import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";

import Header from "../partials/Header";
import Footer from "../partials/Footer";
import NotificationStatCard from "../partials/dashboard/NotificationStatCard";
import EmotionalToneTrends from "../partials/dashboard/NotificationToneCard";
import EmotionalToneHeatmap from "../partials/dashboard/EmotionalToneHeatmap";
import Loader from "../partials/dashboard/Loader";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

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
  const { getAccessTokenSilently } = useAuth0();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const at = await getAccessTokenSilently();
      try {
        const response = await fetch(`${API_URL}/web/recent-notifications`, {
          method: "GET",
          headers: { Authorization: `Bearer ${at}` },
        });
        const data = await response.json();
        console.log(data)
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

function Home() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState();
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Emotional Tone");

  const handleFilterClick = async (filter) => {
    setSelectedFilter(filter);
    // fetch data as needed
  };

  useEffect(() => {
    (async () => {
      if (isAuthenticated)
      {
        const at = await getAccessTokenSilently();   // must have audience set in Auth0Provider
        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${at}` },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("[Auth] /auth/me failed:", res.status, txt);
        } else {
          console.log("[Auth] /auth/me ok");
        }
      }
    })();
  }, [isAuthenticated, user])

  useEffect(() => {
    const fetchTotalStats = async () => {
      setLoadingStats(true);
      try {
        const response = await fetch(`${API_URL}/web/total-stats`, {
          method: "GET",
          headers: {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This should be handled by the router
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isAuthenticated={isAuthenticated} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Welcome Section */}
            <section className="relative w-full rounded-2xl mb-20 shadow-lg overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-900">
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
                    Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
                  </h1>

                  <p className="text-lg sm:text-xl text-green-100 mb-8 font-medium max-w-2xl">
                    Your notification analytics dashboard is ready. Track
                    trends, analyze patterns, and stay{" "}
                    <span className="font-semibold text-green-100 underline underline-offset-4 decoration-green-300">
                      ahead of the curve
                    </span>
                    .
                  </p>

                  <div className="flex gap-4 flex-wrap">
                    <button className="px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-green-600 text-white text-lg shadow-lg transition hover:-translate-y-1 duration-200">
                      View Analytics
                    </button>
                    <button className="px-7 py-3 rounded-xl font-semibold text-green-200 border border-green-300/70 bg-white/10 hover:bg-white/20 transition text-lg shadow">
                      Export Data
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
                      ? "bg-green-500 text-white shadow-lg"
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

            {/* Recent Notifications Section */}
            <section className="max-w-7xl mx-auto mb-20 px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Recent Notifications
              </h2>
              <NotificationSystem />
            </section>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Home;
