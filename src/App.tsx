/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  LayoutDashboard, 
  History, 
  Users, 
  Building2, 
  FileText, 
  LogOut, 
  Plus, 
  Search,
  Download,
  Filter,
  UserCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, getMonth, getYear, lastDayOfMonth, eachDayOfInterval } from 'date-fns';
import XLSX from 'xlsx-js-style';
import { storage, calculateDuration, formatMinutes, safeParseISO } from './storage';
import { User, Company, TimeEntry, UserRole } from './types';
import { supabaseService } from './services/supabaseService';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ title, children, className = "" }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`card ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <Plus className="rotate-45" size={24} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button onClick={onClose} className="btn-primary px-6">Fechar</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "danger"
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  cancelText?: string,
  type?: "danger" | "warning" | "info"
}) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="p-6 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
            }`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500">{message}</p>
          </div>
          <div className="px-6 py-4 bg-slate-50 flex gap-3">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }} 
              className={`flex-1 px-4 py-2 text-white rounded-xl font-medium transition-colors ${
                type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Views ---

const LoginView = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const users = await supabaseService.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciais inválidas.');
      }
    } catch (err) {
      setError('Erro ao conectar com o banco de dados.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-full mb-6">
            <img 
              src="/logo.png" 
              alt="Conecta Cooperativa" 
              className="h-20 object-contain"
              onError={(e) => {
                // Fallback if image not found
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Conecta Cooperativa</h1>
          <p className="text-slate-500 mt-2">Sistema de Gestão</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

const ApontamentoView = ({ user }: { user: User }) => {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, entryId: string | null }>({ isOpen: false, entryId: null });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getEntries(user.id);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      console.log('Initiating delete for entry:', id);
      const response = await supabaseService.deleteEntry(id);
      console.log('Delete response:', response);
      
      // Update local state
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error('Delete error details:', err);
      setErrorModal({ 
        isOpen: true, 
        message: `ERRO DO BANCO DE DADOS:\n\nCódigo: ${err.code || 'N/A'}\nMensagem: ${err.message || 'Erro desconhecido'}\nDetalhes: ${err.details || 'Nenhum detalhe adicional'}\nDica: ${err.hint || 'Nenhuma dica'}` 
      });
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [user.id]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = calculateDuration(startTime, endTime);
    if (duration <= 0) {
      alert('Horário de saída deve ser após a entrada');
      return;
    }

    const start = parseISO(date);
    const end = parseISO(endDate);

    if (end < start) {
      alert('A data final deve ser posterior ou igual à data inicial');
      return;
    }

    const days = eachDayOfInterval({ start, end });
    const newEntries: TimeEntry[] = days.map(d => ({
      id: 'new',
      userId: user.id,
      date: format(d, 'yyyy-MM-dd'),
      startTime,
      endTime,
      totalMinutes: duration
    }));

    try {
      await supabaseService.saveEntries(newEntries);
      await fetchEntries(); 
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar no banco de dados');
    }
  };

  const selectedDateEntries = useMemo(() => {
    try {
      const start = parseISO(date);
      const end = parseISO(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
      
      return entries.filter(e => {
        const entryDate = parseISO(e.date);
        return isWithinInterval(entryDate, { start, end });
      }).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    } catch (e) {
      return [];
    }
  }, [entries, date, endDate]);

  const totalSelectedPeriod = selectedDateEntries.reduce((acc, curr) => acc + curr.totalMinutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Olá, {user.name}</h2>
          <p className="text-slate-500">Registre seus horários para o período selecionado</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Total no Período</p>
          <p className="text-3xl font-bold text-indigo-600">{formatMinutes(totalSelectedPeriod)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card title="Novo Apontamento">
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entrada</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Saída</label>
                  <input 
                    type="time" 
                    className="input-field" 
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={18} /> Registrar Período
              </button>
            </form>
          </Card>
        </div>

        <Card title={`Apontamentos de ${format(safeParseISO(date), 'dd/MM/yyyy')} até ${format(safeParseISO(endDate), 'dd/MM/yyyy')}`} className="lg:col-span-2">
          {selectedDateEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum registro para este período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Entrada</th>
                    <th className="pb-3">Saída</th>
                    <th className="pb-3">Duração</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDateEntries.map(entry => (
                    <tr key={entry.id} className="data-row">
                      <td className="py-4 text-sm">{format(safeParseISO(entry.date), 'dd/MM/yy')}</td>
                      <td className="py-4 font-mono">{entry.startTime}</td>
                      <td className="py-4 font-mono">{entry.endTime}</td>
                      <td className="py-4">{formatMinutes(entry.totalMinutes)}</td>
                      <td className="py-4 text-right">
                        <button 
                          disabled={deletingId === entry.id}
                          onClick={() => setConfirmDelete({ isOpen: true, entryId: entry.id })}
                          className={`text-red-500 hover:text-red-700 text-sm font-medium transition-opacity ${deletingId === entry.id ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
                        >
                          {deletingId === entry.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal 
        isOpen={errorModal.isOpen} 
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })} 
        title="Erro no Apontamento"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={24} />
            <p className="font-bold">Falha no Banco de Dados</p>
          </div>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-60 font-mono leading-relaxed">
            {errorModal.message}
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, entryId: null })}
        onConfirm={() => confirmDelete.entryId && handleDelete(confirmDelete.entryId)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja apagar este registro de ponto?"
      />
    </div>
  );
};

const HistoryView = ({ user, isAdmin = false }: { user: User, isAdmin?: boolean }) => {
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(isAdmin ? 'all' : user.id);
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, entryId: string | null }>({ isOpen: false, entryId: null });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesData, usersData, companiesData] = await Promise.all([
        supabaseService.getEntries(isAdmin ? undefined : user.id),
        supabaseService.getUsers(),
        supabaseService.getCompanies()
      ]);
      setEntries(entriesData);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id, isAdmin]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const entryDate = safeParseISO(e.date);
      const entryMonth = getMonth(entryDate);
      const entryYear = getYear(entryDate);
      
      const matchesMonth = entryMonth === selectedMonth;
      const matchesYear = entryYear === selectedYear;
      
      const u = users.find(usr => usr.id === e.userId);
      const matchesCompany = !isAdmin || selectedCompanyId === 'all' || u?.companyId === selectedCompanyId;
      const matchesUser = isAdmin ? (selectedUserId === 'all' || e.userId === selectedUserId) : e.userId === user.id;
      
      return matchesMonth && matchesYear && matchesUser && matchesCompany;
    });
  }, [entries, selectedMonth, selectedYear, selectedUserId, selectedCompanyId, user.id, isAdmin, users]);

  const totalMinutes = filteredEntries.reduce((acc, curr) => acc + curr.totalMinutes, 0);

  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: { 
      date: string, 
      userId: string, 
      entries: TimeEntry[], 
      totalMinutes: number,
      firstStartTime: string,
      lastEndTime: string
    } } = {};
    
    filteredEntries.forEach(e => {
      const key = `${e.userId}_${e.date}`;
      if (!groups[key]) {
        groups[key] = { 
          date: e.date, 
          userId: e.userId, 
          entries: [], 
          totalMinutes: 0,
          firstStartTime: e.startTime,
          lastEndTime: e.endTime
        };
      }
      groups[key].entries.push(e);
      groups[key].totalMinutes += e.totalMinutes;
      
      if (e.startTime < groups[key].firstStartTime) groups[key].firstStartTime = e.startTime;
      if (e.endTime > groups[key].lastEndTime) groups[key].lastEndTime = e.endTime;
    });
    
    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries]);

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const exportToExcel = () => {
    const data = filteredEntries.map(e => {
      const u = users.find(usr => usr.id === e.userId);
      const c = companies.find(comp => comp.id === u?.companyId);
      return {
        'Empresa': c?.name || 'N/A',
        'Funcionário': u?.name || 'N/A',
        'Data': format(safeParseISO(e.date), 'dd/MM/yyyy'),
        'Entrada': e.startTime,
        'Saída': e.endTime,
        'Total (Minutos)': e.totalMinutes,
        'Total (Formatado)': formatMinutes(e.totalMinutes)
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Apontamentos');
    XLSX.writeFile(wb, `Relatorio_Ponto_${selectedMonth + 1}_${selectedYear}.xlsx`);
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      setDeletingId(id);
      console.log('Deleting entry from history:', id);
      const response = await supabaseService.deleteEntry(id);
      console.log('Delete response history:', response);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      console.error('Delete error in history:', err);
      setErrorModal({ 
        isOpen: true, 
        message: `ERRO DO BANCO DE DADOS:\n\nCódigo: ${err.code || 'N/A'}\nMensagem: ${err.message || 'Erro desconhecido'}\nDetalhes: ${err.details || 'Nenhum detalhe adicional'}\nDica: ${err.hint || 'Nenhuma dica'}` 
      });
    } finally {
      setDeletingId(null);
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => getYear(new Date()) - 2 + i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{isAdmin ? 'Relatórios Administrativos' : 'Apontamentos'}</h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <select 
                className="input-field py-1.5 min-w-[150px]"
                value={selectedCompanyId}
                onChange={e => setSelectedCompanyId(e.target.value)}
              >
                <option value="all">Todas as Empresas</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select 
                className="input-field py-1.5 min-w-[150px]"
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
              >
                <option value="all">Todos os Funcionários</option>
                {users
                  .filter(u => selectedCompanyId === 'all' || u.companyId === selectedCompanyId)
                  .map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </>
          )}
          <select 
            className="input-field py-1.5 min-w-[120px]"
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select 
            className="input-field py-1.5 min-w-[100px]"
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportToExcel} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Exportar Excel">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-xs text-slate-400 font-medium border-b border-slate-100">
                <th className="px-6 py-4 font-normal w-10"></th>
                {isAdmin && <th className="px-6 py-4 font-normal">Empresa</th>}
                {isAdmin && <th className="px-6 py-4 font-normal">Funcionário</th>}
                <th className="px-6 py-4 font-normal">Data</th>
                <th className="px-6 py-4 font-normal">Primeira Entrada</th>
                <th className="px-6 py-4 font-normal">Última Saída</th>
                <th className="px-6 py-4 font-normal">Total do Dia</th>
                <th className="px-6 py-4 font-normal text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groupedEntries.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 8} className="py-12 text-center text-slate-400">
                    Nenhum registro encontrado para este período
                  </td>
                </tr>
              ) : (
                groupedEntries.map(group => {
                  const groupKey = `${group.userId}-${group.date}`;
                  const isExpanded = expandedRows.has(groupKey);
                  const sortedEntries = [...group.entries].sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const u = users.find(usr => usr.id === group.userId);
                  const c = companies.find(comp => comp.id === u?.companyId);
                  
                  let rowColor = "";
                  if (group.totalMinutes > 480) rowColor = "bg-red-50/50";
                  else if (group.totalMinutes < 480) rowColor = "bg-yellow-50/50";

                  return (
                    <React.Fragment key={groupKey}>
                      <tr className={`${rowColor} transition-colors hover:bg-slate-50/80 cursor-pointer`} onClick={() => toggleRow(groupKey)}>
                        <td className="px-6 py-4">
                          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                        </td>
                        {isAdmin && <td className="px-6 py-4 text-sm text-slate-600">{c?.name}</td>}
                        {isAdmin && <td className="px-6 py-4 text-sm text-slate-600">{u?.name}</td>}
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {format(safeParseISO(group.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{group.firstStartTime}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{group.lastEndTime}</td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                          {formatMinutes(group.totalMinutes)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs text-slate-400">{group.entries.length} apontamentos</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={isAdmin ? 10 : 8} className="px-6 py-0 bg-slate-50/30">
                            <div className="py-4 space-y-2">
                              <div className="grid grid-cols-4 gap-4 text-[10px] uppercase tracking-wider font-bold text-slate-400 px-4 mb-2">
                                <div>Entrada</div>
                                <div>Saída</div>
                                <div>Duração</div>
                                <div className="text-right">Ações</div>
                              </div>
                              {sortedEntries.map(entry => (
                                <div key={entry.id} className="grid grid-cols-4 gap-4 items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                  <div className="text-sm font-mono text-slate-600">{entry.startTime}</div>
                                  <div className="text-sm font-mono text-slate-600">{entry.endTime}</div>
                                  <div className="text-sm text-slate-600">{formatMinutes(entry.totalMinutes)}</div>
                                  <div className="text-right">
                                    <button 
                                      disabled={deletingId === entry.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDelete({ isOpen: true, entryId: entry.id });
                                      }}
                                      className={`text-slate-300 hover:text-red-500 transition-colors ${deletingId === entry.id ? 'opacity-50' : ''}`}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-indigo-50/30 px-6 py-4 flex justify-between items-center border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Total do período ({filteredEntries.length} registros)
          </span>
          <span className="text-xl font-bold text-indigo-700">
            {formatMinutes(totalMinutes)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span className="text-slate-500">Menos de 8h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span className="text-slate-500">Mais de 8h</span>
        </div>
      </div>

      <Modal 
        isOpen={errorModal.isOpen} 
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })} 
        title="Erro no Histórico"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={24} />
            <p className="font-bold">Falha no Banco de Dados</p>
          </div>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-60 font-mono leading-relaxed">
            {errorModal.message}
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, entryId: null })}
        onConfirm={() => confirmDelete.entryId && handleDeleteEntry(confirmDelete.entryId)}
        title="Confirmar Exclusão"
        message="Deseja realmente excluir este apontamento?"
      />
    </div>
  );
};

const BRAZIL_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const AdminCompaniesView = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, companyId: string | null }>({ isOpen: false, companyId: null });
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const companyData: Company = { 
      id: editingCompany ? editingCompany.id : 'new', 
      name, 
      cnpj,
      address,
      neighborhood,
      city,
      state
    };
    
    try {
      await supabaseService.saveCompany(companyData);
      await fetchCompanies();
      
      setEditingCompany(null);
      setName('');
      setCnpj('');
      setAddress('');
      setNeighborhood('');
      setCity('');
      setState('SP');
      alert('Empresa salva com sucesso!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar empresa.');
    }
  };

  const startEdit = (company: Company) => {
    setEditingCompany(company);
    setName(company.name);
    setCnpj(company.cnpj);
    setAddress(company.address || '');
    setNeighborhood(company.neighborhood || '');
    setCity(company.city || '');
    setState(company.state || 'SP');
  };

  const cancelEdit = () => {
    setEditingCompany(null);
    setName('');
    setCnpj('');
    setAddress('');
    setNeighborhood('');
    setCity('');
    setState('SP');
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      setDeletingId(id);
      console.log('Initiating delete for company:', id);
      await supabaseService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Delete company error:', err);
      setErrorModal({ 
        isOpen: true, 
        message: `ERRO AO EXCLUIR EMPRESA:\n\nCódigo: ${err.code || 'N/A'}\nMensagem: ${err.message || 'Erro desconhecido'}\nDetalhes: ${err.details || 'Nenhum detalhe adicional'}\nDica: ${err.hint || 'Nenhuma dica'}` 
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Gestão de Empresas</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={editingCompany ? "Editar Empresa" : "Nova Empresa"}>
          <form onSubmit={handleAdd} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">CNPJ</label>
              <input className="input-field" value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
              <input className="input-field" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bairro</label>
                <input className="input-field" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input className="input-field" value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">UF (Estado)</label>
              <select className="input-field" value={state} onChange={e => setState(e.target.value)}>
                {BRAZIL_UFS.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">{editingCompany ? "Salvar Alterações" : "Cadastrar"}</button>
              {editingCompany && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">Cancelar</button>
              )}
            </div>
          </form>
        </Card>
        <Card title="Empresas Cadastradas" className="lg:col-span-2">
          <div className="space-y-4">
            {companies.map(c => (
              <div key={c.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:bg-slate-50 group">
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.cnpj}</p>
                  {c.city && <p className="text-xs text-slate-400">{c.city} - {c.state}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => startEdit(c)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Editar
                  </button>
                  <button 
                    disabled={deletingId === c.id}
                    onClick={() => setConfirmDelete({ isOpen: true, companyId: c.id })}
                    className={`text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity ${deletingId === c.id ? 'cursor-not-allowed' : ''}`}
                  >
                    {deletingId === c.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                  <Building2 className="text-slate-300" size={24} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={errorModal.isOpen} 
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })} 
        title="Erro na Gestão de Empresas"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={24} />
            <p className="font-bold">Falha no Banco de Dados</p>
          </div>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-60 font-mono leading-relaxed">
            {errorModal.message}
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, companyId: null })}
        onConfirm={() => confirmDelete.companyId && handleDeleteCompany(confirmDelete.companyId)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

const ProfileView = ({ user, onUpdate }: { user: User, onUpdate: (user: User) => void }) => {
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [password, setPassword] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    supabaseService.getCompanies().then(setCompanies);
  }, []);

  const companyName = companies.find(c => c.id === user.companyId)?.name || 'Não informada';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      email,
      phone,
      address,
      password: password || user.password
    };
    try {
      await supabaseService.saveUser(updatedUser);
      storage.setCurrentUser(updatedUser);
      onUpdate(updatedUser);
      alert('Perfil atualizado com sucesso!');
      setPassword('');
    } catch (err) {
      alert('Erro ao atualizar perfil');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Meu Perfil</h2>
      <div className="max-w-2xl">
        <Card title="Informações Pessoais">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome (não alterável)</label>
                <input className="input-field bg-slate-50 cursor-not-allowed" value={user.name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa (não alterável)</label>
                <input className="input-field bg-slate-50 cursor-not-allowed" value={companyName} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input 
                  className="input-field" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                <input 
                  className="input-field" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
              <input 
                className="input-field" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                placeholder="Rua, número, complemento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alterar Senha (deixe em branco para manter)</label>
              <input 
                className="input-field" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>

            <div className="pt-4">
              <button type="submit" className="btn-primary w-full md:w-auto px-8">
                Salvar Alterações
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const AdminUsersView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [companyId, setCompanyId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean, message: string }>({ isOpen: false, message: '' });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, userId: string | null }>({ isOpen: false, userId: null });
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, companiesData] = await Promise.all([
        supabaseService.getUsers(),
        supabaseService.getCompanies()
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
      if (companiesData.length > 0) setCompanyId(companiesData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const userData: User = { 
      id: editingUser ? editingUser.id : 'new', 
      name, 
      email, 
      password: password || editingUser?.password || '123', 
      role, 
      companyId,
      phone,
      address
    };
    
    try {
      await supabaseService.saveUser(userData);
      // Refresh list to get the real ID from database if it was a new user
      await fetchData();
      
      setEditingUser(null);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setAddress('');
      alert('Usuário salvo com sucesso!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar usuário. Verifique se o e-mail já existe.');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Don't show password
    setRole(user.role);
    setCompanyId(user.companyId);
    setPhone(user.phone || '');
    setAddress(user.address || '');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAddress('');
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setDeletingId(id);
      console.log('Initiating delete for user:', id);
      await supabaseService.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      console.error('Delete user error:', err);
      setErrorModal({ 
        isOpen: true, 
        message: `ERRO AO EXCLUIR USUÁRIO:\n\nCódigo: ${err.code || 'N/A'}\nMensagem: ${err.message || 'Erro desconhecido'}\nDetalhes: ${err.details || 'Nenhum detalhe adicional'}` 
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={editingUser ? "Editar Usuário" : "Novo Usuário"}>
          <form onSubmit={handleAdd} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
              <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
              <input className="input-field" value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço completo" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha {editingUser && "(deixe em branco para manter)"}</label>
              <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingUser} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Perfil</label>
              <select className="input-field" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
              <select className="input-field" value={companyId} onChange={e => setCompanyId(e.target.value)}>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">{editingUser ? "Salvar Alterações" : "Cadastrar"}</button>
              {editingUser && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">Cancelar</button>
              )}
            </div>
          </form>
        </Card>
        <Card title="Usuários Cadastrados" className="lg:col-span-2">
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:bg-slate-50 group">
                <div>
                  <p className="font-semibold text-slate-800">{u.name}</p>
                  <p className="text-sm text-slate-500">{u.email} • {u.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
                  <p className="text-xs text-indigo-600 font-medium">{companies.find(c => c.id === u.companyId)?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => startEdit(u)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Editar
                  </button>
                  <button 
                    disabled={deletingId === u.id}
                    onClick={() => setConfirmDelete({ isOpen: true, userId: u.id })}
                    className={`text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity ${deletingId === u.id ? 'cursor-not-allowed' : ''}`}
                  >
                    {deletingId === u.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                  <UserCircle className="text-slate-300" size={24} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={errorModal.isOpen} 
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })} 
        title="Erro na Gestão de Usuários"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={24} />
            <p className="font-bold">Falha no Banco de Dados</p>
          </div>
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-60 font-mono leading-relaxed">
            {errorModal.message}
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, userId: null })}
        onConfirm={() => confirmDelete.userId && handleDeleteUser(confirmDelete.userId)}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('apontamento');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  const handleLogin = (user: User) => {
    storage.setCurrentUser(user);
    setCurrentUser(user);
    setCurrentView('apontamento');
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'apontamento': return <ApontamentoView user={currentUser} />;
      case 'history': return <HistoryView user={currentUser} />;
      case 'profile': return <ProfileView user={currentUser} onUpdate={setCurrentUser} />;
      case 'reports': return <HistoryView user={currentUser} isAdmin={currentUser.role === 'ADMIN'} />;
      case 'companies': return <AdminCompaniesView />;
      case 'users': return <AdminUsersView />;
      default: return <ApontamentoView user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex flex-col items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Conecta Cooperativa" 
            className="h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Clock size={20} />
            </div>
            <span className="text-xl font-bold text-slate-800 whitespace-nowrap">Conecta</span>
          </div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Conecta Cooperativa</span>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">Principal</p>
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Apontamento" 
            active={currentView === 'apontamento'} 
            onClick={() => setCurrentView('apontamento')} 
          />
          <SidebarItem 
            icon={History} 
            label="Meus Apontamentos" 
            active={currentView === 'history'} 
            onClick={() => setCurrentView('history')} 
          />

          {currentUser.role === 'ADMIN' && (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mt-6 mb-2">Administrativo</p>
              <SidebarItem 
                icon={FileText} 
                label="Relatórios" 
                active={currentView === 'reports'} 
                onClick={() => setCurrentView('reports')} 
              />
              <SidebarItem 
                icon={Building2} 
                label="Empresas" 
                active={currentView === 'companies'} 
                onClick={() => setCurrentView('companies')} 
              />
              <SidebarItem 
                icon={Users} 
                label="Usuários" 
                active={currentView === 'users'} 
                onClick={() => setCurrentView('users')} 
              />
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setCurrentView('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-lg transition-all text-left ${currentView === 'profile' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100' : 'hover:bg-slate-50'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentView === 'profile' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
              <UserCircle size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-xs opacity-70 truncate">{currentUser.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
            </div>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <ChevronRight className={`transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            <nav className="flex items-center text-sm font-medium text-slate-500">
              <span className="hover:text-slate-800 cursor-pointer">Início</span>
              <ChevronRight size={14} className="mx-2" />
              <span className="text-slate-800 capitalize">{currentView}</span>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Calendar size={14} />
              <span>{format(new Date(), 'EEEE, dd MMMM')}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
