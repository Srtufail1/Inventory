"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export default function HeartbeatProvider() {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch("/api/heartbeat", { method: "POST" });
      } catch {
        // silently ignore — network errors shouldn't break the UI
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return null;
}
