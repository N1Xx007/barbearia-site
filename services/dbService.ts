
import { Appointment, Barber, Service, Addon } from '../types';
import { BARBERS, SERVICES, ADDONS } from '../constants';

const APPOINTMENTS_KEY = 'barba_estilo_db_v1';
const BARBERS_KEY = 'barba_estilo_barbers_v1';
const SERVICES_KEY = 'barba_estilo_services_v1';
const ADDONS_KEY = 'barba_estilo_addons_v1';
const ADMIN_TOKEN_KEY = 'barba_estilo_admin_session';

export const dbService = {
  // Auth
  setAdminSession: (password: string): boolean => {
    if (password === 'admin123') {
      const token = btoa(`admin:${Date.now() + 3600000}`); // Session valid for 1 hour
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      return true;
    }
    return false;
  },
  
  isAdminAuthenticated: (): boolean => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return false;
    try {
      const decoded = atob(token);
      const [user, expiry] = decoded.split(':');
      return user === 'admin' && parseInt(expiry) > Date.now();
    } catch {
      return false;
    }
  },

  clearAdminSession: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  // Services
  getServices: (): Service[] => {
    const data = localStorage.getItem(SERVICES_KEY);
    if (!data) {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(SERVICES));
      return SERVICES;
    }
    return JSON.parse(data);
  },

  addService: (service: Service) => {
    const services = dbService.getServices();
    services.push(service);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  },

  updateService: (updatedService: Service) => {
    const services = dbService.getServices();
    const index = services.findIndex(s => s.id === updatedService.id);
    if (index !== -1) {
      services[index] = updatedService;
      localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
    }
  },

  deleteService: (id: string) => {
    const services = dbService.getServices();
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(SERVICES_KEY, JSON.stringify(filtered));
  },

  // Addons
  getAddons: (): Addon[] => {
    const data = localStorage.getItem(ADDONS_KEY);
    if (!data) {
      localStorage.setItem(ADDONS_KEY, JSON.stringify(ADDONS));
      return ADDONS;
    }
    return JSON.parse(data);
  },

  addAddon: (addon: Addon) => {
    const addons = dbService.getAddons();
    addons.push(addon);
    localStorage.setItem(ADDONS_KEY, JSON.stringify(addons));
  },

  updateAddon: (updatedAddon: Addon) => {
    const addons = dbService.getAddons();
    const index = addons.findIndex(a => a.id === updatedAddon.id);
    if (index !== -1) {
      addons[index] = updatedAddon;
      localStorage.setItem(ADDONS_KEY, JSON.stringify(addons));
    }
  },

  deleteAddon: (id: string) => {
    const addons = dbService.getAddons();
    const filtered = addons.filter(a => a.id !== id);
    localStorage.setItem(ADDONS_KEY, JSON.stringify(filtered));
  },

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
      const officialServices = dbService.getServices();
      const officialAddons = dbService.getAddons();
      
      const validatedServices = appointment.services.map(s => officialServices.find(os => os.id === s.id) || s);
      const validatedAddons = appointment.addons.map(a => officialAddons.find(oa => oa.id === a.id) || a);
      
      const correctedAppointment = {
        ...appointment,
        services: validatedServices,
        addons: validatedAddons,
        totalPrice: validatedServices.reduce((acc, s) => acc + s.price, 0) + 
                    validatedAddons.reduce((acc, a) => acc + a.price, 0)
      };

      const appointments = dbService.getAppointments();
      appointments.push(correctedAppointment);
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
        localStorage.setItem(BARBERS_KEY, JSON.stringify(BARBERS));
        return BARBERS;
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
    } catch (e) {
      console.error("Erro ao excluir barbeiro:", e);
    }
  }
};
