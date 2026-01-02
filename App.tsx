
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import BookingFlow from './components/BookingFlow';
import AIConsultant from './components/AIConsultant';
import AdminDashboard from './components/AdminDashboard';
import InstallPWA from './components/InstallPWA';
import { ViewState, Appointment, Service } from './types';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(() => {
    try {
      const savedView = localStorage.getItem('barba_estilo_current_view');
      return (savedView as ViewState) || 'HOME';
    } catch (e) {
      return 'HOME';
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(dbService.isAdminAuthenticated());
    setAppointments(dbService.getAppointments());
    setServices(dbService.getServices());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('barba_estilo_current_view', view);
    } catch (e) {}
  }, [view]);

  const refreshData = useCallback(() => {
    setAppointments(dbService.getAppointments());
    setServices(dbService.getServices());
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    if (dbService.setAdminSession(adminPassword)) {
      setIsAdmin(true);
      setView('ADMIN_DASHBOARD');
      setAdminPassword('');
    } else {
      alert('Chave de acesso inválida!');
    }
    setIsLoggingIn(false);
  };

  const handleAdminLogout = () => {
    dbService.clearAdminSession();
    setIsAdmin(false);
    setView('HOME');
  };

  const renderContent = () => {
    if (view === 'ADMIN_LOGIN') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fadeIn">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-6">Área do <span className="text-gold">Barbeiro</span></h2>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-slate-500 mb-2 text-xs font-bold uppercase">Chave de Acesso</label>
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-gold"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-gold text-slate-950 rounded-xl font-bold hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <i className="fa-solid fa-circle-notch animate-spin"></i> : 'Entrar no Sistema'}
              </button>
              <button type="button" onClick={() => setView('HOME')} className="w-full text-slate-500 text-xs font-bold uppercase hover:text-white transition-colors">Voltar</button>
            </form>
          </div>
        </div>
      );
    }

    if (view === 'ADMIN_DASHBOARD') {
      return isAdmin ? (
        <AdminDashboard 
          appointments={appointments} 
          onUpdateStatus={updateStatus} 
          onDelete={deleteAppointment} 
          onLogout={handleAdminLogout}
          onDataChange={refreshData}
        />
      ) : (
        <div className="text-center py-20"><button onClick={() => setView('ADMIN_LOGIN')} className="text-gold font-bold underline">Fazer Login como Admin</button></div>
      );
    }

    switch (view) {
      case 'HOME':
        return (
          <>
            <Hero onStartBooking={() => setView('BOOKING')} onAIStyle={() => setView('AI_STYLING')} />
            <section className="py-20 bg-slate-950 px-4">
              <div className="max-w-7xl mx-auto text-center mb-16">
                <h2 className="text-gold uppercase tracking-widest text-sm font-bold mb-4">Nossos Serviços</h2>
                <h3 className="text-4xl md:text-5xl font-bold">Menu de <span className="italic font-serif">Excelência</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {services.map(service => (
                  <div key={service.id} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-gold/30 transition-all">
                    <i className={`fa-solid ${service.icon || 'fa-scissors'} text-3xl text-gold mb-6`}></i>
                    <h4 className="text-xl font-bold mb-2">{service.name}</h4>
                    <p className="text-slate-400 text-sm mb-6 h-10 overflow-hidden">{service.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                      <span className="text-gold font-bold text-xl">R$ {service.price}</span>
                      <span className="text-slate-600 text-[10px] uppercase font-bold">{service.duration} min</span>
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
                <p className="text-slate-400">Você ainda não tem agendamentos salvos.</p>
                <button onClick={() => setView('BOOKING')} className="mt-6 px-8 py-3 bg-gold text-slate-950 rounded-xl font-bold">Agendar Agora</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.slice().reverse().map(app => (
                  <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative">
                    <div className={`absolute top-0 left-0 w-2 h-full ${app.status === 'COMPLETED' ? 'bg-green-500' : app.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gold'}`}></div>
                    <h4 className="text-lg font-bold text-gold uppercase truncate mb-2">{app.services.map(s => s.name).join(' + ')}</h4>
                    <p className="text-slate-400 text-sm">{app.date} às {app.time}</p>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
                      <span className="text-xs text-slate-600">ID: {app.id}</span>
                      <span className="font-bold text-white">R$ {app.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      default:
        return <Hero onStartBooking={() => setView('BOOKING')} onAIStyle={() => setView('AI_STYLING')} />;
    }
  };

  return (
    <Layout currentView={view} onNavigate={(v) => setView(v)}>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <i className="fa-solid fa-circle-check text-xl"></i>
          <span className="font-bold">{notification}</span>
        </div>
      )}
      {renderContent()}
      
      {/* Botão de Instalação Flutuante */}
      {!isAdmin && <InstallPWA />}
      
      {/* Footer Permanente para Acesso Administrativo */}
      {view !== 'ADMIN_DASHBOARD' && view !== 'ADMIN_LOGIN' && (
        <footer className="bg-slate-950 py-12 border-t border-slate-900 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="mb-8">
              <h4 className="text-gold font-serif text-2xl mb-2">Barba & Estilo</h4>
              <p className="text-slate-500 text-sm">Onde a tradição encontra o futuro.</p>
            </div>
            <div className="pt-8 border-t border-slate-900 inline-block">
              <button 
                onClick={() => setView('ADMIN_LOGIN')}
                className="group flex items-center gap-3 text-slate-600 hover:text-gold transition-all"
              >
                <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-gold/50">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Área Profissional</p>
                  <p className="text-sm font-bold">Acessar Painel de Controle</p>
                </div>
              </button>
            </div>
          </div>
        </footer>
      )}
    </Layout>
  );
};

export default App;
