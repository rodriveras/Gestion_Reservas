/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Plus, ShieldAlert, Award } from "lucide-react";
import { Servicio } from "../types";

interface ServiceFormProps {
  servicios?: Servicio[];
  onSave: (service: Servicio) => void;
  onBack: () => void;
}

export default function ServiceForm({ servicios = [], onSave, onBack }: ServiceFormProps) {
  const [isEditingState, setIsEditingState] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipoCobro, setTipoCobro] = useState<"Por persona" | "Por día" | "Pago único">("Por persona");
  const [tipoPago, setTipoPago] = useState<"Transferencia" | "Efectivo" | "Tarjeta">("Transferencia");
  const [estado, setEstado] = useState<"Borrador" | "Activo" | "Mantenimiento">("Activo");

  const [newServiceId] = useState(() => String(Math.floor(10 + Math.random() * 90)));

  const targetId = isEditingState && selectedServiceId ? selectedServiceId : newServiceId;

  const handleSelectServiceToEdit = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const serv = servicios.find((s) => s.id === serviceId);
    if (serv) {
      setNombre(serv.nombre || "");
      setDescripcion(serv.descripcion || "");
      setPrecio((serv.precio || 0).toString());
      setTipoCobro(serv.tipoCobro || "Por persona");
      setTipoPago(serv.tipoPago || "Transferencia");
      setEstado(serv.estado || "Activo");
    } else {
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setTipoCobro("Por persona");
      setTipoPago("Transferencia");
      setEstado("Activo");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const newService: Servicio = {
      id: targetId,
      nombre,
      descripcion: descripcion || "Servicio premium complementario para su estancia.",
      precio: Number(precio) || 0.00,
      tipoCobro,
      tipoPago,
      estado,
    };

    alert(isEditingState ? "¡Servicio actualizado satisfactoriamente!" : "¡Servicio guardado satisfactoriamente!");
    onSave(newService);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header text */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-900">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-3xl font-headline font-bold text-[#b2ceb4]">
              {isEditingState ? "Editar Servicio" : "Nuevo Servicio"}
            </h2>
            {servicios && servicios.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingState(!isEditingState);
                    if (isEditingState) {
                      handleSelectServiceToEdit("");
                    }
                  }}
                  className={`flex items-center gap-2 px-4.5 py-2.5 text-xs font-sans font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg ${
                    isEditingState
                      ? "bg-[#1b1e1b] text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800"
                      : "bg-[#4a634e] text-white hover:bg-[#5b7a60] border border-[#b2ceb4]/40 shadow-emerald-950/40"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {isEditingState ? "Modo Nuevo Servicio" : "Editar Servicio"}
                </button>

                {isEditingState && (
                  <div className="relative">
                    <select
                      value={selectedServiceId}
                      onChange={(e) => handleSelectServiceToEdit(e.target.value)}
                      className="pl-3 pr-8 py-2 bg-[#121412] text-xs font-medium text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg outline-none appearance-none cursor-pointer min-w-[200px]"
                    >
                      <option value="">-- Seleccione Servicio --</option>
                      {servicios.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} (${s.precio})
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none text-sm">
                      expand_more
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* State Tag badge */}
        <div className="bg-[#1b1e1b] border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3 self-start md:self-auto">
          <span className="text-[10px] font-sans font-bold text-[#f6bb89] uppercase tracking-wider">
            ESTADO:
          </span>
          <span className="bg-[#4a634e]/30 text-[#b2ceb4] px-2.5 py-0.5 rounded-full text-xs font-bold uppercase">
            {estado}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        {/* Left Inputs- 12 columns */}
        <div className="lg:col-span-12">
          <div className="bg-[#1b1e1b] border-t-2 border-[#D29B6C] border-x border-b border-neutral-800/40 rounded-xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* ID de Servicio */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  ID de Servicio
                </label>
                <div className="bg-[#121412] border border-neutral-800/80 p-3.5 rounded-lg flex items-center justify-between">
                  <span className="font-headline text-lg font-semibold text-[#f6bb89]">{targetId}</span>
                  <span className="material-symbols-outlined text-neutral-600 text-sm">lock</span>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1.5">Generado automáticamente por el sistema</p>
              </div>

              {/* Nombre del servicio */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Nombre del Servicio
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tour de Senderismo Nocturno"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.slice(0, 30))}
                  maxLength={30}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3.5 text-sm outline-none transition-all"
                />
              </div>

              {/* Descripción */}
              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Breve descripción de las actividades y beneficios incluidos..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value.slice(0, 100))}
                  maxLength={100}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-4 text-sm outline-none transition-all resize-none"
                />
                <div className="text-right text-[10px] text-neutral-500 mt-1">
                  {descripcion.length} / 100 caracteres
                </div>
              </div>

              {/* Precio Actual */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Precio Actual (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f6bb89] font-bold text-sm">$</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3.5 pl-8 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tipo de Cobro */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Tipo de Cobro
                </label>
                <div className="relative">
                  <select
                    value={tipoCobro}
                    onChange={(e) => setTipoCobro(e.target.value as any)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3.5 pr-10 text-sm outline-none appearance-none cursor-pointer"
                  >
                    <option value="Por persona">Por persona</option>
                    <option value="Por día">Por día</option>
                    <option value="Pago único">Pago único</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Tipo de Pago Admitido */}
              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Tipo de Pago Admitido
                </label>
                <div className="relative">
                  <select
                    value={tipoPago}
                    onChange={(e) => setTipoPago(e.target.value as any)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3.5 pr-10 text-sm outline-none appearance-none cursor-pointer"
                  >
                    <option value="Transferencia">Transferencia</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Estado control */}
              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Estado al Guardar
                </label>
                <div className="relative">
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as any)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3.5 pr-10 text-sm outline-none appearance-none cursor-pointer"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Borrador">Inactivo</option>
                    <option value="Mantenimiento">Mantención</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#b2ceb4]">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons inside Card */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10 border-t border-neutral-900 pt-6">
              <button
                id="submit-new-service"
                type="submit"
                className="flex-1 bg-[#4a634e] text-white py-4 rounded-lg font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
              >
                <Save className="w-4 h-4" />
                Guardar Servicio
              </button>
              <button
                type="button"
                onClick={onBack}
                className="flex-1 border border-[#D29B6C] text-[#f6bb89] py-4 rounded-lg font-semibold hover:bg-neutral-850 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
