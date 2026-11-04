"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function recordEvent(type: "page_view" | "service_view" | "resource_click") {
  fetch("/api/analytics/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
    keepalive: true,
  })
    .then((response) => {
      if (!response.ok) {
        console.error("WOFEM analytics event was not recorded.");
      }
    })
    .catch((error: unknown) => {
      console.error("Could not send WOFEM analytics event:", error);
    });
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    recordEvent("page_view");
  }, [pathname]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLElement>("[data-analytics-event]");
      const type = link?.dataset.analyticsEvent;
      if (type === "service_view" || type === "resource_click") {
        recordEvent(type);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
