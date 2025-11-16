// User Types
export type UserRole = 'PROVIDER' | 'CONSUMER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

// Service Types
export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  isActive: boolean;
  providerId: string;
  createdAt: string;
  updatedAt: string;
  provider?: User;
  availabilities?: Availability[];
  bookings?: Booking[];
}

export interface CreateServiceDto {
  title: string;
  description: string;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceDto {
  title?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

// Availability Types
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface Availability {
  id: string;
  serviceId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // formato "HH:mm"
  endTime: string;   // formato "HH:mm"
  createdAt: string;
  updatedAt: string;
  service?: Service;
}

export interface CreateAvailabilityDto {
  serviceId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilityDto {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
}

// Booking Types
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  id: string;
  serviceId: string;
  consumerId: string;
  date: string;      // formato "YYYY-MM-DD"
  startTime: string; // formato "HH:mm"
  endTime: string;   // formato "HH:mm"
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  service?: Service;
  consumer?: User;
}

export interface CreateBookingDto {
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateBookingStatusDto {
  status: BookingStatus;
}

// API Error Response
export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}
