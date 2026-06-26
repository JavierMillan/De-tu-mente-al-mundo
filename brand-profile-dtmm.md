# Brand Profile — De tu mente al mundo (DTMM)
<!-- version: 1.0 · updated: 2026-06-25 · status: confirmed (valores extraídos del CSS de producción; esencia/arquetipo confirmados por el usuario) -->

> Iniciativa de **La Red de Luz**. Este perfil gobierna todo visual de DTMM:
> UI/web, imágenes IA, ads, posters, posts, slides. Aliméntalo a `ad-alchemist`,
> `banana` y a las presentaciones de Gamma para mantener coherencia.

## 0. Snapshot
- One-line definition: masterclass/programa de **psicología del consumidor** que enseña a comunicar desde el problema humano del cliente, no desde el servicio. Para emprendedores y dueños de negocio que "publican todos los días y nadie les escribe".
- Tagline / frase ancla: **"Por qué nadie te escribe."** · "De tu mente al mundo."
- Canales principales: web (landing DTMM), Instagram, masterclass en vivo, grupos de WhatsApp.
- Goal de la mayoría de visuales: **mover** (revelar una verdad incómoda → llevar a conversación en WhatsApp). Promover el programa, no a la persona.

## 1. Essence (la fuente de la luz)
- Mission / promise: revelar el error invisible que apaga las ventas antes del embudo — que la gente no se ve reflejada en tu mensaje — y enseñar a corregirlo.
- Personalidad (5 adjetivos): cálido, revelador, honesto, terrenal, artesanal.
- Arquetipo junguiano: **Mago** (revela lo oculto, transforma la percepción). Sombra a evitar: manipulación / "gurú de ventas" — por eso **NADA de lenguaje de venta**, solo storytelling honesto.
- Audiencia: emprendedores/creadores de servicio (coaches, profesionales, marketers), agotados de publicar sin respuesta; estado interno = frustración silenciosa + ligera vergüenza ("hago todo y no funciona").
- La ÚNICA sensación que todo visual debe evocar: **"esto me está pasando a mí"** — reconocimiento íntimo, cálido, no acusatorio.
- Admirados (dirección, nunca copiar): editorial cálido tipo revista impresa, estética de café de especialidad artesanal, la luz reveladora de La Red de Luz (marca madre).

## 2. Color system
Universo conceptual: **"hamburguesa artesanal"** — los colores llevan nombre de
ingrediente. La paleta es cálida y terrenal (← arquetipo Mago cálido, honesto,
artesanal); el acento mostaza es literalmente *"la luz que revela"* (puente con
La Red de Luz).

- **Dominante (~60%)** — `--paper` Crema/papel encerado `#f3ead7` (fondos claros) y su contraparte oscura `--char` Carbón cálido `#19140f` (fondos oscuros). DTMM alterna entre registro claro y oscuro; nunca negro frío.
  - `--paper-soft #ece0c6` · `--char-soft #241d16` (superficies elevadas)
- **Secundario (~30%)** — tinta/texto:
  - Sobre crema: `--on-paper #221a12` · soft `#5c4f3d` · mute `#8a7d6a`
  - Sobre carbón: `--on-char #f3ead7` · soft `#c4b69d` · mute `#8a7c68`
- **Acento (~10%, reservado para lo que debe brillar)** — `--sesame` Mostaza/pan tostado `#e8a13c` = "la luz que revela". Hover/brillo `--sesame-hi #f6c06a`. Glow `rgba(232,161,60,0.5)`.
- **Acentos raros (uso mínimo, <5%)**:
  - `--ketchup #c8442e` rojo quemado — tensión/urgencia, solo para crear fricción puntual.
  - `--lettuce #7c9a3e` verde lechuga apagado — acento ocasional.
- Líneas: sobre carbón `rgba(243,234,215,0.12 / 0.22)` · sobre crema `rgba(25,20,15,0.14 / 0.26)`.
- Harmony logic: **análoga cálida** (cremas → mostazas → terracota/rojo quemado) ← esencia terrenal/artesanal; el sesame es la única "chispa" de luz que ordena la jerarquía.
- Gradiente de marca: `linear-gradient(90deg, var(--ketchup), var(--sesame))` (barras de progreso) y `linear-gradient(180deg, sesame → ketchup)` (hilo conductor) con glow.
- **Contrastes verificados (WCAG)**:
  - paper sobre char = **15.29:1** (AAA) · ink sobre paper = **14.34:1** (AAA)
  - sesame sobre char = **8.36:1** (AAA) ✅ · btn-ink `#1a1103` sobre sesame = **8.53:1** (AAA) ✅
  - ⚠️ **sesame sobre paper = 1.83:1 (FALLA)** → el mostaza NUNCA es texto sobre crema.
  - ketchup sobre paper 4.06:1 / sobre char 3.76:1 → solo large/display.
  - mutes ronda 3.4–4.5:1 → solo texto grande/secundario, nunca cuerpo pequeño.

## 3. Typography system
- **Display / mega**: `Unbounded` — peso 700 (hasta 800). Titulares grandes. `letter-spacing: -0.02em`, `line-height: ~0.98–1.08`. Geométrica, contemporánea, con presencia.
- **Serif editorial**: `Fraunces` — logo, frases poéticas/reveladoras (`.pre-line`), citas. Aporta calidez artesanal y "verdad humana".
- **Cuerpo**: `Spline Sans` — 300/400/500/600. Legible, neutral cálido.
- **Mono / labels**: `Martian Mono` — 400/500/600. Eyebrows, nav, contadores, etiquetas en **MAYÚSCULAS** con `letter-spacing: 0.04em–0.3em`. Da el toque "instrumento de precisión" que contrasta con la calidez.
- Pairing rationale (← esencia): serif (Fraunces) = verdad humana cálida · display geométrico (Unbounded) = claridad reveladora · mono (Martian) = rigor/dato. Tres registros = Mago que revela con calidez Y evidencia.
- Fuente: Google Fonts — `Unbounded:wght@500..800`, `Fraunces:ital,opsz,wght`, `Spline Sans:wght@300..600`, `Martian Mono:wght@400..600`.
- Type scale (inferido — confirmar): base 16px · usa `clamp()` fluido. Mega `clamp(2.3rem, 8vw, 6.2rem)`; títulos de sección `clamp(1.6rem, 4vw, 2.9rem)`; labels ~0.66–0.78rem.
- Defaults: heading leading 0.98–1.1 · body leading ~1.5 · labels tracking ancho + uppercase.
- Alignment: izquierda por defecto; centrado solo para líneas display cortas.

## 4. Composition & layout doctrine
- Spacing scale (real): `0.5 · 0.8 · 1.1 · 1.4 · 1.8 · 2.4 · 3 · 4 rem` (--s-1…--s-8).
- Max width: `1240px`.
- Radius: `--radius 16px` · `--radius-sm 10px` · botones **pill 999px** · chips 4px.
- Balance: **asimétrico/editorial**, narrativa de scroll vertical por "actos"/capítulos con eyebrow mono + título display.
- Focal strategy: un titular display enorme sobre amplio espacio + caption/label mono pequeño = salto de escala dramático. Un solo foco por pantalla.
- Negative space: generoso; el vacío cálido es premium y deja respirar la revelación.
- Signature moves: (1) eyebrow Martian Mono en mayúsculas → título Unbounded mega; (2) frase reveladora en Fraunces con **una** palabra clave en sesame; (3) glows radiales mostaza `blur(100px)` detrás del contenido; (4) hilo/línea conductora con gradiente sesame→ketchup.
- Motion: easing `cubic-bezier(0.22, 1, 0.36, 1)` (entrada) y `cubic-bezier(0.76,0,0.24,1)` (in-out). Calmo, revelador, sin rebote.
- Aspect ratios por canal (inferido — confirmar): IG post 4:5, story/reel 9:16, web hero 16:9, slides 16:9.

## 5. Aesthetic direction (style)
- Style blend: **55% editorial cálido impreso / 30% artesanal-terrenal / 15% precisión instrumental (mono + glows)**.
- Texture / finish: papel encerado, grano sutil, glows luminosos mostaza; mate, nunca glossy ni HDR.
- Shape language: suave-geométrico; radios 10–16px, botones pill.
- Motion feel: calmo y eased, revelador.

## 6. Imagery direction
- Medium: **fotografía cinematográfica cálida** primero; íconos de un solo set para diagramas.
- Treatment: hora dorada, luz suave, sombras largas, tonos terrosos con realces ámbar, profundidad de campo corta, grano de película sutil, look editorial-revista. Íntimo y humano.
- Subject — DO: personas reales en momentos honestos (frustración, reconocimiento, conexión), objetos cotidianos con luz cálida, escenas que el cliente "siente en el pecho". DON'T: stock corporativo frío, grades azules/cian, neón, collage abigarrado, sonrisas de banco de imágenes.
- AI anchors (para `banana`/Gamma): `"warm cinematic photography, golden-hour light, soft long shadows, intimate and human, muted earthy tones with warm amber highlights, shallow depth of field, subtle film grain, editorial-magazine look"`. Negative: `"neon, glossy, HDR, cool blue grade, corporate stock, busy cluttered background"`.

## 7. Logo & assets
- Wordmark "De tu mente al mundo" en **Fraunces** (nav-logo). Atribución: "una iniciativa de La Red de Luz".
- Botón primario: fondo sesame, texto `#1a1103`, sombra glow + highlight interno. Botón WhatsApp: `#25d366` / texto `#04301a`.
- Don't: recolorear fuera de la paleta, estirar, poner sobre fondo cargado sin scrim, usar el mostaza como texto sobre crema.

## 8. Voice tie-in (visual ↔ verbal)
- Tono en 3 palabras: cálido, revelador, honesto.
- Cómo se ve: storytelling, NADA de lenguaje de venta ("compra ya", "oferta", "garantizado" → prohibidos). Una idea por frame, respiración generosa, la palabra clave iluminada en sesame. El visual susurra una verdad, no grita una oferta.

## 9. Guardrails — el "never"
- Nunca negro frío `#000` — usar `--char #19140f` (carbón cálido).
- Nunca `--sesame` como texto/cuerpo sobre crema (1.83:1, falla) — solo sobre carbón o como relleno/forma.
- Nunca más de un acento sesame protagónico por composición.
- Ketchup/lettuce solo en dosis mínimas (<5%), nunca como base.
- Nunca grades azules/fríos, neón, glossy ni HDR en imágenes.
- Nunca centrar texto de cuerpo largo (solo display corto).
- Máximo lo establecido: Unbounded + Fraunces + Spline Sans + Martian Mono. No introducir más familias.
- Nunca lenguaje de venta agresivo ni promover a la persona por encima del programa.

---

## Anexo — La Red de Luz (marca madre, registro distinto)
DTMM es una iniciativa de La Red de Luz; comparten alma (luz que revela) pero
distinto registro cromático. Usar este sistema solo para piezas firmadas como
La Red de Luz, no para DTMM.

- Color: fondo cósmico `#0d0b16` / `#161423` · dorado `#c08a2d` / `#e4cd85` · azul profundo `#163384` · crema `#f9f4e3`.
- Tipografía: `Spectral` (serif), `Inter` (cuerpo), `JetBrains Mono` (labels).
- Mood: misticismo minimalista, "una luz en el vacío", contemplativo. "Menos perfección, más verdad."
