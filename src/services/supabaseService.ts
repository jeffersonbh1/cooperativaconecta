import { supabase } from '../lib/supabase';
import { User, Company, TimeEntry } from '../types';

export const supabaseService = {
  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    if (error) throw error;
    return data || [];
  },
  saveCompany: async (company: Company): Promise<void> => {
    const payload: any = {
      name: company.name,
      cnpj: company.cnpj,
      address: company.address,
      neighborhood: company.neighborhood,
      city: company.city,
      state: company.state
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (company.id && uuidRegex.test(company.id)) {
      payload.id = company.id;
    }

    const { error } = await supabase
      .from('companies')
      .upsert(payload);
    if (error) {
      console.error('Supabase saveCompany error:', error);
      throw error;
    }
  },
  deleteCompany: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  checkCNPJExists: async (cnpj: string, excludeId?: string): Promise<boolean> => {
    let query = supabase
      .from('companies')
      .select('id')
      .eq('cnpj', cnpj);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data && data.length > 0);
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return (data || []).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      companyId: u.company_id,
      phone: u.phone,
      address: u.address
    }));
  },
  saveUser: async (user: User): Promise<void> => {
    const payload: any = {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      company_id: user.companyId,
      phone: user.phone,
      address: user.address
    };

    // Only include ID if it's a valid UUID (likely from an existing record)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (user.id && uuidRegex.test(user.id)) {
      payload.id = user.id;
    }

    const { error } = await supabase
      .from('users')
      .upsert(payload);
    if (error) {
      console.error('Supabase saveUser error:', error);
      throw error;
    }
  },
  deleteUser: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
  checkEmailExists: async (email: string, excludeId?: string): Promise<boolean> => {
    let query = supabase
      .from('users')
      .select('id')
      .eq('email', email);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data && data.length > 0);
  },

  // Time Entries
  getEntries: async (userId?: string): Promise<TimeEntry[]> => {
    let query = supabase.from('time_entries').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      date: d.date,
      startTime: d.start_time,
      endTime: d.end_time,
      totalMinutes: d.total_minutes
    }));
  },
  saveEntry: async (entry: TimeEntry): Promise<void> => {
    const payload: any = {
      user_id: entry.userId,
      date: entry.date,
      start_time: entry.startTime,
      end_time: entry.endTime,
      total_minutes: entry.totalMinutes
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (entry.id && uuidRegex.test(entry.id)) {
      payload.id = entry.id;
    }

    const { error } = await supabase
      .from('time_entries')
      .insert(payload);
    if (error) {
      console.error('Supabase saveEntry error:', error);
      throw error;
    }
  },
  saveEntries: async (entries: TimeEntry[]): Promise<void> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const payload = entries.map(e => {
      const item: any = {
        user_id: e.userId,
        date: e.date,
        start_time: e.startTime,
        end_time: e.endTime,
        total_minutes: e.totalMinutes
      };
      if (e.id && uuidRegex.test(e.id)) {
        item.id = e.id;
      }
      return item;
    });

    const { error } = await supabase
      .from('time_entries')
      .insert(payload);
    if (error) {
      console.error('Supabase saveEntries error:', error);
      throw error;
    }
  },
  deleteEntry: async (id: string): Promise<any> => {
    const response = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);
    
    if (response.error) {
      console.error('Supabase deleteEntry error:', response.error);
      throw response.error;
    }
    return response;
  }
};
