import { useCallback, useEffect, useState, useRef } from "react";
import moment from "moment";
import { useAuth0 } from "@auth0/auth0-react";

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

const normalizeLabel = (val) => {
  if (typeof val !== "string") return "";
  const t = val.trim();
  if (!t) return "";
  if (t.toLowerCase() === "none") return "";
  return t;
};

const isValidLabel = (val) => {
  const t = normalizeLabel(val);
  if (!t) return false;
  if (t.toLowerCase() === "unknown") return false;
  return true;
};

const faviconFromBrand = (b = "") => {
  if (!b || typeof b !== "string") return "";
  const trimmed = b.trim();
  if (!trimmed.includes(".")) return "";
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(trimmed)}&sz=128`;
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
            const roleTag = normalizeLabel(i.campaign_role || i.role);
            const typeTag = normalizeLabel(i.campaign_type || i.type);
            const holidayLabel = normalizeLabel(i.holiday || i.holiday_name || i.holidayName);
            return (
              <div key={i.date || idx} className="space-y-1">
                {dateChanged && i.date && (
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 px-4 md:px-10">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="px-3 py-1 rounded-full bg-white text-gray-600 border border-gray-200 flex items-center gap-2 shadow-sm">
                      <span className="inline-flex items-center gap-1 text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5m8 2V5m-9 4h10M5 11h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
                        </svg>
                        {i.date}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span>{dayCounts[i.date] || 0}</span>
                      </span>
                      {holidayLabel ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4m8-4v4M3 9h18M5 9v12h14V9" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15l1.5 1.5L15 12" />
                          </svg>
                          <span className="truncate max-w-[120px]">{holidayLabel}</span>
                        </span>
                      ) : null}
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
                              {normalizeLabel(i.cta) && (
                                <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                  {normalizeLabel(i.cta)}
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
                            {normalizeLabel(i.cta) && (
                              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                                {normalizeLabel(i.cta)}
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
                  <div className="relative -mt-2 mb-1 h-16">
                    <svg
                      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 w-full max-w-2xl ${nextIsLeft ? "" : "scale-x-[-1]"}`}
                      viewBox="0 0 320 140"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient id={`squiggle-${idx}`} x1="0" y1="140" x2="320" y2="10" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#22d3ee" stopOpacity="0.9" />
                          <stop offset="0.5" stopColor="#a855f7" stopOpacity="0.85" />
                          <stop offset="1" stopColor="#fbbf24" stopOpacity="0.8" />
                        </linearGradient>
                        <marker id={`squiggle-head-${idx}`} viewBox="0 0 12 12" refX="6" refY="6" markerWidth="8" markerHeight="8" orient="auto">
                          <path d="M 0 0 L 12 6 L 0 12 Q 5 6 0 0 Z" fill="#a855f7" />
                        </marker>
                      </defs>
                      <path
                        d="M 20 120 C 90 130 140 60 200 90 S 280 50 300 20"
                        stroke={`url(#squiggle-${idx})`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        markerEnd={`url(#squiggle-head-${idx})`}
                        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))", opacity: 0.6 }}
                      />
                    </svg>
                    {/* Decorative floating icons */}
                    {(() => {
                      const iconSets = [
                        [
                          { icon: "🔔", top: "10%", left: "30%" },
                          { icon: "🛒", top: "55%", left: "65%" },
                          { icon: "🏆", top: "35%", left: "80%" },
                        ],
                        [
                          { icon: "💙", top: "25%", left: "20%" },
                          { icon: "😊", top: "60%", left: "55%" },
                          { icon: "🔔", top: "40%", left: "75%" },
                        ],
                        [
                          { icon: "🛒", top: "20%", left: "25%" },
                          { icon: "❤️", top: "50%", left: "50%" },
                          { icon: "🏆", top: "70%", left: "70%" },
                        ],
                      ];
                      const set = iconSets[idx % iconSets.length];
                      return set.map((d, j) => (
                        <span
                          key={`${idx}-deco-${j}`}
                          className="pointer-events-none absolute text-base"
                          style={{
                            top: d.top,
                            left: d.left,
                            transform: "translate(-50%, -50%)",
                            opacity: 0.6,
                          }}
                        >
                          {d.icon}
                        </span>
                      ));
                    })()}
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
  const [showAll, setShowAll] = useState(false);
  const maxCount = Math.max(...items.map((x) => x.count || 0), 1);
  const visible = showAll ? items : items.slice(0, 18);
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
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400">{items.length} days</span>
          {items.length > 18 && (
            <button
              type="button"
              onClick={() => setShowAll((p) => !p)}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            >
              {showAll ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No timeline data</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {visible.map((t) => {
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
  const [startDate, setStartDate] = useState(moment.utc().subtract(7, "days").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment.utc().format("YYYY-MM-DD"));
  const [chartWindowDays, setChartWindowDays] = useState(7);
  const [starSaving, setStarSaving] = useState(false);
  const [starred, setStarred] = useState([]);
  const [starError, setStarError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingMoreNotifs, setLoadingMoreNotifs] = useState(false);
  const [timelineDayPage, setTimelineDayPage] = useState(0);
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandMeta, setBrandMeta] = useState(null);
  const [brandMetaLoading, setBrandMetaLoading] = useState(false);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const userEmail = (user?.email || user?.sub || "").toLowerCase();

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

  const fetchBrandMeta = useCallback(
    async (targetBrand) => {
      const metaBrand = targetBrand || brand;
      setBrandMeta(null);
      if (!metaBrand) {
        return;
      }
      try {
        setBrandMetaLoading(true);
        const path = `${API_URL}/web/brands/metadata?brand=${encodeURIComponent(metaBrand)}`;
        let meta = null;
        const res = await fetch(path);
        if (res.ok) {
          const json = await res.json();
          meta = json.data || null;
        }

        setBrandMeta(meta);
      } catch (e) {
        console.error(e);
        setBrandMeta(null);
      } finally {
        setBrandMetaLoading(false);
      }
    },
    [API_URL, brand]
  );

  const loadInsights = async (brandOverride) => {
    const activeBrand = brandOverride || brand;
    if (!activeBrand) {
      setError("Please enter a brand to fetch insights.");
      return;
    }
    // Reset metadata and fetch for the selected brand when loading insights
    setBrandMeta(null);
    await fetchBrandMeta(activeBrand);
    setLoading(true);
    setError("");
    try {
      const end = moment.utc();
      const start = end.clone().subtract(Math.max(windowDays - 1, 0), "days");
      const startStr = start.format("YYYY-MM-DD");
      const endStr = end.format("YYYY-MM-DD");
      setStartDate(startStr);
      setEndDate(endStr);

      const params = new URLSearchParams({
        brand: activeBrand,
        start_date: startStr,
        end_date: endStr,
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
        brand: activeBrand,
        start_date: startStr,
        end_date: endStr,
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

  const fetchStarred = useCallback(async () => {
    if (!userEmail || !isAuthenticated) return;
    try {
      const res = await fetch(`${API_URL}/web/brands/starred?email=${encodeURIComponent(userEmail)}`);
      if (!res.ok) return;
      const json = await res.json();
      setStarred(json.brands || []);
    } catch (e) {
      console.error(e);
    }
  }, [API_URL, userEmail, isAuthenticated]);

  useEffect(() => {
    fetchStarred();
  }, [fetchStarred]);

  const addStarredBrand = async () => {
    if (!brand || !userEmail || !isAuthenticated) return;
    setStarSaving(true);
    try {
      const updated = starred.includes(brand) ? starred.filter((b) => b !== brand) : [...starred, brand];
      await fetch(`${API_URL}/web/brands/starred`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, brands: updated }),
      });
      setStarred(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setStarSaving(false);
    }
  };

  useEffect(() => {
    setTimelineDayPage(0);
  }, [chartWindowDays]);

  // When brand changes, clear existing insight data so charts disappear until reload
  useEffect(() => {
    setData(null);
    setNotifications([]);
    setError(null);
    setTimelineDayPage(0);
  }, [brand]);

  useEffect(() => {
    if (brand && !loading) {
      loadInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    .map(([label, count]) => ({ label: normalizeLabel(label), count }))
    .filter((i) => isValidLabel(i.label));

  const emotionItems = filteredNotifications.reduce((acc, n) => {
    const key = pickEmotionLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const emotionArray = Object.entries(emotionItems)
    .map(([label, count]) => ({ label: normalizeLabel(label), count }))
    .filter((i) => isValidLabel(i.label));

  const contextItems = filteredNotifications.reduce((acc, n) => {
    const key = pickContextLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const contextArray = Object.entries(contextItems)
    .map(([label, count]) => ({ label: normalizeLabel(label), count }))
    .filter((i) => isValidLabel(i.label));

  const triggerItems = filteredNotifications.reduce((acc, n) => {
    const key = pickTriggerLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const triggerArray = Object.entries(triggerItems)
    .map(([label, count]) => ({ label: normalizeLabel(label), count }))
    .filter((i) => isValidLabel(i.label));

  const promoItems = filteredNotifications.reduce((acc, n) => {
    const key = pickPromotionLabel(n);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const promoArray = Object.entries(promoItems)
    .map(([label, count]) => ({ label: normalizeLabel(label), count }))
    .filter((i) => isValidLabel(i.label));

  const exportTableAsCsv = useCallback(() => {
    const rowsToExport = filteredNotifications.slice(0, 10);
    if (!rowsToExport.length) return;
    const headers = ["Date", "Time", "Notification"];
    const rows = rowsToExport.map((n) => {
      const ts = n.timestamp || n.posted || n.created_at;
      const m = moment(ts);
      const date = m.isValid() ? m.utc().format("YYYY-MM-DD") : n.date || "";
      const time = m.isValid() ? m.utc().format("HH:mm") : n.time || "";
      const text = (pickText(n) || "No text").replace(/"/g, '""');
      return [date, time, `"${text}"`].join(",");
    });
    // Prefix BOM to preserve emoji/UTF-8 when opened in Excel
    const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${brand || "notifications"}-table.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredNotifications, brand]);

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
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm p-4 relative z-[3000] flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <label className="block text-sm font-semibold text-gray-700">Brand</label>
                  <SingleSelect
                    options={brandOptions}
                    value={brand}
                    onChange={(val) => setBrand(val)}
                    placeholder="Search brands..."
                    onSearch={(q) => fetchBrands(q)}
                    loading={brandsLoading}
                  />
                  {starred.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {starred.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            setBrand(b);
                            loadInsights(b);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold hover:bg-indigo-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                          {b}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Pick a brand and load insights.</p>
                  <button
                    onClick={loadInsights}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition"
                  >
                    Load insights
                  </button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>

            <div className="relative">
              {data ? (
            <div className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                      <option value={90}>Last 3 months</option>
                    </select>
                    {loading ? (
                      <span className="inline-flex items-center justify-center h-8 w-8 text-indigo-500">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"></path>
                        </svg>
                      </span>
                    ) : null}
                  </div>
                  <button
                    onClick={addStarredBrand}
                    disabled={!brand || starSaving || !userEmail || !isAuthenticated}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold shadow-sm hover:bg-amber-600 disabled:opacity-60 transition"
                  >
                    {starSaving ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : starred.includes(brand) ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span>Unstar brand</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span>Star this brand</span>
                      </>
                    )}
                  </button>
                </div>
              <div className="relative">
                <div className={`space-y-5 ${loading ? "pointer-events-none blur-[1.5px]" : ""}`}>
                  <div
                    className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm p-5 relative overflow-hidden"
                    style={
                      brandMeta?.headerImage
                        ? {
                            backgroundImage: `linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 60%, rgba(255,255,255,0.75) 78%, rgba(255,255,255,0.5) 90%, rgba(255,255,255,0.25) 100%), url(${brandMeta.headerImage})`,
                            backgroundSize: "auto",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right center",
                          }
                        : undefined
                    }
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 min-w-[56px] min-h-[56px] rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const iconSrc =
                              brandMeta?.icon ||
                              faviconFromBrand(brand) ||
                              brandMeta?.headerImage ||
                              "";
                            return iconSrc ? (
                              <img
                                src={iconSrc}
                                alt={brand || "brand"}
                                className="block w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  const fallback = faviconFromBrand(brand) || BELL_FALLBACK;
                                  if (e.currentTarget.src !== fallback) {
                                    e.currentTarget.src = fallback;
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-lg font-semibold text-indigo-600">
                                {brand ? brand.slice(0, 2).toUpperCase() : "—"}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Brand overview</p>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {brandMeta?.title || brand || "Select a brand"}
                          </h2>
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {brandMetaLoading
                              ? "Loading brand details..."
                              : brandMeta?.summary || brandMeta?.description || "Quick details about this brand will appear here."}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1 justify-between">
                            <div className="flex flex-wrap gap-2">
                              {brandMeta?.developer && (
                                <span className="px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700">
                                  {brandMeta.developer}
                                </span>
                              )}
                              {brandMeta?.overall_category && (
                                <span className="px-2 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
                                  {brandMeta.overall_category}
                                </span>
                              )}
                            </div>
                            {brandMeta?.url && (
                              <a
                                href={brandMeta.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold hover:bg-indigo-100"
                              >
                                See more
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm p-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-9 w-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 text-sm font-semibold shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm uppercase tracking-[0.12em] text-gray-600 font-semibold">Notifications</p>
                      <div className="w-12 h-[3px] rounded-full bg-gradient-to-r from-gray-300/80 via-gray-200 to-transparent mt-1"></div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative">
                      <table className="w-full text-sm text-gray-800 relative z-0">
                        <thead className="text-xs uppercase text-gray-500">
                          <tr>
                            <th className="text-left py-2 pr-4">Date</th>
                            <th className="text-left py-2 pr-4">Time</th>
                            <th className="text-left py-2">Notification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredNotifications.slice(0, 10).map((n, idx) => {
                            const text = pickText(n) || "No text";
                            const ts = n.timestamp || n.posted || n.created_at;
                            const m = moment(ts);
                            const date = m.isValid() ? m.utc().format("YYYY-MM-DD") : n.date || "";
                            const time = m.isValid() ? m.utc().format("HH:mm") : n.time || "";
                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="py-2 pr-4 whitespace-nowrap">{date}</td>
                                <td className="py-2 pr-4 whitespace-nowrap">{time}</td>
                                <td className="py-2 text-gray-900">{text}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div
                        className="pointer-events-none absolute left-0 right-0 bottom-0 z-10"
                        style={{
                          top: "120px",
                          background:
                            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 18%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.7) 72%, rgba(255,255,255,0.97) 100%)",
                          backdropFilter: "blur(8px)",
                          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 100%)",
                          maskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 100%)",
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                        <button
                          type="button"
                          onClick={exportTableAsCsv}
                          className="px-4 py-2 rounded-full text-xs font-semibold border border-gray-300 bg-white text-gray-800 shadow-sm transition pointer-events-auto transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring focus:ring-indigo-200"
                        >
                          Export CSV
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
                {loading && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.78) 35%, rgba(255,255,255,0.9) 70%, rgba(255,255,255,0.95) 100%)",
                        backdropFilter: "blur(6px)",
                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 15%, #000 85%, transparent 100%)",
                        maskImage: "linear-gradient(to bottom, transparent 0%, #000 15%, #000 85%, transparent 100%)",
                      }}
                    />
                    <div className="relative z-10">
                      <Loader />
                    </div>
                  </div>
                )}
              </div>
              </div>
              ) : (
              <div className="rounded-2xl border border-gray-200 bg-white/80 shadow-sm p-8 flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">No brand selected</p>
                  <p className="text-sm text-gray-500">Pick a brand and date range above, then hit “Load insights”.</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
                  Tip: start typing to search your brands
                </div>
              </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BrandInsights;
