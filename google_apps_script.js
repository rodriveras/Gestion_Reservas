/**
 * GOOGLE APPS SCRIPT API - DATABASE FOR "ENTRE NIEVES"
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. En tu Google Sheet, ve al menú superior y haz clic en "Extensiones" > "Apps Script".
 * 2. Borra cualquier código que aparezca en el editor (normalmente la función `myFunction`).
 * 3. Copia todo este código y pégalo en el editor.
 * 4. Haz clic en el botón de guardar (icono de disco) en la barra de herramientas.
 * 5. Selecciona la función `inicializarBaseDeDatos` en el menú desplegable y haz clic en "Ejecutar".
 *    - Te pedirá autorización: haz clic en "Revisar permisos", selecciona tu cuenta de Google,
 *      ve a "Configuración avanzada" (abajo) y haz clic en "Ir a Proyecto sin título (no seguro)"
 *      y finalmente en "Permitir". Esto creará automáticamente todas tus tablas e importará datos iniciales!
 * 6. Haz clic en el botón azul "Desplegar" (arriba a la derecha) > "Nuevo despliegue".
 * 7. En tipo de despliegue selecciona "Aplicación web" (icono de engranaje > Aplicación web).
 * 8. Configura las siguientes opciones EXACTAMENTE así:
 *    - Descripción: "API Entre Nieves v1"
 *    - Ejecutar como: "Yo (tu-email@gmail.com)"
 *    - Quién tiene acceso: "Cualquiera"
 * 9. Haz clic en "Desplegar". Copia la "URL de la aplicación web" que termina en `/exec`.
 * 10. Pega esa URL en tu archivo `.env.local` en tu proyecto local de la siguiente forma:
 *     VITE_GOOGLE_SHEETS_API_URL=https://script.google.com/macros/s/XXXXX/exec
 */

// Estructura de las tablas y sus columnas correspondientes
const TABLAS = {
  cabanas: ["id", "nombre", "tipo", "estado", "precioBase", "descripcion", "superficie", "habitaciones", "banos", "camas", "capacidad", "imagenUrl", "lat", "lng"],
  clientes: ["id", "tipoDocumento", "numeroDocumento", "nacionalidad", "ciudadOrigen", "nombre", "apellido", "email", "telefono", "fechaNacimiento", "estado", "redSocial", "redSocialUser", "notas", "fechaRegistro"],
  servicios: ["id", "nombre", "descripcion", "precio", "tipoCobro", "tipoPago", "estado"],
  reservas: ["id", "clienteId", "cabanaId", "fechaReserva", "checkIn", "checkOut", "noches", "cantidadPersonas", "canalVentas", "montoTotal", "montoAnticipo", "estadoReserva", "metodoPago"],
  contrataciones: ["id", "reservaId", "clienteId", "servicioId", "fecha", "precioPactado", "cantidad", "subtotal", "estadoPago", "medioPago"],
  administracion: ["id", "Nombre_complejo", "Usuario", "Contrasena", "Telefono", "Whatsapp"]
};

// Datos semilla iniciales para poblar la hoja de cálculo al inicializar
const SEED_DATA = {
  cabanas: [
    ["CAB-01", "Cabaña Roble", "Familiar", "Disponible", 240, "Un susurro entre las copas de los árboles. Experimente la serenidad total en esta cabaña de diseño vanguardista, rodeada de robles centenarios.", 85, 2, 2, 3, 4, "https://lh3.googleusercontent.com/aida-public/AB6AXuDxrtUAVIglEIWIisOMH9aOAzaquJaqu11dTxHKZGURkwzs3X5_LcklgoC2TjMHXVAdl-_WmllevrPJBNTlbpUdOElWd1wcKH6o_ZWdzPxb3EjdwATZr7NiJ9okTjq1_Aqw0IkZsDAASGI7pOYLBoCcSvbmJ_ycRJBbpK-5zGFaV-bC2mINxYave09_Fv8kufQVX7qLqCD9n2Ab3lBG0XqQszkyf4UfAkCApgijQGnCePNy2QLze7Y3wSi9arP9jkptXBUUNZZzxosd", -41.132, -71.305],
    ["CAB-02", "Refugio Niebla", "Suite", "Ocupada", 180, "Donde el tiempo se detiene al amanecer. Una cabaña íntima durante el crepúsculo con un hermoso exterior de nogal y acentos de piedra.", 55, 1, 1, 1, 2, "https://lh3.googleusercontent.com/aida-public/AB6AXuA6McmB_VhL1M27nNmsifaTZxXnHbPMJty58ET5MrUA_-JkCxhZpl6_73SZXA236pCxf7uvpB5CMczQNNqtdW0Em98xyG4Wlp7N8xKJZOAD2hDwjjdewGFEiT3D6McBKihUXgoFA2hRcPmUJyIyAjJ1e8pFYnZtkLj6O2j2aqoprHBb89Gxt4PhnDxuuvNGDv7czg_sX2Dhv_N-1gC9d1pLe6XokseNoT7kUW3ZpOYI227CMXPnWWkN7VG6bJlBsxfkgsLF4gxj9p98", -41.14, -71.312],
    ["CAB-03", "Mirador Alpino", "Domo", "Mantenimiento", 310, "Vistas infinitas hacia el corazón del bosque. Un gran domo de madera con terraza espaciosa con magníficas vistas al bosque de alta montaña.", 120, 3, 2, 5, 6, "https://lh3.googleusercontent.com/aida-public/AB6AXuCZKy2ZINx6LgZYBTsFFP6pxoKhuWZWIMBa53qDCJ-hlWBSjstitF8RFbj50SFnNU6ieRa9m2pR7-zq2XhXZsXWbC-4WSBauSTKfyCzVJlNq-A2GphjoOwwjOtD0YFCTz23aWnPTH5jmgiuiziko5hJtiEq4JF8Tcn8mGYMntANI8yohBtUR90A6vcPCVxLxEEeFraKkmlv4OpfbC4-P1I9m-plvj5dXlq6H7I4YVpRzEol0m24KW6vQ9K0HeWiobcjZxkTiAKWyUEB", -41.125, -71.298]
  ],
  clientes: [
    ["CLI-2024-AUTO", "DNI", "45.321.987", "Argentina", "Mendoza", "Juan", "Pérez", "juan.perez@email.com", "+54 9 11 1234-5678", "1988-06-15", "activo", "WhatsApp", "+5491112345678", "Huésped recurrente, prefiere almohadas extra suaves y café orgánico en la cabaña.", "2024-05-24"],
    ["CLI-77824", "Pasaporte", "AA345678", "Chile", "Santiago", "Evelyn", "Villarroel", "evelyn.v@email.com", "+56 9 8765-4321", "1994-11-20", "activo", "Instagram", "@evelyn_villa", "Viene por festejo de aniversario. Le gusta hacer senderismo en la mañana.", "2024-05-18"],
    ["CLI-77825", "Cédula", "19.876.543-2", "Chile", "Valparaíso", "Gerardo", "Sandoval", "g.sandoval@email.com", "+56 9 5555-1234", "1985-04-02", "activo", "WhatsApp", "+56955551234", "Trae un perro pastor alemán entrenado como asistencia. Alergias a la nuez.", "2024-05-19"],
    ["CLI-77826", "DNI", "23.456.789", "Argentina", "Neuquén", "Marioly", "Jara", "marioly.jara@email.com", "+54 299 432-1098", "1990-09-12", "activo", "Facebook", "marioly.jara", "Huésped ejecutiva. Requiere buena conexión WiFi para reuniones nocturnas.", "2024-05-20"]
  ],
  servicios: [
    ["01", "Tour de Senderismo Nocturno", "Explora los misterios del bosque bajo la luz de las estrellas con guía certificado de montaña.", 35, "Por persona", "Efectivo", "Activo"],
    ["02", "Desayuno de Campo en Cabaña", "Canasta con panes calientes recién horneados, quesos, mermeladas regionales, jugo y café.", 15, "Por persona", "Transferencia", "Activo"],
    ["03", "Sauna Finlandés & Tina Caliente", "Sesión privada de relajación de 2 horas en nuestro sauna de cedro con vistas a los pinos.", 60, "Pago único", "Tarjeta", "Activo"],
    ["08", "Lavandería Express", "Servicio de lavado, Secado y planchado express de prendas delicadas de aventura.", 10, "Pago único", "Efectivo", "Borrador"]
  ],
  reservas: [
    ["RES-77824", "CLI-77824", "CAB-01", "2024-05-18", "2024-06-12", "2024-06-15", 3, 3, "Directo", 720, 200, "Confirmada", "Transferencia"],
    ["RES-77825", "CLI-77825", "CAB-02", "2024-05-19", "2024-05-28", "2024-05-30", 2, 2, "Airbnb", 360, 360, "Confirmada", "Tarjeta"],
    ["RES-77826", "CLI-77826", "CAB-03", "2024-05-20", "2024-06-11", "2024-06-14", 3, 2, "Booking", 930, 400, "Confirmada", "Tarjeta"]
  ],
  contrataciones: [
    ["CON-01", "RES-77824", "CLI-77824", "01", "2024-06-13", 35, 3, 105, "Pagado", "Efectivo"],
    ["CON-02", "RES-77824", "CLI-77824", "02", "2024-06-12", 15, 3, 45, "Pendiente", "Transferencia"]
  ],
  administracion: [
    ["admin-config", "ENTRE NIEVES", "admin@entrenieves.com", "nieves2026", "+5491112345678", "5491112345678"]
  ]
};

/**
 * Función que crea las pestañas e introduce los datos iniciales semilla.
 * Debe ejecutarse una sola vez desde la interfaz de Apps Script antes de desplegar.
 */
function inicializarBaseDeDatos() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  
  for (let sheetName in TABLAS) {
    let sheet = ss.getSheetByName(sheetName);
    
    // Si la pestaña no existe, crearla
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Limpiar contenido previo para la inicialización correcta
    sheet.clear();
    
    // Escribir los encabezados en la fila 1
    let headers = TABLAS[sheetName];
    sheet.getRange(1, 1, 1, headers.length)
         .setValues([headers])
         .setFontWeight("bold")
         .setBackground("#d1e7dd"); // Color verde menta sutil para encabezados
         
    // Escribir los datos semilla si existen para esa tabla
    let rows = SEED_DATA[sheetName];
    if (rows && rows.length > 0) {
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    // Ajustar el ancho de las columnas automáticamente para legibilidad
    sheet.autoResizeColumns(1, headers.length);
  }
  
  Logger.log("Base de datos de 'Entre Nieves' inicializada con éxito con todas las tablas y datos semilla.");
}

/**
 * Endpoint GET: Devuelve toda la base de datos completa en una sola petición.
 */
function doGet(e) {
  try {
    let db = {};
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    
    for (let sheetName in TABLAS) {
      let sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        db[sheetName] = [];
        continue;
      }
      
      let rows = sheet.getDataRange().getValues();
      if (rows.length <= 1) {
        db[sheetName] = [];
        continue;
      }
      
      let headers = rows[0];
      let data = [];
      
      for (let i = 1; i < rows.length; i++) {
        let row = rows[i];
        let record = {};
        for (let j = 0; j < headers.length; j++) {
          let colName = headers[j];
          let val = row[j];
          
          // Formatear fechas como cadenas YYYY-MM-DD para compatibilidad
          if (val instanceof Date) {
            val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
          }
          record[colName] = val;
        }
        data.push(record);
      }
      
      db[sheetName] = data;
    }
    
    return ContentService.createTextOutput(JSON.stringify(db))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Endpoint POST: Procesa la creación o actualización (Upsert) de registros.
 */
function doPost(e) {
  try {
    let requestData = JSON.parse(e.postData.contents);
    let action = requestData.action;
    let sheetName = requestData.sheet;
    
    if (!TABLAS[sheetName]) {
      throw new Error("La pestaña especificada no es válida.");
    }
    
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error("La pestaña especificada no existe.");
    }
    
    if (action === "delete") {
      let itemId = requestData.id;
      if (!itemId) {
        throw new Error("Petición inválida de eliminación. Se requiere 'id'.");
      }
      
      let rows = sheet.getDataRange().getValues();
      let targetRowIndex = -1;
      
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === itemId.toString()) {
          targetRowIndex = i + 1; // 1-indexed para getRange/deleteRow
          break;
        }
      }
      
      if (targetRowIndex !== -1) {
        sheet.deleteRow(targetRowIndex);
        return ContentService.createTextOutput(JSON.stringify({ success: true, action: "delete", id: itemId }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Registro no encontrado" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else if (action === "upsert") {
      let itemData = requestData.data;
      if (!itemData || !itemData.id) {
        throw new Error("Petición inválida. Se requiere datos e 'id' para upsert.");
      }
      
      let headers = TABLAS[sheetName];
      let rows = sheet.getDataRange().getValues();
      
      // Mapear el objeto JSON a una fila en base al orden de las columnas/headers
      let newRowValues = headers.map(header => {
        let val = itemData[header];
        if (val === undefined || val === null) {
          return "";
        }
        return val;
      });
      
      let targetRowIndex = -1;
      
      // Buscar si existe un registro previo con el mismo ID
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0].toString() === itemData.id.toString()) {
          targetRowIndex = i + 1;
          break;
        }
      }
      
      if (targetRowIndex !== -1) {
        // ACTUALIZAR (Reemplazar la fila existente)
        sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([newRowValues]);
      } else {
        // CREAR (Añadir una nueva fila al final)
        sheet.appendRow(newRowValues);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, id: itemData.id }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error("Acción no soportada.");
    }
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
