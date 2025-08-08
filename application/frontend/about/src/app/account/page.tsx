//account/page.tsx owner or renter account page
"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useAPI } from "../context/useAPI"; // API connection for making requests
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const { user, isLoading, signup } = useAuth();
  const api = useAPI();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarToggled, setSidebarToggled] = useState(false);

  const [cardFields, setCardFields] = useState({
    cardNumber: "",
    expiry: "",
    ccv: "",
    name: "",
  });
  const [paymentMessage, setPaymentMessage] = useState(""); //FIX SAVE PAYMENT METHOD

  // Backend-fetched state
  const [bookings, setBookings] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: (user as any)?.phone_number || "",
    bio: (user as any)?.bio || "",
    profilePic: null as File | null,
  });

  const [isEditing, setIsEditing] = useState(false);

  // Sidebar click outside to close
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (sidebarRef.current) {
        const target = e.target as HTMLElement;
        if (
          !sidebarRef.current.contains(target) &&
          !target.closest(".sidebar-toggle")
        ) {
          setSidebarToggled(false);
        }
      }
    }
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Fetch backend data line 58 - 71, api calls for bookings, spaces, and payment methods
  useEffect(() => {
    if (!isLoading && user) {
      setLoadingBackend(true);
      Promise.all([
        api
          .get(`/bookings/?user_id=${user.user_id}`)
          .catch(() => ({ data: [] })),
        user.role === "owner"
          ? api
              .get(`/spaces/?owner_id=${user.user_id}`)
              .catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        api
          .get(`/payment-methods/?user_id=${user.user_id}`)
          .catch(() => ({ data: null })),
      ])
        .then(([bookingsRes, spacesRes, paymentRes]) => {
          setBookings(bookingsRes.data || []);
          setSpaces(spacesRes.data || []);
          setPaymentDetails(paymentRes.data);
        })
        .finally(() => setLoadingBackend(false));
    }
  }, [user, isLoading, api]);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (
      user &&
      (!formData.firstName || !formData.lastName || !formData.email)
    ) {
      setFormData({
        ...formData,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: (user as any).phone_number || "",
        bio: (user as any).bio || "",
      });
    }
  }, [user, isLoading]);

  if (isLoading || loadingBackend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const handleSave = async () => {
    if (!user) return;
    try {
      await api.patch(`/users/${user.user_id}/`, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        bio: formData.bio,
      });
      user.first_name = formData.firstName;
      user.last_name = formData.lastName;
      (user as any).phone_number = formData.phone;
      (user as any).bio = formData.bio;
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user profile", error);
    }
  };

  function pseudoToken(
    cardNumber: string,
    expiry: string,
    ccv: string,
    name: string,
  ) {
    return btoa(`${cardNumber}:${expiry}:${ccv}:${name}:${Math.random()}`);
  }

  async function handleSavePaymentMethod(
    e: React.MouseEvent<HTMLButtonElement>,
  ) {
    e.preventDefault();
    setPaymentMessage("");
    const { cardNumber, expiry, ccv, name } = cardFields;

    if (!cardNumber || !expiry || !ccv || !name) {
      setPaymentMessage("Please fill out all payment fields.");
      return;
    }
    if (!/^\d{2}\/\d{4}$/.test(expiry)) {
      setPaymentMessage("Expiration date must be in MM/YYYY format.");
      return;
    }

    const [expMonth, expYear] = expiry.split("/");
    const token = pseudoToken(cardNumber, expiry, ccv, name);
    const last4 = cardNumber.slice(-4);

    try {
      if (!user) {
        setPaymentMessage("You must be logged in to save a payment method.");
        return;
      }
      await api.post("/payment-methods/", {
        card_brand: "Visa",
        last4,
        expiry_month: expMonth,
        expiry_year: expYear,
        name_on_card: name,
        token,
        is_default: true,
      });
      setPaymentMessage("Payment method saved!");
      setSidebarToggled(false);
      setCardFields({ cardNumber: "", expiry: "", ccv: "", name: "" });
      const paymentRes = await api.get(
        `/payment-methods/?user_id=${user.user_id}`,
      );
      setPaymentDetails(paymentRes.data);
    } catch (e) {
      setPaymentMessage("Failed to save payment method");
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Account</h1>
          <p className="text-slate-600">
            Manage your profile and account settings
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white text-2xl font-bold">
                    {user.first_name
                      ? user.first_name[0].toUpperCase()
                      : user.email[0].toUpperCase()}
                  </span>
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">
                {user.first_name || "User"} {user.last_name || ""}
              </h3>
              <p className="text-slate-600">{user.email}</p>
              <div className="mt-4 flex justify-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {user.role === "owner" ? "Space Owner" : "Driver"}
                </span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">
                Account Details
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 py-3">
                      {user.first_name || "Not set"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                  ) : (
                    <p className="text-slate-900 py-3">
                      {user.last_name || "Not set"}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <p className="text-slate-900 py-3">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                ) : (
                  <p className="text-slate-900 py-3">
                    {(user as any).phone_number || "Not set"}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  About Me
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-slate-900 py-3">
                    {formData.bio || "Not set"}
                  </p>
                )}
              </div>
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment method for all */}
        <div className="mt-8 flex justify-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors sidebar-toggle"
            onClick={() => setSidebarToggled(true)}
          >
            {paymentDetails ? "Edit Payment Method" : "Add Payment Method"}
          </button>
        </div>

        {/* Owner extra section: My Spaces */}
        {user.role === "owner" && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                My Parking Spaces
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {spaces.length === 0 && (
                <p className="text-slate-600">No spaces listed yet.</p>
              )}
              {spaces.map((space: any, idx: number) => (
                <div
                  key={space.id || space.space_id || idx}
                  className="p-4 bg-slate-50 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {space.address}
                    </div>
                    <div className="text-slate-600 text-sm">{space.status}</div>
                  </div>
                  <a
                    href={`/spaces/${space.id || space.space_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Section for all users */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              My Bookings
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {bookings.length === 0 && (
              <p className="text-slate-600">No bookings yet.</p>
            )}
            {bookings.map((booking: any, idx: number) => (
              <div
                key={booking.id || booking.booking_id || idx}
                className="p-4 bg-slate-50 rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {booking.space_name}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {booking.date} {booking.time}
                  </div>
                  <div className="text-slate-600 text-sm">{booking.status}</div>
                </div>
                <a
                  href={`/bookings/${booking.id || booking.booking_id}`}
                  className="text-blue-600 hover:underline"
                >
                  Manage
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Payment method sidebar */}
        <aside
          ref={sidebarRef}
          className={`sidebar ${sidebarToggled ? "visible" : ""}`}
        >
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Enter Payment Information
            </h2>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Credit Card Number
            </label>
            <input
              type="text"
              placeholder="123456789"
              value={cardFields.cardNumber}
              onChange={(e) =>
                setCardFields({ ...cardFields, cardNumber: e.target.value })
              }
              className="sidebar w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Expiration Date
            </label>
            <input
              type="text"
              placeholder="01/2028"
              value={cardFields.expiry}
              onChange={(e) =>
                setCardFields({ ...cardFields, expiry: e.target.value })
              }
              className="sidebar w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              CCV
            </label>
            <input
              type="text"
              placeholder="123"
              value={cardFields.ccv}
              onChange={(e) =>
                setCardFields({ ...cardFields, ccv: e.target.value })
              }
              className="sidebar w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Name on Card
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardFields.name}
              onChange={(e) =>
                setCardFields({ ...cardFields, name: e.target.value })
              }
              className="sidebar w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleSavePaymentMethod}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Save Payment Method
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
