
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import BookingFlow from './components/BookingFlow';
import AIConsultant from './components/AIConsultant';
import AdminDashboard from './components/AdminDashboard';
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
    if (window.confirm('Excluir este agendamento?')) {
      dbService.deleteAppointment(id);
      refreshData();
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    if (dbService.setAdminSession(adminPassword)) {
      setIsAdmin(true);
      setView('ADMIN_DASHBOARD');
      setAdminPassword('');
    } else {
      alert('Chave inválida!');
    }
    setIsLoggingIn(false);
  };

  const renderContent = () => {
    if (view === 'ADMIN_LOGIN') {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-6">Portal <span className="text-gold italic font-serif">Profissional</span></h2>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input 
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 text-white focus:border-gold outline-none"
                placeholder="Senha administrativa"
              />
              <button className="w-full py-4 bg-gold text-black font-bold rounded-xl hover:opacity-90 transition-all">
                Entrar
              </button>
              <button type="button" onClick={() => setView('HOME')} className="w-full text-zinc-500 text-xs font-bold uppercase">Voltar</button>
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
          onLogout={() => { dbService.clearAdminSession(); setIsAdmin(false); setView('HOME'); }}
          onDataChange={refreshData}
        />
      );
    }

    switch (view) {
      case 'HOME':
        return (
          <>
            <Hero onStartBooking={() => setView('BOOKING')} onAIStyle={() => setView('AI_STYLING')} />
            <section className="py-24 bg-black px-4">
              <div className="max-w-7xl mx-auto text-center mb-20">
                <h2 className="text-gold uppercase tracking-[0.2em] text-xs font-bold mb-4">Serviços Signature</h2>
                <h3 className="text-4xl md:text-6xl font-bold">A Arte da <span className="italic font-serif">Barbearia</span></h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {services.map(service => (
                  <div key={service.id} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 hover:border-gold/40 transition-all group">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold transition-colors">
                      <i className={`fa-solid ${service.icon || 'fa-scissors'} text-gold group-hover:text-black`}></i>
                    </div>
                    <h4 className="text-xl font-bold mb-2">{service.name}</h4>
                    <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{service.description}</p>
                    <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
                      <span className="text-gold font-bold text-xl">R$ {service.price}</span>
                      <span className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">{service.duration} min</span>
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
          <section className="py-16 px-4 max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Seus <span className="text-gold italic font-serif">Agendamentos</span></h2>
            {appointments.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800">
                <p className="text-zinc-500 mb-8">Nenhuma reserva encontrada no seu dispositivo.</p>
                <button onClick={() => setView('BOOKING')} className="px-10 py-4 bg-gold text-black font-bold rounded-xl">Começar Agora</button>
              </div>
            ) : (
              <div className="grid gap-4">
                {appointments.slice().reverse().map(app => (
                  <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                      <h4 className="text-xl font-bold text-gold uppercase">{app.services[0]?.name}</h4>
                      <p className="text-zinc-400">{app.date} às {app.time} • com {app.barber.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${app.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold'}`}>
                        {app.status}
                      </span>
                      <span className="text-xl font-bold">R$ {app.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <Layout currentView={view} onNavigate={setView}>
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900 border border-gold text-gold px-8 py-4 rounded-2xl shadow-2xl font-bold animate-fadeIn">
          {notification}
        </div>
      )}
      {renderContent()}
      
      <footer className="bg-black py-20 border-t border-zinc-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <h2 className="text-gold font-serif text-3xl mb-4 italic">Barba & Estilo</h2>
          <p className="text-zinc-600 text-sm mb-12">Desde 2018 moldando o visual do homem moderno.</p>
          <button 
            onClick={() => setView('ADMIN_LOGIN')}
            className="text-zinc-700 hover:text-gold text-xs font-bold uppercase tracking-[0.3em] transition-colors"
          >
            Acesso Restrito
          </button>
        </div>
      </footer>
    </Layout>
  );
};

export default App;
