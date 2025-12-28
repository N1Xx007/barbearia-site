
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import BookingFlow from './components/BookingFlow';
import AIConsultant from './components/AIConsultant';
import AdminDashboard from './components/AdminDashboard';
import { ViewState, Appointment } from './types';
import { SERVICES } from './constants';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  // Inicializa estados lendo diretamente do localStorage
  const [view, setView] = useState<ViewState>(() => {
    const savedView = localStorage.getItem('barba_estilo_current_view');
    return (savedView as ViewState) || 'HOME';
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    return dbService.getAppointments();
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('barba_estilo_admin') === 'true';
  });

  // Salva a view atual sempre que mudar
  useEffect(() => {
    localStorage.setItem('barba_estilo_current_view', view);
  }, [view]);

  const refreshData = useCallback(() => {
    setAppointments(dbService.getAppointments());
  }, []);

  const handleBookingComplete = (appointment: Appointment) => {
    dbService.saveAppointment(appointment);
    refreshData();
    setNotification('Agendamento realizado com sucesso!');
    setView('MY_APPOINTMENTS');
    setTimeout(() => setNotification(null), 5000);
  };

  const updateStatus = (id: string, status: Appointment['status']) => {
    dbService.updateAppointmentStatus(id, status);
    refreshData();
  };

  const deleteAppointment = (id: string) => {
    if (window.confirm('Excluir este agendamento permanentemente?')) {
      dbService.deleteAppointment(id);
      refreshData();
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('barba_estilo_admin', 'true');
      setView('ADMIN_DASHBOARD');
      setAdminPassword('');
    } else {
      alert('Senha incorreta!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('barba_estilo_admin');
    setView('HOME');
  };

  const renderContent = () => {
    if (view === 'ADMIN_LOGIN') {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-6">Acesso <span className="text-gold">Admin</span></h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-2 text-xs font-bold uppercase">Senha de Acesso</label>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                  placeholder="Digite a senha..."
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-gold text-slate-950 rounded-xl font-bold hover:bg-amber-500 transition-all shadow-lg shadow-gold/10"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (view === 'ADMIN_DASHBOARD' && isAdmin) {
      return (
        <AdminDashboard 
          appointments={appointments} 
          onUpdateStatus={updateStatus} 
          onDelete={deleteAppointment} 
          onLogout={handleAdminLogout} 
        />
      );
    }

    switch (view) {
      case 'HOME':
        return (
          <>
            <Hero 
              onStartBooking={() => setView('BOOKING')} 
              onAIStyle={() => setView('AI_STYLING')} 
            />
            <section className="py-20 bg-slate-950 px-4">
              <div className="max-w-7xl mx-auto text-center mb-16">
                <h2 className="text-gold uppercase tracking-widest text-sm font-bold mb-4">Catálogo Completo</h2>
                <h3 className="text-4xl md:text-5xl font-bold">Excelência em cada detalhe</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {SERVICES.map(service => (
                  <div key={service.id} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 group hover:border-gold/30 transition-all">
                    <i className={`fa-solid ${service.icon} text-4xl text-gold mb-6`}></i>
                    <h4 className="text-2xl font-bold mb-2">{service.name}</h4>
                    <p className="text-slate-400 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-gold font-bold text-xl">R$ {service.price}</span>
                      <span className="text-slate-600 text-xs uppercase tracking-tighter">{service.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        );
      case 'BOOKING':
        return <BookingFlow onComplete={handleBookingComplete} />;
      case 'AI_STYLING':
        return <AIConsultant />;
      case 'MY_APPOINTMENTS':
        return (
          <section className="py-12 px-4 max-w-5xl mx-auto animate-fadeIn">
            <h2 className="text-4xl font-bold text-center mb-12">Meus <span className="text-gold">Agendamentos</span></h2>
            {appointments.length === 0 ? (
              <div className="text-center bg-slate-900 p-12 rounded-3xl border border-slate-800">
                <i className="fa-regular fa-calendar-xmark text-6xl text-slate-700 mb-4"></i>
                <p className="text-slate-400">Nenhum horário agendado recentemente.</p>
                <button onClick={() => setView('BOOKING')} className="mt-6 px-8 py-3 bg-gold text-slate-950 rounded-xl font-bold">Agendar Agora</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.slice().reverse().map(app => {
                  // Converte string de data ISO/YYYY-MM-DD com segurança para exibição
                  const dateParts = app.date.split('-');
                  const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : app.date;

                  return (
                    <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-2 h-full ${app.status === 'COMPLETED' ? 'bg-green-500' : app.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gold'}`}></div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gold uppercase truncate max-w-[200px]">
                            {app.services.map(s => s.name).join(' + ')}
                          </h4>
                          <p className="text-slate-400 text-sm mt-1">{displayDate} às {app.time}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          app.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : 
                          app.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' : 
                          'bg-gold/20 text-gold'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl mb-4">
                        <img src={app.barber.avatar} className="w-10 h-10 rounded-full border border-gold/30 object-cover" alt={app.barber.name} />
                        <span className="text-sm font-semibold">{app.barber.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-800">
                        <span className="text-slate-500 text-xs">#{app.id}</span>
                        <span className="font-bold text-gold">R$ {app.totalPrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <Layout currentView={view} onNavigate={(v) => {
      if (v === 'ADMIN_DASHBOARD' && !isAdmin) setView('ADMIN_LOGIN');
      else setView(v);
    }}>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <i className="fa-solid fa-circle-check text-xl"></i>
          <span className="font-bold">{notification}</span>
        </div>
      )}
      {renderContent()}
      {!isAdmin && (
        <div className="bg-slate-950 py-4 text-center">
          <button onClick={() => setView('ADMIN_LOGIN')} className="text-slate-700 text-xs hover:text-slate-500 transition-colors">Acesso Restrito</button>
        </div>
      )}
    </Layout>
  );
};

export default App;
