/**
 * De tu mente al mundo — Receptor de leads de sistema.html + sync a Notion
 * (Google Apps Script Web App)
 *
 * Hoja destino: "DTMM — Diagnósticos del sistema", pestaña "Prospecto"
 * (única pestaña — "Leads — USA Web" queda obsoleta y se puede borrar).
 *
 * INSTALACIÓN (con tu cuenta de Google):
 *
 * 1. Abre la hoja "DTMM — Diagnósticos del sistema" → Extensiones → Apps
 *    Script. Borra TODO lo que haya ahí (el script viejo que está corriendo
 *    hoy no es este — por eso los leads llegan con columnas corridas) y
 *    pega este archivo completo.
 * 2. Project Settings (ícono de engrane) → Script Properties → añade:
 *      NOTION_API_KEY   = tu API key de la integración de Notion
 *      NOTION_DB_ID     = 9b4d9ce1-7bd8-4667-8c56-c665821e519c
 * 3. Menú Triggers (ícono de reloj) → Add Trigger:
 *      Función: syncPendingToNotion
 *      Fuente del evento: Basado en tiempo
 *      Tipo: Temporizador por minutos → cada 10 minutos
 *    (Esto reemplaza cualquier trigger viejo que hubiera — bórralo si existe.)
 * 4. Implementar > Administrar implementaciones > (lápiz) > Nueva versión.
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario   <- si dice "solo yo", da 403
 *    Editando la implementación existente, la URL NO cambia.
 * 5. Si creas una implementación nueva, copia la URL /exec y ponla en
 *    scripts/sistema.js (APPS_SCRIPT_URL).
 *
 * El teléfono se guarda con apóstrofo: sin él, Sheets lee "+52..." como
 * fórmula y escribe #ERROR! justo en el dato que sirve para contestar.
 *
 * LockService evita que dos envíos simultáneos se pisen la misma fila.
 */

var ENCABEZADOS = [
  'Fecha', 'Nombre', 'Email', 'Teléfono', 'Negocio', 'Giro',
  'Tarea manual que le quita tiempo', 'Canal', 'Volumen semanal',
  'Datos que pide', 'Criterio de buen cliente', 'Idioma', 'Origen',
  'Notion Page ID', 'Notion Sync', 'Notion Sync Error'
];

var HOJA_DESTINO = 'Prospecto';

function getHoja_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(HOJA_DESTINO) || ss.getActiveSheet();
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var d = JSON.parse(e.postData.contents);
    var hoja = getHoja_();

    if (hoja.getLastRow() === 0) {
      hoja.appendRow(ENCABEZADOS);
      hoja.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold');
      hoja.setFrozenRows(1);
    }

    hoja.appendRow([
      new Date(),
      String(d.nombre || ''),
      String(d.email || ''),
      // El teléfono entra como texto: Sheets lee "+52..." como fórmula.
      d.tel ? "'" + String(d.tel) : '',
      String(d.negocio || ''),
      String(d.industria || ''),
      String(d.solicitudes || ''),
      String(d.canal || ''),
      String(d.volumen || ''),
      String(d.datos || ''),
      String(d.criterio || ''),
      String(d.idioma || ''),
      String(d.origen || 'sistema.html'),
      '', // Notion Page ID — lo llena syncPendingToNotion
      '', // Notion Sync
      ''  // Notion Sync Error
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Corre cada 10 min (trigger de tiempo). Busca filas sin "Notion Sync" y
 * las empuja a la base Leads de Notion. La API key nunca toca el frontend.
 */
function syncPendingToNotion() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // otra ejecución ya está sincronizando

  try {
    var props = PropertiesService.getScriptProperties();
    var apiKey = props.getProperty('NOTION_API_KEY');
    var dbId = props.getProperty('NOTION_DB_ID');
    if (!apiKey || !dbId) {
      Logger.log('Faltan NOTION_API_KEY o NOTION_DB_ID en Script Properties.');
      return;
    }

    var hoja = getHoja_();
    var lastRow = hoja.getLastRow();
    if (lastRow < 2) return;

    var numCols = ENCABEZADOS.length;
    var rango = hoja.getRange(2, 1, lastRow - 1, numCols);
    var valores = rango.getValues();
    var colSync = ENCABEZADOS.indexOf('Notion Sync');       // 0-indexed
    var colPageId = ENCABEZADOS.indexOf('Notion Page ID');
    var colError = ENCABEZADOS.indexOf('Notion Sync Error');

    for (var i = 0; i < valores.length; i++) {
      var fila = valores[i];
      if (String(fila[colSync] || '').trim() === 'Yes') continue; // ya sincronizada

      var filaSheet = i + 2; // +2: encabezado + índice base 1
      var resultado = crearPaginaNotion_(apiKey, dbId, fila, filaSheet);

      if (resultado.ok) {
        hoja.getRange(filaSheet, colPageId + 1).setValue(resultado.pageId);
        hoja.getRange(filaSheet, colSync + 1).setValue('Yes');
        hoja.getRange(filaSheet, colError + 1).setValue('');
      } else {
        hoja.getRange(filaSheet, colError + 1).setValue(String(resultado.error).slice(0, 500));
      }
    }
  } finally {
    lock.releaseLock();
  }
}

function crearPaginaNotion_(apiKey, dbId, fila, filaSheet) {
  var fecha = fila[0], nombre = fila[1], email = fila[2], telefono = fila[3],
      negocio = fila[4], giro = fila[5], tarea = fila[6], canal = fila[7],
      volumen = fila[8], datos = fila[9], criterio = fila[10],
      idioma = fila[11], origen = fila[12];

  var titulo = String(nombre || negocio || ('Lead fila ' + filaSheet));
  var notas = [
    'Fecha: ' + fecha,
    'Nombre: ' + nombre,
    'Negocio: ' + negocio,
    'WhatsApp: ' + (telefono || '—'),
    'Email: ' + (email || '—'),
    'Giro: ' + giro,
    'Canal: ' + canal,
    'Tarea manual: ' + tarea,
    'Volumen semanal: ' + volumen,
    'Datos que pide: ' + datos,
    'Criterio de buen cliente: ' + criterio,
    'Idioma: ' + idioma,
    'Origen: ' + origen
  ].join('\n');

  var body = {
    parent: { data_source_id: dbId },
    properties: {
      'Lead': { title: [{ text: { content: titulo } }] },
      'Email': email ? { email: String(email) } : undefined,
      'Phone': telefono ? { phone_number: String(telefono) } : undefined,
      'Source': { select: { name: 'Web' } },
      'Stage': { select: { name: 'New' } },
      'Notes': { rich_text: [{ text: { content: notas.slice(0, 2000) } }] }
    }
  };
  // Notion rechaza propiedades con valor undefined; se limpian antes de enviar.
  Object.keys(body.properties).forEach(function (k) {
    if (body.properties[k] === undefined) delete body.properties[k];
  });

  var response = UrlFetchApp.fetch('https://api.notion.com/v1/pages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Notion-Version': '2022-06-28'
    },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  var status = response.getResponseCode();
  var json = JSON.parse(response.getContentText());

  if (status >= 200 && status < 300) {
    return { ok: true, pageId: json.id };
  }
  return { ok: false, error: (json && json.message) || ('HTTP ' + status) };
}

/** Prueba manual desde el editor: Ejecutar > testDoPost */
function testDoPost() {
  var falso = {
    postData: {
      contents: JSON.stringify({
        nombre: 'Prueba DTMM',
        email: 'prueba@ejemplo.com',
        tel: '+1 555 0100',
        negocio: 'Roofing company in Phoenix',
        industria: 'Roofing',
        solicitudes: 'Typing prospect details into a spreadsheet',
        canal: 'Google Ads y referidos',
        volumen: '30-60',
        datos: 'Zona, fecha, alcance',
        criterio: 'Presupuesto arriba de 5k',
        idioma: 'en',
        origen: 'prueba manual'
      })
    }
  };
  Logger.log(doPost(falso).getContent());
}
