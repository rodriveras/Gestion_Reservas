/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Link as LinkIcon, DollarSign } from "lucide-react";
import { Cabana, Cliente, Servicio, Reserva, ContratacionServicio } from "../types";

interface ServiceContractFormProps {
  clientes: Cliente[];
  servicios: Servicio[];
  reservas: Reserva[];
  cabanas: Cabana[];
  onSave: (contract: ContratacionServicio) => void;
  onBack: () => void;
}

export default function ServiceContractForm({ clientes, servicios, reservas, cabanas, onSave, onBack }: ServiceContractFormProps) {
  const [reservaId, setReservaId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0]);
  const [precioPactado, setPrecioPactado] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [estadoPago, setEstadoPago] = useState<"Pendiente" | "Pagado">("Pendiente");
  const [medioPago, setMedioPago] = useState<"Transferencia" | "Efectivo" | "Tarjeta">("Transferencia");

  // Service validation state
  const selectedServiceObj = servicios.find((s) => s.id === servicioId);
  const isServiceInMaintenance = selectedServiceObj?.estado === "Mantenimiento";
  const isServiceActive = selectedServiceObj ? selectedServiceObj.estado === "Activo" : true;

  // Filter clients to only those who have at least one active (not Cancelled) reservation
  const clientsWithActiveReservas = clientes.filter((c) =>
    (reservas || []).some((r) => r.clienteId === c.id && r.estadoReserva !== "Cancelada")
  );

  // Explicit event-driven handlers to avoid coupled useEffect loops
  const handleClienteChange = (val: string) => {
    setClienteId(val);
    if (val) {
      const bk = (reservas || []).find((r) => r.clienteId === val && r.estadoReserva !== "Cancelada");
      if (bk) {
        setReservaId(bk.id);
      } else {
        setReservaId("");
      }
    } else {
      setReservaId("");
    }
  };

  const handleReservaChange = (val: string) => {
    setReservaId(val);
    if (val) {
      const bk = reservas.find((r) => r.id === val);
      if (bk) {
        setClienteId(bk.clienteId);
      }
    }
  };

  const handleServicioChange = (val: string) => {
    setServicioId(val);
    if (val) {
      const srv = servicios.find((s) => s.id === val);
      if (srv) {
        setPrecioPactado(srv.precio.toString());
        if (srv.estado !== "Activo") {
          alert(`¡Advertencia! El servicio seleccionado "${srv.nombre}" está en estado "${srv.estado}". Solo se permite guardar contrataciones para servicios en estado "Activo".`);
        }
      }
    } else {
      setPrecioPactado("");
    }
  };

  const autoId = `CON-${Math.floor(100 + Math.random() * 900)}`;

  // Subtotal calculated dynamically
  const parsedPrice = Number(precioPactado) || 0;
  const parsedQty = Number(cantidad) || 1;
  const calculatedSubtotal = parsedPrice * parsedQty;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reservaId || !clienteId || !servicioId) return;

    if (selectedServiceObj && selectedServiceObj.estado !== "Activo") {
      alert(`Error: El servicio seleccionado no se encuentra activo (Estado: ${selectedServiceObj.estado}).`);
      return;
    }

    const newContractValue: ContratacionServicio = {
      id: autoId,
      reservaId,
      clienteId,
      servicioId,
      fecha,
      precioPactado: parsedPrice,
      cantidad: parsedQty,
      subtotal: calculatedSubtotal,
      estadoPago,
      medioPago,
    };

    alert("¡Contratación de servicio guardada satisfactoriamente!");
    onSave(newContractValue);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <span className="text-[10px] font-sans font-bold text-[#f6bb89] uppercase tracking-widest block mb-1">
          Vinculación de Servicios Adicionales
        </span>
        <h2 className="text-3xl font-headline font-bold text-[#b2ceb4]">
          Contratar Servicio
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {/* Section 1: Detalles del Vínculo */}
        <section className="bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#D29B6C] border-x border-b border-neutral-850 shadow-md space-y-5">
          <h3 className="text-base font-sans font-bold text-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-neutral-850">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4.5 h-4.5 text-[#f6bb89]" />
              <span>Detalles del Vínculo</span>
            </div>
            {/* Warning banner removed from here and relocated next to label */}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Seleccionar Cliente (Auto filled or selected) */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                Seleccionar Cliente
              </label>
              <div className="relative">
                <select
                  required
                  value={clienteId}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  className="w-full pl-10 pr-10 bg-[#121412] text-[#e2e3df] border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs outline-none appearance-none cursor-pointer"
                >
                  <option value="">Buscar cliente...</option>
                  {clientsWithActiveReservas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido}
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

            {/* Select Reserva ID */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                IDE Reserva Cabaña
              </label>
              <div className="relative">
                <select
                  required
                  value={reservaId}
                  onChange={(e) => handleReservaChange(e.target.value)}
                  className="w-full pl-10 pr-10 bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-semibold outline-none appearance-none"
                >
                  <option value="">Seleccione una reserva...</option>
                  {reservas
                    .filter((r) => r.estadoReserva !== "Cancelada" && (!clienteId || r.clienteId === clienteId))
                    .map((r) => {
                      const cabin = cabanas.find((c) => c.id === r.cabanaId);
                      const cabinName = cabin ? cabin.nombre : "Cabaña Desconocida";
                      return (
                        <option key={r.id} value={r.id}>
                          {r.id} ({cabinName})
                        </option>
                      );
                    })}
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-550 text-sm">
                  confirmation_number
                </span>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Seleccionar Servicio */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                  Seleccionar Servicio
                </label>
                {selectedServiceObj && selectedServiceObj.estado !== "Activo" && (
                  <button
                    type="button"
                    onClick={() => alert(`Advertencia: El servicio "${selectedServiceObj.nombre}" tiene estado "${selectedServiceObj.estado}". Solo los servicios en estado "Activo" se pueden contratar.`)}
                    className="flex items-center gap-1.5 px-2 py-0.5 bg-red-950/80 hover:bg-red-900/60 text-red-400 border border-red-900/40 rounded text-[9px] font-sans font-bold uppercase tracking-wider animate-pulse shadow-sm cursor-pointer"
                  >
                    <span>⚠️ No Activo ({selectedServiceObj.estado})</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <select
                  required
                  value={servicioId}
                  onChange={(e) => handleServicioChange(e.target.value)}
                  className="w-full pl-10 pr-10 bg-[#121412] text-[#e2e3df] border border-neutral-700/80 focus:border-[#b2ceb4] rounded-lg p-3 text-xs outline-none appearance-none cursor-pointer"
                >
                  <option value="">Buscar servicio...</option>
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} – ${s.precio} ({s.tipoCobro})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-450 text-sm">
                  dry_cleaning
                </span>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Condiciones y Valores */}
        <section className="bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#D29B6C] border-x border-b border-neutral-850 shadow-md space-y-5">
          <h3 className="text-base font-sans font-bold text-neutral-100 flex items-center gap-2 pb-2 border-b border-neutral-850">
            <span className="material-symbols-outlined text-[#f6bb89] font-bold">payments</span>
            Condiciones y Valores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Fecha contratación */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                Fecha de Contratación
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-medium outline-none"
              />
            </div>

            {/* Precio Pactado */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                Precio Pactado (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-xs">$</span>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={precioPactado}
                  onChange={(e) => setPrecioPactado(e.target.value)}
                  className="w-full pl-6 pr-4 bg-[#121412] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs outline-none font-bold"
                />
              </div>
            </div>

            {/* Cantidad */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                Cantidad
              </label>
              <input
                type="number"
                required
                min={1}
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full bg-[#121412] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-bold outline-none"
              />
            </div>

            {/* Subtotal calculated block */}
            <div className="space-y-1">
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
                Subtotal
              </label>
              <div className="bg-[#292a28] rounded-lg p-3 border border-neutral-800 flex justify-between items-center min-h-[46px]">
                <span className="text-[10px] text-neutral-400 uppercase font-sans font-semibold">Cálculo automático</span>
                <span className="text-sm font-headline font-bold text-[#b2ceb4]">${calculatedSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Estado y Pago */}
        <section className="bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#D29B6C] border-x border-b border-neutral-850 shadow-md space-y-5">
          <h3 className="text-base font-sans font-bold text-neutral-100 flex items-center gap-2 pb-2 border-b border-neutral-850">
            <span className="material-symbols-outlined text-[#f6bb89] font-bold">verified_user</span>
            Estado y Pago
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                Estado del Pago
              </label>
              <div className="relative">
                <select
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs outline-none appearance-none"
                >
                  <option value="Pendiente">Pendiente de Pago</option>
                  <option value="Pagado">Pagado</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                Medio de Pago
              </label>
              <div className="relative">
                <select
                  value={medioPago}
                  onChange={(e) => setMedioPago(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs outline-none appearance-none"
                >
                  <option value="Transferencia">Transferencia</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Triggers */}
        <div className="flex flex-col md:flex-row gap-4 justify-end pt-4 border-t border-neutral-900">
          <button
            type="button"
            onClick={onBack}
            className="md:px-8 py-3.5 rounded-lg border border-[#D29B6C] text-[#f6bb89] hover:bg-neutral-850 transition-all font-sans font-semibold text-xs uppercase tracking-widest active:scale-95 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            id="submit-contract-service"
            type="submit"
            disabled={!reservaId || !clienteId || !servicioId}
            className="md:px-8 py-3.5 bg-[#4a634e] text-white rounded-lg font-sans font-bold text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Guardar Contratación
          </button>
        </div>
      </form>
    </motion.div>
  );
}
