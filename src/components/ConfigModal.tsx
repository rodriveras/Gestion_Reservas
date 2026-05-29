/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Phone, MessageSquare, Shield, HelpCircle, Trees } from "lucide-react";
import { Administracion } from "../types";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: Administracion;
  onSave: (updatedConfig: Administracion) => Promise<void>;
}

export default function ConfigModal({ isOpen, onClose, config, onSave }: ConfigModalProps) {
  const [nombreComplejo, setNombreComplejo] = useState(config.Nombre_complejo || "");
  const [telefono, setTelefono] = useState(config.Telefono || "");
  const [whatsapp, setWhatsapp] = useState(config.Whatsapp || "");
  const [usuario, setUsuario] = useState(config.Usuario || "");
  const [contrasena, setContrasena] = useState(config.Contrasena || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Clean up WhatsApp input: keep only digits, plus signs, or standard symbols,
    // but in GuestView we will clean it specifically. We just save what user inputs.
    const updated: Administracion = {
      id: config.id || "admin-config",
      Nombre_complejo: nombreComplejo.trim() || "Gestion Cabañas",
      Usuario: usuario.trim() || "admin@entrenieves.com",
      Contrasena: contrasena || "nieves2026",
      Telefono: telefono.trim(),
      Whatsapp: whatsapp.trim()
    };

    try {
      await onSave(updated);
      onClose();
    } catch (err) {
      console.error("Error al guardar la configuración:", err);
      alert("Hubo un error al guardar los datos. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-[#161916] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Top Orange/Gold Border Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#D29B6C] to-[#f6bb89]" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4a634e]/20 flex items-center justify-center">
                  <Trees className="w-4.5 h-4.5 text-[#b2ceb4]" />
                </div>
                <h3 className="text-base sm:text-lg font-headline font-bold text-white">
                  Configuración de Ladrillos y Contacto
                </h3>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
              
              {/* Complex Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider block">
                  Nombre del Complejo
                </label>
                <input
                  type="text"
                  required
                  value={nombreComplejo}
                  onChange={(e) => setNombreComplejo(e.target.value)}
                  placeholder="Ej: Entre Nieves Lodge"
                  className="w-full bg-[#0d0f0d] border border-neutral-800 focus:border-[#b2ceb4] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                />
              </div>

              {/* Call Link / Phone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#f6bb89]" />
                    Teléfono de Contacto (Llamadas)
                  </label>
                  <span className="text-[9px] font-sans text-neutral-500 italic">Formato tel: +5491112345678</span>
                </div>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="w-full bg-[#0d0f0d] border border-neutral-800 focus:border-[#b2ceb4] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                />
              </div>

              {/* WhatsApp Link / Phone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#b2ceb4]" />
                    WhatsApp de Contacto (Chats)
                  </label>
                  <span className="text-[9px] font-sans text-neutral-500 italic">Código de país + número</span>
                </div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 5491112345678"
                  className="w-full bg-[#0d0f0d] border border-neutral-800 focus:border-[#b2ceb4] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-600 outline-none transition-all"
                />
                <p className="text-[9px] text-neutral-500 font-sans leading-relaxed">
                  Tip: Ingrese el número con código de país (sin el + ni el 15 si es de Argentina). Ej: `5491112345678` (Argentina) o `56987654321` (Chile).
                </p>
              </div>

              {/* Credentials Header Section */}
              <div className="border-t border-neutral-900 pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-3.5 h-3.5 text-[#b2ceb4]" />
                  <span className="text-[10px] font-sans font-extrabold text-neutral-400 uppercase tracking-widest">
                    Credenciales de Administrador
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Usuario / Email */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider">
                      Usuario / Email
                    </label>
                    <input
                      type="email"
                      required
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      className="w-full bg-[#0d0f0d] border border-neutral-850 focus:border-[#b2ceb4] rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all"
                    />
                  </div>

                  {/* Contraseña */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[9px] font-sans text-neutral-500 hover:text-white transition-colors cursor-pointer select-none"
                      >
                        {showPassword ? "Ocultar" : "Mostrar"}
                      </button>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="w-full bg-[#0d0f0d] border border-neutral-850 focus:border-[#b2ceb4] rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Information Banner */}
              <div className="bg-neutral-900/50 border border-neutral-850 rounded-xl p-3 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#f6bb89] shrink-0 mt-0.5" />
                <p className="text-[10px] font-sans text-neutral-400 leading-relaxed">
                  Estos datos configuran los enlaces directos en la **Vista Huésped**. Los clientes verán los botones de llamada y WhatsApp enlazados a los números que guarde aquí.
                </p>
              </div>

              {/* Buttons Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white rounded-xl font-sans text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#4a634e] text-white hover:brightness-110 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
