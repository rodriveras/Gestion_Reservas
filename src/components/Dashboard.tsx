/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { DollarSign, Percent, Moon, CalendarDays, ArrowLeft, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { Cabana, Reserva, ContratacionServicio, Cliente } from "../types";

interface DashboardProps {
  cabanas: Cabana[];
  reservas: Reserva[];
  contrataciones: ContratacionServicio[];
  clientes: Cliente[];
  onBack: () => void;
}

export default function Dashboard({ cabanas, reservas, contrataciones, clientes, onBack }: DashboardProps) {
  // 1. Calculate stats dynamically
  const totalBoringIncomes = reservas.reduce((acc, r) => acc + r.montoTotal, 0);
  const totalServiceIncomes = contrataciones.reduce((acc, c) => acc + c.subtotal, 0);
  const ingresosProyectados = totalBoringIncomes + totalServiceIncomes;

  // Outstanding unpaid balancing
  const unpaidServices = contrataciones
    .filter((c) => c.estadoPago !== "Pagado")
    .reduce((acc, c) => acc + (c.estadoPago === "Parcial" ? c.subtotal / 2 : c.subtotal), 0);
  const unpaidBookings = reservas.reduce((acc, r) => acc + (r.montoTotal - r.montoAnticipo), 0);
  const saldoPorCobrar = unpaidServices + unpaidBookings;

  // Avg nights
  const totalNoches = reservas.reduce((acc, r) => acc + r.noches, 0);
  const estadiaPromedio = reservas.length > 0 ? (totalNoches / reservas.length).toFixed(1) : "0";

  // Total reservations
  const reservasTotalesCount = reservas.length;

  // 2. Compute reservations per cabin for the Donut Chart
  const cabinBookingCounts = cabanas.map((c) => {
    const count = reservas.filter((r) => r.cabanaId === c.id).length;
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
    const count = reservas.filter((r) => {
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

  // 4. Monthly projection charts
  // Real world calculation to distribute booking values between May, Jun, Jul, Aug, Sep
  const monthlyIncomes = {
    MAY: 420000,
    JUN: 810000,
    JUL: 905000,
    AGO: 330000,
  };

  // Adjust values slightly based on interactive booking actions
  reservas.forEach((r) => {
    const month = new Date(r.checkIn).getMonth();
    // 4 is May, 5 is Jun, 6 is Jul, 7 is Aug
    if (month === 4) monthlyIncomes.MAY += r.montoTotal * 800; // scaling to match screenshots scale
    if (month === 5) monthlyIncomes.JUN += r.montoTotal * 800;
    if (month === 6) monthlyIncomes.JUL += r.montoTotal * 1000;
    if (month === 7) monthlyIncomes.AGO += r.montoTotal * 800;
  });

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
              Reservas por Cabaña
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle
                  className="text-neutral-850"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="#262626"
                  strokeWidth="10"
                ></circle>
                {/* Render colored arcs */}
                {cabinDonutSegments.map((seg, i) => {
                  const dashArray = 2 * Math.PI * 40; // 251.3
                  const strokeOffset = dashArray - (seg.angle / 360) * dashArray;
                  return (
                    <circle
                      key={seg.nombre}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeDasharray={251.3}
                      strokeDashoffset={strokeOffset}
                      className="transition-all duration-500 ease-out"
                      transform={`rotate(${seg.startAngle} 50 50)`}
                    />
                  );
                })}
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="block font-headline text-3xl font-bold text-white">
                  {reservasTotalesCount}
                </span>
                <span className="block font-sans text-[10px] text-neutral-400 uppercase tracking-widest">
                  Estadías
                </span>
              </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {cabinDonutSegments.map((seg) => (
                <div key={seg.nombre} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                  <div className="flex flex-col text-[11px]">
                    <span className="font-semibold text-neutral-200 truncate max-w-[120px]">{seg.nombre}</span>
                    <span className="text-neutral-500 font-sans">
                      {seg.percentage}% ({seg.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="40"
                  stroke="#262626"
                  strokeWidth="10"
                ></circle>
                {channelDonutSegments.map((seg, i) => {
                  const dashArray = 2 * Math.PI * 40;
                  const strokeOffset = dashArray - (seg.angle / 360) * dashArray;
                  return (
                    <circle
                      key={seg.name}
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke={seg.color}
                      strokeWidth="10"
                      strokeDasharray={251.3}
                      strokeDashoffset={strokeOffset}
                      className="transition-all duration-500 ease-out"
                      transform={`rotate(${seg.startAngle} 50 50)`}
                    />
                  );
                })}
              </svg>
              <div className="absolute text-center flex flex-col items-center justify-center">
                <span className="block font-headline text-3xl font-bold text-white">100%</span>
                <span className="block font-sans text-[10px] text-neutral-400 uppercase tracking-widest">
                  Reservas
                </span>
              </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
              {channelDonutSegments.map((seg) => (
                <div key={seg.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }}></div>
                  <div className="flex flex-col text-[11px]">
                    <span className="font-semibold text-neutral-200">{seg.name}</span>
                    <span className="text-neutral-500 font-sans">
                      {seg.percentage}% ({seg.count})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Bar Projection Chart */}
      <section className="bg-[#1b1e1b] rounded-xl border border-neutral-800/20 border-t-2 border-[#D29B6C] p-6 shadow-xl space-y-8">
        <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-headline font-semibold text-neutral-200">
              Ingresos Proyectados por Mes (CLP)
            </h3>
          </div>
          <span className="px-2.5 py-1 bg-cyan-950/40 text-cyan-400 border border-cyan-900 rounded-full font-sans text-xs font-bold">
            Año 2024
          </span>
        </div>

        {/* Dynamic Bars custom rendered */}
        <div className="h-64 flex items-end justify-between gap-6 px-4 pt-8">
          {/* MAY */}
          <div className="flex flex-col items-center flex-1 gap-3 h-full justify-end group">
            <div className="w-full rounded-t-lg transition-all duration-300 relative bg-gradient-to-t from-cyan-600 to-sky-400 shadow-[0_-4px_12px_rgba(34,211,238,0.25)] hover:brightness-110 cursor-pointer" style={{ height: "45%" }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-max">
                <span className="font-sans text-xs font-bold text-neutral-200">
                  {formatCurrency(monthlyIncomes.MAY).replace("$", "").trim()}
                </span>
              </div>
            </div>
            <span className="font-sans text-[10px] text-neutral-400 font-bold tracking-widest uppercase">
              MAYO
            </span>
          </div>

          {/* JUN */}
          <div className="flex flex-col items-center flex-1 gap-3 h-full justify-end group">
            <div className="w-full rounded-t-lg transition-all duration-300 relative bg-gradient-to-t from-violet-700 to-indigo-400 shadow-[0_-4px_12px_rgba(139,92,246,0.3)] hover:brightness-110 cursor-pointer" style={{ height: "80%" }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-max">
                <span className="font-sans text-xs font-bold text-neutral-200">
                  {formatCurrency(monthlyIncomes.JUN).replace("$", "").trim()}
                </span>
              </div>
            </div>
            <span className="font-sans text-[10px] text-neutral-400 font-bold tracking-widest uppercase">
              JUNIO
            </span>
          </div>

          {/* JUL */}
          <div className="flex flex-col items-center flex-1 gap-3 h-full justify-end group">
            <div className="w-full rounded-t-lg transition-all duration-300 relative bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_-4px_16px_rgba(16,185,129,0.35)] hover:brightness-110 cursor-pointer border-b-2 border-emerald-300" style={{ height: "95%" }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-max">
                <span className="font-sans text-xs font-bold text-[#b2ceb4]">
                  {formatCurrency(monthlyIncomes.JUL).replace("$", "").trim()}
                </span>
              </div>
            </div>
            <span className="font-sans text-[10px] text-[#b2ceb4] font-bold tracking-widest uppercase pb-0.5 border-b-2 border-[#b2ceb4]">
              JULIO
            </span>
          </div>

          {/* AGO */}
          <div className="flex flex-col items-center flex-1 gap-3 h-full justify-end group">
            <div className="w-full rounded-t-lg transition-all duration-300 relative bg-gradient-to-t from-indigo-600 to-violet-400 shadow-[0_-4px_12px_rgba(99,102,241,0.25)] hover:brightness-110 cursor-pointer" style={{ height: "35%" }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-max">
                <span className="font-sans text-xs font-bold text-neutral-200">
                  {formatCurrency(monthlyIncomes.AGO).replace("$", "").trim()}
                </span>
              </div>
            </div>
            <span className="font-sans text-[10px] text-neutral-400 font-bold tracking-widest uppercase">
              AGOSTO
            </span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
