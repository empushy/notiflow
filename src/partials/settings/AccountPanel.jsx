import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

import Image from "../../images/user-avatar-80.png";
const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL;

function AccountPanel() {
  const { user, isLoading } = useAuth0();
  const [avatarError, setAvatarError] = useState(false);

  const avatar = user?.picture || Image;
  const name = user?.name || user?.nickname || "Unknown user";
  const email = user?.email || "Not available";
  const emailVerified = user?.email_verified;
  const updatedAt = user?.updated_at ? new Date(user.updated_at).toLocaleString() : "Not available";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || "")
    .join("");

  const [starred, setStarred] = useState([]);

  const fetchStarred = async () => {
    if (!email || email === "Not available") return;
    try {
      const res = await fetch(`${API_URL}/web/brands/starred?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const json = await res.json();
      setStarred(json.brands || []);
    } catch (e) {
      console.error(e);
    }
  };

  const updateStarred = async (brands) => {
    if (!email || email === "Not available") return;
    try {
      await fetch(`${API_URL}/web/brands/starred`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, brands }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const removeStarred = async (brand) => {
    const updated = starred.filter((b) => b !== brand);
    setStarred(updated);
    await updateStarred(updated);
  };

  useEffect(() => {
    fetchStarred();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <div className="grow">
      <div className="p-6 space-y-6">
        <h2 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mb-5">My Account</h2>

        {isLoading ? (
          <div className="text-sm text-gray-500">Loading account details…</div>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm p-6 flex items-center gap-4">
              <div className="relative">
                {avatar && !avatarError ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 bg-gray-50"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border border-gray-200 bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold">
                    {initials || "NA"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{email}</p>
                <div className="mt-2 inline-flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      emailVerified
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}
                  >
                    {emailVerified ? "Email verified" : "Email not verified"}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                    Last login: {updatedAt}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">Starred brands</p>
                  <p className="text-sm text-gray-500">Brands you follow for quick access.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {starred.length === 0 ? (
                  <span className="text-sm text-gray-500">No starred brands yet.</span>
                ) : (
                  starred.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm"
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => removeStarred(b)}
                        className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 transition"
                        aria-label={`Remove ${b}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default AccountPanel;
