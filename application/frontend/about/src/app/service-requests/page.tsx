"use client"; 

import { useState, useEffect } from "react";
import { useAuth} from "../context/AuthContext";
import { useAPI, APIContextType } from "../context/useAPI"; 
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Listing } from "../my-listings/page";
import Link from "next/link";

export type ServiceRequest = {
  request_id: string;
  booking?: string;
  created_at: string;
  resolved_at: string | null;
  service_type: string;
  status: string;
  location?: string;
  vehicle_info?: string;
  preferred_provider?: string;
  description?: string;
  urgency?: string;
  notes?: string;
};

export default function ServiceRequestsPage() {
  const router = useRouter();
  const api = useAPI();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { request_id } = useParams();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [spaceId, setSpaceId] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
    async function fetchServiceRequests() {
      setLoading(true);
      try {
        const res = await api.get(`/service-requests/`); 
        setServiceRequests(res.data);
      } catch {
        setServiceRequests([]);
      }
      setLoading(false);
    }
    if (user) fetchServiceRequests();
  }, [user, isAuthLoading, router, api]);

  const {
    data: listings,
    isLoading: isLoadingListings,
    error,
  } = useQuery<Listing[], Error>({
    queryKey: ["myListings", user?.user_id],
    queryFn: () => fetchUserListings(api),
    enabled: !!user && (user.role === "owner" || user.role === "admin"),
    retry: 1,
  });

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login"); 
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading || (isLoadingListings && !listings)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>

          <p className="text-slate-600 font-medium">
            Loading service requests...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "in_progress":
        return "bg-blue-100 text-blue-800";

      case "resolved":
        return "bg-green-100 text-green-800";

      case "canceled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case "roadside":
        return "🚗";

      case "unlock":
        return "🔓";

      case "other":
        return "🛠️";

      default:
        return "❓";
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case "roadside":
        return "Roadside Assistance";

      case "unlock":
        return "Vehicle Unlock";

      case "other":
        return "Other Services";

      default:
        return "Unknown";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "text-green-600";

      case "normal":
        return "text-yellow-600";

      case "high":
        return "text-red-600";

      default:
        return "text-slate-600";
    }
  };
  const filteredRequests = serviceRequests.filter((request) => {
    if (filter === "all") return true;

    return request.status === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",

      month: "short",

      day: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    });
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };
  const handleCancelRequest = async (requestId: string) => {
    if (confirm("Are you sure you want to cancel this service request?")) {
      try {
        await patch(`/service-requests/${requestId}/cancel`);

        setServiceRequests([]);
      } catch (err) {
        console.error("Error canceling request:", err);

        alert("Failed to cancel request. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
            Service Requests
          </h1>

          <p className="text-lg md:text-xl text-slate-600 font-medium">
            Track your roadside assistance requests
          </p>
        </div>

        {/* Quick Actions */}

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/roadside-assistance"
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Service Request
          </Link>

          <button
            onClick={() => handleCall("1-800-AAA-HELP")}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Call Support
          </button>
        </div>

        {/* Filters */}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-slate-200/50">
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-semibold text-slate-800">
              Filter by status:
            </span>

            {[
              { value: "all", label: "All" },

              { value: "pending", label: "Pending" },

              { value: "in_progress", label: "In Progress" },

              { value: "resolved", label: "Resolved" },

              { value: "canceled", label: "Canceled" },
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === filterOption.value
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            {error.message}
          </div>
        )}

        {/* Service Requests List */}

        {!error && filteredRequests.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-slate-200/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Service Requests
            </h3>

            <p className="text-slate-600 mb-6">
              {filter === "all"
                ? "You haven't submitted any service requests yet."
                : `No ${filter} service requests found.`}
            </p>

            <Link
              href="/roadside-assistance"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
            >
              Request Service
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div
                key={request.request_id}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200/50 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6 md:p-8">
                  {/* Request Header */}

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">
                          {getServiceTypeIcon(request.service_type)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {getServiceTypeLabel(request.service_type)}
                        </h3>

                        <p className="text-slate-600">
                          Request ID: {request.request_id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1).replace("_", " ")}
                      </span>

                      <span
                        className={`text-sm font-medium ${getUrgencyColor(request.urgency || "normal")}`}
                      >
                        {(request.urgency || "normal").charAt(0).toUpperCase() +
                          (request.urgency || "normal").slice(1)}{" "}
                        Priority
                      </span>
                    </div>
                  </div>

                  {/* Request Details */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Location
                      </h4>

                      <p className="text-slate-600">
                        {request.location || "Not specified"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Vehicle
                      </h4>

                      <p className="text-slate-600">
                        {request.vehicle_info || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Submitted
                      </h4>

                      <p className="text-slate-600">
                        {formatDate(request.created_at)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Service Provider
                      </h4>

                      <p className="text-slate-600">
                        {request.preferred_provider || "AAA"}
                      </p>
                    </div>
                  </div>

                  {/* Problem Description */}

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">
                      Problem Description
                    </h4>

                    <p className="text-slate-600">{request.description}</p>
                  </div>

                  {request.status === "in_progress" && (
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Service In Progress
                      </h4>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            Technician Assigned
                          </p>

                          <p className="text-sm text-slate-600">
                            Contact provider for technician details
                          </p>

                          <p className="text-sm text-blue-600 font-medium">
                            Status: Service in progress
                          </p>
                        </div>
                        <button
                          onClick={() => handleCall("1-800-AAA-HELP")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Call Provider
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status Notes */}

                  {request.notes && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Status Notes
                      </h4>
                      <p className="text-slate-600">{request.notes}</p>
                    </div>
                  )}

                  {/* Resolution */}

                  {request.status === "resolved" && request.resolved_at && (
                    <div className="bg-green-50 rounded-2xl p-4 mb-6">
                      <h4 className="text-sm font-semibold text-slate-800 mb-2">
                        Service Completed
                      </h4>

                      <p className="text-slate-600 mb-2">
                        Resolved on: {formatDate(request.resolved_at)}
                      </p>

                      <p className="text-green-700 font-medium">
                        ✓ Service completed successfully
                      </p>
                    </div>
                  )}

                  {/* Actions */}

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleCall("1-800-AAA-HELP")}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Call Provider
                    </button>

                    {request.status === "pending" && (
                      <button
                        onClick={() => handleCancelRequest(request.request_id)}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel Request
                      </button>
                    )}

                    <Link
                      href={`/roadside-assistance?duplicate=${request.request_id}`}
                      className="flex items-center justify-center px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Similar Request
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}

        <div className="mt-12 bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200/50">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Need Help?</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Roadside Support
              </h4>

              <p className="text-slate-600 mb-3">
                For roadside assistance and support questions.
              </p>

              <button
                onClick={() => handleCall("1-800-AAA-HELP")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Call Support
              </button>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">
                Contact Information
              </h4>

              <p className="text-slate-600 mb-3">
                Need to update your request? Contact our customer service.
              </p>

              <button
                onClick={() => handleCall("1-800-424-3426")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Customer Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
function fetchUserListings(api: APIContextType): Listing[] | Promise<Listing[]> {
  throw new Error("Function not implemented.");
}

function patch(arg0: string) {
  throw new Error("Function not implemented.");
}
}
