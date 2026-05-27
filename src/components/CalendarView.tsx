/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowLeftRight, Users, Moon, Sparkles, ShieldAlert } from "lucide-react";
import { Cabana, Reserva, Cliente, Servicio, ContratacionServicio } from "../types";

// Helper to parse dates in local timezone to avoid UTC shifting bugs
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date(NaN);
  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
  return new Date(normalized);
};

interface CalendarViewProps {
  cabanas: Cabana[];
  reservas: Reserva[];
  clientes: Cliente[];
  servicios?: Servicio[];
  contrataciones?: ContratacionServicio[];
  onBack: () => void;
  onNavigate?: (screen: string, cabinId?: string, checkIn?: string, viewBookingId?: string) => void;
}

export default function CalendarView({
  cabanas,
  reservas,
  clientes,
  servicios = [],
  contrataciones = [],
  onBack,
  onNavigate,
}: CalendarViewProps) {
  const [selectedCabanaId, setSelectedCabanaId] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentMonthName = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Defensive copies to avoid null-reference crashes
  const safeCabanas = cabanas || [];
  const safeReservas = reservas || [];
  const safeClientes = clientes || [];

  // Get dynamic upcoming arrivals
  const upcomingArrivals = safeReservas
    .filter((r) => r && r.checkIn && (selectedCabanaId === "all" || r.cabanaId === selectedCabanaId)) // Skip empty/null bookings and filter by cabin
    .map((r) => {
      const client = safeClientes.find((c) => c && c.id === r.clienteId) || { nombre: "Invitado", apellido: "Anónimo" };
      const cabana = safeCabanas.find((c) => c && c.id === r.cabanaId) || { nombre: "Cabaña Desconocida" };
      
      const rawDate = parseLocalDate(r.checkIn);
      const dateText = isNaN(rawDate.getTime()) 
        ? "Fecha Inválida" 
        : rawDate.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

      // Find services contracted for this reservation
      const bookingServices = contrataciones.filter((c) => c.reservaId === r.id);
      const servicesTotal = bookingServices.reduce((sum, c) => sum + (c.subtotal || 0), 0);
      const deposit = r.montoAnticipo || 0;
      const balance = (r.montoTotal || 0) + servicesTotal - deposit;

      const servicesWithNames = bookingServices.map((c) => {
        const srv = servicios.find((s) => s.id === c.servicioId);
        return {
          id: c.id,
          nombre: srv ? srv.nombre : "Servicio",
          cantidad: c.cantidad,
        };
      });

      return {
        id: r.id,
        guestName: `${client.nombre} ${client.apellido}`,
        price: r.montoTotal || 0,
        cabinName: cabana.nombre,
        dateText,
        passengers: r.cantidadPersonas || 0,
        nights: r.noches || 0,
        rawCheckIn: r.checkIn,
        deposit,
        servicesTotal,
        balance,
        services: servicesWithNames,
      };
    })
    .sort((a, b) => {
      const timeA = new Date(a.rawCheckIn).getTime();
      const timeB = new Date(b.rawCheckIn).getTime();
      return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
    });

  const getBookingForDayAndCabin = (cabinId: string, dayNum: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);

    return safeReservas.find((r) => {
      if (!r) return false;
      if (cabinId !== "all" && r.cabanaId !== cabinId) return false;
      const start = parseLocalDate(r.checkIn);
      const end = parseLocalDate(r.checkOut);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      const currentDateCloned = new Date(checkDate);
      const currentMs = currentDateCloned.setHours(0, 0, 0, 0);
      const startMs = new Date(start).setHours(0, 0, 0, 0);
      const endMs = new Date(end).setHours(0, 0, 0, 0);

      return currentMs >= startMs && currentMs < endMs;
    });
  };

  // Helper to determine occupancy dynamically, checking database reservations + visual seeding baseline
  const getDayStateForCabin = (cabinId: string, dayNum: number) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);

    // 1. Check real bookings in database
    const isBooked = safeReservas.some((r) => {
      if (!r) return false;
      if (cabinId !== "all" && r.cabanaId !== cabinId) return false;
      const start = parseLocalDate(r.checkIn);
      const end = parseLocalDate(r.checkOut);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;

      // Clean check dates
      const currentDateCloned = new Date(checkDate);
      const currentMs = currentDateCloned.setHours(0, 0, 0, 0);
      const startMs = new Date(start).setHours(0, 0, 0, 0);
      const endMs = new Date(end).setHours(0, 0, 0, 0);

      return currentMs >= startMs && currentMs < endMs;
    });

    if (isBooked) return "reserved";

    // 2. No mockup data visual overrides (clean database mode)

    return "available";
  };

  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  };

  const getOffsetDays = () => {
    const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday, 1 = Monday...
    return firstDayIndex === 0 ? 6 : firstDayIndex - 1;
  };

  const getDayName = (dayNum: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return days[date.getDay()];
  };

  const daysInMonth = getDaysInMonth();
  const offsetDays = getOffsetDays();

  // Populate daysList for single calendar grid
  const daysList = [];
  const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
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
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const checkMs = checkDate.setHours(0, 0, 0, 0);

    const activeBookings = selectedCabanaId === "all" ? [] : safeReservas.filter((r) => {
      if (!r || r.cabanaId !== selectedCabanaId || r.estadoReserva === "Cancelada") return false;
      const startMs = parseLocalDate(r.checkIn).setHours(0, 0, 0, 0);
      const endMs = parseLocalDate(r.checkOut).setHours(0, 0, 0, 0);
      return checkMs >= startMs && checkMs <= endMs;
    });

    const checkInBooking = activeBookings.find((r) => parseLocalDate(r.checkIn).setHours(0, 0, 0, 0) === checkMs);
    const checkOutBooking = activeBookings.find((r) => parseLocalDate(r.checkOut).setHours(0, 0, 0, 0) === checkMs);

    const isCheckIn = !!checkInBooking;
    const isCheckOut = !!checkOutBooking;
    const isFullyBooked = activeBookings.some((r) => {
      const startMs = parseLocalDate(r.checkIn).setHours(0, 0, 0, 0);
      const endMs = parseLocalDate(r.checkOut).setHours(0, 0, 0, 0);
      return checkMs > startMs && checkMs < endMs;
    });

    const isDoubleTransition = isCheckIn && isCheckOut;
    const isCellReserved = isFullyBooked || (isCheckIn && !isDoubleTransition);

    daysList.push({
      day: i,
      currentMonth: true,
      isCheckIn,
      isCheckOut,
      isFullyBooked,
      isDoubleTransition,
      checkInBooking,
      checkOutBooking,
      state: isDoubleTransition 
        ? ("transition" as const) 
        : isCellReserved 
          ? ("reserved" as const) 
          : ("available" as const),
    });
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

        {/* Toggle & Filter Container */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto pb-1">
          {/* Planificador General Button */}
          <button
            onClick={() => setSelectedCabanaId("all")}
            className={`px-5 py-3 text-sm font-sans font-bold rounded-xl transition-all border cursor-pointer ${
              selectedCabanaId === "all"
                ? "bg-[#4a634e] text-white border-[#4a634e] shadow-lg shadow-emerald-950/20"
                : "bg-[#1e201e] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
            }`}
          >
            Planificador general
          </button>

          {/* Cabin Dropdown */}
          <div className="relative w-full sm:w-56">
            <select
              value={selectedCabanaId === "all" ? "" : selectedCabanaId}
              onChange={(e) => {
                if (e.target.value) setSelectedCabanaId(e.target.value);
              }}
              className={`w-full bg-[#1e201e] border rounded-xl px-4 py-3 text-sm font-sans appearance-none outline-none transition-all cursor-pointer ${
                selectedCabanaId !== "all"
                  ? "border-[#4a634e] text-[#b2ceb4] ring-2 ring-[#b2ceb4]/20"
                  : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              <option value="" disabled hidden>Filtrar por cabaña</option>
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
              {selectedCabanaId === "all" 
                ? "Planificador general" 
                : (safeCabanas.find((c) => c.id === selectedCabanaId)?.nombre || "Detalle de Unidad")}
            </h3>
            <div className="flex items-center gap-3 bg-[#121412]/60 border border-neutral-800/50 px-3 py-1.5 rounded-xl">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-sans font-bold text-[#b2ceb4] min-w-[95px] text-center tracking-wide">
                {currentMonthName}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-all cursor-pointer"
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
                          className={`flex-1 flex flex-col items-center justify-center p-1.5 rounded min-w-[24px] ${
                            isWeekend ? "bg-neutral-900/60" : ""
                          }`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isWeekend ? "text-[#f6bb89]" : "text-neutral-400"}`}>{dayName[0]}</span>
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
                        <span className="text-xs font-headline font-bold text-neutral-200 truncate">
                          {cab.nombre}
                        </span>
                      </div>
                      
                      {/* Right: Day Occupancy Cells */}
                      <div className="flex-1 flex justify-between gap-1">
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dayNum) => {
                          const state = getDayStateForCabin(cab.id, dayNum);

                          // Calculate transitions for the Gantt timeline cells
                          const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                          const checkMs = checkDate.setHours(0, 0, 0, 0);

                          const activeBookings = safeReservas.filter((r) => {
                            if (!r || r.cabanaId !== cab.id || r.estadoReserva === "Cancelada") return false;
                            const startMs = parseLocalDate(r.checkIn).setHours(0, 0, 0, 0);
                            const endMs = parseLocalDate(r.checkOut).setHours(0, 0, 0, 0);
                            return checkMs >= startMs && checkMs <= endMs;
                          });

                          const checkInBooking = activeBookings.find((r) => parseLocalDate(r.checkIn).setHours(0, 0, 0, 0) === checkMs);
                          const checkOutBooking = activeBookings.find((r) => parseLocalDate(r.checkOut).setHours(0, 0, 0, 0) === checkMs);

                          const isCheckIn = !!checkInBooking;
                          const isCheckOut = !!checkOutBooking;
                          const isDoubleTransition = isCheckIn && isCheckOut;

                          let cellColor = "bg-[#1b1e1b]/40 border-neutral-850/20 text-neutral-600";
                          let hoverClass = "cursor-pointer hover:scale-[1.08]";
                          let cellTitle = `${cab.nombre} - Día ${dayNum}`;

                          const isGanttCellReserved = state === "reserved" || (isCheckIn && !isDoubleTransition);

                          if (isDoubleTransition) {
                            cellColor = "occupancy-double-transition text-rose-200";
                            cellTitle += " | ALERTA: Aseo Express Requerido";
                          } else if (isGanttCellReserved) {
                            cellColor = "bg-rose-950/50 text-rose-200 border-rose-800/40 hover:bg-rose-900/40";
                            if (isCheckIn) cellTitle += " | Entrada / Check-In";
                          } else if (state === "maintenance") {
                            cellColor = "bg-amber-950/55 text-amber-200 border-amber-800/40 hover:bg-amber-900/40";
                            hoverClass = "";
                          } else {
                            cellColor = "bg-emerald-950/50 text-emerald-200 border-emerald-800/40 hover:bg-emerald-900/40";
                            if (isCheckOut) cellTitle += " | Salida / Check-Out";
                          }

                          const handleCellClick = () => {
                            const yearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`;
                            const checkInDate = `${yearMonth}-${dayNum.toString().padStart(2, "0")}`;
                            
                            if ((state === "available" || (isCheckOut && !isDoubleTransition)) && onNavigate) {
                              onNavigate("new-booking", cab.id, checkInDate);
                            } else if ((state === "reserved" || isCheckIn || isDoubleTransition) && onNavigate) {
                              const booking = checkInBooking || getBookingForDayAndCabin(cab.id, dayNum);
                              if (booking) {
                                onNavigate("new-booking", cab.id, undefined, booking.id);
                              }
                            }
                          };

                          return (
                            <div
                              key={dayNum}
                              onClick={handleCellClick}
                              className={`flex-1 min-w-[24px] h-10 border rounded-md flex items-center justify-center text-[11px] font-sans font-extrabold transition-all ${cellColor} ${hoverClass}`}
                              title={cellTitle}
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
                <div key={d} className="text-center text-xs font-extrabold text-neutral-300 uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}

              {daysList.map((item, idx) => {
                let cellBg = "bg-[#121412]/40 border-neutral-850/40 text-neutral-600";
                let statusDot = null;
                let titleText = "";
                let isClickable = false;

                if (item.currentMonth) {
                  if (item.state === "available") {
                    cellBg = "bg-emerald-950/50 border-emerald-800/40 hover:bg-emerald-900/40 text-emerald-200 cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>;
                    titleText = "Disponible (Haga clic para reservar)";
                    isClickable = true;
                  } else if (item.state === "reserved") {
                    cellBg = "bg-rose-950/50 border-rose-800/40 hover:bg-rose-900/40 text-rose-200 cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>;
                    titleText = "Reservado / Ocupado";
                    isClickable = true;
                  } else if (item.state === "transition") {
                    isClickable = true;
                    cellBg = "occupancy-double-transition text-rose-200";
                    titleText = `Mañana: Checkout (${(item as any).checkOutBooking?.id}) | Tarde: Checkin (${(item as any).checkInBooking?.id}) | ALERTA: Aseo Express Requerido`;
                  } else if (item.state === "maintenance") {
                    cellBg = "bg-amber-950/55 border-amber-800/40 hover:bg-amber-900/40 text-amber-200";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>;
                    titleText = "Mantenimiento";
                  }
                }

                const handleDayClick = () => {
                  if (item.currentMonth && selectedCabanaId !== "all" && onNavigate) {
                    const yearMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`;
                    const checkInDate = `${yearMonth}-${item.day.toString().padStart(2, "0")}`;
                    
                    if (item.state === "available" || (item.state === "transition" && item.isCheckOut && !item.isDoubleTransition)) {
                      // Click on available afternoon allows creating check-in starting today!
                      onNavigate("new-booking", selectedCabanaId, checkInDate);
                    } else if (item.state === "reserved" || (item.state === "transition" && item.isCheckIn)) {
                      // Click on reserved or checkin afternoon navigates to see/edit booking starting or occupying
                      const targetBooking = (item as any).checkInBooking || getBookingForDayAndCabin(selectedCabanaId, item.day);
                      if (targetBooking) {
                        onNavigate("new-booking", selectedCabanaId, undefined, targetBooking.id);
                      }
                    } else if (item.state === "transition" && item.isDoubleTransition) {
                      // Double transition shows checkout booking or checkin booking. Navigate to check-in by default
                      const targetBooking = (item as any).checkInBooking || (item as any).checkOutBooking;
                      if (targetBooking) {
                        onNavigate("new-booking", selectedCabanaId, undefined, targetBooking.id);
                      }
                    }
                  }
                };

                return (
                  <div
                    key={`${item.day}-${idx}`}
                    onClick={handleDayClick}
                    title={titleText}
                    className={`h-20 border rounded-lg flex flex-col p-2 relative transition-all ${
                      selectedCabanaId !== "all" && item.currentMonth && isClickable ? "hover:scale-[1.03] cursor-pointer hover:border-[#b2ceb4]/40" : ""
                    } ${cellBg}`}
                  >
                    <span className="text-sm font-sans font-extrabold text-neutral-100">{item.day}</span>
                    {statusDot}
                    {item.currentMonth && item.state === "transition" && (
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-[#121412]/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-sans font-black uppercase tracking-wider text-[#f6bb89] border border-neutral-800/80 shadow-md">
                        {item.isDoubleTransition ? (
                          <span className="flex items-center gap-0.5 text-yellow-400">
                            <ArrowLeftRight className="w-2 h-2 text-yellow-400" />
                            Aseo Express
                          </span>
                        ) : item.isCheckIn ? (
                          <span>Entrada</span>
                        ) : (
                          <span>Salida</span>
                        )}
                      </div>
                    )}
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
              {selectedCabanaId === "all" ? "Todas las Reservas" : "Próximas Llegadas"}
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
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate("new-booking", undefined, undefined, arr.id);
                    }
                  }}
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

                  {/* Contracted services inline list */}
                  {arr.services && arr.services.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-900/40 space-y-1">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider block">Servicios contratados:</span>
                      <div className="flex flex-wrap gap-1">
                        {arr.services.map((srv: any) => (
                          <span key={srv.id} className="bg-[#4a634e]/10 text-[#b2ceb4] border border-[#4a634e]/30 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                            {srv.nombre} (x{srv.cantidad})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Breakdown / Balance */}
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-900/60 grid grid-cols-2 gap-1.5 text-[10px] bg-[#121412]/50 p-2 rounded-lg border border-neutral-900/30">
                    <div className="flex justify-between col-span-2 text-[9px] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-900/40 pb-0.5 mb-0.5">
                      <span>Detalle de Cuenta</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-neutral-500 uppercase font-sans font-semibold">Total Cabaña</span>
                      <span className="text-xs font-headline font-semibold text-neutral-300">{formatCurrency(arr.price)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] text-neutral-500 uppercase font-sans font-semibold">Servicios</span>
                      <span className="text-xs font-headline font-semibold text-[#b2ceb4]">{formatCurrency(arr.servicesTotal)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-neutral-500 uppercase font-sans font-semibold">Anticipo</span>
                      <span className="text-xs font-headline font-semibold text-neutral-400">{formatCurrency(arr.deposit)}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[8px] text-[#f6bb89] uppercase font-sans font-bold">Saldo x Pagar</span>
                      <span className="text-xs font-headline font-bold text-[#f6bb89]">{formatCurrency(arr.balance)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
