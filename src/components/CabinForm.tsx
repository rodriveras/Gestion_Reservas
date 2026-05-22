/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, MapPin, Eye, Zap, Shield, Image as ImageIcon } from "lucide-react";
import { Cabana } from "../types";

interface CabinFormProps {
  onSave: (cabin: Cabana) => void;
  onBack: () => void;
}

export default function CabinForm({ onSave, onBack }: CabinFormProps) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"Familiar" | "Suite" | "Domo" | "Bungalow">("Familiar");
  const [estado, setEstado] = useState<"Disponible" | "Mantenimiento" | "Ocupada">("Disponible");
  const [precioBase, setPrecioBase] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [superficie, setSuperficie] = useState("45");
  const [habitaciones, setHabitaciones] = useState("2");
  const [banos, setBanos] = useState("1");
  const [camas, setCamas] = useState("3");
  const [capacidad, setCapacidad] = useState("4");
  const [imagenUrl, setImagenUrl] = useState("");
  const [coordenadas, setCoordenadas] = useState("-41.13, -71.30");

  const autoId = `CAB-2024-${Math.floor(100 + Math.random() * 900)}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const newCabin: Cabana = {
      id: autoId,
      nombre,
      tipo,
      estado,
      precioBase: Number(precioBase) || 150,
      descripcion: descripcion || "Cabaña rústica premium con todas las comodidades de montaña.",
      superficie: Number(superficie) || 45,
      habitaciones: Number(habitaciones) || 2,
      banos: Number(banos) || 1,
      camas: Number(camas) || 2,
      capacidad: Number(capacidad) || 4,
      imagenUrl: imagenUrl.trim() || "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&q=80&w=800",
      lat: Number(coordenadas.split(",")[0]) || -41.132,
      lng: Number(coordenadas.split(",")[1]) || -71.305,
    };

    onSave(newCabin);
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
        <h2 className="text-3xl font-headline font-bold text-[#b2ceb4]">
          Nueva Cabaña
        </h2>
        <p className="text-neutral-400 font-sans text-sm mt-1">
          Configuración e información técnica de la nueva unidad.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        {/* Left Inputs */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800/40 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <Zap className="w-5 h-5 text-[#f6bb89]" />
              <h3 className="text-base font-sans font-bold text-neutral-100">
                Información Principal
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ID Read Only */}
              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  ID de Cabaña
                </label>
                <input
                  type="text"
                  value={autoId}
                  readOnly
                  className="w-full bg-[#121412] text-neutral-500 border border-neutral-800/80 rounded-lg p-3 text-sm font-semibold opacity-75 cursor-not-allowed"
                />
              </div>

              {/* Nombre de la cabaña */}
              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Nombre de la Cabaña
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Refugio del Pinar"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm outline-none transition-all"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Tipo de Cabaña
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm outline-none"
                >
                  <option value="Familiar">Familiar</option>
                  <option value="Suite">Suite</option>
                  <option value="Domo">Domo</option>
                  <option value="Bungalow">Bungalow</option>
                </select>
              </div>

              {/* Estado Inicial */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Estado Inicial
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm outline-none"
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Ocupada">Ocupada</option>
                </select>
              </div>

              {/* Precio Base por Noche */}
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Precio Base por Noche (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f6bb89] font-bold text-sm">$</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={precioBase}
                    onChange={(e) => setPrecioBase(e.target.value)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 pl-7 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Descripción Detallada */}
              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                  Descripción Detallada
                </label>
                <textarea
                  rows={4}
                  placeholder="Describa las características únicas, vistas y comodidades..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Especificaciones Técnicas */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <Shield className="w-5 h-5" />
              <h3 className="text-base font-sans font-bold text-neutral-100">
                Especificaciones Técnicas
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1">
                  Superficie (m²)
                </label>
                <input
                  type="number"
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1">
                  Habitaciones
                </label>
                <input
                  type="number"
                  value={habitaciones}
                  onChange={(e) => setHabitaciones(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1">
                  Baños
                </label>
                <input
                  type="number"
                  value={banos}
                  onChange={(e) => setBanos(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1">
                  Camas
                </label>
                <input
                  type="number"
                  value={camas}
                  onChange={(e) => setCamas(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1">
                  Capacidad máx
                </label>
                <input
                  type="number"
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Multimedia */}
          <section className="bg-[#1e201e] rounded-xl p-5 border border-neutral-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-1 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <ImageIcon className="w-4 h-4" />
              <h3 className="text-sm font-sans font-bold text-neutral-100">
                Fotografía & Multimedia
              </h3>
            </div>

            <div className="aspect-video bg-[#121412] border-2 border-dashed border-neutral-800 rounded-xl flex flex-col items-center justify-center text-neutral-400 cursor-pointer hover:bg-neutral-900 hover:text-white transition-all group">
              {imagenUrl.trim() ? (
                <img src={imagenUrl.trim()} className="w-full h-full object-cover rounded-xl" alt="Preview" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl mb-2 group-hover:scale-105 transition-transform text-[#b2ceb4]">
                    add_a_photo
                  </span>
                  <p className="text-xs font-semibold">Previsualizar Fotografía</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase mb-1.5">
                O pegue el URL de la imagen
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
              />
            </div>
          </section>

          {/* Location details */}
          <section className="bg-[#1e201e] rounded-xl p-5 border border-neutral-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-1 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <MapPin className="w-4 h-4" />
              <h3 className="text-sm font-sans font-bold text-neutral-100">
                Ubicación Satelital
              </h3>
            </div>

            <div className="relative overflow-hidden rounded-lg h-36 border border-neutral-800 bg-[#121412]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDspbPtfjOiXaRBkzV6wbPJ0savthgyb-W5sYBoK4jUPj-B2CN0SPJGjIaKaJqMv5tKNpz5ZVH57al3oTkheFn9dBhZrjurb66ms0CoURo8Ogla7xr22tubZl6slG_g7I1UxX2Ircu4SMY5tsWws6ZZTwAGp0KdxKGpXETVYdqNXRXToAmx7o17RkzC_TJ7UGf7uPWxI3cRcmgmkAqc7HKIT7YJ9AMPvIA9fLG1BpmvEtRmK2ubsPfisJyL2XvWtZnbVfiux0qQAzq3"
                alt="Map coordinate layout background"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#4a634e]/90 text-white flex items-center justify-center shadow-lg border border-[#b2ceb4]/40 animate-pulse">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold text-neutral-400 uppercase mb-1.5">
                Coordenadas (Lat, Long)
              </label>
              <input
                type="text"
                placeholder="-41.13, -71.30"
                value={coordenadas}
                onChange={(e) => setCoordenadas(e.target.value)}
                className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
              />
            </div>
          </section>

          {/* Buttons desktop */}
          <div className="space-y-3 pt-2">
            <button
              id="submit-new-cabin"
              type="submit"
              className="w-full py-4 bg-[#4a634e] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Cabaña
            </button>
            <button
              id="cancel-new-cabin"
              type="button"
              onClick={onBack}
              className="w-full text-center py-2.5 text-neutral-400 hover:text-white font-sans text-xs font-bold uppercase transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
