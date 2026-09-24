const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const source=fs.readFileSync(__dirname+'/../apps-script/receiver.gs','utf8')+'\n'+fs.readFileSync(__dirname+'/../apps-script/bridge.gs','utf8');
function env() {
  const values=[['Fecha','Nombre','WhatsApp','Giro','Cómo le llegan clientes','Proceso actual','Trabajo manual','Preguntas repetidas','Volumen semanal','Horas/mes calculadas','Horas/año calculadas','Origen'],['old','Histórico','+525550001111','Limpieza','Web','Legacy','Manual','Precio','10','16','192','sistema.html']];
  const notes={};const props={NOTION_TOKEN:'test-only',DTMM_SYNC_ENABLED:'true'};const pages=[];const checklists=[];const DTMM_CHECKLISTS='7750485e-d6e6-4d3d-b6c8-3786c0ea41ea';let requests=0;let mode='ok';
  const range=(r,c,n=1,m=1)=>({getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>values[r+i-1]?.[c+j-1]??'')),getDisplayValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>String(values[r+i-1]?.[c+j-1]??''))),getDisplayValue:()=>String(values[r-1]?.[c-1]??''),setValue:v=>{values[r-1]??=[];values[r-1][c-1]=v;},clearContent:()=>{values[r-1][c-1]='';},getNote:()=>notes[r+','+c]||'',setNote:v=>notes[r+','+c]=v});
  const sheet={getLastColumn:()=>values[0].length,getLastRow:()=>values.length,getRange:range,appendRow:r=>values.push(r)};
  const ctx={console,Date,Number,JSON,Error,
    SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}},
    LockService:{getScriptLock:()=>({tryLock:()=>true,waitLock:()=>{},releaseLock:()=>{}})},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v})},
    Utilities:{getUuid:()=>require('node:crypto').randomUUID(),sleep:()=>{},newBlob:s=>({getBytes:()=>Buffer.from(s)})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})},
    UrlFetchApp:{fetch:(url,opts)=>{
      requests++;
      const payload=opts.payload&&JSON.parse(opts.payload);
      let data;
      if (url.endsWith('/query')) {
        const isChecklist=url.includes('/'+DTMM_CHECKLISTS+'/');
        const collection=isChecklist?checklists:pages;
        data={results:collection.filter(p=>isChecklist
          ?p.properties.Lead.relation.some(x=>x.id===payload.filter.relation.contains)
          :payload.filter.rich_text
            ?p.properties.Notes.rich_text.map(x=>x.text.content).join('').includes(payload.filter.rich_text.contains)
            :p.properties.Campaign.relation.some(x=>x.id===payload.filter.relation.contains)),has_more:false};
      } else if (url.endsWith('/pages')) {
        if(mode==='429')return {getResponseCode:()=>429,getContentText:()=>'{"code":"rate_limited"}',getAllHeaders:()=>({'Retry-After':'60'})};
        const collection=payload.parent.data_source_id===DTMM_CHECKLISTS?checklists:pages;
        const p={...payload,id:'page-'+(pages.length+checklists.length+1),created_time:new Date().toISOString()};
        collection.push(p);
        if(mode==='lost-response')throw Error('network');
        data=p;
      } else if(url.includes('/data_sources/')) {
        data={properties:{Checklist:{type:'title'},Lead:{type:'relation',relation:{data_source_id:'9b4d9ce1-7bd8-4667-8c56-c665821e519c'}}}};
      } else {
        data=[...pages,...checklists].find(p=>url.endsWith('/'+p.id));
        if(opts.method==='patch') Object.assign(data.properties,payload.properties);
      }
      return {getResponseCode:()=>200,getContentText:()=>JSON.stringify(data),getAllHeaders:()=>({})};
    }}
  };
  vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,values,props,pages,checklists,range,requests:()=>requests,setMode:v=>mode=v};
}
const payload={nombre:'QA DTMM',email:'qa@example.com',tel:'+525550002222',negocio:'Negocio de prueba',industria:'Cleaning',solicitudes:'Cotizar',canal:'Google',volumen:'10–30',datos:'Zona y fecha',criterio:'Dentro de zona',idioma:'es',origen:'sistema.html?lang=es'};
function post(e){return e.ctx.doPost({postData:{contents:JSON.stringify(payload)}});}
function cell(e,row,name){return e.values[row][e.values[0].indexOf(name)];}
test('old columns stay intact; all new answers land under their headers',()=>{const e=env();const old=JSON.stringify(e.values);assert.equal(post(e).ok,true);assert.equal(JSON.stringify(e.values.slice(0,2).map(r=>r.slice(0,12))),old);for(const [h,v] of Object.entries({'Nombre':payload.nombre,'Email':payload.email,'Negocio':payload.negocio,'Giro':payload.industria,'Trabajo manual':payload.solicitudes,'Cómo le llegan clientes':payload.canal,'Volumen semanal':payload.volumen,'Datos que pide':payload.datos,'Fit criteria':payload.criterio,'Idioma':'es','Origen':payload.origen,'Notion Sync':'Ready'}))assert.equal(cell(e,2,h),v,h);assert.equal(cell(e,2,'WhatsApp'),"'"+payload.tel);});
test('required missing data rejects reception rather than saving garbage',()=>{const e=env();assert.equal(e.ctx.doPost({postData:{contents:JSON.stringify({nombre:'QA',email:'qa@example.com'})}}).ok,false);assert.equal(e.values.length,2);});
test('honeypot and rapid repeat do not append another Sheet row',()=>{
  const e=env();
  assert.equal(e.ctx.doPost({postData:{contents:JSON.stringify({...payload,website:'https://spam.example'})}}).queued,false);
  assert.equal(e.values.length,2);
  assert.equal(post(e).queued,true);
  assert.equal(post(e).alreadyReceived,true);
  assert.equal(e.values.length,3);
});
test('a later submission from the same contact updates one Notion lead and keeps both answers',()=>{
  const e=env();
  post(e);e.ctx.syncPendingToNotion();
  e.values[2][e.values[0].indexOf('Fecha')]=new Date(Date.now()-11*60*1000);
  const result=e.ctx.doPost({postData:{contents:JSON.stringify({...payload,tel:'525550002222',negocio:'Segundo negocio'})}});
  assert.equal(result.queued,true);
  e.ctx.syncPendingToNotion();
  assert.equal(e.pages.length,1);
  assert.equal(e.checklists.length,1);
  assert.equal(cell(e,3,'Notion Page ID'),cell(e,2,'Notion Page ID'));
  const notes=e.pages[0].properties.Notes.rich_text.map(x=>x.text.content).join('');
  assert.match(notes,/Negocio de prueba/);
  assert.match(notes,/Segundo negocio/);
});
test('sync holds historical rows and creates new complete lead with campaign/project',()=>{const e=env();post(e);e.ctx.syncPendingToNotion();assert.equal(cell(e,1,'Notion Sync'),'Hold');assert.equal(e.pages.length,1);assert.equal(cell(e,2,'Notion Sync'),'Yes');assert.equal(e.pages[0].properties.Email.email,payload.email);assert.equal(e.pages[0].properties.Phone.phone_number,payload.tel);assert.equal(e.pages[0].properties.Stage.select.name,'New');assert.ok(e.pages[0].properties.Campaign.relation[0].id);assert.ok(e.pages[0].properties.Project.relation[0].id);e.ctx.syncPendingToNotion();assert.equal(e.pages.length,1);});
test('lost Notion response is recovered by stable key without second creation',()=>{const e=env();post(e);e.setMode('lost-response');assert.throws(()=>e.ctx.syncPendingToNotion(),/pendientes/);assert.equal(e.pages.length,1);assert.equal(cell(e,2,'Notion Sync'),'Review');e.setMode('ok');e.ctx.syncPendingToNotion();assert.equal(e.pages.length,1);assert.equal(cell(e,2,'Notion Sync'),'Yes');});
test('rate limit keeps row and backs off instead of losing it',()=>{const e=env();post(e);e.setMode('429');assert.throws(()=>e.ctx.syncPendingToNotion(),/pendientes/);assert.equal(cell(e,2,'Notion Sync'),'Error');assert.equal(e.pages.length,0);assert.ok(Number(e.props.DTMM_RETRY_AFTER)>Date.now());const before=e.requests();e.ctx.syncPendingToNotion();assert.equal(e.requests(),before);});
test('disabled gate prevents sync while receipt is under verification',()=>{const e=env();post(e);delete e.props.DTMM_SYNC_ENABLED;e.ctx.syncPendingToNotion();assert.equal(e.pages.length,0);assert.equal(cell(e,2,'Notion Sync'),'Ready');});
test('formula payloads stored as literal text',()=>{const e=env();assert.equal(e.ctx.dtmmSafeCell_('=IMPORTXML("x")'),'\'=IMPORTXML("x")');});
test('ad traffic (utm_source) lands in Notion as Source=Ads',()=>{const e=env();e.ctx.doPost({postData:{contents:JSON.stringify({...payload,origen:'sistema.html?lang=en&utm_source=meta&utm_campaign=us'})}});e.ctx.syncPendingToNotion();assert.equal(e.pages[0].properties.Source.select.name,'Ads');});
test('organic traffic stays Source=Web',()=>{const e=env();post(e);e.ctx.syncPendingToNotion();assert.equal(e.pages[0].properties.Source.select.name,'Web');});
test('reset leaves exactly the clean headers and every answer lands under one of them',()=>{const e=env();const calls=[];const sheet=e.ctx.SpreadsheetApp.openById().getSheetByName();sheet.clear=()=>{e.values.length=0;e.values.push([]);};sheet.clearNotes=()=>{};sheet.getMaxColumns=()=>21;sheet.deleteColumns=(a,n)=>calls.push([a,n]);sheet.setFrozenRows=()=>{};const base=e.range;sheet.getRange=(r,c,n,m)=>Object.assign(base(r,c,n,m),{setValues:v=>{e.values[r-1]=v[0].slice();return {setFontWeight:()=>{}};}});e.ctx.SpreadsheetApp.openById=()=>({getSheetByName:n=>n==='Prospecto'?sheet:{name:n},deleteSheet:x=>calls.push(['del',x.name])});e.ctx.resetDtmmSheet();assert.deepEqual(calls,[['del','Leads — USA Web'],[17,5]]);assert.equal(e.values.length,1);post(e);const row=e.values[1];assert.equal(row.length,16);for(const h of ['Nombre','Email','WhatsApp','Negocio','Giro','Cómo le llegan clientes','Trabajo manual','Volumen semanal','Datos que pide','Fit criteria','Idioma','Origen'])assert.ok(cell(e,1,h),h);assert.equal(cell(e,1,'Notion Sync'),'Ready');});
