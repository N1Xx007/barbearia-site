
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Appointment, Barber } from '../types';
import { dbService } from '../services/dbService';
import { AVAILABLE_TIMES } from '../constants';

interface AdminDashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ appointments, onUpdateStatus, onDelete, onLogout }) => {
  const [tab, setTab] = useState<'SCHEDULE' | 'BARBERS'>('SCHEDULE');
  const [filter, setFilter] = useState<Appointment['status'] | 'ALL'>('ALL');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBarbers(dbService.getBarbers());
  }, []);

  const stats = useMemo(() => {
    const totalRev = appointments.reduce((acc, a) => acc + (a.status !== 'CANCELLED' ? a.totalPrice : 0), 0);
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    return { totalRev, pending, total: appointments.length };
  }, [appointments]);

  const filteredAppointments = appointments.filter(a => filter === 'ALL' || a.status === filter);

  const handleSaveBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBarber) {
      if (isAdding) {
        dbService.addBarber(editingBarber);
      } else {
        dbService.updateBarber(editingBarber);
      }
      setBarbers(dbService.getBarbers());
      setEditingBarber(null);
      setIsAdding(false);
    }
  };

  const handleDeleteBarber = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o barbeiro ${name}? Agendamentos pendentes serão cancelados.`)) {
      dbService.deleteBarber(id);
      setBarbers(dbService.getBarbers());
    }
  };

  const handleAddNew = () => {
    const newBarber: Barber = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      role: 'Barbeiro',
      avatar: 'https://via.placeholder.com/150',
      specialty: '',
      availableDays: [1, 2, 3, 4, 5, 6],
      availableHours: AVAILABLE_TIMES
    };
    setEditingBarber(newBarber);
    setIsAdding(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingBarber) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingBarber({ ...editingBarber, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (day: number) => {
    if (!editingBarber) return;
    const days = editingBarber.availableDays.includes(day)
      ? editingBarber.availableDays.filter(d => d !== day)
      : [...editingBarber.availableDays, day];
    setEditingBarber({...editingBarber, availableDays: days});
  };

  const toggleHour = (hour: string) => {
    if (!editingBarber) return;
    const hours = editingBarber.availableHours.includes(hour)
      ? editingBarber.availableHours.filter(h => h !== hour)
      : [...editingBarber.availableHours, hour].sort();
    setEditingBarber({...editingBarber, availableHours: hours});
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-bold">Painel <span className="text-gold">Admin</span></h2>
          <div className="flex gap-4 mt-2 text-center md:text-left">
            <button onClick={() => setTab('SCHEDULE')} className={`text-sm font-bold uppercase py-2 ${tab === 'SCHEDULE' ? 'text-gold border-b-2 border-gold' : 'text-slate-500'}`}>Agenda</button>
            <button onClick={() => setTab('BARBERS')} className={`text-sm font-bold uppercase py-2 ${tab === 'BARBERS' ? 'text-gold border-b-2 border-gold' : 'text-slate-500'}`}>Barbeiros</button>
          </div>
        </div>
        <button onClick={onLogout} className="px-6 py-2 border border-red-500/50 text-red-500 rounded-lg flex items-center gap-2 hover:bg-red-500/10 transition-colors">Sair</button>
      </div>

      {tab === 'SCHEDULE' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Receita Total</p>
              <p className="text-3xl font-bold text-gold">R$ {stats.totalRev}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Pendentes</p>
              <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <p className="text-slate-500 text-xs font-bold uppercase mb-2">Reservas</p>
              <p className="text-3xl font-bold text-blue-500">{stats.total}</p>
            </div>
          </div>

          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === s ? 'bg-gold text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                {s === 'ALL' ? 'Todos' : s}
              </button>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-500">CLIENTE</th>
                  <th className="p-4 text-xs font-bold text-slate-500">QUANDO</th>
                  <th className="p-4 text-xs font-bold text-slate-500">BARBEIRO</th>
                  <th className="p-4 text-xs font-bold text-slate-500">STATUS</th>
                  <th className="p-4 text-xs font-bold text-slate-500 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAppointments.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500 italic">Nenhum agendamento encontrado</td></tr>
                ) : filteredAppointments.map(app => (
                  <tr key={app.id}>
                    <td className="p-4">
                      <div className="font-bold">{app.clientName}</div>
                      <div className="text-xs text-slate-500">{app.clientEmail}</div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div>{new Date(app.date + 'T12:00:00').toLocaleDateString()}</div>
                      <div className="text-gold font-mono text-sm">{app.time}</div>
                    </td>
                    <td className="p-4 text-sm font-semibold">{app.barber.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${app.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : app.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>{app.status}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {app.status === 'PENDING' && <button onClick={() => onUpdateStatus(app.id, 'COMPLETED')} className="w-8 h-8 rounded-full bg-green-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform"><i className="fa-solid fa-check"></i></button>}
                        <button onClick={() => onDelete(app.id)} className="w-8 h-8 rounded-full bg-slate-800 text-red-400 flex items-center justify-center hover:scale-110 transition-transform"><i className="fa-solid fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <button 
              onClick={handleAddNew}
              className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 font-bold hover:border-gold hover:text-gold transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-user-plus"></i>
              Adicionar Novo Barbeiro
            </button>
            {barbers.map(b => (
              <div key={b.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={b.avatar} className="w-12 h-12 rounded-full object-cover border border-gold" />
                  <div>
                    <h4 className="font-bold">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.specialty || b.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingBarber(b); setIsAdding(false); }} className="p-2 bg-slate-800 text-gold rounded-lg text-sm font-bold hover:bg-slate-700">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button onClick={() => handleDeleteBarber(b.id, b.name)} className="p-2 bg-slate-800 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/10">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingBarber && (
            <div className="bg-slate-900 border border-gold/30 p-8 rounded-3xl animate-fadeIn sticky top-24">
              <h3 className="text-xl font-bold mb-6">{isAdding ? 'Novo Barbeiro' : `Editando: ${editingBarber.name}`}</h3>
              <form onSubmit={handleSaveBarber} className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={editingBarber.avatar} className="w-24 h-24 rounded-full object-cover border-2 border-gold shadow-lg" alt="Avatar Preview" />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-camera text-white"></i>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">Clique para alterar foto</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">NOME</label>
                    <input required type="text" value={editingBarber.name} onChange={e => setEditingBarber({...editingBarber, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm focus:border-gold outline-none" placeholder="Nome do barbeiro" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">ESPECIALIDADE</label>
                    <input type="text" value={editingBarber.specialty} onChange={e => setEditingBarber({...editingBarber, specialty: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm focus:border-gold outline-none" placeholder="Ex: Fades, Barba" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">DIAS DE TRABALHO</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d, i) => (
                      <button type="button" key={d} onClick={() => toggleDay(i)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${editingBarber.availableDays.includes(i) ? 'bg-gold text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">HORÁRIOS DE ATENDIMENTO</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {AVAILABLE_TIMES.map(t => (
                      <button type="button" key={t} onClick={() => toggleHour(t)} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${editingBarber.availableHours.includes(t) ? 'bg-gold text-slate-950 border-gold' : 'bg-slate-800 text-slate-400 border-transparent border'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="submit" className="flex-grow py-3 bg-gold text-slate-950 font-bold rounded-xl hover:bg-amber-500 transition-colors shadow-lg shadow-gold/10">
                    {isAdding ? 'Criar Barbeiro' : 'Salvar Alterações'}
                  </button>
                  <button type="button" onClick={() => {setEditingBarber(null); setIsAdding(false);}} className="px-6 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">Cancelar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
