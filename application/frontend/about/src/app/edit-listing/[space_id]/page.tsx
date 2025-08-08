"use client";
// This file handles the editing of a parking space listing [owner's perspective]
import { useState, useEffect } from "react";
import { useAPI } from "../../context/useAPI"; 
import { useAuth } from "../../context/AuthContext";
import { useRouter, useParams } from "next/navigation";
export default function EditListingPage() {
  const { user, isLoading, accessToken } = useAuth();
  const { get, post, patch } = useAPI();
  const router = useRouter();
  const { space_id } = useParams() as { space_id: string };

  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    spaceType: "driveway",
    price: "",
    description: "",
    rules: "",
    amenities: [] as string[],
    availability: {
      monday: { available: true, start: "09:00", end: "17:00" },
      tuesday: { available: true, start: "09:00", end: "17:00" },
      wednesday: { available: true, start: "09:00", end: "17:00" },
      thursday: { available: true, start: "09:00", end: "17:00" },
      friday: { available: true, start: "09:00", end: "17:00" },
      saturday: { available: true, start: "09:00", end: "17:00" },
      sunday: { available: true, start: "09:00", end: "17:00" },
    },
  });

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingListing, setLoadingListing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !accessToken || !space_id) return;
    setLoadingListing(true);

    get(`/spaces/${space_id}/`) 
      .then((res) => {
        const data = res.data;
        let address = "",
          city = "",
          state = "",
          zipCode = "";
        if (data.address) {
          const addrParts = data.address.split(",");
          address = addrParts[0]?.trim() || "";
          city = addrParts[1]?.trim() || "";
          const stateZip = addrParts[2]?.trim() || "";
          [state, zipCode] = stateZip.split(" ").map((s: string) => s.trim());
        }
        setFormData({
          title: data.features?.space_title || "",
          address,
          city,
          state,
          zipCode,
          spaceType: data.features?.space_type || "driveway",
          price: data.price_per_hour || "",
          description: data.description || "",
          rules: data.rules || "",
          amenities: data.features?.amenities || [],
          availability: data.availability_schedule || formData.availability,
        });
        setExistingPhotos(data.images || []);
      })
      .catch(() => {
        alert("Failed to load listing.");
        router.push("/my-listings"); 
      })
      .finally(() => setLoadingListing(false));
  }, [user, accessToken, space_id]);

  const amenityOptions = [
    "EV Charging",
    "Covered",
    "Security Camera",
    "24/7 Access",
    "Accessible",
    "Well Lit",
    "Gated",
    "Near Public Transit",
    "Valet Service",
    "Car Wash",
    "Reserved Spot",
  ];
  const spaceTypes = [
    { value: "driveway", label: "Driveway" },
    { value: "garage", label: "Garage" },
    { value: "lot", label: "Parking Lot" },
    { value: "street", label: "Street Parking" },
    { value: "covered", label: "Covered Space" },
  ];

  const stepTitles = [
    "Basic Information",
    "Photos",
    "Amenities & Details",
    "Availability",
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles].slice(0, 10));
    }
  };
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };
  const removeExistingPhoto = (index: number) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  };
  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };
  const handleAvailabilityChange = (
    day: string,
    field: string,
    value: boolean | string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day as keyof typeof prev.availability],
          [field]: value,
        },
      },
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleExplicitSubmit = async () => {
    if (currentStep !== 4 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress,
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

      const geoRes = await fetch(geocodeUrl);
      const geoData = await geoRes.json();

      if (!geoData || geoData.status !== "OK" || !geoData.results[0]) {
        alert(
          "Could not verify the address. Please check the address details and try again.",
        );
        setIsSubmitting(false);
        return;
      }
      const { lat, lng } = geoData.results[0].geometry.location;

      const payload = {
        address: fullAddress,
        latitude: lat,
        longitude: lng,
        description: formData.description,
        price_per_hour: formData.price,
        price_per_day: null,
        is_accessible: formData.amenities.includes("Accessible"),
        features: {
          amenities: formData.amenities,
          rules: formData.rules,
          space_type: formData.spaceType,
          space_title: formData.title,
        },
        images: existingPhotos,
        status: "active",
        rules: formData.rules,
        availability_schedule: formData.availability,
      };

      const response = await patch(
        `/spaces/${space_id}/`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.status === 200) {
        router.push("/my-listings"); 
      } else {
        alert("There was a problem updating your listing.");
      }
    } catch (error: any) {
      if (error.response) {
        alert(`API error: ${error.response?.data?.detail || error.message}`);
        console.error(error.response?.data);
      } else {
        alert("Unknown error occurred. See console for details.");
        console.error(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingListing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-spin">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your listing...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
            Edit Your Parking Space
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium">
            Update your space, earn money
          </p>
        </div>
        {/* Step Indicator */}
        <div className="flex justify-center mb-8 md:mb-10">
          <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-slate-200 text-slate-500"
                    } ${step === currentStep ? "scale-110 shadow-xl" : ""}`}
                  >
                    {step}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium transition-colors ${
                      step === currentStep ? "text-blue-600" : "text-slate-500"
                    }`}
                  >
                    Step {step}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-3 rounded-full transition-all duration-300 ${
                      step < currentStep
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 md:px-8 py-6 border-b border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {stepTitles[currentStep - 1]}
            </h2>
            <p className="text-slate-600 mt-1">Step {currentStep} of 4</p>
          </div>
          <div className="p-6 md:p-8">
            {/* Multi-step form - same as your List page, prefilled! */}
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1 */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Space Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Secure Driveway Near Downtown"
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="1224 Main Street"
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-3">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="San Francisco"
                        className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-3">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        placeholder="CA"
                        className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-3">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        placeholder="94102"
                        className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Space Type
                    </label>
                    <select
                      value={formData.spaceType}
                      onChange={(e) =>
                        setFormData({ ...formData, spaceType: e.target.value })
                      }
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                    >
                      {spaceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Price per Hour ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="12"
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
                    />
                  </div>
                </div>
              )}
              {/* Step 2 */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Upload or remove photos of your parking space. So you get
                      more bookings!
                    </p>
                  </div>
                  {/* Existing Photos */}
                  {existingPhotos.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">
                        Existing Photos
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {existingPhotos.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-lg">
                              <img
                                src={url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingPhoto(index)}
                              className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* New Photos */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-4">
                      Upload Photos (Max 10)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center hover:border-blue-400 transition-colors duration-200 bg-gradient-to-br from-slate-50/50 to-blue-50/50">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <svg
                            className="w-10 h-10 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          Click to upload photos
                        </h3>
                        <p className="text-slate-600 mb-2">or drag and drop</p>
                        <p className="text-sm text-slate-500">
                          PNG, JPG, GIF up to 10MB each
                        </p>
                      </label>
                    </div>
                    {photos.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">
                          New Photos ({photos.length}/10)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {photos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <div className="aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-lg">
                                <img
                                  src={URL.createObjectURL(photo)}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center font-bold"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Step 3: Amenities & Details */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-6">
                      Available Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {amenityOptions.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => handleAmenityToggle(amenity)}
                          className={`p-4 rounded-2xl text-sm font-semibold transition-all duration-200 border-2 ${
                            formData.amenities.includes(amenity)
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500 shadow-lg transform scale-105"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your parking space, its location, and any important details..."
                      rows={4}
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-3">
                      Rules & Instructions
                    </label>
                    <textarea
                      value={formData.rules}
                      onChange={(e) =>
                        setFormData({ ...formData, rules: e.target.value })
                      }
                      placeholder="Any specific rules or instructions for renters..."
                      rows={3}
                      className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium resize-none"
                    />
                  </div>
                </div>
              )}
              {/* Step 4: Availability */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <p className="text-slate-600 text-lg leading-relaxed">
                      Set your weekly availability schedule. You can always
                      update this later.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(formData.availability).map(
                      ([day, schedule]) => (
                        <div
                          key={day}
                          className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
                              <div className="w-24">
                                <span className="text-base font-bold text-slate-900 capitalize">
                                  {day}
                                </span>
                              </div>
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={schedule.available}
                                  onChange={(e) =>
                                    handleAvailabilityChange(
                                      day,
                                      "available",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm font-semibold text-slate-700">
                                  Available
                                </span>
                              </label>
                            </div>
                            {schedule.available && (
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-slate-600">
                                  from
                                </span>
                                <input
                                  type="time"
                                  value={schedule.start}
                                  onChange={(e) =>
                                    handleAvailabilityChange(
                                      day,
                                      "start",
                                      e.target.value,
                                    )
                                  }
                                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                                />
                                <span className="text-sm font-medium text-slate-600">
                                  to
                                </span>
                                <input
                                  type="time"
                                  value={schedule.end}
                                  onChange={(e) =>
                                    handleAvailabilityChange(
                                      day,
                                      "end",
                                      e.target.value,
                                    )
                                  }
                                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t border-slate-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8 py-4 border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleExplicitSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
