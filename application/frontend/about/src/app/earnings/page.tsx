// display earnings data.

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAPI } from "../context/useAPI";
import SummaryCard from "../components/SummaryCard";
import EarningsChart from "../components/EarningsChart";

type MonthlyEarning = {
  month: string;
  earnings: number;
};

export default function EarningsPage() {
  const { user, isLoading } = useAuth();
  const api = useAPI();

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [listingCount, setListingCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [earningsData, setEarningsData] = useState<MonthlyEarning[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(true);

  useEffect(() => {
    setTotalEarnings(750);
    setListingCount(1700);
    setAverageRating(4.8);
    setEarningsData([
      { month: "Jan", earnings: 0 },
      { month: "Feb", earnings: 40 },
      { month: "Mar", earnings: 60 },
      { month: "Apr", earnings: 80 },
      { month: "May", earnings: 120 },
      { month: "June", earnings: 160 },
      { month: "July", earnings: 320 },
      { month: "Aug", earnings: 250 },
      { month: "Sept", earnings: 140 },
      { month: "Oct", earnings: 90 },
      { month: "Nov", earnings: 60 },
      { month: "Dec", earnings: 40 },
    ]);
    setLoadingBackend(false);
  }, []);

  // if (isLoading || loadingBackend) {
  // return (
  // <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
  //   <p>Loading earnings...</p>
  // </div>
  // );
  // }

  //if (!user) return null;

  return (
    <div className="min-h-screen bg-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">
          Yearly Earnings Report
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Listings to Date"
            value={listingCount.toString()}
          />
          <SummaryCard
            title="Total Earnings"
            value={`$${totalEarnings.toFixed(2)}`}
          />
          <SummaryCard title="Avg. Rating" value={averageRating.toString()} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Monthly Earnings
          </h2>
          <EarningsChart data={earningsData} />
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
