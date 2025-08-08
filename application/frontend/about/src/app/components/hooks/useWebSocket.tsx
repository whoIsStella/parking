"use strict";
// useWebSocket.tsx
import { useEffect, useRef, useCallback } from "react";

export function useWebSocket(
  url: string | undefined,
  onMessage: (data: any) => void,
) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const socket = new WebSocket(url);

    ws.current = socket;
    ws.current.onmessage = (evt) => {
      try {
        onMessage(JSON.parse(evt.data));
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };

    ws.current.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.current.onclose = () => {
      console.warn("WebSocket closed");
    };

    return () => ws.current?.close();
  }, [url, onMessage]);

  const send = useCallback((msg: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(msg));
    }
  }, []);

  return send;
}
