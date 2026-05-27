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

  // 1. Calculate stats dynamically
  const totalBoringIncomes = safeReservas.reduce((acc, r) => acc + r.montoTotal, 0);
  const totalServiceIncomes = safeContrataciones.reduce((acc, c) => acc + c.subtotal, 0);
  const ingresosProyectados = totalBoringIncomes + totalServiceIncomes;

  // Outstanding unpaid balancing
  const unpaidServices = safeContrataciones
    .filter((c) => c.estadoPago !== "Pagado")
    .reduce((acc, c) => acc + (c.estadoPago === "Parcial" ? c.subtotal / 2 : c.subtotal), 0);
  const unpaidBookings = safeReservas.reduce((acc, r) => acc + (r.montoTotal - r.montoAnticipo), 0);
  const saldoPorCobrar = unpaidServices + unpaidBookings;

  // Avg nights
  const totalNoches = safeReservas.reduce((acc, r) => acc + r.noches, 0);
  const estadiaPromedio = safeReservas.length > 0 ? (totalNoches / safeReservas.length).toFixed(1) : "0";

  // Total reservations
  const reservasTotalesCount = safeReservas.length;

  // 2. Compute reservations per cabin for the Donut Chart
  const cabinBookingCounts = safeCabanas.map((c) => {
    const count = safeReservas.filter((r) => r.cabanaId === c.id).length;
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

  // 3. Compute booking channels
  const channels = ["Airbnb", "Directo", "Booking", "Otros"] as const;
  const channelCounts = channels.map((chan) => {
    const count = safeReservas.filter((r) => {
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
    ? safeReservas.filter((r) => {
        const cab = safeCabanas.find((c) => c.nombre === selectedCabinSegment);
        return cab && r.cabanaId === cab.id;
      })
    : [];

  const selectedChannelReservations = selectedChannelSegment
    ? safeReservas.filter((r) => {
        if (selectedChannelSegment === "Otros") {
          return !["Airbnb", "Directo", "Booking"].includes(r.canalVentas);
        }
        return r.canalVentas === selectedChannelSegment;
      })
    : [];

  // State to filter monthly incomes by selected year
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const monthlyValues: { [key: number]: number } = {};

  // Distribute booking values dynamically, filtering by the selected year
  safeReservas.forEach((r) => {
    const date = parseLocalDate(r.checkIn);
    if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
      const m = date.getMonth();
      monthlyValues[m] = (monthlyValues[m] || 0) + r.montoTotal * 1000;
    }
  });

  safeContrataciones.forEach((c) => {
    const dateStr = (c as any).fecha || (c as any).fechaContratacion;
    if (dateStr) {
      const date = parseLocalDate(dateStr);
      if (!isNaN(date.getTime()) && date.getFullYear() === selectedYear) {
        const m = date.getMonth();
        monthlyValues[m] = (monthlyValues[m] || 0) + c.subtotal * 1000;
      }
    }
  });

  // Extract only the months that have actual sales (> 0)
  const activeMonths = Object.keys(monthlyValues)
    .map((mStr) => {
      const m = parseInt(mStr, 10);
      return {
        monthIndex: m,
        name: monthNames[m],
        value: monthlyValues[m],
      };
    })
    .sort((a, b) => a.monthIndex - b.monthIndex);

  const maxIncome = Math.max(...activeMonths.map((d) => d.value)) || 1;

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
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-[#b2ceb4]">
            Análisis Estratégico
          </h2>
          <p className="text-neutral-400 font-sans text-sm mt-1">
            Resumen ejecutivo del rendimiento real y proyectado de las cabañas.
          </p>
        </div>
        <div className="bg-[#1b1e1b] border-t border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-2 self-start md:self-auto">
          <TrendingUp className="w-4 h-4 text-[#f6bb89]" />
          <span className="text-xs font-sans font-bold text-neutral-300">MODO COMPACTO ACTIVO</span>
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
          <div className="text-xl md:text-2xl font-headline font-semibold text-[#e2e3df]">
            {formatCurrency(ingresosProyectados * 1000)}
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
          <div className="text-xl md:text-2xl font-headline font-semibold text-[#e2e3df]">
            {formatCurrency(saldoPorCobrar * 1000)}
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
          <div className="text-xl md:text-2xl font-headline font-semibold text-[#e2e3df]">
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
          <div className="text-xl md:text-2xl font-headline font-semibold text-[#e2e3df]">
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
            <h3 className="text-lg font-headline font-semibold text-neutral-200">
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
                <span className="block font-headline text-3xl font-bold text-white">
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
                      {safeReservas.filter((r) => {
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
                        (safeReservas.filter((r) => {
                          const cab = safeCabanas.find((c) => c.nombre === selectedCabinSegment);
                          return cab && r.cabanaId === cab.id;
                        }).length / (safeReservas.length || 1)) * 100
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
            <h3 className="text-lg font-headline font-semibold text-neutral-200">
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
                <span className="block font-headline text-3xl font-bold text-white">100%</span>
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
                      {safeReservas.filter((r) => {
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
                        (safeReservas.filter((r) => {
                          if (selectedChannelSegment === "Otros") {
                            return !["Airbnb", "Directo", "Booking"].includes(r.canalVentas);
                          }
                          return r.canalVentas === selectedChannelSegment;
                        }).length / (safeReservas.length || 1)) * 100
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
      <section className="bg-[#1b1e1b] rounded-xl border border-neutral-800/20 border-t-2 border-[#D29B6C] p-6 shadow-xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-headline font-semibold text-neutral-200">
              Ingresos Proyectados por Mes (CLP)
            </h3>
          </div>
          <div className="flex bg-[#121412] p-1 rounded-lg border border-neutral-800/60 self-start sm:self-auto">
            {[2024, 2025, 2026].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 text-xs font-sans font-bold rounded-md transition-all duration-200 cursor-pointer ${
                  selectedYear === yr
                    ? "bg-[#4a634e] text-white shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Bars custom rendered */}
        <div className="pb-2">
          {activeMonths.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/10 p-6 text-center">
              <span className="text-[#b2ceb4] font-sans font-bold text-sm mb-1">
                Sin Movimientos Comerciales
              </span>
              <p className="text-xs text-neutral-500 max-w-sm">
                No se registran estadías ni consumos facturados en el año {selectedYear}.
              </p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-center gap-4 sm:gap-6 px-4 pt-8">
              {activeMonths.map((d) => {
                const heightPercent = `${(d.value / maxIncome) * 75 + 10}%`; // dynamic scale, min 10%, max 85%
                const isJuly = d.name === "JUL";
                const gradientClass = getBarGradient(d.name);
                
                return (
                  <div key={d.name} className="flex flex-col items-center flex-1 max-w-[80px] gap-3 h-full justify-end group">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 relative bg-gradient-to-t ${gradientClass} hover:brightness-110 cursor-pointer`}
                      style={{ height: heightPercent }}
                    >
                      {/* Value label on top of the bar */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-max transition-transform group-hover:scale-105">
                        <span className={`font-sans text-[10px] font-bold ${isJuly ? "text-[#b2ceb4]" : "text-neutral-300"}`}>
                          {formatCurrency(d.value).replace("$", "").trim()}
                        </span>
                      </div>
                    </div>
                    <span className={`font-sans text-[10px] font-bold tracking-wider uppercase ${isJuly ? "text-[#b2ceb4] pb-0.5 border-b-2 border-[#b2ceb4]" : "text-[#b2ceb4]"}`}>
                      {d.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
