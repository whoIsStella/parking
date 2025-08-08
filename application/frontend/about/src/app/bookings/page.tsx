//bookings/page.tsx this file handles the user's bookings, edits, payments, messages, and reviews
"use client"; //FIX REVIEWS BEFORE TUESDAY!!!!!

import { toast } from "react-toastify"; 
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAPI } from "../context/useAPI"; // API connection for making requests
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWebSocket } from "../components/hooks/useWebSocket"; 

type Booking = {
  owner_id: string;
  booking_id: string;
  space?: any;
  start_time: string;
  end_time: string;
  status: string;
  amount_total: number;
  payment_status?: string;
};

type Message = {
  message_id: string;
  sender: string;
  text: string;
  timestamp: string;
};

export default function BookingsPage() {
  const { user, isLoading, accessToken } = useAuth(); 
  const api = useAPI();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Review   FIX REVIEW SUBMISSION
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [rating, setRating] = useState(5);

  // Cancel
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  // Messaging
  const [messageTarget, setMessageTarget] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  // Payments
  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState("");

  async function fetchBookings() {
    setLoading(true);
    try {
      const res = await api.get(`/bookings/`); // Fetch bookings from API
      setBookings(res.data);
    } catch {
      setBookings([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (user) fetchBookings();
  }, [user, isLoading, router, api]);

  // Cancel booking
  async function handleCancel(bookingId: string) {
    setCancelLoadingId(bookingId);
    try {
      await api.delete(`/bookings/${bookingId}/`); // API connection for deleting a booking
      setBookings((b) => b.filter((x) => x.booking_id !== bookingId));
    } catch {
      alert("Failed to cancel booking.");
    }
    setCancelLoadingId(null);
  }

  async function handleReviewSubmit(bookingId: string) {
    if (!reviewText) return setReviewError("Enter your review");
    const targetType = "space";
    const targetId = reviewTarget?.space;

      if (!user) {
        toast.error("You must be logged in to leave a review")
        return;
      }

    try {
      console.log("Review payload", {
        booking: reviewTarget?.booking_id,
        author: user?.user_id,
        target_type: targetType,
        target_id: targetId,
        rating,
        comment: reviewText,
      });
      await api.post(`/reviews/`, {
        booking: reviewTarget!.booking_id,
        target_type: "space",
        target_id: reviewTarget?.space,
        rating: rating,
        comment: reviewText,
      });
      setReviewSuccess("Review submitted!");
      setTimeout(() => {
        setReviewSuccess("");
        setReviewTarget(null);
      }, 1200);
    } catch {
      setReviewError("Failed to submit review.");
    }
  }

  async function openMessages(b: Booking) {
    setMessageTarget(b);
    setMessageLoading(true);
    try {
      const res = await api.get(`/messages/?booking=${b.booking_id}`);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
    setMessageLoading(false);
  }
  async function sendMessage() {
    if (!newMessage.trim() || !messageTarget) return;
    const recipientId = messageTarget.owner_id; 
    if (!recipientId) {
      console.error("Booking object:", messageTarget);
      alert("Cannot send message: recipient ID is missing.");
      return;
    }
    setMessageLoading(true);
    try {
      await api.post(`/messages/`, {
        booking: messageTarget.booking_id,
        sender: user?.user_id,
        recipient: recipientId,
        content: newMessage,
      });
      const res = await api.get(`/messages/?booking=${messageTarget.booking_id}`);
      setMessages(res.data);
      setNewMessage("");
    } catch {}
    setMessageLoading(false);
  }

  // Payment
  async function handlePay(bookingId: string) {
    console.log("handlePay called for bookingId:", bookingId);
    setPayLoadingId(bookingId);
    setPaymentSuccess("");
    try {
      console.log(
        "Attempting to post to /payments/ with bookingId:",
        bookingId,
      );
      await api.post(`/payments/`, { booking: bookingId, user_id: user?.user_id });
      await fetchBookings(); 
      console.log("Payment API call successful!");
      setPaymentSuccess("Payment successful!");
      setBookings((bks) =>
        bks.map((b) =>
          b.booking_id === bookingId
            ? {
                ...b,
                payment_status: "paid",
                status:
                  new Date() < new Date(b.end_time)
                    ? "active"
                    : "completed",
              }
            : b,
        ),
      );
    } catch (error) {
      console.error("Payment API call failed:", error);
      setPaymentSuccess("Payment failed!");
    } finally {
      console.log("handlePay finally block reached for bookingId:", bookingId);
      setTimeout(() => setPaymentSuccess(""), 1500);
      setPayLoadingId(null);
    }
  }

  function getCombinedStatus(booking: Booking) {
    if (booking.status === "pending") {
      return { label: "Pending", color: "bg-yellow-100 text-yellow-800" };
    }
    if (booking.status === "confirmed") {
      return { label: "Confirmed", color: "bg-emerald-100 text-emerald-800" };
    }
    if (booking.status === "no-show") {
      return { label: "No-Show", color: "bg-red-100 text-red-800" };
    }
    if (booking.status === "active") {
      if (booking.payment_status === "paid") {
        return { label: "Active (Paid)", color: "bg-blue-100 text-blue-800" };
      }
      if (booking.payment_status === "pending") {
        return { label: "Active (Payment Pending)", color: "bg-yellow-100 text-yellow-800" };
      }
      return { label: "Active", color: "bg-blue-100 text-blue-800" };
    }
    if (booking.status === "completed") {
      if (booking.payment_status === "paid") {
        return { label: "Completed", color: "bg-slate-100 text-slate-800" };
      }
      return { label: "Completed (Unpaid)", color: "bg-red-100 text-red-800" };
    }
    return { label: booking.status, color: "bg-slate-100 text-slate-800" };
  }

  const getStatusColor = (status: string, ) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const WS_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^http/, "ws");
  const token =
    typeof window !== "undefined"
      ? accessToken || localStorage.getItem("access_token")
      : accessToken;
  function safeRoomId(bookingId?: string, userId?: string, ownerId?: string) {
    return [bookingId, userId, ownerId]
      .map(id => (id ? id.replace(/[^a-zA-Z0-9_\-\.]/g, "") : ""))
      .join("-");
  }

  const wsRoomId =
    messageTarget && user
      ? safeRoomId(
          messageTarget.booking_id,
          user.user_id,
          messageTarget.space?.owner?.user_id
        )
      : undefined;

  const wsUrl =
    wsRoomId && token
      ? `ws://52.52.40.129:8000/api/ws/chat/${wsRoomId}/?token=${token}`
      : undefined;

  const handleWebSocketMessage = (msg: any) => {
    setMessages((prev) => [...prev, msg]);
  };

  const wsSend = useWebSocket(wsUrl, handleWebSocketMessage);

  console.log("WS connecting:", wsUrl);

  if (loading || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading your bookings...
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-2">
            My Bookings
          </h1>
          <p className="text-slate-600">Manage your parking reservations</p>
        </div>
        <div className="space-y-7">
          {bookings.map((booking, idx) => (
            <div key={booking.booking_id || idx}>
              <div
                className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-xl p-8 glass animate-scale-in hover-lift"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {booking.space?.address}
                    </h3>
                    <div className="flex flex-wrap items-center gap-5 text-slate-600 mb-1">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(booking.start_time).toLocaleDateString()} -{" "}
                        {new Date(booking.end_time).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Date(booking.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" – "}
                        {new Date(booking.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCombinedStatus(booking).color}`}
                      >
                        {getCombinedStatus(booking).label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right min-w-[150px]">
                    <p className="text-2xl font-bold text-slate-900">
                      ${booking.amount_total}
                    </p>
                    <div className="mt-1 text-slate-700">
                      Payment:{" "}
                      <span className="font-semibold">
                        {booking.payment_status === "paid"
                          ? "paid"
                          : booking.payment_status === "pending"
                          ? "pending"
                          : booking.payment_status === "failed"
                          ? "failed"
                          : booking.payment_status === "refunded"
                          ? "refunded"
                          : booking.payment_status === "disputed"
                          ? "disputed"
                          : booking.payment_status === "in_progress"
                          ? "in progress"
                          : booking.payment_status
                          ? "paid"
                          : "unpaid"}
                      </span>
                      {booking.payment_status !== "paid" && (
                        <button
                          className="ml-2 px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-medium shadow"
                          onClick={() => handlePay(booking.booking_id)}
                          disabled={payLoadingId === booking.booking_id}
                        >
                          {payLoadingId === booking.booking_id ? "Paying..." : "Pay"}
                        </button>
                      )}
                      {paymentSuccess && payLoadingId === booking.booking_id && (
                        <span className="ml-2 text-green-600 text-xs">
                          {paymentSuccess}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Space Owner</p>
                    <p className="font-medium text-slate-900">
                      {booking.space?.owner?.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {/* <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
                      onClick={() => openMessages(booking)}
                    >
                      Contact Owner
                    </button>
                    <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition">
                      View Details
                    </button> */}
                    {booking.status === "pending" && (
                      <button
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition"
                        disabled={cancelLoadingId === booking.booking_id}
                        onClick={() => handleCancel(booking.booking_id)}
                      >
                        {cancelLoadingId === booking.booking_id
                          ? "Cancelling..."
                          : "Cancel"}
                      </button>
                    )}
                    <button
                      className="px-4 py-2 border border-emerald-200 text-emerald-600 rounded-xl hover:bg-emerald-50 transition"
                      onClick={() => {
                        setReviewTarget(booking);
                        setReviewText("");
                        setReviewError("");
                        setReviewSuccess("");
                      }}
                    >
                      Leave Review
                    </button>
                  </div>
                </div>

                {/* Review Modal */}
                {reviewTarget &&
                  reviewTarget.booking_id === booking.booking_id && (
                    <div className="mt-6 rounded-xl border border-emerald-200 bg-slate-50/90 p-6 shadow-inner animate-fade-in">
                      <div className="font-semibold mb-2 text-emerald-900"> 
                        Leave a Review
                      </div>
                      <textarea
                        className="w-full border border-slate-200 rounded-xl p-3 mb-2 text-slate-900" 
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Your review..."
                        rows={3}
                      />
                      <div className="mb-2">
                        <label className="font-medium text-slate-700 mr-2"> 
                          Rating:
                        </label>
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="border rounded px-2 py-1"
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n} Star{n > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      {reviewError && (
                        <div className="text-red-600 text-sm mb-2">
                          {reviewError}
                        </div>
                      )}
                      {reviewSuccess && (
                        <div className="text-emerald-600 text-sm mb-2">
                          {reviewSuccess}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          className="px-4 py-2 rounded-xl bg-slate-200"
                          onClick={() => setReviewTarget(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
                          onClick={() => handleReviewSubmit(booking.booking_id)}
                        >
                          Submit Review
                        </button>
                      </div>
                    </div>
                  )}

                {/* Messaging Modal */}
                {messageTarget &&
                  messageTarget.booking_id === booking.booking_id && (
                    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/90 p-6 shadow-inner animate-fade-in"> 
                      <div className="font-semibold mb-2 text-blue-900">
                        Conversation
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 mb-2 bg-white p-2 rounded-xl border">
                        {messageLoading ? (
                          <div key="loading">Loading...</div>
                        ) : messages.length === 0 ? (
                          <div key="no-messages" className="text-sm text-slate-400">
                            No messages yet.
                          </div>
                        ) : (
                          messages.map((m) => (
                            <div
                              key={m.message_id}
                              className={`text-sm mb-1 ${m.sender === user?.email ? "text-right" : "text-left"}`}
                            >
                              <span className="block font-bold">
                                {m.sender === user?.email ? "You" : m.sender}
                              </span>
                              <span className="inline-block px-2 py-1 rounded bg-slate-100"> 
                                {m.text}
                              </span>
                              <span className="ml-2 text-xs text-slate-400"> 
                                {new Date(m.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="w-full border border-slate-200 rounded-xl p-3 mb-2 text-slate-900"
                        value={newMessage} // Input for new message
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                        />
                        <button
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white" // Send message button
                          onClick={sendMessage}
                          disabled={messageLoading}
                        >
                          Send
                        </button>
                        <button
                          className="px-4 py-2 rounded-xl bg-slate-200"
                          onClick={() => setMessageTarget(null)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-slate-600 mb-6">
              Book your first parking space to see your reservations here
            </p>
            <Link
              href="/map"
              className="inline-flex bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
            >
              Find Parking
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
