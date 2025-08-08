//NotificationPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useAPI } from "../../context/useAPI"; 

export default function NotificationPanel() {
  const { get } = useAPI();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    get("/notifications/") 
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifications([]));
  }, [get]);

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white shadow rounded-2xl">
      <h3 className="font-bold text-lg mb-3">Notifications</h3>
      {notifications.length === 0 && (
        <div className="text-slate-600">No notifications.</div>
      )}
      <ul className="space-y-2">
        {notifications.map((notif) => (
          <li
            key={notif.notification_id}
            className={`p-3 rounded-xl border ${notif.is_read ? "bg-slate-100" : "bg-yellow-100 border-yellow-400"}`}
          >
            <div className="text-slate-900">{notif.content}</div>
            <div className="text-xs text-slate-500">
              {new Date(notif.sent_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
