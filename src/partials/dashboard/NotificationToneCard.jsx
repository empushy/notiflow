import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Loader from "../../partials/dashboard/Loader";

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

const EMOTION_GRADIENTS = {
  joy: "from-emerald-500/20 to-emerald-500/5",
  anger: "from-red-500/20 to-red-500/5",
  sadness: "from-blue-500/20 to-blue-500/5",
  surprise: "from-amber-500/20 to-amber-500/5",
  fear: "from-violet-500/20 to-violet-500/5",
  default: "from-orange-500/20 to-orange-500/5",
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

const EmotionalToneTrends = ({ trendType }) => {
  const [data, setData] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

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

  // Show loader while data is being fetched
  if (loading) {
    return <Loader />;
  }

  const totalPages = Math.ceil(emotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmotions = emotions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
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

  return (
    <div className="space-y-6 mt-12">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, emotions.length)} of{" "}
          {emotions.length} emotions
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentEmotions.map((emotion) => (
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
                      color: EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
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
                      stroke={EMOTION_COLORS[emotion] || EMOTION_COLORS.default}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: EMOTION_COLORS[emotion] || EMOTION_COLORS.default,
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
        ))}
      </div>
    </div>
  );
};

export default EmotionalToneTrends;
