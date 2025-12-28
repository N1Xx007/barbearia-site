
import { Service, Barber, Addon } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte Clássico',
    price: 60,
    duration: 45,
    description: 'Corte de cabelo tradicional com acabamento premium e lavagem.',
    icon: 'fa-scissors'
  },
  {
    id: 's2',
    name: 'Barba de Respeito',
    price: 45,
    duration: 30,
    description: 'Design de barba com toalha quente e massagem facial.',
    icon: 'fa-razor'
  },
  {
    id: 's3',
    name: 'Combo Master',
    price: 95,
    duration: 75,
    description: 'Experiência completa: Corte de cabelo + Barba + Bebida de cortesia.',
    icon: 'fa-crown'
  },
  {
    id: 's4',
    name: 'Corte Infantil',
    price: 50,
    duration: 40,
    description: 'Corte especial para os pequenos cavalheiros.',
    icon: 'fa-child'
  }
];

export const ADDONS: Addon[] = [
  {
    id: 'a1',
    name: 'Hidratação Facial',
    price: 25,
    duration: 15,
    description: 'Máscara hidratante e relaxante.'
  },
  {
    id: 'a2',
    name: 'Sobrancelha',
    price: 15,
    duration: 10,
    description: 'Limpeza e design de sobrancelha.'
  },
  {
    id: 'a3',
    name: 'Pigmentação de Barba',
    price: 30,
    duration: 20,
    description: 'Preenchimento de falhas com tintura especial.'
  }
];

// Defined available times before BARBERS to allow reference
export const AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

// Added missing required properties to satisfy Barber interface
export const BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Carlos "The Blade"',
    role: 'Master Barber',
    avatar: 'https://picsum.photos/seed/carlos/200',
    specialty: 'Fades e Degradês',
    availableDays: [1, 2, 3, 4, 5, 6],
    availableHours: AVAILABLE_TIMES
  },
  {
    id: 'b2',
    name: 'Vinícius Vintage',
    role: 'Senior Barber',
    avatar: 'https://picsum.photos/seed/vinny/200',
    specialty: 'Cortes Clássicos e Navalha',
    availableDays: [1, 2, 3, 4, 5, 6],
    availableHours: AVAILABLE_TIMES
  },
  {
    id: 'b3',
    name: 'Sarah Style',
    role: 'Top Stylist',
    avatar: 'https://picsum.photos/seed/sarah/200',
    specialty: 'Visagismo e Barbas Modernas',
    availableDays: [1, 2, 3, 4, 5, 6],
    availableHours: AVAILABLE_TIMES
  }
];
