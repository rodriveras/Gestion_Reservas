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
  slogan?: string;
}

export interface Cliente {
  id: string;
  tipoDocumento: 'CEDULA' | 'Pasaporte' | 'Cédula';
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
  estado: 'Borrador' | 'Activo' | 'Mantenimiento';
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
  estadoReserva: 'Confirmada' | 'Pendiente de Pago' | 'Cancelada' | 'En Espera' | 'Pagada';
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

// Empty mockup data lists for production deployment

export const INITIAL_CABANAS: Cabana[] = [];

export const INITIAL_CLIENTES: Cliente[] = [];

export const INITIAL_SERVICIOS: Servicio[] = [];

export const INITIAL_RESERVAS: Reserva[] = [];

export const INITIAL_CONTRATACIONES: ContratacionServicio[] = [];

export interface Administracion {
  id: string;
  Nombre_complejo: string;
  Usuario?: string;
  Contrasena?: string;
  Telefono?: string;
  Whatsapp?: string;
}


