/** DTMM receiver. The existing 10-minute trigger calls syncPendingToNotion. */
function syncPendingToNotion() {
  if (PropertiesService.getScriptProperties().getProperty('DTMM_SYNC_ENABLED') !== 'true') {
    console.log('Sincronización retenida hasta validar la captura en Sheets.'); return;
  }
  return syncDtmmLeads();
}
function enableDtmmSync() {
  validateDtmmSetup();
  PropertiesService.getScriptProperties().setProperty('DTMM_SYNC_ENABLED','true');
  console.log('Sync habilitada para capturas nuevas validadas.');
}

function dtmmNormalize_(values, headers) {
  const row = {};
  headers.forEach((h,i)=>row[String(h).trim()]=String(values[i]||'').trim());
  const pick = (...names)=>names.map(n=>row[n]).find(Boolean)||'';
  const process = pick('Proceso actual');
  const email = process.match(/(?:^|\n)Email:\s*([^\s]+@[^\s]+)/i);
  return Object.assign(row, {
    'Nombre':pick('Nombre'), 'WhatsApp':pick('WhatsApp','Teléfono').replace(/^'/,''),
    'Email':pick('Email')||(email?email[1]:''), 'Negocio':pick('Negocio'),
    'Cómo le llegan clientes':pick('Cómo le llegan clientes','Canal'),
    'Trabajo manual':pick('Trabajo manual','Tarea manual que le quita tiempo'),
    'Request':pick('Request','Proceso actual'),
    'Fit criteria':pick('Fit criteria','Criterio de buen cliente'),
    'Preguntas repetidas':pick('Preguntas repetidas','Datos que pide')
  });
}

function dtmmSafeCell_(value) {
  const text=String(value||'').trim();
  return /^[=+@-]/.test(text)?"'"+text:text;
}

function doPost(e) {
  const lock=LockService.getScriptLock(); let locked=false;
  try {
    const raw=e&&e.postData&&e.postData.contents;
    if (!raw || raw.length>80000) throw new Error('Solicitud vacía o demasiado grande.');
    const d=JSON.parse(raw);
    if (String(d.website||'').trim()) return ContentService.createTextOutput(JSON.stringify({ok:true,queued:false})).setMimeType(ContentService.MimeType.JSON);
    if (!d || typeof d!=='object' || Array.isArray(d)) throw new Error('Formato inválido.');
    const name=String(d.nombre||'').trim(), email=String(d.email||'').trim();
    if (!name || (!email && !d.tel)) throw new Error('Falta nombre o contacto.');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email inválido.');
    ['negocio','solicitudes','canal','volumen','datos','criterio'].forEach(k=> {
      if (!String(d[k]||'').trim()) throw new Error('Falta campo obligatorio: '+k);
    });
    lock.waitLock(10000); locked=true;
    const {sheet,cols}=dtmmSheet_();
    const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
    const recentCount=Math.min(1000,Math.max(0,sheet.getLastRow()-1));
    if (recentCount) {
      const recent=sheet.getRange(sheet.getLastRow()-recentCount+1,1,recentCount,sheet.getLastColumn()).getValues();
      const emailCol=cols['Email']-1, phoneCol=cols['WhatsApp']-1, dateCol=cols['Fecha']-1;
      const keyEmail=email.toLowerCase(), keyPhone=String(d.tel||'').replace(/\D/g,'');
      const isRecentDuplicate=recent.some(row=>{
        const date=row[dateCol] instanceof Date?row[dateCol].getTime():Date.parse(row[dateCol]);
        if (!Number.isFinite(date) || Date.now()-date>10*60*1000 || date>Date.now()+60*1000) return false;
        const rowEmail=String(row[emailCol]||'').trim().toLowerCase();
        const rowPhone=String(row[phoneCol]||'').replace(/\D/g,'');
        return (keyEmail && keyEmail===rowEmail) || (keyPhone && keyPhone===rowPhone);
      });
      if (isRecentDuplicate) return ContentService.createTextOutput(JSON.stringify({ok:true,queued:false,alreadyReceived:true})).setMimeType(ContentService.MimeType.JSON);
    }
    const source={
      'Fecha':new Date(), 'Nombre':name,'Email':email,'WhatsApp':d.tel||'',
      'Negocio':d.negocio||'', 'Giro':d.industria||d.giro||'',
      'Cómo le llegan clientes':d.canal||'', 'Request':d.solicitudes||d.request||'',
      'Trabajo manual':d.solicitudes||d.trabajo_manual||'',
      'Preguntas repetidas':d.datos||d.preguntas||'', 'Datos que pide':d.datos||'',
      'Fit criteria':d.criterio||'', 'Volumen semanal':d.volumen||'',
      'Idioma':d.idioma||'', 'Origen':d.origen||'sistema.html', 'Notion Sync':'Ready'
    };
    const row=headers.map(h=>h==='Fecha'?source[h]:dtmmSafeCell_(source[h]));
    sheet.appendRow(row); SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({ok:true,queued:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error('Recepción fallida: '+String(err.message).slice(0,160));
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:'No se pudo guardar. Usa WhatsApp o vuelve a intentar.'})).setMimeType(ContentService.MimeType.JSON);
  } finally { if(locked) lock.releaseLock(); }
}
