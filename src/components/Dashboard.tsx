/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { DollarSign, Percent, Moon, CalendarDays, ArrowLeft, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { Cabana, Reserva, ContratacionServicio, Cliente } from "../types";

// Helper to parse dates in local timezone to avoid UTC shifting bugs
const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date(NaN);
  const normalized = dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`;
  return new Date(normalized);
};

interface DashboardProps {
  cabanas: Cabana[];
  reservas: Reserva[];
  contrataciones: ContratacionServicio[];
  clientes: Cliente[];
  onBack: () => void;
}

export default function Dashboard({ cabanas, reservas, contrataciones, clientes, onBack }: DashboardProps) {
  // Defensive copies to avoid null-reference crashes
  const safeCabanas = cabanas || [];
  const safeReservas = reservas || [];
  const safeClientes = clientes || [];
  const safeContrataciones = contrataciones || [];

  const [selectedCabinSegment, setSelectedCabinSegment] = useState<string | null>(null);
  const [selectedChannelSegment, setSelectedChannelSegment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | "Todos">(2026); // Default to 2026 matching mockup
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null); // None selected by default

  // Filter bookings and service contracts to only those belonging to the selected year,
  // and exclude cancelled reservations.
  const yearReservas = safeReservas.filter((r) => {
    if (r.estadoReserva === "Cancelada") return false;
    if (selectedYear === "Todos") return true;
    const date = parseLocalDate(r.checkIn);
    return !isNaN(date.getTime()) && date.getFullYear() === selectedYear;
  });

  const yearContrataciones = safeContrataciones.filter((c) => {
    const assocReserva = safeReservas.find(r => r.id === c.reservaId);
    if (assocReserva && assocReserva.estadoReserva === "Cancelada") return false;

    if (selectedYear === "Todos") return true;
    const dateStr = (c as any).fecha || (c as any).fechaContratacion;
    if (!dateStr) return false;
    const date = parseLocalDate(dateStr);
    return !isNaN(date.getTime()) && date.getFullYear() === selectedYear;
  });

  // 1. Calculate stats dynamically based on the selected year
  const totalBoringIncomes = yearReservas.reduce((acc, r) => acc + r.montoTotal, 0);
  const totalServiceIncomes = yearContrataciones.reduce((acc, c) => acc + c.subtotal, 0);
  const ingresosProyectados = totalBoringIncomes + totalServiceIncomes;

  // Outstanding unpaid balancing based on the selected year
  const unpaidServices = yearContrataciones
    .filter((c) => c.estadoPago !== "Pagado")
    .reduce((acc, c) => acc + (c.estadoPago === "Parcial" ? c.subtotal / 2 : c.subtotal), 0);
  const unpaidBookings = yearReservas.reduce((acc, r) => acc + (r.montoTotal - r.montoAnticipo), 0);
  const saldoPorCobrar = unpaidServices + unpaidBookings;

  // Avg nights based on the selected year
  const totalNoches = yearReservas.reduce((acc, r) => acc + r.noches, 0);
  const estadiaPromedio = yearReservas.length > 0 ? (totalNoches / yearReservas.length).toFixed(1) : "0";

  // Total reservations based on the selected year
  const reservasTotalesCount = yearReservas.length;

  // 2. Compute reservations per cabin for the Donut Chart based on the selected year
  const cabinBookingCounts = safeCabanas.map((c) => {
    const count = yearReservas.filter((r) => r.cabanaId === c.id).length;
    return {
      nombre: c.nombre,
      count,
    };
  });
  const totalCabinBookings = cabinBookingCounts.reduce((acc, c) => acc + c.count, 0) || 1;

  // Segment values for dynamic SVG arc
  let accumulatedAngleCabin = 0;
  const cabinDonutSegments = cabinBookingCounts.map((cb, idx) => {
    const percentage = cb.count / totalCabinBookings;
    const angle = percentage * 360;
    const startAngle = accumulatedAngleCabin;
    accumulatedAngleCabin += angle;

    // Color assigned matching screenshots
    const colors = ["#10b981", "#38bdf8", "#8b5cf6", "#2dd4bf", "#f59e0b"];
    return {
      ...cb,
      percentage: Math.round(percentage * 100),
      color: colors[idx % colors.length],
      startAngle,
      angle,
    };
  });

  // 3. Compute booking channels based on the selected year
  const channels = ["Airbnb", "Directo", "Booking", "Otros"] as const;
  const channelCounts = channels.map((chan) => {
    const count = yearReservas.filter((r) => {
      if (chan === "Otros") {
        return !["Airbnb", "Directo", "Booking"].includes(r.canalVentas);
      }
      return r.canalVentas === chan;
    }).length;
    return {
      name: chan,
      count,
    };
  });

  const totalChannelSales = channelCounts.reduce((acc, c) => acc + c.count, 0) || 1;
  let accumulatedAngleChannel = 0;
  const channelDonutSegments = channelCounts.map((ch, idx) => {
    const percentage = ch.count / totalChannelSales;
    const angle = percentage * 360;
    const startAngle = accumulatedAngleChannel;
    accumulatedAngleChannel += angle;

    const colors = ["#818cf8", "#34d399", "#22d3ee", "#9ca3af"];
    return {
      ...ch,
      percentage: Math.round(percentage * 100),
      color: colors[idx % colors.length],
      startAngle,
      angle,
    };
  });

  const selectedCabinReservations = selectedCabinSegment
    ? yearReservas.filter((r) => {
        const cab = safeCabanas.find((c) => c.nombre === selectedCabinSegment);
        return cab && r.cabanaId === cab.id;
      })
    : [];

  const selectedChannelReservations = selectedChannelSegment
    ? yearReservas.filter((r) => {
        if (selectedChannelSegment === "Otros") {
          return !["Airbnb", "Directo", "Booking"].includes(r.canalVentas);
        }
        return r.canalVentas === selectedChannelSegment;
      })
    : [];

  const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"];
  const monthlyValues: { [key: number]: number } = {};

  // Distribute booking values dynamically
  yearReservas.forEach((r) => {
    const date = parseLocalDate(r.checkIn);
    if (!isNaN(date.getTime())) {
      const m = date.getMonth();
      monthlyValues[m] = (monthlyValues[m] || 0) + r.montoTotal;
    }
  });

  yearContrataciones.forEach((c) => {
    const dateStr = (c as any).fecha || (c as any).fechaContratacion;
    if (dateStr) {
      const date = parseLocalDate(dateStr);
      if (!isNaN(date.getTime())) {
        const m = date.getMonth();
        monthlyValues[m] = (monthlyValues[m] || 0) + c.subtotal;
      }
    }
  });

  const allMonths = monthNames.map((name, index) => {
    return {
      monthIndex: index,
      name,
      value: monthlyValues[index] || 0,
    };
  });
  const totalAnnual = allMonths.reduce((acc, m) => acc + m.value, 0);
  const maxIncome = Math.max(...allMonths.map((d) => d.value)) || 1;

  const monthFullNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
  ];

  const monthColors: { [key: string]: string } = {
    ENE: "#e0536c",
    FEB: "#c82b7b",
    MAR: "#884fc6",
    ABR: "#7844dc",
    MAY: "#544ee3",
    JUN: "#3b82f6",
    JUL: "#0ea5e9",
    AGO: "#06b6d4",
    SET: "#0d9488",
    OCT: "#10b981",
    NOV: "#f59e0b",
    DIC: "#ea580c"
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 0 }).format(val);
  };

  const getBarGradient = (month: string) => {
    // ENE, FEB, DIC (Verano)
    if (["ENE", "FEB", "DIC"].includes(month)) {
      return "from-amber-600 to-rose-400 shadow-[0_-4px_12px_rgba(244,63,94,0.15)]";
    }
    // MAR, ABR, MAY (Otoño)
    if (["MAR", "ABR", "MAY"].includes(month)) {
      return "from-[#D29B6C] to-[#f6bb89] shadow-[0_-4px_12px_rgba(246,187,137,0.15)]";
    }
    // JUN, JUL, AGO (Invierno)
    if (month === "JUL") {
      return "from-emerald-600 to-[#b2ceb4] shadow-[0_-4px_16px_rgba(16,185,129,0.3)]";
    }
    if (["JUN", "AGO"].includes(month)) {
      return "from-cyan-600 to-indigo-400 shadow-[0_-4px_12px_rgba(99,102,241,0.15)]";
    }
    // SEP, OCT, NOV (Primavera)
    return "from-violet-600 to-fuchsia-400 shadow-[0_-4px_12px_rgba(236,72,153,0.15)]";
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
      {/* Back button & Title Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#b2ceb4] hover:text-white transition-all cursor-pointer mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h2 className="text-sm font-sans font-bold text-neutral-100">
            Análisis Estratégico
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-[#1b1e1b] border border-neutral-800/80 p-1 rounded-lg self-start md:self-auto shadow-md">
          <CalendarDays className="w-4 h-4 text-[#f6bb89] ml-1.5 shrink-0" />
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYear(val === "Todos" ? "Todos" : parseInt(val, 10));
              }}
              className="bg-[#121412]/60 text-xs font-sans font-bold text-[#b2ceb4] border border-neutral-800/40 pl-2.5 pr-7 py-0.5 rounded-md outline-none appearance-none cursor-pointer hover:border-neutral-700 hover:text-white transition-all h-7 min-w-[80px] shadow-inner animate-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23b2ceb4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: `right 0.4rem center`,
                backgroundSize: `1.1em 1.1em`,
                backgroundRepeat: `no-repeat`
              }}
            >
              {[2024, 2025, 2026, "Todos"].map((yr) => (
                <option key={yr} value={yr} className="bg-[#1b1e1b] text-neutral-200">
                  {yr === "Todos" ? "Todos" : yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* KPI Cards section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ingresos */}
        <div className="bg-[#1b1e1b] rounded-xl border border-neutral-800/10 border-t-2 border-[#D29B6C] p-5 shadow-lg relative overflow-hidden transition-all hover:translate-y-[-2px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
              Ingresos Totales
            </span>
            <DollarSign className="w-4 h-4 text-[#f6bb89]" />
          </div>
          <div className="text-base md:text-lg font-sans font-bold text-[#e2e3df]">
            {formatCurrency(ingresosProyectados)}
          </div>
        </div>

        {/* KPI 2: Por Cobrar */}
        <div className="bg-[#1b1e1b] rounded-xl border border-neutral-800/10 border-t-2 border-[#D29B6C] p-5 shadow-lg relative overflow-hidden transition-all hover:translate-y-[-2px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
              Saldo Pendiente
            </span>
            <span className="text-xs font-sans bg-amber-950/40 text-[#f9ba82] px-1.5 py-0.5 rounded">Cobros</span>
          </div>
          <div className="text-base md:text-lg font-sans font-bold text-[#e2e3df]">
            {formatCurrency(saldoPorCobrar)}
          </div>
        </div>

        {/* KPI 3: Estadía Promedio */}
        <div className="bg-[#1b1e1b] rounded-xl border border-neutral-800/10 border-t-2 border-[#D29B6C] p-5 shadow-lg relative overflow-hidden transition-all hover:translate-y-[-2px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
              Estadía Promedio
            </span>
            <Moon className="w-4 h-4 text-[#b2ceb4]" />
          </div>
          <div className="text-base md:text-lg font-sans font-bold text-[#e2e3df]">
            {estadiaPromedio} noches
          </div>
        </div>

        {/* KPI 4: Reservas Totales */}
        <div className="bg-[#1b1e1b] rounded-xl border border-neutral-800/10 border-t-2 border-[#D29B6C] p-5 shadow-lg relative overflow-hidden transition-all hover:translate-y-[-2px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-sans font-bold text-neutral-400 uppercase tracking-widest">
              Reservas Activas
            </span>
            <CalendarDays className="w-4 h-4 text-[#e6ad7c]" />
          </div>
          <div className="text-base md:text-lg font-sans font-bold text-[#e2e3df]">
            {reservasTotalesCount} reservas
          </div>
        </div>
      </section>

      {/* Two Columns with Donuts charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Reservas por Cabaña */}
        <div className="bg-[#1b1e1b] rounded-xl border border-neutral-800/40 border-t-2 border-[#D29B6C] p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-sans font-bold text-neutral-100">
              Reservas Activas por cabañas
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle
                  className="text-neutral-850"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="#262626"
                  strokeWidth="18"
                ></circle>
                
                {/* Render colored arcs */}
                {cabinDonutSegments.map((seg, i) => {
                  const dashArray = 2 * Math.PI * 40; // 251.3
                  const strokeOffset = dashArray - (seg.angle / 360) * dashArray;
                  const isSelected = selectedCabinSegment === seg.nombre;
                  return (
                    <g 
                      key={seg.nombre} 
                      className="cursor-pointer" 
                      onClick={() => {
                        setSelectedCabinSegment((prev) => (prev === seg.nombre ? null : seg.nombre));
                      }}
                    >
                      {/* White outline border behind selected segment */}
                      {isSelected && (
                        <circle
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke="#ffffff"
                          strokeWidth="22"
                          strokeDasharray={251.3}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300 ease-out pointer-events-none"
                          transform={`rotate(${seg.startAngle - 90} 50 50)`}
                        />
                      )}
                      {/* Colored arc segment */}
                      <circle
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={251.3}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300 ease-out hover:brightness-110"
                        transform={`rotate(${seg.startAngle - 90} 50 50)`}
                      />
                    </g>
                  );
                })}

                {/* Render labels on top of the segments inside the wide ring */}
                {cabinDonutSegments.map((seg) => {
                  if (seg.count === 0) return null; // Skip slices with no bookings to prevent overlap
                  const midAngle = seg.startAngle + seg.angle / 2 - 90;
                  const angleRad = (midAngle * Math.PI) / 180;
                  // Center of the ring is at radius 40
                  const labelX = 50 + 40 * Math.cos(angleRad);
                  const labelY = 50 + 40 * Math.sin(angleRad);

                  const cabinLabel = seg.nombre.replace("Cabaña ", "").toUpperCase();

                  return (
                    <g 
                      key={`label-${seg.nombre}`} 
                      className="select-none pointer-events-none transition-all duration-300"
                    >
                      {/* Cabin Name with high-contrast outline halo */}
                      <text
                        x={labelX}
                        y={labelY - 1.8}
                        fill="#ffffff"
                        fontSize="3.2"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-sans font-bold fill-white"
                        stroke="#000000"
                        strokeWidth="1.0"
                        strokeLinejoin="round"
                        paintOrder="stroke"
                      >
                        {cabinLabel}
                      </text>
                      {/* Count with high-contrast outline halo */}
                      <text
                        x={labelX}
                        y={labelY + 2.4}
                        fill="#ffffff"
                        fontSize="4.2"
                        fontWeight="black"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-sans font-black fill-white"
                        stroke="#000000"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        paintOrder="stroke"
                      >
                        {seg.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
                <span className="block font-sans text-xl font-bold text-white">
                  {reservasTotalesCount}
                </span>
                <span className="block font-sans text-[10px] text-[#b2ceb4] uppercase tracking-widest font-semibold">
                  Estadías
                </span>
              </div>
            </div>
          </div>

          {selectedCabinSegment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 p-5 bg-[#121412] border border-neutral-800/80 rounded-xl relative overflow-hidden shadow-lg"
            >
              {/* Decorative vertical colored stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]"></div>
              
              <button
                onClick={() => setSelectedCabinSegment(null)}
                className="absolute top-3 right-3 text-neutral-500 hover:text-white text-xs cursor-pointer"
                title="Cerrar detalle"
              >
                ✕
              </button>
              
              <div className="pl-2 pr-4 flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-4">
                <div>
                  <span className="text-[10px] font-sans font-extrabold text-[#10b981] uppercase tracking-wider">
                    Detalle de Cabaña
                  </span>
                  <h4 className="text-xl font-headline font-bold text-white mt-1">
                    {selectedCabinSegment}
                  </h4>
                </div>
                
                <div className="flex items-center gap-6 self-start sm:self-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-extrabold text-neutral-200 uppercase tracking-widest">
                      RESERVAS ACTIVAS
                    </span>
                    <span className="text-2xl font-sans font-black text-white mt-1">
                      {yearReservas.filter((r) => {
                        const cab = safeCabanas.find((c) => c.nombre === selectedCabinSegment);
                        return cab && r.cabanaId === cab.id;
                      }).length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-extrabold text-neutral-200 uppercase tracking-widest">
                      PORCENTAJE DE RESERVAS
                    </span>
                    <span className="text-2xl font-sans font-black text-[#10b981] mt-1">
                      {Math.round(
                        (yearReservas.filter((r) => {
                          const cab = safeCabanas.find((c) => c.nombre === selectedCabinSegment);
                          return cab && r.cabanaId === cab.id;
                        }).length / (yearReservas.length || 1)) * 100
                      )}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Chart 2: Canal de Captación */}
        <div className="bg-[#1b1e1b] rounded-xl border border-neutral-800/40 border-t-2 border-[#D29B6C] p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-neutral-900">
            <PieChart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-sans font-bold text-neutral-100">
              Canal de Captación
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="#262626"
                  strokeWidth="18"
                ></circle>
                {channelDonutSegments.map((seg, i) => {
                  const dashArray = 2 * Math.PI * 40;
                  const strokeOffset = dashArray - (seg.angle / 360) * dashArray;
                  const isSelected = selectedChannelSegment === seg.name;
                  return (
                    <g 
                      key={seg.name} 
                      className="cursor-pointer" 
                      onClick={() => {
                        setSelectedChannelSegment((prev) => (prev === seg.name ? null : seg.name));
                      }}
                    >
                      {/* White outline border behind selected segment */}
                      {isSelected && (
                        <circle
                          cx="50"
                          cy="50"
                          fill="transparent"
                          r="40"
                          stroke="#ffffff"
                          strokeWidth="22"
                          strokeDasharray={251.3}
                          strokeDashoffset={strokeOffset}
                          className="transition-all duration-300 ease-out pointer-events-none"
                          transform={`rotate(${seg.startAngle - 90} 50 50)`}
                        />
                      )}
                      {/* Colored arc segment */}
                      <circle
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke={seg.color}
                        strokeWidth="18"
                        strokeDasharray={251.3}
                        strokeDashoffset={strokeOffset}
                        className="transition-all duration-300 ease-out hover:brightness-110"
                        transform={`rotate(${seg.startAngle - 90} 50 50)`}
                      />
                    </g>
                  );
                })}

                {/* Render labels on top of the segments inside the wide ring */}
                {channelDonutSegments.map((seg) => {
                  if (seg.count === 0) return null; // Skip slices with no bookings to prevent overlap
                  const midAngle = seg.startAngle + seg.angle / 2 - 90;
                  const angleRad = (midAngle * Math.PI) / 180;
                  // Center of the ring is at radius 40
                  const labelX = 50 + 40 * Math.cos(angleRad);
                  const labelY = 50 + 40 * Math.sin(angleRad);

                  const channelLabel = seg.name.toUpperCase();

                  return (
                    <g 
                      key={`label-${seg.name}`} 
                      className="select-none pointer-events-none transition-all duration-300"
                    >
                      {/* Channel Name with high-contrast outline halo */}
                      <text
                        x={labelX}
                        y={labelY - 1.8}
                        fill="#ffffff"
                        fontSize="3.2"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-sans font-bold fill-white"
                        stroke="#000000"
                        strokeWidth="1.0"
                        strokeLinejoin="round"
                        paintOrder="stroke"
                      >
                        {channelLabel}
                      </text>
                      {/* Count with high-contrast outline halo */}
                      <text
                        x={labelX}
                        y={labelY + 2.4}
                        fill="#ffffff"
                        fontSize="4.2"
                        fontWeight="black"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-sans font-black fill-white"
                        stroke="#000000"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        paintOrder="stroke"
                      >
                        {seg.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none">
                <span className="block font-sans text-xl font-bold text-white">100%</span>
                <span className="block font-sans text-[10px] text-[#b2ceb4] uppercase tracking-widest font-semibold">
                  Reservas
                </span>
              </div>
            </div>
          </div>

          {selectedChannelSegment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 p-5 bg-[#121412] border border-neutral-800/80 rounded-xl relative overflow-hidden shadow-lg"
            >
              {/* Decorative vertical colored stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#818cf8]"></div>
              
              <button
                onClick={() => setSelectedChannelSegment(null)}
                className="absolute top-3 right-3 text-neutral-500 hover:text-white text-xs cursor-pointer"
                title="Cerrar detalle"
              >
                ✕
              </button>
              
              <div className="pl-2 pr-4 flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-4">
                <div>
                  <span className="text-[10px] font-sans font-extrabold text-[#818cf8] uppercase tracking-wider">
                    Detalle de Canal
                  </span>
                  <h4 className="text-xl font-headline font-bold text-white mt-1">
                    {selectedChannelSegment}
                  </h4>
                </div>
                
                <div className="flex items-center gap-6 self-start sm:self-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-extrabold text-neutral-200 uppercase tracking-widest">
                      RESERVAS ACTIVAS
                    </span>
                    <span className="text-2xl font-sans font-black text-white mt-1">
                      {yearReservas.filter((r) => {
                        if (selectedChannelSegment === "Otros") {
                          return !["Airbnb", "Directo", "Booking"].includes(r.canalVentas);
                        }
                        return r.canalVentas === selectedChannelSegment;
                      }).length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-extrabold text-neutral-200 uppercase tracking-widest">
                      PORCENTAJE DE RESERVAS
                    </span>
                    <span className="text-2xl font-sans font-black text-[#818cf8] mt-1">
                      {Math.round(
                        (yearReservas.filter((r) => {
                          if (selectedChannelSegment === "Otros") {
                            return !["Airbnb", "Directo", "Booking"].includes(r.canalVentas);
                          }
                          return r.canalVentas === selectedChannelSegment;
                        }).length / (yearReservas.length || 1)) * 100
                      )}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Monthly Bar Projection Chart */}
      <section className="bg-[#0c0d0c] rounded-2xl border border-[#d29b6c]/30 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-900/60">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </span>
            <h3 className="text-sm font-sans font-bold text-neutral-100 tracking-wide">
              Ingresos Mensuales Totales
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-[#1b1e1b] border border-neutral-800/80 p-1 rounded-lg shadow-md">
            <CalendarDays className="w-4 h-4 text-[#f6bb89] ml-1.5 shrink-0" />
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedYear(val === "Todos" ? "Todos" : parseInt(val, 10));
                }}
                className="bg-[#121412]/60 text-xs font-sans font-bold text-[#b2ceb4] border border-neutral-800/40 pl-2.5 pr-7 py-0.5 rounded-md outline-none appearance-none cursor-pointer hover:border-neutral-700 hover:text-white transition-all h-7 min-w-[80px] shadow-inner animate-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23b2ceb4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: `right 0.4rem center`,
                  backgroundSize: `1.1em 1.1em`,
                  backgroundRepeat: `no-repeat`
                }}
              >
                {[2024, 2025, 2026, "Todos"].map((yr) => (
                  <option key={yr} value={yr} className="bg-[#1b1e1b] text-neutral-200">
                    {yr === "Todos" ? "Todos" : yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Bars custom rendered */}
        <div className="pb-2">
          {totalAnnual === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/10 p-6 text-center">
              <span className="text-[#b2ceb4] font-sans font-bold text-sm mb-1">
                Sin Movimientos Comerciales
              </span>
              <p className="text-xs text-neutral-500 max-w-sm">
                No se registran estadías ni consumos facturados {selectedYear === "Todos" ? "en el historial completo" : `en el año ${selectedYear}`}.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bars container */}
              <div className="h-64 flex items-end justify-between gap-1.5 sm:gap-4 px-4 pt-12">
                {allMonths.map((d) => {
                  const isSelected = selectedMonthIndex === d.monthIndex;
                  const heightPercent = d.value > 0 && maxIncome > 0 ? `${(d.value / maxIncome) * 75 + 15}%` : "0%";
                  const color = monthColors[d.name];
                  
                  return (
                    <div
                      key={d.name}
                      onClick={() => setSelectedMonthIndex((prev) => (prev === d.monthIndex ? null : d.monthIndex))}
                      className="flex flex-col items-center flex-1 max-w-[80px] gap-3 h-full justify-end group cursor-pointer"
                    >
                      <div className="w-full relative flex flex-col justify-end h-full">
                        {/* Tooltip bubble on selected or group hover */}
                        {d.value > 0 && (
                          <div
                            className={`absolute -top-10 left-1/2 -translate-x-1/2 transition-all duration-300 pointer-events-none z-25 ${
                              isSelected
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
                            }`}
                          >
                            <div
                              className={`bg-black text-white rounded-md px-2.5 py-1 text-[10px] font-mono font-bold shadow-lg relative leading-none whitespace-nowrap ${
                                isSelected
                                  ? "border border-white/90 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                                  : "border border-neutral-800/80"
                              }`}
                            >
                              $${formatNumber(d.value)}
                              {/* Small triangle arrow at bottom of bubble */}
                              <div
                                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rotate-45 ${
                                  isSelected ? "border-r border-b border-white/90" : "border-r border-b border-neutral-800/80"
                                }`}
                              />
                            </div>
                          </div>
                        )}

                        {/* Bar */}
                        {d.value > 0 && (
                          <div
                            className={`w-full rounded-t-[10px] transition-all duration-300 ease-out ${
                              isSelected
                                ? "border-2 border-white ring-4 ring-white/10"
                                : "hover:brightness-110 border border-transparent"
                            }`}
                            style={{
                              height: heightPercent,
                              backgroundColor: color,
                              boxShadow: isSelected ? `0 0 20px ${color}50` : "none"
                            }}
                          />
                        )}
                      </div>

                      {/* Month Label with dynamic bottom line indicator */}
                      <div className="flex flex-col items-center h-6 justify-start relative w-full">
                        <span
                          className="font-sans text-[10px] font-bold tracking-wider uppercase transition-all duration-250"
                          style={{ color: isSelected ? color : "#a3a3a3" }}
                        >
                          {d.name}
                        </span>
                        {isSelected && (
                          <span
                            className="w-4 h-0.5 rounded-full mt-1 animate-pulse"
                            style={{ backgroundColor: color }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detail Footer */}
              {selectedMonthIndex !== null && (
                <div className="bg-[#121412]/80 border border-neutral-900 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    {/* Dot with matching color */}
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_currentColor] animate-pulse border-2 border-white/20"
                      style={{
                        backgroundColor: monthColors[monthNames[selectedMonthIndex]],
                        color: monthColors[monthNames[selectedMonthIndex]]
                      }}
                    />
                    <div className="text-left">
                      <h4 className="text-lg font-headline font-bold text-white leading-tight">
                        {monthFullNames[selectedMonthIndex]} {selectedYear === "Todos" ? "(Histórico)" : selectedYear}
                      </h4>
                      <p className="text-xs text-neutral-400 font-sans mt-1">
                        Proporción sobre el total de <span className="font-semibold text-neutral-200">${formatNumber(totalAnnual)}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] font-sans font-extrabold text-neutral-400 tracking-wider uppercase">
                      PARTICIPACIÓN: {totalAnnual > 0 ? Math.round(((monthlyValues[selectedMonthIndex] || 0) / totalAnnual) * 100) : 0}%
                    </span>
                    <div className="text-lg font-sans font-bold text-white mt-1 tracking-tight">
                      <span className="text-[#10b981] font-bold mr-1">$</span>
                      <span className="text-white font-extrabold">{formatNumber(monthlyValues[selectedMonthIndex] || 0)}</span>
                      <span className="text-[#10b981] text-xs font-bold ml-1.5 uppercase tracking-wider">CLP</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
