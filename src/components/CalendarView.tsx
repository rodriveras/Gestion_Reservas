/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowLeftRight, Users, Moon, Sparkles, Filter, ShieldAlert } from "lucide-react";
import { Cabana, Reserva, Cliente } from "../types";

interface CalendarViewProps {
  cabanas: Cabana[];
  reservas: Reserva[];
  clientes: Cliente[];
  onBack: () => void;
  onNavigate?: (screen: string, cabinId?: string, checkIn?: string) => void;
}

export default function CalendarView({ cabanas, reservas, clientes, onBack, onNavigate }: CalendarViewProps) {
  const [selectedCabanaId, setSelectedCabanaId] = useState<string>("all");
  const [currentMonthName, setCurrentMonthName] = useState<string>("Mayo 2024");

  // Defensive copies to avoid null-reference crashes
  const safeCabanas = cabanas || [];
  const safeReservas = reservas || [];
  const safeClientes = clientes || [];

  // Get dynamic upcoming arrivals
  const upcomingArrivals = safeReservas
    .filter((r) => r && r.checkIn) // Skip empty/null bookings
    .map((r) => {
      const client = safeClientes.find((c) => c && c.id === r.clienteId) || { nombre: "Invitado", apellido: "Anónimo" };
      const cabana = safeCabanas.find((c) => c && c.id === r.cabanaId) || { nombre: "Cabaña Desconocida" };
      
      const rawDate = new Date(r.checkIn);
      const dateText = isNaN(rawDate.getTime()) 
        ? "Fecha Inválida" 
        : rawDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

      return {
        id: r.id,
        guestName: `${client.nombre} ${client.apellido}`,
        price: (r.montoTotal || 0) * 1000,
        cabinName: cabana.nombre,
        dateText,
        passengers: r.cantidadPersonas || 0,
        nights: r.noches || 0,
        rawCheckIn: r.checkIn,
      };
    })
    .sort((a, b) => {
      const timeA = new Date(a.rawCheckIn).getTime();
      const timeB = new Date(b.rawCheckIn).getTime();
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });

  // Helper to determine occupancy dynamically, checking database reservations + visual seeding baseline
  const getDayStateForCabin = (cabinId: string, dayNum: number, monthName: string) => {
    const year = monthName.includes("2024") ? 2024 : 2026;
    const monthIndex = monthName.includes("Abril") ? 3 : monthName.includes("Junio") ? 5 : 4; // 3=Apr, 4=May, 5=Jun
    const currentDate = new Date(year, monthIndex, dayNum);

    // 1. Check real bookings in database
    const isBooked = safeReservas.some((r) => {
      if (!r) return false;
      if (cabinId !== "all" && r.cabanaId !== cabinId) return false;
      const start = new Date(r.checkIn);
      const end = new Date(r.checkOut);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      // Clean check dates
      const currentDateCloned = new Date(currentDate);
      const currentMs = currentDateCloned.setHours(0, 0, 0, 0);
      const startMs = new Date(start).setHours(0, 0, 0, 0);
      const endMs = new Date(end).setHours(0, 0, 0, 0);

      return currentMs >= startMs && currentMs < endMs;
    });

    if (isBooked) return "reserved";

    // 2. Mockup data for visual matching in Mayo 2024
    if (year === 2024 && monthIndex === 4) {
      if (cabinId === "CAB-01" && [3, 4, 14, 22].includes(dayNum)) return "reserved";
      if (cabinId === "CAB-02" && [6, 7, 22].includes(dayNum)) return "reserved";
      if (cabinId === "CAB-03" && [14].includes(dayNum)) return "reserved";
      if (cabinId === "CAB-03" && [11, 12].includes(dayNum)) return "maintenance";
    }

    return "available";
  };

  const getDaysInMonth = () => {
    const year = currentMonthName.includes("2024") ? 2024 : 2026;
    const monthIndex = currentMonthName.includes("Abril") ? 3 : currentMonthName.includes("Junio") ? 5 : 4;
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getOffsetDays = () => {
    const year = currentMonthName.includes("2024") ? 2024 : 2026;
    const monthIndex = currentMonthName.includes("Abril") ? 3 : currentMonthName.includes("Junio") ? 5 : 4;
    const firstDayIndex = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday, 1 = Monday...
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  const getDayName = (dayNum: number) => {
    const year = currentMonthName.includes("2024") ? 2024 : 2026;
    const monthIndex = currentMonthName.includes("Abril") ? 3 : currentMonthName.includes("Junio") ? 5 : 4;
    const date = new Date(year, monthIndex, dayNum);
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return days[date.getDay()];
  };

  const daysInMonth = getDaysInMonth();
  const offsetDays = getOffsetDays();

  // Populate daysList for single calendar grid
  const daysList = [];
  const year = currentMonthName.includes("2024") ? 2024 : 2026;
  const monthIndex = currentMonthName.includes("Abril") ? 3 : currentMonthName.includes("Junio") ? 5 : 4;
  const prevMonthDate = new Date(year, monthIndex, 0);
  const prevMonthDaysCount = prevMonthDate.getDate();

  // Tail of previous month
  for (let i = offsetDays - 1; i >= 0; i--) {
    daysList.push({
      day: prevMonthDaysCount - i,
      currentMonth: false,
      state: "inactive" as const,
    });
  }

  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const state = getDayStateForCabin(selectedCabanaId, i, currentMonthName);
    daysList.push({ day: i, currentMonth: true, state });
  }

  // Tail of next month
  const totalCells = daysList.length;
  const nextDaysCount = 42 - totalCells;
  for (let i = 1; i <= nextDaysCount; i++) {
    daysList.push({
      day: i,
      currentMonth: false,
      state: "inactive" as const,
    });
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-neutral-900">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#b2ceb4]">
            Disponibilidad y reservas
          </h2>
          <p className="text-neutral-400 font-sans text-sm mt-1">
            Gestiona el calendario de ocupación y próximas estancias.
          </p>
        </div>

        {/* Cabin Select Filter */}
        <div className="w-full md:w-80">
          <label className="block text-xs font-sans font-bold text-[#f9ba82] mb-1.5 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#f9ba82]" />
            Seleccionar Unidad
          </label>
          <div className="relative">
            <select
              value={selectedCabanaId}
              onChange={(e) => setSelectedCabanaId(e.target.value)}
              className="w-full bg-[#1e201e] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 font-sans appearance-none focus:ring-2 focus:ring-[#b2ceb4]/40 focus:border-[#b2ceb4] outline-none transition-all"
            >
              <option value="all">Todas las unidades</option>
              {safeCabanas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
              expand_more
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 8 cols - Calendar Grid Card */}
        <div className="lg:col-span-8 bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#f6bb89]/70 shadow-xl border-x border-b border-neutral-900/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-headline font-semibold text-neutral-100">
              {currentMonthName}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonthName(currentMonthName === "Mayo 2024" ? "Abril 2024" : "Mayo 2024")}
                className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer border border-neutral-800/40"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthName(currentMonthName === "Mayo 2024" ? "Junio 2024" : "Mayo 2024")}
                className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer border border-neutral-800/40"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Layouts */}
          {selectedCabanaId === "all" ? (
            /* Multi-cabin Occupancy Grid (Gantt Timeline) */
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-850">
              <div className="min-w-[850px] space-y-4">
                {/* Header Row: Days 1 to 31 */}
                <div className="flex items-center gap-1 border-b border-neutral-850 pb-2">
                  <div className="w-36 shrink-0 text-left text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-widest pl-2">
                    Unidad
                  </div>
                  <div className="flex-1 flex justify-between gap-1">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                      const dayName = getDayName(dayNum);
                      const isWeekend = dayName === "Sáb" || dayName === "Dom";
                      return (
                        <div 
                          key={dayNum} 
                          className={`flex-1 flex flex-col items-center justify-center p-1 rounded min-w-[24px] ${
                            isWeekend ? "bg-neutral-900/40 text-neutral-400" : "text-neutral-500"
                          }`}
                        >
                          <span className="text-[10px] font-bold font-sans">{dayNum}</span>
                          <span className="text-[7px] uppercase tracking-tighter mt-0.5">{dayName[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cabin Rows */}
                <div className="space-y-2">
                  {safeCabanas.map((cab) => (
                    <div key={cab.id} className="flex items-center gap-1 bg-[#121412]/40 rounded-xl p-2 border border-neutral-900/60 hover:border-neutral-800 transition-all">
                      {/* Left: Cabin Name Column */}
                      <div className="w-36 shrink-0 text-left flex flex-col justify-center pl-1">
                        <span className="text-xs font-headline font-semibold text-neutral-200 truncate">
                          {cab.nombre}
                        </span>
                        <span className="text-[9px] font-sans text-neutral-500 mt-0.5 uppercase tracking-wide">
                          {cab.id} • ${cab.precioBase}
                        </span>
                      </div>
                      
                      {/* Right: Day Occupancy Cells */}
                      <div className="flex-1 flex justify-between gap-1">
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                          const state = getDayStateForCabin(cab.id, dayNum, currentMonthName);
                          let cellColor = "bg-[#1b1e1b]/40 border-neutral-850/20 text-neutral-600";
                          let hoverClass = "";

                          if (state === "available") {
                            cellColor = "bg-emerald-950/20 text-[#b2ceb4] border-[#4a634e]/30 hover:bg-[#4a634e]/30";
                            hoverClass = "cursor-pointer hover:scale-[1.08]";
                          } else if (state === "reserved") {
                            cellColor = "bg-rose-950/25 text-rose-300 border-rose-900/30 hover:bg-rose-950/40";
                          } else if (state === "maintenance") {
                            cellColor = "bg-amber-950/25 text-amber-300 border-amber-900/30 hover:bg-amber-950/40";
                          }

                          const handleCellClick = () => {
                            if (state === "available" && onNavigate) {
                              const yearMonth = currentMonthName === "Abril 2024" ? "2024-04" : currentMonthName === "Junio 2024" ? "2024-06" : "2024-05";
                              const checkInDate = `${yearMonth}-${dayNum.toString().padStart(2, "0")}`;
                              onNavigate("new-booking", cab.id, checkInDate);
                            }
                          };

                          return (
                            <div
                              key={dayNum}
                              onClick={handleCellClick}
                              className={`flex-1 min-w-[24px] h-10 border rounded-md flex items-center justify-center text-[9px] font-sans font-bold transition-all ${cellColor} ${hoverClass}`}
                              title={`${cab.nombre} - Día ${dayNum} (${state.toUpperCase()})`}
                            >
                              {dayNum}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Standard Single-Cabin Calendar Grid */
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-neutral-500 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}

              {daysList.map((item, idx) => {
                let cellBg = "bg-[#121412]/40 border-neutral-850/40 text-neutral-600";
                let statusDot = null;

                if (item.currentMonth) {
                  if (item.state === "available") {
                    cellBg = "bg-[#4a634e]/10 border-emerald-900/10 hover:bg-[#4a634e]/20 text-[#b2ceb4] cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#b2ceb4] rounded-full"></div>;
                  } else if (item.state === "reserved") {
                    cellBg = "bg-rose-950/20 border-rose-900/20 hover:bg-rose-950/30 text-rose-300 cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>;
                  } else if (item.state === "maintenance") {
                    cellBg = "bg-amber-950/20 border-amber-900/20 hover:bg-amber-950/30 text-amber-300 cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#f9ba82] rounded-full"></div>;
                  }
                }

                const handleDayClick = () => {
                  if (item.currentMonth && selectedCabanaId !== "all" && onNavigate) {
                    const yearMonth = currentMonthName === "Abril 2024" ? "2024-04" : currentMonthName === "Junio 2024" ? "2024-06" : "2024-05";
                    const checkInDate = `${yearMonth}-${item.day.toString().padStart(2, "0")}`;
                    onNavigate("new-booking", selectedCabanaId, checkInDate);
                  }
                };

                return (
                  <div
                    key={`${item.day}-${idx}`}
                    onClick={handleDayClick}
                    className={`h-20 border rounded-lg flex flex-col p-2 relative transition-all ${
                      selectedCabanaId !== "all" && item.currentMonth ? "hover:scale-[1.03] cursor-pointer hover:border-[#b2ceb4]/40 hover:bg-neutral-850/50" : ""
                    } ${cellBg}`}
                  >
                    <span className="text-xs font-sans font-bold">{item.day}</span>
                    {statusDot}
                  </div>
                );
              })}
            </div>
          )}

          {/* Indicators Legend */}
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-neutral-900">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#b2ceb4]"></div>
              <span className="text-xs text-neutral-400 font-sans font-medium">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
              <span className="text-xs text-neutral-400 font-sans font-medium">Reservado / Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f9ba82]"></div>
              <span className="text-xs text-neutral-400 font-sans font-medium">Mantenimiento</span>
            </div>
          </div>
        </div>

        {/* Right: 4 cols - Próximas Llegadas list */}
        <div className="lg:col-span-4 bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#f6bb89]/70 shadow-xl flex flex-col border-x border-b border-neutral-900/30 min-h-[480px]">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-neutral-900">
            <ArrowLeftRight className="w-4 h-4 text-[#f6bb89]" />
            <h3 className="text-lg font-headline font-semibold text-neutral-100">
              Próximas Llegadas
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-1">
            {upcomingArrivals.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm font-sans">
                Sin registros de reservas para este periodo.
              </div>
            ) : (
              upcomingArrivals.map((arr) => (
                <div
                  key={arr.id}
                  className="bg-[#121412] p-4 rounded-xl border border-neutral-800 hover:border-[#b2ceb4]/40 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-xs font-sans font-bold text-neutral-100 group-hover:text-[#b2ceb4] transition-colors truncate max-w-[140px]">
                      {arr.guestName}
                    </h4>
                    <span className="text-xs font-sans font-bold text-[#b2ceb4]">
                      {formatCurrency(arr.price)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#f6bb89] mb-3">
                    <span className="font-semibold">{arr.cabinName}</span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-400">{arr.dateText}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{arr.passengers} Pasajeros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{arr.nights} Noches</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onBack()}
            className="w-full text-center py-3 mt-6 border border-neutral-800 hover:bg-neutral-800 font-sans text-xs font-semibold text-neutral-400 rounded-lg hover:text-white transition-all cursor-pointer"
          >
            Ver Todas las Llegadas
          </button>
        </div>
      </div>
    </motion.div>
  );
}
