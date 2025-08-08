//FloatingChat.tsx
//FIX FLOATING CHAT POSITION
"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle, X, User2, Headset } from "lucide-react";
import ChatBox from "./ChatBox"; 
import { useAuth } from "../../context/AuthContext";
// import { useUserStatus } from "./status";
import { useChatUsers } from "./useChatUsers"; 

const SUPPORT_USER_ID = "admin-user-id";
type ChatMode = "support" | "user";

function safeRoomId(...ids: string[]) {
  return ids.map((id) => id.replace(/[^a-zA-Z0-9_\-]/g, "")).join("-");
}

export default function FloatingChat() {
  const { user } = useAuth();
  const { users, loading } = useChatUsers();

  const [open, setOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("support");
  const [selectedUser, setSelectedUser] = useState<string>("");

  useEffect(() => {
    if (users.length > 0 && !selectedUser) setSelectedUser(users[0].user_id);
  }, [users, selectedUser]);

  const otherUserIds = users.map((u) => u.user_id);
  // const status = useUserStatus(user ? [user.user_id, ...otherUserIds] : []);

  if (!user || loading || !selectedUser) return null;

  let recipientId: string;
  let wsRoomId: string;

  if (chatMode === "support") {
    recipientId = SUPPORT_USER_ID;
    wsRoomId = safeRoomId("support", user.user_id);
  } else {
    recipientId = selectedUser;
    wsRoomId = safeRoomId("userchat", user.user_id, selectedUser);
  }

  const handlingAdminAction = async () => {
    try {
      const res = await fetch("/api/admin-actions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser,
          action: "block_and_cancel",
          reason: "Inappropriate messages",
        }),
      });

      if (res.ok) {
        alert("user is blocked and the reservation canceled.");
      } else {
        alert(`Failed with status: ${res.status}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("something went wrong.");
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          className="fixed bottom-20 right-6 z-[9999] bg-blue-600 text-white rounded-full p-4 shadow-xl hover:bg-blue-700 transition"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}
      {open && (
        <div
          className="
      fixed bottom-4 right-2 z-[9999]
      w-[95vw] max-w-sm
      sm:right-6 sm:bottom-32 sm:max-w-md
      md:max-w-lg
      bg-white rounded-2xl shadow-2xl flex flex-col
    "
          style={{
            minHeight: 320,
            maxHeight: "80vh",
            height: "calc(100vh - 2rem)",
          }}
        >
          <div className="flex justify-between items-center p-2 border-b bg-blue-600 rounded-t-2xl">
            <span className="text-white font-semibold flex items-center gap-2">
              {chatMode === "support" ? (
                <Headset size={18} />
              ) : (
                <User2 size={18} />
              )}
              {chatMode === "support" ? "Support" : "User Chat"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setChatMode(chatMode === "support" ? "user" : "support")
                }
                className="text-white bg-blue-700 px-2 py-1 rounded hover:bg-blue-900"
              >
                {chatMode === "support" ? "User Chat" : "Support"}
              </button>
              <button onClick={() => setOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>
          </div>
          {chatMode === "user" && (
            <div className="p-2 bg-slate-100 border-b">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="p-2 rounded border"
              >
                {users.map((u) => (
                  <option value={u.user_id} key={u.user_id}>
                    {u.first_name} {u.last_name || u.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            <ChatBox recipientId={recipientId} wsRoomId={wsRoomId} />
            {chatMode === "user" && (
              <div className="p-2 border-t bg-white">
                <button
                  className="bg-red-600 text-white w-full p-2 rounded hover:bg-red-700"
                  onClick={handlingAdminAction}
                >
                  Block and Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
