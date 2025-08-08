import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Navigation from "./components/ui/Navigation";
import { AuthProvider } from "./context/AuthContext";
import { APIProvider } from "./context/useAPI";
import { GoogleMapsProvider } from "./context/GoogleMapsProvider";
import QueryProvider from "./context/QueryProvider"; 

import { ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sfPro = Inter({
  variable: "--font-sf-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ParkSpace - Find & List Parking Spaces",
  description:
    "Connect parking space owners with drivers. Find parking or list your space in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${sfPro.variable} antialiased`}>
        <AuthProvider>
          <APIProvider>
            <QueryProvider> {/* Wrap with QueryProvider */}
              <GoogleMapsProvider>
                <div className="flex flex-col min-h-screen">
                  <Navigation />
                  <main className="flex-grow pt-16">{children}</main>
                </div>
              </GoogleMapsProvider>
            </QueryProvider>
          </APIProvider>
        </AuthProvider>
        <ToastContainer aria-label="notification" />
        <footer className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    ParkSpace
                  </span>
                </div>
                <p className="text-slate-600 max-w-md leading-relaxed">
                  We're a passionate group committed to building a platform that
                  connects parking space owners with drivers, making city
                  parking easier and more accessible.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Platform</h3>
                <ul className="space-y-3 text-slate-600">
                  <li>
                    <a
                      href="/map"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      Find Parking
                    </a>
                  </li>
                  <li>
                    <a
                      href="/list"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      List Your Space
                    </a>
                  </li>
                  <li>
                    {/* <a
                      href="/pricing"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      Pricing
                    </a> */}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
                <ul className="space-y-3 text-slate-600">
                  <li>
                    <a
                      href="/about"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a //link to service request
                      href="/support"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      Support
                    </a>
                  </li>
                  <li>
                    <a
                      href="/privacy"
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-12 pt-8 text-center text-slate-500">
              <p>&copy; 2025 ParkSpace. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
