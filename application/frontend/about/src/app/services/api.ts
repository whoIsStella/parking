const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface SupportTicket {
  ticket_id: string;

  user_email: string;

  subject: string;

  description: string;

  status: "open" | "in_progress" | "resolved" | "closed";

  created_at: string;
  resolved_at?: string;
}

export interface CreateSupportTicketData {
  subject: string;

  description: string;
}

// service request connection
export interface ServiceRequest {
  request_id: string;

  booking_id?: string;

  user_id: string;

  service_type: "roadside" | "unlock" | "other";

  status: "pending" | "in_progress" | "resolved" | "canceled";
  created_at: string;

  resolved_at?: string;

  notes?: string;

  location?: string;

  vehicle_info?: string;

  description?: string;

  urgency?: "low" | "normal" | "high";
  contact_number?: string;
  preferred_provider?: string;
}

export interface CreateServiceRequestData {
  booking_id?: string;

  service_type: "roadside" | "unlock" | "other";

  location: string;

  vehicle_info: string;
  description: string;

  urgency: "low" | "normal" | "high";
  contact_number: string;

  preferred_provider: string;
  notes?: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }

  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",

    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const apiCall = async <T>(
  endpoint: string,

  options: RequestInit = {},
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: getAuthHeaders(),

    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);

    throw error;
  }
};

export const serviceRequestAPI = {
  getServiceRequests: async (): Promise<ServiceRequest[]> => {
    return apiCall<ServiceRequest[]>("/service-requests/");
  },

  getServiceRequest: async (id: string): Promise<ServiceRequest> => {
    return apiCall<ServiceRequest>(`/service-requests/${id}/`);
  },

  createServiceRequest: async (
    data: CreateServiceRequestData,
  ): Promise<ServiceRequest> => {
    const backendData = {
      service_type: data.service_type,

      location: data.location,

      vehicle_info: data.vehicle_info,

      description: data.description,

      urgency: data.urgency,

      contact_number: data.contact_number,

      preferred_provider: data.preferred_provider,

      notes:
        data.notes ||
        `Service requested via ParkSpace app. Preferred provider: ${data.preferred_provider}`,

      ...(data.booking_id && { booking_id: data.booking_id }),
    };

    return apiCall<ServiceRequest>("/service-requests/", {
      method: "POST",

      body: JSON.stringify(backendData),
    });
  },

  updateServiceRequest: async (
    id: string,
    data: Partial<ServiceRequest>,
  ): Promise<ServiceRequest> => {
    return apiCall<ServiceRequest>(`/service-requests/${id}/`, {
      method: "PATCH",

      body: JSON.stringify(data),
    });
  },

  cancelServiceRequest: async (id: string): Promise<ServiceRequest> => {
    return apiCall<ServiceRequest>(`/service-requests/${id}/`, {
      method: "PATCH",

      body: JSON.stringify({ status: "canceled" }),
    });
  },

  deleteServiceRequest: async (id: string): Promise<void> => {
    return apiCall<void>(`/service-requests/${id}/`, {
      method: "DELETE",
    });
  },
};

export const supportTicketAPI = {
  getSupportTickets: async (): Promise<SupportTicket[]> => {
    return apiCall<SupportTicket[]>("/support-tickets/");
  },

  getSupportTicket: async (id: string): Promise<SupportTicket> => {
    return apiCall<SupportTicket>(`/support-tickets/${id}/`);
  },

  createSupportTicket: async (
    data: CreateSupportTicketData,
  ): Promise<SupportTicket> => {
    return apiCall<SupportTicket>("/support-tickets/", {
      method: "POST",

      body: JSON.stringify(data),
    });
  },

  updateSupportTicket: async (
    id: string,
    data: Partial<SupportTicket>,
  ): Promise<SupportTicket> => {
    return apiCall<SupportTicket>(`/support-tickets/${id}/`, {
      method: "PATCH",

      body: JSON.stringify(data),
    });
  },

  resolveTicket: async (id: string): Promise<SupportTicket> => {
    return apiCall<SupportTicket>(`/support-tickets/${id}/resolve_ticket/`, {
      method: "PATCH",

      body: JSON.stringify({ status: "resolved" }),
    });
  },
};

export const bookingAPI = {
  getUserBookings: async (): Promise<any[]> => {
    return apiCall<any[]>("/bookings/");
  },

  getBooking: async (id: string): Promise<any> => {
    return apiCall<any>(`/bookings/${id}/`);
  },
};

export const mockServiceRequests: ServiceRequest[] = [
  {
    request_id: "SR-2025-001",

    user_id: "user123",

    service_type: "roadside",

    status: "in_progress",

    created_at: "2025-01-15T10:30:00Z",

    resolved_at: undefined,

    location: "456 Market St, San Francisco, CA",
    vehicle_info: "2020 Honda Civic, red, License: Azy123",

    description: "Car battery is dead, need a jump start",
    urgency: "normal",

    contact_number: "(555) 123-4567",
    preferred_provider: "aaa",

    notes: "Technician dispatched, ETA 30 minutes",
  },
  {
    request_id: "SR-2025-002",

    user_id: "user123",

    service_type: "unlock",

    status: "resolved",

    created_at: "2025-01-10T14:15:00Z",

    resolved_at: "2025-01-10T15:00:00Z",

    location: "789 Mission St, San Francisco, CA",
    vehicle_info: "2019 Toyota Camry, Red, License: UER689",

    description: "Locked my keys inside my car",
    urgency: "high",

    contact_number: "(555) 987-6543",

    preferred_provider: "aaa",

    notes: "Service completed successfully. Vehicle unlocked without damage.",
  },
];

export const isDevelopmentMode = process.env.NODE_ENV === "development";

export const useMockData = () => {
  return isDevelopmentMode && !process.env.NEXT_PUBLIC_API_URL;
};

export const enhancedServiceRequestAPI = {
  getServiceRequests: async (): Promise<ServiceRequest[]> => {
    if (useMockData()) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      return mockServiceRequests;
    }

    return serviceRequestAPI.getServiceRequests();
  },

  createServiceRequest: async (
    data: CreateServiceRequestData,
  ): Promise<ServiceRequest> => {
    if (useMockData()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newRequest: ServiceRequest = {
        request_id: `SR-2025-${String(Date.now()).slice(-3)}`,

        user_id: "user123",

        service_type: data.service_type,

        status: "pending",

        created_at: new Date().toISOString(),
        location: data.location,

        vehicle_info: data.vehicle_info,

        description: data.description,

        urgency: data.urgency,

        contact_number: data.contact_number,

        preferred_provider: data.preferred_provider,

        notes: "Request received, finding available technician",

        booking_id: data.booking_id,
      };

      return newRequest;
    }
    return serviceRequestAPI.createServiceRequest(data);
  },

  cancelServiceRequest: async (id: string): Promise<ServiceRequest> => {
    if (useMockData()) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const request = mockServiceRequests.find((r) => r.request_id === id);

      if (request) {
        return { ...request, status: "canceled" };
      }

      throw new Error("Service request not found");
    }

    return serviceRequestAPI.cancelServiceRequest(id);
  },
};

export default {
  serviceRequest: enhancedServiceRequestAPI,

  booking: bookingAPI,

  supportTicket: supportTicketAPI,

  isDevelopmentMode,

  useMockData,
};
