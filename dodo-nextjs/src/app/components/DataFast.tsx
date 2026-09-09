"use client";
import { useEffect } from "react";
import { initDataFast } from "datafast";

const WEBSITE_ID = "dfid_t3tramfoGmZJDrANa10F6";

let started = false;

// Initializes DataFast analytics once per page lifetime. Auto-captures
// pageviews (including SPA navigations). No-ops on localhost unless
// allowLocalhost is enabled in the DataFast dashboard.
export default function DataFast() {
  useEffect(() => {
    if (started) return;
    started = true;
    initDataFast({ websiteId: WEBSITE_ID }).catch(() => {
      // Analytics must never break the app.
    });
  }, []);
  return null;
}