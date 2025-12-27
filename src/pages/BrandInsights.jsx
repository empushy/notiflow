import { useCallback, useEffect, useState, useRef } from "react";
import moment from "moment";

import Header from "../partials/Header";
import Sidebar from "../partials/Sidebar";
import Loader from "../partials/dashboard/Loader";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;
const BELL_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5'/%3E%3Cpath d='M13 21a3 3 0 11-6 0'/%3E%3C/svg%3E";

const pickText = (notif = {}) => {
  const candidates = [
    notif.text,
    notif.notification_text,
    notif.message,
    notif.body,
    notif.title,
  ];
  const found = candidates.find((t) => typeof t === "string" && t.trim().length > 0);
  return found ? found.trim() : "";
};

const pickEmotionLabel = (notif = {}) => {
  const firstFromArray = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0]?.value || arr[0] : null);
  const candidates = [
    firstFromArray(notif.call_to_emotion),
    firstFromArray(notif.emotional_tone),
    notif.category,
    notif.type,
  ];
  const found = candidates.find((t) => typeof t === "string" && t.trim().length > 0);
  return found ? found.trim() : "Unknown";
};

const pickContextLabel = (notif = {}) => {
  const firstFromArray = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0]?.value || arr[0] : null);
  const candidates = [firstFromArray(notif.context_awareness), notif.category];
  const found = candidates.find((t) => typeof t === "string" && t.trim().length > 0);
  return found ? found.trim() : "Unknown";
};

const pickTriggerLabel = (notif = {}) => {
  const firstFromArray = (arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0]?.value || arr[0] : null);
  const candidates = [firstFromArray(notif.behavioral_triggers), notif.type];
  const found = candidates.find((t) => typeof t === "string" && t.trim().length > 0);
  return found ? found.trim() : "Unknown";
};

const pickPromotionLabel = (notif = {}) => {
  const promo = notif.specific_promotion_details || {};
  const flatten = (arr) => (Array.isArray(arr) ? arr : []);
  const candidates = [
    ...flatten(promo.discount_type || []).map((x) => (x?.value || x)),
    ...flatten(promo.offer_expiration || []).map((x) => (x?.value || x)),
    ...flatten(promo.terms_and_conditions || []).map((x) => (x?.value || x)),
  ];
  const found = candidates.find((t) => typeof t === "string" && t.trim().length > 0);
  return found ? found.trim() : "Unknown";
};

const heatColor = (count, max) => {
  if (count <= 0) return "bg-gray-100 text-gray-600";
  const ratio = count / (max || 1);
  if (ratio > 0.75) return "bg-emerald-200 text-emerald-800";
  if (ratio > 0.5) return "bg-emerald-100 text-emerald-700";
  if (ratio > 0.25) return "bg-amber-100 text-amber-700";
  return "bg-amber-50 text-amber-600";
};

const buildIcon = (notif = {}, brand = "") => {
  const isChrome = notif.app === "com.android.chrome" || notif.appPackage === "com.android.chrome";

  const domainFromText = () => {
    if (!notif.text) return null;
    const match = notif.text.match(/\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/);
    return match ? match[0] : null;
  };

  const domain = (() => {
    if (brand && brand.includes(".")) return brand;
    return domainFromText();
  })();

  if (isChrome && domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  if (notif.icon) return notif.icon;
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }
  return "";
};

// Single-select dropdown with inline search input
const SingleSelect = ({ options = [], value = "", onChange, placeholder = "Select", onSearch, loading = false }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const dropdownRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const filtered = options.filter((o) => o.toLowerCase().includes((inputValue || "").toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative z-[60]">
      <input
        className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400"
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {loading && (
        <div className="absolute top-2 right-2 text-[10px] text-gray-400 pointer-events-none">
          Loading...
        </div>
      )}
      {open && (
        <div className="absolute z-[3000] mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          <div className="p-3 pt-2 space-y-1">
            {filtered.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-sm"
              >
                <input
                  type="radio"
                  name="brand-select"
                  checked={value === opt}
                  onChange={() => {
                    onChange(opt);
                    setInputValue(opt);
                    setOpen(false);
                  }}
                />
                <span className="truncate">{opt}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-gray-400 px-2 py-1">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TextBlock = ({ title, icon = "", accent = "indigo", content }) => {
  const accentMap = {
    indigo: {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
      bg: "bg-gradient-to-br from-indigo-50 via-white to-white",
      stops: ["#f9faff", "#fcfdff", "#f1f5ff"],
      shadow: "rgba(79, 70, 229, 0.22)",
    },
    amber: {
      badge: "bg-amber-50 text-amber-700 border-amber-100",
      bg: "bg-gradient-to-br from-amber-50 via-white to-white",
      stops: ["#fffaf3", "#fffdfb", "#fff4dc"],
      shadow: "rgba(217, 119, 6, 0.2)",
    },
    emerald: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
      bg: "bg-gradient-to-br from-emerald-50 via-white to-white",
      stops: ["#f5fffa", "#fcfffe", "#e3fbf1"],
      shadow: "rgba(16, 185, 129, 0.18)",
    },
    sky: {
      badge: "bg-sky-50 text-sky-700 border-sky-100",
      bg: "bg-gradient-to-br from-sky-50 via-white to-white",
      stops: ["#f6fbff", "#fcfdff", "#e6f5ff"],
      shadow: "rgba(14, 165, 233, 0.2)",
    },
  };
  const cfg = accentMap[accent] || accentMap.indigo;
  const iconNode = typeof icon === "string" ? icon : icon;
  return (
    <div
      className={`rounded-2xl border border-white/70 ${cfg.bg} shadow-xl p-6 backdrop-blur-sm`}
      style={
        cfg.stops
          ? {
              backgroundImage: `linear-gradient(135deg, ${cfg.stops[0]}, ${cfg.stops[1]}, ${cfg.stops[2]})`,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-4 mb-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${cfg.badge} text-sm font-semibold shadow-sm`}
          title={title}
        >
          {iconNode}
        </span>
        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold" title={title}>
            {title}
          </p>
          <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
        </div>
      </div>
      <p className="text-base text-gray-900 leading-relaxed font-medium">
        {content || "Not available"}
      </p>
    </div>
  );
};

const RiskList = ({ risks }) => (
  <div
    className="rounded-2xl border border-transparent bg-gradient-to-br from-rose-50 via-white to-white shadow-xl p-5"
    style={{ backgroundImage: "linear-gradient(135deg, #fff3f6, #fffdfd, #ffe9ef)" }}
  >
    <div className="flex items-center gap-2 mb-2">
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-rose-50 text-rose-700 border-rose-100 text-sm font-semibold shadow-sm"
        title="Risks"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 .73 3z" />
        </svg>
      </span>
      <div className="flex flex-col">
        <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Risk signals</p>
        <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
      </div>
    </div>
    {risks.length === 0 ? (
      <p className="text-base text-gray-900 leading-relaxed font-medium">No obvious risks detected.</p>
    ) : (
      <ul className="list-disc list-inside space-y-2 text-base text-gray-900 leading-relaxed font-medium">
        {risks.map((r, idx) => (
          <li key={idx}>{r}</li>
        ))}
      </ul>
    )}
  </div>
);

const Timeline = ({ items, onLoadMore, loadingMore }) => {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500 text-center">
        No timeline data.
      </div>
    );
  }
  const palette = ["from-indigo-50 to-indigo-100", "from-sky-50 to-sky-100", "from-emerald-50 to-emerald-100"];
  const dayCounts = items.reduce((acc, item) => {
    const key = item.date || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return (
    <div className="rounded-2xl bg-transparent border-0 shadow-none p-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v4m0 8v4m12-8h4m-8 0h4m-8 0H2m10 0V6m0 8v6" />
          </svg>
        </div>
        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Timeline</p>
          <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
        </div>
      </div>
      <div className="relative py-4">
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] -translate-x-1/2 bg-gradient-to-b from-indigo-200 via-sky-200 to-indigo-500 rounded-full"></div>
        <div className="space-y-0">
          {items.map((i, idx) => {
            const isLeft = idx % 2 === 0;
            const nextIsLeft = (idx + 1) % 2 === 0;
            const color = palette[idx % palette.length];
            const timeLabel = i.time ? `${i.date || ""} ${i.time}`.trim() : i.date || "";
            const text = pickText(i);
            const iconUrl = buildIcon(i, i.brand);
            const displayTime = i.time || timeLabel || " ";
            const displayIcon = iconUrl || BELL_FALLBACK;
            const dateChanged = idx === 0 || i.date !== items[idx - 1]?.date;
            const roleTag = i.campaign_role || i.role;
            const typeTag = i.campaign_type || i.type;
            return (
              <div key={i.date || idx} className="space-y-1">
                {dateChanged && i.date && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 px-4 md:px-10">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200 flex items-center gap-2 shadow-sm">
                      <span>{i.date}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <span>{dayCounts[i.date] || 0}</span>
                      </span>
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}
                <div
                  className="relative flex items-stretch min-h-[170px] gap-4 md:gap-10 md:px-10 py-2"
                >
                  {isLeft ? (
                    <>
                    <div className="w-full md:w-1/2 pr-12">
                        <div
                          className="flex items-start bg-white/80 backdrop-blur-[9px] shadow-xl rounded-2xl px-6 py-5 w-full min-h-[120px] border border-transparent hover:shadow-2xl transition"
                        >
                          <div className="relative flex-shrink-0 w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 shadow-sm border-4 border-white overflow-hidden">
                            {displayIcon ? (
                              <img
                                src={displayIcon}
                                alt={i.brand || "icon"}
                                className="w-full h-full object-cover bg-white"
                                onError={(e) => {
                                  e.currentTarget.src = BELL_FALLBACK;
                                }}
                              />
                            ) : (
                              <span className="text-3xl text-gray-400">Bell</span>
                            )}
                            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "inset 0 0 0 4px white" }}></div>
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                              <span className="flex items-center gap-2">
                                {i.brand || i.appName || "Unknown brand"}
                              </span>
                              {displayTime ? <span className="text-xs text-indigo-500 font-medium">{displayTime}</span> : null}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
                              {typeTag && (
                                <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{typeTag}</span>
                              )}
                              {roleTag && (
                                <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{roleTag}</span>
                              )}
                              {i.cta && (
                                <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                  {i.cta}
                                </span>
                              )}
                            </div>
                            {text && <p className="text-sm text-gray-800 leading-snug line-clamp-2 block max-w-full">{text}</p>}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="hidden md:block w-1/2" aria-hidden="true"></div>
                    </>
                  )}

                  {/* Center bell with alternating date */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center px-10 gap-3 pointer-events-none z-0">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-amber-50 border-2 border-amber-300 shadow flex-shrink-0 flex items-center justify-center text-amber-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                  </div>

                  {/* Right column or placeholder */}
                  {!isLeft ? (
                  <div className="w-full md:w-1/2 pl-6 md:pl-12 text-right ml-auto">
                      <div
                        className="flex items-start bg-white/80 backdrop-blur-[9px] shadow-xl rounded-2xl px-6 py-5 w-full min-h-[120px] border border-transparent hover:shadow-2xl transition mr-0 ml-auto relative z-10"
                      >
                        <div className="relative flex-shrink-0 w-16 h-16 rounded-full bg-white flex items-center justify-center mr-4 shadow-sm border-4 border-white overflow-hidden">
                          {displayIcon ? (
                            <img
                              src={displayIcon}
                              alt={i.brand || "icon"}
                              className="w-full h-full object-cover bg-white"
                              onError={(e) => {
                                e.currentTarget.src = BELL_FALLBACK;
                              }}
                            />
                          ) : (
                            <span className="text-3xl text-gray-400">Bell</span>
                          )}
                          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "inset 0 0 0 4px white" }}></div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-2 text-right">
                          <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                            <span className="flex items-center gap-2">
                              {i.brand || i.appName || "Unknown brand"}
                            </span>
                            {displayTime ? <span className="text-xs text-indigo-500 font-medium">{displayTime}</span> : null}
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end text-xs text-gray-700">
                            {typeTag && (
                              <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{typeTag}</span>
                            )}
                            {roleTag && (
                              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{roleTag}</span>
                            )}
                            {i.cta && (
                              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                {i.cta}
                              </span>
                            )}
                          </div>
                          {text && <p className="text-sm text-gray-800 leading-snug text-right line-clamp-2 block max-w-full">{text}</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block w-1/2" aria-hidden="true"></div>
                  )}
                </div>

                {idx < items.length - 1 && (
                  <div className="flex justify-center -mt-1 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ transform: nextIsLeft ? "none" : "scaleX(-1)" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 18L18 8m0 0h-6m6 0v6" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {onLoadMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={onLoadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-indigo-700 border border-indigo-100 shadow-sm hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loadingMore ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Continue timeline</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EmotionBreakdown = ({ items }) => {
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500 text-center">
        No emotion breakdown available.
      </div>
    );
  }
  const sorted = [...items].sort((a, b) => (b.count || 0) - (a.count || 0));
  const visible = showAll ? sorted : sorted.slice(0, 5);
  const max = Math.max(...sorted.map((i) => i.count || 0), 1);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center text-rose-700 text-sm font-semibold shadow-sm"
            style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3" }}
            title="Top call-to-emotion intents"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6-4.35-6-9a6 6 0 1112 0c0 4.65-6 9-6 9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 11.5a1.5 1.5 0 00-3 0M18 11.5a1.5 1.5 0 00-3 0" />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Call to emotion</p>
            <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
          </div>
        </div>
        {sorted.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition"
            style={{
              border: "1px solid #fecdd3",
              color: "#be123c",
              backgroundColor: "#fff1f2",
            }}
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {visible.map((i) => (
          <div key={i.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-800">
              <span className="font-semibold">{i.label || "Unknown"}</span>
              <span className="text-gray-500">{i.count?.toLocaleString?.()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${Math.round(((i.count || 0) / max) * 100)}%`,
                  backgroundColor: "#fb7185",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CampaignTypesCard = ({ items }) => {
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500 text-center">
        No campaign type data available.
      </div>
    );
  }
  const sorted = [...items].sort((a, b) => (b.count || 0) - (a.count || 0));
  const visible = showAll ? sorted : sorted.slice(0, 5);
  const max = Math.max(...sorted.map((i) => i.count || 0), 1);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold shadow-sm"
            title="Campaign types"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10l-1 4H8L7 4zM8 8v10m8-10v10m-9 0h10" />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Campaign types</p>
            <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
          </div>
        </div>
        {sorted.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
          >
            {showAll ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {visible.map((i) => (
          <div key={i.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-800">
              <span className="font-semibold">{i.label || "Unknown"}</span>
              <span className="text-gray-500">{i.count?.toLocaleString?.()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${Math.round(((i.count || 0) / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GenericBreakdownCard = ({ title, icon, accent = "indigo", items, buttonAccent = "indigo" }) => {
  const [showAll, setShowAll] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500 text-center">
        No data available.
      </div>
    );
  }
  const sorted = [...items].sort((a, b) => (b.count || 0) - (a.count || 0));
  const visible = showAll ? sorted : sorted.slice(0, 5);
  const max = Math.max(...sorted.map((i) => i.count || 0), 1);
  const accentMap = {
    indigo: { bg: "bg-indigo-50 border-indigo-100 text-indigo-700", bar: "bg-indigo-500", btnBorder: "border-indigo-200", btnText: "text-indigo-700", btnBg: "bg-indigo-50", btnHover: "hover:bg-indigo-100" },
    amber: { bg: "bg-amber-50 border-amber-100 text-amber-700", bar: "bg-amber-500", btnBorder: "border-amber-200", btnText: "text-amber-700", btnBg: "bg-amber-50", btnHover: "hover:bg-amber-100" },
    emerald: { bg: "bg-emerald-50 border-emerald-100 text-emerald-700", bar: "bg-emerald-500", btnBorder: "border-emerald-200", btnText: "text-emerald-700", btnBg: "bg-emerald-50", btnHover: "hover:bg-emerald-100" },
    sky: { bg: "bg-sky-50 border-sky-100 text-sky-700", bar: "bg-sky-500", btnBorder: "border-sky-200", btnText: "text-sky-700", btnBg: "bg-sky-50", btnHover: "hover:bg-sky-100" },
    rose: { bg: "bg-rose-50 border-rose-100 text-rose-700", bar: "bg-rose-500", btnBorder: "border-rose-200", btnText: "text-rose-700", btnBg: "bg-rose-50", btnHover: "hover:bg-rose-100" },
  };
  const colors = accentMap[accent] || accentMap.indigo;
  const btnClasses = `px-3 py-1 rounded-full text-xs font-semibold border ${colors.btnBorder} ${colors.btnText} ${colors.btnBg} ${colors.btnHover} transition`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`h-9 w-9 rounded-xl ${colors.bg} border flex items-center justify-center text-sm font-semibold shadow-sm`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">{title}</p>
            <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
          </div>
        </div>
        {sorted.length > 5 && (
          <button type="button" onClick={() => setShowAll((prev) => !prev)} className={btnClasses}>
            {showAll ? "Show less" : "Show more"}
          </button>
        )}
      </div>
      <div className="space-y-3">
        {visible.map((i) => (
          <div key={i.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-800">
              <span className="font-semibold">{i.label || "Unknown"}</span>
              <span className="text-gray-500">{i.count?.toLocaleString?.()}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${colors.bar}`} style={{ width: `${Math.round(((i.count || 0) / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DailyHeatmap = ({ items }) => {
  const maxCount = Math.max(...items.map((x) => x.count || 0), 1);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-semibold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10v4a2 2 0 002 2h3l5 3V5l-5 3H6a2 2 0 00-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 10.5a3.5 3.5 0 010 3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9a5 5 0 010 6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Campaigns</p>
            <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
          </div>
        </div>
        <span className="text-[11px] text-gray-400">{items.length} days</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No timeline data</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((t) => {
            const colorClass = heatColor(t.count || 0, maxCount);
            return (
              <div key={t.date} className={`p-3 rounded-xl border border-gray-100 ${colorClass}`}>
                <p className="text-xs font-semibold">{t.date}</p>
                <p className="text-lg font-semibold">{t.count?.toLocaleString?.() ?? 0}</p>
                <p className="text-[11px] opacity-70">notifications</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function BrandInsights() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [startDate, setStartDate] = useState(moment.utc().subtract(30, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment.utc().format("YYYY-MM-DD"));
  const [chartWindowDays, setChartWindowDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingMoreNotifs, setLoadingMoreNotifs] = useState(false);
  const [timelineDayPage, setTimelineDayPage] = useState(0);
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);

  const loadInsights = async () => {
    if (!brand) {
      setError("Please enter a brand to fetch insights.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        brand,
        start_date: startDate,
        end_date: endDate,
      });
      const res = await fetch(`${API_URL}/web/brands/insights?${params.toString()}`);
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to load insights");
      }
      const json = await res.json();
      setData(json);
      // Fetch notifications directly for the timeline
      const notifParams = new URLSearchParams({
        brand,
        start_date: startDate,
        end_date: endDate,
        limit: "200",
      });
      const notifRes = await fetch(
        `${API_URL}/web/notifications/list?${notifParams.toString()}`
      );
      if (notifRes.ok) {
        const notifJson = await notifRes.json();
        setNotifications(sortNotifications(notifJson.data || []));
        setTimelineDayPage(0);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(err.message || "Unable to load insights");
      setData(null);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreNotifications = useCallback(async () => {
    if (!brand) return;

    // First, if we already have hidden days locally, just reveal them without another fetch.
    const uniqueDates = Array.from(
      new Set(
        notifications.map((n) => {
          const ts = n.timestamp || n.posted || n.created_at;
          const m = moment(ts);
          return m.isValid() ? m.utc().format("YYYY-MM-DD") : null;
        }).filter(Boolean)
      )
    );
    const shownDates = (timelineDayPage + 1) * 2;
    if (uniqueDates.length > shownDates) {
      setTimelineDayPage((p) => p + 1);
      return;
    }

    if (loading || loadingMoreNotifs) return;
    try {
      setLoadingMoreNotifs(true);
      const notifParams = new URLSearchParams({
        brand,
        start_date: startDate,
        end_date: endDate,
        limit: "200",
        offset: `${notifications.length}`,
      });
      const notifRes = await fetch(`${API_URL}/web/notifications/list?${notifParams.toString()}`);
      if (notifRes.ok) {
        const notifJson = await notifRes.json();
        const more = notifJson.data || [];
        if (more.length > 0) {
          setNotifications((prev) => sortNotifications([...prev, ...more]));
          setTimelineDayPage((p) => p + 1);
        }
      }
    } finally {
      setLoadingMoreNotifs(false);
    }
  }, [API_URL, brand, endDate, startDate, notifications, loading, loadingMoreNotifs, timelineDayPage]);

  const fetchBrands = useCallback(async (search = "") => {
    try {
      setBrandsLoading(true);
      const res = await fetch(`${API_URL}/web/campaigns/brands?limit=500${search ? `&q=${encodeURIComponent(search)}` : ""}`);
      if (!res.ok) throw new Error("Failed to load brands");
      const json = await res.json();
      setBrandOptions(json.data || []);
    } catch (err) {
      console.error(err);
      setBrandOptions([]);
    } finally {
      setBrandsLoading(false);
    }
  }, []);

  const sortNotifications = (items = []) => {
    const toMillis = (n = {}) => {
      const ts = n.timestamp || n.posted || n.created_at;
      if (ts) {
        const ms = new Date(ts).getTime();
        if (!Number.isNaN(ms)) return ms;
      }
      if (n.date || n.time) {
        const combined = `${n.date || ""} ${n.time || ""}`.trim();
        const ms = new Date(combined).getTime();
        if (!Number.isNaN(ms)) return ms;
      }
      return 0;
    };
    return [...items].sort((a, b) => toMillis(b) - toMillis(a));
  };

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    setTimelineDayPage(0);
  }, [chartWindowDays]);

  const endWindow = (() => {
    const m = moment.utc(endDate, "YYYY-MM-DD", true);
    return m.isValid() ? m.endOf("day") : moment.utc().endOf("day");
  })();
  const windowDays = Math.max(parseInt(chartWindowDays, 10) || 30, 1);
  const startWindow = endWindow.clone().subtract(windowDays - 1, "days").startOf("day");

  const filteredNotifications = notifications.filter((n) => {
    const ts = n.timestamp || n.posted || n.created_at;
    if (!ts) return false;
    const m = moment(ts);
    if (!m.isValid()) return false;
    return m.isBetween(startWindow, endWindow, undefined, "[]");
  });

  const dailyCounts = filteredNotifications.reduce((acc, n) => {
    const ts = n.timestamp || n.posted || n.created_at;
    if (!ts) return acc;
    const m = moment(ts);
    if (!m.isValid()) return acc;
    const key = m.utc().format("YYYY-MM-DD");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const dailyItems = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const campaignTypeItems = filteredNotifications.reduce((acc, n) => {
    const key = n.campaign_type || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const campaignTypesArray = Object.entries(campaignTypeItems)
    .map(([label, count]) => ({ label, count }))
    .filter((i) => i.label && i.label !== "Unknown");

  const emotionItems = filteredNotifications.reduce((acc, n) => {
    const key = pickEmotionLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const emotionArray = Object.entries(emotionItems)
    .map(([label, count]) => ({ label, count }))
    .filter((i) => i.label && i.label !== "Unknown");

  const contextItems = filteredNotifications.reduce((acc, n) => {
    const key = pickContextLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const contextArray = Object.entries(contextItems)
    .map(([label, count]) => ({ label, count }))
    .filter((i) => i.label && i.label !== "Unknown");

  const triggerItems = filteredNotifications.reduce((acc, n) => {
    const key = pickTriggerLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const triggerArray = Object.entries(triggerItems)
    .map(([label, count]) => ({ label, count }))
    .filter((i) => i.label && i.label !== "Unknown");

  const promoItems = filteredNotifications.reduce((acc, n) => {
    const key = pickPromotionLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const promoArray = Object.entries(promoItems)
    .map(([label, count]) => ({ label, count }))
    .filter((i) => i.label && i.label !== "Unknown");

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm text-indigo-600 font-semibold">Brands</p>
                <h1 className="text-3xl font-semibold text-gray-900">Brand Insights</h1>
                <p className="text-gray-500">
                  What is the push strategy of a brand?
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-4 relative z-[3000]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                    <div className="flex flex-col gap-2">
                      <SingleSelect
                        options={brandOptions}
                        value={brand}
                        onChange={(val) => setBrand(val)}
                        placeholder="Search brands..."
                        onSearch={(q) => fetchBrands(q)}
                        loading={brandsLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Start date</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">End date</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end mt-3">
                  <button
                    onClick={loadInsights}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition"
                  >
                    Load insights
                  </button>
                </div>
                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : data ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextBlock
                    title="Primary strategy"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6m-4 3h2m-5.5-9.5A5.5 5.5 0 1116.5 14c0 1.455-.556 2.769-1.467 3.75a2 2 0 00-.533 1.333V20a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.917c0-.5-.186-.984-.533-1.333A5.495 5.495 0 017 14.5z" />
                      </svg>
                    }
                    accent="indigo"
                    content={data.primary_strategy || "Not available"}
                  />
                  <TextBlock
                    title="Typical cadence"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    accent="amber"
                    content={data.typical_cadence || "Not available"}
                  />
                  <TextBlock
                    title="Default playbook"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4h16a2 2 0 012 2v11a2 2 0 01-2 2H6.5A2.5 2.5 0 004 21.5v-17A.5.5 0 014.5 4z" />
                      </svg>
                    }
                    accent="emerald"
                    content={data.default_playbook || "Not available"}
                  />
                  <RiskList risks={data.risk_signals || []} />
                </div>

                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-600 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5m8 2V5m-9 4h10M5 11h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
                      </svg>
                    </span>
                    <select
                      className="form-select text-sm"
                      value={chartWindowDays}
                      onChange={(e) => setChartWindowDays(parseInt(e.target.value, 10))}
                    >
                      <option value={7}>Last 7 days</option>
                      <option value={14}>Last 14 days</option>
                      <option value={30}>Last 30 days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-4">
                    <DailyHeatmap items={dailyItems} />
                    <Timeline
                      items={(() => {
                        const timelineItems = filteredNotifications;
                        const uniqueDates = Array.from(
                          new Set(
                            timelineItems.map((n) => {
                              const ts = n.timestamp || n.posted || n.created_at;
                              const m = moment(ts);
                              return m.isValid() ? m.utc().format("YYYY-MM-DD") : null;
                            }).filter(Boolean)
                          )
                        );
                        const maxDays = (timelineDayPage + 1) * 2;
                        const allowedDates = uniqueDates.slice(0, maxDays);
                        return timelineItems.filter((n) => {
                          const ts = n.timestamp || n.posted || n.created_at;
                          const m = moment(ts);
                          if (!m.isValid()) return false;
                          const key = m.utc().format("YYYY-MM-DD");
                          return allowedDates.includes(key);
                        });
                      })()}
                      onLoadMore={loadMoreNotifications}
                      loadingMore={loadingMoreNotifs}
                    />
                  </div>
                  <div className="space-y-4">
                    <CampaignTypesCard items={campaignTypesArray} />
                    <GenericBreakdownCard
                      title="Context awareness"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a6 6 0 100 12 6 6 0 000-12zm0 0V4m0 16v-2m6-6h2M4 12H2m2.93-5.07l1.42 1.42m11.2 11.2l-1.42-1.42m0-8.36l1.42-1.42M6.35 17.65l1.42-1.42" />
                        </svg>
                      }
                      accent="sky"
                      items={contextArray}
                      buttonAccent="sky"
                    />
                    <GenericBreakdownCard
                      title="Behavioral triggers"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 1116 0 8 8 0 01-16 0z" />
                        </svg>
                      }
                      accent="emerald"
                      items={triggerArray}
                      buttonAccent="emerald"
                    />
                    <GenericBreakdownCard
                      title="Promotions"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16v8H4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01" />
                        </svg>
                      }
                      accent="amber"
                      items={promoArray}
                      buttonAccent="amber"
                    />
                    <EmotionBreakdown items={emotionArray} />
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-white/60 p-4 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-4">
                    <span className="font-semibold text-gray-800">
                      Brand: <span className="text-gray-600">{data.brand}</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      Window: <span className="text-gray-600">{data.window?.start}-{data.window?.end}</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      Notifications: <span className="text-gray-600">{data.total_notifications?.toLocaleString?.()}</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      Campaigns: <span className="text-gray-600">{data.total_campaigns?.toLocaleString?.()}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-10 text-center shadow-sm text-gray-500">
                Enter a brand and load insights to get started.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BrandInsights;
























