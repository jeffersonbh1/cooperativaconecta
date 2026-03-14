export type UserRole = 'ADMIN' | 'USER';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  companyId: string;
  phone?: string;
  address?: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalMinutes: number;
}
