
import { Appointment, Barber } from '../types';
import { BARBERS, AVAILABLE_TIMES } from '../constants';

const APPOINTMENTS_KEY = 'barba_estilo_db_v1';
const BARBERS_KEY = 'barba_estilo_barbers_v1';

export const dbService = {
  // Appointments
  getAppointments: (): Appointment[] => {
    try {
      const data = localStorage.getItem(APPOINTMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erro ao carregar agendamentos:", e);
      return [];
    }
  },

  saveAppointment: (appointment: Appointment): void => {
    try {
      const appointments = dbService.getAppointments();
      appointments.push(appointment);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    } catch (e) {
      console.error("Erro ao salvar agendamento:", e);
    }
  },

  updateAppointmentStatus: (id: string, status: Appointment['status']): void => {
    try {
      const appointments = dbService.getAppointments();
      const index = appointments.findIndex(a => a.id === id);
      if (index !== -1) {
        appointments[index].status = status;
        localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      }
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
    }
  },

  deleteAppointment: (id: string): void => {
    try {
      const appointments = dbService.getAppointments();
      const filtered = appointments.filter(a => a.id !== id);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error("Erro ao excluir agendamento:", e);
    }
  },

  // Barbers
  getBarbers: (): Barber[] => {
    try {
      const data = localStorage.getItem(BARBERS_KEY);
      if (!data) {
        const initialBarbers: Barber[] = BARBERS;
        localStorage.setItem(BARBERS_KEY, JSON.stringify(initialBarbers));
        return initialBarbers;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error("Erro ao carregar barbeiros:", e);
      return BARBERS;
    }
  },

  addBarber: (barber: Barber): void => {
    try {
      const barbers = dbService.getBarbers();
      barbers.push(barber);
      localStorage.setItem(BARBERS_KEY, JSON.stringify(barbers));
    } catch (e) {
      console.error("Erro ao adicionar barbeiro:", e);
    }
  },

  updateBarber: (updatedBarber: Barber): void => {
    try {
      const barbers = dbService.getBarbers();
      const index = barbers.findIndex(b => b.id === updatedBarber.id);
      if (index !== -1) {
        barbers[index] = updatedBarber;
        localStorage.setItem(BARBERS_KEY, JSON.stringify(barbers));
      }
    } catch (e) {
      console.error("Erro ao atualizar barbeiro:", e);
    }
  },

  deleteBarber: (id: string): void => {
    try {
      const barbers = dbService.getBarbers();
      const filtered = barbers.filter(b => b.id !== id);
      localStorage.setItem(BARBERS_KEY, JSON.stringify(filtered));
      
      const appointments = dbService.getAppointments();
      const updatedApps = appointments.map(app => 
        app.barber.id === id && app.status === 'PENDING' 
          ? { ...app, status: 'CANCELLED' as const } 
          : app
      );
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedApps));
    } catch (e) {
      console.error("Erro ao excluir barbeiro:", e);
    }
  }
};
