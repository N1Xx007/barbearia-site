
import React, { useState, useMemo, useEffect } from 'react';
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
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({ name: '', email: '' });

  useEffect(() => {
    setBarbers(dbService.getBarbers());
    setServices(dbService.getServices());
    setAddons(dbService.getAddons());
    setAllAppointments(dbService.getAppointments());
  }, []);

  const summary = useMemo(() => {
    // Busca sempre os preços mais recentes do banco para garantir integridade
    const latestServices = dbService.getServices();
    const latestAddons = dbService.getAddons();

    const sPrice = selectedServices.reduce((acc, s) => {
      const official = latestServices.find(os => os.id === s.id);
      return acc + (official?.price || s.price);
    }, 0);

    const aPrice = selectedAddons.reduce((acc, a) => {
      const official = latestAddons.find(oa => oa.id === a.id);
      return acc + (official?.price || a.price);
    }, 0);

    const sDur = selectedServices.reduce((acc, s) => acc + s.duration, 0);
    const aDur = selectedAddons.reduce((acc, a) => acc + a.duration, 0);
    
    return { totalPrice: sPrice + aPrice, totalDuration: sDur + aDur };
  }, [selectedServices, selectedAddons]);

  const filteredTimes = useMemo(() => {
    if (!selectedBarber) return [];
    const now = new Date();
    const currentDateStr = getLocalDateString(now);
    const selectedDateObj = new Date(selectedDate + 'T12:00:00');
    const dayOfWeek = selectedDateObj.getDay();

    if (!selectedBarber.availableDays.includes(dayOfWeek)) return [];

    let baseTimes = selectedBarber.availableHours;

    if (selectedDate === currentDateStr) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      baseTimes = baseTimes.filter(timeSlot => {
        const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
        return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
      });
    }

    const occupiedTimes = allAppointments
      .filter(app => app.barber.id === selectedBarber.id && app.date === selectedDate && app.status !== 'CANCELLED')
      .map(app => app.time);

    return baseTimes.filter(time => !occupiedTimes.includes(time));
  }, [selectedDate, selectedBarber, allAppointments]);

  const handleComplete = () => {
    if (selectedServices.length > 0 && selectedBarber && selectedDate && selectedTime && clientInfo.name && clientInfo.email) {
      // O dbService validará os preços novamente ao salvar
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
      <div className="flex items-center justify-between mb-12">
        {[1, 2, 3, 4, 5].map((i) => (
          <React.Fragment key={i}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-base ${step >= i ? 'bg-gold text-slate-950' : 'bg-slate-800 text-slate-500'}`}>{i}</div>
            {i < 5 && <div className={`flex-grow h-1 mx-2 ${step > i ? 'bg-gold' : 'bg-slate-800'}`}></div>}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Selecione seus <span className="text-gold">Serviços</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((s) => (
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
          <h2 className="text-3xl font-bold text-center">Adicionais Premium</h2>
          <div className="space-y-3">
            {addons.map((a) => (
              <div key={a.id} onClick={() => setSelectedAddons(prev => prev.some(x => x.id === a.id) ? prev.filter(x => x.id !== a.id) : [...prev, a])} className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${selectedAddons.some(x => x.id === a.id) ? 'border-gold bg-gold/10' : 'border-slate-800 bg-slate-900'}`}>
                <div className="flex items-center gap-4">
                  <i className="fa-solid fa-plus text-gold"></i>
                  <h4 className="font-bold">{a.name}</h4>
                </div>
                <span className="font-bold text-gold">R$ {a.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="text-slate-500 font-bold uppercase text-xs">Voltar</button>
            <button onClick={() => setStep(3)} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold">Próximo</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Escolha o <span className="text-gold">Barbeiro</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barbers.map((b) => (
              <div key={b.id} onClick={() => { setSelectedBarber(b); setStep(4); }} className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-900 hover:border-gold transition-all text-center cursor-pointer">
                <img src={b.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gold/50 object-cover shadow-lg" />
                <h3 className="text-xl font-bold">{b.name}</h3>
                <p className="text-gold text-sm font-bold uppercase tracking-tighter">{b.specialty || b.role}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="text-slate-500 block mx-auto mt-8 font-bold uppercase text-xs">Voltar</button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Data e <span className="text-gold">Horário</span></h2>
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="mb-8">
              <label className="block text-slate-500 mb-2 uppercase text-xs font-bold">Selecione o Dia</label>
              <input type="date" min={todayLocal} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:border-gold outline-none" />
            </div>
            <label className="block text-slate-500 mb-2 uppercase text-xs font-bold">Horários Disponíveis</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {filteredTimes.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)} className={`py-4 rounded-xl border transition-all font-bold ${selectedTime === t ? 'bg-gold text-slate-900 border-gold' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}>{t}</button>
              ))}
              {filteredTimes.length === 0 && <p className="col-span-full text-center text-slate-600 italic py-4">Nenhum horário disponível para esta data.</p>}
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(3)} className="text-slate-500 font-bold uppercase text-xs">Voltar</button>
            <button disabled={!selectedTime} onClick={() => setStep(5)} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold disabled:opacity-50">Confirmar Horário</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-3xl font-bold text-center">Finalizar <span className="text-gold">Reserva</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <div className="space-y-4">
              <input type="text" placeholder="Seu Nome" value={clientInfo.name} onChange={(e) => setClientInfo(p => ({...p, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white outline-none focus:border-gold" />
              <input type="email" placeholder="Seu E-mail" value={clientInfo.email} onChange={(e) => setClientInfo(p => ({...p, email: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white outline-none focus:border-gold" />
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-xs text-slate-600 uppercase font-bold mb-2">Resumo</p>
                <p className="font-bold text-lg text-gold">{selectedDate.split('-').reverse().join('/')} - {selectedTime}</p>
                <p className="text-sm text-slate-400 mt-1">{selectedBarber?.name}</p>
              </div>
              <div className="flex justify-between font-bold text-2xl border-t border-slate-800 pt-4 mt-4">
                <span className="text-slate-600">Total:</span> 
                <span className="text-gold">R$ {summary.totalPrice}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(4)} className="text-slate-500 font-bold uppercase text-xs">Voltar</button>
            <button disabled={!clientInfo.name || !clientInfo.email} onClick={handleComplete} className="px-10 py-4 bg-gold text-slate-950 rounded-xl font-bold shadow-lg shadow-gold/10">Confirmar Agendamento</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingFlow;
