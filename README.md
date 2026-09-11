# De tu mente al mundo

Página de Javier Millán — un ingeniero de software que ayuda a otros a convertir su
mensaje en un sistema (embudo) que atrae y precalifica a las personas correctas.

Masterclass narrativa de una sola página (StoryBrand), con scroll cinemático y captación
de leads vía WhatsApp.

## Stack
- HTML + CSS + JS vanilla
- Tailwind CSS (CDN)
- GSAP + ScrollTrigger + Lenis (animaciones / smooth scroll)
- Tipografía: Fraunces + Inter

## Estructura
- `index.html` — la página
- `css/styles.css` — sistema de diseño "editorial luxury" + escenas
- `scripts/script.js` — scroll cinemático, escenas ancladas, embudo, form → WhatsApp
- `assets/imgs/` — imágenes

## Notas
- El número de WhatsApp se configura en `scripts/script.js` (`WHATSAPP_NUMBER`).

## Academia

Este repositorio contiene la landing comercial de De tu Mente al Mundo.
Las clases, decks y recursos académicos viven en
`JavierMillan/academia-lareddeluz`, carpeta `cursos/dtmm/`, y se publican en
https://academia.lareddeluz.com/dtmm/.


## Landing de sistemas para USA — primera versión

- `sistema.html`: landing EN/ES con tres bloques y formulario web en un modal.
- `css/sistema.css`: estilos independientes; no afecta a las páginas de comunidad.
- `scripts/sistema-core.js`: validación, resumen de WhatsApp y adaptación al receptor de Sheets.
- `scripts/sistema.js`: idioma, animación, modal y envío explícito.
- Inglés por defecto; `sistema.html?lang=es` abre en español. El selector conserva parámetros UTM.
- Precio fundador: **US$2,500** (de US$3,500), un proceso, pago único. Cinco lugares hasta el 31 de octubre. Entrega en 72 horas con alcance y materiales aprobados.

### Verificación local

Ejecutar `node --test scripts/test-sistema-core.cjs` y `node scripts/test-no-academy-courses.cjs`.
Servir la raíz del proyecto con un servidor HTTP estático y abrir `/sistema.html`.

Las respuestas permanecen en memoria hasta que la persona confirma el envío. La vista previa no envía datos. El enlace final abre WhatsApp con todas las respuestas; la persona debe pulsar Enviar allí. En paralelo se intenta guardar en el receptor de Apps Script existente.

**Límite de la integración existente:** su petición `no-cors` no permite confirmar desde el navegador que se escribió en Google Sheets. Un resultado opaco nunca se presenta como recepción confirmada. El email y los criterios se incluyen en la columna de proceso actual para mantener compatibilidad con el receptor desplegado, sin exigir un cambio de esquema.

Se emiten eventos locales `dtmm:analytics` sin datos de contacto: `form_open`, `form_step`, `request_preview`, `whatsapp_click`, `request_delivery_attempted` y `request_delivery_failed`. No está instalado un Pixel nuevo ni se han configurado campañas. Antes de activar anuncios, conectar la medición real y verificar la recepción de una solicitud autorizada en la hoja.
