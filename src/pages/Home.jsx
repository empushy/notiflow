﻿import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";

import Header from "../partials/Header";
import Footer from "../partials/Footer";
import Sidebar from "../partials/Sidebar";
import NotificationStatCard from "../partials/dashboard/NotificationStatCard";
import EmotionalToneTrends from "../partials/dashboard/NotificationToneCard";
import Loader from "../partials/dashboard/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const faviconFromBrand = (b = "") => {
  if (!b || typeof b !== "string") return "";
  const trimmed = b.trim();
  if (!trimmed.includes(".")) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(trimmed)}&sz=128`;
};

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
        shadow-xl rounded-2xl w-full
        ring-1 ring-inset ring-white/40
        hover:scale-[1.02] hover:shadow-2xl transition-all duration-300
        border border-gray-100 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-200
        overflow-visible
      "
    >
      <div className="h-1 w-full bg-green-600" />
      <div className="relative px-4 py-4 pt-6">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm border-[3px] border-white overflow-hidden">
            {iconUrl && !imgError ? (
              <>
                <img
                  src={iconUrl}
                  alt="Notification Icon"
                  className="w-full h-full object-cover bg-white"
                  onError={() => setImgError(true)}
                />
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 3px white'}}></div>
              </>
            ) : (
              <>
                <span className="text-2xl text-gray-400">••</span>
                <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 3px white, 0 0 0 3px white'}}></div>
              </>
            )}
          </div>
        </div>
        <div className="pl-4 pr-2 space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="text-[11px] text-gray-400 font-semibold truncate">
              {appName}
            </span>
            <span className="text-[11px] text-pink-400 font-medium ml-2">
              {timeAgo}
            </span>
          </div>
          <div className="text-xs text-gray-900 font-medium leading-snug line-clamp-2">
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
        const response = await fetch(`${API_URL}/web/recent-notifications?limit=4`, {
          method: "GET",
          headers: { Authorization: `Bearer ${at}` },
        });
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        const displayed = list.slice(0, 4); // Only show the latest 4
        setNotifications(displayed);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 180000);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl">
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
                      <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 3px white'}}></div>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl text-gray-400">ðŸ””</span>
                      <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 3px white, 0 0 0 3px white'}}></div>
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
                        <div className="mt-3 text-xs text-gray-500">Static sample chart â€” real charts will replace this using Empushy analytics data.</div>
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
                            <div className="text-sm text-gray-700">sale Â· update Â· promo</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">More analytics coming soon â€” brand frequency, text analysis, and engagement metrics.</p>
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
  const [starredBrands, setStarredBrands] = useState([]);
    const [brandFeeds, setBrandFeeds] = useState({});
    const [brandMeta, setBrandMeta] = useState({});
  const [brandPage, setBrandPage] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("Emotional Tone");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const brandsPerPage = 3;

  const handleFilterClick = async (filter) => {
    setCurrentPage(1);
    setSelectedFilter(filter);
    // fetch data as needed
  };

  const displayedBrands = starredBrands.slice(
    brandPage * brandsPerPage,
    brandPage * brandsPerPage + brandsPerPage
  );
  const totalBrandPages = Math.max(Math.ceil(starredBrands.length / brandsPerPage), 1);

  // Keep current page in bounds if starred brands list changes
  useEffect(() => {
    const maxPage = Math.max(Math.ceil(starredBrands.length / brandsPerPage) - 1, 0);
    if (brandPage > maxPage) {
      setBrandPage(maxPage);
    }
  }, [starredBrands.length]);

  useEffect(() => {
    displayedBrands.forEach((b) => {
      if (b && !brandFeeds[b]) {
        loadBrandFeed(b);
      }
      if (b && !brandMeta[b]) {
        loadBrandMeta(b);
      }
    });
  }, [brandPage, starredBrands]);

  useEffect(() => {
      (async () => {
        if (isAuthenticated) {
          const at = await getAccessTokenSilently(); // must have audience set in Auth0Provider
          const res = await fetch(`${API_URL}/auth/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${at}` },
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            console.error("[Auth] /auth/me failed:", res.status, txt);
          } else {
            await res.json();
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
              "X-API-Key": API_KEY,
            },
          });
          if (!response.ok) {
            const txt = await response.text().catch(() => "");
            throw new Error(`Status ${response.status}: ${txt}`);
          }
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

  // Load starred brands
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(
          `${API_URL}/web/brands/starred?email=${encodeURIComponent(user.email)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) {
          console.error("Failed to load starred brands", res.status);
          return;
        }
        const json = await res.json();
        setStarredBrands(json.brands || []);
        setBrandPage(0);
      } catch (err) {
        console.error("Failed to load starred brands", err);
      }
    })();
  }, [API_URL, getAccessTokenSilently, isAuthenticated, user]);

  const loadBrandMeta = async (brand) => {
    if (!brand || brandMeta[brand]) return;
    try {
      const res = await fetch(`${API_URL}/web/brands/metadata?brand=${encodeURIComponent(brand)}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json?.found && json.data) {
        setBrandMeta((prev) => ({ ...prev, [brand]: json.data }));
      }
    } catch (err) {
      console.error("Failed to load brand metadata", brand, err);
    }
  };

  const loadBrandFeed = async (brand) => {
    if (!brand) return;
    setBrandFeeds((prev) => ({
      ...prev,
      [brand]: { ...(prev[brand] || {}), loading: true },
    }));
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(
        `${API_URL}/web/notifications/starred?brand=${encodeURIComponent(brand)}&limit=3`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const json = await res.json();
      const data = json.notifications || json || [];
      setBrandFeeds((prev) => ({
        ...prev,
        [brand]: { loading: false, data },
      }));
    } catch (err) {
      console.error("Failed to load brand feed", brand, err);
      setBrandFeeds((prev) => ({
        ...prev,
        [brand]: { loading: false, data: [] },
      }));
    }
  };

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

            {/* Recent Notifications Section */}
            <section className="max-w-7xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
              <div className="space-y-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                  Live feed
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Live notifications</h2>
                <p className="text-sm text-gray-500 max-w-xl">
                  See the newest pushes as they arrive and track brand momentum in real time.
                </p>
            </div>
            <NotificationSystem />
          </section>

            {/* Starred Brands */}
            {starredBrands.length > 0 && (
              <section className="max-w-7xl mx-auto mb-12 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-indigo-500 font-semibold">Favourites</p>
                    <h2 className="text-2xl font-bold text-gray-900">Starred brands</h2>
                    <p className="text-sm text-gray-500">Latest pushes from the brands you care about.</p>
                  </div>
                  {starredBrands.length > brandsPerPage && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBrandPage((p) => Math.max(0, p - 1))}
                        disabled={brandPage === 0}
                        className="p-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="text-xs text-gray-600">
                        Page {brandPage + 1} / {totalBrandPages}
                      </div>
                      <button
                        onClick={() => setBrandPage((p) => Math.min(totalBrandPages - 1, p + 1))}
                        disabled={brandPage >= totalBrandPages - 1}
                        className="p-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {displayedBrands.map((brand, idx) => {
                    const feed = brandFeeds[brand] || { loading: true, data: [] };
                    const meta = brandMeta[brand] || {};
                    const colors = ["from-indigo-500/20", "from-emerald-500/20", "from-amber-500/20", "from-sky-500/20"];
                    const glow = colors[idx % colors.length];
                    const iconSrc = meta.icon || faviconFromBrand(meta.url || meta.title || brand) || meta.headerImage || "";
                    const headerStyle = meta.headerImage
                      ? {
                          // Stronger white overlay pulled higher (~70% white)
                          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 8%, rgba(255,255,255,0.9) 32%, rgba(255,255,255,0.99) 55%, rgba(255,255,255,1) 100%), url(${meta.headerImage})`,
                          backgroundSize: "auto",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "top center",
                        }
                      : { backgroundImage: undefined };
                    return (
                      <div
                        key={brand}
                        className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                        style={headerStyle}
                      >
                        <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 border border-amber-200 text-amber-500 flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </div>
                        {!meta.headerImage && (
                          <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${glow} via-transparent to-white pointer-events-none`} />
                        )}
                        <div className="relative p-4 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                              {iconSrc ? (
                                <img
                                  src={iconSrc}
                                  alt={brand || "brand"}
                                  className="block w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    const fallback = faviconFromBrand(brand);
                                    if (fallback) e.currentTarget.src = fallback;
                                  }}
                                />
                              ) : (
                                <span className="text-sm font-semibold text-indigo-600">
                                  {brand?.charAt(0)?.toUpperCase() || "B"}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <h3 className="inline-flex items-center max-w-full gap-2 px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-semibold shadow-sm truncate">
                                <span className="truncate">{brand}</span>
                              </h3>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {feed.loading ? (
                              <div className="text-xs text-gray-400">Loadingâ€¦</div>
                            ) : feed.data && feed.data.length > 0 ? (
                              feed.data.map((notif) => (
                                <div
                                  key={notif.id || notif._id || notif.ts}
                                  className="rounded-xl border border-gray-100 bg-white/80 p-3 hover:border-indigo-100 transition shadow-sm"
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-xs text-gray-500">
                                      {moment(notif.ts || notif.posted || notif.timestamp || new Date()).fromNow()}
                                    </p>
                                    {(() => {
                                      const appName = notif.appName || notif.brand || "Push";
                                      const isChrome =
                                        notif.appPackage === "com.android.chrome" ||
                                        notif.app === "com.android.chrome" ||
                                        appName === "Chrome";
                                      let domain = appName;
                                      if (isChrome) {
                                        const text = notif.text || notif.message || "";
                                        const match = text.match(/\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/);
                                        if (match && match[0]) {
                                          domain = match[0];
                                        }
                                      }
                                      return (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                          {domain}
                                        </span>
                                      );
                                    })()}
                                  </div>
                                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                    {notif.text || notif.message}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-gray-400">No recent notifications.</div>
                            )}
                          </div>
                          <div className="pt-2 flex justify-end">
                            <a
                              href={`/brand-insights?brand=${encodeURIComponent(brand)}`}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white/80 text-indigo-700 border border-indigo-100 shadow-sm hover:bg-indigo-50 transition"
                            >
                              More detail
                              <ChevronRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalBrandPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-600">
                    <button
                      onClick={() => setBrandPage((p) => Math.max(0, p - 1))}
                      disabled={brandPage === 0}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="font-medium">
                      Page {brandPage + 1} of {totalBrandPages}
                    </span>
                    <button
                      onClick={() => setBrandPage((p) => Math.min(totalBrandPages - 1, p + 1))}
                      disabled={brandPage >= totalBrandPages - 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Emotion Filters Section */}
            <div className="max-w-7xl mx-auto mt-12 mb-6 px-4 text-left">
              <p className="text-xs uppercase tracking-[0.18em] text-indigo-500 font-semibold">Semantics</p>
              <h2 className="text-2xl font-bold text-gray-900">Explore notification tone and cadence</h2>
              <p className="text-sm text-gray-500">
                Toggle between emotion, context, triggers, call-to-emotion, and promotions to explore trends.
              </p>
            </div>
            <div className="max-w-7xl mx-auto flex justify-start gap-4 mb-12 flex-wrap px-4">
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
            <div className="max-w-7xl mx-auto mb-24 px-4">
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





