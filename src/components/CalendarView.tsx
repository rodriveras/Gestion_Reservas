/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowLeftRight, Users, Moon, Sparkles, ShieldAlert, Layers, Filter } from "lucide-react";
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
  onSaveBooking?: (booking: Reserva) => void;
  onSaveContratacion?: (contract: ContratacionServicio) => void;
}

export default function CalendarView({
  cabanas,
  reservas,
  clientes,
  servicios = [],
  contrataciones = [],
  onBack,
  onNavigate,
  onSaveBooking,
  onSaveContratacion,
}: CalendarViewProps) {
  const [selectedCabanaId, setSelectedCabanaId] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  const [selectedReservaId, setSelectedReservaId] = useState<string | null>(null);
  const [amountToPay, setAmountToPay] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Transferencia">("Transferencia");
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState<boolean>(false);

  const isPastDay = (dayNumber: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < today.getTime();
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const generateMonthOptions = () => {
    const options = [];
    const baseDate = new Date();
    const currentYear = baseDate.getFullYear();
    const currentMonth = baseDate.getMonth();
    
    // Sólo los meses del año en curso, con un máximo de 6 meses
    for (let i = 0; i < 6; i++) {
      const d = new Date(currentYear, currentMonth + i, 1);
      if (d.getFullYear() === currentYear) {
        options.push(d);
      } else {
        break; // Detenerse si cruza al siguiente año
      }
    }
    return options;
  };

  const formatMonthOptionLabel = (date: Date) => {
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

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
  const getDayStateForCabin = (cabinId: string, dayNum: number): "available" | "reserved" | "maintenance" => {
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

  const handleConfirmPayment = (bookingId: string, balance: number) => {
    const paymentVal = Number(amountToPay);
    if (isNaN(paymentVal) || paymentVal <= 0) {
      alert("Error: Ingrese un monto de pago válido mayor a 0.");
      return;
    }

    if (paymentVal > balance) {
      alert(`Error: El monto ingresado (${formatCurrency(paymentVal)}) supera el saldo pendiente de la reserva (${formatCurrency(balance)}).`);
      return;
    }

    const booking = safeReservas.find((r) => r.id === bookingId);
    if (!booking) {
      alert("Error: Reserva no encontrada.");
      return;
    }

    // Calculate new advance payment
    const newAnticipo = (booking.montoAnticipo || 0) + paymentVal;
    
    // Check if paid in full (balance becomes 0)
    const newBalance = balance - paymentVal;
    const isFullyPaid = newBalance <= 0;
    const newEstado: Reserva["estadoReserva"] = isFullyPaid ? "Pagada" : booking.estadoReserva;

    const updatedBooking: Reserva = {
      ...booking,
      montoAnticipo: newAnticipo,
      estadoReserva: newEstado,
      metodoPago: paymentMethod,
    };

    // Save the updated booking
    if (onSaveBooking) {
      onSaveBooking(updatedBooking);
    }

    // If fully paid, mark contracted services as Pagado as well
    if (isFullyPaid && onSaveContratacion && contrataciones) {
      const bookingServices = contrataciones.filter((c) => c.reservaId === bookingId);
      bookingServices.forEach((contract) => {
        if (contract.estadoPago !== "Pagado") {
          onSaveContratacion({
            ...contract,
            estadoPago: "Pagado",
            medioPago: paymentMethod,
          });
        }
      });
    }

    alert("¡Pago registrado satisfactoriamente!");
    setSelectedReservaId(null);
  };

  const handleAnticipateCheckOut = (bookingId: string) => {
    const booking = safeReservas.find((r) => r.id === bookingId);
    if (!booking) {
      alert("Error: Reserva no encontrada.");
      return;
    }

    if (!window.confirm("¿Está seguro de realizar el Check-Out anticipado para el día de hoy? Esto recalculará las noches de estadía.")) {
      return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;

    // Recalculate nights
    const start = parseLocalDate(booking.checkIn);
    const checkInDate = new Date(start);
    checkInDate.setHours(12, 0, 0, 0);
    const todayDateCloned = new Date(today);
    todayDateCloned.setHours(12, 0, 0, 0);
    const diffTime = todayDateCloned.getTime() - checkInDate.getTime();
    let newNoches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (newNoches < 1) newNoches = 1;

    const updatedBooking: Reserva = {
      ...booking,
      checkOut: todayStr,
      noches: newNoches,
    };

    // Save the updated booking
    if (onSaveBooking) {
      onSaveBooking(updatedBooking);
    }

    alert(`¡Check-Out anticipado realizado con éxito! Salida programada para hoy (${todayStr}) y duración de estadía actualizada a ${newNoches} noche(s).`);
    setSelectedReservaId(null);
    setIsPaymentFormOpen(false);
  };

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
          <h2 className="text-sm font-sans font-bold text-neutral-100">
            Disponibilidad y reservas
          </h2>
        </div>

        {/* Toggle & Filter Container */}
        <div className="flex flex-row items-center gap-3 pb-1 shrink-0">
          {/* Planificador Button */}
          <button
            onClick={() => setSelectedCabanaId("all")}
            title="Planificador"
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border cursor-pointer shrink-0 ${
              selectedCabanaId === "all"
                ? "bg-[#4a634e] text-white border-[#4a634e] shadow-lg shadow-emerald-950/20"
                : "bg-[#1e201e] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
          </button>

          {/* Cabin Dropdown */}
          <div className="relative">
            <select
              value={selectedCabanaId === "all" ? "" : selectedCabanaId}
              onChange={(e) => {
                if (e.target.value) setSelectedCabanaId(e.target.value);
              }}
              className={`w-10 h-10 bg-[#1e201e] border rounded-xl appearance-none outline-none transition-all cursor-pointer text-transparent select-none ${
                selectedCabanaId !== "all"
                  ? "border-[#4a634e] ring-2 ring-[#b2ceb4]/10"
                  : "border-neutral-800 hover:border-neutral-700"
              }`}
              title={selectedCabanaId === "all" ? "Filtrar por cabaña" : `Filtrado por: ${safeCabanas.find(c => c.id === selectedCabanaId)?.nombre}`}
            >
              <option value="" disabled hidden></option>
              {safeCabanas.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1b1e1b] text-neutral-200 text-xs">
                  {c.nombre}
                </option>
              ))}
            </select>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Filter className={`w-4.5 h-4.5 ${selectedCabanaId !== "all" ? "text-[#b2ceb4]" : "text-neutral-400"}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 8 cols - Calendar Grid Card */}
        <div className="lg:col-span-8 bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#f6bb89]/70 shadow-xl border-x border-b border-neutral-900/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-sans font-bold text-neutral-100">
              {selectedCabanaId === "all" 
                ? "Planificador" 
                : (safeCabanas.find((c) => c.id === selectedCabanaId)?.nombre || "Detalle de Unidad")}
            </h3>
            <div className="relative">
              <select
                value={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split("-").map(Number);
                  setCurrentDate(new Date(year, month, 1));
                }}
                className="bg-[#121412]/60 text-[11px] font-sans font-bold text-[#b2ceb4] border border-neutral-850/60 pl-2 pr-6 py-0.5 rounded-md outline-none appearance-none cursor-pointer hover:border-neutral-700 hover:text-white transition-all h-7 min-w-[125px]"
              >
                {generateMonthOptions().map((opt) => {
                  const val = `${opt.getFullYear()}-${opt.getMonth()}`;
                  return (
                    <option key={val} value={val} className="bg-[#1b1e1b] text-neutral-200">
                      {formatMonthOptionLabel(opt)}
                    </option>
                  );
                })}
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-[10px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Grid Layouts */}
          {selectedCabanaId === "all" ? (
            /* Multi-cabin Occupancy Grid (Gantt Timeline) */
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-850">
              <div className="min-w-[850px] space-y-4">
                {/* Header Row: Days 1 to 31 */}
                <div className="flex items-center gap-1 border-b border-neutral-850 pb-2">
                  <div className="w-24 shrink-0 text-left text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-widest pl-2">
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
                      <div className="w-24 shrink-0 text-left flex flex-col justify-center pl-1">
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
                          const isPast = isPastDay(dayNum);
                          let cellColor = "bg-[#1b1e1b]/40 border-neutral-850/20 text-neutral-600";
                          let hoverClass = "cursor-pointer hover:scale-[1.08]";
                          let cellTitle = `${cab.nombre} - Día ${dayNum}`;

                          const isGanttCellReserved = state === "reserved" || (isCheckIn && !isDoubleTransition);

                          const assocBooking = checkInBooking || getBookingForDayAndCabin(cab.id, dayNum);
                          let bookingDetails = "";
                          if (assocBooking) {
                            const client = safeClientes.find((c) => c.id === assocBooking.clienteId);
                            const clientName = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                            bookingDetails = ` | Cliente: ${clientName} (${assocBooking.cantidadPersonas} pas.)`;
                          }

                          if (isDoubleTransition) {
                            cellColor = "occupancy-double-transition text-rose-200";
                            cellTitle += " | ALERTA: Aseo Express Requerido" + bookingDetails;
                          } else if (isGanttCellReserved) {
                            cellColor = "bg-rose-950/50 text-rose-200 border-rose-800/40 hover:bg-rose-900/40";
                            if (isCheckIn) cellTitle += " | Entrada / Check-In";
                            cellTitle += bookingDetails;
                          } else if (state === "maintenance") {
                            cellColor = "bg-amber-950/55 text-amber-200 border-amber-800/40 hover:bg-amber-900/40";
                            hoverClass = "";
                          } else {
                            cellColor = "bg-emerald-950/50 text-emerald-200 border-emerald-800/40 hover:bg-emerald-900/40";
                            if (isCheckOut) cellTitle += " | Salida / Check-Out" + bookingDetails;
                          }

                           if (isPast) {
                             if (isDoubleTransition) {
                               const checkOut = checkOutBooking;
                               const checkIn = checkInBooking;
                               let checkoutDetails = "";
                               if (checkOut) {
                                 const client = safeClientes.find((c) => c.id === checkOut.clienteId);
                                 const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                                 checkoutDetails = `Salida: ${name} (${checkOut.cantidadPersonas} pasajeros)`;
                               }
                               let checkinDetails = "";
                               if (checkIn) {
                                 const client = safeClientes.find((c) => c.id === checkIn.clienteId);
                                 const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                                 checkinDetails = `Entrada: ${name} (${checkIn.cantidadPersonas} pasajeros)`;
                               }
                               cellTitle = `${checkoutDetails} • ${checkinDetails}`;
                             } else if (assocBooking) {
                               const client = safeClientes.find((c) => c.id === assocBooking.clienteId);
                               const clientName = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                               cellTitle = `${clientName} • ${assocBooking.cantidadPersonas} pasajeros`;
                             } else {
                               cellTitle = "Disponible";
                             }
                             cellColor += " opacity-50 border-white/10";
                             hoverClass = "cursor-not-allowed hover:opacity-100 hover:scale-[1.08] transition-all duration-200";
                           }

                          const handleCellClick = () => {
                            if (isPast) return; // Block clicks on past days
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
                  const isPast = isPastDay(item.day);
                  if (item.state === "available") {
                    cellBg = "bg-emerald-950/50 border-emerald-800/40 hover:bg-emerald-900/40 text-emerald-200 cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>;
                    titleText = "Disponible (Haga clic para reservar)";
                    isClickable = true;
                  } else if (item.state === "reserved") {
                    cellBg = "bg-rose-950/50 border-rose-800/40 hover:bg-rose-900/40 text-rose-200 cursor-pointer";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full"></div>;
                    
                    const booking = item.checkInBooking || getBookingForDayAndCabin(selectedCabanaId, item.day);
                    let bookingDetails = "";
                    if (booking) {
                      const client = safeClientes.find((c) => c.id === booking.clienteId);
                      const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                      bookingDetails = ` | Cliente: ${name} (${booking.cantidadPersonas} pas.)`;
                    }
                    titleText = "Reservado / Ocupado" + bookingDetails;
                    isClickable = true;
                  } else if (item.state === "transition") {
                    isClickable = true;
                    cellBg = "occupancy-double-transition text-rose-200";
                    
                    const checkOut = (item as any).checkOutBooking;
                    const checkIn = (item as any).checkInBooking;
                    
                    let checkoutDetails = "";
                    if (checkOut) {
                      const client = safeClientes.find((c) => c.id === checkOut.clienteId);
                      const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                      checkoutDetails = `Salida: ${name} (${checkOut.cantidadPersonas} pas.)`;
                    }
                    
                    let checkinDetails = "";
                    if (checkIn) {
                      const client = safeClientes.find((c) => c.id === checkIn.clienteId);
                      const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                      checkinDetails = `Entrada: ${name} (${checkIn.cantidadPersonas} pas.)`;
                    }
                    
                    titleText = `Cambio | ${checkoutDetails ? checkoutDetails + " • " : ""}${checkinDetails || ""}`;
                    if (item.isDoubleTransition) titleText += " | ALERTA: Aseo Express Requerido";
                  } else if (item.state === "maintenance") {
                    cellBg = "bg-amber-950/55 border-amber-800/40 hover:bg-amber-900/40 text-amber-200";
                    statusDot = <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full"></div>;
                    titleText = "Mantenimiento";
                  }

                  if (isPast) {
                    cellBg += " opacity-55 border-white/10 cursor-not-allowed hover:opacity-100 transition-opacity duration-200";
                    isClickable = false;
                    
                    if (item.state === "transition") {
                      const checkOut = (item as any).checkOutBooking;
                      const checkIn = (item as any).checkInBooking;
                      let checkoutDetails = "";
                      if (checkOut) {
                        const client = safeClientes.find((c) => c.id === checkOut.clienteId);
                        const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                        checkoutDetails = `Salida: ${name} (${checkOut.cantidadPersonas} pasajeros)`;
                      }
                      let checkinDetails = "";
                      if (checkIn) {
                        const client = safeClientes.find((c) => c.id === checkIn.clienteId);
                        const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                        checkinDetails = `Entrada: ${name} (${checkIn.cantidadPersonas} pasajeros)`;
                      }
                      titleText = `${checkoutDetails} • ${checkinDetails}`;
                    } else {
                      const booking = item.checkInBooking || getBookingForDayAndCabin(selectedCabanaId, item.day);
                      if (booking) {
                        const client = safeClientes.find((c) => c.id === booking.clienteId);
                        const name = client ? `${client.nombre} ${client.apellido}` : "Invitado Anónimo";
                        titleText = `${name} • ${booking.cantidadPersonas} pasajeros`;
                      } else {
                        titleText = "Disponible";
                      }
                    }
                  }
                }

                const handleDayClick = () => {
                  if (item.currentMonth && isPastDay(item.day)) return; // Block clicks on past days
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
          <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 mt-6 pt-6 border-t border-neutral-900">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#b2ceb4]"></div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">Ocupado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#f9ba82]"></div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">Mantenimiento</span>
            </div>
          </div>
        </div>

        {/* Right: 4 cols - Próximas Llegadas list */}
        <div className="lg:col-span-4 bg-[#1b1e1b] rounded-xl p-6 border-t-2 border-[#f6bb89]/70 shadow-xl flex flex-col border-x border-b border-neutral-900/30 min-h-[480px]">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-neutral-900">
            <ArrowLeftRight className="w-4 h-4 text-[#f6bb89]" />
            <h3 className="text-sm font-sans font-bold text-neutral-100">
              {selectedCabanaId === "all" ? "Reservas Activas" : "Próximas Llegadas"}
            </h3>
          </div>

          <div className="flex-grow overflow-y-auto max-h-[420px] space-y-3 pr-1">
            {upcomingArrivals.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-sm font-sans">
                Sin registros de reservas para este periodo.
              </div>
            ) : (
              upcomingArrivals.map((arr) => (
                <div
                  key={arr.id}
                  onClick={() => {
                    if (selectedReservaId === arr.id) {
                      setSelectedReservaId(null);
                      setIsPaymentFormOpen(false);
                    } else {
                      setSelectedReservaId(arr.id);
                      setAmountToPay(arr.balance.toString());
                      setPaymentMethod("Transferencia");
                      setIsPaymentFormOpen(false);
                    }
                  }}
                  className={`bg-[#121412] p-4 rounded-xl border transition-all cursor-pointer group space-y-3 ${
                    selectedReservaId === arr.id
                      ? "border-neutral-700"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {/* Guest Name & Cabin Badge */}
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="text-sm font-sans font-extrabold text-neutral-100 group-hover:text-[#b2ceb4] transition-colors truncate">
                      {arr.guestName}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-sans font-black bg-[#b2ceb4]/10 text-[#b2ceb4] border border-[#b2ceb4]/20 uppercase tracking-wider shrink-0">
                      {arr.cabinName}
                    </span>
                  </div>

                  {/* Dates & Duration Details */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-neutral-400 bg-[#1b1e1b]/50 p-2 rounded-lg border border-neutral-900/40">
                    <div className="flex items-center gap-1 text-[#f6bb89] font-bold">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      <span>{arr.dateText}</span>
                    </div>
                    <div className="text-neutral-600 hidden xs:inline">•</div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{arr.passengers} Pasajeros</span>
                    </div>
                    <div className="text-neutral-600 hidden xs:inline">•</div>
                    <div className="flex items-center gap-1 font-semibold">
                      <Moon className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{arr.nights} Noches</span>
                    </div>
                  </div>

                  {/* Contracted services inline list */}
                  {arr.services && arr.services.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-wider block">Servicios contratados:</span>
                      <div className="flex flex-wrap gap-1">
                        {arr.services.map((srv: any) => (
                          <span key={srv.id} className="bg-[#4a634e]/10 text-[#b2ceb4] border border-[#4a634e]/30 px-2 py-0.5 rounded-full text-[9px] font-semibold">
                            {srv.nombre} (x{srv.cantidad})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial Breakdown / Balance */}
                  <div className="pt-2 border-t border-neutral-900/60 space-y-1.5 text-[10px] sm:text-[11px]">
                    <div className="flex justify-between items-center text-neutral-400">
                      <span className="font-medium">Total Reserva (Estadía + Serv.):</span>
                      <span className="font-sans font-bold text-neutral-100">{formatCurrency(arr.price + arr.servicesTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-400">
                      <span className="font-medium">Monto Abonado (Anticipo):</span>
                      <span className="font-sans font-bold text-neutral-300">{formatCurrency(arr.deposit)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#171a17]/40 p-2 rounded-lg border border-neutral-900/50 mt-1">
                      <span className="font-bold text-[#f6bb89] uppercase text-[9px] tracking-wider">Saldo por pagar:</span>
                      <span className="text-xs sm:text-sm font-headline font-black text-[#f6bb89]">{formatCurrency(arr.balance)}</span>
                    </div>
                  </div>

                  {/* Action Buttons Row: PAGAR and ANTICIPAR CHECK-OUT (Always visible) */}
                  <div className="grid grid-cols-2 gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedReservaId === arr.id && isPaymentFormOpen) {
                          setSelectedReservaId(null);
                          setIsPaymentFormOpen(false);
                        } else {
                          setSelectedReservaId(arr.id);
                          setAmountToPay(arr.balance.toString());
                          setPaymentMethod("Transferencia");
                          setIsPaymentFormOpen(true);
                        }
                      }}
                      className={`py-1.5 rounded-lg text-[9px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md border ${
                        selectedReservaId === arr.id && isPaymentFormOpen
                          ? "bg-[#4a634e] text-white border-[#b2ceb4]/20"
                          : "bg-[#121412] hover:bg-neutral-900 text-neutral-300 border-neutral-800"
                      } h-8`}
                    >
                      <span className="material-symbols-outlined text-[11px]">payments</span>
                      Pagar Saldo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnticipateCheckOut(arr.id)}
                      className="py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-[9px] font-sans uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md border border-amber-500/20 h-8"
                    >
                      <span className="material-symbols-outlined text-[11px]">logout</span>
                      Anticipar Check-Out
                    </button>
                  </div>

                  {/* Interactive Payment Box when selected & payment form toggled open */}
                  {selectedReservaId === arr.id && isPaymentFormOpen && (
                    <div 
                      onClick={(e) => e.stopPropagation()} 
                      className="mt-3 p-3 bg-gradient-to-br from-[#233525] to-[#131d14] border border-[#3e5642]/60 border-l-4 border-l-[#f6bb89] rounded-xl space-y-3 shadow-xl shadow-black/40 cursor-default text-[10px]"
                    >
                      <div className="flex items-center gap-1.5 pb-1.5 border-b border-neutral-800/60">
                        <span className="material-symbols-outlined text-[#f6bb89] text-base">payments</span>
                        <span className="text-[10px] font-sans font-black uppercase tracking-wider text-neutral-100">
                          Registrar Pago de Saldo
                        </span>
                      </div>

                      {arr.balance <= 0 ? (
                        <div className="text-center py-2 text-emerald-400 font-sans text-[10px] font-bold flex items-center justify-center gap-1.5 bg-emerald-950/20 rounded-lg border border-emerald-900/30">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          <span>COMPLETAMENTE PAGADA</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {/* Payment Amount Input */}
                          <div className="space-y-0.5">
                            <label className="block text-[7px] font-sans font-bold text-neutral-400 uppercase tracking-widest">
                              Monto a Pagar ($)
                            </label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-neutral-500 text-[9px]">$</span>
                              <input
                                type="number"
                                required
                                value={amountToPay}
                                onChange={(e) => setAmountToPay(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-5 pr-2 py-0.5 bg-[#121412] text-neutral-200 border-0 focus:ring-0 rounded-md text-[11px] font-bold outline-none h-7"
                              />
                            </div>
                          </div>

                          {/* Payment Method Select */}
                          <div className="space-y-0.5">
                            <label className="block text-[7px] font-sans font-bold text-neutral-400 uppercase tracking-widest">
                              Método de Pago
                            </label>
                            <div className="relative">
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as any)}
                                className="w-full bg-[#121412] text-neutral-200 border-0 focus:ring-0 rounded-md px-2 py-1 text-[11px] font-semibold outline-none appearance-none cursor-pointer h-7"
                              >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta">Tarjeta</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none text-[10px]">
                                expand_more
                              </span>
                            </div>
                          </div>

                          {/* Confirm / Cancel Buttons */}
                          <div className="flex gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(arr.id, arr.balance)}
                              className="flex-1 py-1 bg-[#4a634e] hover:bg-[#455c49] text-white font-bold rounded-md text-[8px] font-sans uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-0.5 shadow-md border border-[#b2ceb4]/10 h-7.5"
                            >
                              <span className="material-symbols-outlined text-[9px]">done</span>
                              Confirmar Pago
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedReservaId(null)}
                              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 font-bold rounded-md text-[8px] font-sans uppercase tracking-wider transition-all cursor-pointer border border-neutral-850 h-7.5"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
