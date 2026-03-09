"use client";

import { useEffect } from "react";
import { analyticsAPI } from "@/lib/api";

export default function AnalyticsTracker() {
    useEffect(() => {
        // Track the main page view only once when the app mounts
        analyticsAPI.track("page_view", "Anasayfa");
    }, []);

    return null;
}
