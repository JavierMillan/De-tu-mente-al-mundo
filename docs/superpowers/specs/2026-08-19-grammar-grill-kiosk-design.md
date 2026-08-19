# Grammar Grill: tablero inmersivo y kiosco de práctica

Fecha: 2026-08-19
Estado: diseño aprobado en conversación; pendiente de revisión del documento

## Objetivo

La sesión 5 de Inglés Básico debe convertir el ejercicio de pedir comida en una escena creíble y divertida. El trabajo se divide en dos entregables independientes:

1. Rediseñar la slide 6 como un tablero digital de restaurante que ocupe casi toda la pantalla.
2. Publicar `Grammar Grill`, una mini app de kiosco en los recursos de Inglés para practicar como `Customer` y como `Delivery Crew`.

El recurso toma como referencia funcional el flujo de pedido de [Chuyitas Prime](https://www.chuyitasprime.com/): catálogo basado en datos, selección de variantes, carrito, resumen y confirmación. No copiará su apariencia, textos, imágenes ni marca.

## Identidad: Grammar Grill

`Grammar Grill` será una submarca ficticia de ¡Hablemos Inglés! Su lema es:

> Build it. Say it. Serve it.

La broma consiste en tratar una orden de comida como una construcción gramatical: se eligen las piezas, se arma correctamente y se entrega.

### Sistema visual

- Negro carbón: `#0a0a0a`, base de la marca ¡Hablemos Inglés!.
- Rojo: `#c8102e`, acento principal y continuidad con “Constelación”.
- Blanco cálido: `#f2f0ec`, paneles iluminados y texto.
- Amarillo kiosco: `#ffbc0d`, acciones primarias y señalización gastronómica.
- Verde éxito: `#39a96b`, confirmaciones correctas.
- Display: Archivo Black.
- Texto: Spline Sans.
- Datos, tickets y precios: Martian Mono.

El amarillo se limita a la submarca del restaurante y a acciones del kiosco. Los controles globales y el acceso desde recursos conservan el lenguaje negro/rojo existente.

No habrá dependencias de imágenes externas. Los productos se representarán con miniaturas vectoriales o composiciones CSS simples, propias de Grammar Grill, para que el recurso funcione sin red.

## Entregable 1: slide 6 inmersiva

### Composición de escritorio

La slide deja de ser un título seguido por una tarjeta. Toda la pantalla representa la pared detrás de un mostrador:

- Riel oscuro de techo y dos soportes físicos.
- Tres paneles digitales iluminados, con marcos negros estrechos, ocupando cerca del 90% del ancho útil.
- Panel 1: `Burgers`.
- Panel 2: `Sides & Drinks`.
- Panel 3: `Combos`.
- Franja roja debajo de los paneles: `ORDER HERE · WHAT CAN I GET FOR YOU?`.
- La indicación pedagógica `ROLE-PLAY · TEACHER = CASHIER · STUDENT = CUSTOMER` se integra como señalización pequeña de la escena.
- Big Mac se destaca como `MOST ORDERED`, sin competir con el resto del menú.

Los tres paneles deben permanecer visibles sin scroll a 1440×900 y 1280×720. El HUD del deck permanece operativo y visualmente separado.

### Composición móvil

Por debajo de 820 px los paneles se apilan. La slide permite scroll vertical y nunca reduce el texto hasta hacerlo ilegible. No debe existir scroll horizontal. La franja de pedido forma parte del flujo vertical; no tapa los controles del deck.

### Movimiento

La entrada puede usar un único encendido suave de los paneles. No habrá parpadeos continuos. Con `prefers-reduced-motion: reduce`, la escena aparece inmediatamente.

## Entregable 2: mini app Grammar Grill

### Ubicación e integración

- Página nueva: `ingles/recursos/grammar-grill.html`.
- Entrada nueva en `ingles/recursos.json`.
- Toda la interfaz interna del recurso estará en inglés.
- El título y descripción de la tarjeta en el hub permanecen en español, como el resto del hub.
- El recurso será una página autónoma, sin backend, pagos, WhatsApp ni autenticación.

### Pantalla inicial

La entrada muestra dos roles:

- `I'M THE CUSTOMER` — crea un pedido libre.
- `I'M DELIVERY CREW` — prepara el pedido indicado por un ticket.

Ambos roles usan exactamente el mismo catálogo y el mismo modelo de carrito.

### Catálogo

El catálogo se deriva del menú de la sesión 5:

- Hamburgers: Hamburger, Cheeseburger, Big Mac, Quarter Pounder y McChicken.
- Sides: Fries y Apple Slices.
- Drinks: Soda, Coffee y Bottled Water.
- Combos: Big Mac Combo, Quarter Pounder Combo y McChicken Combo.

Fries y Soda requieren tamaño `Small`, `Medium` o `Large`. Los combos requieren tamaño y representan burger + fries + soda. El precio mostrado del deck se considera el precio `Medium`; `Small` resta $10 y `Large` suma $10.

El catálogo es la única fuente de verdad para nombres, opciones y precios. Las pantallas, el generador de tickets y el comparador no duplican esa información.

## Modo Customer

Flujo:

1. Explorar categorías.
2. Elegir un producto.
3. Elegir tamaño cuando aplique y ajustar cantidad.
4. Agregar al carrito.
5. Revisar y editar el pedido.
6. Confirmar con `CREATE ORDER`.

La confirmación muestra:

- `ORDER CREATED!`
- Resumen y total.
- Confeti breve.
- `CREATE ANOTHER ORDER`.
- `BACK TO ROLE SELECT`.

No se recopila nombre, dirección, teléfono ni forma de pago.

## Modo Delivery Crew

### Generación del pedido objetivo

Al iniciar una ronda, la app genera un objeto de pedido válido a partir del catálogo. Reglas:

- Entre 1 y 4 líneas distintas.
- Al menos una hamburguesa o combo.
- Cantidad por línea entre 1 y 2.
- Todo producto que requiere tamaño recibe un tamaño válido.
- No se generan líneas duplicadas; la cantidad expresa las repeticiones.
- El ticket se mantiene fijo durante el intento.

Ejemplo interno:

```js
{
  items: [
    { productId: "big-mac-combo", size: "medium", quantity: 1 },
    { productId: "soda", size: "large", quantity: 1 }
  ]
}
```

Ese objeto se presenta como un ticket legible en inglés, por ejemplo:

> 1 Medium Big Mac Combo
> 1 Large Soda

El alumno no escribe ni reconstruye el texto. Selecciona productos, tamaños y cantidades desde el catálogo.

### Comparación

Antes de comparar, ambos pedidos se normalizan:

1. Se convierten IDs y tamaños a una forma canónica.
2. Se agrupan líneas idénticas.
3. Se ordenan por `productId` y `size`.
4. Se comparan producto, tamaño y cantidad.

El orden de selección y el texto presentado no afectan el resultado.

Si hay diferencias, la pantalla mantiene el ticket y devuelve mensajes concretos en inglés:

- `Missing: 1 Large Soda`
- `Remove: 1 Small Fries`
- `Change Big Mac Combo to Medium`
- `You need 2 Cheeseburgers`

El alumno corrige el mismo carrito y vuelve a comprobarlo.

Cuando coincide:

- `ORDER READY!`
- Confeti breve.
- Resumen de la orden.
- `PREPARE ANOTHER ORDER` genera un objetivo nuevo.
- `BACK TO ROLE SELECT` regresa al inicio.

## Modelo de datos

```js
CatalogItem = {
  id,
  category,
  name,
  description,
  prices: { default } | { small, medium, large },
  requiresSize,
  comboContents
}

OrderLine = {
  productId,
  size: null | "small" | "medium" | "large",
  quantity
}

Order = {
  items: OrderLine[]
}
```

Funciones separadas:

- `createRandomOrder(catalog, random)` genera objetivos válidos.
- `normalizeOrder(order)` produce la forma canónica.
- `compareOrders(target, attempt)` devuelve `{ matches, feedback }`.
- `calculateTotal(order, catalog)` calcula el total desde el catálogo.
- La UI solo renderiza estado y despacha acciones; no contiene reglas de comparación.

El parámetro `random` permite probar el generador con una secuencia controlada.

## Adaptación y accesibilidad

- En escritorio, el catálogo ocupa el área principal y el ticket/carrito permanece visible a la derecha.
- En móvil, catálogo y ticket/carrito se convierten en pasos verticales; una barra inferior muestra cantidad y acción siguiente.
- Todos los controles son botones reales y operables por teclado.
- El foco se mueve al título de cada pantalla al cambiar de paso.
- Los resultados usan una región `aria-live`.
- El color nunca es la única señal de correcto o incorrecto.
- El confeti se desactiva con `prefers-reduced-motion: reduce`.
- No hay scroll horizontal a 390 px.

## Estados y errores

- Carrito vacío: `Your order is empty. Add at least one item.`
- Falta tamaño: la acción de agregar queda deshabilitada y el selector indica `Choose a size`.
- Comparación incorrecta: conserva pedido objetivo e intento.
- Nueva ronda: limpia el intento anterior antes de generar el objetivo.
- Reiniciar modo Customer: limpia carrito y confirmación.
- Si JavaScript no carga, se muestra un mensaje dentro del recurso en lugar de una pantalla vacía.

## Verificación

### Slide

- Capturas a 1440×900, 1280×720 y 390×844.
- Tres paneles visibles en escritorio.
- Sin overflow horizontal en ningún viewport.
- Navegación del deck y notas siguen funcionando.

### Recurso

- Cada producto puede agregarse, editarse y eliminarse.
- Los precios de tamaños y total se calculan desde catálogo.
- `createRandomOrder` genera únicamente órdenes válidas durante múltiples iteraciones.
- El comparador acepta líneas equivalentes en distinto orden.
- El comparador detecta producto, tamaño y cantidad incorrectos.
- Customer termina en `ORDER CREATED!`.
- Delivery Crew solo termina en `ORDER READY!` cuando los objetos coinciden.
- Ambos botones de nueva orden limpian correctamente el estado.
- Prueba visual y funcional en escritorio y móvil.

## Fuera de alcance

- Reconocimiento de voz.
- Escritura libre de frases.
- Persistencia o historial de pedidos.
- Cuentas, ranking, temporizador o puntuación.
- Envío de pedidos reales.
- Backend o almacenamiento remoto.
- Copia de marca, contenido o activos visuales de Chuyitas Prime o McDonald's.
