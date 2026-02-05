import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageViews() {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) return;

    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: location.pathname + location.search + location.hash,
      page_title: document.title,
    });
  }, [location]);

  return null;
}