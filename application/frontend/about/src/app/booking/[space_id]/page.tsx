"use client";
// This file handles the booking process for a specific parking space
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAPI } from "../../context/useAPI"; // API connection for making requests
import { useAuth } from "../../context/AuthContext";

export default function BookingPage() {
  const router = useRouter();
  const api = useAPI();
  const { user, isLoading } = useAuth();
  const { space_id } = useParams();
  const spaceId = space_id;

  const [space, setSpace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false); 

  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");

  useEffect(() => {
    if (!isLoading && !user) router.push("/login"); // Redirect to login if user is not authenticated
    async function fetchSpace() {
      setLoading(true);
      try {
        const res = await api.get(`/spaces/${spaceId}/`); // API connection for fetching a specific parking space
        setSpace(res.data);
      } catch (e) {
        setError("Failed to load parking space.");
      }
      setLoading(false);
    }
    if (spaceId && user) fetchSpace();
  }, [spaceId, user, isLoading, router, api]);

  async function handleBook() {
    setSubmitting(true);
    setError("");
    try {
      const start_time = `${date}T${startTime}:00`;
      const end_time = `${date}T${endTime}:00`;

      const startDate = new Date(start_time);

      const endDate = new Date(end_time);

      const diffMs = endDate.getTime() - startDate.getTime();

      const hours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

      const amount_total = (Number(space.price_per_hour) * hours).toFixed(2);

      const bookingRes = await api.post("/bookings/", {
        space: spaceId,
        start_time,
        end_time,
        amount_total,
        status: "active",
      });

      const bookingId = bookingRes.data?.booking_id;

      // await api.post("/payments/", {
      //   // API connection for creating a payment
      //   booking: bookingId,
      // });

      setShowConfirmation(true); 
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ||
          JSON.stringify(e?.response?.data) ||
          "Booking failed.",
      );
    }
    setSubmitting(false);
  }

  if (loading || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading booking info...
      </div>
    );
  if (!space)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {error || "No space found."}
      </div>
    );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-16 relative">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-3">
            Book Parking Space
          </h1>
          <p className="text-slate-700 text-lg mb-2">{space.address}</p>
          <span className="text-sm font-medium text-blue-700 bg-blue-50/70 px-4 py-1 rounded-full">
            ${space.price_per_hour}/hour
          </span>
        </div>
        <div className="glass bg-white/80 rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleBook();
            }}
          >
            <div className="mb-5">
              <label className="block font-medium mb-2 text-slate-800">
                Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="mb-5 flex gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-2 text-slate-800">
                  Start Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-2 text-slate-800">
                  End Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <div className="font-semibold text-slate-700">
                Total:{" "}
                <span className="text-lg">
                  $
                  {(() => {
                    const start_time = `${date}T${startTime}:00`;

                    const end_time = `${date}T${endTime}:00`;

                    const startDate = new Date(start_time);

                    const endDate = new Date(end_time);

                    const diffMs = endDate.getTime() - startDate.getTime();

                    const hours = Math.max(
                      1,
                      Math.round(diffMs / (1000 * 60 * 60)),
                    );

                    return (Number(space.price_per_hour) * hours).toFixed(2);
                  })()}
                </span>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-purple-700 transition-all text-lg disabled:opacity-50"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Booking...
                </div>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Booking Confirmation Sidebar */}
      {showConfirmation && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-green-300 shadow-2xl animate-slide-in z-50 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-green-700 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-slate-700 mb-6">
              Your booking has been created! You can add a payment method and
              complete payment from your bookings page.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/bookings")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition"
            >
              View Bookings
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-3 px-4 rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
