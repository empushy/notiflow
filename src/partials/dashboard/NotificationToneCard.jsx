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

function parseISO(d) {
  // Robust parse to not slip months due to timezone
  const [y, m, day] = d.split("T")[0].split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, day || 1));
}

function formatMonthOnly(dateString) {
  const date = parseISO(dateString);
  return date.toLocaleString("en-US", { month: "short" });
}

function formatTooltipDate(dateString) {
  const date = parseISO(dateString);
  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// To always show every month from first to last data point:
function getContinuousMonthTicks(data) {
  if (!data.length) return [];
  const sorted = [...data].sort((a, b) => parseISO(a.date) - parseISO(b.date));
  const start = parseISO(sorted[0].date);
  const end = parseISO(sorted[sorted.length - 1].date);
  const ticks = [];
  // Align start to first day of that month
  let cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1)
  );
  while (cursor <= end) {
    const iso = `${cursor.getUTCFullYear()}-${String(
      cursor.getUTCMonth() + 1
    ).padStart(2, "0")}-01`;
    ticks.push(iso);
    // Move one month ahead
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
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

  const itemsPerPageInternal = itemsPerPage || 10;
  const currentPageInternal = currentPage || 1;

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/web/emotional-tone-trends?filter=${trendType}`, {
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
        Object.keys(trends).forEach((date) => {
          const dailyData = { date };

          Object.keys(trends[date]).forEach((emotion) => {
            const { count, avg_intensity, example_notification, matches } =
              trends[date][emotion];

            dailyData[emotion] = count;

            if (!emotionStats[emotion]) {
              emotionStats[emotion] = {
                total_count: 0,
                total_intensity: 0,
                example_notification,
                matches,
              };
            }
            emotionStats[emotion].total_count += count;
            emotionStats[emotion].total_intensity += avg_intensity;
          });

          transformedData[date] = dailyData;
        });

        Object.keys(emotionStats).forEach((emotion) => {
          const { total_count, total_intensity } = emotionStats[emotion];
          emotionStats[emotion].avg_intensity = (
            total_intensity / total_count
          ).toFixed(2);
        });

        setData(Object.values(transformedData));
        setEmotions(Object.keys(emotionStats));
        setStats(emotionStats);
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
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div
                className="h-1 w-full"
                style={{
                  backgroundColor:
                    EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
                }}
              />

              <div className="p-6">
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
                      Intensity
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

                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart
                      data={data}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        stroke="#f3f4f6"
                        strokeDasharray="1 1"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        interval="preserveStartEnd"
                        tickFormatter={formatMonthOnly}
                        ticks={getContinuousMonthTicks(data)}
                        tick={{ fill: "#9ca3af", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={10}
                      />
                      <Tooltip
                        labelFormatter={formatTooltipDate}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          fontSize: "14px",
                        }}
                        labelStyle={{ color: "#374151", fontWeight: "500" }}
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

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Featured Notification
                  </h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {highlightMatches(
                      stats[emotion]?.example_notification,
                      stats[emotion]?.matches
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default EmotionalToneTrends;
