"use client";

import Link from "next/link";

import { useRouter } from "next/navigation";

export default function ListingSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Success Animation */}

        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 animate-slide-up">
            🎉 Success!
          </h1>

          <p
            className="text-xl text-slate-600 mb-8 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Your parking space has been listed successfully!
          </p>
        </div>

        {/* Success Details */}

        <div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            What happens next?
          </h2>

          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <span className="text-white text-sm font-bold">1</span>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Review Process</h3>

                <p className="text-slate-600">
                  We'll review your listing within 24 hours to ensure it meets
                  our quality standards.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <span className="text-white text-sm font-bold">2</span>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Go Live</h3>

                <p className="text-slate-600">
                  Once approved, your space will be visible to drivers searching
                  in your area.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Start Earning</h3>

                <p className="text-slate-600">
                  Begin receiving bookings and earning money from your unused
                  parking space!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href="/my-listings"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
          >
            View My Listings
          </Link>

          <Link
            href="/"
            className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 px-8 py-3 rounded-xl hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
