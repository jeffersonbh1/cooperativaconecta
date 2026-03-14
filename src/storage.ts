import { format, parseISO, differenceInMinutes } from 'date-fns';
import { User, Company, TimeEntry, UserRole } from './types';

const STORAGE_KEYS = {
  USERS: 'ponto_digital_users',
  COMPANIES: 'ponto_digital_companies',
  ENTRIES: 'ponto_digital_entries',
  CURRENT_USER: 'ponto_digital_current_user'
};

// Initial data if empty
const INITIAL_COMPANIES: Company[] = [
  { id: '1', name: 'BigHub Tech', cnpj: '12.345.678/0001-90' }
];

const INITIAL_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@bighub.com', password: '123', role: 'ADMIN', companyId: '1' },
  { id: '2', name: 'João Silva', email: 'joao@bighub.com', password: '123', role: 'USER', companyId: '1' }
];

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },
  getCompanies: (): Company[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return data ? JSON.parse(data) : INITIAL_COMPANIES;
  },
  saveCompany: (company: Company) => {
    const companies = storage.getCompanies();
    const index = companies.findIndex(c => c.id === company.id);
    if (index >= 0) companies[index] = company;
    else companies.push(company);
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  },
  getEntries: (): TimeEntry[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (!data) return [];
    try {
      const entries = JSON.parse(data) as TimeEntry[];
      // Ensure all dates and times are strings to prevent .split errors
      return entries.map(e => ({
        ...e,
        date: String(e.date || ''),
        startTime: String(e.startTime || '00:00'),
        endTime: String(e.endTime || '00:00')
      }));
    } catch (e) {
      return [];
    }
  },
  saveEntry: (entry: TimeEntry) => {
    const entries = storage.getEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  },
  saveEntries: (newEntries: TimeEntry[]) => {
    const entries = storage.getEntries();
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify([...entries, ...newEntries]));
  },
  deleteEntry: (id: string) => {
    const entries = storage.getEntries().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  }
};

export const safeParseISO = (dateStr: any) => {
  if (dateStr instanceof Date) return dateStr;
  const s = String(dateStr || '');
  try {
    return parseISO(s);
  } catch (e) {
    return new Date();
  }
};

export const calculateDuration = (start: any, end: any) => {
  const startStr = String(start || '00:00');
  const endStr = String(end || '00:00');
  
  if (!startStr.includes(':') || !endStr.includes(':')) return 0;

  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  
  const startDate = new Date(0, 0, 0, startH, startM);
  const endDate = new Date(0, 0, 0, endH, endM);
  
  return differenceInMinutes(endDate, startDate);
};

export const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};
