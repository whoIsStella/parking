//MapContent.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { GoogleMap, MarkerF, StandaloneSearchBox } from "@react-google-maps/api";
import { useAPI } from "../context/useAPI"; 
import { useAuth } from "../context/AuthContext";
import { useGoogleMaps } from "../context/GoogleMapsProvider"; 

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 37.7749, // SF latitude
  lng: -122.4194, // SF longitude
};

const libraries: ("places")[] = ["places"];

export default function MapContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();

  const { user } = useAuth();
  const api = useAPI();

  const { isLoaded, loadError } = useGoogleMaps();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasValidApiKey = apiKey && apiKey.startsWith("AIza");

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
    }),
    [],
  );

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchboxRef = useRef<google.maps.places.SearchBox | null>(null);

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  

  const [parkingSpaces, setParkingSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSpaces() {
      try {
        setLoading(true);
        const res = await api.get(`/spaces/`); // API connection for fetching parking spaces
        const normalized = res.data.map((space: any) => ({
          ...space,
          lat: parseFloat(space.lat), 
          lng: parseFloat(space.lng), 
          features: Array.isArray(space.features)
            ? space.features
            : typeof space.features === "string" && space.features
            ? space.features.split(",").map((f: string) => f.trim())
            : [],
        }));
        setParkingSpaces(normalized);
      } catch (err: any) {
        setFetchError(
          err?.response?.data?.detail || "Could not load parking spaces",
        );
      } finally {
        setLoading(false);
      }
    }
    fetchSpaces();
  }, [api]);

  const filteredParkingSpaces = useMemo(() => {
    return parkingSpaces.filter((space) => {
      if (
        searchQuery &&
        !space.address?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      switch (selectedFilter) {
        case "available":
          return space.status === "active";
        case "ev":
          return (
            Array.isArray(space.features) &&
            space.features.includes("EV Charging")
          );
        case "covered":
          return (
            Array.isArray(space.features) && space.features.includes("Covered")
          );
        case "accessible":
          return space.is_accessible === true;
        case "all":
        default:
          return true; 
      }
    });
  }, [parkingSpaces, selectedFilter, searchQuery]);

  const mapMarkers = useMemo(() => {
    return filteredParkingSpaces.filter(
      (space) => !isNaN(space.lat) && !isNaN(space.lng),
    );
  }, [filteredParkingSpaces]);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const handlePlaceChanged = () => {
    const places = searchboxRef.current?.getPlaces();
    if (places && places.length > 0) {
      const place = places [0];
      const location = place.geometry?.location;
      if (location) {
        const lat = location.lat();
        const lng = location.lng();
        setMapCenter({ lat, lng});
        setMapZoom(15);
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng});
          mapRef.current.setZoom(15);
        }
        setSearchQuery(place.formatted_address || "");
      }
    }
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Maps Loading Error
          </h3>
          <p className="text-slate-600">
            There was an error loading Google Maps. Please check your API key and
            network connection.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  const shouldShowMap = hasValidApiKey && !loadError;

  function handleBookNow(space: any): void {
    router.push(`/booking/${space.space_id}`); // API connection for booking a space
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <StandaloneSearchBox
                  onLoad={(ref) => (searchboxRef.current = ref)}
                  onPlacesChanged={handlePlaceChanged}
                >
                <input
                  type="text"
                  placeholder={
                    user
                      ? "Search parking locations, addresses..."
                      : "Search parking locations"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                </StandaloneSearchBox>
              </div>
            </div>
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 font-medium transition-all duration-200 flex items-center space-x-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              <span>Filters</span>
            </button>
          </div>
          {/* Filters Row */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2 animate-slide-up">
              {["all", "available", "ev", "covered", "accessible"].map(
                (filterId) => (
                  <button
                    key={filterId}
                    onClick={() => setSelectedFilter(filterId)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      selectedFilter === filterId
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {filterId === "all"
                      ? "All Spaces"
                      : filterId === "available"
                        ? "Available Now"
                        : filterId === "ev"
                          ? "EV Charging"
                          : filterId === "covered"
                            ? "Covered"
                            : "Accessible"}{" "}
                    (
                    {
                      parkingSpaces.filter((space) => {
                        if (filterId === "all") return true;
                        if (filterId === "available")
                          return space.status === "active";
                        if (filterId === "ev")
                          return (
                            Array.isArray(space.features) &&
                            space.features.includes("EV Charging")
                          );
                        if (filterId === "covered")
                          return (
                            Array.isArray(space.features) &&
                            space.features.includes("Covered")
                          );
                        if (filterId === "accessible")
                          return space.is_accessible;
                        return false;
                      }).length
                    }
                    )
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="h-96 lg:h-[600px] relative">
                {shouldShowMap ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={mapZoom}
                    options={mapOptions}
                    onLoad={onMapLoad}
                  >
                    {/* Render Markers for parking spaces from the clean list */}
                    {mapMarkers.map((space, index) => (
                      <MarkerF
                        key={space.id || `marker-${index}`} 
                        position={{ lat: space.lat, lng: space.lng }}
                        title={space.address}
                        onClick={() => {
                          console.log("Marker clicked:", space.address);
                          if (mapRef.current) {
                            mapRef.current.panTo({
                              lat: space.lat,
                              lng: space.lng,
                            });
                          }
                        }}
                      />
                    ))}
                  </GoogleMap>
                ) : (
                  <div className="h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center p-8">
                      {loadError ? (
                        <>
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-red-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Maps Loading Error
                          </h3>
                          <p className="text-slate-600 mb-4">
                            There was an error loading Google Maps. Please check
                            your API key and network connection.
                          </p>
                          <p className="text-xs text-slate-500 mt-4">
                            Browse parking spaces in the list on the right →
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-yellow-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Google Maps Setup Required
                          </h3>
                          <p className="text-slate-600 mb-4">
                            To use the map feature, you need to configure a
                            Google Maps API key.
                          </p>
                          <div className="bg-white rounded-lg p-4 text-left border border-slate-200">
                            <p className="text-sm text-slate-700 mb-2">
                              <strong>Steps:</strong>
                            </p>
                            <ol className="text-sm text-slate-600 space-y-1">
                              <li>1. Get API key from Google Cloud Console</li>
                              <li>2. Enable Maps JavaScript API</li>
                              <li>3. Add key to .env.local file</li>
                            </ol>
                          </div>
                          <p className="text-xs text-slate-500 mt-4">
                            Browse parking spaces in the list on the right →
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Parking Spaces List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Nearby Parking
              </h2>
              <span className="text-sm text-slate-500">
                {filteredParkingSpaces.length} spaces found
              </span>
            </div>
            {filteredParkingSpaces.map((space, index) => (
              <div
                key={space.id || `space-${index}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 animate-scale-in"
                style={
                  { animationDelay: `${index * 0.1}s` } as React.CSSProperties
                }
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {space.address}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {space.distance || ""} away
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {space.price}
                    </p>
                    <div className="flex items-center text-sm text-slate-500">
                      <svg
                        className="w-4 h-4 text-yellow-400 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {space.rating}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(space.features) &&
                    space.features.map((feature: string, fIdx: number) => (
                      <span
                        key={`${space.id}-${feature}-${fIdx}`}
                        className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                </div>
                <button
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                    space.status === "active"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-slate-200 text-slate-500 cursor-not-allowed"
                  }`}
                  disabled={space.status !== "active"}
                  onClick={() => handleBookNow(space)}
                >
                  {space.status === "active" ? "Book Now" : "Not Available"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}