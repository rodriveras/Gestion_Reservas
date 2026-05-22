/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { LogOut, Grid, Calendar, UserPlus, FilePlus, Sparkles, Home, Settings } from "lucide-react";

interface AdminLauncherProps {
  onNavigate: (screen: string) => void;
  onLogoutToGuest: () => void;
  stats: {
    reservasCount: number;
    cabanasCount: number;
    clientesCount: number;
    serviciosCount: number;
  };
}

export default function AdminLauncher({ onNavigate, onLogoutToGuest, stats }: AdminLauncherProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <section className="relative h-[240px] md:h-[350px] w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/40">
        <img
          alt="Lodge Background"
          className="w-full h-full object-cover brightness-75 scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtCC2fGwoOHRMl6hhKg5CHc_IkqXBTNk8ZRI6bINLHstd2JKjZQKZkfA16K18cBWcwL6oTO4e02H6BP0vhMiGk6O9qneFFFZ35LKI0DXVpShbE67YJNnLzOJjF8NI6LUHE6klxydybaGcfGqN6vpbiBDQyWClJ_kzlnl2s1rxmp5Z4GKW6IpBhDLfCt_0x5x-w2wWcdeIeNrOKkiAylYs_j785rBc_osR6-08kvtkBa61XoEcmLWQXDvczYwd0KpwzqXUs14YZcqvK"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 md:left-10">
          <p className="text-[#f6bb89] font-headline text-2xl italic mb-1">Entre Nieves</p>
          <h1 className="text-white font-headline text-3xl md:text-5xl leading-tight font-semibold tracking-tight">
            Gestión de Cabañas
          </h1>
        </div>
      </section>

      {/* Grid Categories */}
      <div className="space-y-8">
        {/* PRIORIDADES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#f6bb89] rounded-full"></span>
            <h2 className="text-sm font-sans font-bold text-neutral-400 uppercase tracking-widest px-1">
              Prioridades
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              id="btn-shortcut-calendar"
              onClick={() => onNavigate("calendar")}
              className="flex items-center justify-center p-6 bg-[#1b1e1b] border-t-2 border-[#D29B6C] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-3 min-h-[140px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform w-14 h-14 shadow-inner">
                <Calendar className="w-7 h-7" />
              </div>
              <span className="text-sm font-sans font-semibold text-neutral-200 text-center">
                Calendario de Reservas
              </span>
            </button>

            <button
              id="btn-shortcut-dashboard"
              onClick={() => onNavigate("dashboard")}
              className="flex items-center justify-center p-6 bg-[#1b1e1b] border-t-2 border-[#D29B6C] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-3 min-h-[140px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform w-14 h-14 shadow-inner">
                <Grid className="w-7 h-7" />
              </div>
              <span className="text-sm font-sans font-semibold text-neutral-200 text-center">
                Dashboard de Análisis
              </span>
            </button>
          </div>
        </div>

        {/* CREACIÓN Y GESTIÓN */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#b2ceb4] rounded-full"></span>
            <h2 className="text-sm font-sans font-bold text-neutral-400 uppercase tracking-widest px-1">
              Creación y Gestión
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              id="btn-shortcut-client"
              onClick={() => onNavigate("new-client")}
              className="flex items-center justify-center p-4 bg-[#1b1e1b] border-t-2 border-[#b2ceb4] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-2 min-h-[120px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-11 h-11">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-sans font-semibold text-neutral-300 text-center">
                Nuevo Cliente
              </span>
            </button>

            <button
              id="btn-shortcut-booking"
              onClick={() => onNavigate("new-booking")}
              className="flex items-center justify-center p-4 bg-[#1b1e1b] border-t-2 border-[#b2ceb4] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-2 min-h-[120px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-11 h-11">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-sans font-semibold text-neutral-300 text-center">
                Nueva Reserva
              </span>
            </button>

            <button
              id="btn-shortcut-contract"
              onClick={() => onNavigate("contract-service")}
              className="flex items-center justify-center p-4 bg-[#1b1e1b] border-t-2 border-[#b2ceb4] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-2 min-h-[120px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-11 h-11">
                <FilePlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-sans font-semibold text-neutral-300 text-center">
                Contratar Servicio
              </span>
            </button>
          </div>
        </div>

        {/* RECURSOS Y CONFIGURACIÓN */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-amber-700/60 rounded-full"></span>
            <h2 className="text-sm font-sans font-bold text-neutral-400 uppercase tracking-widest px-1">
              Configuración de Recursos
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              id="btn-shortcut-cabin"
              onClick={() => onNavigate("new-cabin")}
              className="flex items-center justify-center p-5 bg-[#1b1e1b] border-t-2 border-[#f9ba82] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-3"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-12 h-12">
                <Home className="w-6 h-6" />
              </div>
              <span className="text-xs font-sans font-bold text-neutral-200">
                Registrar Nueva Cabaña {`(${stats.cabanasCount})`}
              </span>
            </button>

            <button
              id="btn-shortcut-services"
              onClick={() => onNavigate("new-service")}
              className="flex items-center justify-center p-5 bg-[#1b1e1b] border-t-2 border-[#f9ba82] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-3"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-12 h-12">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-xs font-sans font-bold text-neutral-200">
                Registrar Nuevo Servicio {`(${stats.serviciosCount})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center pt-6 pb-12 border-t border-neutral-900">
        <button
          id="btn-logout-client"
          onClick={onLogoutToGuest}
          className="flex items-center gap-3 px-8 py-3.5 bg-red-950/40 text-red-400 hover:bg-neutral-900 border border-red-950 rounded-full transition-all active:scale-95 shadow-md font-sans text-sm font-bold uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Ver Catálogo Huésped
        </button>
      </div>
    </motion.div>
  );
}
