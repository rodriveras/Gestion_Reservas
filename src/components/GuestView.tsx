/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, MessageSquare, Phone, LogOut, Check, X, ShieldAlert, Home, Share2 } from "lucide-react";
import { Cabana, Reserva, Administracion } from "../types";

interface GuestViewProps {
  cabanas: Cabana[];
  reservas: Reserva[];
  onBackToAdmin: () => void;
  isAdminLoggedIn?: boolean;
  complexConfig?: Administracion;
}

export default function GuestView({ cabanas, reservas, onBackToAdmin, isAdminLoggedIn, complexConfig }: GuestViewProps) {
  const whatsappNum = String(complexConfig?.Whatsapp || "5491112345678");
  const telefonoNum = String(complexConfig?.Telefono || "+5491112345678");

  // Clean WhatsApp for link: keep only digits
  const cleanWhatsapp = whatsappNum.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanWhatsapp}`;
  const phoneLink = `tel:${telefonoNum.replace(/\s+/g, "")}`;

  const [copied, setCopied] = useState(false);

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?view=guest`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      alert("¡Enlace de catálogo copiado al portapapeles! Listo para enviar a tus clientes.");
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Error al copiar enlace:", err);
    });
  };

  // Synchronized global date for all guest calendars
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date(NaN);
    const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`;
    return new Date(normalized);
  };

  // Real database availability detection
  const isDayReservedForCabin = (cabinId: string, dayNum: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const checkMs = checkDate.setHours(12, 0, 0, 0); // Local noon

    return (reservas || []).some((r) => {
      if (r.cabanaId !== cabinId || r.estadoReserva === "Cancelada") return false;
      const startMs = parseLocalDate(r.checkIn).getTime();
      const endMs = parseLocalDate(r.checkOut).getTime();
      return checkMs >= startMs && checkMs < endMs;
    });
  };

  const getDaysArray = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const list = [];
    for (let i = 1; i <= daysInMonth; i++) {
      list.push(i);
    }
    return list;
  };

  const getOffsetDays = () => {
    const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday, 1 = Monday...
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  // Helper to fallback to premium tourist lodge pictures when no valid image is set
  const getCabinImage = (cab: Cabana) => {
    if (cab.imagenUrl && cab.imagenUrl.startsWith("http") && !cab.imagenUrl.includes("placeholder") && !cab.imagenUrl.includes("example.com")) {
      return cab.imagenUrl;
    }
    const nameLower = (cab.nombre || "").toLowerCase();
    const typeLower = (cab.tipo || "").toLowerCase();
    
    if (nameLower.includes("domo") || typeLower.includes("domo")) {
      return "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=800&auto=format&fit=crop";
    }
    if (nameLower.includes("suite") || typeLower.includes("suite")) {
      return "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=800&auto=format&fit=crop";
    }
    if (nameLower.includes("familiar") || typeLower.includes("familiar") || nameLower.includes("roble")) {
      return "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop";
    }
    return "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Branding Headline & Controls */}
      <section className="flex flex-row justify-between items-start w-full gap-4 pb-2 border-b border-neutral-900/40">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-headline font-bold text-white">
            Cabañas Entre Nieves
          </h2>
        </div>

        {/* Top-Right Icon-Only Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Share Button (Icon-Only) */}
          <button
            onClick={handleShareLink}
            type="button"
            className="p-2.5 bg-[#4a634e]/20 text-[#b2ceb4] border border-[#b2ceb4]/30 hover:bg-[#4a634e]/40 hover:text-white rounded-xl transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center"
            title={copied ? "¡Enlace Copiado!" : "Copiar enlace del catálogo para clientes"}
          >
            {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
          </button>

          {/* Close Preview / Back Button (Icon-Only) - Only shown to Admin in preview mode, completely hidden on public guest link */}
          {isAdminLoggedIn && new URLSearchParams(window.location.search).get("view") !== "guest" && (
            <button
              onClick={onBackToAdmin}
              type="button"
              className="p-2.5 bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-850 hover:text-white rounded-xl transition-all active:scale-95 shadow-md cursor-pointer flex items-center justify-center"
              title="Volver al Menú Principal"
            >
              <Home className="w-5 h-5" />
            </button>
          )}
        </div>
      </section>

      {/* Grid of Cabin slider-containers (Sideways scroll on mobile, vertical list on desktop) */}
      <section className="flex flex-row overflow-x-auto lg:flex-col lg:space-y-8 gap-6 lg:gap-0 pb-6 lg:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-850">
        {(cabanas || []).map((cab) => {
          const isAvailable = cab.estado === "Disponible";

          return (
            <div
              key={cab.id}
              className="snap-center shrink-0 w-[86vw] sm:w-[480px] lg:w-full bg-[#1a1c1a] rounded-xl overflow-hidden border border-neutral-800/40 border-t-2 border-[#D29B6C] shadow-2xl transition-all hover:border-[#b2ceb4]/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* 1. Cabin Image Left Block */}
                <div className="lg:col-span-4 relative h-64 lg:h-full min-h-[200px] overflow-hidden">
                  <img
                    src={getCabinImage(cab)}
                    alt={cab.nombre}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isAvailable ? "bg-emerald-500" : cab.estado === "Ocupada" ? "bg-rose-500" : "bg-[#f9ba82]"
                      }`}
                    ></span>
                    <span className="text-white font-sans font-bold text-[10px] uppercase tracking-wider">
                      {cab.estado}
                    </span>
                  </div>
                </div>

                {/* 2. Cabin details and calendar card right block */}
                <div className="lg:col-span-8 p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-2xl font-headline font-semibold text-neutral-100">
                        {cab.nombre}
                      </h4>
                      <p className="text-xs text-neutral-200 mt-2 leading-relaxed font-sans font-normal">
                        {cab.descripcion}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="text-left md:text-right bg-[#121412] px-4 py-2 rounded-lg border border-neutral-850">
                      <p className="text-xl font-headline font-bold text-[#f9ba82]">${cab.precioBase}</p>
                      <p className="text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-widest mt-0.5">
                        / noche
                      </p>
                    </div>
                  </div>

                  {/* Calendar component nested in card */}
                  <div className="border-t border-neutral-850 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-sans font-bold text-neutral-300">
                        Disponibilidad - {currentMonthName}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                          }
                          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                          }
                          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Days row header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-widest">
                      {["L", "M", "M", "J", "V", "S", "D"].map((dayName, index) => (
                        <div key={index}>{dayName}</div>
                      ))}
                    </div>

                    {/* Days circles list */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {/* Render empty placeholders for offset days */}
                      {Array.from({ length: getOffsetDays() }).map((_, idx) => (
                        <div key={`offset-${idx}`} className="w-6 h-6"></div>
                      ))}

                      {/* Render real days */}
                      {getDaysArray().map((d) => {
                        const isReserved = isDayReservedForCabin(cab.id, d);
                        const cellColor = isReserved
                          ? "bg-rose-950/40 text-rose-400 border border-rose-900/30"
                          : "bg-emerald-950/20 text-[#b2ceb4] border border-[#4a634e]/30";
                        return (
                          <div
                            key={d}
                            className={`w-6 h-6 mx-auto flex items-center justify-center text-[9px] font-sans font-bold rounded-full ${cellColor} transition-transform hover:scale-110 cursor-pointer`}
                            title={isReserved ? "Reservado" : "Disponible"}
                          >
                            {d}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Numerical metadata counters */}
                  <div className="bg-[#121412] rounded-xl p-4 grid grid-cols-5 gap-2 border border-neutral-850 text-center shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider truncate">
                        Superficie
                      </span>
                      <span className="text-xs font-headline font-semibold text-neutral-200 mt-1">
                        {cab.superficie} m²
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-neutral-850 pl-1">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider truncate">
                        Habit.
                      </span>
                      <span className="text-xs font-headline font-semibold text-neutral-200 mt-1">
                        {cab.habitaciones}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-neutral-850 pl-1">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider truncate">
                        Camas
                      </span>
                      <span className="text-xs font-headline font-semibold text-neutral-200 mt-1">
                        {cab.camas}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-neutral-850 pl-1">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider truncate">
                        Baños
                      </span>
                      <span className="text-xs font-headline font-semibold text-neutral-200 mt-1">
                        {cab.banos}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-neutral-850 pl-1">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider truncate">
                        Capac.
                      </span>
                      <span className="text-xs font-headline font-semibold text-neutral-200 mt-1">
                        {cab.capacidad} Pers.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Support context banner */}
      <section className="bg-[#1e201e] rounded-2xl border border-[#D29B6C]/20 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4a634e]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-lg font-headline font-semibold text-neutral-100 mb-1">
              ¿Necesitas una atención personalizada?
            </h3>
            <p className="text-xs font-sans text-neutral-400 leading-relaxed">
              Nuestro administrador del complejo Entre Nieves está disponible en tiempo real para ayudarte a coordinar
              una estadía inolvidable.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#4a634e] text-white rounded-full px-6 py-2.5 hover:brightness-110 active:scale-95 transition-all font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={phoneLink}
              className="flex items-center justify-center gap-2 border border-[#D29B6C] text-[#f6bb89] rounded-full px-6 py-2.5 hover:bg-neutral-800 active:scale-95 transition-all font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      <div className="h-6"></div>
    </motion.div>
  );
}
