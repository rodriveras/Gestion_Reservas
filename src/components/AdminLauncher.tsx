/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Grid, Calendar, UserPlus, FilePlus, Sparkles, TrendingUp } from "lucide-react";

import logoImg from "./Logo.jpeg";

interface AdminLauncherProps {
  onNavigate: (screen: string) => void;
  stats: {
    reservasCount: number;
    cabanasCount: number;
    clientesCount: number;
    serviciosCount: number;
  };
  complexName: string;
}

export default function AdminLauncher({
  onNavigate,
  stats,
  complexName,
}: AdminLauncherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 md:space-y-8"
    >
      {/* Hero Section */}
      <section className="relative h-[150px] xs:h-[190px] md:h-[300px] w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/40">
        <img
          alt="Lodge Background"
          className="w-full h-full object-cover brightness-[0.55] scale-105"
          src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center gap-3.5 md:gap-6 px-4">
          <img
            src={logoImg}
            alt="Complex Logo"
            className="w-12 h-12 xs:w-14 xs:h-14 md:w-24 md:h-24 object-contain rounded-2xl shadow-md border border-white/10 bg-neutral-900/60 p-1.5 md:p-2.5 backdrop-blur-sm"
          />
          <h1 className="text-white font-headline text-lg xs:text-xl md:text-2xl lg:text-3xl leading-tight font-bold tracking-tight text-center">
            {complexName}
          </h1>
        </div>
      </section>
      {/* Grid Categories */}
      <div className="space-y-4 md:space-y-8">
        <div className="flex flex-col gap-3.5 max-w-sm mx-auto w-full px-4 pt-1">
          <button
            id="btn-shortcut-calendar"
            onClick={() => onNavigate("calendar")}
            className="w-full py-3.5 md:py-4 px-6 bg-[#f3f4f6] hover:bg-white text-neutral-900 font-sans font-medium rounded-full text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shadow-md"
          >
            <Calendar className="w-4 h-4 md:w-4.5 h-4.5 shrink-0" />
            Gestor de Reservas
          </button>

          <button
            id="btn-shortcut-dashboard"
            onClick={() => onNavigate("dashboard")}
            className="w-full py-3.5 md:py-4 px-6 bg-transparent border-2 border-white/20 hover:bg-white/5 hover:border-white/30 text-white font-sans font-medium rounded-full text-xs md:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <TrendingUp className="w-4 h-4 md:w-4.5 h-4.5 shrink-0" />
            Análisis Estratégico
          </button>
        </div>

        {/* CREACIÓN Y GESTIÓN */}
        <div className="max-w-sm mx-auto w-full px-4 pt-1">
          <div className="grid grid-cols-3 gap-2 xs:gap-2.5 md:gap-3 w-full">
            <button
              id="btn-shortcut-client"
              onClick={() => onNavigate("new-client")}
              className="w-full py-3 bg-transparent border border-white/20 hover:bg-white/5 hover:border-white/30 text-white rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95"
              title="Nuevo Cliente"
            >
              <UserPlus className="w-5 h-5" />
            </button>

            <button
              id="btn-shortcut-booking"
              onClick={() => onNavigate("new-booking")}
              className="w-full py-3 bg-transparent border border-white/20 hover:bg-white/5 hover:border-white/30 text-white rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95"
              title="Nueva Reserva"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button
              id="btn-shortcut-contract"
              onClick={() => onNavigate("contract-service")}
              className="w-full py-3 bg-transparent border border-white/20 hover:bg-white/5 hover:border-white/30 text-white rounded-full transition-all cursor-pointer flex items-center justify-center active:scale-95"
              title="Contratar Servicio"
            >
              <span className="material-symbols-outlined text-xl leading-none">hot_tub</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
