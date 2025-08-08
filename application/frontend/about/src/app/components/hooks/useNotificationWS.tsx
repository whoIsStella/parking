"use client";
import { useEffect } from "react";

// useNotificationWS.tsx
export function useNotificationWS(
  userId: string | undefined,
  onNotif: (notif: any) => void,
) {
  useEffect(() => {
    if (!userId) return;
    const token =
      localStorage.getItem("access_token") || localStorage.getItem("token");
    let wsUrl =
      process.env.NEXT_PUBLIC_WS_BASE_URL?.replace(/^http/, "ws") +
      "/ws/notifications/";
    if (token) wsUrl += `?token=${token}`;
    if (!wsUrl.startsWith("ws")) return;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (evt) => {
      try {
        const notif = JSON.parse(evt.data);
        onNotif(notif);
      } catch {}
    };

    return () => ws.close();
  }, [userId, onNotif]);
}
