
import React, { useState, useMemo, useEffect } from 'react';
import { SERVICES, ADDONS } from '../constants';
import { Service, Barber, Appointment, Addon } from '../types';
import { dbService } from '../services/dbService';

interface BookingFlowProps {
  onComplete: (appointment: Appointment) => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ onComplete }) => {
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayLocal = useMemo(() => getLocalDateString(new Date()), []);

  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', email: '' });

  useEffect(() => {
    setBarbers(dbService.getBarbers());
    setAllAppointments(dbService.getAppointments());
  }, []);

  const summary = useMemo(() => {
    const sPrice = selectedServices.reduce((acc, s) => acc + s.price, 0);
    const aPrice = selectedAddons.reduce((acc, a) => acc + a.price, 0);
    const sDur = selectedServices.reduce((acc, s) => acc + s.duration, 0);
    const aDur = selectedAddons.reduce((acc, a) => acc + a.duration, 0);
    return { totalPrice: sPrice + aPrice, totalDuration: sDur + aDur };
  }, [selectedServices, selectedAddons]);

  const filteredTimes = useMemo(() => {
    if (!selectedBarber) return [];

    const now = new Date();
    const currentDateStr = getLocalDateString(now);
    const selectedDateObj = new Date(selectedDate + 'T12:00:00'); // Meio dia para evitar erros de timezone
    const dayOfWeek = selectedDateObj.getDay();

    // 1. Verifica se o barbeiro trabalha nesse dia da semana
    if (!selectedBarber.availableDays.includes(dayOfWeek)) {
      return [];
    }

    // 2. Horários base do barbeiro
    let baseTimes = selectedBarber.availableHours;

    // 3. Filtra por tempo real se for hoje
    if (selectedDate === currentDateStr) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      baseTimes = baseTimes.filter(timeSlot => {
        const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
        return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
      });
    }

    // 4. FILTRO DE CONFLITO: Remove horários já ocupados para este barbeiro nesta data
    const occupiedTimes = allAppointments
      .filter(app => 
        app.barber.id === selectedBarber.id && 
        app.date === selectedDate && 
        app.status !== 'CANCELLED'
      )
      .map(app => app.time);

    return baseTimes.filter(time => !occupiedTimes.includes(time));
  }, [selectedDate, selectedBarber, allAppointments]);

  const handleComplete = () => {
    if (selectedServices.length > 0 && selectedBarber && selectedDate && selectedTime && clientInfo.name && clientInfo.email) {
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        services: selectedServices,
        addons: selectedAddons,
        barber: selectedBarber,
        date: selectedDate,
        time: selectedTime,
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        totalPrice: summary.totalPrice,
        totalDuration: summary.totalDuration,
        status: 'PENDING'
      };
      onComplete(newAppointment);
    }
  };

  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      {/* Barra de Progresso */}
      <div className="flex items-center justify-between mb-12">
        {[1, 2, 3, 4, 5].map((i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-base ${step >= i ? 'bg-gold text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
              {i}
            </div>
            {i < 5 && <div className={`flex-grow h-1 mx-2 ${step > i ? 'bg-gold' : 'bg-slate-800'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">O que vamos fazer <span className="text-gold">hoje?</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SERVICES.map((s) => (
              <div key={s.id} onClick={() => setSelectedServices(prev => prev.some(x => x.id === s.id) ? prev.filter(x => x.id !== s.id) : [...prev, s])} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedServices.some(x => x.id === s.id) ? 'border-gold bg-gold/10' : 'border-slate-800 bg-slate-900'}`}>
                <div className="flex justify-between items-start mb-4">
                  <i className={`fa-solid ${s.icon} text-2xl text-gold`}></i>
                  <span className="text-2xl font-bold text-gold">R$ {s.price}</span>
                </div>
                <h3 className="text-xl font-bold">{s.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{s.description}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-8">
            <button disabled={selectedServices.length === 0} onClick={() => setStep(2)} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold disabled:opacity-50">Continuar</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Adicionais</h2>
          <div className="space-y-3">
            {ADDONS.map((a) => (
              <div key={a.id} onClick={() => setSelectedAddons(prev => prev.some(x => x.id === a.id) ? prev.filter(x => x.id !== a.id) : [...prev, a])} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${selectedAddons.some(x => x.id === a.id) ? 'border-gold bg-gold/10' : 'border-slate-800 bg-slate-900'}`}>
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-plus text-gold"></i>
                  <div><h4 className="font-bold">{a.name}</h4><p className="text-xs text-slate-500">+{a.duration} min</p></div>
                </div>
                <span className="font-bold text-gold">R$ {a.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="text-slate-500">Voltar</button>
            <button onClick={() => setStep(3)} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold">Próximo</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Selecione o <span className="text-gold">Barbeiro</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barbers.map((b) => (
              <div key={b.id} onClick={() => { setSelectedBarber(b); setStep(4); }} className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-900 hover:border-gold transition-all text-center cursor-pointer">
                <img src={b.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold/50 object-cover" />
                <h3 className="text-xl font-bold">{b.name}</h3>
                <p className="text-gold text-sm">{b.role}</p>
                <p className="text-slate-500 text-xs mt-2 italic">{b.specialty}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="text-slate-500 block mx-auto mt-8">Voltar</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Agenda de <span className="text-gold">{selectedBarber?.name}</span></h2>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="mb-8">
              <label className="block text-slate-400 mb-2 uppercase text-xs font-bold">Data</label>
              <input type="date" min={todayLocal} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-gold" />
            </div>
            <label className="block text-slate-400 mb-2 uppercase text-xs font-bold">Horários Livres</label>
            {filteredTimes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {filteredTimes.map((t) => (
                  <button key={t} onClick={() => setSelectedTime(t)} className={`py-3 rounded-xl border transition-all ${selectedTime === t ? 'bg-gold text-slate-900 border-gold' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>{t}</button>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-amber-500">
                <i className="fa-solid fa-calendar-xmark mb-2 block text-xl"></i>
                Indisponível. Selecione outra data ou barbeiro.
              </div>
            )}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(3)} className="text-slate-500">Voltar</button>
            <button disabled={!selectedTime} onClick={() => setStep(5)} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold disabled:opacity-50">Próximo</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Suas Informações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="space-y-4">
              <input type="text" placeholder="Nome Completo" value={clientInfo.name} onChange={(e) => setClientInfo(p => ({...p, name: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
              <input type="email" placeholder="E-mail" value={clientInfo.email} onChange={(e) => setClientInfo(p => ({...p, email: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">DATA E HORA</p>
              <p className="font-bold text-lg mb-4">{new Date(selectedDate).toLocaleDateString()} - {selectedTime}</p>
              <div className="flex justify-between font-bold text-xl border-t border-slate-700 pt-4"><span className="text-slate-400">Total:</span> <span>R$ {summary.totalPrice}</span></div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(4)} className="text-slate-500">Voltar</button>
            <button disabled={!clientInfo.name || !clientInfo.email} onClick={handleComplete} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold">Finalizar</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingFlow;
