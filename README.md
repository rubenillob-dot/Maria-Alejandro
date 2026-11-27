# Creamuebles — Estudio de Diseño de Mobiliario Minimalista

Página web corporativa e interactiva para **Creamuebles**, una firma de diseño de mobiliario a medida de inspiración nórdica y contemporánea, fundada por **Alejandro Pachón** y **María Fernández**.

---

## Características principales

- **Estética nórdica y contemporánea (*desktop-first*):** Paleta de tonos neutros cálidos (`#F7F5F0`, `#EFECE4`, `#1D1C1A`, acentos madera `#9F754B`), tipografía editorial (**Playfair Display** + **Plus Jakarta Sans**), menú superior fijo y diseño adaptable a tableta y móvil.
- **Inicio y Filosofía:** Portada visual de mobiliario minimalista con acceso directo al configurador y pilares de diseño a medida (*Proporción & Calma*, *Materia Honesta*, *Hecho Bajo Pedido*).
- **Configurador Interactivo en Tiempo Real (`Diseña tu Mueble`):**
  - Conmutador fluido entre **Vista 2D (SVG arquitectónico)** y **Vista 3D interactiva (Canvas orbital 360°)** con rotación libre al arrastrar, rotación automática, zoom, restablecimiento de cámara, iluminación de estudio y cotas opcionales.
  - **12 tipologías de muebles:** Mesa de comedor, Silla minimalista, Estantería modular, Aparador, Escritorio, Sillón, Sofá 3 plazas, Mesa de centro, Cama con cabecero, Mesita de noche, Banco recibidor y Vitrina alta.
  - **22 materiales en 5 categorías** con representación visual de textura (vetas de madera, vetas de mármol, estratos de travertino, moteado de granito, cepillado metálico, trama textil, bouclé, terciopelo, cuero y transparencia de cristales):
    - *Maderas:* Roble natural, Nogal americano, Haya, Fresno, Pino nórdico, Bambú.
    - *Piedras y Cerámicos:* Mármol blanco Carrara, Mármol negro Marquina, Travertino, Granito, Porcelánico.
    - *Metales:* Acero negro mate, Latón cepillado, Aluminio anodizado, Hierro forjado.
    - *Textiles y Tapizados:* Lino natural, Terciopelo, Bouclé, Piel / Cuero, Algodón orgánico.
    - *Cristales:* Vidrio templado transparente, Cristal ahumado.
  - **Color y Acabado:** Paleta curada de 10 tonos, selector de color personalizado + entrada hexadecimal (`#HEX`) e independencia entre **Estructura principal** y **Detalles / Patas** (con opción de unificar tonos).
  - **Ficha resumen y presupuesto:** Cálculo orientativo en vivo y botón **«Solicitar presupuesto con este diseño»**, que lleva a la sección de Contacto y rellena automáticamente el mensaje con la configuración elegida.
- **Nuestra Historia y Contacto:** Relato de marca, valores (artesanía, sostenibilidad y diseño a medida), perfil del equipo fundador (**Alejandro Pachón** y **María Fernández**), formulario funcional y pie de página minimalista.

---

## Estructura del proyecto

```text
.
├── index.html              # Estructura semántica y secciones principales
├── css/
│   └── styles.css          # Sistema de diseño, tema nórdico, layout y responsive
├── js/
│   ├── data.js             # Catálogo de muebles, materiales, categorías y colores
│   ├── svg-renderer.js     # Motor SVG 2D con texturas y acabados dinámicos
│   ├── renderer-3d.js      # Motor 3D en Canvas con cámara orbital y texturas en perspectiva
│   └── app.js              # Lógica del configurador, cambio 2D/3D, navegación y formulario
├── assets/
│   ├── hero-living.jpg     # Fotografía principal de salón nórdico
│   ├── atelier-craft.jpg   # Fotografía del taller y muestras de material
│   └── founders-studio.jpg # Fotografía del equipo fundador en el estudio
└── README.md
```

---

## Tecnologías utilizadas

- **HTML5** semántico y accesible (atributos ARIA para controles del configurador).
- **CSS3** modular con variables (`custom properties`), CSS Grid, Flexbox y transiciones con `IntersectionObserver`.
- **JavaScript (ES6+)** sin dependencias externas ni pasos de compilación.
- **SVG dinámico** con `<defs>`, `<pattern>`, `<linearGradient>` y filtros para representar materiales y acabados al instante.

---

## Cómo visualizar el proyecto

Al estar construido con HTML, CSS y JavaScript puro, no requiere instalación de paquetes ni compilación:

1. **Directamente en el navegador:** abre el archivo `index.html`.
2. **Con servidor local (recomendado):**

```bash
python3 -m http.server 8000
```

Después, abre `http://localhost:8000` en tu navegador.

---

## Créditos

Proyecto web diseñado para **Creamuebles** — *Alejandro Pachón & María Fernández*.
