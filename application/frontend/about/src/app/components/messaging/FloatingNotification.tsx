//FloatingNotification.tsx
"use client"; 
import React, { useState, useEffect } from "react";
import { useAPI } from "../../context/useAPI"; 
import { useAuth } from "../../context/AuthContext";
import { BellIcon, XIcon } from "lucide-react";
import { useNotificationWS } from "../hooks/useNotificationWS"; 

export default function FloatingNotification() {
  const { get, post } = useAPI();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useNotificationWS(user?.user_id ?? "", (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  });

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await get("/notifications/"); 
        setNotifications(res.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [get, user]);

  const markRead = async (notification_id: string) => {
    try {
      await post(`/notifications/${notification_id}/mark_read/`); 
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notification_id ? { ...n, is_read: true } : n,
        ),
      );
    } catch (e) {}
  };

  return (
    <div className="fixed bottom-36 right-6 z-50">
      <button
        aria-label="Open notifications"
        onClick={() => setOpen(!open)}
        className="bg-white shadow-lg rounded-full p-3 border hover:bg-blue-50 transition"
      >
        <BellIcon className="w-6 h-6 text-blue-600" />
        {notifications.some((n) => !n.is_read) && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white"></span>
        )}
      </button>

      {open && (
        <div className="mt-2 w-80 max-w-xs bg-white border shadow-2xl rounded-2xl overflow-y-auto max-h-96 p-4 animate-fadeIn">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-800">Notifications</span>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          {loading ? (
            <div className="text-center text-slate-400 py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              No notifications.
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((notif) => (
                <li
                  key={notif.notification_id}
                  onClick={() =>
                    !notif.is_read && markRead(notif.notification_id)
                  }
                  className={`py-3 px-2 rounded-lg cursor-pointer transition ${
                    notif.is_read
                      ? "bg-slate-50"
                      : "bg-blue-50/40 font-semibold hover:bg-blue-100"
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">
                    {new Date(notif.sent_at).toLocaleString()}
                  </div>
                  <div className="text-slate-700">{notif.content}</div>
                  <div className="text-xs text-blue-400">{notif.type}</div>
                  {!notif.is_read && (
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
