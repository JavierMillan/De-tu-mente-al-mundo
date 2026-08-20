# Sistema visual compartido para los hubs de Academia

**Fecha:** 2026-08-20  
**Estado:** diseño validado  
**Alcance:** únicamente los hubs principales de DTMM e Inglés

## Objetivo

Actualizar los hubs publicados en `academia.lareddeluz.com/dtmm/` y
`academia.lareddeluz.com/ingles/` para que se sientan dentro de una misma
Academia sin borrar la personalidad de cada constelación. La experiencia debe
priorizar el acceso rápido a clases para alumnos actuales.

## Fuera de alcance

- Decks, sesiones, recursos y herramientas interiores.
- Autenticación, progreso personal o base de datos.
- Reescritura del contenido de las clases.
- Cambios al motor de presentaciones.
- Rediseño del index principal de Academia, ya validado por separado.

## Fuentes locales

- DTMM: `presentacion/index.html`, `presentacion/assets/hub.css`,
  `presentacion/assets/hub.js` y `presentacion/clases.json`.
- Inglés: `ingles/index.html`, `ingles/assets/ingles.css`,
  `ingles/assets/ingles.js` y `ingles/clases.json`.
- Inglés seguirá consumiendo el motor compartido de DTMM y aplicará su tema
  mediante variables y reglas específicas.

El despliegue remapea algunas rutas de assets. Los enlaces públicos deberán
resolverse desde `/dtmm/` y `/ingles/` sin introducir rutas absolutas locales.

## Principio rector

La uniformidad pertenece a la estructura y al comportamiento. La personalidad
pertenece a la paleta, la tipografía de display, la figura de constelación y los
motivos ambientales.

### Compartido por Academia

- Cielo exterior `#0d0b16` y superficies de navegación `#161423`.
- Logo real de La Red de Luz.
- Identidad `La Red de Luz · Academia` y regreso al index de Academia.
- Inter para texto funcional y JetBrains Mono para navegación, etiquetas y
  estados.
- Alturas, espacios, radios, patrones de interacción, foco y targets táctiles.
- Estructura del hero, clase destacada, filas y tarjetas.

### DTMM

- Paleta: carbón cálido `#19140f`, superficie `#241d16`, crema `#f3ead7`,
  mostaza `#e8a13c` y brillo `#f6c06a`.
- Tipografía: Unbounded para estructura y titulares; Fraunces para títulos
  editoriales; Spline Sans para contenido propio de la constelación.
- Figura: Lyra.
- Motivos: retícula, geometría de construcción y luz cálida.

### Inglés

- Paleta: negro `#0a0a0a`, superficie `#161414`, blanco hueso `#f2f0ec`, rojo
  de superficie `#c8102e` y rojo de texto accesible `#ea4a63`.
- Tipografía: Archivo Black para titulares y Spline Sans para contenido.
- Figura: Gemini.
- Motivos: ondas, nodos y lenguaje de transmisión/comunidad.
- El dorado se reserva para la firma de La Red de Luz.

## Navegación compartida

La barra superior mostrará, en este orden:

1. Logo real y `La Red de Luz · Academia`.
2. Separador y nombre corto de la constelación.
3. Secciones disponibles del hub.
4. Acción `Todas las constelaciones`, que regresa al index de Academia.

Todos los triggers y enlaces compartirán altura y centrado vertical. Los grupos
con dropdown mostrarán un indicador consistente y conservarán navegación por
teclado.

La navegación compacta se activará cuando el contenido deje de caber, no sólo
por un breakpoint fijo. Un `ResizeObserver` medirá el header y alternará una
clase de overflow; un breakpoint móvil funcionará como respaldo. El drawer
mantendrá los mismos destinos, foco visible, cierre con Escape y targets de al
menos 44 px.

## Hero compacto

El hero deja de funcionar como landing extensa. Su objetivo es identificar la
constelación y permitir continuar aprendiendo.

- Columna principal: firma compacta de constelación, nombre, promesa breve.
- Firma: avatar pequeño y etiqueta de Lyra o Gemini en la primera fila; el
  título usa todo el ancho disponible debajo.
- Columna secundaria: clase o sesión destacada obtenida de `clases.json`.
- La primera fila de clases debe comenzar dentro del primer viewport de
  escritorio y lo antes posible en móvil.
- Inglés no mostrará `En vivo` de forma permanente. Ese estado sólo existirá
  cuando haya una fuente real; el estado neutral será `Sesiones en comunidad`.

## Filas y tarjetas

Se conservan las filas horizontales por nivel o categoría porque comunican una
ruta de aprendizaje y escalan con el contenido existente.

Cada tarjeta muestra:

- Nivel o categoría.
- Número de parte, clase o sesión.
- Título.
- Descripción breve existente.
- Acceso directo.

No se mostrarán barras que puedan interpretarse como progreso personal si los
datos sólo representan avance editorial del contenido.

Las tarjetas usarán una superficie tipo vidrio oscuro, con relleno suficiente
para dominar sobre el patrón y `backdrop-filter` para difuminar lo que pasa por
detrás. Valores iniciales:

- Clase destacada: superficie aproximada al 92% y blur de 18 px.
- Tarjetas de fila: superficie aproximada al 88% y blur de 13 px.

El patrón debe percibirse como profundidad, pero nunca poder leerse con nitidez
a través de la tarjeta. Se incluirá fallback opaco para navegadores sin soporte
de `backdrop-filter`.

## Responsive

- Escritorio amplio: navegación completa, hero de dos columnas y filas con
  varias tarjetas visibles.
- Ancho intermedio: navegación compacta cuando falle la prueba de espacio;
  hero todavía puede conservar dos columnas mientras sea legible.
- Móvil: navegación en drawer, hero apilado, clase destacada debajo de la
  identidad y carrusel de una tarjeta con indicación de continuidad.
- Ningún título puede desbordar horizontalmente; el avatar nunca crea una
  columna permanente para el título.

## Accesibilidad

- Contraste AA para texto funcional y cuerpo.
- Rojo `#ea4a63` para texto pequeño en Inglés; `#c8102e` se limita a superficies,
  líneas y bordes.
- Targets táctiles mínimos de 44 px.
- Foco visible en enlaces, dropdowns, drawer y tarjetas.
- Navegación completa por teclado y soporte de `prefers-reduced-motion`.
- Logo con texto alternativo útil; constelaciones decorativas ocultas a lectores
  de pantalla cuando el nombre ya está visible.

## Comportamiento y datos

- La información seguirá viniendo de los JSON actuales.
- DTMM conservará su clase destacada dinámica.
- Inglés destacará la primera sesión disponible o la marcada explícitamente en
  sus datos; no se duplicará contenido en HTML.
- Los enlaces de clases y recursos no cambian.
- Un error al cargar datos conservará el mensaje accesible existente y no
  romperá la navegación del hub.

## Verificación

1. Comparar DTMM e Inglés juntos: mismo shell y distinta personalidad.
2. Probar 1440, 1024, 768, 430 y 390 px.
3. Reducir el ancho gradualmente y confirmar que el menú compacto aparece antes
   de solaparse.
4. Navegar dropdowns y drawer con teclado; cerrar con Escape.
5. Confirmar que todas las clases y recursos mantienen sus URLs.
6. Verificar que la primera fila aparece dentro del primer viewport en desktop.
7. Confirmar contraste y legibilidad sobre patrones, con y sin
   `backdrop-filter`.
8. Ejecutar las pruebas existentes y añadir pruebas estructurales para shell,
   rutas, estados neutrales y navegación responsive.

## Criterios de aceptación

- Ambos hubs se reconocen inmediatamente como parte de Academia.
- DTMM e Inglés conservan claramente sus paletas y tipografías propias.
- El menú nunca se solapa y todos sus elementos comparten línea vertical.
- El avatar no comprime ni rompe el título del hero.
- La clase destacada y la primera ruta de aprendizaje son visibles rápidamente.
- Las tarjetas difuminan el fondo y mantienen lectura clara.
- No se modifica contenido ni comportamiento de páginas interiores.
