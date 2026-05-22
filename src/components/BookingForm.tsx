/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Sparkles, DollarSign, Calendar, Landmark, Users } from "lucide-react";
import { Cabana, Cliente, Reserva } from "../types";

interface BookingFormProps {
  cabanas: Cabana[];
  clientes: Cliente[];
  onSave: (booking: Reserva) => void;
  onBack: () => void;
}

export default function BookingForm({ cabanas, clientes, onSave, onBack }: BookingFormProps) {
  const [clienteId, setClienteId] = useState("");
  const [cabanaId, setCabanaId] = useState("");
  const [pasajeros, setPasajeros] = useState(2);
  const [entrada, setEntrada] = useState("2024-06-12");
  const [salida, setSalida] = useState("2024-06-15");
  const [canalVentas, setCanalVentas] = useState<Reserva["canalVentas"]>("Directo");
  const [montoTotal, setMontoTotal] = useState("");
  const [montoAnticipo, setMontoAnticipo] = useState("");
  const [estadoReserva, setEstadoReserva] = useState<Reserva["estadoReserva"]>("Confirmada");
  const [metodoPago, setMetodoPago] = useState<Reserva["metodoPago"]>("Efectivo");

  const bookingId = `LF-2024-${Math.floor(10000 + Math.random() * 90000)}`;

  // Calculate nights automatically
  const checkInDate = new Date(entrada);
  const checkOutDate = new Date(salida);
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const nochesCalculated = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;

  // Auto calculate total amount based on cabin selection and nights
  useEffect(() => {
    if (cabanaId) {
      const cabana = cabanas.find((c) => c.id === cabanaId);
      if (cabana) {
        const calculatedTotal = cabana.precioBase * nochesCalculated;
        setMontoTotal(calculatedTotal.toString());
        // set default deposit to 30% of total
        setMontoAnticipo(Math.round(calculatedTotal * 0.3).toString());
      }
    }
  }, [cabanaId, nochesCalculated, cabanas]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!clienteId || !cabanaId) return;

    const newBooking: Reserva = {
      id: bookingId,
      clienteId,
      cabanaId,
      fechaReserva: new Date().toISOString().split("T")[0],
      checkIn: entrada,
      checkOut: salida,
      noches: nochesCalculated,
      cantidadPersonas: pasajeros,
      canalVentas,
      montoTotal: Number(montoTotal) || 0,
      montoAnticipo: Number(montoAnticipo) || 0,
      estadoReserva,
      metodoPago,
    };

    onSave(newBooking);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-900">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-3xl font-headline font-bold text-[#b2ceb4]">
            Nueva Reserva
          </h2>
          <p className="text-neutral-400 font-sans text-sm mt-1 font-medium">
            información de la nueva reserva
          </p>
        </div>

        <div className="bg-[#1b1e1b] px-4 py-2.5 rounded-xl border border-neutral-800 flex items-center gap-3">
          <span className="text-neutral-400 font-sans text-xs font-bold uppercase tracking-wider">
            ID DE RESERVA:
          </span>
          <span className="text-[#f6bb89] font-sans font-bold text-sm tracking-widest">{bookingId}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section: Customer & Unit selection */}
          <div className="lg:col-span-7 bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
            <h3 className="text-lg font-sans font-bold text-neutral-100 pb-2 border-b border-neutral-850 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#f6bb89]" />
              Cliente y Unidad
            </h3>

            <div className="space-y-5">
              {/* Select guest */}
              <div className="space-y-1">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                  Seleccionar Huésped
                </label>
                <div className="relative">
                  <select
                    required
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full pl-10 pr-10 bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-medium outline-none appearance-none"
                  >
                    <option value="">Buscar un cliente existente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido} — {c.numeroDocumento} {c.id === "CLI-2024-AUTO" ? "(AUTO)" : ""}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                    person
                  </span>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Select cabin */}
              <div className="space-y-1">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                  Cabaña (Selección de Unidad)
                </label>
                <div className="relative">
                  <select
                    required
                    value={cabanaId}
                    onChange={(e) => setCabanaId(e.target.value)}
                    className="w-full pl-10 pr-10 bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-medium outline-none appearance-none"
                  >
                    <option value="">Elegir una propiedad...</option>
                    {cabanas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} (Capacidad: {c.capacidad} Pers.) — ${c.precioBase}/Noche
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                    cottage
                  </span>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Booking date & Head count passengers counter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                    Fecha de Reserva
                  </label>
                  <div className="relative bg-[#121412]/60 border border-neutral-800 rounded-lg p-3 text-xs font-medium text-neutral-500 select-none flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-600" />
                    <span>2024-05-20 (MOCK)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                    Cantidad de Personas
                  </label>
                  <div className="flex items-center bg-[#121412] border border-neutral-700 rounded-lg overflow-hidden h-11">
                    <button
                      type="button"
                      onClick={() => setPasajeros((p) => Math.max(1, p - 1))}
                      className="px-4 text-[#b2ceb4] hover:bg-neutral-800 text-sm font-bold h-full border-r border-neutral-800"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-xs text-neutral-200">
                      {pasajeros}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPasajeros((p) => Math.min(10, p + 1))}
                      className="px-4 text-[#b2ceb4] hover:bg-neutral-800 text-sm font-bold h-full border-l border-neutral-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Stay Details */}
          <div className="lg:col-span-5 bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
            <h3 className="text-lg font-sans font-bold text-neutral-100 pb-2 border-b border-neutral-850 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#f6bb89]" />
              Detalles de la Estadía
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#121412] border-l-4 border-[#f6bb89] rounded-r-lg">
                  <span className="block text-[10px] font-sans font-bold text-[#f6bb89] uppercase mb-1">
                    ENTRADA
                  </span>
                  <input
                    type="date"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-neutral-100 outline-none select-none border-none p-0 focus:ring-0"
                  />
                </div>

                <div className="p-3 bg-[#121412] border-l-4 border-[#f6bb89]/40 rounded-r-lg">
                  <span className="block text-[10px] font-sans font-bold text-[#f6bb89]/70 uppercase mb-1">
                    SALIDA
                  </span>
                  <input
                    type="date"
                    value={salida}
                    onChange={(e) => setSalida(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-neutral-100 outline-none select-none border-none p-0 focus:ring-0"
                  />
                </div>
              </div>

              {/* Nights indicator pill block */}
              <div className="flex items-center justify-center py-2.5 px-4 bg-[#121412] border border-neutral-800 rounded-full">
                <span className="text-xs text-neutral-400 font-sans font-medium">
                  Duración total:{" "}
                </span>
                <span className="ml-2 font-bold font-sans text-xs text-[#b2ceb4]">
                  {nochesCalculated} Noches
                </span>
              </div>

              {/* Sales Channel */}
              <div className="space-y-1 pt-2">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                  Canal de Ventas
                </label>
                <div className="relative">
                  <select
                    value={canalVentas}
                    onChange={(e) => setCanalVentas(e.target.value as any)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-semibold outline-none appearance-none"
                  >
                    <option value="Directo">Directo</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking">Booking</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Otros">Otros</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section financial details */}
        <div className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
          <h4 className="text-lg font-sans font-bold text-neutral-100 pb-2 border-b border-neutral-850 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#b2ceb4]" />
            Información Financiera
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Monto Total */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide">
                Monto Total (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#b2ceb4] text-sm">$</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={montoTotal}
                  onChange={(e) => setMontoTotal(e.target.value)}
                  className="w-full pl-7 pr-4 bg-[#121412] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm font-bold outline-none"
                />
              </div>
            </div>

            {/* Monto Anticipo */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide">
                Monto Anticipo / Depósito (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-sm">$</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={montoAnticipo}
                  onChange={(e) => setMontoAnticipo(e.target.value)}
                  className="w-full pl-7 pr-4 bg-[#121412] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm font-bold outline-none"
                />
              </div>
            </div>

            {/* Estado Reserva */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide">
                Estado de Reserva
              </label>
              <div className="relative">
                <select
                  value={estadoReserva}
                  onChange={(e) => setEstadoReserva(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-semibold outline-none appearance-none"
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Pendiente de Pago">Pendiente de Pago</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="En Espera">En Espera</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide">
                Método de Pago
              </label>
              <div className="relative">
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-semibold outline-none appearance-none"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-row gap-4 pt-6 border-t border-neutral-900">
          <button
            id="submit-new-booking"
            type="submit"
            className="flex-1 py-4 bg-[#4a634e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer"
          >
            <Save className="w-4 h-4 ml-1" />
            Guardar Reserva
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-neutral-800 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </form>
    </motion.div>
  );
}
