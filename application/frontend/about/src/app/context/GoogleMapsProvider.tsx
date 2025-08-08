"use client";

import React, { createContext, useContext } from "react";
import { useLoadScript } from "@react-google-maps/api";

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(
  undefined,
);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
  }
  return context;
};

const libraries: ("places")[] = ["places"];

export const GoogleMapsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const hasValidApiKey = apiKey && apiKey.startsWith("AIza");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: hasValidApiKey ? apiKey : "",
    libraries,
    preventGoogleFontsLoading: true,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};