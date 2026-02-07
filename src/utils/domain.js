const COMMON_TLDS = new Set([
  "com",
  "net",
  "org",
  "io",
  "co",
  "ai",
  "app",
  "dev",
  "info",
  "biz",
  "edu",
  "gov",
  "uk",
  "ie",
  "us",
  "ca",
  "de",
  "fr",
  "es",
  "it",
  "nl",
  "se",
  "no",
  "dk",
  "fi",
  "au",
  "nz",
  "in",
  "jp",
  "kr",
  "cn",
  "sg",
  "hk",
  "me",
  "tv",
  "gg",
  "to",
  "xyz",
  "cloud",
  "store",
  "shop",
  "site",
  "online",
  "tech",
  "digital",
  "software",
  "games",
  "news",
  "media",
  "travel",
  "food",
  "fashion",
  "live",
  "link",
  "blog",
  "page",
  "space",
  "services",
  "agency",
  "studio",
  "finance",
  "health",
  "market",
]);

export const isValidDomain = (value = "") => {
  if (!value || typeof value !== "string") return false;
  const candidate = value.trim().toLowerCase();
  if (!candidate || !candidate.includes(".")) return false;
  const parts = candidate.split(".");
  if (parts.length < 2 || parts.some((p) => !p)) return false;
  const tld = parts[parts.length - 1];
  if (!/^[a-z]{2,}$/.test(tld)) return false;
  if (!COMMON_TLDS.has(tld)) return false;
  for (const label of parts) {
    if (!/^[a-z0-9-]+$/.test(label)) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
  }
  return true;
};

export const extractDomainFromText = (text = "") => {
  if (!text || typeof text !== "string") return null;
  const regex = /\b([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,})\b/gi;
  let match = null;
  while ((match = regex.exec(text)) !== null) {
    if (isValidDomain(match[0])) return match[0];
  }
  return null;
};
