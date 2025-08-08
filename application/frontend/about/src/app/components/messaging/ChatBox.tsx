"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAPI } from "../../context/useAPI";
import { useAuth } from "../../context/AuthContext";
import { Paperclip } from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";

interface Message {
  message_id: string;
  sender: string;
  sender_email: string;
  recipient: string;
  recipient_email: string;
  content: string;
  sent_at: string;
  file_url?: string;
}

interface ChatBoxProps {
  recipientId: string;
  bookingId?: string;
  wsRoomId: string;
}

const WS_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^http/, "ws");

export default function ChatBox({
  recipientId,
  bookingId,
  wsRoomId,
}: ChatBoxProps) {
  const { user, accessToken } = useAuth();
  const { get, post } = useAPI();
  const token = accessToken || localStorage.getItem("access_token");
  const wsUrl = wsRoomId ? `${WS_BASE}/ws/chat/${wsRoomId}/?token=${token}` : undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!recipientId) return;
    try {
      const res = await get(
        `/messages/?recipient=${recipientId}${bookingId ? `&booking=${bookingId}` : ""}`,
      );
      if (res && res.data) {
        setMessages(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [get, recipientId, bookingId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleWebSocketMessage = useCallback(
    (msg: any) => {
      if (msg.type === "typing" && msg.user_id !== user?.user_id) {
        setTypingUser(msg.username || "Someone");
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => setTypingUser(null), 2000);
      } else if (msg.message_id) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    [user?.user_id],
  );

  const wsSend = useWebSocket(wsUrl, handleWebSocketMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  }, [file]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !file) return;

    let res;
    if (file) {
      const formData = new FormData();
      formData.append("recipient", recipientId);
      if (bookingId) formData.append("booking", bookingId);
      formData.append("content", input.trim());
      formData.append("file", file);

      res = await post("/messages/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      const messageData = {
        recipient: recipientId,
        booking: bookingId,
        content: input.trim(),
      };
      res = await post("/messages/", messageData);
    }

    if (res && res.data && wsSend) {
      wsSend({ ...res.data, sender_email: user?.email });
    }

    setInput("");
    setFile(null);
    setFilePreview(null);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    wsSend({ type: "typing" });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-lg bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {/* Render messages here */}
        {messages.map((msg, i) => (
          <div
            key={msg.message_id || i}
            className={`flex ${msg.sender === user?.user_id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-xl shadow
                ${
                  msg.sender === user?.user_id
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-900"
                }
              `}
            >
              {msg.content}
              {msg.file_url && (
                <a
                  href={msg.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-xs underline text-blue-700"
                >
                  Attachment
                </a>
              )}
              <div className="text-xs mt-1 text-right text-slate-500">
                {new Date(msg.sent_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        {typingUser && (
          <div className="italic text-sm text-slate-400 px-2 py-1">
            {typingUser} is typing…
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="flex p-2 border-t bg-slate-50" onSubmit={handleSend}>
        <input
          type="text"
          className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          value={input}
          onChange={handleInput}
        />
        {/* File attachment */}
        <label className="cursor-pointer flex items-center mr-2">
          <Paperclip className="w-5 h-5 text-slate-400 hover:text-blue-600" />
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          Send
        </button>
      </form>
      {filePreview && (
        <div className="p-2">
          <img
            src={filePreview}
            alt="Preview"
            className="max-w-xs max-h-40 rounded shadow"
          />
        </div>
      )}
    </div>
  );
}

// "use client";
// import React, { useEffect, useState, useRef } from "react";
// import { useAPI } from "../../context/useAPI"; // API connection for making requests
// import { useAuth,  } from "../../context/AuthContext";
// import { useWebSocket } from "../hooks/useWebSocket"; // Custom hook for WebSocket connection
// import { Paperclip } from "lucide-react";

// interface Message {
//   message_id: string;
//   sender: string;
//   sender_email: string;
//   recipient: string;
//   recipient_email: string;
//   content: string;
//   sent_at: string;
//   file_url?: string;
// }

// interface ChatBoxProps {
//   recipientId: string;
//   bookingId?: string;
//   wsRoomId: string;
// }

// const WS_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^http/, "ws");

// export default function ChatBox({ recipientId, bookingId, wsRoomId }: ChatBoxProps) {
//   const { user, accessToken } = useAuth();
//   const { get, post } = useAPI();
//   const token = accessToken || localStorage.getItem("access_token");
//   const wsUrl = `${WS_BASE}/ws/chat/${wsRoomId}/?token=${token}`;
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");
//   const [typingUser, setTypingUser] = useState<string | null>(null);
//   const typingTimeout = useRef<NodeJS.Timeout | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [filePreview, setFilePreview] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // Define a standard async function inside the effect
//     const fetchMessages = async () => {
//       try {
//         const res = await get(`/messages/?recipient=${recipientId}${bookingId ? `&booking=${bookingId}` : ""}`);
//         if (res && res.data) {
//           setMessages(res.data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch messages:", error);
//       }
//     };

//     // Call the async function
//     fetchMessages();
//   }, [get, recipientId, bookingId]);

//   const wsSend = useWebSocket(
//   wsUrl,
//   msg => {
//       if (msg.type === "typing" && msg.user_id !== user?.user_id) {
//         setTypingUser(msg.username || "Someone");
//         if (typingTimeout.current) clearTimeout(typingTimeout.current);
//         typingTimeout.current = setTimeout(() => setTypingUser(null), 2000);
//       } else if (msg.message_id) {
//         setMessages(prev => [...prev, msg]);
//       }
//     }
//   );

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     if (!file) {
//       setFilePreview(null);
//       return;
//     }
//     if (file.type.startsWith("image/")) {
//       const reader = new FileReader();
//       reader.onload = e => setFilePreview(e.target?.result as string);
//       reader.readAsDataURL(file);
//     } else {
//       setFilePreview(null);
//     }
//   }, [file]);

//   const handleSend = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!input.trim() && !file) return;

//     let res;
//     if (file) {
//       const formData = new FormData();
//       formData.append("recipient", recipientId);
//       if (bookingId) formData.append("booking", bookingId);
//       formData.append("content", input.trim());
//       formData.append("file", file);

//       res = await post("/messages/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     } else {
//       const messageData = {
//         recipient: recipientId,
//         booking: bookingId,
//         content: input.trim(),
//       };
//       res = await post("/messages/", messageData);
//     }

//     if (res && res.data && wsSend) {
//       wsSend({ ...res.data, sender_email: user?.email });
//     }

//     setInput("");
//     setFile(null);
//     setFilePreview(null);
//   };

//   const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput(e.target.value);
//     wsSend({ type: "typing" });
//   };

//   return (
//     <div className="flex flex-col h-full w-full max-w-lg bg-white shadow-xl rounded-2xl overflow-hidden">
//       <div className="flex-1 p-4 overflow-y-auto space-y-2">
//         {/* Render messages here */}
//         {messages.map((msg, i) => (
//           <div
//             key={msg.message_id || i}
//             className={`flex ${msg.sender === user?.user_id ? "justify-end" : "justify-start"}`}
//           >
//             <div
//               className={`px-4 py-2 rounded-xl shadow
//                 ${msg.sender === user?.user_id
//                   ? "bg-blue-500 text-white"
//                   : "bg-slate-200 text-slate-900"
//                 }
//               `}
//             >
//               {msg.content}
//               {msg.file_url && (
//                 <a
//                   href={msg.file_url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="block mt-1 text-xs underline text-blue-700"
//                 >
//                   Attachment
//                 </a>
//               )}
//               <div className="text-xs mt-1 text-right text-slate-500">
//                 {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </div>
//             </div>
//           </div>
//         ))}
//         {typingUser && (
//           <div className="italic text-sm text-slate-400 px-2 py-1">{typingUser} is typing…</div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>
//       <form className="flex p-2 border-t bg-slate-50" onSubmit={handleSend}>
//         <input
//           type="text"
//           className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
//           value={input}
//           onChange={handleInput}
//         />
//         {/* File attachment */}
//         <label className="cursor-pointer flex items-center mr-2">
//           <Paperclip className="w-5 h-5 text-slate-400 hover:text-blue-600" />
//           <input
//             type="file"
//             className="hidden"
//             onChange={e => setFile(e.target.files?.[0] || null)}
//           />
//         </label>
//         <button
//           type="submit"
//           className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
//         >
//           Send
//         </button>
//       </form>
//       {filePreview && (
//         <div className="p-2">
//           <img src={filePreview} alt="Preview" className="max-w-xs max-h-40 rounded shadow" />
//         </div>
//       )}
//     </div>
//   );
// }
