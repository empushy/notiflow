// src/partials/dashboard/EmotionalToneTrends.jsx
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight, LockIcon } from "lucide-react";
import Loader from "../../partials/dashboard/Loader";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const API_KEY = import.meta.env.VITE_NOTIFLOW_API_KEY;

const EMOTION_COLORS = {
  joy: "#10b981", // emerald-500
  anger: "#ef4444", // red-500
  sadness: "#3b82f6", // blue-500
  surprise: "#f59e0b", // amber-500
  fear: "#8b5cf6", // violet-500
  default: "#f97316", // orange-500
};

// Custom tooltip that shows semantic labels based on quadrants
const CustomTooltip = ({ active, payload, label, emotion, data }) => {
  if (!active || !payload || !payload.length) return null;

  const value = payload[0].value;
  
  // Calculate quartiles for this emotion across all data points
  const values = data.map(d => d[emotion] || 0).filter(v => v > 0).sort((a, b) => a - b);
  if (values.length === 0) return null;
  
  const q1Index = Math.floor(values.length * 0.33);
  const q3Index = Math.floor(values.length * 0.67);
  
  const q1 = values[q1Index];
  const q3 = values[q3Index];
  
  let level = "Normal";
  if (value <= q1) {
    level = "Low";
  } else if (value >= q3) {
    level = "High";
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        padding: "8px 12px",
      }}
    >
      <p style={{ color: "#374151", fontWeight: "500", marginBottom: "4px" }}>
        {formatTooltipDate(label)}
      </p>
      <p style={{ color: EMOTION_COLORS[emotion] || EMOTION_COLORS.default, fontWeight: "600" }}>
        {level}
      </p>
    </div>
  );
};

function parseWeekString(weekStr) {
  // Parse format like "2025-W50" to get year and week number
  const match = weekStr.match(/(\d{4})-W(\d{2})/);
  if (!match) return new Date();
  
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  
  // Calculate the date of the first day of that week (Sunday)
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const daysOffset = week * 7;
  const weekDate = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
  
  return weekDate;
}

function formatMonthOnly(weekStr) {
  const weekDate = parseWeekString(weekStr);
  return weekDate.toLocaleString("en-US", { month: "short" });
}

function formatTooltipDate(weekStr) {
  const weekDate = parseWeekString(weekStr);
  return weekDate.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) + " (week start)";
}

// Get 4 evenly spaced ticks from the data
function getEvenlySpacedTicks(data, numTicks = 4) {
  if (!data.length) return [];
  if (data.length <= numTicks) return data.map(d => d.date);
  
  const sorted = [...data].sort((a, b) => parseWeekString(a.date) - parseWeekString(b.date));
  const ticks = [];
  const step = Math.floor(sorted.length / (numTicks - 1));
  
  for (let i = 0; i < numTicks - 1; i++) {
    ticks.push(sorted[i * step].date);
  }
  // Always include the last data point
  ticks.push(sorted[sorted.length - 1].date);
  
  return ticks;
}

const LOCK_ICON_SVG = (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    className="text-blue-500"
  >
    <path d="M6 10v2a6 6 0 1 0 12 0v-2" stroke="currentColor" strokeWidth="2" />
    <rect x="6" y="10" width="12" height="8" rx="4" fill="currentColor" />
  </svg>
);

const EmotionalToneTrends = ({
  trendType,
  currentPage,
  itemsPerPage,
  onPageChange,
}) => {
  const [data, setData] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth0();
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

  const itemsPerPageInternal = itemsPerPage || 10;
  const currentPageInternal = currentPage || 1;

  useEffect(() => {
    setLoading(true);
      fetch(`${API_URL}/web/emotional-tone-trends?filter=${trendType}&months=3`, {
        method: "GET",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((trends) => {
        const transformedData = {};
        const emotionStats = {};
        Object.entries(trends || {}).forEach(([date, value]) => {
          // Skip entries that fall in the current week (week start Sunday)
          const weekDate = parseWeekString(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const daysSinceSunday = (today.getDay() + 7 - 0) % 7; // Sunday -> 0
          const startOfWeek = new Date(today.getTime() - daysSinceSunday * 24 * 60 * 60 * 1000);
          if (weekDate >= startOfWeek) return;

          const dailyData = { date };

            Object.keys(value).forEach((emotion) => {
              const {
                count,
                avg_intensity,
                example_notification,
                example_appName,
                example_icon,
                example_posted,
                matches,
              } = value[emotion];

              const intensityNum = Number(avg_intensity) || 0;

              dailyData[emotion] = count;

              if (!emotionStats[emotion]) {
                emotionStats[emotion] = {
                  total_count: 0,
                  total_intensity: 0,
                  example_notification,
                  example_appName,
                  example_icon,
                  example_posted,
                  matches,
                };
              } else {
                // Keep the most recent notification (compare posted dates)
              const currentPosted = new Date(emotionStats[emotion].example_posted);
              const newPosted = new Date(example_posted);
              if (newPosted > currentPosted) {
                emotionStats[emotion].example_notification = example_notification;
                emotionStats[emotion].example_appName = example_appName;
                emotionStats[emotion].example_icon = example_icon;
                emotionStats[emotion].example_posted = example_posted;
                emotionStats[emotion].matches = matches;
              }
            }
            emotionStats[emotion].total_count += count;
            emotionStats[emotion].total_intensity += intensityNum * count;
          });

          transformedData[date] = dailyData;
        });

        Object.keys(emotionStats).forEach((emotion) => {
          const { total_count, total_intensity } = emotionStats[emotion];
          emotionStats[emotion].avg_intensity = (
            total_count > 0 ? total_intensity / total_count : 0
          ).toFixed(2);
        });

        // Drop null/None buckets
        const cleanedEntries = Object.entries(emotionStats).filter(([key]) => {
          const k = (key || "").toLowerCase();
          return k && k !== "none" && k !== "absent";
        });
        const cleanedStats = Object.fromEntries(cleanedEntries);

        setData(Object.values(transformedData));
        const sortedEmotions = Object.keys(cleanedStats).sort(
          (a, b) =>
            (cleanedStats[b]?.total_count || 0) -
            (cleanedStats[a]?.total_count || 0)
        );
        setEmotions(sortedEmotions);
        setStats(cleanedStats);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching emotional tone trends:", error);
        setLoading(false);
      });
  }, [trendType]);

  if (loading) {
    return <Loader />;
  }

  const maxPages = Math.ceil(emotions.length / itemsPerPageInternal)
  const totalPages = maxPages <= 10 ? maxPages : 10;
  const startIndex = (currentPageInternal - 1) * itemsPerPageInternal;
  const endIndex = startIndex + itemsPerPageInternal;
  const currentEmotions = emotions.slice(startIndex, endIndex);

  // Lock/partial filter constants - passed from Dashboard for logic
  const LOCKED_FILTERS = [
    "Behavioral Triggers",
    "Call-to-Emotion",
    "Promotions",
  ];

  const PARTIAL_FILTERS = ["Emotional Tone", "Context Awareness"];

  const isLockedFilter = LOCKED_FILTERS.includes(trendType) && !isAuthenticated;
  const isPartialLockedFilter =
    PARTIAL_FILTERS.includes(trendType) &&
    !isAuthenticated &&
    currentPageInternal > 3;

  const goToPage = (page) => {
    if (isPartialLockedFilter || isLockedFilter) return;
    if (page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const highlightMatches = (text, matches) => {
    if (!text || !matches || matches.length === 0) return text;

    const escapedMatches = matches.map((match) =>
      match.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
    );

    const regex = new RegExp(`(${escapedMatches.join("|")})`, "gi");

    return text.split(regex).map((part, index) =>
      escapedMatches.some(
        (match) => part.toLowerCase() === match.toLowerCase()
      ) ? (
        <span
          key={index}
          className="bg-gradient-to-r from-pink-100 to-pink-50 px-1.5 py-0.5 rounded-md text-pink-800 font-medium"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (isLockedFilter) {
    // Fully locked: show lock message instead of charts
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-blue-100/60 rounded-xl opacity-70 cursor-not-allowed relative">
        <LockIcon className="w-4 h-4" />
        <span
          className="z-10 text-md text-blue-800 font-bold mt-12"
          title="Available to PRO users"
        >
          Available to PRO users
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 mt-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, emotions.length)} of{" "}
          {emotions.length} emotions
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => goToPage(currentPageInternal - 1)}
              disabled={currentPageInternal === 1 || isPartialLockedFilter}
              className="px-2 sm:px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const pageLocked =
                    PARTIAL_FILTERS.includes(trendType) &&
                    !isAuthenticated &&
                    page > 3;

                  return (
                    <button
                      key={page}
                      onClick={() => (pageLocked ? null : goToPage(page))}
                      className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        pageLocked
                          ? "bg-blue-100 text-blue-400 cursor-not-allowed relative"
                          : currentPageInternal === page
                          ? "bg-blue-500 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      disabled={pageLocked}
                      title={pageLocked ? "Available to PRO users" : ""}
                    >
                      {pageLocked ? (
                        <span className="inline-block align-text-bottom">
                          <LockIcon className="w-4 h-4" />
                        </span>
                      ) : null}
                      {!pageLocked ? page : null}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={() => goToPage(currentPageInternal + 1)}
              disabled={
                currentPageInternal === totalPages || isPartialLockedFilter
              }
              className="px-2 sm:px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEmotions.map((emotion) =>
          isPartialLockedFilter ? (
            <div
              key={emotion}
              className="relative bg-blue-100/60 rounded-xl min-h-[280px] flex items-center justify-center cursor-not-allowed opacity-70"
              title="Available to PRO users"
            >
              {LOCK_ICON_SVG}
              <span className="absolute bottom-8 text-blue-800 font-bold text-lg select-none">
                Available to PRO users
              </span>
            </div>
          ) : (
            <div
              key={emotion}
              className="relative"
            >
              <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden mb-4 mx-3">
                <div
                  className="h-1 w-full"
                  style={{
                    backgroundColor:
                      EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
                  }}
                />

                <div className="p-6 pb-8">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 capitalize">
                      {emotion}
                    </h2>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Volume
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-3">
                        {stats[emotion]?.total_count.toLocaleString()}
                      </div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Avg intensity
                      </div>
                      <div
                        className="text-lg font-semibold"
                        style={{
                          color:
                            EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
                        }}
                      >
                        {stats[emotion]?.avg_intensity}
                      </div>
                    </div>
                  </div>

                  <div className="mb-0">
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid
                          stroke="#d1d5db"
                          strokeDasharray="3 3"
                          vertical={true}
                          horizontal={false}
                        />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatMonthOnly}
                          ticks={getEvenlySpacedTicks(data, 4)}
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickMargin={10}
                          angle={0}
                          height={50}
                        />
                        <Tooltip
                          content={<CustomTooltip emotion={emotion} data={data} />}
                        />
                        <Line
                          type="monotone"
                          dataKey={emotion}
                          stroke={
                            EMOTION_COLORS[emotion] || EMOTION_COLORS.default
                          }
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill:
                              EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
                            strokeWidth: 2,
                            stroke: "white",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Featured Notification - Full Width, Overlapping */}
              <div className="relative -mt-12 z-10">
                <div
                  onClick={() => {
                    const notif = stats[emotion] || {};
                    const base = {
                      ...notif,
                      icon: notif.example_icon || notif.icon,
                      appPackage: notif.example_app_package || notif.appPackage,
                      app: notif.example_app_package || notif.app,
                      appName: notif.example_appName || notif.appName,
                      text: notif.example_notification || notif.text,
                    };
                    openModal({
                      text: notif.example_notification,
                      appName: base.appName || emotion.charAt(0).toUpperCase() + emotion.slice(1),
                      posted: notif.example_posted || new Date().toUTCString(),
                      icon: buildIcon(base),
                    });
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      const notif = stats[emotion] || {};
                      const base = {
                        ...notif,
                        icon: notif.example_icon || notif.icon,
                        appPackage: notif.example_app_package || notif.appPackage,
                        app: notif.example_app_package || notif.app,
                        appName: notif.example_appName || notif.appName,
                        text: notif.example_notification || notif.text,
                      };
                      openModal({
                        text: notif.example_notification,
                        appName: base.appName || emotion.charAt(0).toUpperCase() + emotion.slice(1),
                        posted: notif.example_posted || new Date().toUTCString(),
                        icon: buildIcon(base),
                      });
                    }
                  }}
                  className="bg-white backdrop-blur-[9px] shadow-xl rounded-xl w-full ring-1 ring-inset ring-gray-200 hover:scale-[1.02] hover:shadow-2xl transition-all duration-200 border border-gray-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 overflow-hidden"
                >
                  <div className="h-1 w-full bg-blue-500" />
                <div className="flex items-start px-4 py-3 min-h-[90px]">
                  <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm border-2 border-white overflow-hidden">
                    {(() => {
                      const notif = stats[emotion] || {};
                      const base = {
                        ...notif,
                        icon: notif.example_icon || notif.icon,
                        appPackage: notif.example_app_package || notif.appPackage,
                        app: notif.example_app_package || notif.app,
                        appName: notif.example_appName || notif.appName,
                        text: notif.example_notification || notif.text,
                      };
                      return buildIcon(base);
                    })() ? (
                      <>
                        {(() => {
                          const notif = stats[emotion] || {};
                          const base = {
                            ...notif,
                            icon: notif.example_icon || notif.icon,
                            appPackage: notif.example_app_package || notif.appPackage,
                            app: notif.example_app_package || notif.app,
                            appName: notif.example_appName || notif.appName,
                            text: notif.example_notification || notif.text,
                          };
                          const iconUrl = buildIcon(base);
                          return (
                            <img
                              src={iconUrl}
                              alt="App Icon"
                              className="w-full h-full object-cover bg-white"
                            />
                          );
                        })()}
                          <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 2px white'}}></div>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">💭</span>
                          <div className="absolute inset-0 rounded-full pointer-events-none" style={{boxShadow: 'inset 0 0 0 2px white'}}></div>
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-gray-400 font-semibold truncate">
                          {(() => {
                            const notif = stats[emotion] || {};
                            const chromeDomain =
                              (notif.example_appName && notif.example_appName.includes(".") && notif.example_appName) ||
                              chromeDomainFromText(notif.example_notification || "");
                            const isChrome = isChromeNotif({
                              appPackage: notif.example_app_package,
                              app: notif.example_app_package,
                              appName: notif.example_appName,
                            });
                            return isChrome && chromeDomain
                              ? chromeDomain
                              : notif.example_appName || emotion.charAt(0).toUpperCase() + emotion.slice(1);
                          })()}
                        </span>
                        <span className="text-xs text-indigo-400 font-medium ml-2">
                          {stats[emotion]?.example_posted ? moment(stats[emotion].example_posted).fromNow() : ''}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900 font-medium leading-snug line-clamp-2 mb-2">
                        {stats[emotion]?.example_notification}
                      </div>
                      <div className="text-xs text-gray-400 italic">
                        ⭐ Featured notification
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
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

export default EmotionalToneTrends;
const chromeDomainFromText = (text = "") => {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/);
  return match ? match[0] : null;
};

const isChromeNotif = (notif = {}) =>
  notif.appPackage === "com.android.chrome" ||
  notif.app === "com.android.chrome" ||
  notif.appName === "Chrome";

const buildIcon = (notif = {}) => {
  const domain =
    (notif.appName && notif.appName.includes(".") && notif.appName) ||
    chromeDomainFromText(notif.text || notif.example_notification || "");

  if (isChromeNotif(notif) && domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }
  if (notif.icon) return notif.icon;
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }
  return notif.icon || "";
};
