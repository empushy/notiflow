import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Eye, EyeOff, Copy } from "lucide-react";

import Sidebar from "../../partials/Sidebar";
import Header from "../../partials/Header";
import SettingsSidebar from "../../partials/settings/SettingsSidebar";

function ApiKeys() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [lastRotated, setLastRotated] = useState(null);
  const [copied, setCopied] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const [activeExample, setActiveExample] = useState("curl");

  const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

  const maskKey = (key = "") => {
    if (!key || key.length < 8) return "****-****-****-****";
    const start = key.slice(0, 4);
    const end = key.slice(-4);
    return `${start}********${end}`;
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = new Date((Number(ts) || 0) * 1000);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  };

  useEffect(() => {
    const loadKey = async () => {
      setLoading(true);
      setError("");
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/auth/api-key`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || `Status ${res.status}`);
        }
        const json = await res.json();
        setApiKey(json.api_key || "");
        setLastRotated(json.last_rotated_at || json.created_at || null);
      } catch (err) {
        console.error("Failed to load API key", err);
        setError("Unable to load API key");
        setApiKey("");
        setLastRotated(null);
      } finally {
        setLoading(false);
      }
    };
    loadKey();
  }, [API_URL, getAccessTokenSilently]);

  const handleCopy = async () => {
    if (!apiKey) return;
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleRotate = async () => {
    setRotating(true);
    setError("");
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${API_URL}/auth/api-key/rotate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Status ${res.status}`);
      }
      const json = await res.json();
      setApiKey(json.api_key || "");
      setShowKey(true);
      setLastRotated(json.last_rotated_at || json.created_at || null);
    } catch (err) {
      console.error("Rotate failed", err);
      setError("Unable to rotate API key");
    } finally {
      setRotating(false);
    }
  };

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                Account Settings
              </h1>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl mb-8">
              <div className="flex flex-col md:flex-row md:-mr-px">
                <SettingsSidebar />
                <div className="grow p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Primary key</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Include in <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">X-API-Key</code> header.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRotate}
                        disabled={rotating || loading}
                        className="px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {rotating ? "Rotating…" : "Rotate"}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mt-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base text-gray-900 dark:text-gray-100 tracking-wide">
                        {loading ? "Loading…" : showKey ? apiKey || "—" : maskKey(apiKey)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowKey((v) => !v)}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          aria-label={showKey ? "Hide API key" : "Show API key"}
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleCopy}
                          disabled={!apiKey || loading}
                          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                          aria-label="Copy API key"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {copied && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last rotated: {loading ? "…" : formatDate(lastRotated)}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Example usage</p>
                      <div className="flex items-center gap-2">
                        {[
                          ["curl", "curl"],
                          ["py", "Python"],
                          ["js", "JavaScript"],
                          ["java", "Java"],
                        ].map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => setActiveExample(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              activeExample === key
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto shadow-inner">
                      {activeExample === "curl" && (
                        <pre>{`curl -H "X-API-Key: ${showKey ? (apiKey || "YOUR_API_KEY") : "YOUR_API_KEY"}" \\\n  "https://api.notiflow.empushy.com/trends/daily-volume"`}</pre>
                      )}
                      {activeExample === "py" && (
                        <pre>{`import requests\n\nheaders = {"X-API-Key": "${showKey ? (apiKey || "YOUR_API_KEY") : "YOUR_API_KEY"}"}\nres = requests.get("https://api.notiflow.empushy.com/trends/daily-volume", headers=headers)\nprint(res.json())`}</pre>
                      )}
                      {activeExample === "js" && (
                        <pre>{`fetch("https://api.notiflow.empushy.com/trends/daily-volume", {\n  headers: { "X-API-Key": "${showKey ? (apiKey || "YOUR_API_KEY") : "YOUR_API_KEY"}" }\n}).then(r => r.json()).then(console.log);`}</pre>
                      )}
                      {activeExample === "java" && (
                        <pre>{`var client = java.net.http.HttpClient.newHttpClient();\nvar req = java.net.http.HttpRequest.newBuilder()\n  .uri(java.net.URI.create("https://api.notiflow.empushy.com/trends/daily-volume"))\n  .header("X-API-Key", "${showKey ? (apiKey || "YOUR_API_KEY") : "YOUR_API_KEY"}")\n  .build();\nvar res = client.send(req, java.net.http.HttpResponse.BodyHandlers.ofString());\nSystem.out.println(res.body());`}</pre>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      See full docs at{" "}
                      <a
                        href="https://docs.notiflow.empushy.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-600 underline"
                      >
                        docs.notiflow.empushy.com
                      </a>
                    </p>
                  </div>

                  {error && (
                    <div className="mt-3 text-xs text-rose-600">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ApiKeys;
