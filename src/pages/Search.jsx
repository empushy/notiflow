import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";
import { Search as SearchIcon, ChevronDown } from "lucide-react";

import Header from "../partials/Header";
import Sidebar from "../partials/Sidebar";
import Loader from "../partials/dashboard/Loader";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

const NotificationCard = ({ message, iconUrl, posted, appName, onClick, index = 0 }) => {
  const timeAgo = moment(posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]").fromNow();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
      className={
        `flex items-start bg-white/60 backdrop-blur-[9px]
        shadow-xl rounded-2xl px-6 py-5 w-full min-h-[110px]
        ring-1 ring-inset ring-white/40
        hover:scale-[1.02] hover:shadow-2xl transition-all duration-200
        border border-gray-100 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-200`
      }
    >
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
          <span className="text-xs text-indigo-400 font-medium ml-2">
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

// Simple MultiSelect component with search in main textbox
const MultiSelect = ({ options = [], selected = [], setSelected, placeholder = "Select", onSearch }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  const toggle = (opt) => {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <div className="w-full min-h-[40px] px-2 py-1 rounded-lg bg-white border border-gray-200 focus-within:border-gray-200 focus-within:outline-none focus-within:ring-0 flex items-center flex-wrap gap-2">
        {selected.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200 transition-colors flex items-center gap-1"
          >
            {s}
            <span className="text-indigo-500 hover:text-indigo-700">&times;</span>
          </button>
        ))}
        <input
          className="flex-1 min-w-[120px] px-2 py-1 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none ring-0 border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-none"
          placeholder={selected.length === 0 ? placeholder : "Type to filter brands..."}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
          <div className="p-2 space-y-1">
            {filtered.map((opt) => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-sm">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span className="truncate">{opt}</span>
              </label>
            ))}
            {filtered.length === 0 && <div className="text-xs text-gray-400 px-2 py-1">No results</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// Single select component matching MultiSelect styling
const SingleSelect = ({ options = [], value, setValue, placeholder = "Select", defaultValue = "" }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;
  const isDefaultValue = value === defaultValue || !value;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between cursor-pointer"
      >
        <span className={`text-sm ${isDefaultValue ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedLabel}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2 max-h-60 overflow-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                setValue(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 rounded cursor-pointer text-sm ${
                value === opt.value
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Searchable single select (matches BrandInsights style)
const SearchableSingleSelect = ({ options = [], value = "", onChange, placeholder = "Select", onSearch, loading = false }) => {
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
    <div ref={dropdownRef} className="relative">
      <input
        className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400"
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInputValue(e.target.value);
          onSearch?.(e.target.value);
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
        <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
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

const chromeDomainFromText = (text = "") => {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/);
  return match ? match[0] : null;
};

const buildIcon = (notif = {}) => {
  const isChrome =
    notif.appPackage === "com.android.chrome" ||
    notif.app === "com.android.chrome" ||
    notif.appName === "Chrome";

  const domain = (() => {
    if (notif.appName && notif.appName.includes(".")) return notif.appName;
    return chromeDomainFromText(notif.text || notif.message || "");
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

  const normalizeNotification = (notif = {}) => {
    const isChrome =
      notif.appPackage === "com.android.chrome" ||
      notif.app === "com.android.chrome" ||
      notif.appName === "Chrome";
    const domain = chromeDomainFromText(notif.text || notif.message || "");
    const iconUrl = buildIcon(notif);
    return {
      ...notif,
      icon: iconUrl || notif.icon,
      displayAppName: isChrome && domain ? domain : notif.appName,
    };
  };

  const buildSpansFromMatches = (notif, matchesList) => {
    const baseText = notif?.text || notif?.message || "";
    if (!baseText || !Array.isArray(matchesList)) return [];

    const spans = [];
    const lowerText = baseText.toLowerCase();

    matchesList
      .map((m) => (typeof m === "string" ? m.trim() : ""))
      .filter(Boolean)
      .forEach((matchTerm) => {
        const lowerMatch = matchTerm.toLowerCase();
        let startIndex = 0;
        while (startIndex < lowerText.length) {
          const found = lowerText.indexOf(lowerMatch, startIndex);
          if (found === -1) break;
          spans.push({ start: found, end: found + matchTerm.length });
          startIndex = found + Math.max(matchTerm.length, 1);
        }
      });

    // Deduplicate and sort spans
    const unique = [];
    spans
      .sort((a, b) => a.start - b.start || a.end - b.end)
      .forEach((span) => {
        if (
          !unique.length ||
          unique[unique.length - 1].start !== span.start ||
          unique[unique.length - 1].end !== span.end
        ) {
          unique.push(span);
        }
      });
    return unique;
  };

  const toSemanticEntries = (notif, fieldKey) => {
    const field = notif?.[fieldKey];
    if (!field) return [];

    const normalizeSpan = (span) => {
      if (!span) return null;
      if (Array.isArray(span) && span.length >= 2) {
        return { start: Number(span[0]), end: Number(span[1]) };
      }
      if (typeof span === "object" && span.start !== undefined && span.end !== undefined) {
        return { start: Number(span.start), end: Number(span.end) };
      }
      return null;
    };

    const list = Array.isArray(field) ? field : [field];
    return list
      .map((item) => {
        if (typeof item === "string") {
          return { value: item, spans: [] };
        }
        const value = item?.value || item?.label || item?.name || "";
        const matchesList = Array.isArray(item?.matches) ? item.matches : [];
        const spansRaw = item?.spans || item?.matches || [];

        // Determine if spansRaw actually contains span structures (objects or arrays of numbers)
        const hasStructuredSpans =
          Array.isArray(spansRaw) &&
          spansRaw.some(
            (s) =>
              (Array.isArray(s) && s.length >= 2 && !isNaN(Number(s[0])) && !isNaN(Number(s[1]))) ||
              (typeof s === "object" && s && s.start !== undefined && s.end !== undefined)
          );

        const spans = hasStructuredSpans
          ? spansRaw
              .map(normalizeSpan)
              .filter(Boolean)
              .sort((a, b) => a.start - b.start)
          : buildSpansFromMatches(notif, matchesList);
        if (!value) return null;
        return { value, spans };
      })
      .filter(Boolean);
  };

  const highlightText = (text, spans = [], color = "#FDE68A") => {
    if (!text) return null;
    if (!Array.isArray(spans) || spans.length === 0) return text;

    const pieces = [];
    let cursor = 0;
    spans.forEach(({ start, end }, idx) => {
      if (start < cursor || end <= start || start >= text.length) return;
      if (start > cursor) {
        pieces.push(<span key={`t-${idx}-pre`}>{text.slice(cursor, start)}</span>);
      }
      pieces.push(
        <mark
          key={`t-${idx}-hl`}
          className="rounded px-1 py-0.5 font-semibold"
          style={{ backgroundColor: color, color: "#111827", boxShadow: "0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          {text.slice(start, Math.min(end, text.length))}
        </mark>
      );
      cursor = Math.min(end, text.length);
    });
    if (cursor < text.length) {
      pieces.push(<span key="t-end">{text.slice(cursor)}</span>);
    }
    return pieces;
  };

function Search() {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (notif) => {
    setSelectedNotification(notif);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setHighlightSemantic(null);
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allNotifications, setAllNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  // Filter and sort state
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [sortBy, setSortBy] = useState("relevance"); // "relevance" or "date"
  const [brandOptions, setBrandOptions] = useState([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [highlightSemantic, setHighlightSemantic] = useState(null);
  const semanticFields = [
    { key: "emotional_tone", label: "Emotional Tone", color: "#C7D2FE" }, // indigo-200
    { key: "call_to_emotion", label: "Call to Emotion", color: "#FDE68A" }, // amber-200
    { key: "behavioral_triggers", label: "Behavioral Triggers", color: "#BBF7D0" }, // green-200
    { key: "context_awareness", label: "Context Awareness", color: "#BAE6FD" }, // sky-200
    { key: "promotions", label: "Promotions", color: "#FECDD3" }, // rose-200
  ];

  // Fetch brand options (searchable)
  const fetchBrands = useCallback(async (search = "") => {
    try {
      setBrandLoading(true);
      const res = await fetch(`${API_URL}/web/campaigns/brands?limit=500${search ? `&q=${encodeURIComponent(search)}` : ""}`);
      if (!res.ok) throw new Error("Failed to load brands");
      const json = await res.json();
      setBrandOptions(json.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrandOptions([]);
    } finally {
      setBrandLoading(false);
    }
  }, [API_URL]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch brands and genres
  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      // Public endpoints — no Authorization header required
      const genresRes = await fetch(`${API_URL}/web/categories`, { method: "GET" });
      const genresData = await genresRes.json();
      setGenres(genresData.data || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setLoadingMetadata(false);
    }
  };

  // Fetch metadata on component mount
  useEffect(() => {
    fetchMetadata();
    fetchBrands();
  }, [fetchBrands]);

  const buildSearchParams = (rawQuery) => {
    const params = new URLSearchParams();
    const searchPhrase = rawQuery.trim().startsWith('"') ? rawQuery.trim() : `"${rawQuery.trim()}"`;
    params.set("q", searchPhrase);
    if (selectedType) {
      params.set("type", selectedType);
    }
    return params.toString();
  };

  // Apply filters and sorting
  useEffect(() => {
    if (!hasSearched) return;
    let filtered = [...allNotifications];

    // Apply brand filter
    if (selectedBrands.length > 0) {
      const selectedLower = selectedBrands.map((b) => b.toLowerCase());
      filtered = filtered.filter((notif) => selectedLower.includes((notif.displayAppName || notif.appName || "").toLowerCase()));
    }

    // Apply genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter((notif) => selectedGenres.includes(notif.genre || notif.category));
    }

    // Apply type filter mapping to Chrome vs non-Chrome
    if (selectedType === "web push") {
      filtered = filtered.filter((notif) =>
        notif.appPackage === "com.android.chrome" || notif.app === "com.android.chrome" || notif.appName === "Chrome"
      );
    } else if (selectedType === "mobile push") {
      filtered = filtered.filter((notif) =>
        notif.appPackage !== "com.android.chrome" && notif.app !== "com.android.chrome" && notif.appName !== "Chrome"
      );
    }

    // Apply sorting
    if (sortBy === "date") {
      filtered.sort((a, b) => {
        const dateA = moment(a.posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]");
        const dateB = moment(b.posted, "ddd, DD MMM YYYY HH:mm:ss [GMT]");
        return dateB - dateA; // Newest first
      });
    }
    // "relevance" is default API order, no additional sorting needed

    setFilteredNotifications(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [allNotifications, selectedBrands, selectedGenres, selectedType, sortBy, hasSearched]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    
    try {
      const at = await getAccessTokenSilently();
      const params = buildSearchParams(searchQuery);
      const response = await fetch(`${API_URL}/web/notification-text?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${at}` },
      });
      const data = await response.json();
      const normalized = (data.data || []).map(normalizeNotification);
      setAllNotifications(normalized);
    } catch (error) {
      console.error("Error searching notifications:", error);
      setAllNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    setSearchQuery(query);
    setHasSearched(true);
    setLoading(true);

    try {
      const at = await getAccessTokenSilently();
      const params = buildSearchParams(query);
      const response = await fetch(`${API_URL}/web/notification-text?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${at}` },
      });
      const data = await response.json();
      const normalized = (data.data || []).map(normalizeNotification);
      setAllNotifications(normalized);
    } catch (error) {
      console.error("Error searching notifications:", error);
      setAllNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedGenres([]);
    setSelectedType("");
    setSortBy("relevance");
  };

  const hasActiveFilters = (selectedBrands.length > 0) || (selectedGenres.length > 0) || selectedType || sortBy !== "relevance";

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow flex flex-col">
          <div className="px-4 sm:px-6 lg:px-8 pt-4 text-center text-xs text-gray-500">
            Note: Search results cover the past 90 days.
          </div>
          {!hasSearched ? (
            // ChatGPT-like minimalist home state
            <div className="flex flex-col items-center px-4 pt-16">
              <div className="w-full max-w-2xl">
                {/* Logo/Icon */}
                <div className="mb-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-200 rounded-full mb-4">
                    <SearchIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                    Search Notifications
                  </h1>
                  <p className="text-gray-500 text-lg">
                    Find the notifications you're looking for
                  </p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="mb-12">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by keyword, brand, or message..."
                      className="w-full px-6 py-4 text-lg rounded-2xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <SearchIcon className="w-6 h-6" />
                    </button>
                  </div>
                </form>

                {/* Suggested searches */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 font-medium text-center mb-4">
                    Popular searches
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Sales",
                      "Promotions",
                      "Updates",
                      "Alerts",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => performSearch(suggestion)}
                        className="px-4 py-3 text-sm rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-200">
                    💡 Tip: Use wildcards like sale* or *discount for pattern matching. Wrap in quotes for exact phrases.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Results view
            <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto flex-1">
              {/* Search bar */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, brand, or message..."
                    className="w-full px-6 py-3 text-base rounded-xl bg-white border-2 border-gray-200 text-gray-900 placeholder-gray-400 shadow-md focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <SearchIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {loading && (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              )}

              {!loading && allNotifications.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    No notifications found for "<span className="font-semibold">{searchQuery}</span>"
                  </p>
                  <button
                    onClick={() => {
                      setHasSearched(false);
                      setSearchQuery("");
                      clearFilters();
                    }}
                    className="mt-4 px-5 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    Try another search
                  </button>
                </div>
              )}

              {!loading && allNotifications.length > 0 && (
                <div>
                  {/* Filters Section */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Brand Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Brand
                        </label>
                        <MultiSelect
                          options={brandOptions}
                          selected={selectedBrands}
                          setSelected={setSelectedBrands}
                          placeholder="Select Brands"
                          onSearch={(q) => fetchBrands(q)}
                        />
                      </div>

                      {/* Genre Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Genre
                        </label>
                        <MultiSelect
                          options={genres}
                          selected={selectedGenres}
                          setSelected={setSelectedGenres}
                          placeholder="Select Genres"
                        />
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Type
                        </label>
                        <SingleSelect
                          options={[
                            { value: "", label: "All Types" },
                            { value: "web push", label: "Web Push" },
                            { value: "mobile push", label: "Mobile Push" }
                          ]}
                          value={selectedType}
                          setValue={setSelectedType}
                          placeholder="All Types"
                        />
                      </div>

                      {/* Sort */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Sort By
                        </label>
                        <SingleSelect
                          options={[
                            { value: "relevance", label: "Relevance" },
                            { value: "date", label: "Newest First" }
                          ]}
                          value={sortBy}
                          setValue={setSortBy}
                          placeholder="Relevance"
                          defaultValue="relevance"
                        />
                      </div>

                      {/* Clear Filters Button */}
                      {hasActiveFilters && (
                        <div className="flex items-end">
                          <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Results count */}
                  <div className="mb-6 text-center">
                    <p className="text-gray-600 text-sm">
                      Found{" "}
                      <span className="font-semibold text-gray-900">
                        {filteredNotifications.length}
                      </span>{" "}
                      notification{filteredNotifications.length !== 1 ? "s" : ""}
                      {hasActiveFilters && " (filtered)"}
                    </p>
                  </div>

                  {/* Notifications Grid */}
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <p className="text-gray-500">
                        No notifications match your filters.{" "}
                        <button
                          onClick={clearFilters}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Clear filters
                        </button>
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                          {filteredNotifications
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((notif, idx) => (
                            <NotificationCard
                              key={`${notif.id}-page-${currentPage}`}
                              message={notif.text}
                              iconUrl={notif.icon}
                              posted={notif.posted}
                              appName={notif.displayAppName || notif.appName}
                              onClick={() => openModal(notif)}
                              index={idx}
                            />
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Pagination Controls */}
                      {filteredNotifications.length > itemsPerPage && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.ceil(filteredNotifications.length / itemsPerPage) }, (_, i) => i + 1)
                              .filter((page) => {
                                const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
                                if (totalPages <= 7) return true;
                                if (page === 1 || page === totalPages) return true;
                                if (Math.abs(page - currentPage) <= 1) return true;
                                return false;
                              })
                              .map((page, idx, arr) => (
                                <div key={page} className="flex items-center">
                                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                                    <span className="px-2 text-gray-400">...</span>
                                  )}
                                  <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                                      currentPage === page
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                </div>
                              ))
                            }
                          </div>

                          <button
                            onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredNotifications.length / itemsPerPage), p + 1))}
                            disabled={currentPage === Math.ceil(filteredNotifications.length / itemsPerPage)}
                            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
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
              className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
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
                  {highlightText(
                    selectedNotification.text || selectedNotification.message || "",
                    highlightSemantic?.spans || [],
                    highlightSemantic?.color || "#FDE68A"
                  )}
                </div>

                {/* Semantics */}
                <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Semantics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {semanticFields.map(({ key, label, color }) => {
                      const entries = toSemanticEntries(selectedNotification, key);
                      return (
                        <div key={key} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                          <p className="text-xs font-semibold text-gray-600 mb-2">{label}</p>
                          {entries.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {entries.map((entry) => {
                                const isActive =
                                  highlightSemantic?.key === key &&
                                  highlightSemantic?.value === entry.value;
                                return (
                                  <button
                                    key={`${key}-${entry.value}`}
                                    onClick={() =>
                                      setHighlightSemantic(
                                        isActive
                                          ? null
                                          : { key, value: entry.value, spans: entry.spans, color }
                                      )
                                    }
                                    className="inline-flex items-center px-2 py-1 text-xs rounded-full border transition"
                                    style={{
                                      backgroundColor: isActive ? color : `${color}80`,
                                      color: "#111827",
                                      borderColor: isActive ? "#11182720" : `${color}60`,
                                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                                    }}
                                  >
                                    {entry.value}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">No data</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
}

export default Search;
