import { Cabana, Cliente, Servicio, Reserva, ContratacionServicio, Administracion } from "../types";

const API_URL = (import.meta as any).env.VITE_GOOGLE_SHEETS_API_URL || "";

export interface DatabaseState {
  cabanas: Cabana[];
  clientes: Cliente[];
  servicios: Servicio[];
  reservas: Reserva[];
  contrataciones: ContratacionServicio[];
  administracion?: Administracion[];
}

/**
 * Verifica si la URL de la API de Google Sheets está configurada.
 */
export function isSheetsConfigured(): boolean {
  return API_URL.trim() !== "" && API_URL.startsWith("http");
}

/**
 * Servicio para interactuar con la base de datos de Google Sheets.
 * Incluye un fallback automático a localStorage en caso de error o de no estar configurada la URL.
 */
export const sheetsService = {
  /**
   * Obtiene el estado completo de la base de datos.
   * Si está configurada la API, intenta descargar los datos de Google Sheets.
   * Si falla o no está configurada, lee de LocalStorage.
   */
  async getDatabase(fallbackData: DatabaseState): Promise<DatabaseState> {
    if (!isSheetsConfigured()) {
      console.warn("Google Sheets API URL no configurada. Usando LocalStorage.");
      return this.getLocalCache(fallbackData);
    }

    try {
      // Append cache-busting timestamp to prevent aggressive browser caching of Apps Script responses
      const response = await fetch(`${API_URL}?_t=${Date.now()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      // Validar estructura básica del JSON recibido
      if (data && data.cabanas && data.clientes && data.servicios && data.reservas && data.contrataciones) {
        // Actualizar el caché de LocalStorage para futuras consultas rápidas o fallback offline
        this.saveToLocalCache(data);
        return data as DatabaseState;
      } else {
        throw new Error("Formato de respuesta incorrecto desde Google Sheets API");
      }
    } catch (error) {
      console.error("Error cargando datos de Google Sheets. Usando caché local:", error);
      return this.getLocalCache(fallbackData);
    }
  },

  /**
   * Guarda o actualiza un registro en la base de datos de Google Sheets.
   * También actualiza la copia en el caché local (LocalStorage).
   */
  async saveRecord(
    sheetName: keyof DatabaseState,
    record: Cabana | Cliente | Servicio | Reserva | ContratacionServicio
  ): Promise<boolean> {
    // 1. Guardar localmente primero para asegurar responsividad instantánea en la UI
    this.updateLocalRecord(sheetName, record);

    if (!isSheetsConfigured()) {
      return true; // Éxito local simulado
    }

    try {
      // Usar text/plain para evitar problemas de CORS preflight (OPTIONS) con Apps Script redirects
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          action: "upsert",
          sheet: sheetName,
          data: record,
        }),
      });

      if (!response.ok) throw new Error("Fallo en la petición de red");
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error(`Error guardando registro en Google Sheets (${sheetName}):`, error);
      return false;
    }
  },

  async deleteRecord(
    sheetName: keyof DatabaseState,
    recordId: string
  ): Promise<boolean> {
    // 1. Eliminar localmente primero
    try {
      const raw = localStorage.getItem(`entre_nieves_${sheetName}`);
      if (raw) {
        let list = JSON.parse(raw);
        list = list.filter((item: any) => item.id !== recordId);
        localStorage.setItem(`entre_nieves_${sheetName}`, JSON.stringify(list));
      }
    } catch (e) {
      console.error("Error eliminando registro local:", e);
    }

    if (!isSheetsConfigured()) {
      return true; // Éxito local simulado
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify({
          action: "delete",
          sheet: sheetName,
          id: recordId,
        }),
      });

      if (!response.ok) throw new Error("Fallo en la petición de red");
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error(`Error eliminando registro en Google Sheets (${sheetName}):`, error);
      return false;
    }
  },

  // --- Auxiliares de Local Cache ---

  getLocalCache(fallbackData: DatabaseState): DatabaseState {
    try {
      const cabanas = localStorage.getItem("entre_nieves_cabanas");
      const clientes = localStorage.getItem("entre_nieves_clientes");
      const servicios = localStorage.getItem("entre_nieves_servicios");
      const reservas = localStorage.getItem("entre_nieves_reservas");
      const contrataciones = localStorage.getItem("entre_nieves_contrataciones");
      const administracion = localStorage.getItem("entre_nieves_administracion");

      return {
        cabanas: cabanas ? JSON.parse(cabanas) : fallbackData.cabanas,
        clientes: clientes ? JSON.parse(clientes) : fallbackData.clientes,
        servicios: servicios ? JSON.parse(servicios) : fallbackData.servicios,
        reservas: reservas ? JSON.parse(reservas) : fallbackData.reservas,
        contrataciones: contrataciones ? JSON.parse(contrataciones) : fallbackData.contrataciones,
        administracion: administracion ? JSON.parse(administracion) : fallbackData.administracion,
      };
    } catch {
      return fallbackData;
    }
  },

  saveToLocalCache(data: DatabaseState) {
    try {
      localStorage.setItem("entre_nieves_cabanas", JSON.stringify(data.cabanas));
      localStorage.setItem("entre_nieves_clientes", JSON.stringify(data.clientes));
      localStorage.setItem("entre_nieves_servicios", JSON.stringify(data.servicios));
      localStorage.setItem("entre_nieves_reservas", JSON.stringify(data.reservas));
      localStorage.setItem("entre_nieves_contrataciones", JSON.stringify(data.contrataciones));
      if (data.administracion) {
        localStorage.setItem("entre_nieves_administracion", JSON.stringify(data.administracion));
      }
    } catch (e) {
      console.error("Error guardando en caché local:", e);
    }
  },

  updateLocalRecord(sheetName: keyof DatabaseState, record: any) {
    try {
      const raw = localStorage.getItem(`entre_nieves_${sheetName}`);
      let list = raw ? JSON.parse(raw) : [];
      
      // Buscar si el registro ya existe para actualizarlo, o agregarlo
      const index = list.findIndex((item: any) => item.id === record.id);
      if (index >= 0) {
        list[index] = record;
      } else {
        list.unshift(record); // Insertar al inicio
      }

      localStorage.setItem(`entre_nieves_${sheetName}`, JSON.stringify(list));
    } catch (e) {
      console.error("Error actualizando registro local:", e);
    }
  }
};
