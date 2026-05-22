/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, UserCheck, CalendarDays, Contact, HeartHandshake } from "lucide-react";
import { Cliente } from "../types";

interface ClientFormProps {
  onSave: (client: Cliente) => void;
  onBack: () => void;
}

export default function ClientForm({ onSave, onBack }: ClientFormProps) {
  const [tipoDocumento, setTipoDocumento] = useState<"DNI" | "Pasaporte" | "Cédula">("DNI");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nacionalidad, setNacionalidad] = useState("Chile");
  const [ciudadOrigen, setCiudadOrigen] = useState("Santiago");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("1990-01-01");
  const [estado, setEstado] = useState<"activo" | "bloqueado" | "suspendido">("activo");
  const [redSocial, setRedSocial] = useState<"WhatsApp" | "Instagram" | "Facebook" | "LinkedIn">("WhatsApp");
  const [redSocialUser, setRedSocialUser] = useState("");
  const [notas, setNotas] = useState("");

  const autoId = `CLI-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const fechaRegistro = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;

    const newClient: Cliente = {
      id: autoId,
      tipoDocumento,
      numeroDocumento: numeroDocumento || "Sin Documento",
      nacionalidad,
      ciudadOrigen,
      nombre,
      apellido,
      email: email || "usuario@ejemplo.com",
      telefono: telefono || "+56912345678",
      fechaNacimiento,
      estado,
      redSocial,
      redSocialUser: redSocialUser || "@usuario",
      notas: notas || "Preferencias estándar",
      fechaRegistro: new Date().toISOString().split("T")[0],
    };

    onSave(newClient);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Back button & Page title */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <span className="text-[10px] font-sans font-bold text-[#f6bb89] uppercase tracking-widest block mb-1">
          Formulario de Registro
        </span>
        <h2 className="text-3xl font-headline font-bold text-[#b2ceb4]">
          Nuevo Cliente
        </h2>
        <p className="text-neutral-400 font-sans text-sm mt-1">
          Complete los campos requeridos para archivar los datos del cliente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        {/* Main form body - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Identidad */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <UserCheck className="w-5 h-5" />
              <h3 className="text-base font-sans font-bold text-neutral-100">
                Información de Identidad
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  ID Cliente
                </label>
                <input
                  type="text"
                  value={autoId}
                  readOnly
                  className="w-full bg-[#121412] text-neutral-500 border border-neutral-800 rounded-lg p-2.5 text-xs font-semibold opacity-75 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-300 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none"
                >
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Cédula">Cédula</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Número de Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 45.321.987"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  placeholder="Argentina"
                  value={nacionalidad}
                  onChange={(e) => setNacionalidad(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Ciudad de Origen
                </label>
                <input
                  type="text"
                  placeholder="Mendoza"
                  value={ciudadOrigen}
                  onChange={(e) => setCiudadOrigen(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Datos Personales */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <Contact className="w-5 h-5" />
              <h3 className="text-base font-sans font-bold text-neutral-100">
                Datos Personales y Contacto
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 11 1234-5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  required
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Preferencias y Estado */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800/40 shadow-xl space-y-4">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <HeartHandshake className="w-5 h-5" />
              <h3 className="text-base font-sans font-bold text-neutral-100">
                Preferencias y Estado
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Estado del Cliente
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-300 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                    Red Social Preferida
                  </label>
                  <select
                    value={redSocial}
                    onChange={(e) => setRedSocial(e.target.value as any)}
                    className="w-full bg-[#121412] text-neutral-300 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                    Usuario / Link Red Social
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@usuario"
                    value={redSocialUser}
                    onChange={(e) => setRedSocialUser(e.target.value)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide mb-1">
                  Preferencias Especiales / Notas
                </label>
                <textarea
                  rows={4}
                  placeholder="Ej: Tercera edad, requiere silla de ruedas, alergias alimentarias..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-705 focus:border-[#b2ceb4] rounded-lg p-2.5 text-xs outline-none transition-all rename-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Info panel + Save button - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1b1e1b] rounded-xl p-5 border border-neutral-850 shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide">
                Fecha de Registro
              </p>
              <p className="text-sm font-sans font-bold text-[#f6bb89] mt-0.5">
                {fechaRegistro}
              </p>
            </div>
            <CalendarDays className="w-8 h-8 text-[#f6bb89]/80" />
          </div>

          <div className="space-y-3">
            <button
              id="submit-new-client"
              type="submit"
              className="w-full py-4 bg-[#4a634e] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Cliente
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full text-center py-2.5 border border-neutral-800 hover:bg-neutral-850 font-sans text-xs font-bold text-neutral-400 hover:text-white rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
