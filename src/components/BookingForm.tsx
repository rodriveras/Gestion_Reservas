/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Sparkles, DollarSign, Calendar, Landmark, Users, Trash2 } from "lucide-react";
import { Cabana, Cliente, Reserva } from "../types";

interface BookingFormProps {
  cabanas: Cabana[];
  clientes: Cliente[];
  reservas: Reserva[];
  onSave: (booking: Reserva) => void;
  onDelete?: (bookingId: string) => void;
  onBack: () => void;
  onCreateClient?: (cabanaId: string, checkIn: string) => void;
  initialCabanaId?: string;
  initialCheckIn?: string;
  viewBookingId?: string;
}

export default function BookingForm({
  cabanas,
  clientes,
  reservas = [],
  onSave,
  onDelete,
  onBack,
  onCreateClient,
  initialCabanaId = "",
  initialCheckIn = "",
  viewBookingId = ""
}: BookingFormProps) {
  const existingBooking = viewBookingId ? (reservas || []).find((r) => r.id === viewBookingId) : null;
  const [isEditMode, setIsEditMode] = useState(true);
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

  const [initialCabanaIdState] = useState(() => existingBooking?.cabanaId || initialCabanaId);
  const [initialNochesState] = useState(() => existingBooking?.noches || 0);

  const [clienteId, setClienteId] = useState(() => existingBooking?.clienteId || "");
  const [cabanaId, setCabanaId] = useState(() => existingBooking?.cabanaId || initialCabanaId);
  const [pasajeros, setPasajeros] = useState(() => existingBooking?.cantidadPersonas || 2);
  const [entrada, setEntrada] = useState(() => {
    if (existingBooking) return existingBooking.checkIn;
    if (initialCheckIn) return initialCheckIn;
    return new Date().toISOString().split("T")[0];
  });
  
  // Calculate default check-out date as 1 day after check-in date
  const [salida, setSalida] = useState(() => {
    if (existingBooking) return existingBooking.checkOut;
    const baseDate = initialCheckIn ? new Date(initialCheckIn + "T12:00:00") : new Date();
    if (!isNaN(baseDate.getTime())) {
      const tomorrow = new Date(baseDate);
      tomorrow.setDate(tomorrow.getDate() + 1); // 1 night default
      return tomorrow.toISOString().split("T")[0];
    }
    return "";
  });
  
  const [canalVentas, setCanalVentas] = useState<Reserva["canalVentas"]>(() => existingBooking?.canalVentas || "Directo");
  const [montoTotal, setMontoTotal] = useState(() => existingBooking?.montoTotal ? existingBooking.montoTotal.toString() : "");
  const [montoAnticipo, setMontoAnticipo] = useState(() => existingBooking?.montoAnticipo ? existingBooking.montoAnticipo.toString() : "0");
  const [estadoReserva, setEstadoReserva] = useState<Reserva["estadoReserva"]>(() => existingBooking?.estadoReserva || "Pendiente de Pago");
  const [metodoPago, setMetodoPago] = useState<Reserva["metodoPago"]>(() => existingBooking?.metodoPago || "Transferencia");

  const [bookingId] = useState(() => existingBooking?.id || `LF-2026-${Math.floor(10000 + Math.random() * 90000)}`);

  // Fecha de Reserva state
  const [fechaReserva, setFechaReserva] = useState(() => existingBooking?.fechaReserva || new Date().toISOString().split("T")[0]);
  const [isBookingDateCalendarExpanded, setIsBookingDateCalendarExpanded] = useState(false);
  const [bookingDateCalendarViewDate, setBookingDateCalendarViewDate] = useState(() => {
    const d = new Date(fechaReserva || new Date().toISOString().split("T")[0]);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  // Client validation state
  const selectedClientObj = clientes.find((c) => c.id === clienteId);
  const isClientBlockedOrSuspended = selectedClientObj && selectedClientObj.estado !== "activo";

  // Cabin validation state
  const selectedCabinObj = cabanas.find((c) => c.id === cabanaId);
  const isCabinInMaintenance = selectedCabinObj?.estado === "Mantenimiento";
  const hasStayOverlapConflict = (reservas || []).some((r) => {
    if (r.id === bookingId) return false;
    if (r.cabanaId !== cabanaId) return false;
    if (r.estadoReserva === "Cancelada") return false;
    return !!(entrada && salida && r.checkIn && r.checkOut && (entrada < r.checkOut && salida > r.checkIn));
  });
  const isCabinNotAvailable = !!(isCabinInMaintenance || hasStayOverlapConflict);

  // Date validations
  const todayStr = new Date().toISOString().split("T")[0];
  const isPastCheckIn = !existingBooking && entrada && entrada < todayStr;
  const isInvalidCheckout = entrada && salida && salida <= entrada;
  const hasDateError = isPastCheckIn || isInvalidCheckout;

  // Passenger capacity validation
  const exceedsCapacity = selectedCabinObj && pasajeros > selectedCabinObj.capacidad;

  // Deposit validation
  const hasDepositError = !!(Number(montoTotal) > 0 && Number(montoAnticipo) >= Number(montoTotal) && estadoReserva !== "Pagada");

  // Negative or zero amount validation
  const hasAmountValidationError = Number(montoTotal) <= 0 || Number(montoAnticipo) < 0;

  // Form disable logic
  const isFormDisabled = isClientBlockedOrSuspended || isCabinNotAvailable || hasDateError || exceedsCapacity || hasDepositError || hasAmountValidationError;

  // Automatically adjust booking date calendar view month if fechaReserva changes
  useEffect(() => {
    if (fechaReserva) {
      const d = new Date(fechaReserva);
      if (!isNaN(d.getTime())) {
        setBookingDateCalendarViewDate(d);
      }
    }
  }, [fechaReserva]);

  // Mini stay calendar state
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const d = new Date(entrada || "2026-05-20");
    return isNaN(d.getTime()) ? new Date("2026-05-20") : d;
  });

  // Automatically adjust calendar view month if checkout or checkin changes
  useEffect(() => {
    if (entrada) {
      const d = new Date(entrada);
      if (!isNaN(d.getTime())) {
        setCalendarViewDate(d);
      }
    }
  }, [entrada]);

  const toggleBookingDateCalendar = () => {
    if (!isEditMode || !!viewBookingId) return;
    setIsBookingDateCalendarExpanded(!isBookingDateCalendarExpanded);
    setIsCalendarExpanded(false);
  };

  const toggleStayCalendar = () => {
    if (!isEditMode || !!viewBookingId) return;
    setIsCalendarExpanded(!isCalendarExpanded);
    setIsBookingDateCalendarExpanded(false);
  };

  const formatToYYMMDD = (dateStr: string) => {
    if (!dateStr) return "Seleccionar...";
    const dateOnly = dateStr.split("T")[0];
    const parts = dateOnly.split("-");
    if (parts.length === 3) {
      const year2 = parts[0].slice(-2); // Last 2 digits of the year (e.g., "2026" -> "26")
      const month = parts[1];
      const day = parts[2];
      return `${year2}/${month}/${day}`;
    }
    return dateStr;
  };

  // Quantity of days (stay duration) state
  const [noches, setNoches] = useState(() => {
    if (existingBooking) return existingBooking.noches;
    const checkInDate = new Date(entrada + "T12:00:00");
    const checkOutDate = new Date(salida + "T12:00:00");
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) || 1;
  });

  // Automatically update checkout (salida) when entrada or noches change
  useEffect(() => {
    if (entrada && noches > 0) {
      const d = new Date(entrada + "T12:00:00");
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + noches);
        setSalida(d.toISOString().split("T")[0]);
      }
    }
  }, [entrada, noches]);

  // Auto calculate total amount based on cabin selection and nights
  useEffect(() => {
    // If it's an existing booking and we haven't changed the cabin or stay duration, preserve original prices
    if (existingBooking && cabanaId === initialCabanaIdState && noches === initialNochesState) {
      return;
    }

    if (cabanaId && isEditMode) {
      const cabana = cabanas.find((c) => c.id === cabanaId);
      if (cabana) {
        const calculatedTotal = cabana.precioBase * noches;
        setMontoTotal(calculatedTotal.toString());
        // set default deposit to 30% of total only for existing booking changes, otherwise default to "0" for new bookings
        if (!existingBooking) {
          setMontoAnticipo("0");
        } else {
          setMontoAnticipo(Math.round(calculatedTotal * 0.3).toString());
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cabanaId, noches, cabanas]);

  const renderMiniCalendar = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    
    // Month name in Spanish
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthLabel = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysList = [];
    // Prev month tail
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      daysList.push({
        day: prevMonthDaysCount - i,
        isCurrent: false,
        dateString: ""
      });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      daysList.push({
        day: i,
        isCurrent: true,
        dateString
      });
    }
    // Next month tail to pad to 42 cells
    const nextOffset = 42 - daysList.length;
    for (let i = 1; i <= nextOffset; i++) {
      daysList.push({
        day: i,
        isCurrent: false,
        dateString: ""
      });
    }

    const handleDayClick = (dateStr: string) => {
      if (!isEditMode || !dateStr) return;
      
      const clicked = new Date(dateStr + "T12:00:00");
      const currentIn = entrada ? new Date(entrada + "T12:00:00") : null;

      // If we don't have check-in, or if we have both set, or if clicked date is before check-in:
      if (!entrada || (entrada && salida) || (currentIn && clicked < currentIn)) {
        setEntrada(dateStr);
        setSalida(""); // Clear check-out to wait for next selection click
      } else if (entrada && !salida && currentIn) {
        // If clicked date is after check-in, set it as check-out
        if (clicked > currentIn) {
          setSalida(dateStr);
          const diff = Math.round(Math.abs(clicked.getTime() - currentIn.getTime()) / (1000 * 60 * 60 * 24)) || 1;
          setNoches(diff);
          setIsCalendarExpanded(false); // Close calendar popover on stay selection completion
        }
      }
    };

    const isDateInRange = (dateStr: string) => {
      if (!dateStr || !entrada || !salida) return false;
      const d = new Date(dateStr + "T12:00:00");
      const start = new Date(entrada + "T12:00:00");
      const end = new Date(salida + "T12:00:00");
      return d > start && d < end;
    };

    return (
      <div className="space-y-3 font-sans select-none p-3.5">
        {/* Calendar Mini Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCalendarViewDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCalendarViewDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center border-b border-neutral-850 pb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, idx) => (
            <span key={idx} className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
              {d}
            </span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysList.map((item, idx) => {
            const isSelectedIn = entrada === item.dateString;
            const isSelectedOut = salida === item.dateString;
            const inRange = isDateInRange(item.dateString);
            
            let cellStyle = "text-neutral-700 cursor-default";
            if (item.isCurrent) {
              cellStyle = "text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer";
              if (isSelectedIn) {
                cellStyle = "bg-[#4a634e] text-white font-bold rounded-lg scale-105 shadow-md shadow-emerald-950/30 cursor-pointer";
              } else if (isSelectedOut) {
                cellStyle = "bg-[#4a634e] text-white font-bold rounded-lg scale-105 shadow-md shadow-emerald-950/30 cursor-pointer";
              } else if (inRange) {
                cellStyle = "bg-[#4a634e]/20 text-[#b2ceb4] font-semibold rounded-md cursor-pointer";
              }
            }

            return (
              <div
                key={idx}
                onClick={() => item.dateString && handleDayClick(item.dateString)}
                className={`h-7 flex items-center justify-center text-xs rounded transition-all ${cellStyle}`}
              >
                {item.day}
              </div>
            );
          })}
        </div>
        
        {/* Help label */}
        {isEditMode && (
          <div className="text-[10px] text-neutral-500 font-medium text-center italic mt-1">
            {!entrada ? "Paso 1: Selecciona la fecha de entrada" : !salida ? "Paso 2: Selecciona la fecha de salida" : "Estadía seleccionada. Vuelve a hacer clic para reiniciar."}
          </div>
        )}
      </div>
    );
  };

  const renderBookingDateCalendar = () => {
    const year = bookingDateCalendarViewDate.getFullYear();
    const month = bookingDateCalendarViewDate.getMonth();
    
    // Month name in Spanish
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const monthLabel = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    const offset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const daysList = [];
    // Prev month tail
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = offset - 1; i >= 0; i--) {
      daysList.push({
        day: prevMonthDaysCount - i,
        isCurrent: false,
        dateString: ""
      });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${i.toString().padStart(2, "0")}`;
      daysList.push({
        day: i,
        isCurrent: true,
        dateString
      });
    }
    // Next month tail to pad to 42 cells
    const nextOffset = 42 - daysList.length;
    for (let i = 1; i <= nextOffset; i++) {
      daysList.push({
        day: i,
        isCurrent: false,
        dateString: ""
      });
    }

    const handleDayClick = (dateStr: string) => {
      if (!isEditMode || !dateStr) return;
      setFechaReserva(dateStr);
      setIsBookingDateCalendarExpanded(false); // Close calendar popover immediately on selection
    };

    return (
      <div className="space-y-3 font-sans select-none p-3.5">
        {/* Calendar Mini Header */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wide">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBookingDateCalendarViewDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setBookingDateCalendarViewDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center border-b border-neutral-850 pb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, idx) => (
            <span key={idx} className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">
              {d}
            </span>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysList.map((item, idx) => {
            const isSelected = fechaReserva === item.dateString;
            
            let cellStyle = "text-neutral-700 cursor-default";
            if (item.isCurrent) {
              cellStyle = "text-neutral-300 hover:bg-neutral-800 hover:text-white cursor-pointer";
              if (isSelected) {
                cellStyle = "bg-[#4a634e] text-white font-bold rounded-lg scale-105 shadow-md shadow-emerald-950/30 cursor-pointer";
              }
            }

            return (
              <div
                key={idx}
                onClick={() => item.dateString && handleDayClick(item.dateString)}
                className={`h-7 flex items-center justify-center text-xs rounded transition-all ${cellStyle}`}
              >
                {item.day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!clienteId || !cabanaId) return;

    if (isClientBlockedOrSuspended) {
      alert("Error: El cliente seleccionado se encuentra bloqueado o suspendido. No se puede realizar la reserva.");
      return;
    }

    if (isCabinNotAvailable) {
      if (hasStayOverlapConflict) {
        alert("Error: La cabaña seleccionada ya se encuentra reservada para las fechas indicadas.");
      } else if (isCabinInMaintenance) {
        alert("Error: La cabaña seleccionada se encuentra en mantenimiento. No se pueden realizar reservas.");
      } else {
        alert("Error: La cabaña seleccionada no está disponible.");
      }
      return;
    }

    if (hasDateError) {
      alert("Error: Error en la fecha ingresada. Verifique que la fecha de entrada sea hoy o en el futuro, y que la fecha de salida sea posterior a la de entrada.");
      return;
    }

    if (exceedsCapacity) {
      alert(`Error: La cantidad de pasajeros ingresada (${pasajeros}) excede la capacidad máxima de la cabaña "${selectedCabinObj?.nombre}" (${selectedCabinObj?.capacidad} personas).`);
      return;
    }

    if (hasDepositError) {
      alert("Error: El monto del abono debe ser menor que el monto total de la reserva.");
      return;
    }

    if (hasAmountValidationError) {
      alert("Error: El monto total debe ser mayor que 0 y el abono no puede ser negativo.");
      return;
    }

    const newBooking: Reserva = {
      id: bookingId,
      clienteId,
      cabanaId,
      fechaReserva,
      checkIn: entrada,
      checkOut: salida,
      noches,
      cantidadPersonas: pasajeros,
      canalVentas,
      montoTotal: Number(montoTotal) || 0,
      montoAnticipo: Number(montoAnticipo) || 0,
      estadoReserva,
      metodoPago,
    };

    alert(existingBooking ? "¡Reserva actualizada satisfactoriamente!" : "¡Reserva registrada satisfactoriamente!");
    onSave(newBooking);
    onBack();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-neutral-900">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-sm font-sans font-bold text-neutral-100">
            {existingBooking ? "Consulta de reserva" : "Nueva Reserva"}
          </h2>
        </div>

        <div className="bg-[#1b1e1b] px-4 py-2.5 rounded-xl border border-neutral-800 flex items-center gap-3">
          <span className="text-neutral-400 font-sans text-xs font-bold uppercase tracking-wider">
            ID RES:
          </span>
          <span className="text-[#f6bb89] font-sans font-bold text-sm tracking-widest">{bookingId}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section: Customer & Unit selection */}
          <div className={`${viewBookingId ? "lg:col-span-12" : "lg:col-span-7"} bg-[#242924] rounded-xl p-6 border border-neutral-800/80 shadow-xl space-y-6`}>
            <h3 className="text-sm font-sans font-bold text-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f6bb89] text-lg">contact_page</span>
                <span>Ficha de Contacto</span>
                {selectedClientObj && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-extrabold bg-[#b2ceb4]/10 text-[#b2ceb4] border border-[#b2ceb4]/25 uppercase tracking-wider ml-1">
                    {selectedClientObj.estado}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5">
                {isClientBlockedOrSuspended && (
                  <span className="text-[10px] font-sans font-bold bg-red-950/45 text-red-400 border border-red-900/40 px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-950/20 block text-right">
                    ⚠️ Cliente suspendido o bloqueado, no puede realizar reservas
                  </span>
                )}
                {isCabinNotAvailable && (
                  <span className={`text-[10px] font-sans font-bold border px-3 py-1 rounded-full animate-pulse shadow-md block text-right ${
                    hasStayOverlapConflict
                      ? "bg-red-950/45 text-red-400 border-red-900/40 shadow-red-950/20"
                      : "bg-amber-950/45 text-amber-400 border-amber-900/40 shadow-amber-950/20"
                  }`}>
                    ⚠️ {hasStayOverlapConflict ? "Cabaña ya reservada" : "Cabaña en mantención"}
                  </span>
                )}
                {hasDateError && (
                  <span className="text-[10px] font-sans font-bold bg-red-950/45 text-red-400 border border-red-900/40 px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-950/20 block text-right">
                    ⚠️ Error en la fecha ingresada
                  </span>
                )}
                {exceedsCapacity && (
                  <span className="text-[10px] font-sans font-bold bg-red-950/45 text-red-400 border border-red-900/40 px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-950/20 block text-right">
                    ⚠️ Capacidad excedida
                  </span>
                )}
                {hasDepositError && (
                  <span className="text-[10px] font-sans font-bold bg-red-950/45 text-red-400 border border-red-900/40 px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-950/20 block text-right">
                    ⚠️ El abono debe ser menor que el monto total
                  </span>
                )}
                {hasAmountValidationError && (
                  <span className="text-[10px] font-sans font-bold bg-red-950/45 text-red-400 border border-red-900/40 px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-950/20 block text-right">
                    ⚠️ El monto total debe ser mayor que 0 y el abono no negativo
                  </span>
                )}
              </div>
            </h3>

            <div className="space-y-5">
              {/* Select guest */}
              {!viewBookingId && (
                <div className="space-y-1">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <select
                        required
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        disabled={!isEditMode || !!viewBookingId}
                        className="w-full pl-10 pr-10 bg-[#0b0c0b] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">Buscar un cliente existente...</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} {c.apellido} — {c.numeroDocumento} {c.id === "CLI-2026-AUTO" ? "(AUTO)" : ""}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                        person
                      </span>
                      {isEditMode && !viewBookingId && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                          expand_more
                        </span>
                      )}
                    </div>
                    {isEditMode && onCreateClient && (
                      <button
                        type="button"
                        disabled={!!viewBookingId}
                        onClick={!viewBookingId ? () => onCreateClient(cabanaId, entrada) : undefined}
                        className="bg-[#4a634e] text-white px-2.5 md:px-4 rounded-lg font-sans font-bold text-[10px] md:text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 md:gap-1.5 shrink-0 shadow-md border border-[#b2ceb4]/20 h-10 md:h-11 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:scale-100 cursor-pointer"
                        title={viewBookingId ? "No se puede registrar un nuevo cliente desde la consulta de reserva" : "Registrar nuevo cliente"}
                      >
                        <span className="material-symbols-outlined text-sm md:text-base">person_add</span>
                        <span className="hidden sm:inline">Nuevo Cliente</span>
                        <span className="inline sm:hidden">Nuevo</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Info del Cliente Seleccionado (Ficha de Contacto de Alto Contraste) */}
              {selectedClientObj && (
                <div className="bg-[#0b0c0b]/90 border border-neutral-800 rounded-xl p-5 space-y-4 mt-2 animate-in fade-in slide-in-from-top-1 duration-150 shadow-inner">

                  {/* Section 1: Datos del Huésped */}
                  <div className="space-y-3">
                    <h5 className="text-[9px] font-sans font-extrabold text-[#b2ceb4]/60 uppercase tracking-widest">
                      Datos del Huésped
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                          Nombre Completo
                        </span>
                        <span className="text-neutral-100 font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px] text-[#b2ceb4] leading-none">badge</span>
                          {selectedClientObj.nombre} {selectedClientObj.apellido}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                          Documento / RUT
                        </span>
                        <span className="text-neutral-200 font-semibold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px] text-neutral-500 leading-none">assignment_ind</span>
                          {selectedClientObj.numeroDocumento} ({selectedClientObj.tipoDocumento})
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                          Teléfono / Fono
                        </span>
                        <span className="text-neutral-100 font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px] text-[#f6bb89] leading-none">phone</span>
                          {selectedClientObj.telefono}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                          Correo Electrónico
                        </span>
                        <span className="text-neutral-200 font-semibold flex items-center gap-1.5 truncate">
                          <span className="material-symbols-outlined text-[13px] text-neutral-500 leading-none">mail</span>
                          <span className="truncate">{selectedClientObj.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Datos de la Reserva (Only in viewBookingId mode) */}
                  {viewBookingId && (
                    <div className="space-y-3 pt-3.5 border-t border-neutral-850">
                      <h5 className="text-[9px] font-sans font-extrabold text-[#b2ceb4]/60 uppercase tracking-widest">
                        Asignación y Reserva
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-xs font-sans">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                            Cabaña / Unidad
                          </span>
                          <span className="text-neutral-100 font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[13px] text-[#b2ceb4] leading-none">cottage</span>
                            {selectedCabinObj?.nombre || "No especificada"}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                            Fecha de Reserva
                          </span>
                          <span className="text-neutral-100 font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[13px] text-[#b2ceb4] leading-none">calendar_month</span>
                            {formatToYYMMDD(fechaReserva)}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                            Entrada
                          </span>
                          <span className="text-neutral-100 font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[13px] text-[#b2ceb4] leading-none">login</span>
                            {formatToYYMMDD(entrada)}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase block tracking-wider">
                            Salida
                          </span>
                          <span className="text-neutral-100 font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[13px] text-[#b2ceb4] leading-none">logout</span>
                            {formatToYYMMDD(salida)}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-sans font-bold text-[#b2ceb4] uppercase block tracking-wider">
                            Duración Estadía
                          </span>
                          <span className="text-[#f6bb89] font-bold flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[13px] text-[#f6bb89] leading-none">schedule</span>
                            {noches} {noches === 1 ? "Noche" : "Noches"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cabin & Booking date row */}
              {!viewBookingId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1 md:col-span-2">
                    <div className="relative">
                      <select
                        required
                        value={cabanaId}
                        onChange={(e) => setCabanaId(e.target.value)}
                        disabled={!isEditMode || !!viewBookingId}
                        className="w-full pl-10 pr-10 bg-[#0b0c0b] text-neutral-300 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed h-11"
                      >
                        <option value="">Elegir una propiedad...</option>
                        {cabanas.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre} (Capacidad: {c.capacidad} Pers.) — ${c.precioBase.toLocaleString("es-CL")}/Noche
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                        cottage
                      </span>
                      {isEditMode && !viewBookingId && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                          expand_more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 relative">
                    <div
                      onClick={!viewBookingId ? toggleBookingDateCalendar : undefined}
                      className={`p-3 bg-[#0b0c0b] border-l-4 border-[#b2ceb4] rounded-r-lg relative select-none hover:border-neutral-600 transition-all h-11 flex items-center justify-between ${
                        viewBookingId ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                      }`}
                      title={viewBookingId ? "No se puede modificar la fecha de reserva" : "Haga clic para seleccionar la fecha de reserva"}
                    >
                      <span className="text-xs font-sans font-bold text-neutral-100">
                        {formatToYYMMDD(fechaReserva)}
                      </span>
                      <Calendar className="w-3.5 h-3.5 text-white" />
                    </div>

                    {/* Collapsible Calendar Grid Popover for Booking Date (Discreet absolute overlay) */}
                    {isBookingDateCalendarExpanded && (
                      <div className="absolute z-50 left-0 right-0 md:left-auto md:right-0 md:w-[320px] top-[64px] bg-[#0b0c0b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150">
                        {renderBookingDateCalendar()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stay duration & Head count passengers counter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {!viewBookingId ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <select
                        value={noches}
                        onChange={(e) => setNoches(Number(e.target.value))}
                        disabled={!isEditMode || !!viewBookingId}
                        className="w-full pl-10 pr-10 bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed h-11"
                      >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "Día" : "Días"}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                        date_range
                      </span>
                      {isEditMode && !viewBookingId && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                          expand_more
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Canal de Ventas dropdown in viewBookingId mode */
                  <div className="space-y-1">
                    <div className="relative">
                      <select
                        value={canalVentas}
                        onChange={(e) => setCanalVentas(e.target.value as any)}
                        disabled={!isEditMode}
                        className="w-full pl-10 pr-10 bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed h-11"
                      >
                        <option value="Directo">Directo</option>
                        <option value="Airbnb">Airbnb</option>
                        <option value="Booking">Booking</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Otros">Otros</option>
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                        campaign
                      </span>
                      {isEditMode && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                          expand_more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="relative">
                    <select
                      value={pasajeros}
                      onChange={(e) => setPasajeros(Number(e.target.value))}
                      disabled={!isEditMode}
                      className="w-full pl-10 pr-10 bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed h-11"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                        <option key={p} value={p}>
                          {p} {p === 1 ? "Persona" : "Personas"}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">
                      group
                    </span>
                    {isEditMode && (
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                        expand_more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Stay Details */}
          {!viewBookingId && (
            <div className="lg:col-span-5 bg-[#242924] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
              <h3 className="text-sm font-sans font-bold text-neutral-100 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#f6bb89]" />
                Detalles de la Estadía
              </h3>

              <div className="space-y-4">
                <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Clickable ENTRADA trigger box */}
                    <div
                      onClick={!viewBookingId ? toggleStayCalendar : undefined}
                      className={`p-3 bg-[#0b0c0b] border-l-4 border-[#f6bb89] rounded-r-lg relative select-none hover:border-neutral-600 transition-all ${
                        viewBookingId ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                      }`}
                      title={viewBookingId ? "No se puede modificar la fecha de entrada" : "Haga clic para seleccionar fechas en el calendario"}
                    >
                      <span className="block text-[10px] font-sans font-bold text-[#f6bb89] uppercase mb-1">
                        ENTRADA
                      </span>
                      <span className="text-sm font-bold text-neutral-100 block pr-6">
                        {formatToYYMMDD(entrada)}
                      </span>
                      <Calendar className="w-3.5 h-3.5 text-white absolute right-3 bottom-3" />
                    </div>

                    {/* Clickable SALIDA trigger box */}
                    <div
                      onClick={!viewBookingId ? toggleStayCalendar : undefined}
                      className={`p-3 bg-[#0b0c0b] border-l-4 border-[#f6bb89]/40 rounded-r-lg relative select-none hover:border-neutral-600 transition-all ${
                        viewBookingId ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                      }`}
                      title={viewBookingId ? "No se puede modificar la fecha de salida" : "Haga clic para seleccionar fechas en el calendario"}
                    >
                      <span className="block text-[10px] font-sans font-bold text-[#f6bb89]/70 uppercase mb-1">
                        SALIDA
                      </span>
                      <span className="text-sm font-bold text-neutral-100 block pr-6">
                        {formatToYYMMDD(salida)}
                      </span>
                      <Calendar className="w-3.5 h-3.5 text-white absolute right-3 bottom-3" />
                    </div>
                  </div>

                  {/* Collapsible Calendar Grid Popover (Discreet absolute overlay) */}
                  {isCalendarExpanded && (
                    <div className="absolute z-50 left-0 right-0 md:left-auto md:right-0 md:w-[320px] top-[74px] bg-[#0b0c0b] border border-neutral-800 rounded-xl shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150">
                      {renderMiniCalendar()}
                    </div>
                  )}
                </div>

                {/* Hidden HTML input fields for accessibility/compatibility */}
                <input type="hidden" name="checkIn" value={entrada} />
                <input type="hidden" name="checkOut" value={salida} />

                {/* Nights indicator pill block */}
                <div className="flex items-center justify-center py-2.5 px-4 bg-[#0b0c0b] border border-neutral-800 rounded-full">
                  <span className="text-xs text-neutral-400 font-sans font-medium">
                    Duración total:{" "}
                  </span>
                  <span className="ml-2 font-bold font-sans text-xs text-[#b2ceb4]">
                    {noches} Días y {noches} Noches
                  </span>
                </div>

                {/* Sales Channel */}
                <div className="space-y-1 pt-2">
                  <div className="relative">
                    <select
                      value={canalVentas}
                      onChange={(e) => setCanalVentas(e.target.value as any)}
                      disabled={!isEditMode}
                      className="w-full bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="Directo">Directo</option>
                      <option value="Airbnb">Airbnb</option>
                      <option value="Booking">Booking</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Otros">Otros</option>
                    </select>
                    {isEditMode && (
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                        expand_more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section financial details */}
        <div className="bg-[#242924] rounded-xl p-6 border border-neutral-800 shadow-xl space-y-6">
          <h4 className="text-sm font-sans font-bold text-neutral-100 flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-[#b2ceb4]" />
            Información Financiera
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monto Total */}
            <div className="space-y-1">
              <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                MONTO TOTAL ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#b2ceb4] text-sm">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0.00"
                  value={montoTotal}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) {
                      setMontoTotal(val);
                    }
                  }}
                  disabled={!isEditMode}
                  className="w-full pl-7 pr-4 bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-sm font-sans font-bold outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Monto Anticipo */}
            <div className="space-y-1">
              <label className="block text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-widest mb-1">
                ABONO ($)
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${hasDepositError ? "text-red-400" : "text-neutral-500"}`}>$</span>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="0.00"
                  value={montoAnticipo}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || Number(val) >= 0) {
                      setMontoAnticipo(val);
                    }
                  }}
                  disabled={!isEditMode}
                  className={`w-full pl-7 pr-4 bg-[#0b0c0b] text-neutral-100 border rounded-lg p-3 text-sm font-sans font-bold outline-none disabled:opacity-75 disabled:cursor-not-allowed transition-colors ${
                    hasDepositError ? "border-red-500 focus:border-red-500 text-red-200" : "border-neutral-700 focus:border-[#b2ceb4]"
                  }`}
                />
              </div>
              {hasDepositError && (
                <p className="text-[10px] text-red-400 font-sans font-bold mt-1">
                  ⚠️ Debe ser menor que el monto total
                </p>
              )}
            </div>

            {/* Estado Reserva */}
            <div className="space-y-1">
              <div className="relative">
                <select
                  value={estadoReserva}
                  onChange={(e) => setEstadoReserva(e.target.value as any)}
                  disabled={true}
                  className="w-full bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="Pendiente de Pago">Pendiente de Pago</option>
                  <option value="Pagada">Pagada</option>
                </select>
                {/* No arrow since it is always disabled */}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-1">
              <div className="relative">
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  disabled={!isEditMode}
                  className="w-full bg-[#0b0c0b] text-neutral-100 border border-neutral-700 focus:border-[#b2ceb4] rounded-lg p-3 text-xs font-sans font-semibold outline-none appearance-none disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
                {isEditMode && (
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
                    expand_more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-row gap-4 pt-6 border-t border-neutral-900">
          {viewBookingId ? (
            <>
              {/* Button: Guardar */}
              <button
                id="submit-existing-booking"
                type="submit"
                disabled={isFormDisabled}
                className="flex-1 py-4 bg-[#4a634e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 ml-1" />
                Guardar
              </button>

              {/* Button: Borrar */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("¿Está seguro de que desea eliminar esta reserva de forma permanente?")) {
                    if (onDelete && viewBookingId) {
                      onDelete(viewBookingId);
                      onBack();
                    }
                  }
                }}
                className="flex-1 py-4 bg-red-950/30 text-red-400 hover:bg-red-900/30 hover:text-red-200 border border-red-900/40 font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Borrar
              </button>

              {/* Button: Cancelar */}
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-neutral-850 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              {/* Button: Guardar for new booking */}
              <button
                id="submit-new-booking"
                type="submit"
                disabled={isFormDisabled}
                className="flex-1 py-4 bg-[#4a634e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 ml-1" />
                Guardar
              </button>

              {/* Button: Cancelar for new booking */}
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-4 bg-neutral-900 hover:bg-neutral-850 text-neutral-400 font-bold rounded-xl flex items-center justify-center gap-2 border border-neutral-850 transition-all text-xs font-sans uppercase tracking-widest cursor-pointer"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </form>
    </motion.div>
  );
}
