import { useState, useEffect, useRef } from "react";
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

// Simple MultiSelect component with search
const MultiSelect = ({ options = [], selected = [], setSelected, placeholder = "Select" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  const toggle = (opt) => {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((p) => p !== opt) : [...prev, opt]));
  };

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
        className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white border border-gray-200 flex items-center flex-wrap gap-2 cursor-pointer"
      >
        {selected.length === 0 ? (
          <span className="text-sm text-gray-400">{placeholder}</span>
        ) : (
          selected.map((s) => (
            <span 
              key={s} 
              onClick={(e) => {
                e.stopPropagation();
                toggle(s);
              }}
              className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200 cursor-pointer transition-colors flex items-center gap-1"
            >
              {s}
              <span className="text-indigo-500 hover:text-indigo-700">&times;</span>
            </span>
          ))
        )}
      </div>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <input
            className="w-full px-2 py-1 rounded border border-gray-200 text-sm mb-2"
            placeholder={`Search ${placeholder}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
          />
          <div className="max-h-44 overflow-auto">
            {filtered.map((opt) => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span className="text-sm truncate">{opt}</span>
              </label>
            ))}
            {filtered.length === 0 && <div className="text-xs text-gray-400 p-2">No results</div>}
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

function Search() {
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
  const [brands, setBrands] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch brands and genres
  const fetchMetadata = async () => {
    setLoadingMetadata(true);
    try {
      // Public endpoints — no Authorization header required
      const [brandsRes, genresRes] = await Promise.all([
        fetch(`${API_URL}/web/brands`, { method: "GET" }),
        fetch(`${API_URL}/web/categories`, { method: "GET" }),
      ]);

      const brandsData = await brandsRes.json();
      const genresData = await genresRes.json();
      setBrands(brandsData.data || []);
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
  }, []);

  const buildSearchParams = (rawQuery) => {
    const params = new URLSearchParams();
    const searchPhrase = rawQuery.trim().startsWith('"') ? rawQuery.trim() : `"${rawQuery.trim()}"`;
    params.set("q", searchPhrase);
    // Don't include brand/genre filters in API call - handle client-side only
    // selectedBrands.forEach((b) => params.append("brand", b));
    // selectedGenres.forEach((g) => params.append("genre", g));
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
      filtered = filtered.filter((notif) => selectedBrands.includes(notif.appName));
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
    
    // Fetch metadata when user performs search
    if (brands.length === 0) {
      await fetchMetadata();
    }

    try {
      const at = await getAccessTokenSilently();
      const params = buildSearchParams(searchQuery);
      const response = await fetch(`${API_URL}/web/notification-text?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${at}` },
      });
      const data = await response.json();
      setAllNotifications(data.data || []);
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

    if (brands.length === 0) {
      await fetchMetadata();
    }

    try {
      const at = await getAccessTokenSilently();
      const params = buildSearchParams(query);
      const response = await fetch(`${API_URL}/web/notification-text?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${at}` },
      });
      const data = await response.json();
      setAllNotifications(data.data || []);
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
                          options={brands}
                          selected={selectedBrands}
                          setSelected={setSelectedBrands}
                          placeholder="Select Brands"
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
                              appName={notif.appName}
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
}

export default Search;
