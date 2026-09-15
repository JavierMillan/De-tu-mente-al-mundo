/**
 * De tu mente al mundo — Receptor de leads de sistema.html
 * (Google Apps Script Web App)
 *
 * Hoja destino: "DTMM — Leads USA Web Acquisition", en la carpeta de Drive
 * de la constelación De Tu Mente al Mundo.
 *
 * INSTALACIÓN (con tu cuenta de Google):
 *
 * 1. Abre la hoja. Extensiones > Apps Script. Borra lo que haya y pega esto.
 *    Los encabezados se escriben solos la primera vez que llega un lead.
 * 2. Implementar > Administrar implementaciones > (lápiz) > Nueva versión.
 *      - Ejecutar como: Yo
 *      - Quién tiene acceso: Cualquier usuario   <- si dice "solo yo", da 403
 *    Editando la implementación existente, la URL NO cambia.
 * 3. Si creas una implementación nueva, copia la URL /exec y ponla en
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
  'Datos que pide', 'Criterio de buen cliente', 'Idioma', 'Origen'
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var d = JSON.parse(e.postData.contents);
    var hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Si la hoja está vacía, escribimos los encabezados solos.
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
      String(d.origen || 'sistema.html')
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
