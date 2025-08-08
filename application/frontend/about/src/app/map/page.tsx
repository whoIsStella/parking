"use client";

import { Suspense } from "react";
import MapContent from "./MapContent";

const LoadingFallback = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700 text-xl">
      Loading map content...
    </div>
  );
};

export default function MapPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MapContent />
    </Suspense>
  );
}
