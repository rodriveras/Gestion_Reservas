/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, UserCheck, CalendarDays, Contact, HeartHandshake } from "lucide-react";
import { Cliente } from "../types";

interface ClientFormProps {
  clientes?: Cliente[];
  onSave: (client: Cliente) => void;
  onBack: () => void;
}

export default function ClientForm({ clientes = [], onSave, onBack }: ClientFormProps) {
  const [isEditingState, setIsEditingState] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");

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

  const handleSelectClientToEdit = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clientes.find((c) => c.id === clientId);
    if (client) {
      setTipoDocumento(client.tipoDocumento);
      setNumeroDocumento(client.numeroDocumento || "");
      setNacionalidad(client.nacionalidad || "Chile");
      setCiudadOrigen(client.ciudadOrigen || "Santiago");
      setNombre(client.nombre || "");
      setApellido(client.apellido || "");
      setEmail(client.email || "");
      setTelefono(client.telefono || "");
      setFechaNacimiento(client.fechaNacimiento || "1990-01-01");
      setEstado(client.estado || "activo");
      setRedSocial(client.redSocial || "WhatsApp");
      setRedSocialUser(client.redSocialUser || "");
      setNotas(client.notas || "");
    } else {
      // Reset to blank/new client mode
      setNombre("");
      setApellido("");
      setNumeroDocumento("");
      setEmail("");
      setTelefono("");
      setFechaNacimiento("1990-01-01");
      setNacionalidad("Chile");
      setCiudadOrigen("Santiago");
      setEstado("activo");
      setRedSocial("WhatsApp");
      setRedSocialUser("");
      setNotas("");
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = [
    { value: "01", label: "Ene" },
    { value: "02", label: "Feb" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Abr" },
    { value: "05", label: "May" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Ago" },
    { value: "09", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dic" },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => String(currentYear - i));

  const getBirthDay = (dateStr: string) => {
    if (!dateStr || !dateStr.includes("-")) return "01";
    return dateStr.split("-")[2] || "01";
  };

  const getBirthMonth = (dateStr: string) => {
    if (!dateStr || !dateStr.includes("-")) return "01";
    return dateStr.split("-")[1] || "01";
  };

  const getBirthYear = (dateStr: string) => {
    if (!dateStr || !dateStr.includes("-")) return "1990";
    return dateStr.split("-")[0] || "1990";
  };

  const handleDropboxChange = (type: "day" | "month" | "year", value: string) => {
    let y = getBirthYear(fechaNacimiento);
    let m = getBirthMonth(fechaNacimiento);
    let d = getBirthDay(fechaNacimiento);

    if (type === "year") y = value;
    if (type === "month") m = value;
    if (type === "day") d = value;

    setFechaNacimiento(`${y}-${m}-${d}`);
  };


  const autoId = `CLI-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const fechaRegistro = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim()) return;

    const targetId = isEditingState && selectedClientId ? selectedClientId : autoId;
    const originalClient = isEditingState && selectedClientId ? clientes.find((c) => c.id === selectedClientId) : null;
    const targetFechaRegistro = originalClient?.fechaRegistro || new Date().toISOString().split("T")[0];

    const newClient: Cliente = {
      id: targetId,
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
      fechaRegistro: targetFechaRegistro,
    };

    alert(isEditingState ? "¡Cliente actualizado satisfactoriamente!" : "¡Cliente registrado satisfactoriamente!");
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-sm font-sans font-bold text-neutral-100">
            {isEditingState ? "Editar Cliente" : "Crear Cliente"}
          </h2>
          {clientes && clientes.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingState(!isEditingState);
                  if (isEditingState) {
                    handleSelectClientToEdit("");
                  }
                }}
                title={isEditingState ? "Modo Crear Cliente" : "Editar Cliente"}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer shadow-lg shrink-0 border ${
                  isEditingState
                    ? "bg-[#1e201e] text-[#b2ceb4] border-[#4a634e] ring-2 ring-[#b2ceb4]/10"
                    : "bg-[#1b1e1b] text-[#f6bb89] border-neutral-800 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <UserCheck className="w-4.5 h-4.5" />
              </button>

              {isEditingState && (
                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClientToEdit(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-[#121412] text-xs font-medium text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg outline-none appearance-none cursor-pointer min-w-[200px]"
                  >
                    <option value="">-- Seleccione Cliente --</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.apellido} ({c.numeroDocumento})
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        {/* Main form body - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 2: Datos Personales */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <Contact className="w-5 h-5" />
              <h3 className="text-sm font-sans font-bold text-neutral-100">
                Datos Personales y Contacto
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingrese apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 11 1234-5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Section 1: Identidad */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <UserCheck className="w-5 h-5" />
              <h3 className="text-sm font-sans font-bold text-neutral-100">
                Información de Identidad
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  ID Cliente
                </label>
                <input
                  type="text"
                  value={isEditingState && selectedClientId ? selectedClientId : autoId}
                  readOnly
                  className="w-full bg-[#121412] text-neutral-500 border border-neutral-700 rounded-lg py-1.5 px-2.5 text-xs font-semibold opacity-75 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as any)}
                  disabled={isEditingState}
                  className="w-full bg-[#121412] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Cédula">Cédula</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Número de Documento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 45.321.987"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  disabled={isEditingState}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Nacionalidad
                </label>
                <input
                  type="text"
                  placeholder="Argentina"
                  value={nacionalidad}
                  onChange={(e) => setNacionalidad(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Ciudad de Origen
                </label>
                <input
                  type="text"
                  placeholder="Mendoza"
                  value={ciudadOrigen}
                  onChange={(e) => setCiudadOrigen(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                  Fecha de Nacimiento
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Side: Standard Date Input */}
                  <div>
                    <input
                      type="date"
                      required
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none h-8"
                    />
                  </div>

                  {/* Right Side: Triple Dropdown Selectors */}
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={getBirthDay(fechaNacimiento)}
                      onChange={(e) => handleDropboxChange("day", e.target.value)}
                      className="w-full bg-[#121412] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none h-8 text-center"
                      title="Seleccionar Día"
                    >
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <select
                      value={getBirthMonth(fechaNacimiento)}
                      onChange={(e) => handleDropboxChange("month", e.target.value)}
                      className="w-full bg-[#121412] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none h-8"
                      title="Seleccionar Mes"
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={getBirthYear(fechaNacimiento)}
                      onChange={(e) => handleDropboxChange("year", e.target.value)}
                      className="w-full bg-[#121412] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none h-8 text-center"
                      title="Seleccionar Año"
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Preferencias y Estado */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
            <div className="flex items-center gap-2 mb-2 text-[#f6bb89] pb-2 border-b border-neutral-850">
              <HeartHandshake className="w-5 h-5" />
              <h3 className="text-sm font-sans font-bold text-neutral-100">
                Preferencias y Estado
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Estado del Cliente
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as any)}
                  className="w-full bg-[#121412] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Red Social Preferida
                  </label>
                  <select
                    value={redSocial}
                    onChange={(e) => setRedSocial(e.target.value as any)}
                    className="w-full bg-[#121412] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                    Usuario / Link Red Social
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@usuario"
                    value={redSocialUser}
                    onChange={(e) => setRedSocialUser(e.target.value)}
                    className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                  Preferencias Especiales / Notas
                </label>
                <textarea
                  rows={4}
                  placeholder="Ej: Tercera edad, requiere silla de ruedas, alergias alimentarias..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-[#121412] text-neutral-200 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg py-1.5 px-2.5 text-xs outline-none transition-all rename-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Info panel + Save button - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1e201e] rounded-xl p-6 border border-neutral-800 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-wide">
                Fecha de Registro
              </p>
              <p className="text-sm font-sans font-bold text-[#f6bb89] mt-0.5">
                {isEditingState && selectedClientId
                  ? new Date(
                      clientes.find((c) => c.id === selectedClientId)?.fechaRegistro || ""
                    ).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
                  : fechaRegistro}
              </p>
            </div>
            <CalendarDays className="w-8 h-8 text-[#f6bb89]/80" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="submit-new-client"
              type="submit"
              className="w-full py-4 bg-[#4a634e] text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isEditingState ? "Guardar" : "Guardar"}
            </button>
            <button
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
