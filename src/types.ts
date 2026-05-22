/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Cabana {
  id: string;
  nombre: string;
  tipo: 'Familiar' | 'Suite' | 'Domo' | 'Bungalow';
  estado: 'Disponible' | 'Mantenimiento' | 'Ocupada';
  precioBase: number;
  descripcion: string;
  superficie: number;
  habitaciones: number;
  banos: number;
  camas: number;
  capacidad: number;
  imagenUrl: string;
  lat: number;
  lng: number;
}

export interface Cliente {
  id: string;
  tipoDocumento: 'DNI' | 'Pasaporte' | 'Cédula';
  numeroDocumento: string;
  nacionalidad: string;
  ciudadOrigen: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  estado: 'activo' | 'bloqueado' | 'suspendido';
  redSocial: 'WhatsApp' | 'Instagram' | 'Facebook' | 'LinkedIn';
  redSocialUser: string;
  notas: string;
  fechaRegistro: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  tipoCobro: 'Por persona' | 'Por día' | 'Pago único';
  tipoPago: 'Transferencia' | 'Efectivo' | 'Tarjeta';
  estado: 'Borrador' | 'Activo';
}

export interface Reserva {
  id: string;
  clienteId: string;
  cabanaId: string;
  fechaReserva: string;
  checkIn: string;
  checkOut: string;
  noches: number;
  cantidadPersonas: number;
  canalVentas: 'WhatsApp' | 'Facebook' | 'Instagram' | 'Airbnb' | 'Directo' | 'Booking' | 'Otros';
  montoTotal: number;
  montoAnticipo: number;
  estadoReserva: 'Confirmada' | 'Pendiente de Pago' | 'Cancelada' | 'En Espera';
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia';
}

export interface ContratacionServicio {
  id: string;
  reservaId: string;
  clienteId: string;
  servicioId: string;
  fecha: string;
  precioPactado: number;
  cantidad: number;
  subtotal: number;
  estadoPago: 'Pendiente' | 'Parcial' | 'Pagado';
  medioPago: 'Transferencia' | 'Efectivo' | 'Tarjeta';
}

// Initial mockup data corresponding to screenshots

export const INITIAL_CABANAS: Cabana[] = [
  {
    id: "CAB-01",
    nombre: "Cabaña Roble",
    tipo: "Familiar",
    estado: "Disponible",
    precioBase: 240,
    descripcion: "Un susurro entre las copas de los árboles. Experimente la serenidad total en esta cabaña de diseño vanguardista, rodeada de robles centenarios.",
    superficie: 85,
    habitaciones: 2,
    banos: 2,
    camas: 3,
    capacidad: 4,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxrtUAVIglEIWIisOMH9aOAzaquJaqu11dTxHKZGURkwzs3X5_LcklgoC2TjMHXVAdl-_WmllevrPJBNTlbpUdOElWd1wcKH6o_ZWdzPxb3EjdwATZr7NiJ9okTjq1_Aqw0IkZsDAASGI7pOYLBoCcSvbmJ_ycRJBbpK-5zGFaV-bC2mINxYave09_Fv8kufQVX7qLqCD9n2Ab3lBG0XqQszkyf4UfAkCApgijQGnCePNy2QLze7Y3wSi9arP9jkptXBUUNZZzxosd",
    lat: -41.132,
    lng: -71.305
  },
  {
    id: "CAB-02",
    nombre: "Refugio Niebla",
    tipo: "Suite",
    estado: "Ocupada",
    precioBase: 180,
    descripcion: "Donde el tiempo se detiene al amanecer. Una cabaña íntima durante el crepúsculo con un hermoso exterior de nogal y acentos de piedra.",
    superficie: 55,
    habitaciones: 1,
    banos: 1,
    camas: 1,
    capacidad: 2,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA6McmB_VhL1M27nNmsifaTZxXnHbPMJty58ET5MrUA_-JkCxhZpl6_73SZXA236pCxf7uvpB5CMczQNNqtdW0Em98xyG4Wlp7N8xKJZOAD2hDwjjdewGFEiT3D6McBKihUXgoFA2hRcPmUJyIyAjJ1e8pFYnZtkLj6O2j2aqoprHBb89Gxt4PhnDxuuvNGDv7czg_sX2Dhv_N-1gC9d1pLe6XokseNoT7kUW3ZpOYI227CMXPnWWkN7VG6bJlBsxfkgsLF4gxj9p98",
    lat: -41.140,
    lng: -71.312
  },
  {
    id: "CAB-03",
    nombre: "Mirador Alpino",
    tipo: "Domo",
    estado: "Mantenimiento",
    precioBase: 310,
    descripcion: "Vistas infinitas hacia el corazón del bosque. Un gran domo de madera con terraza espaciosa con magníficas vistas al bosque de alta montaña.",
    superficie: 120,
    habitaciones: 3,
    banos: 2,
    camas: 5,
    capacidad: 6,
    imagenUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZKy2ZINx6LgZYBTsFFP6pxoKhuWZWIMBa53qDCJ-hlWBSjstitF8RFbj50SFnNU6ieRa9m2pR7-zq2XhXZsXWbC-4WSBauSTKfyCzVJlNq-A2GphjoOwwjOtD0YFCTz23aWnPTH5jmgiuiziko5hJtiEq4JF8Tcn8mGYMntANI8yohBtUR90A6vcPCVxLxEEeFraKkmlv4OpfbC4-P1I9m-plvj5dXlq6H7I4YVpRzEol0m24KW6vQ9K0HeWiobcjZxkTiAKWyUEB",
    lat: -41.125,
    lng: -71.298
  }
];

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: "CLI-2024-AUTO",
    tipoDocumento: "DNI",
    numeroDocumento: "45.321.987",
    nacionalidad: "Argentina",
    ciudadOrigen: "Mendoza",
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan.perez@email.com",
    telefono: "+54 9 11 1234-5678",
    fechaNacimiento: "1988-06-15",
    estado: "activo",
    redSocial: "WhatsApp",
    redSocialUser: "+5491112345678",
    notas: "Huésped recurrente, prefiere almohadas extra suaves y café orgánico en la cabaña.",
    fechaRegistro: "2024-05-24"
  },
  {
    id: "CLI-77824",
    tipoDocumento: "Pasaporte",
    numeroDocumento: "AA345678",
    nacionalidad: "Chile",
    ciudadOrigen: "Santiago",
    nombre: "Evelyn",
    apellido: "Villarroel",
    email: "evelyn.v@email.com",
    telefono: "+56 9 8765-4321",
    fechaNacimiento: "1994-11-20",
    estado: "activo",
    redSocial: "Instagram",
    redSocialUser: "@evelyn_villa",
    notas: "Viene por festejo de aniversario. Le gusta hacer senderismo en la mañana.",
    fechaRegistro: "2024-05-18"
  },
  {
    id: "CLI-77825",
    tipoDocumento: "Cédula",
    numeroDocumento: "19.876.543-2",
    nacionalidad: "Chile",
    ciudadOrigen: "Valparaíso",
    nombre: "Gerardo",
    apellido: "Sandoval",
    email: "g.sandoval@email.com",
    telefono: "+56 9 5555-1234",
    fechaNacimiento: "1985-04-02",
    estado: "activo",
    redSocial: "WhatsApp",
    redSocialUser: "+56955551234",
    notas: "Trae un perro pastor alemán entrenado como asistencia. Alergias a la nuez.",
    fechaRegistro: "2024-05-19"
  },
  {
    id: "CLI-77826",
    tipoDocumento: "DNI",
    numeroDocumento: "23.456.789",
    nacionalidad: "Argentina",
    ciudadOrigen: "Neuquén",
    nombre: "Marioly",
    apellido: "Jara",
    email: "marioly.jara@email.com",
    telefono: "+54 299 432-1098",
    fechaNacimiento: "1990-09-12",
    estado: "activo",
    redSocial: "Facebook",
    redSocialUser: "marioly.jara",
    notas: "Huésped ejecutiva. Requiere buena conexión WiFi para reuniones nocturnas.",
    fechaRegistro: "2024-05-20"
  }
];

export const INITIAL_SERVICIOS: Servicio[] = [
  {
    id: "01",
    nombre: "Tour de Senderismo Nocturno",
    descripcion: "Explora los misterios del bosque bajo la luz de las estrellas con guía certificado de montaña.",
    precio: 35.00,
    tipoCobro: "Por persona",
    tipoPago: "Efectivo",
    estado: "Activo"
  },
  {
    id: "02",
    nombre: "Desayuno de Campo en Cabaña",
    descripcion: "Canasta con panes calientes recién horneados, quesos, mermeladas regionales, jugo y café.",
    precio: 15.00,
    tipoCobro: "Por persona",
    tipoPago: "Transferencia",
    estado: "Activo"
  },
  {
    id: "03",
    nombre: "Sauna Finlandés & Tina Caliente",
    descripcion: "Sesión privada de relajación de 2 horas en nuestro sauna de cedro con vistas a los pinos.",
    precio: 60.00,
    tipoCobro: "Pago único",
    tipoPago: "Tarjeta",
    estado: "Activo"
  },
  {
    id: "08",
    nombre: "Lavandería Express",
    descripcion: "Servicio de lavado, Secado y planchado express de prendas delicadas de aventura.",
    precio: 10.00,
    tipoCobro: "Pago único",
    tipoPago: "Efectivo",
    estado: "Borrador"
  }
];

export const INITIAL_RESERVAS: Reserva[] = [
  {
    id: "RES-77824",
    clienteId: "CLI-77824", // Evelyn Villarroel
    cabanaId: "CAB-01",    // Cabaña Roble (Familiar)
    fechaReserva: "2024-05-18",
    checkIn: "2024-06-12",
    checkOut: "2024-06-15",
    noches: 3,
    cantidadPersonas: 3,
    canalVentas: "Directo",
    montoTotal: 720.00,
    montoAnticipo: 200.00,
    estadoReserva: "Confirmada",
    metodoPago: "Transferencia"
  },
  {
    id: "RES-77825",
    clienteId: "CLI-77825", // Gerardo Sandoval
    cabanaId: "CAB-02",    // Refugio Niebla (Suite)
    fechaReserva: "2024-05-19",
    checkIn: "2024-05-28",
    checkOut: "2024-05-30",
    noches: 2,
    cantidadPersonas: 2,
    canalVentas: "Airbnb",
    montoTotal: 360.00,
    montoAnticipo: 360.00,
    estadoReserva: "Confirmada",
    metodoPago: "Tarjeta"
  },
  {
    id: "RES-77826",
    clienteId: "CLI-77826", // Marioly Jara
    cabanaId: "CAB-03",    // Domo Mirador Alpino
    fechaReserva: "2024-05-20",
    checkIn: "2024-06-11",
    checkOut: "2024-06-14",
    noches: 3,
    cantidadPersonas: 2,
    canalVentas: "Booking",
    montoTotal: 930.00,
    montoAnticipo: 400.00,
    estadoReserva: "Confirmada",
    metodoPago: "Tarjeta"
  }
];

export const INITIAL_CONTRATACIONES: ContratacionServicio[] = [
  {
    id: "CON-01",
    reservaId: "RES-77824",
    clienteId: "CLI-77824",
    servicioId: "01", // Tour de Senderismo
    fecha: "2024-06-13",
    precioPactado: 35.00,
    cantidad: 3,
    subtotal: 105.00,
    estadoPago: "Pagado",
    medioPago: "Efectivo"
  },
  {
    id: "CON-02",
    reservaId: "RES-77824",
    clienteId: "CLI-77824",
    servicioId: "02", // Desayuno de campo
    fecha: "2024-06-12",
    precioPactado: 15.00,
    cantidad: 3,
    subtotal: 45.00,
    estadoPago: "Pendiente",
    medioPago: "Transferencia"
  }
];
