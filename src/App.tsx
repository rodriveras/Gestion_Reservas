/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Trees, User, Bell, HelpCircle, Shield, Briefcase, ChevronRight, Cloud, CloudOff, RefreshCw, Calendar, Settings, Home, LogOut } from "lucide-react";

// Types and Seed lists
import {
  Cabana,
  Cliente,
  Servicio,
  Reserva,
  ContratacionServicio,
  Administracion,
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
import Login from "./components/Login";
import ConfigModal from "./components/ConfigModal";

export default function App() {
  // --- Persistent Local Database State Engine ---
  const [cabanas, setCabanas] = useState<Cabana[]>(() => {
    const saved = localStorage.getItem("entre_nieves_cabanas");
    let list = saved ? JSON.parse(saved) : INITIAL_CABANAS;
    // Clear mock cabin seeds
    if (list.some((c: any) => c.id === "CAB-01" || c.nombre === "Cabaña Roble")) {
      localStorage.removeItem("entre_nieves_cabanas");
      list = INITIAL_CABANAS;
    }
    return list;
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem("entre_nieves_clientes");
    let list = saved ? JSON.parse(saved) : INITIAL_CLIENTES;
    // Clear mock client seeds
    if (list.some((c: any) => c.id === "CLI-77824" || c.id === "CLI-2026-AUTO" || (c.fechaRegistro && c.fechaRegistro.startsWith("2024-")))) {
      localStorage.removeItem("entre_nieves_clientes");
      list = INITIAL_CLIENTES;
    }
    return list;
  });

  const [servicios, setServicios] = useState<Servicio[]>(() => {
    const saved = localStorage.getItem("entre_nieves_servicios");
    let list = saved ? JSON.parse(saved) : INITIAL_SERVICIOS;
    // Clear mock service seeds
    if (list.some((s: any) => s.id === "01" || s.nombre === "Tour de Senderismo Nocturno")) {
      localStorage.removeItem("entre_nieves_servicios");
      list = INITIAL_SERVICIOS;
    }
    return list;
  });

  const [reservas, setReservas] = useState<Reserva[]>(() => {
    const saved = localStorage.getItem("entre_nieves_reservas");
    let loaded: Reserva[] = saved ? JSON.parse(saved) : [];
    
    // Clear mock reservation seeds (only old 2024 mock datasets)
    if (loaded.some((r) => r.id === "RES-77824" || r.id === "RES-MOCK-01" || (r.checkIn && r.checkIn.startsWith("2024-")))) {
      localStorage.removeItem("entre_nieves_reservas");
      loaded = [];
    }
    
    // Ensure all INITIAL_RESERVAS (including mock days) are present in the list
    const merged = [...loaded];
    INITIAL_RESERVAS.forEach((mock) => {
      if (!merged.some((r) => r.id === mock.id)) {
        merged.push(mock);
      }
    });
    return merged;
  });

  const [contrataciones, setContrataciones] = useState<ContratacionServicio[]>(() => {
    const saved = localStorage.getItem("entre_nieves_contrataciones");
    let list = saved ? JSON.parse(saved) : INITIAL_CONTRATACIONES;
    // Clear mock contract seeds (only old 2024 mock datasets)
    if (list.some((c: any) => c.id === "CON-01" || (c.fecha && c.fecha.startsWith("2024-")))) {
      localStorage.removeItem("entre_nieves_contrataciones");
      list = INITIAL_CONTRATACIONES;
    }
    return list;
  });

  const [administracion, setAdministracion] = useState<Administracion[]>(() => {
    const saved = localStorage.getItem("entre_nieves_administracion");
    const parsed = saved ? JSON.parse(saved) : null;
    
    // Ensure all 6 fields are present in the administration state
    if (parsed && parsed.length > 0) {
      const config = parsed[0];
      return [{
        id: config.id || "admin-config",
        Nombre_complejo: config.Nombre_complejo || "Gestion Cabañas",
        Usuario: config.Usuario || "admin@entrenieves.com",
        Contrasena: config.Contrasena || "nieves2026",
        Telefono: String(config.Telefono || "+5491112345678"),
        Whatsapp: String(config.Whatsapp || "5491112345678")
      }];
    }
    
    return [{
      id: "admin-config",
      Nombre_complejo: "Gestion Cabañas",
      Usuario: "admin@entrenieves.com",
      Contrasena: "nieves2026",
      Telefono: "+5491112345678",
      Whatsapp: "5491112345678"
    }];
  });

  // --- Google Sheets Integration State Engine ---
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sheetsActive, setSheetsActive] = useState<boolean>(isSheetsConfigured());

  // Navigation Screen Name
  const [currentScreen, setCurrentScreen] = useState<string>("admin");
  const [lastScreen, setLastScreen] = useState<string>("admin");

  // Configuration UI States
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isConfigDropdownOpen, setIsConfigDropdownOpen] = useState<boolean>(false);
  const [preselectedCabinId, setPreselectedCabinId] = useState<string>("");
  const [preselectedCheckIn, setPreselectedCheckIn] = useState<string>("");
  const [viewBookingId, setViewBookingId] = useState<string>("");
  const [clientFormReturnTo, setClientFormReturnTo] = useState<string>("");

  // --- Authentication State Engine & URL Guest Bypass ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "guest") {
      return false; // No authentication required for Guest Catalog
    }
    return localStorage.getItem("pms_logged_in") === "true";
  });

  // Force guest catalog screen if ?view=guest query parameter is loaded
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "guest") {
      setCurrentScreen("guest");
    }
  }, []);

  // Navigation transition helper
  const navigateTo = (screen: string) => {
    if (["calendar", "dashboard", "admin"].includes(screen)) {
      setLastScreen(screen);
    }
    setCurrentScreen(screen);
  };

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

  useEffect(() => {
    localStorage.setItem("entre_nieves_administracion", JSON.stringify(administracion));
  }, [administracion]);

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
        administracion: [{
          id: "admin-config",
          Nombre_complejo: "Gestion Cabañas",
          Usuario: "admin@entrenieves.com",
          Contrasena: "nieves2026",
          Telefono: "+5491112345678",
          Whatsapp: "5491112345678"
        }]
      };

      try {
        const cloudData = await sheetsService.getDatabase(seedState);
        setCabanas(cloudData.cabanas);
        setClientes(cloudData.clientes);
        setServicios(cloudData.servicios);
        setReservas(cloudData.reservas);
        setContrataciones(cloudData.contrataciones);
        if (cloudData.administracion && cloudData.administracion.length > 0) {
          const config = cloudData.administracion[0] as any;
          setAdministracion([{
            id: config.id || "admin-config",
            Nombre_complejo: config.Nombre_complejo || config.ide || "CABAÑAS ENTRE NIEVES",
            Usuario: config.Usuario || "admin@entrenieves.com",
            Contrasena: config.Contrasena || "nieves2026",
            Telefono: String(config.Telefono || "+5491112345678"),
            Whatsapp: String(config.Whatsapp || "5491112345678")
          }]);
        }
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

  // --- Automatic Purge of Fictitious Mock Data (2024 seeds) ---
  useEffect(() => {
    // List of known mock IDs to delete permanently
    const mockCabanas = ["CAB-01", "CAB-02", "CAB-03"];
    const mockClientes = ["CLI-2024-AUTO", "CLI-77824", "CLI-77825", "CLI-77826"];
    const mockServicios = ["01", "02", "03", "08"];
    const mockReservas = ["RES-77824", "RES-77825", "RES-77826", "RES-MOCK-01"];
    const mockContrataciones = ["CON-01", "CON-02"];

    const hasMockData = 
      reservas.some(r => mockReservas.includes(r.id)) ||
      clientes.some(c => mockClientes.includes(c.id)) ||
      cabanas.some(cb => mockCabanas.includes(cb.id)) ||
      servicios.some(s => mockServicios.includes(s.id)) ||
      contrataciones.some(con => mockContrataciones.includes(con.id));

    if (!hasMockData) return;

    async function runPurge() {
      setIsSyncing(true);
      setSyncStatus("loading");

      // 1. Delete mock bookings
      for (const rId of mockReservas) {
        if (reservas.some(r => r.id === rId)) {
          await sheetsService.deleteRecord("reservas", rId);
        }
      }
      // 2. Delete mock service contracts
      for (const cId of mockContrataciones) {
        if (contrataciones.some(c => c.id === cId)) {
          await sheetsService.deleteRecord("contrataciones", cId);
        }
      }
      // 3. Delete mock clients
      for (const clId of mockClientes) {
        if (clientes.some(c => c.id === clId)) {
          await sheetsService.deleteRecord("clientes", clId);
        }
      }
      // 4. Delete mock cabins
      for (const cabId of mockCabanas) {
        if (cabanas.some(c => c.id === cabId)) {
          await sheetsService.deleteRecord("cabanas", cabId);
        }
      }
      // 5. Delete mock services
      for (const sId of mockServicios) {
        if (servicios.some(s => s.id === sId)) {
          await sheetsService.deleteRecord("servicios", sId);
        }
      }

      // Update local state to remove the mock records immediately
      setReservas(prev => prev.filter(r => !mockReservas.includes(r.id)));
      setContrataciones(prev => prev.filter(c => !mockContrataciones.includes(c.id)));
      setClientes(prev => prev.filter(c => !mockClientes.includes(c.id)));
      setCabanas(prev => prev.filter(c => !mockCabanas.includes(c.id)));
      setServicios(prev => prev.filter(s => !mockServicios.includes(s.id)));

      setSyncStatus("success");
      setIsSyncing(false);
      alert("¡Se ha realizado una limpieza definitiva de datos ficticios de prueba en el sistema!");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }

    runPurge();
  }, [reservas, clientes, cabanas, servicios, contrataciones]);

  // --- Handlers con persistencia en Google Sheets ---
  const handleAddCabin = async (newCabin: Cabana) => {
    // 1. Actualización optimista instantánea en UI
    setCabanas((prev) => {
      const exists = prev.some((c) => c.id === newCabin.id);
      if (exists) {
        return prev.map((c) => (c.id === newCabin.id ? newCabin : c));
      }
      return [newCabin, ...prev];
    });
    
    // 2. Intentar guardar en la nube
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("cabanas", newCabin);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddClient = async (newClient: Cliente) => {
    setClientes((prev) => {
      const exists = prev.some((c) => c.id === newClient.id);
      if (exists) {
        return prev.map((c) => (c.id === newClient.id ? newClient : c));
      }
      return [newClient, ...prev];
    });
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("clientes", newClient);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddService = async (newService: Servicio) => {
    setServicios((prev) => {
      const exists = prev.some((s) => s.id === newService.id);
      if (exists) {
        return prev.map((s) => (s.id === newService.id ? newService : s));
      }
      return [newService, ...prev];
    });
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("servicios", newService);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleAddBooking = async (newBooking: Reserva) => {
    setReservas((prev) => {
      const exists = prev.some((r) => r.id === newBooking.id);
      if (exists) {
        return prev.map((r) => (r.id === newBooking.id ? newBooking : r));
      }
      return [newBooking, ...prev];
    });
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("reservas", newBooking);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setReservas((prev) => prev.filter((r) => r.id !== bookingId));
    
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.deleteRecord("reservas", bookingId);
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

  const handleSaveConfig = async (newConfig: Administracion) => {
    // 1. Actualización optimista local
    setAdministracion([newConfig]);
    
    // 2. Intentar guardar en la nube
    setIsSyncing(true);
    setSyncStatus("loading");
    const success = await sheetsService.saveRecord("administracion", newConfig);
    setSyncStatus(success ? "success" : "error");
    setIsSyncing(false);
    setTimeout(() => setSyncStatus("idle"), 3000);
  };

  // Stats summary helper object
  const statsSummary = {
    reservasCount: reservas.filter((r) => r.estadoReserva !== "Cancelada").length,
    cabanasCount: cabanas.length,
    clientesCount: clientes.length,
    serviciosCount: servicios.length,
  };

  if (!isAuthenticated && currentScreen !== "guest") {
    const sheetsAdminUser = administracion[0]?.Usuario || "admin@entrenieves.com";
    const sheetsAdminPass = administracion[0]?.Contrasena || "nieves2026";
    const sheetsComplexName = administracion[0]?.Nombre_complejo || "Entre Nieves";

    return (
      <Login
        expectedUser={sheetsAdminUser}
        expectedPassword={sheetsAdminPass}
        complexName={sheetsComplexName}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          navigateTo("admin");
        }}
      />
    );
  }

  return (
    <div className="bg-[#121412] text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#4a634e]/40 font-body">
      {/* Background grain texture effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#2c2f2c_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none z-0"></div>

      {/* Top Main AppBar Header */}
      {currentScreen !== "guest" && (
        <header className="relative z-40 bg-[#1b1e1b] border-b-2 border-[#f6bb89] dark:border-amber-900/60 w-full flex items-center justify-between px-6 py-3 h-16 sticky top-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4a634e]/20 border border-[#b2ceb4]/40 flex items-center justify-center animate-pulse">
              <Trees className="w-4 h-4 text-[#b2ceb4]" />
            </div>
            <h1 className="font-sans text-base sm:text-lg font-bold tracking-tighter text-white italic uppercase flex items-center gap-1.5 selection:bg-transparent">
              <span>Gestion Cabañas</span>
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
      )}

      {/* Main Content Render Layout */}
      <main className="relative z-10 flex-grow w-full max-w-container-max mx-auto px-6 py-8 pb-20">
        {currentScreen === "admin" && (
          <AdminLauncher
            onNavigate={(screen) => navigateTo(screen)}
            stats={statsSummary}
            complexName={administracion[0]?.Nombre_complejo || "Gestion Cabañas"}
          />
        )}



        {currentScreen === "calendar" && (
          <CalendarView
            cabanas={cabanas}
            reservas={reservas}
            clientes={clientes}
            servicios={servicios}
            contrataciones={contrataciones}
            onBack={() => navigateTo("admin")}
            onNavigate={(screen, cabinId, checkIn, viewBookingId) => {
              if (cabinId) setPreselectedCabinId(cabinId);
              if (checkIn) setPreselectedCheckIn(checkIn);
              if (viewBookingId) setViewBookingId(viewBookingId);
              navigateTo(screen);
            }}
            onSaveBooking={handleAddBooking}
            onSaveContratacion={handleAddContratacion}
          />
        )}

        {currentScreen === "dashboard" && (
          <Dashboard
            cabanas={cabanas}
            reservas={reservas}
            contrataciones={contrataciones}
            clientes={clientes}
            onBack={() => navigateTo("admin")}
          />
        )}

        {currentScreen === "new-cabin" && (
          <CabinForm
            cabanas={cabanas}
            onSave={handleAddCabin}
            onBack={() => navigateTo(lastScreen)}
          />
        )}

        {currentScreen === "new-client" && (
          <ClientForm
            clientes={clientes}
            onSave={(newClient) => {
              handleAddClient(newClient);
              if (clientFormReturnTo) {
                const returnTo = clientFormReturnTo;
                setClientFormReturnTo("");
                navigateTo(returnTo);
              } else {
                navigateTo(lastScreen);
              }
            }}
            onBack={() => {
              if (clientFormReturnTo) {
                const returnTo = clientFormReturnTo;
                setClientFormReturnTo("");
                navigateTo(returnTo);
              } else {
                navigateTo(lastScreen);
              }
            }}
          />
        )}

        {currentScreen === "new-service" && (
          <ServiceForm
            servicios={servicios}
            onSave={handleAddService}
            onBack={() => navigateTo(lastScreen)}
          />
        )}

        {currentScreen === "new-booking" && (
          <BookingForm
            cabanas={cabanas}
            clientes={clientes}
            reservas={reservas}
            onSave={handleAddBooking}
            onDelete={handleDeleteBooking}
            onBack={() => {
              const returnTo = lastScreen;
              setPreselectedCabinId("");
              setPreselectedCheckIn("");
              setViewBookingId("");
              navigateTo(returnTo);
            }}
            onCreateClient={(cabanaId, checkIn) => {
              if (cabanaId) setPreselectedCabinId(cabanaId);
              if (checkIn) setPreselectedCheckIn(checkIn);
              setClientFormReturnTo("new-booking");
              navigateTo("new-client");
            }}
            initialCabanaId={preselectedCabinId}
            initialCheckIn={preselectedCheckIn}
            viewBookingId={viewBookingId}
          />
        )}

        {currentScreen === "contract-service" && (
          <ServiceContractForm
            clientes={clientes}
            servicios={servicios}
            reservas={reservas}
            cabanas={cabanas}
            onSave={handleAddContratacion}
            onBack={() => navigateTo(lastScreen)}
          />
        )}

        {currentScreen === "guest" && (
          <GuestView
            cabanas={cabanas}
            reservas={reservas}
            isAdminLoggedIn={isAuthenticated && new URLSearchParams(window.location.search).get("view") !== "guest"}
            onBackToAdmin={() => {
              window.history.replaceState({}, document.title, window.location.pathname);
              navigateTo("admin");
            }}
            complexConfig={administracion[0]}
          />
        )}
      </main>



      {/* Persistent Bottom Navigation Bar for Admin Primary Screens */}
      {(["calendar", "dashboard", "admin"].includes(currentScreen) || (currentScreen === "guest" && isAuthenticated)) ? (
        <div className="fixed bottom-0 left-0 w-full bg-[#1b1e1b] border-t border-neutral-900/80 px-2 py-1.5 z-40 flex items-center justify-around shadow-2xl h-16 pb-safe">
          
          {/* Tab 1: Menú Principal */}
          <button
            onClick={() => {
              setIsConfigDropdownOpen(false);
              navigateTo("admin");
            }}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all cursor-pointer ${
              currentScreen === "admin" ? "text-[#b2ceb4] scale-105 font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
            title="Menú Principal"
          >
            <Home className="w-5 h-5" />
            <span className="text-[8px] font-sans uppercase tracking-wider font-extrabold">INICIO</span>
          </button>

          {/* Tab 2: Vista Huésped */}
          <button
            onClick={() => {
              setIsConfigDropdownOpen(false);
              navigateTo("guest");
            }}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all cursor-pointer ${
              currentScreen === "guest" ? "text-[#b2ceb4] scale-105 font-bold" : "text-neutral-500 hover:text-neutral-300"
            }`}
            title="Ver Catálogo Huésped"
          >
            <User className="w-5 h-5" />
            <span className="text-[8px] font-sans uppercase tracking-wider font-extrabold">HUÉSPED</span>
          </button>

          {/* Tab 3: Configuración (Toggles popover) */}
          <div className="relative flex flex-col items-center justify-center h-full">
            <button
              onClick={() => setIsConfigDropdownOpen(!isConfigDropdownOpen)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all cursor-pointer ${
                isConfigDropdownOpen ? "text-[#f6bb89] scale-105 font-bold" : "text-neutral-500 hover:text-neutral-300"
              }`}
              title="Configuración global de recursos"
            >
              <Settings className={`w-5 h-5 transition-transform duration-300 ${isConfigDropdownOpen ? "rotate-45" : ""}`} />
              <span className="text-[8px] font-sans uppercase tracking-wider font-extrabold">AJUSTES</span>
            </button>

            {isConfigDropdownOpen && (
              <>
                {/* Invisible click-away backdrop */}
                <div
                  onClick={() => setIsConfigDropdownOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent cursor-default"
                />
                
                <div className="absolute bottom-18 left-1/2 -translate-x-1/2 w-56 bg-[#161916]/95 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <div className="px-3.5 py-2 border-b border-neutral-900 mb-1">
                    <span className="text-[9px] font-sans font-bold text-neutral-500 uppercase tracking-widest block text-center">
                      Configuraciones
                    </span>
                  </div>
                  
                  {/* Nueva Cabaña */}
                  <button
                    onClick={() => {
                      setIsConfigDropdownOpen(false);
                      navigateTo("new-cabin");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#252925] text-neutral-300 hover:text-white transition-all text-xs font-sans font-semibold cursor-pointer text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#4a634e]/20 text-[#b2ceb4] flex items-center justify-center">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    Nueva Cabaña
                  </button>
                  
                  {/* Nuevo Servicio */}
                  <button
                    onClick={() => {
                      setIsConfigDropdownOpen(false);
                      navigateTo("new-service");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#252925] text-neutral-300 hover:text-white transition-all text-xs font-sans font-semibold cursor-pointer text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#4a634e]/20 text-[#b2ceb4] flex items-center justify-center">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    Nuevo Servicio
                  </button>
                  
                  {/* Configurar Complejo */}
                  <button
                    onClick={() => {
                      setIsConfigDropdownOpen(false);
                      setIsConfigOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#252925] text-neutral-300 hover:text-white transition-all text-xs font-sans font-semibold cursor-pointer text-left"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#4a634e]/20 text-[#f6bb89] flex items-center justify-center">
                      <Trees className="w-3.5 h-3.5" />
                    </div>
                    Configurar Complejo
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tab 4: Cerrar Sesión */}
          <button
            onClick={() => {
              setIsConfigDropdownOpen(false);
              localStorage.removeItem("pms_logged_in");
              setIsAuthenticated(false);
              navigateTo("admin");
            }}
            className="flex flex-col items-center justify-center gap-1 w-16 h-full transition-all cursor-pointer text-red-400/80 hover:text-red-300"
            title="Cerrar Sesión de Administrador"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[8px] font-sans uppercase tracking-wider font-extrabold">SALIR</span>
          </button>

        </div>
      ) : (
        /* Form editing back button footer fallback for mobile safety */
        currentScreen !== "guest" && (
          <div className="fixed bottom-0 left-0 w-full bg-[#0d0f0d]/95 p-3.5 border-t border-neutral-900/65 z-40 flex items-center justify-center">
            <button
              onClick={() => navigateTo(lastScreen)}
              className="px-6 py-2 bg-gradient-to-r from-neutral-850 to-neutral-900 text-neutral-300 border border-neutral-800 hover:text-white hover:border-neutral-700 font-sans font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Volver al Panel
            </button>
          </div>
        )
      )}

      {/* Global ConfigModal root integration */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={administracion[0]}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
