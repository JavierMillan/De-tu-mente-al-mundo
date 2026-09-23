/** DTMM USA: un proyecto, pestaña Prospecto, API 2025-09-03. */
const DTMM = Object.freeze({
  spreadsheet: '1Q-stvgP2eD2yXIgddfWk5oP1BbCX8_gH7h3srCO2UNQ',
  sheet: 'Prospecto',
  leads: '9b4d9ce1-7bd8-4667-8c56-c665821e519c',
  project: '3d792ae6-5536-81dc-b170-db5c4ecff806',
  campaign: '3d792ae6-5536-81fa-b50d-e09a2d8700d1',
  headers: ['Fecha','Nombre','WhatsApp','Email','Giro','Cómo le llegan clientes','Request','Fit criteria','Trabajo manual','Preguntas repetidas','Volumen semanal','Origen','Notion Sync','Notion Page ID','Notion Sync Error','Negocio','Idioma','Datos que pide']
});

function dtmmSheet_() {
  const sheet = SpreadsheetApp.openById(DTMM.spreadsheet).getSheetByName(DTMM.sheet);
  if (!sheet) throw new Error('No existe la pestaña ' + DTMM.sheet);
  const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0].map(x=>x.trim());
  DTMM.headers.forEach(h=> { if (!headers.includes(h)) { headers.push(h); sheet.getRange(1,headers.length).setValue(h); } });
  const cols = {};
  DTMM.headers.forEach(h=>{
    if (headers.filter(x=>x===h).length !== 1) throw new Error('Encabezado ausente o duplicado: '+h);
    cols[h] = headers.indexOf(h)+1;
  });
  return {sheet, cols};
}

/** Agrega columnas de control faltantes y verifica esquema y permisos. */
function validateDtmmSetup() {
  dtmmSheet_();
  const schema = dtmmNotion_('get','/data_sources/'+DTMM.leads).properties;
  const expected = {Lead:'title',Contact:'rich_text',Email:'email',Phone:'phone_number',Notes:'rich_text',Source:'select',Stage:'select',Project:'relation',Campaign:'relation'};
  Object.keys(expected).forEach(k=>{
    if (!schema[k] || schema[k].type !== expected[k]) throw new Error('Revisar propiedad Notion: '+k);
  });
  [['Stage','New'],['Source','Web']].forEach(([p,v])=>{
    if (!schema[p].select.options.some(o=>o.name===v)) throw new Error('Falta opción '+p+' = '+v);
  });
  [['Project',DTMM.project],['Campaign',DTMM.campaign]].forEach(([p,id])=>{
    const page = dtmmNotion_('get','/pages/'+id);
    if (page.archived || page.in_trash || page.parent.data_source_id !== schema[p].relation.data_source_id)
      throw new Error('Destino incorrecto/inaccesible para '+p);
  });
  console.log('Configuración válida. No se crearon leads.');
}

function installDtmmTrigger() {
  validateDtmmSetup();
  if (!ScriptApp.getProjectTriggers().some(t=>['syncDtmmLeads','syncPendingToNotion'].includes(t.getHandlerFunction())))
    ScriptApp.newTrigger('syncPendingToNotion').timeBased().everyMinutes(10).create();
  console.log('Trigger disponible: syncPendingToNotion cada 10 minutos.');
}

/** Recorre circularmente hasta 200 filas/30 pendientes por ejecución. */
function syncDtmmLeads() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    if (Date.now() < Number(props.getProperty('DTMM_RETRY_AFTER') || 0)) return;
    const {sheet,cols} = dtmmSheet_();
    const last = sheet.getLastRow();
    if (last < 2) return;
    const started = Date.now();
    let row = Number(props.getProperty('DTMM_CURSOR')) || 2;
    if (row < 2 || row > last) row = 2;
    let attempted = 0; let errors = 0;
    const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
    for (let scanned=0; scanned<Math.min(200,last-1) && attempted<30 && Date.now()-started<180000; scanned++) {
      const values = sheet.getRange(row,1,1,sheet.getLastColumn()).getDisplayValues()[0];
      const data = dtmmNormalize_(values,headers);
      if (data['Nombre'] || data['Email'] || data['WhatsApp']) {
        const status = data['Notion Sync'];
        if (!status) {
          sheet.getRange(row,cols['Notion Sync']).setValue('Hold');
          sheet.getRange(row,cols['Notion Sync Error']).setValue('Captura anterior al arreglo: revisar datos originales antes de autorizar Ready.');
        } else if (!['Skip','Hold'].includes(status) && (status!=='Yes' || !data['Notion Page ID'])) {
          attempted++;
          dtmmSyncRow_(sheet,cols,row,data);
          if (sheet.getRange(row,cols['Notion Sync']).getDisplayValue() !== 'Yes') errors++;
        }
      }
      row = row>=last ? 2 : row+1;
      props.setProperty('DTMM_CURSOR',String(row));
      if (Date.now()<Number(props.getProperty('DTMM_RETRY_AFTER')||0)) break;
    }
    console.log('Sync: '+attempted+' procesados; '+errors+' pendientes con error.');
    if (errors) throw new Error('Hay '+errors+' leads pendientes. Revisar Notion Sync Error en Prospecto.');
    props.setProperty('DTMM_LAST_SUCCESS',new Date().toISOString());
  } finally { lock.releaseLock(); }
}

function dtmmSyncRow_(sheet,cols,row,data) {
  const statusCell = sheet.getRange(row,cols['Notion Sync']);
  const errorCell = sheet.getRange(row,cols['Notion Sync Error']);
  let uncertain = ['Pending','Review','Yes'].includes(data['Notion Sync']);
  const finish = id=>{
    sheet.getRange(row,cols['Notion Page ID']).setValue(id);
    SpreadsheetApp.flush();
    statusCell.setValue('Yes');
    errorCell.clearContent();
  };
  try {
    if (data['Notion Page ID']) {
      const page=dtmmNotion_('get','/pages/'+data['Notion Page ID']);
      if (page.archived || page.in_trash || page.parent.data_source_id!==DTMM.leads) throw new Error('Page ID archivado o fuera de Leads; revisar manualmente.');
      finish(page.id);
      return;
    }
    let key=statusCell.getNote();
    if (!/^DTMM-USA:[0-9a-f-]{36}$/i.test(key)) {
      if (key || uncertain) throw new Error('Falta o es inválida la nota de identificación; revisar antes de reenviar.');
      key='DTMM-USA:'+Utilities.getUuid();
      statusCell.setNote(key);
      SpreadsheetApp.flush();
    }
    const found=dtmmNotion_('post','/data_sources/'+DTMM.leads+'/query',{
      filter:{property:'Notes',rich_text:{contains:key}},page_size:2
    });
    if (found.results.length>1) {
      uncertain=true;
      throw new Error('Más de un lead con la misma clave. Resolver duplicados manualmente.');
    }
    if (found.results.length===1) { finish(found.results[0].id); return; }
    if (uncertain) throw new Error('Resultado de creación incierto. Se seguirá buscando; no se recreará automáticamente.');
    const payload=dtmmPayload_(data,key);
    statusCell.setValue('Pending');
    errorCell.clearContent();
    SpreadsheetApp.flush();
    uncertain=true;
    let page;
    try { page=dtmmNotion_('post','/pages',payload); }
    catch(e) { if (e.definiteRejection) uncertain=false; throw e; }
    if (!page.id) throw new Error('Respuesta sin Page ID.');
    finish(page.id);
  } catch(e) {
    statusCell.setValue(uncertain?'Review':'Error');
    errorCell.setValue(new Date().toISOString()+' | '+String(e.message).slice(0,700));
  }
}

function dtmmPayload_(data,key) {
  if (!data['Nombre']) throw new Error('Falta Nombre.');
  if (!data['Email'] && !data['WhatsApp']) throw new Error('Falta Email o WhatsApp.');
  if (data['Email'] && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data['Email']) || data['Email'].length>200)) throw new Error('Email inválido.');
  if (data['WhatsApp'].length>200) throw new Error('WhatsApp supera 200 caracteres.');
  const notes=key+'\n\n'+DTMM.headers.filter(h=>!h.startsWith('Notion ')).map(h=>h+': '+(data[h]||'—')).join('\n\n');
  const origin=data['Origen']||'';
  const source=/[?&]utm_source=/.test(origin)?'Ads':(['Referral','WhatsApp','Instagram','Web','Ads','Outbound','Other'].find(s=>s.toLowerCase()===origin.toLowerCase())||'Web');
  const properties={
    Company:{rich_text:dtmmText_(data['Negocio']||'')}, Lead:{title:dtmmText_(data['Nombre'])}, Contact:{rich_text:dtmmText_(data['Nombre'])},
    Email:{email:data['Email']||null}, Phone:{phone_number:data['WhatsApp']||null},
    Stage:{select:{name:'New'}}, Source:{select:{name:source}},
    Project:{relation:[{id:DTMM.project}]}, Campaign:{relation:[{id:DTMM.campaign}]},
    Notes:{rich_text:dtmmText_(notes)}
  };
  const payload={parent:{type:'data_source_id',data_source_id:DTMM.leads},properties};
  if (Utilities.newBlob(JSON.stringify(payload)).getBytes().length>450000) throw new Error('Diagnóstico demasiado largo; reducir o dividir manualmente.');
  return payload;
}

function dtmmText_(value) {
  const chunks=[]; let chunk='';
  for (const char of value) {
    if (chunk.length+char.length>1900) { chunks.push({type:'text',text:{content:chunk}}); chunk=''; }
    chunk+=char;
  }
  if (chunk) chunks.push({type:'text',text:{content:chunk}});
  if (chunks.length>100) throw new Error('Texto supera el límite de Notion; no se truncó.');
  return chunks;
}

function dtmmNotion_(method,path,payload) {
  const props=PropertiesService.getScriptProperties();
  const token=props.getProperty('NOTION_TOKEN') || props.getProperty('NOTION_API_KEY');
  if (!token || !token.trim()) throw new Error('Falta NOTION_TOKEN en Script Properties.');
  if (Date.now()<Number(props.getProperty('DTMM_RETRY_AFTER')||0)) {
    const e=new Error('Notion solicita esperar antes del reintento.');
    e.definiteRejection=true; throw e;
  }
  Utilities.sleep(350);
  const options={method,contentType:'application/json',muteHttpExceptions:true,
    headers:{Authorization:'Bearer '+token.trim(),'Notion-Version':'2025-09-03'}};
  if (payload) options.payload=JSON.stringify(payload);
  let response;
  try { response=UrlFetchApp.fetch('https://api.notion.com/v1'+path,options); }
  catch (_) { throw new Error('Fallo de transporte al contactar Notion.'); }
  const status=response.getResponseCode();
  if (status>=200 && status<300) {
    try { return JSON.parse(response.getContentText()); }
    catch (_) { throw new Error('Respuesta de Notion ilegible.'); }
  }
  let code='request_failed';
  try { code=JSON.parse(response.getContentText()).code || code; } catch (_) {}
  if (status===429 || status===529) {
    const headers=response.getAllHeaders();
    const h=Object.keys(headers).find(k=>k.toLowerCase()==='retry-after');
    const seconds=Number(h?headers[h]:60);
    props.setProperty('DTMM_RETRY_AFTER',String(Date.now()+Math.max(60,Number.isFinite(seconds)?seconds:60)*1000));
  }
  const e=new Error('Notion HTTP '+status+' ('+String(code).replace(/[^a-z_]/g,'')+'). Revisar permisos, esquema o límites.');
  e.definiteRejection=[400,401,403,404,422,429].includes(status);
  throw e;
}
