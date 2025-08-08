//my-listings/page.tsx
"use client";

import { useAPI } from "../context/useAPI"; 
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export interface Listing {
  space_id: string;
  owner_email?: string;
  owner_id?: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  price_per_hour: string;
  price_per_day: string | null;
  is_accessible: boolean;
  features: { [key: string]: any };
  images: string[];
  status: "active" | "unlisted" | "pending" | "banned";
  rules: string | null;
  created_at: string;
  updated_at: string;
  availability_schedule: { [key: string]: any };
}

const fetchUserListings = async (api: {
  get: <T>(url: string) => Promise<{ data: T }>;
}) => {
  const response = await api.get<Listing[]>(`/spaces/`);
  return response.data;
};

export default function MyListingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const api = useAPI();
  const router = useRouter();

  const {
    data: listings,
    isLoading: isLoadingListings,
    error,
    refetch,
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
          <p className="text-slate-600 font-medium">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 bg-red-100 p-6 rounded-xl shadow-lg">
            <p className="text-lg font-semibold mb-4">Error: {error.message}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userListings = listings || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              My Listings
            </h1>
            <p className="text-slate-600">
              Manage your parking spaces and track earnings
            </p>
          </div>
          <Link
            href="/list"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
          >
            + Add New Space
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Listings</p>
                <p className="text-2xl font-bold text-slate-900">
                  {userListings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {userListings.length > 0 ? (
            userListings.map((listing) => (
              <div
                key={listing.space_id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {listing.address}
                          </h3>
                          <p className="text-slate-600 mb-2">
                            {listing.description}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold text-emerald-600">
                              ${listing.price_per_hour}/hour
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                listing.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {listing.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Link
                            href={`/edit-listing/${listing.space_id}`}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteListing(listing.space_id)
                            }
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <p className="text-sm text-slate-600">
                            Total Bookings
                          </p>
                          <p className="text-lg font-semibold text-slate-900">
                            N/A
                          </p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <p className="text-sm text-slate-600">
                            Total Earnings
                          </p>
                          <p className="text-lg font-semibold text-slate-900">
                            N/A
                          </p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                          <p className="text-sm text-slate-600">Rating</p>
                          <p className="text-lg font-semibold text-slate-900">
                            ⭐ N/A
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-12">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No listings yet
              </h3>
              <p className="text-slate-600 mb-6">
                Start earning money by listing your first parking space
              </p>
              <Link
                href="/list"
                className="inline-flex bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
              >
                List Your First Space
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  async function handleDeleteListing(spaceId: string) {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await api.delete(`/spaces/${spaceId}/`);
      refetch();
      alert("Listing deleted successfully!");
    } catch (err: any) {
      alert("Failed to delete listing. Please try again.");
      if (err?.response && err.response.status === 401) {
        router.push("/login");
      } else if (err?.response && err.response.status === 403) {
        alert("You don't have permission to delete this listing.");
      }
    }
  }
}
