
import React, { useState, useMemo, useEffect } from 'react';
import { Appointment, Barber, Service, Addon } from '../types';
import { dbService } from '../services/dbService';
import { AVAILABLE_TIMES } from '../constants';

interface AdminDashboardProps {
  appointments: Appointment[];
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onDataChange: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ appointments, onUpdateStatus, onDelete, onLogout, onDataChange }) => {
  const [tab, setTab] = useState<'SCHEDULE' | 'BARBERS' | 'SERVICES'>('SCHEDULE');
  const [filter, setFilter] = useState<Appointment['status'] | 'ALL'>('ALL');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [editingService, setEditingService] = useState<Service | Addon | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const b = dbService.getBarbers();
    const s = dbService.getServices();
    const a = dbService.getAddons();
    setBarbers(b);
    setServices(s);
    setAddons(a);
    onDataChange();
  };

  const stats = useMemo(() => {
    const totalRev = appointments.reduce((acc, a) => acc + (a.status !== 'CANCELLED' ? a.totalPrice : 0), 0);
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    return { totalRev, pending, total: appointments.length };
  }, [appointments]);

  const filteredAppointments = appointments.filter(a => filter === 'ALL' || a.status === filter);

  const handleSaveBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBarber) {
      if (isAdding) dbService.addBarber(editingBarber);
      else dbService.updateBarber(editingBarber);
      loadData();
      setEditingBarber(null);
      setIsAdding(false);
    }
  };

  const handleDeleteBarber = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja remover o barbeiro ${name}?`)) {
      dbService.deleteBarber(id);
      loadData();
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      const isActuallyService = 'icon' in editingService;
      if (isActuallyService) {
        if (isAdding) dbService.addService(editingService as Service);
        else dbService.updateService(editingService as Service);
      } else {
        if (isAdding) dbService.addAddon(editingService as Addon);
        else dbService.updateAddon(editingService as Addon);
      }
      loadData();
      setEditingService(null);
      setIsAdding(false);
    }
  };

  const handleDeleteService = (id: string, name: string) => {
    if (window.confirm(`Excluir serviço "${name}" permanentemente?`)) {
      dbService.deleteService(id);
      loadData();
    }
  };

  const handleDeleteAddon = (id: string, name: string) => {
    if (window.confirm(`Excluir adicional "${name}" permanentemente?`)) {
      dbService.deleteAddon(id);
      loadData();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-4xl font-bold">Painel <span className="text-gold">Admin</span></h2>
          <div className="flex gap-6 mt-4 overflow-x-auto">
            <button onClick={() => setTab('SCHEDULE')} className={`text-sm font-bold uppercase py-2 whitespace-nowrap ${tab === 'SCHEDULE' ? 'text-gold border-b-2 border-gold' : 'text-slate-500'}`}>Agenda</button>
            <button onClick={() => setTab('BARBERS')} className={`text-sm font-bold uppercase py-2 whitespace-nowrap ${tab === 'BARBERS' ? 'text-gold border-b-2 border-gold' : 'text-slate-500'}`}>Barbeiros</button>
            <button onClick={() => setTab('SERVICES')} className={`text-sm font-bold uppercase py-2 whitespace-nowrap ${tab === 'SERVICES' ? 'text-gold border-b-2 border-gold' : 'text-slate-500'}`}>Serviços e Preços</button>
          </div>
        </div>
        <button onClick={onLogout} className="px-6 py-2 border border-red-500 text-red-500 rounded-lg flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all font-bold">
          <i className="fa-solid fa-right-from-bracket"></i> Sair
        </button>
      </div>

      {tab === 'SCHEDULE' && (
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
                  <th className="p-4 text-xs font-bold text-slate-500">SERVIÇO</th>
                  <th className="p-4 text-xs font-bold text-slate-500">VALOR</th>
                  <th className="p-4 text-xs font-bold text-slate-500 text-center">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAppointments.map(app => (
                  <tr key={app.id}>
                    <td className="p-4">
                      <div className="font-bold">{app.clientName}</div>
                      <div className="text-xs text-slate-500">{app.clientEmail}</div>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(app.date + 'T12:00:00').toLocaleDateString()} às <span className="text-gold font-mono">{app.time}</span>
                    </td>
                    <td className="p-4 text-xs max-w-[150px] truncate">{app.services.map(s => s.name).join(', ')}</td>
                    <td className="p-4 font-bold text-gold">R$ {app.totalPrice}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {app.status === 'PENDING' && (
                          <button 
                            type="button"
                            onClick={() => onUpdateStatus(app.id, 'COMPLETED')} 
                            className="w-8 h-8 rounded-full bg-green-500 text-slate-950 flex items-center justify-center hover:scale-110 transition-transform"
                          >
                            <i className="fa-solid fa-check"></i>
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={() => onDelete(app.id)} 
                          className="w-8 h-8 rounded-full bg-slate-800 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'BARBERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fadeIn">
          <div className="space-y-4">
            <button type="button" onClick={() => {setEditingBarber({ id: 'b' + Date.now(), name: '', role: 'Barbeiro', avatar: 'https://via.placeholder.com/150', specialty: '', availableDays: [1,2,3,4,5,6], availableHours: AVAILABLE_TIMES }); setIsAdding(true); }} className="w-full py-6 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-gold hover:border-gold transition-all font-bold">
              + Adicionar Novo Barbeiro
            </button>
            {barbers.map(b => (
              <div key={b.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => {setEditingBarber(b); setIsAdding(false);}}>
                  <img src={b.avatar} className="w-12 h-12 rounded-full object-cover border border-gold" />
                  <div><h4 className="font-bold">{b.name}</h4><p className="text-xs text-slate-500">{b.specialty}</p></div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => {setEditingBarber(b); setIsAdding(false);}} className="p-2 bg-slate-800 text-gold rounded-lg hover:bg-slate-700"><i className="fa-solid fa-pen text-sm"></i></button>
                  <button type="button" onClick={() => handleDeleteBarber(b.id, b.name)} className="p-2 bg-slate-800 text-red-500 rounded-lg hover:bg-red-500/20"><i className="fa-solid fa-trash text-sm"></i></button>
                </div>
              </div>
            ))}
          </div>
          {editingBarber && (
            <div className="bg-slate-900 p-8 rounded-3xl border border-gold/20 sticky top-24">
              <h3 className="text-xl font-bold mb-6">{isAdding ? 'Novo Barbeiro' : 'Editar Barbeiro'}</h3>
              <form onSubmit={handleSaveBarber} className="space-y-4">
                <input required type="text" value={editingBarber.name} onChange={e => setEditingBarber({...editingBarber, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl outline-none focus:border-gold" placeholder="Nome" />
                <input type="text" value={editingBarber.specialty} onChange={e => setEditingBarber({...editingBarber, specialty: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl outline-none focus:border-gold" placeholder="Especialidade" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-grow py-3 bg-gold text-slate-950 font-bold rounded-xl">Salvar</button>
                  <button type="button" onClick={() => { setEditingBarber(null); setIsAdding(false); }} className="px-6 bg-slate-800 rounded-xl">Cancelar</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'SERVICES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fadeIn">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gold mb-4 uppercase tracking-widest text-sm">Serviços</h3>
              <div className="grid gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEditingService({ id: 's' + Date.now(), name: '', price: 0, duration: 30, description: '', icon: 'fa-scissors' } as Service);
                    setIsAdding(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-gold hover:border-gold transition-all text-sm font-bold"
                >
                  + Novo Serviço
                </button>
                {services.map(s => (
                  <div key={s.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-gold/50 transition-all">
                    <div onClick={() => { setEditingService(s); setIsAdding(false); }} className="cursor-pointer flex-grow">
                      <h4 className="font-bold">{s.name}</h4>
                      <p className="text-xs text-slate-500">{s.duration} min</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gold font-bold">R$ {s.price}</span>
                      <button type="button" onClick={() => handleDeleteService(s.id, s.name)} className="text-slate-600 hover:text-red-500 p-2">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gold mb-4 uppercase tracking-widest text-sm">Adicionais</h3>
              <div className="grid gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    setEditingService({ id: 'a' + Date.now(), name: '', price: 0, duration: 15, description: '' } as Addon);
                    setIsAdding(true);
                  }}
                  className="w-full py-4 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 hover:text-gold hover:border-gold transition-all text-sm font-bold"
                >
                  + Novo Adicional
                </button>
                {addons.map(a => (
                  <div key={a.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-gold/50 transition-all">
                    <div onClick={() => { setEditingService(a); setIsAdding(false); }} className="cursor-pointer flex-grow">
                      <h4 className="font-bold">{a.name}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gold font-bold">R$ {a.price}</span>
                      <button type="button" onClick={() => handleDeleteAddon(a.id, a.name)} className="text-slate-600 hover:text-red-500 p-2">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {editingService && (
            <div className="bg-slate-900 p-8 rounded-3xl border border-gold/20 sticky top-24">
              <h3 className="text-xl font-bold mb-6">{isAdding ? 'Novo Cadastro' : 'Editar Dados'}</h3>
              <form onSubmit={handleSaveService} className="space-y-6">
                <input required type="text" value={editingService.name} onChange={e => setEditingService({...editingService, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-gold" placeholder="Nome do Item" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="number" value={editingService.price} onChange={e => setEditingService({...editingService, price: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-gold text-gold" placeholder="Preço" />
                  <input required type="number" value={editingService.duration} onChange={e => setEditingService({...editingService, duration: Number(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 p-4 rounded-xl outline-none focus:border-gold" placeholder="Minutos" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-grow py-4 bg-gold text-slate-950 font-bold rounded-xl shadow-lg">Salvar</button>
                  <button type="button" onClick={() => { setEditingService(null); setIsAdding(false); }} className="px-6 bg-slate-800 rounded-xl">Cancelar</button>
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
