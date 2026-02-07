import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

import Header from "../partials/Header";
import Sidebar from "../partials/Sidebar";
import Loader from "../partials/dashboard/Loader";

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

// Match Search page dropdown styling
const MultiSelect = ({ options = [], selected = [], onChange, placeholder = "Select", onSearch }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  const toggle = (opt) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!onSearch || !open) return;
    const t = setTimeout(() => onSearch(query), 200);
    return () => clearTimeout(t);
  }, [query, onSearch, open]);

  return (
    <div ref={dropdownRef} className="relative z-[60]">
      <div
        onClick={() => setOpen((v) => !v)}
        className="w-full min-h-[40px] px-3 py-2 rounded-lg bg-white border border-gray-200 flex items-center flex-wrap gap-2 cursor-pointer"
      >
        {selected.length === 0 ? (
          <span className="text-sm text-gray-500">{placeholder}</span>
        ) : (
          selected.map((s) => (
            <span
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                toggle(s);
              }}
              className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs hover:bg-pink-200 cursor-pointer transition-colors flex items-center gap-1"
            >
              {s}
              <span className="text-pink-500 hover:text-pink-700">&times;</span>
            </span>
          ))
        )}
      </div>
      {open && (
        <div className="absolute z-[3000] mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-h-64 overflow-auto">
          <input
            className="w-full px-2 py-1 rounded border border-gray-200 text-sm mb-2"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <div className="max-h-52 overflow-auto space-y-1">
            {filtered.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-sm"
              >
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span className="truncate">{opt}</span>
              </label>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-gray-500 px-2 py-1">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, helper }) => (
  <div className="rounded-xl bg-white/92 backdrop-blur-sm border border-white/80 shadow-sm p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-gray-900 mt-1 leading-tight">{value}</p>
    {helper ? <p className="text-xs text-gray-500 mt-1 leading-snug">{helper}</p> : null}
  </div>
);

const BarList = ({ title, items = [], color = "indigo" }) => {
  const max = items.reduce((acc, cur) => Math.max(acc, cur.count || 0), 0) || 1;
  const colorClass =
    color === "emerald"
      ? "bg-emerald-500"
      : color === "amber"
      ? "bg-amber-500"
      : "bg-pink-500";
  return (
    <div className="rounded-2xl bg-white/92 backdrop-blur-sm border border-white/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">{items.length} items</span>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">No data available</p>
        )}
        {items.map((item) => {
          const pct = Math.round(((item.count || 0) / max) * 100);
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span className="font-medium">{item.label || "Unknown"}</span>
                <span className="text-gray-500">{item.count?.toLocaleString?.() ?? 0}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatCampaignTitle = (id) => {
  if (!id) return "Unknown campaign";
  let clean = id.replace(/[_-]?(\d{8}|\d{6}|\d{4}-\d{2}-\d{2})$/, "");
  clean = clean.replace(/_/g, " ").trim();
  if (!clean) clean = id;
  // Capitalize first letter
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const formatLabel = (label) => (label ? label.replace(/_/g, " ") : "Unknown");

const heatColor = (count, max) => {
  if (count <= 0) return "bg-gray-100 text-gray-500";
  const ratio = count / (max || 1);
  if (ratio > 0.75) return "bg-emerald-200 text-emerald-800";
  if (ratio > 0.5) return "bg-emerald-100 text-emerald-700";
  if (ratio > 0.25) return "bg-amber-100 text-amber-700";
  return "bg-amber-50 text-amber-600";
};

const ROLES_METADATA = {
  start: { label: "Start", description: "Kick-off message to initiate a campaign or journey.", icon: "S" },
  reminder: { label: "Reminder", description: "Follow-up nudges to bring users back to the flow.", icon: "R" },
  escalation: { label: "Escalation", description: "Higher-urgency prompts when prior attempts did not convert.", icon: "E" },
  standalone: { label: "Standalone", description: "One-off communication without a sequence.", icon: "N" },
  followup: { label: "Follow-up", description: "Post-action or post-event messages to continue engagement.", icon: "F" },
};

const getInitials = (name = "") => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return name.slice(0, 2).toUpperCase() || "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const pickText = (notif) => {
  const candidates = [
    notif?.text,
    notif?.notification_text,
    notif?.message,
    notif?.body,
    notif?.title,
  ];
  const found = candidates.find((t) => typeof t === "string" && t.trim().length > 0);
  return found ? found.trim() : "No text available";
};

const buildIcon = (notif, brand) => {
  const isChrome =
    notif?.app === "com.android.chrome" || notif?.appPackage === "com.android.chrome";

  const domainFromText = () => {
    if (!notif?.text) return null;
    const match = notif.text.match(
      /\b([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\b/
    );
    return match ? match[0] : null;
  };

  const domain = (() => {
    if (brand && brand.includes(".")) return brand;
    return domainFromText();
  })();

  if (isChrome && domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  if (notif?.icon) return notif.icon;
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }
  return null;
};

const buildCampaignIcon = (campaign) => {
  if (!campaign) return null;
  // Use the same logic as notifications: look for notification icon first, then generate from brand
  const notif = campaign.recent_notifications?.[0];
  if (notif) {
    const brand = notif.brand || notif.appName || campaign.brand || campaign.appName;
    const appPkg = notif.appPackage || notif.app;
    if (appPkg === "com.android.chrome" && brand && brand.includes(".")) {
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand)}&sz=96`;
    }
    const icon = buildIcon(
      { ...notif, appPackage: appPkg },
      brand
    );
    if (icon) return icon;
  }
  // fallback to campaign-level icon/brand
  if (campaign.icon) return campaign.icon;
  const brand = campaign.brand || campaign.appName;
  const appPkg = campaign.appPackage || campaign.app;
  if (appPkg === "com.android.chrome" && brand && brand.includes(".")) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brand)}&sz=96`;
  }
  if (brand) return buildIcon({ icon: campaign.icon, appPackage: appPkg }, brand);
  return null;
};

const RecentNotificationCard = ({ notif, direction, campaignBrand }) => {
  const brand = notif.appName || notif.brand || campaignBrand || "Unknown";
  const text = pickText(notif);
  const timeAgo = notif.timestamp ? moment(notif.timestamp).fromNow() : "";
  const initials = getInitials(brand);
  const iconUrl = buildIcon(notif, brand);

  return (
    <motion.div
      initial={{ x: direction === "left" ? -40 : 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: direction === "left" ? 40 : -40, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex items-start bg-white/88 backdrop-blur-[9px] shadow-sm rounded-2xl px-4 py-3 w-full min-h-[100px] ring-1 ring-inset ring-white/70 border border-white/80"
    >
      <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-pink-50 text-pink-700 flex items-center justify-center mr-3 shadow-sm border-4 border-white overflow-hidden">
        {iconUrl ? (
          <>
            <img src={iconUrl} alt={brand} className="w-full h-full object-cover bg-white" />
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "inset 0 0 0 3px white" }}></div>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold">{initials}</span>
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "inset 0 0 0 3px white" }}></div>
          </>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-500 font-semibold truncate">{brand}</span>
          <span className="text-xs text-pink-500 font-medium ml-2">{timeAgo}</span>
        </div>
        <div className="text-sm text-gray-900 font-medium leading-snug line-clamp-3">{text}</div>
        <div className="text-[11px] text-gray-500 mt-1">
          {formatLabel(notif.campaign_role)} | {formatLabel(notif.campaign_type)}
        </div>
      </div>
    </motion.div>
  );
};

const parseRolesCounts = (rolesCounts) => {
  if (!rolesCounts) return [];
  try {
    const parsed = typeof rolesCounts === "string" ? JSON.parse(rolesCounts) : rolesCounts;
    return Object.entries(parsed || {})
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => (b.count || 0) - (a.count || 0));
  } catch {
    return [];
  }
};

const CampaignCard = ({ campaign, onClick, iconOverride }) => {
  const start = campaign.start_ts ? moment(campaign.start_ts).format("YYYY-MM-DD HH:mm") : "--";
  const end = campaign.end_ts ? moment(campaign.end_ts).format("YYYY-MM-DD HH:mm") : "--";
  const [imgError, setImgError] = useState(false);
  const iconCandidate = iconOverride || buildCampaignIcon(campaign);
  const iconUrl = !imgError ? iconCandidate : null;

  // Reset error state when a new icon candidate arrives
  useEffect(() => {
    setImgError(false);
  }, [iconCandidate]);
  const rolesCounts = useMemo(() => {
    if (!campaign.roles_counts) return [];
    try {
      const parsed = typeof campaign.roles_counts === "string" ? JSON.parse(campaign.roles_counts) : campaign.roles_counts;
      return Object.entries(parsed || {})
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => (b.count || 0) - (a.count || 0));
    } catch {
      return [];
    }
  }, [campaign.roles_counts]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="rounded-2xl bg-white/94 backdrop-blur-sm border border-white/80 shadow-md p-5 cursor-pointer hover:-translate-y-1 transition-transform duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt="app icon"
              className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm bg-white"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 font-semibold">
              NF
            </div>
          )}
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">
              {campaign.brand || "Unknown brand"}
            </p>
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="truncate">{formatCampaignTitle(campaign.campaign_id)}</span>
            </h4>
            <p className="text-sm text-gray-500">
              {campaign.type_mode ? formatLabel(campaign.type_mode) : "--"}
            </p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500 space-y-1">
          <div>
            <span className="font-semibold text-gray-900">{campaign.num_notifications?.toLocaleString?.() ?? 0}</span>{" "}
            notifications
          </div>
          <div>Avg conf: {(campaign.avg_confidence || 0).toFixed(2)}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3">
        <span className="px-2 py-1 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
          {campaign.channel || "channel n/a"}
        </span>
        <span className="text-gray-500">|</span>
        <span>{start}</span>
        <span className="text-gray-500">-&gt;</span>
        <span>{end}</span>
      </div>
      {rolesCounts.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Roles</p>
          <div className="flex flex-wrap gap-2">
            {rolesCounts.map((r) => (
              <span
                key={r.role}
                className="px-2 py-1 rounded-full bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 text-xs border border-pink-100"
              >
                {formatLabel(r.role)}: {r.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

function CampaignInsights() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState(() => {
    const today = moment.utc().format("YYYY-MM-DD");
    const defaultStart = moment.utc().subtract(30, "days").format("YYYY-MM-DD");
    return {
      brand: [],
      channel: "",
      type: "",
      role: "",
      start_date: defaultStart,
      end_date: today,
    };
  });

  const [taxonomy, setTaxonomy] = useState({ types: [], roles: [] });
  const [brandOptions, setBrandOptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [notifPage, setNotifPage] = useState(1);
  const [campaignPage, setCampaignPage] = useState(1);
  const campaignsPerPage = 6;
  const [campaignIcons, setCampaignIcons] = useState({});
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [overview, setOverview] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [error, setError] = useState("");
  const roleAppliedRef = useRef(false);

  const buildQuery = (extra = {}) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...extra }).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        v.forEach((val) => {
          if (val) params.append(k, val);
        });
      } else if (v) {
        params.append(k, v);
      }
    });
    return params.toString();
  };

  const fetchTaxonomy = async () => {
    try {
      const res = await fetch(`${API_URL}/web/campaigns/taxonomy`);
      if (!res.ok) throw new Error("Failed to load taxonomy");
      const data = await res.json();
      setTaxonomy({ types: data.types || [], roles: data.roles || [] });
    } catch (err) {
      setTaxonomy({ types: [], roles: [] });
      console.error(err);
    }
  };

  const fetchBrands = useCallback(async (search = "") => {
    try {
      const res = await fetch(
        `${API_URL}/web/campaigns/brands?limit=1000${search ? `&q=${encodeURIComponent(search)}` : ""}`
      );
      if (!res.ok) throw new Error("Failed to load brands");
      const data = await res.json();
      setBrandOptions(data.data || []);
    } catch (err) {
      setBrandOptions([]);
      console.error(err);
    }
  }, [API_URL]);

  const fetchOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const q = buildQuery();
      const res = await fetch(`${API_URL}/web/campaigns/overview?${q}`);
      if (!res.ok) throw new Error("Failed to load overview");
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setError(err.message || "Unable to load overview");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (page = campaignPage) => {
    setLoadingCampaigns(true);
    try {
      const q = buildQuery({ limit: campaignsPerPage, page });
      const res = await fetch(`${API_URL}/web/campaigns/list?${q}`);
      if (!res.ok) throw new Error("Failed to load campaigns");
      const data = await res.json();
      setCampaigns(data.data || []);
      setTotalCampaigns(data.total || (data.data || []).length);
    } catch (err) {
      setCampaigns([]);
      setTotalCampaigns(0);
      console.error(err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchCampaignDetail = async (campaignId) => {
    setDetailLoading(true);
    setDetailError("");
    setCampaignDetail(null);
    try {
      const q = buildQuery();
      const res = await fetch(
        `${API_URL}/web/campaigns/detail?campaign_id=${encodeURIComponent(campaignId)}&${q}`
      );
      if (!res.ok) throw new Error("Failed to load campaign detail");
      const data = await res.json();
      setCampaignDetail(data);
    } catch (err) {
      setDetailError(err.message || "Unable to load campaign detail");
      setCampaignDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchCampaignIcon = useCallback(
    async (campaignId) => {
      try {
        const q = buildQuery();
        const res = await fetch(
          `${API_URL}/web/campaigns/detail?campaign_id=${encodeURIComponent(campaignId)}&${q}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const notif = data?.notifications?.[0];
        const icon =
          data?.campaign?.icon ||
          notif?.icon ||
          buildIcon(
            notif,
            notif?.brand || notif?.appName || data?.campaign?.brand || data?.campaign?.appName
          ) ||
          null;
        if (icon) {
          setCampaignIcons((prev) => ({ ...prev, [campaignId]: icon }));
        }
      } catch {
        // ignore
      }
    },
    [API_URL, buildQuery]
  );

  useEffect(() => {
    fetchTaxonomy();
    fetchBrands();
  }, [fetchBrands]);

  useEffect(() => {
    fetchOverview();
    fetchCampaigns(campaignPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure role filter immediately applies to campaign list (and overview) without needing to re-click Apply
  useEffect(() => {
    if (!roleAppliedRef.current) {
      roleAppliedRef.current = true;
      return;
    }
    setCampaignPage(1);
    fetchOverview();
    fetchCampaigns(1);
  }, [filters.role]);

  const openCampaign = (campaignId) => {
    setSelectedCampaign(campaignId);
    setModalOpen(true);
    fetchCampaignDetail(campaignId);
    setNotifPage(1);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCampaignDetail(null);
    setSelectedCampaign(null);
    setDetailError("");
    setNotifPage(1);
  };

  const pagedNotifications = campaignDetail?.notifications || [];
  const notifPageSize = 2;
  const notifTotalPages = Math.max(1, Math.ceil(pagedNotifications.length / notifPageSize));
  const currentNotifSlice = pagedNotifications.slice(
    (notifPage - 1) * notifPageSize,
    notifPage * notifPageSize
  );
  const campaignTotalPages = Math.max(1, Math.ceil(totalCampaigns / campaignsPerPage));
  const pagedCampaigns = campaigns.slice(
    (campaignPage - 1) * campaignsPerPage,
    campaignPage * campaignsPerPage
  );
  const modalChannel = (() => {
    const channel = campaignDetail?.campaign?.channel;
    if (channel) return channel;
    const n = pagedNotifications[0];
    if (n && (n.app === "com.android.chrome" || n.appPackage === "com.android.chrome")) return "web";
    return n ? "mobile" : "mobile";
  })();

  useEffect(() => {
    const missing = campaigns.filter(
      (c) =>
        !(campaignIcons[c.campaign_id]) &&
        !(c.icon) &&
        !(c.recent_notifications && c.recent_notifications[0]?.icon)
    );
    if (missing.length === 0) return;
    missing.forEach((c) => fetchCampaignIcon(c.campaign_id));
  }, [campaigns, campaignIcons, fetchCampaignIcon]);

  const applyFilters = () => {
    fetchOverview();
    setCampaignPage(1);
    fetchCampaigns(1);
    setCampaignPage(1);
  };

  const timelineItems = overview?.timeline || [];
  const typeItems =
    overview?.types?.map((t) => ({ label: t.label, count: t.count })) || [];
  const roleItems =
    overview?.roles?.map((t) => ({ label: t.label, count: t.count })) || [];
  const brandItems =
    overview?.brands?.map((t) => ({ label: t.label, count: t.count })) || [];

  return (
    <>
      <div className="flex h-[100dvh] overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-pink-600 font-semibold">
                    Campaigns
                  </p>
                  <h1 className="text-3xl font-semibold text-gray-900">
                    Campaign Insights
                  </h1>
                  <p className="text-gray-500">
                    Explore labeled campaigns with filters and at-a-glance
                    metrics.
                  </p>
                </div>
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold shadow-sm hover:bg-pink-700 transition"
                >
                  Apply Filters
                </button>
              </div>

              {/* Filters */}
                <div className="rounded-2xl border border-white/80 bg-white/92 backdrop-blur-sm shadow-sm p-6 relative z-[2000]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brands</label>
                    <MultiSelect
                      options={brandOptions}
                      selected={filters.brand}
                      onChange={(vals) => setFilters((f) => ({ ...f, brand: vals }))}
                      placeholder="Search"
                      onSearch={(q) => fetchBrands(q)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Channel</label>
                    <input
                      className="form-input w-full"
                      placeholder="web | mobile | email"
                      value={filters.channel}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, channel: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select
                      className="form-select w-full"
                      value={filters.type}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, type: e.target.value }))
                      }
                    >
                      <option value="">Any</option>
                      {taxonomy.types.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      className="form-select w-full"
                      value={filters.role}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, role: e.target.value }))
                      }
                    >
                      <option value="">Any</option>
                      {taxonomy.roles.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={filters.start_date}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, start_date: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      className="form-input w-full"
                      value={filters.end_date}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, end_date: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Overview cards */}
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : overview ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Notifications"
                    value={overview.total_notifications?.toLocaleString?.() ?? "0"}
                    helper="Matched to filters"
                  />
                  <StatCard
                    label="Campaigns"
                    value={overview.total_campaigns?.toLocaleString?.() ?? "0"}
                    helper="Distinct Campaign Id"
                  />
                  <StatCard
                    label="Avg Confidence"
                    value={(overview.avg_confidence || 0).toFixed(2)}
                    helper="Mean Campaign Confidence"
                  />
                  <StatCard
                    label="Time Span"
                    value={`${overview.window?.start || "--"} -> ${overview.window?.end || "--"}`}
                    helper="UTC"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <BarList title="Top Types" items={typeItems} />
                  <BarList title="Top Roles" items={roleItems} color="emerald" />
                  <BarList title="Top Brands" items={brandItems} color="amber" />
                </div>

                <div className="rounded-2xl bg-white/92 backdrop-blur-sm border border-white/80 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Timeline (campaigns/day)
                    </h3>
                      <span className="text-[11px] text-gray-500">
                        {timelineItems.length} days
                      </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {(() => {
                      const maxCount = Math.max(...timelineItems.map((x) => x.count || 0), 1);
                      return timelineItems.map((t) => {
                        const colorClass = heatColor(t.count || 0, maxCount);
                        return (
                          <div
                            key={t.date}
                            className={`p-3 rounded-xl border border-gray-100 ${colorClass}`}
                          >
                            <p className="text-xs font-semibold">{t.date}</p>
                            <p className="text-lg font-semibold">
                              {t.count?.toLocaleString?.() ?? 0}
                            </p>
                            <p className="text-[11px] opacity-70">campaigns</p>
                          </div>
                        );
                      });
                    })()}
                    {timelineItems.length === 0 && (
                      <p className="text-sm text-gray-500">No timeline data</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Campaign list */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Campaigns
                  </h2>
                </div>
              <div className="relative min-h-[520px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`campaign-page-${campaignPage}-${loadingCampaigns}`}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -60, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                  >
                    {loadingCampaigns ? (
                      <div className="col-span-full flex justify-center items-center min-h-[360px]">
                        <Loader />
                      </div>
                    ) : campaigns.length === 0 ? (
                      <div className="col-span-full flex items-center justify-center min-h-[360px]">
                        <p className="text-sm text-gray-500">No campaigns matched the current filters.</p>
                      </div>
                    ) : (
                      <AnimatePresence mode="sync">
                        {campaigns.map((c) => (
                          <motion.div
                            key={c.campaign_id}
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -60, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            <CampaignCard
                              campaign={c}
                              iconOverride={campaignIcons[c.campaign_id]}
                              onClick={() => openCampaign(c.campaign_id)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {!loadingCampaigns && campaignTotalPages > 1 && (
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => {
                      const next = Math.max(1, campaignPage - 1);
                      setCampaignPage(next);
                      fetchCampaigns(next);
                    }}
                    disabled={campaignPage === 1}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-500">
                    Page {campaignPage} / {campaignTotalPages}
                  </span>
                  {(() => {
                    const buttons = [];
                    const start = Math.max(1, campaignPage - 2);
                    const end = Math.min(campaignTotalPages, campaignPage + 2);
                    for (let p = start; p <= end; p++) {
                      buttons.push(
                        <button
                          key={p}
                          className={`px-3 py-1 text-sm rounded-lg border ${p === campaignPage ? "bg-pink-500 text-white border-pink-500" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                          onClick={() => {
                            setCampaignPage(p);
                            fetchCampaigns(p);
                          }}
                        >
                          {p}
                        </button>
                      );
                    }
                    return buttons;
                  })()}
                  <button
                    className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => {
                      const next = Math.min(campaignTotalPages, campaignPage + 1);
                      setCampaignPage(next);
                      fetchCampaigns(next);
                    }}
                    disabled={campaignPage === campaignTotalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">
                    {campaignDetail?.campaign?.brand || "Unknown brand"}
                  </p>
                  <div className="flex items-start gap-3">
                    {(() => {
                      const campaignWithRecents = {
                        ...campaignDetail?.campaign,
                        recent_notifications: campaignDetail?.notifications,
                      };
                      const modalIcon = buildCampaignIcon(campaignWithRecents);
                      return modalIcon ? (
                        <img
                          src={modalIcon}
                          alt="app icon"
                          className="w-12 h-12 rounded-xl border border-gray-200 shadow-sm bg-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 font-semibold">
                          NF
                        </div>
                      );
                    })()}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span>{formatCampaignTitle(selectedCampaign)}</span>
                      </h3>
                      <p className="text-sm text-gray-500">
                        Campaign type:{" "}
                        <span className="font-semibold text-gray-800">
                          {campaignDetail?.campaign?.type_mode
                            ? formatLabel(campaignDetail.campaign.type_mode)
                            : "--"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-600 ml-4"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Notifications"
                  value={<span className="text-xl">{campaignDetail?.campaign?.num_notifications?.toLocaleString?.() ?? "--"}</span>}
                  helper="In this campaign"
                />
                <StatCard
                  label="Avg Confidence"
                  value={
                    campaignDetail?.campaign?.avg_confidence
                      ? <span className="text-xl">{campaignDetail.campaign.avg_confidence.toFixed(2)}</span>
                      : <span className="text-xl">--</span>
                  }
                  helper="Mean vote"
                />
                <StatCard
                  label="Channel"
                  value={<span className="text-xl capitalize">{modalChannel}</span>}
                  helper="Channel hint"
                />
                <StatCard
                  label="Span"
                  value={
                    campaignDetail?.campaign
                      ? (
                        <span className="text-base block leading-tight">
                          {campaignDetail.campaign.start_ts?.slice(0, 10) || "--"}
                          <br />
                          -&gt;
                          <br />
                          {campaignDetail.campaign.end_ts?.slice(0, 10) || "--"}
                        </span>
                      ) : (
                        <span className="text-base">--</span>
                      )
                  }
                  helper={<span className="text-[10px] text-gray-500">UTC</span>}
                />
              </div>

              {detailError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 p-3">
                  {detailError}
                </div>
              )}

              {detailLoading && (
                <div className="flex justify-center py-6">
                  <Loader />
                </div>
              )}

              {!detailLoading && campaignDetail && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Recent notifications
                    </h4>
                    <div className="space-y-3">
                      {campaignDetail.notifications?.length === 0 && (
                        <p className="text-sm text-gray-500">No notifications found.</p>
                      )}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`notif-page-${notifPage}`}
                          initial={{ x: 40, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -40, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="space-y-3"
                        >
                          {currentNotifSlice.map((n, idx) => (
                            <RecentNotificationCard key={`${n.timestamp}-${idx}`} notif={n} direction="left" campaignBrand={campaignDetail?.campaign?.brand} />
                          ))}
                        </motion.div>
                      </AnimatePresence>
                      {campaignDetail.notifications && campaignDetail.notifications.length > notifPageSize && (
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                            disabled={notifPage === 1}
                          >
                            Prev
                          </button>
                          <span className="text-xs text-gray-500">
                            Page {notifPage} / {notifTotalPages}
                          </span>
                          <button
                            className="px-3 py-1 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => setNotifPage((p) => Math.min(notifTotalPages, p + 1))}
                            disabled={notifPage === notifTotalPages}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-white p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                      Roles breakdown
                    </h4>
                    <div className="space-y-2" title="Roles are how the campaign messages behave within the lifecycle.">
                      {parseRolesCounts(campaignDetail.campaign.roles_counts).map((r) => {
                        const meta = ROLES_METADATA[r.role] || {
                          label: formatLabel(r.role),
                          description: "Role definition coming soon.",
                          icon: "-",
                        };
                        return (
                          <div
                            key={r.role}
                            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                          >
                            <div className="text-lg">{meta.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-gray-800" title={meta.description}>{meta.label}</span>
                                <span className="text-xs text-gray-500">Count: {r.count}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{meta.description}</p>
                            </div>
                          </div>
                        );
                      })}
                      {parseRolesCounts(campaignDetail.campaign.roles_counts).length === 0 && (
                        <p className="text-sm text-gray-500">No roles data.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CampaignInsights;

