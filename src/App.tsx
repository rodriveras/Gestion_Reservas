/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Trees, User, Bell, HelpCircle, Shield, Briefcase, ChevronRight, Cloud, CloudOff, RefreshCw } from "lucide-react";

// Types and Seed lists
import {
  Cabana,
  Cliente,
  Servicio,
  Reserva,
  ContratacionServicio,
  INITIAL_CABANAS,
  INITIAL_CLIENTES,
  INITIAL_SERVICIOS,
  INITIAL_RESERVAS,
  INITIAL_CONTRATACIONES,
} from "./types";

// Google Sheets Service
import { sheetsService, isSheetsConfigured } from "./services/sheetsService";

// Custom Modular Components
import AdminLauncher from "./components/AdminLauncher";
import CalendarView from "./components/CalendarView";
import Dashboard from "./components/Dashboard";
import CabinForm from "./components/CabinForm";
import ClientForm from "./components/ClientForm";
import ServiceForm from "./components/ServiceForm";
import BookingForm from "./components/BookingForm";
import ServiceContractForm from "./components/ServiceContractForm";
import GuestView from "./components/GuestView";

export default function App() {
  // --- Persistent Local Database State Engine ---
  const [cabanas, setCabanas] = useState<Cabana[]>(() => {
    const saved = localStorage.getItem("entre_nieves_cabanas");
    return saved ? JSON.parse(saved) : INITIAL_CABANAS;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem("entre_nieves_clientes");
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [servicios, setServicios] = useState<Servicio[]>(() => {
    const saved = localStorage.getItem("entre_nieves_servicios");
    return saved ? JSON.parse(saved) : INITIAL_SERVICIOS;
  });

  const [reservas, setReservas] = useState<Reserva[]>(() => {
    const saved = localStorage.getItem("entre_nieves_reservas");
    return saved ? JSON.parse(saved) : INITIAL_RESERVAS;
  });

  const [contrataciones, setContrataciones] = useState<ContratacionServicio[]>(() => {
    const saved = localStorage.getItem("entre_nieves_contrataciones");
    return saved ? JSON.parse(saved) : INITIAL_CONTRATACIONES;
  });

  // --- Google Sheets Integration State Engine ---
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sheetsActive, setSheetsActive] = useState<boolean>(isSheetsConfigured());

  // Navigation Screen Name
  const [currentScreen, setCurrentScreen] = useState<string>("admin");
  const [preselectedCabinId, setPreselectedCabinId] = useState<string>("");
  const [preselectedCheckIn, setPreselectedCheckIn] = useState<string>("");

  // Synchronizers (Local Backup)
  useEffect(() => {
    localStorage.setItem("entre_nieves_cabanas", JSON.stringify(cabanas));
  }, [cabanas]);

  useEffect(() => {
    localStorage.setItem("entre_nieves_clientes", JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem("entre_nieves_servicios", JSON.stringify(servicios));
  }, [servicios]);

  useEffect(() => {
    localStorage.setItem("entre_nieves_reservas", JSON.stringify(reservas));
  }, [reservas]);

  useEffect(() => {
    localStorage.setItem("entre_nieves_contrataciones", JSON.stringify(contrataciones));
  }, [contrataciones]);

  // Carga inicial asíncrona desde la nube (Google Sheets)
  useEffect(() => {
    async function loadCloudData() {
      if (!isSheetsConfigured()) return;
      
      setIsSyncing(true);
      setSyncStatus("loading");
      
      const seedState = {
        cabanas: INITIAL_CABANAS,
        clientes: INITIAL_CLIENTES,
        servicios: INITIAL_SERVICIOS,
        reservas: INITIAL_RESERVAS,
        contrataciones: INITIAL_CONTRATACIONES,
      };

      try {
        const cloudData = await sheetsService.getDatabase(seedState);
        setCabanas(cloudData.cabanas);
        setClientes(cloudData.clientes);
        setServicios(cloudData.servicios);
        setReservas(cloudData.reservas);
        setContrataciones(cloudData.contrataciones);
        setSyncStatus("success");
        setSheetsActive(true);
      } catch (err) {
        console.error("Error sincronizando base de datos:", err);
        setSyncStatus("error");
      } finally {
        setIsSyncing(false);
        setTimeout(() => setSyncStatus("idle"), 3000);
      }
    }

    loadCloudData();
  }, []);

  // --- Handlers con persistencia en Google Sheets ---
  const handleAddCabin = async (newCabin: Cabana) => {
    // 1. Actualización optimista instantánea en UI
    setCabanas((prev) => [newCabin, ...prev]);
    
    // 2. Intentar guardar en la nube
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("cabanas", newCabin);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddClient = async (newClient: Cliente) => {
    setClientes((prev) => [newClient, ...prev]);
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("clientes", newClient);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddService = async (newService: Servicio) => {
    setServicios((prev) => [newService, ...prev]);
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("servicios", newService);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddBooking = async (newBooking: Reserva) => {
    setReservas((prev) => [newBooking, ...prev]);
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("reservas", newBooking);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddContratacion = async (newContract: ContratacionServicio) => {
    setContrataciones((prev) => [newContract, ...prev]);
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("contrataciones", newContract);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  // Stats summary helper object
  const statsSummary = {
    reservasCount: reservas.length,
    cabanasCount: cabanas.length,
    clientesCount: clientes.length,
    serviciosCount: servicios.length,
  };

  return (
    <div className="bg-[#121412] text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#4a634e]/40 font-body">
      {/* Background grain texture effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#2c2f2c_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none z-0"></div>

      {/* Top Main AppBar Header */}
      <header className="relative z-40 bg-[#1b1e1b] border-b-2 border-[#f6bb89] dark:border-amber-900/60 w-full flex items-center justify-between px-6 py-3 h-16 sticky top-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4a634e]/20 border border-[#b2ceb4]/40 flex items-center justify-center animate-pulse">
            <Trees className="w-4 h-4 text-[#b2ceb4]" />
          </div>
          <h1 className="font-sans text-xl font-bold tracking-tighter text-white italic uppercase flex items-center gap-1.5 selection:bg-transparent">
            <span>ENTRE NIEVES</span>
            {currentScreen !== "admin" && (
              <span className="hidden sm:flex items-center text-xs font-sans text-[#f6bb89]/80 uppercase not-italic tracking-widest pl-1 font-bold">
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600 inline mr-1" />
                {currentScreen.replace("-", " ")}
              </span>
            )}
          </h1>

          {/* Cloud Sync Status Badge */}
          <div className="ml-4 flex items-center gap-2">
            {!sheetsActive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-800 border border-neutral-700 text-neutral-400" title="La app funciona localmente usando LocalStorage. Para conectar a Google Sheets, configura .env.local">
                <CloudOff className="w-3 h-3 text-neutral-500" />
                <span className="hidden xs:inline">Base Local</span>
              </div>
            ) : syncStatus === "loading" ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-950/20 border border-amber-500/40 text-amber-300 animate-pulse" title="Sincronizando con Google Sheets...">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span className="hidden xs:inline">Sincronizando...</span>
              </div>
            ) : syncStatus === "error" ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-red-950/20 border border-red-500/40 text-red-300" title="Error de conexión con Google Sheets. Usando caché offline local.">
                <CloudOff className="w-3 h-3 text-red-400 animate-bounce" />
                <span className="hidden xs:inline">Error Nube</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-950/25 border border-emerald-500/30 text-emerald-300" title="Conexión en vivo con Google Sheets activa. Todos los datos están seguros en la nube.">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="hidden xs:inline">Nube Activa</span>
              </div>
            )}
          </div>
        </div>

        {/* Profiles navigation items */}
        <div className="flex items-center gap-4">
          {/* Support Indicator */}
          <button
            onClick={() => setCurrentScreen("guest")}
            className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-all font-sans font-semibold border border-neutral-800 rounded-full px-3 py-1 bg-neutral-900"
            title="Vista de Huéspedes"
          >
            <Shield className="w-3 h-3 text-[#b2ceb4]" />
            <span>Vista Huésped</span>
          </button>

          <button className="relative p-2 text-neutral-400 hover:text-white transition-colors duration-200">
            <Bell className="w-5 h-5 text-[#b2ceb4]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f6bb89] rounded-full"></span>
          </button>

          {/* User profile picture */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#4a634e]/50 flex items-center justify-center bg-neutral-900 shadow-inner">
              <img
                alt="Representative Profile Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW65zXPLOw1us9DzxBw-YDhmH15Mg8dhFrxPDERUKIVl2LyHVY8o55u6DkinnfqDQct44ttHkytebFQCMTfaFj1zTuQVOT1JKTdwd18Qd-l8Vz894VUmYBapF_Mr_L90WVywWl7BRN9WqZkc-p_NPCEwga4_4cbC5WvyscFDXKoCvf_9DXKRIGHvKn8PlhpKY0bb0RWe6qrvWVmyjr3ctVEg7vy21Tfen-hTtet-DzpWJBUDJaJsymO_mPFcMpjSLlUGWnYwgJivvF"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Render Layout */}
      <main className="relative z-10 flex-grow w-full max-w-container-max mx-auto px-6 py-8 pb-20">
        {currentScreen === "admin" && (
          <AdminLauncher
            onNavigate={(screen) => setCurrentScreen(screen)}
            onLogoutToGuest={() => setCurrentScreen("guest")}
            stats={statsSummary}
          />
        )}

        {currentScreen === "calendar" && (
          <CalendarView
            cabanas={cabanas}
            reservas={reservas}
            clientes={clientes}
            onBack={() => setCurrentScreen("admin")}
            onNavigate={(screen, cabinId, checkIn) => {
              if (cabinId) setPreselectedCabinId(cabinId);
              if (checkIn) setPreselectedCheckIn(checkIn);
              setCurrentScreen(screen);
            }}
          />
        )}

        {currentScreen === "dashboard" && (
          <Dashboard
            cabanas={cabanas}
            reservas={reservas}
            contrataciones={contrataciones}
            clientes={clientes}
            onBack={() => setCurrentScreen("admin")}
          />
        )}

        {currentScreen === "new-cabin" && (
          <CabinForm
            onSave={handleAddCabin}
            onBack={() => setCurrentScreen("admin")}
          />
        )}

        {currentScreen === "new-client" && (
          <ClientForm
            onSave={handleAddClient}
            onBack={() => setCurrentScreen("admin")}
          />
        )}

        {currentScreen === "new-service" && (
          <ServiceForm
            onSave={handleAddService}
            onBack={() => setCurrentScreen("admin")}
          />
        )}

        {currentScreen === "new-booking" && (
          <BookingForm
            cabanas={cabanas}
            clientes={clientes}
            onSave={handleAddBooking}
            onBack={() => {
              setPreselectedCabinId("");
              setPreselectedCheckIn("");
              setCurrentScreen("admin");
            }}
            initialCabanaId={preselectedCabinId}
            initialCheckIn={preselectedCheckIn}
          />
        )}

        {currentScreen === "contract-service" && (
          <ServiceContractForm
            clientes={clientes}
            servicios={servicios}
            reservas={reservas}
            onSave={handleAddContratacion}
            onBack={() => setCurrentScreen("admin")}
          />
        )}

        {currentScreen === "guest" && (
          <GuestView
            cabanas={cabanas}
            reservas={reservas}
            onBackToAdmin={() => setCurrentScreen("admin")}
          />
        )}
      </main>

      {/* Persistent global footer bar indicator */}
      {currentScreen !== "admin" && (
        <div className="fixed bottom-0 left-0 w-full bg-[#0d0f0d] p-4 border-t border-neutral-900/65 z-40 flex items-center justify-center">
          <button
            onClick={() => setCurrentScreen("admin")}
            className="px-6 py-2.5 bg-[#4a634e] text-white hover:brightness-110 font-sans font-bold text-xs rounded-lg uppercase tracking-wider transition-all"
          >
            Menú Principal Administración
          </button>
        </div>
      )}
    </div>
  );
}
