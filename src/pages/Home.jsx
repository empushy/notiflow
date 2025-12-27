import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";

import Header from "../partials/Header";
import Footer from "../partials/Footer";
import Sidebar from "../partials/Sidebar";
import NotificationStatCard from "../partials/dashboard/NotificationStatCard";
import EmotionalToneTrends from "../partials/dashboard/NotificationToneCard";
import Loader from "../partials/dashboard/Loader";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

const NotificationCard = ({ message, iconUrl, posted, appName, onClick }) => {
  const timeAgo = moment(posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]").fromNow();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -30, opacity: 0 }}
      transition={{ type: "spring", stiffness: 230, damping: 25 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
      className="
        bg-white/60 backdrop-blur-[9px] 
        shadow-xl rounded-2xl w-full min-h-[110px]
        ring-1 ring-inset ring-white/40
        hover:scale-[1.02] hover:shadow-2xl transition-all duration-300
        border border-gray-100 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-200
        overflow-hidden
      "
    >
      <div className="h-1 w-full bg-green-600" />
      <div className="flex items-start px-6 py-5">
        <div className="relative flex-shrink-0 w-20 h-20 rounded-full bg-white flex items-center justify-center mr-4 shadow-sm border-4 border-white overflow-hidden">
          {iconUrl && !imgError ? (
            <>
              <img
                src={iconUrl}
                alt="Notification Icon"
                className="w-full h-full object-cover bg-white"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 4px white'}}></div>
            </>
          ) : (
            <>
              <span className="text-4xl text-gray-400">🔔</span>
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 4px white, 0 0 0 4px white'}}></div>
            </>
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
      </div>
    </motion.div>
  );
};

const NotificationSystem = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (notif) => {
    setSelectedNotification(notif);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedNotification(null);
  };

  // Close modal on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && modalOpen) closeModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const at = await getAccessTokenSilently();
      try {
        const response = await fetch(`${API_URL}/web/recent-notifications`, {
          method: "GET",
          headers: { Authorization: `Bearer ${at}` },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full max-w-7xl">
        <AnimatePresence>
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                message={notif.text}
                iconUrl={notif.icon}
                posted={notif.posted}
                appName={notif.appName}
                onClick={() => openModal(notif)}
              />
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center text-gray-500">
              No recent notifications
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* Modal */}
      <AnimatePresence>
        {modalOpen && selectedNotification && (
          <motion.div
            key="notif-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            <motion.div
              key="notif-modal"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm border-4 border-white overflow-hidden">
                  {selectedNotification.icon ? (
                    <>
                      <img src={selectedNotification.icon} alt="icon" className="w-full h-full object-cover bg-white" />
                      <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 4px white'}}></div>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl text-gray-400">🔔</span>
                      <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 4px white, 0 0 0 4px white'}}></div>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedNotification.appName}</h3>
                      <p className="text-xs text-gray-400">{moment(selectedNotification.posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]").fromNow()}</p>
                    </div>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 ml-4">Close</button>
                  </div>
                  <div className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedNotification.text}
                  </div>

                  {/* Empushy Analytics */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Empushy Analytics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 bg-white border border-gray-200 rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">Notification frequency (last 7 days)</div>
                        <div className="h-36 flex items-end gap-2">
                          <div className="flex-1 h-6 rounded-t-lg bg-indigo-100" />
                          <div className="flex-1 h-12 rounded-t-lg bg-indigo-300" />
                          <div className="flex-1 h-20 rounded-t-lg bg-indigo-400" />
                          <div className="flex-1 h-10 rounded-t-lg bg-indigo-300" />
                          <div className="flex-1 h-8 rounded-t-lg bg-indigo-200" />
                          <div className="flex-1 h-22 rounded-t-lg bg-indigo-400" />
                          <div className="flex-1 h-14 rounded-t-lg bg-indigo-300" />
                        </div>
                        <div className="mt-3 text-xs text-gray-500">Static sample chart — real charts will replace this using Empushy analytics data.</div>
                      </div>
                      <div className="md:col-span-1 bg-white border border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <div className="text-xs text-gray-500">Total notifications</div>
                            <div className="text-xl font-semibold text-gray-900">1,234</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Avg / day</div>
                            <div className="text-xl font-semibold text-gray-900">176</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Top keywords</div>
                            <div className="text-sm text-gray-700">sale · update · promo</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">More analytics coming soon — brand frequency, text analysis, and engagement metrics.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Home() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalStats, setTotalStats] = useState();
  const [loadingStats, setLoadingStats] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Emotional Tone");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleFilterClick = async (filter) => {
    setCurrentPage(1);
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
          var userData = await res.json();
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

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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

            {/* Recent Notifications Section */}
            <section className="max-w-7xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
              <NotificationSystem />
            </section>

            {/* Filters */}
            <div className="flex justify-center mt-12 gap-4 mb-16 flex-wrap">
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
              <EmotionalToneTrends trendType={selectedFilter}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;
