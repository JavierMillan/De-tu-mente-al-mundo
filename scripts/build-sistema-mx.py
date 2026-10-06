"""Genera sistema-mx.html a partir de sistema.html.

1) Hornea el español: cada elemento con data-es queda con su texto en español desde el HTML.
2) Aplica los cambios de mercado México: precio en pesos, giros, preguntas frecuentes y textos.

Uso (desde la raíz del repo):  python scripts/build-sistema-mx.py
Requiere Playwright (solo como lector de HTML; no ejecuta los scripts de la página).
"""
import asyncio, os, re, sys
from playwright.async_api import async_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRECIO = "$19,900"
MITAD = "$9,950"

HORNEA = """() => {
  document.querySelectorAll('[data-es]').forEach(el => { el.innerHTML = el.dataset.es; });
  document.querySelectorAll('[data-label-es]').forEach(el => el.setAttribute('aria-label', el.dataset.labelEs));
  document.querySelectorAll('[data-placeholder-es]').forEach(el => el.setAttribute('placeholder', el.dataset.placeholderEs));
  return '<!DOCTYPE html>\\n' + document.documentElement.outerHTML + '\\n';
}"""

PILA = """<ul class="included"><li><span class="piece-label"><span>La página, armada a la medida</span><small>Mercado: $15,000 a $40,000 por código a la medida</small></span><span class="piece-price">$15,000</span></li><li><span class="piece-label"><span>Con tu marca, no una plantilla</span><small>Diseño de interfaz: $8,000 a $25,000</small></span><span class="piece-price">$8,000</span></li><li><span class="piece-label"><span>El formulario que pregunta y filtra, hasta 10 preguntas</span><small>Con reglas según lo que conteste tu cliente</small></span><span class="piece-price">$3,000</span></li><li><span class="piece-label"><span>La solicitud ordenada a tu WhatsApp</span><small>Y sin costo extra, también a tu Google Sheets</small></span><span class="piece-price">$2,500</span></li><li><span class="piece-label"><span>Los textos</span><small>Redacción: $2,000 a $15,000</small></span><span class="piece-price">$2,000</span></li><li class="included-total"><span class="piece-label"><span>Si lo compraras por piezas</span><small>Tomamos el piso de cada rango, no el tope.</small></span><span class="piece-price total">$30,500</span></li></ul>"""

GIROS = """<select id="industry" name="industry"><option value="">Prefiero no decir</option><option value="Paneles solares">Paneles solares</option><option value="Eventos y banquetes">Eventos y banquetes</option><option value="Remodelación y cocinas">Remodelación y cocinas</option><option value="Construcción y oficios">Construcción y oficios</option><option value="Clínica o consultorio">Clínica o consultorio</option><option value="Inmobiliaria">Inmobiliaria</option><option value="Trámites y asesorías">Trámites y asesorías</option><option value="Servicios profesionales">Servicios profesionales</option><option value="Escuela o cursos">Escuela o cursos</option><option value="Restaurante o comida">Restaurante o comida</option><option value="Rentas">Rentas</option><option value="Otro">Otro</option></select>"""

FAQ_IVA = """<details><summary>¿El precio ya incluye IVA?</summary><p>Sí. $19,900 es el total, con IVA incluido. Pagas la mitad al empezar y la mitad cuando te lo entregamos funcionando.</p></details>"""


async def hornea():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(java_script_enabled=False)
        pg = await ctx.new_page()
        await pg.goto("file:///" + os.path.join(RAIZ, "sistema.html").replace("\\", "/"))
        html = await pg.evaluate(HORNEA)
        await b.close()
        return html


def cambia(h, a, b, n=1):
    assert h.count(a) >= 1, a[:80]
    return h.replace(a, b)


def sub(h, patron, b, n=1):
    h2, k = re.subn(patron, lambda m: b, h, flags=re.S)
    assert k == n, (k, patron[:80])
    return h2


def main():
    h = asyncio.run(hornea())
    h = cambia(h, '<html lang="en">', '<html lang="es" data-default-lang="es" data-market="mx" data-price="$19,900" data-price-num="19900">')
    h = sub(h, r"<title>.*?</title>", "<title>Deja de repetir las mismas preguntas | De tu mente al mundo</title>")
    h = sub(h, r'<meta name="description" content="[^"]*">', '<meta name="description" content="Una página donde tu cliente contesta antes de escribirte. Te llega la solicitud ordenada a tu WhatsApp. Lista en 72 horas. Oferta fundadora: $19,900 con IVA, pago único.">')
    h = sub(h, r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="Deja de repetir las mismas preguntas.">')
    h = sub(h, r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="Tu cliente contesta primero. A ti te llega todo en un solo mensaje. Cinco lugares fundadores a $19,900 con IVA.">')
    # textos de mercado
    h = cambia(h, "Hecho en México. Trabajamos en inglés y español.", "Hecho en México, para negocios que atienden por WhatsApp.", 2)
    h = cambia(h, "Tal vez no necesitas un software de $10,000. Tampoco otra página genérica.", "Tal vez no necesitas un software de cientos de miles de pesos. Tampoco otra página genérica.", 2)
    h = cambia(h, "Austin, 78704", "Zapopan, 45110", 3)
    h = cambia(h, "Austin · 78704", "Zapopan · 45110")
    h = cambia(h, "your-business.com/quote", "tu-negocio.com/cotiza")
    h = cambia(h, "Cada sitio está en el idioma de sus clientes. El tuyo se arma en español, en inglés o en los dos.", "Los cinco se entregaron funcionando. El tuyo se arma alrededor de cómo ya trabaja tu negocio.", 2)
    h = cambia(h, "La misma solicitud también puede llegar como fila a tu Google Sheets.", "Sin costo extra, la misma solicitud también llega como fila a tu Google Sheets.")
    h = cambia(h, "el WhatsApp o la hoja de destino", "el WhatsApp de destino")
    h = cambia(h, 'placeholder="500"', 'placeholder="15000"')
    # oferta
    h = sub(h, r'<ul class="included">.*?</ul>', PILA)
    h = sub(h, r'<div class="offer-amount">.*?</div>', '<div class="offer-amount">' + PRECIO + ' <span>MXN · IVA incluido · pago único</span></div>')
    h = sub(h, r'(<p class="small-note offer-split"[^>]*>).*?</p>', '<p class="small-note offer-split">' + MITAD + " para empezar. " + MITAD + " cuando te lo entregamos funcionando.</p>")
    h = sub(h, r'(<p class="dialog-price")[^>]*>.*?</p>', '<p class="dialog-price">' + PRECIO + " MXN · 50% para empezar · Precio fundador · 5 lugares</p>")
    h = sub(h, r'(<button class="global-cta" type="button" data-open=""><span)[^>]*>.*?</span>', '<button class="global-cta" type="button" data-open=""><span>Ver la oferta de ' + PRECIO + "</span>")
    h = sub(h, r'(<footer class="site-footer wrap">.*?<p)[^>]*>.*?</p>', '<footer class="site-footer wrap"><a class="wordmark" href="index.html">De tu mente al mundo<span class="brand-dot">.</span></a><p>Una iniciativa de La Red de Luz · Hecho en México</p>')
    # preguntas frecuentes
    h = sub(h, r"<details><summary[^>]*>¿Puedo deducirlo\?.*?</details>", FAQ_IVA)
    h = sub(h, r"<details><summary[^>]*>¿Podemos trabajar en español\?.*?</details>", "")
    # formulario
    h = sub(h, r'<select id="industry" name="industry">.*?</select>', GIROS)
    h = cambia(h, "Ej. Limpieza de casas en Austin", "Ej. Instalación de paneles solares en Guadalajara", 2)
    h = sub(h, r'(<p class="small-note")[^>]*>SMS: \+52 33 5125 4577\..*?</p>', '<p class="small-note">SMS: +52 33 5125 4577.</p>')
    assert "US$" not in h and "Austin" not in h, [m.start() for m in re.finditer(r"US\$|Austin", h)][:5]
    # los data-es ya no hacen falta: el idioma está horneado y el selector queda oculto
    h = re.sub(r' data-(es|label-es|placeholder-es)="[^"]*"', "", h)
    open(os.path.join(RAIZ, "sistema-mx.html"), "w", encoding="utf-8", newline="\n").write(h)
    print("sistema-mx.html", len(h), "bytes")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
