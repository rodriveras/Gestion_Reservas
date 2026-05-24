/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronLeft, ChevronRight, MessageSquare, Phone, LogOut, Check, X, ShieldAlert } from "lucide-react";
import { Cabana, Reserva } from "../types";

interface GuestViewProps {
  cabanas: Cabana[];
  reservas: Reserva[];
  onBackToAdmin: () => void;
}

export default function GuestView({ cabanas, reservas, onBackToAdmin }: GuestViewProps) {
  const [activeMonths, setActiveMonths] = useState<Record<string, string>>({
    "CAB-01": "Noviembre",
    "CAB-02": "Noviembre",
    "CAB-03": "Noviembre",
  });

  // Calculate day reservation status for mockup calendar inside card
  const isDayReservedForCabin = (cabinId: string, dayNum: number) => {
    if (cabinId === "CAB-01") {
      return [3, 6, 10, 13, 17, 20, 24, 27].includes(dayNum);
    } else if (cabinId === "CAB-02") {
      return [1, 2, 3, 7, 8, 14, 15, 21, 22, 28].includes(dayNum);
    } else {
      return [1, 2, 3, 10, 11, 12, 18, 19, 25, 26].includes(dayNum);
    }
  };

  const getDaysArray = () => {
    const list = [];
    for (let i = 1; i <= 31; i++) {
      list.push(i);
    }
    return list;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Branding Headline */}
      <section className="text-center md:text-left">
        <span className="text-xs font-sans font-bold text-[#f6bb89] uppercase tracking-widest block mb-1">
          Experiencia de Lujo
        </span>
        <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#b2ceb4]">
          Nuestras Cabañas
        </h2>
      </section>

      {/* Grid of Cabin slider-containers (Sideways scroll on mobile, vertical list on desktop) */}
      <section className="flex flex-row overflow-x-auto lg:flex-col lg:space-y-8 gap-6 lg:gap-0 pb-6 lg:pb-0 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-neutral-850">
        {cabanas.map((cab) => {
          const isAvailable = cab.estado === "Disponible";
          const currentMonth = activeMonths[cab.id] || "Noviembre";

          return (
            <div
              key={cab.id}
              className="snap-center shrink-0 w-[86vw] sm:w-[480px] lg:w-full bg-[#1a1c1a] rounded-xl overflow-hidden border border-neutral-800/40 border-t-2 border-[#D29B6C] shadow-2xl transition-all hover:border-[#b2ceb4]/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* 1. Cabin Image Left Block */}
                <div className="lg:col-span-4 relative h-64 lg:h-full min-h-[200px] overflow-hidden">
                  <img
                    src={cab.imagenUrl}
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
                      <p className="text-xs font-sans italic text-neutral-400 mt-1">
                        {cab.id === "CAB-01"
                          ? "Un susurro entre las copas de los árboles."
                          : cab.id === "CAB-02"
                          ? "Donde el tiempo se detiene al amanecer."
                          : "Vistas infinitas hacia el corazón del bosque."}
                      </p>
                      <p className="text-xs text-neutral-400 mt-4 leading-relaxed font-sans font-light">
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
                        Disponibilidad - {currentMonth}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            setActiveMonths((prev) => ({
                              ...prev,
                              [cab.id]: prev[cab.id] === "Noviembre" ? "Octubre" : "Noviembre",
                            }))
                          }
                          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setActiveMonths((prev) => ({
                              ...prev,
                              [cab.id]: prev[cab.id] === "Noviembre" ? "Diciembre" : "Noviembre",
                            }))
                          }
                          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded transition-colors"
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
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider">
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
              href="https://wa.me/5491112345678"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-[#4a634e] text-white rounded-full px-6 py-2.5 hover:brightness-110 active:scale-95 transition-all font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href="tel:+5491112345678"
              className="flex items-center justify-center gap-2 border border-[#D29B6C] text-[#f6bb89] rounded-full px-6 py-2.5 hover:bg-neutral-800 active:scale-95 transition-all font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <Phone className="w-4 h-4 animate-bounce" />
              Llamar ahora
            </a>
          </div>
        </div>
      </section>

      {/* Close button returning to Admin panel */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#121412]/80 backdrop-blur-md z-40 border-t border-neutral-900">
        <div className="max-w-container-max mx-auto">
          <button
            onClick={onBackToAdmin}
            className="w-full flex items-center justify-center gap-2 bg-red-950/40 text-red-400 hover:bg-neutral-900 border border-red-950/60 py-3.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión &amp; Volver a Administración
          </button>
        </div>
      </div>
      <div className="h-16"></div>
    </motion.div>
  );
}
