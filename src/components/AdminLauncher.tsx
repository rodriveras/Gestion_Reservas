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
      className="space-y-2.5 xs:space-y-3.5 md:space-y-8"
    >
      {/* Hero Section */}
      <section className="relative h-[48px] xs:h-[58px] sm:h-[80px] md:h-[200px] w-full rounded-xl overflow-hidden shadow-2xl border border-neutral-800/40">
        <img
          alt="Lodge Background"
          className="w-full h-full object-cover brightness-[0.55] scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtCC2fGwoOHRMl6hhKg5CHc_IkqXBTNk8ZRI6bINLHstd2JKjZQKZkfA16K18cBWcwL6oTO4e02H6BP0vhMiGk6O9qneFFFZ35LKI0DXVpShbE67YJNnLzOJjF8NI6LUHE6klxydybaGcfGqN6vpbiBDQyWClJ_kzlnl2s1rxmp5Z4GKW6IpBhDLfCt_0x5x-w2wWcdeIeNrOKkiAylYs_j785rBc_osR6-08kvtkBa61XoEcmLWQXDvczYwd0KpwzqXUs14YZcqvK"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-white font-headline text-sm xs:text-base sm:text-2xl md:text-4xl leading-tight font-bold tracking-tight text-center px-4">
            Gestión de Cabañas
          </h1>
        </div>
      </section>

      {/* Grid Categories */}
      <div className="space-y-2.5 xs:space-y-3.5 md:space-y-8">
        {/* PRIORIDADES */}
        <div className="space-y-1 md:space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#f6bb89] rounded-full"></span>
            <h2 className="text-[10px] md:text-sm font-sans font-bold text-neutral-400 uppercase tracking-widest px-1">
              Prioridades
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:gap-4">
            <button
              id="btn-shortcut-calendar"
              onClick={() => onNavigate("calendar")}
              className="flex items-center justify-start md:justify-center p-2.5 xs:p-3 md:p-6 bg-[#1b1e1b] border-t-2 border-[#D29B6C] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-row md:flex-col gap-2.5 md:gap-3 min-h-[52px] xs:min-h-[64px] md:min-h-[140px] w-full"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform w-7 h-7 xs:w-8 h-8 md:w-14 md:h-14 shadow-inner shrink-0">
                <Calendar className="w-4 h-4 xs:w-4.5 xs:h-4.5 md:w-7 md:h-7" />
              </div>
              <span className="text-[11px] xs:text-xs md:text-sm font-sans font-semibold text-neutral-200 text-left md:text-center line-clamp-1 md:line-clamp-2">
                Calendario de Reservas
              </span>
            </button>

            <button
              id="btn-shortcut-dashboard"
              onClick={() => onNavigate("dashboard")}
              className="flex items-center justify-start md:justify-center p-2.5 xs:p-3 md:p-6 bg-[#1b1e1b] border-t-2 border-[#D29B6C] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-row md:flex-col gap-2.5 md:gap-3 min-h-[52px] xs:min-h-[64px] md:min-h-[140px] w-full"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform w-7 h-7 xs:w-8 h-8 md:w-14 md:h-14 shadow-inner shrink-0">
                <Grid className="w-4 h-4 xs:w-4.5 xs:h-4.5 md:w-7 md:h-7" />
              </div>
              <span className="text-[11px] xs:text-xs md:text-sm font-sans font-semibold text-neutral-200 text-left md:text-center line-clamp-1 md:line-clamp-2">
                Dashboard de Análisis
              </span>
            </button>
          </div>
        </div>

        {/* CREACIÓN Y GESTIÓN */}
        <div className="space-y-1 md:space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-[#b2ceb4] rounded-full"></span>
            <h2 className="text-[10px] md:text-sm font-sans font-bold text-neutral-400 uppercase tracking-widest px-1">
              Creación y Gestión
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              id="btn-shortcut-client"
              onClick={() => onNavigate("new-client")}
              className="flex items-center justify-center p-1.5 xs:p-2 md:p-4 bg-[#1b1e1b] border-t-2 border-[#b2ceb4] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-1 md:gap-2 min-h-[68px] xs:min-h-[78px] md:min-h-[120px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-6 h-6 xs:w-8 xs:h-8 md:w-11 md:h-11 shrink-0">
                <UserPlus className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] xs:text-xs font-sans font-semibold text-neutral-300 text-center line-clamp-1">
                Nuevo Cliente
              </span>
            </button>

            <button
              id="btn-shortcut-booking"
              onClick={() => onNavigate("new-booking")}
              className="flex items-center justify-center p-1.5 xs:p-2 md:p-4 bg-[#1b1e1b] border-t-2 border-[#b2ceb4] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-1 md:gap-2 min-h-[68px] xs:min-h-[78px] md:min-h-[120px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-6 h-6 xs:w-8 xs:h-8 md:w-11 md:h-11 shrink-0">
                <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] xs:text-xs font-sans font-semibold text-neutral-300 text-center line-clamp-1">
                Nueva Reserva
              </span>
            </button>

            <button
              id="btn-shortcut-contract"
              onClick={() => onNavigate("contract-service")}
              className="flex items-center justify-center p-1.5 xs:p-2 md:p-4 bg-[#1b1e1b] border-t-2 border-[#b2ceb4] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-col gap-1 md:gap-2 min-h-[68px] xs:min-h-[78px] md:min-h-[120px]"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform w-6 h-6 xs:w-8 xs:h-8 md:w-11 md:h-11 shrink-0">
                <FilePlus className="w-3.5 h-3.5 xs:w-4 xs:h-4 md:w-5 md:h-5" />
              </div>
              <span className="text-[9px] xs:text-xs font-sans font-semibold text-neutral-300 text-center line-clamp-1">
                Contratar Serv.
              </span>
            </button>
          </div>
        </div>

        {/* RECURSOS Y CONFIGURACIÓN */}
        <div className="space-y-1 md:space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-3 bg-amber-700/60 rounded-full"></span>
            <h2 className="text-[10px] md:text-sm font-sans font-bold text-neutral-400 uppercase tracking-widest px-1">
              Configuración de Recursos
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 md:gap-4">
            <button
              id="btn-shortcut-cabin"
              onClick={() => onNavigate("new-cabin")}
              className="flex items-center justify-start md:justify-center p-2.5 xs:p-3 md:p-5 bg-[#1b1e1b] border-t-2 border-[#f9ba82] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-row md:flex-col gap-2.5 md:gap-3 min-h-[52px] xs:min-h-[64px] md:min-h-[120px] w-full"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-[1.03] transition-transform w-7 h-7 xs:w-8 xs:h-8 md:w-12 md:h-12 shrink-0">
                <Home className="w-4 h-4 xs:w-4.5 xs:h-4.5 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] xs:text-xs font-sans font-bold text-neutral-200 text-left md:text-center line-clamp-1">
                Nueva Cabaña {`(${stats.cabanasCount})`}
              </span>
            </button>

            <button
              id="btn-shortcut-services"
              onClick={() => onNavigate("new-service")}
              className="flex items-center justify-start md:justify-center p-2.5 xs:p-3 md:p-5 bg-[#1b1e1b] border-t-2 border-[#f9ba82] border-x border-b border-neutral-800/40 rounded-xl hover:bg-[#252925] transition-all cursor-pointer group flex-row md:flex-col gap-2.5 md:gap-3 min-h-[52px] xs:min-h-[64px] md:min-h-[120px] w-full"
            >
              <div className="bg-[#4a634e]/20 text-[#b2ceb4] rounded-lg flex items-center justify-center group-hover:scale-[1.03] transition-transform w-7 h-7 xs:w-8 xs:h-8 md:w-12 md:h-12 shrink-0">
                <Settings className="w-4 h-4 xs:w-4.5 xs:h-4.5 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] xs:text-xs font-sans font-bold text-neutral-200 text-left md:text-center line-clamp-1">
                Nuevo Servicio {`(${stats.serviciosCount})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center pt-2.5 pb-2 md:pt-6 md:pb-12 border-t border-neutral-900">
        <button
          id="btn-logout-client"
          onClick={onLogoutToGuest}
          className="flex items-center gap-2 px-4 py-1.5 md:px-8 md:py-3.5 bg-red-950/40 text-red-400 hover:bg-neutral-900 border border-red-950 rounded-full transition-all active:scale-95 shadow-md font-sans text-[10px] xs:text-xs md:text-sm font-bold uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Ver Catálogo Huésped
        </button>
      </div>
    </motion.div>
  );
}
