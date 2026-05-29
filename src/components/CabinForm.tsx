/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, MapPin, Eye, Zap, Shield, Image as ImageIcon, Edit } from "lucide-react";
import { Cabana } from "../types";

interface CabinFormProps {
  cabanas?: Cabana[];
  onSave: (cabin: Cabana) => void;
  onBack: () => void;
}

export default function CabinForm({ cabanas = [], onSave, onBack }: CabinFormProps) {
  const [isEditingState, setIsEditingState] = useState(false);
  const [selectedCabinId, setSelectedCabinId] = useState("");

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

  const [newCabinId] = useState(() => `CAB-2026-${Math.floor(100 + Math.random() * 900)}`);

  const handleSelectCabinToEdit = (cabinId: string) => {
    setSelectedCabinId(cabinId);
    const cab = cabanas.find((c) => c.id === cabinId);
    if (cab) {
      setNombre(cab.nombre || "");
      setTipo(cab.tipo || "Familiar");
      setEstado(cab.estado || "Disponible");
      setPrecioBase((cab.precioBase || 0).toString());
      setDescripcion(cab.descripcion || "");
      setSuperficie((cab.superficie || 45).toString());
      setHabitaciones((cab.habitaciones || 2).toString());
      setBanos((cab.banos || 1).toString());
      setCamas((cab.camas || 3).toString());
      setCapacidad((cab.capacidad || 4).toString());
      setImagenUrl(cab.imagenUrl || "");
      setCoordenadas(`${cab.lat || -41.13}, ${cab.lng || -71.30}`);
    } else {
      setNombre("");
      setTipo("Familiar");
      setEstado("Disponible");
      setPrecioBase("");
      setDescripcion("");
      setSuperficie("45");
      setHabitaciones("2");
      setBanos("1");
      setCamas("3");
      setCapacidad("4");
      setImagenUrl("");
      setCoordenadas("-41.13, -71.30");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const targetId = isEditingState && selectedCabinId ? selectedCabinId : newCabinId;

    const newCabin: Cabana = {
      id: targetId,
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

    alert(isEditingState ? "¡Cabaña actualizada satisfactoriamente!" : "¡Cabaña guardada satisfactoriamente!");
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-sm font-sans font-bold text-neutral-100">
            {isEditingState ? "Editar Cabaña" : "Nueva Cabaña"}
          </h2>
          {cabanas && cabanas.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingState(!isEditingState);
                  if (isEditingState) {
                    handleSelectCabinToEdit("");
                  }
                }}
                title={isEditingState ? "Modo Nueva Cabaña" : "Editar Cabaña"}
                className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shrink-0 border ${
                  isEditingState
                    ? "bg-[#1e201e] text-[#b2ceb4] border-[#4a634e] ring-2 ring-[#b2ceb4]/10"
                    : "bg-[#1b1e1b] text-[#f6bb89] border-neutral-800 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <Edit className="w-5 h-5" />
              </button>

              {isEditingState && (
                <div className="relative">
                  <select
                    value={selectedCabinId}
                    onChange={(e) => handleSelectCabinToEdit(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-[#121412] text-xs font-medium text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg outline-none appearance-none cursor-pointer min-w-[200px] h-11"
                  >
                    <option value="">-- Seleccione Cabaña --</option>
                    {cabanas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.tipo})
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        {/* Left Inputs */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800/40 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <Zap className="w-5 h-5 text-[#f6bb89]" />
              <h3 className="text-sm font-sans font-bold text-neutral-100">
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
                  value={isEditingState && selectedCabinId ? selectedCabinId : newCabinId}
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
              <h3 className="text-sm font-sans font-bold text-neutral-100">
                Especificaciones Técnicas
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800 text-center flex flex-col justify-between">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1 text-center">
                  Superficie (m²)
                </label>
                <input
                  type="number"
                  value={superficie}
                  onChange={(e) => setSuperficie(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0 text-center"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800 text-center flex flex-col justify-between">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1 text-center">
                  Habitaciones
                </label>
                <input
                  type="number"
                  value={habitaciones}
                  onChange={(e) => setHabitaciones(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0 text-center"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800 text-center flex flex-col justify-between">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1 text-center">
                  Baños
                </label>
                <input
                  type="number"
                  value={banos}
                  onChange={(e) => setBanos(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0 text-center"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800 text-center flex flex-col justify-between">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1 text-center">
                  Camas
                </label>
                <input
                  type="number"
                  value={camas}
                  onChange={(e) => setCamas(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0 text-center"
                />
              </div>
              <div className="bg-[#121412] p-3 rounded-lg border border-neutral-800 col-span-2 md:col-span-1 text-center flex flex-col justify-between">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase mb-1 text-center">
                  Capacidad máx
                </label>
                <input
                  type="number"
                  value={capacidad}
                  onChange={(e) => setCapacidad(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-[#b2ceb4] font-bold text-sm focus:ring-0 text-center"
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

            {(() => {
              const latVal = Number(coordenadas.split(",")[0]);
              const lngVal = Number(coordenadas.split(",")[1]);
              const isValid = !isNaN(latVal) && !isNaN(lngVal);
              const lat = isValid ? latVal : -36.9157;
              const lng = isValid ? lngVal : -71.5010;

              return (
                <div className="relative overflow-hidden rounded-lg h-44 border border-neutral-800 bg-[#121412]">
                  {isValid ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={`https://maps.google.com/maps?q=${lat}%2C${lng}&t=k&z=17&output=embed`}
                      className="w-full h-full opacity-90 rounded-lg shadow-inner"
                      style={{ border: 0 }}
                      title="Cabin Google Satellite Map Preview"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs p-4 text-center">
                      <span className="material-symbols-outlined text-3xl mb-1 text-[#f6bb89]">map</span>
                      Escriba coordenadas válidas para previsualizar el mapa
                    </div>
                  )}
                </div>
              );
            })()}

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
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              id="submit-new-cabin"
              type="submit"
              className="w-full py-4 bg-[#4a634e] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              id="cancel-new-cabin"
              type="button"
              onClick={onBack}
              className="w-full py-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 hover:text-white font-bold rounded-xl border border-neutral-850 transition-all text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
