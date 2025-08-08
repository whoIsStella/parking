"use client";
import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

import Link from "next/link";

import { useAPI } from "../context/useAPI";

import { ServiceRequest } from "../service-requests/page";


export default function RoadsideAssistancePage() {
  const { user, isLoading } = useAuth();

  const { post, api } = useAPI();

  const router = useRouter();

  const [formData, setFormData] = useState({
    serviceType: "roadside",

    location: "",

    vehicleInfo: "",

    description: "",

    urgency: "normal",

    contactNumber: "",

    preferredProvider: "aaa",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [userBookings, setUserBookings] = useState<any[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!isLoading && user) {
      api.get(`/bookings/?renter=${user.user_id}`).then((res) => {
        setUserBookings(res.data);
      });
    }
  }, [user, isLoading, api]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>

          <p className="text-slate-600 font-medium">
            Loading roadside assistance...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const serviceTypes = [
    {
      value: "roadside",

      label: "Roadside Assistance",

      icon: "🚗",

      description: "Battery jump, flat tire, lockout, towing",

      estimatedTime: "30-60 min",
    },
    {
      value: "unlock",

      label: "Vehicle Unlock",

      icon: "🔓",

      description: "Car lockout service",

      estimatedTime: "20-45 min",
    },
    {
      value: "other",

      label: "Other Services",

      icon: "🛠️",

      description: "Fuel delivery, winching, emergency repair",

      estimatedTime: "45-90 min",
    },
  ];

  const providers = [
    {
      value: "aaa",
      label: "AAA (American Automobile Association)",
      phone: "1-800-AAA-HELP",
    },

    {
      value: "geico",
      label: "GEICO Emergency Road Service",
      phone: "1-800-424-3426",
    },

    {
      value: "allstate",
      label: "Allstate Motor Club",
      phone: "1-800-347-8880",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    setSubmissionStatus("idle");

    try {
      const serviceRequestData: ServiceRequest = {
        service_type: formData.serviceType as "roadside" | "unlock" | "other",

        location: formData.location,

        vehicle_info: formData.vehicleInfo,
        description: formData.description,

        urgency: formData.urgency as "low" | "normal" | "high",

        preferred_provider: formData.preferredProvider,

        notes: `Service requested via ParkSpace app. Preferred provider: ${formData.preferredProvider}`,
        request_id: "",
        created_at: "",
        resolved_at: null,
        status: ""
      };

      if (
        selectedBooking &&
        selectedBooking.trim() !== "" &&
        selectedBooking.length > 10
      ) {
        serviceRequestData.booking = selectedBooking;
      }

      const response = await post("/service-requests/", serviceRequestData);

      console.log("Service request created:", response);

      setSubmissionStatus("success");

      setTimeout(() => {
        router.push("/service-requests");
      }, 2000);
    } catch (error) {
      console.error("Error submitting service request:", error);

      setSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedServiceType = serviceTypes.find(
    (s) => s.value === formData.serviceType,
  );

  const selectedProvider = providers.find(
    (p) => p.value === formData.preferredProvider,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
            Roadside Assistance
          </h1>

          <p className="text-lg md:text-xl text-slate-600 font-medium">
            Get help with your vehicle when you need it most
          </p>
        </div>

        {/* Service Request Form */}

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 md:px-8 py-6 border-b border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Request Service
            </h2>

            <p className="text-slate-600 mt-1">
              Fill out the form below to request roadside assistance
            </p>
          </div>

          <div className="p-6 md:p-8">
            {submissionStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      ✅ Service Request Submitted Successfully!
                    </h3>

                    <p className="text-sm text-green-700 mt-1">
                      Redirecting you to view your request.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submissionStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      ❌ Submission Failed
                    </h3>

                    <p className="text-sm text-red-700 mt-1">
                      Please check your connection and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Type Selection */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-6">
                  What type of service do you need?
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.serviceType === "roadside"
                        ? "border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, serviceType: "roadside" })
                    }
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Roadside Assistance
                        </h3>

                        <p className="text-sm text-slate-600">
                          Vehicle breakdown, flat tire, etc.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.serviceType === "unlock"
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, serviceType: "unlock" })
                    }
                  >
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Vehicle Unlock
                        </h3>

                        <p className="text-sm text-slate-600">
                          Locked out of your vehicle
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Booking */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Related Parking Booking (Optional){/* FIX THIS: IT MUST CONNECT TO THE USER'S BOOKINGS */}
                </label>

                <select
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                >
                  <option value="">Select a booking (optional)</option>

                  {userBookings.map((booking) => (
                    <option key={booking.booking_id} value={booking.booking_id}>
                      {booking.space?.name || booking.spaceName || "Parking Space"} - {booking.start_time?.slice(0,10)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Current Location
                </label>

                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter your exact location or address"
                  className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                />
              </div>

              {/* Vehicle Information */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Vehicle Information
                </label>

                <input
                  type="text"
                  required
                  value={formData.vehicleInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleInfo: e.target.value })
                  }
                  placeholder="e.g., 2021 Honda Civic, Blue, License: QKE133"
                  className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                />
              </div>

              {/* Contact Number */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Contact Number
                </label>

                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  placeholder="Your phone number for the service provider"
                  className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                />
              </div>

              {/* Description */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Describe the Problem
                </label>

                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Please describe what happened and what help you need..."
                  rows={4}
                  className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium resize-none"
                />
              </div>

              {/* Urgency */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Urgency Level
                </label>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      value: "low",
                      label: "Low",
                      color: "bg-green-50 border-green-200 text-green-800",
                    },

                    {
                      value: "normal",
                      label: "Normal",
                      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
                    },

                    {
                      value: "high",
                      label: "High",
                      color: "bg-red-50 border-red-200 text-red-800",
                    },
                  ].map((urgency) => (
                    <div key={urgency.value} className="relative">
                      <input
                        type="radio"
                        id={urgency.value}
                        name="urgency"
                        value={urgency.value}
                        checked={formData.urgency === urgency.value}
                        onChange={(e) =>
                          setFormData({ ...formData, urgency: e.target.value })
                        }
                        className="sr-only peer"
                      />

                      <label
                        htmlFor={urgency.value}
                        className={`block p-4 border-2 rounded-2xl cursor-pointer text-center font-semibold transition-all duration-200 hover:shadow-md ${urgency.color} ${
                          formData.urgency === urgency.value
                            ? "ring-2 ring-blue-500"
                            : ""
                        }`}
                      >
                        {urgency.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Selection */}

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Preferred Service Provider
                </label>

                <div className="space-y-3">
                  {providers.map((provider) => (
                    <div key={provider.value} className="relative">
                      <input
                        type="radio"
                        id={provider.value}
                        name="preferredProvider"
                        value={provider.value}
                        checked={formData.preferredProvider === provider.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferredProvider: e.target.value,
                          })
                        }
                        className="sr-only peer"
                      />

                      <label
                        htmlFor={provider.value}
                        className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-2xl cursor-pointer hover:border-blue-300 peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all duration-200"
                      >
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {provider.label}
                          </h4>

                          <p className="text-sm text-slate-600">
                            {provider.phone}
                          </p>
                        </div>

                        <a
                          href={`tel:${provider.phone}`}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Call Now
                        </a>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}

              <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                <Link
                  href="/bookings"
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors font-medium"
                >
                  ← Back to Bookings
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting Request...
                    </div>
                  ) : (
                    "Request Assistance"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Service Information */}

        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            How It Works
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>

              <h4 className="font-semibold text-slate-900 mb-2">
                Submit Request
              </h4>

              <p className="text-sm text-slate-600">
                Fill out the form with your location and problem details
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>

              <h4 className="font-semibold text-slate-900 mb-2">Get Matched</h4>

              <p className="text-sm text-slate-600">
                We'll connect you with the nearest available service provider
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>

              <h4 className="font-semibold text-slate-900 mb-2">Get Help</h4>

              <p className="text-sm text-slate-600">
                Professional technician arrives to assist you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
