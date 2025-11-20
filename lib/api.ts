import axios, { AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginDto,
  RegisterDto,
  User,
  Service,
  CreateServiceDto,
  UpdateServiceDto,
  Availability,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  Booking,
  CreateBookingDto,
  UpdateBookingStatusDto,
  SimpleBooking,
  ApiError,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============= AUTH API =============
export const authAPI = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// ============= SERVICES API =============
export const servicesAPI = {
  getAll: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await api.post<Service>('/services', data);
    return response.data;
  },

  update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
    const response = await api.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

// ============= AVAILABILITIES API =============
export const availabilitiesAPI = {
  getByServiceId: async (serviceId: string): Promise<Availability[]> => {
    const response = await api.get<Availability[]>('/availabilities', {
      params: { serviceId },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Availability> => {
    const response = await api.get<Availability>(`/availabilities/${id}`);
    return response.data;
  },

  create: async (data: CreateAvailabilityDto): Promise<Availability> => {
    const response = await api.post<Availability>('/availabilities', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAvailabilityDto): Promise<Availability> => {
    const response = await api.patch<Availability>(`/availabilities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/availabilities/${id}`);
  },
};

// ============= BOOKINGS API =============
export const bookingsAPI = {
  getAll: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/bookings');
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  getServiceBookings: async (serviceId: string, date?: string): Promise<SimpleBooking[]> => {
    const response = await api.get<SimpleBooking[]>(`/bookings/service/${serviceId}`, {
      params: date ? { date } : {},
    });
    return response.data;
  },

  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await api.post<Booking>('/bookings', data);
    return response.data;
  },

  updateStatus: async (id: string, data: UpdateBookingStatusDto): Promise<Booking> => {
    const response = await api.patch<Booking>(`/bookings/${id}/status`, data);
    return response.data;
  },
};

export default api;
