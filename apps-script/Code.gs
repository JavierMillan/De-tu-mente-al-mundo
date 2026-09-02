/**
 * De tu mente al mundo — Receptor del diagnóstico de 7 preguntas
 * (Google Apps Script Web App)
 *
 * INSTALACIÓN (una sola vez, la haces tú con tu cuenta de Google):
 *
 * 1. Crea una Google Sheet nueva. Ponle de nombre "DTMM — Diagnósticos".
 *    En la fila 1 pon estos encabezados, en este orden exacto:
 *
 *    Fecha | Nombre | WhatsApp | Giro | Cómo le llegan clientes | Proceso actual |
 *    Trabajo manual | Preguntas repetidas | Volumen semanal | Horas/mes calculadas |
 *    Horas/año calculadas | Origen
 *
 * 2. En la Sheet: Extensiones > Apps Script. Borra lo que haya y pega este archivo.
 * 3. Implementar > Nueva implementación > tipo "Aplicación web":
 *      - Ejecutar como: Yo (tu cuenta)
 *      - Quién tiene acceso: Cualquier usuario
 *    Google te va a pedir autorizar. Acepta.
 * 4. Copia la URL que termina en /exec y pégala en scripts/sistema.js,
 *    en la constante APPS_SCRIPT_URL (arriba del todo).
 *
 * Mientras APPS_SCRIPT_URL esté vacío, la landing sigue funcionando igual:
 * solo manda el WhatsApp y no guarda nada. No se rompe nada.
 *
 * LockService evita que dos envíos al mismo tiempo se pisen la misma fila.
 */

var ENCABEZADOS = [
  'Fecha', 'Nombre', 'WhatsApp', 'Giro', 'Cómo le llegan clientes',
  'Proceso actual', 'Trabajo manual', 'Preguntas repetidas', 'Volumen semanal',
  'Horas/mes calculadas', 'Horas/año calculadas', 'Origen'
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
      d.tel ? "'" + String(d.tel) : '',
      String(d.giro || ''),
      String(d.canal || ''),
      String(d.proceso || ''),
      String(d.manual || ''),
      String(d.repetidas || ''),
      String(d.volumen || ''),
      String(d.horasMes || ''),
      String(d.horasAnio || ''),
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
        tel: '+52 622 142 4577',
        giro: 'Taquería con servicio a domicilio',
        canal: 'WhatsApp y anuncios de Facebook',
        proceso: 'Preguntan precio, mando el menú, escogen, confirmo dirección',
        manual: 'Copio y pego el menú, anoto en una libreta',
        repetidas: '¿Cuánto cuesta? ¿Hacen envíos? ¿A qué hora abren?',
        volumen: 'Unos 60 o 70 entre semana',
        horasMes: '25',
        horasAnio: '300',
        origen: 'prueba manual'
      })
    }
  };
  Logger.log(doPost(falso).getContent());
}
