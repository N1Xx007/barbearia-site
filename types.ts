
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  description: string;
  icon: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string;
  availableDays: number[]; // 0 (Dom) a 6 (Sab)
  availableHours: string[]; // Lista de strings "HH:mm"
}

export interface Appointment {
  id: string;
  services: Service[];
  addons: Addon[];
  barber: Barber;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  totalPrice: number;
  totalDuration: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export type ViewState = 'HOME' | 'BOOKING' | 'MY_APPOINTMENTS' | 'AI_STYLING' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';
