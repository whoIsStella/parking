"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const suggestions = [
    { text: "Home", type: "page", icon: "🏠", route: "/" },
    { text: "List Your Space", type: "page", icon: "📝", route: "/list" },
    { text: "Find Parking", type: "page", icon: "🅿️", route: "/map" },
    { text: "My Account", type: "page", icon: "👤", route: "/account" },
    { text: "My Bookings", type: "page", icon: "📅", route: "/bookings" },
    { text: "My Listings", type: "page", icon: "🏢", route: "/my-listings" },
    { text: "Support Center", type: "page", icon: "🛠️", route: "/support" },
    { text: "Privacy Policy", type: "page", icon: "🔒", route: "/privacy" },

    {
      text: "Roadside Assistance",
      type: "page",
      icon: "🚗",
      route: "/roadside-assistance",
    },
    {
      text: "Service Requests",
      type: "page",
      icon: "🔧",
      route: "/service-requests",
    },

    {
      text: "Support Tickets",
      type: "page",
      icon: "🎫",
      route: "/support-tickets",
    },

    { text: "About", type: "page", icon: "ℹ️", route: "/about" },

    {
      text: "San Francisco",
      type: "location",
      icon: "📍",
      route: "/map?search=San Francisco",
    },
    {
      text: "Los Angeles",
      type: "location",
      icon: "📍",
      route: "/map?search=Los Angeles",
    },
    {
      text: "New York",
      type: "location",
      icon: "📍",
      route: "/map?search=New York",
    },
    {
      text: "Chicago",
      type: "location",
      icon: "📍",
      route: "/map?search=Chicago",
    },
  ];

  const filteredSuggestions = suggestions
    .filter(
      (s) =>
        debouncedSearchQuery.length > 1 &&
        s.text.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    )
    .slice(0, 6);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex(
          (prev) =>
            (prev - 1 + filteredSuggestions.length) %
            filteredSuggestions.length,
        );
      } else if (e.key === "Enter") {
        if (highlightedIndex > -1) {
          e.preventDefault();
          handleSuggestionClick(filteredSuggestions[highlightedIndex].route);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const pageRoutes: Record<string, string> = {
        home: "/",
        list: "/list",
        "list space": "/list",
        "list my space": "/list",
        about: "/about",
        login: "/login",
        signup: "/signup",
        "sign up": "/signup",

        bookings: "/bookings",
        "my bookings": "/bookings",
        booking: "/bookings",

        map: "/map",
        "find parking": "/map",
        parking: "/map",

        roadside: "/roadside-assistance",
        "roadside service": "/roadside-assistance",
        assistance: "/roadside-assistance",

        "service requests": "/service-requests",
        requests: "/service-requests",

        "support tickets": "/support-tickets",
        tickets: "/support-tickets",
        support: "/support-tickets",
      };

      if (pageRoutes[query]) {
        router.push(pageRoutes[query]);
      } else {
        router.push(`/map?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (route: string) => {
    router.push(route);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              ParkSpace
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div
            className="hidden md:flex flex-1 max-w-md mx-4"
            ref={searchContainerRef}
          >
            {" "}
            {/* Add ref here */}
            <form onSubmit={handleSearchSubmit} className="w-full">
              {" "}
              {/* Renamed handler */}
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
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={
                    user
                      ? "Search addresses, locations, or pages..."
                      : "Search locations"
                  }
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 hover:bg-slate-50"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 text-slate-400 hover:text-slate-600"
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
                  </button>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-slate-200/50 overflow-hidden animate-fade-in">
                    {/* Header */}
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200/50">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Quick Access
                      </p>
                    </div>
                    {/* Suggestions */}
                    <div className="max-h-80 overflow-y-auto">
                      {filteredSuggestions.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSuggestionClick(sug.route)}
                          onMouseOver={() => setHighlightedIndex(i)}
                          className={`w-full flex items-center px-4 py-3 transition-all duration-200 group ${
                            i === highlightedIndex
                              ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50"
                              : "hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50"
                          }`}
                        >
                          <span className="text-lg mr-3 group-hover:scale-110 transition-transform">
                            {sug.icon}
                          </span>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {sug.text}
                            </p>
                            <p className="text-xs text-slate-500 capitalize">
                              {sug.type}
                            </p>
                          </div>
                          <svg
                            className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {/* Footer */}
                    <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-200/50">
                      <p className="text-xs text-slate-500 text-center">
                        Press Enter to search or click to navigate
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium"
            >
              Find Parking
            </Link>
            <Link
              href="/list"
              className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium"
            >
              List Space
            </Link>
            <Link
              href="/roadside-assistance"
              className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium"
            >
              Roadside Service
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-200 font-medium"
            >
              About
            </Link>
          </nav>

          {/* Auth Buttons / User - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.first_name
                        ? user.first_name[0].toUpperCase()
                        : user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-700 font-medium">
                    {user.first_name || user.email.split("@")[0]}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Account Dropdown */}
                <div className="absolute right-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="bg-white/95 backdrop-blur-lg shadow-xl rounded-2xl border border-slate-200">
                    <div className="p-4 border-b border-slate-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.first_name
                              ? user.first_name[0].toUpperCase()
                              : user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {user.first_name || "User"} {user.last_name || ""}
                          </div>
                          <div className="text-sm text-slate-600">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/account"
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Account
                      </Link>
                      <Link
                        href="/my-listings"
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
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
                        My Listings
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        My Bookings
                      </Link>

                      <Link
                        href="/roadside-assistance"
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
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
                        Roadside Service
                      </Link>

                      <Link
                        href="/service-requests"
                        className="flex items-center px-3 py-2 text-slate-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Service Requests
                      </Link>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}

        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 mt-2 pt-4 pb-4">
            {/* Mobile Search */}

            <form onSubmit={handleSearchSubmit} className="mb-4">
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
                <input
                  type="text"
                  placeholder={
                    user ? "Search addresses, locations..." : "Search locations"
                  }
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  autoComplete="off"
                />
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="space-y-2">
              <Link
                href="/"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/map"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Parking
              </Link>
              <Link
                href="/list"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                List Your Space
              </Link>
              <Link
                href="/roadside-assistance"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Roadside Service
              </Link>

              <Link
                href="/service-requests"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Service Requests
              </Link>

              <Link
                href="/support-tickets"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Support Tickets
              </Link>

              <Link
                href="/about"
                className="block px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>

              <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
                {!user ? (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-slate-700 hover:text-blue-600 transition-colors font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium text-center shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-slate-700 hover:text-red-600 transition-colors font-medium"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
