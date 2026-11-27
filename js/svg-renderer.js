/**
 * Renderizador SVG interactivo para Creamuebles.
 * Combina en tiempo real:
 *  - Geometría arquitectónica del mueble elegido
 *  - Color de estructura principal + color independiente de detalles/patas
 *  - Patrones y sombreados específicos por tipo de material (vetas, mármol, metal, tejido, cristal)
 */

(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function hexToRgb(hex) {
    const clean = (hex || "#C69C6D").replace("#", "");
    const full = clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean.padEnd(6, "0");
    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /**
   * Ajusta la luminosidad de un color HEX (-1 a +1)
   */
  function shadeHex(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    if (amount >= 0) {
      return rgbToHex(
        r + (255 - r) * amount,
        g + (255 - g) * amount,
        b + (255 - b) * amount
      );
    }
    const factor = 1 + amount;
    return rgbToHex(r * factor, g * factor, b * factor);
  }

  function getLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  function rgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Construye el bloque <defs> con patrones de textura aplicados sobre el color elegido
   */
  function buildMaterialDefs(primaryHex, detailHex, material) {
    const isDark = getLuminance(primaryHex) < 0.36;
    const isDetailDark = getLuminance(detailHex) < 0.36;

    const primaryLight = shadeHex(primaryHex, isDark ? 0.22 : 0.16);
    const primaryMid = primaryHex;
    const primaryDark = shadeHex(primaryHex, isDark ? -0.35 : -0.22);
    const primaryStroke = shadeHex(primaryHex, isDark ? 0.28 : -0.36);

    const detailLight = shadeHex(detailHex, isDetailDark ? 0.25 : 0.18);
    const detailDark = shadeHex(detailHex, isDetailDark ? -0.35 : -0.24);
    const detailStroke = shadeHex(detailHex, isDetailDark ? 0.3 : -0.38);

    const veinColor = isDark ? "rgba(255,255,255,0.24)" : "rgba(55,48,42,0.22)";
    const veinSoft = isDark ? "rgba(255,255,255,0.10)" : "rgba(70,62,54,0.11)";
    const woodGrainDark = isDark ? "rgba(255,255,255,0.13)" : "rgba(54,30,10,0.20)";
    const woodGrainLight = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,244,225,0.16)";

    const tex = material.textureType;
    let materialPattern = "";

    if (tex === "wood") {
      materialPattern = `
        <pattern id="mat-surface" width="160" height="48" patternUnits="userSpaceOnUse">
          <rect width="160" height="48" fill="${primaryMid}"/>
          <path d="M0 7 C40 4, 95 10, 160 6" stroke="${woodGrainDark}" stroke-width="1.4" fill="none"/>
          <path d="M0 15 C52 19, 110 11, 160 16" stroke="${woodGrainLight}" stroke-width="2" fill="none"/>
          <path d="M0 24 C45 21, 115 28, 160 23" stroke="${woodGrainDark}" stroke-width="1.2" fill="none"/>
          <path d="M0 33 C60 36, 105 29, 160 34" stroke="${woodGrainDark}" stroke-width="0.9" fill="none"/>
          <path d="M0 42 C38 40, 120 45, 160 41" stroke="${woodGrainLight}" stroke-width="1.5" fill="none"/>
          <ellipse cx="92" cy="24" rx="14" ry="3.2" stroke="${woodGrainDark}" stroke-width="0.9" fill="none" opacity="0.65"/>
        </pattern>
        <pattern id="mat-surface-side" width="48" height="160" patternUnits="userSpaceOnUse">
          <rect width="48" height="160" fill="${primaryDark}"/>
          <path d="M9 0 C6 45, 12 105, 8 160" stroke="${woodGrainDark}" stroke-width="1.2" fill="none"/>
          <path d="M22 0 C26 55, 19 110, 24 160" stroke="${woodGrainLight}" stroke-width="1.4" fill="none"/>
          <path d="M36 0 C33 50, 39 108, 35 160" stroke="${woodGrainDark}" stroke-width="1" fill="none"/>
        </pattern>`;
    } else if (tex === "marble") {
      materialPattern = `
        <pattern id="mat-surface" width="220" height="140" patternUnits="userSpaceOnUse">
          <rect width="220" height="140" fill="${primaryMid}"/>
          <path d="M-10 25 C45 40, 85 12, 145 48 C185 72, 200 58, 230 75" stroke="${veinColor}" stroke-width="2.1" fill="none"/>
          <path d="M10 110 C60 85, 105 118, 175 78 C200 64, 212 72, 230 65" stroke="${veinSoft}" stroke-width="3.2" fill="none"/>
          <path d="M40 -5 C72 45, 58 75, 92 145" stroke="${veinColor}" stroke-width="1.1" fill="none"/>
          <path d="M150 5 C135 55, 168 85, 152 142" stroke="${veinSoft}" stroke-width="1.3" fill="none"/>
        </pattern>
        <pattern id="mat-surface-side" width="120" height="120" patternUnits="userSpaceOnUse">
          <rect width="120" height="120" fill="${primaryDark}"/>
          <path d="M0 30 C40 48, 80 18, 120 42" stroke="${veinColor}" stroke-width="1.4" fill="none"/>
          <path d="M15 95 C55 72, 95 96, 120 80" stroke="${veinSoft}" stroke-width="1.8" fill="none"/>
        </pattern>`;
    } else if (tex === "travertine") {
      materialPattern = `
        <pattern id="mat-surface" width="140" height="44" patternUnits="userSpaceOnUse">
          <rect width="140" height="44" fill="${primaryMid}"/>
          <rect x="0" y="6" width="140" height="5" fill="${veinSoft}"/>
          <rect x="0" y="21" width="140" height="3" fill="${veinColor}" opacity="0.5"/>
          <rect x="0" y="34" width="140" height="4" fill="${veinSoft}"/>
          <ellipse cx="26" cy="14" rx="8" ry="1.6" fill="${veinColor}" opacity="0.55"/>
          <ellipse cx="88" cy="29" rx="11" ry="1.8" fill="${veinColor}" opacity="0.45"/>
          <ellipse cx="118" cy="10" rx="6" ry="1.3" fill="${veinColor}" opacity="0.5"/>
        </pattern>
        <pattern id="mat-surface-side" width="100" height="44" patternUnits="userSpaceOnUse">
          <rect width="100" height="44" fill="${primaryDark}"/>
          <rect x="0" y="10" width="100" height="4" fill="${veinSoft}"/>
          <rect x="0" y="28" width="100" height="3" fill="${veinColor}" opacity="0.4"/>
        </pattern>`;
    } else if (tex === "granite") {
      materialPattern = `
        <pattern id="mat-surface" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="${primaryMid}"/>
          <circle cx="6" cy="7" r="1.4" fill="${veinColor}"/>
          <circle cx="17" cy="5" r="1.1" fill="rgba(255,255,255,0.34)"/>
          <circle cx="28" cy="12" r="1.6" fill="${veinColor}"/>
          <circle cx="11" cy="20" r="1.2" fill="rgba(255,255,255,0.28)"/>
          <circle cx="24" cy="25" r="1.3" fill="${veinColor}"/>
          <circle cx="32" cy="31" r="1.0" fill="rgba(255,255,255,0.32)"/>
          <circle cx="5" cy="30" r="1.5" fill="${veinColor}"/>
          <circle cx="18" cy="15" r="0.9" fill="${veinSoft}"/>
        </pattern>
        <pattern id="mat-surface-side" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="${primaryDark}"/>
          <circle cx="8" cy="9" r="1.2" fill="${veinColor}"/>
          <circle cx="22" cy="18" r="1.1" fill="rgba(255,255,255,0.24)"/>
          <circle cx="14" cy="29" r="1.3" fill="${veinColor}"/>
        </pattern>`;
    } else if (tex === "ceramic") {
      materialPattern = `
        <linearGradient id="mat-surface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryLight}"/>
          <stop offset="55%" stop-color="${primaryMid}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>
        <linearGradient id="mat-surface-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${primaryMid}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>`;
    } else if (tex === "metal-brushed") {
      materialPattern = `
        <pattern id="mat-surface" width="120" height="18" patternUnits="userSpaceOnUse">
          <rect width="120" height="18" fill="${primaryMid}"/>
          <line x1="0" y1="3" x2="120" y2="3" stroke="rgba(255,255,255,0.24)" stroke-width="0.8"/>
          <line x1="0" y1="8" x2="120" y2="8" stroke="rgba(0,0,0,0.10)" stroke-width="0.7"/>
          <line x1="0" y1="13" x2="120" y2="13" stroke="rgba(255,255,255,0.18)" stroke-width="0.9"/>
          <rect width="120" height="18" fill="url(#metal-sheen-overlay)"/>
        </pattern>
        <linearGradient id="mat-surface-side" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${primaryDark}"/>
          <stop offset="45%" stop-color="${primaryLight}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>`;
    } else if (tex === "metal-matte" || tex === "metal-forged") {
      const grainAlpha = tex === "metal-forged" ? 0.18 : 0.08;
      materialPattern = `
        <pattern id="mat-surface" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="${primaryMid}"/>
          <circle cx="5" cy="6" r="0.9" fill="rgba(255,255,255,${grainAlpha})"/>
          <circle cx="16" cy="11" r="1.0" fill="rgba(0,0,0,${grainAlpha})"/>
          <circle cx="9" cy="19" r="0.8" fill="rgba(255,255,255,${grainAlpha})"/>
          <circle cx="20" cy="20" r="1.1" fill="rgba(0,0,0,${grainAlpha})"/>
        </pattern>
        <linearGradient id="mat-surface-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryMid}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>`;
    } else if (tex === "textile-linen") {
      materialPattern = `
        <pattern id="mat-surface" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="${primaryMid}"/>
          <line x1="0" y1="3" x2="12" y2="3" stroke="${veinSoft}" stroke-width="1"/>
          <line x1="0" y1="9" x2="12" y2="9" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
          <line x1="4" y1="0" x2="4" y2="12" stroke="${veinSoft}" stroke-width="1"/>
          <line x1="10" y1="0" x2="10" y2="12" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
        </pattern>
        <pattern id="mat-surface-side" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="${primaryDark}"/>
          <line x1="0" y1="4" x2="12" y2="4" stroke="${veinSoft}" stroke-width="1"/>
          <line x1="6" y1="0" x2="6" y2="12" stroke="${veinSoft}" stroke-width="1"/>
        </pattern>`;
    } else if (tex === "textile-velvet") {
      materialPattern = `
        <linearGradient id="mat-surface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryLight}"/>
          <stop offset="48%" stop-color="${primaryMid}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>
        <linearGradient id="mat-surface-side" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${primaryMid}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>`;
    } else if (tex === "textile-boucle") {
      materialPattern = `
        <pattern id="mat-surface" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="${primaryMid}"/>
          <circle cx="4" cy="4" r="2.2" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="1.2"/>
          <circle cx="10.5" cy="6" r="2.0" fill="none" stroke="${veinSoft}" stroke-width="1.1"/>
          <circle cx="6.5" cy="11" r="2.1" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.1"/>
          <circle cx="12" cy="12" r="1.4" fill="${veinSoft}"/>
        </pattern>
        <pattern id="mat-surface-side" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="${primaryDark}"/>
          <circle cx="5" cy="5" r="2" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
          <circle cx="10" cy="11" r="1.8" fill="none" stroke="${veinSoft}" stroke-width="1"/>
        </pattern>`;
    } else if (tex === "textile-leather") {
      materialPattern = `
        <pattern id="mat-surface" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="${primaryMid}"/>
          <path d="M2 5 Q5 2 9 5 T16 5" stroke="${veinSoft}" stroke-width="0.9" fill="none"/>
          <path d="M1 12 Q6 15 11 11 T17 13" stroke="rgba(255,255,255,0.12)" stroke-width="0.8" fill="none"/>
          <circle cx="5" cy="9" r="0.8" fill="${veinSoft}"/>
          <circle cx="13" cy="15" r="0.9" fill="${veinSoft}"/>
        </pattern>
        <linearGradient id="mat-surface-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryMid}"/>
          <stop offset="100%" stop-color="${primaryDark}"/>
        </linearGradient>`;
    } else if (tex === "glass-clear" || tex === "glass-smoked") {
      const glassAlpha = tex === "glass-clear" ? 0.36 : 0.62;
      const glassAlphaEdge = tex === "glass-clear" ? 0.56 : 0.78;
      materialPattern = `
        <linearGradient id="mat-surface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${rgba(primaryLight, glassAlphaEdge)}"/>
          <stop offset="45%" stop-color="${rgba(primaryMid, glassAlpha)}"/>
          <stop offset="70%" stop-color="rgba(255,255,255,0.52)"/>
          <stop offset="100%" stop-color="${rgba(primaryDark, glassAlphaEdge)}"/>
        </linearGradient>
        <linearGradient id="mat-surface-side" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${rgba(primaryDark, 0.72)}"/>
          <stop offset="100%" stop-color="${rgba(primaryLight, 0.85)}"/>
        </linearGradient>`;
    }

    return `
      <defs>
        <linearGradient id="room-wall-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FBF9F5"/>
          <stop offset="100%" stop-color="#EFEAE0"/>
        </linearGradient>
        <linearGradient id="room-floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E7E0D3"/>
          <stop offset="100%" stop-color="#DDD4C4"/>
        </linearGradient>
        <radialGradient id="floor-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(29,28,26,0.22)"/>
          <stop offset="65%" stop-color="rgba(29,28,26,0.08)"/>
          <stop offset="100%" stop-color="rgba(29,28,26,0)"/>
        </radialGradient>
        <linearGradient id="metal-sheen-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.26)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.16)"/>
        </linearGradient>
        <linearGradient id="detail-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${detailLight}"/>
          <stop offset="55%" stop-color="${detailHex}"/>
          <stop offset="100%" stop-color="${detailDark}"/>
        </linearGradient>
        <linearGradient id="surface-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.24)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0.03)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.10)"/>
        </linearGradient>
        <filter id="soft-drop" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#1D1C1A" flood-opacity="0.14"/>
        </filter>
        ${materialPattern}
        <style>
          .p-main { fill: url(#mat-surface); stroke: ${primaryStroke}; stroke-width: 1.3; stroke-linejoin: round; }
          .p-side { fill: url(#mat-surface-side); stroke: ${primaryStroke}; stroke-width: 1.3; stroke-linejoin: round; }
          .p-sheen { fill: url(#surface-highlight); pointer-events: none; }
          .p-detail { fill: url(#detail-grad); stroke: ${detailStroke}; stroke-width: 1.2; stroke-linejoin: round; }
          .p-detail-solid { fill: ${detailHex}; stroke: ${detailStroke}; stroke-width: 1.2; stroke-linejoin: round; }
          .p-detail-dark { fill: ${detailDark}; stroke: ${detailStroke}; stroke-width: 1.1; stroke-linejoin: round; }
          .p-seam { stroke: ${primaryStroke}; stroke-width: 1.1; stroke-dasharray: 4 3; fill: none; opacity: 0.65; }
          .dim-line { stroke: #8A847B; stroke-width: 1; stroke-dasharray: 4 4; }
          .dim-tick { stroke: #8A847B; stroke-width: 1.2; }
          .dim-text { font-family: "Plus Jakarta Sans", sans-serif; font-size: 12px; font-weight: 500; fill: #6F6960; }
        </style>
      </defs>`;
  }

  /**
   * Modelos SVG individuales de los 6 muebles
   */
  const MODELS = {
    mesa(isGlass) {
      // Patas primero (visibles detrás/debajo si es cristal)
      const legs = `
        <!-- Patas traseras -->
        <polygon class="p-detail-dark" points="236,272 252,272 238,440 225,440"/>
        <polygon class="p-detail-dark" points="668,272 684,272 695,440 682,440"/>
        <!-- Travesaño estructural -->
        <polygon class="p-detail" points="210,275 710,275 700,291 220,291"/>
        <!-- Patas delanteras anguladas nórdicas -->
        <polygon class="p-detail" points="196,286 218,286 196,472 178,472"/>
        <polygon class="p-detail" points="702,286 724,286 742,472 724,472"/>
        <!-- Detalles de latón/unión en punteras -->
        <polygon class="p-detail-dark" points="181,452 199,452 196,472 178,472"/>
        <polygon class="p-detail-dark" points="721,452 739,452 742,472 724,472"/>
      `;
      const top = `
        <!-- Tablero principal con canto biselado -->
        <polygon class="p-side" points="145,260 775,260 762,282 158,282"/>
        <polygon class="p-main" points="222,202 698,202 775,260 145,260"/>
        <polygon class="p-sheen" points="222,202 698,202 775,260 145,260"/>
        ${isGlass ? `<path d="M270,210 L355,254 M305,210 L390,254 M580,210 L645,254" stroke="rgba(255,255,255,0.68)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
      `;
      return `
        <ellipse cx="460" cy="476" rx="310" ry="26" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          ${legs}
          ${top}
        </g>
      `;
    },

    silla(isGlass) {
      return `
        <ellipse cx="460" cy="492" rx="150" ry="22" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas traseras -->
          <polygon class="p-detail-dark" points="374,295 390,295 378,465 365,465"/>
          <polygon class="p-detail-dark" points="530,295 546,295 542,465 529,465"/>
          <!-- Estructura respaldo -->
          <path class="p-detail" d="M368,140 L385,140 L388,318 L372,318 Z"/>
          <path class="p-detail" d="M535,140 L552,140 L548,318 L532,318 Z"/>
          <!-- Patas delanteras -->
          <polygon class="p-detail" points="348,334 367,334 352,492 336,492"/>
          <polygon class="p-detail" points="553,334 572,334 584,492 568,492"/>
          <!-- Travesaño inferior -->
          <rect class="p-detail-dark" x="356" y="405" width="208" height="9" rx="3"/>

          <!-- Respaldo curvo ergonómico -->
          <path class="p-main" d="M354,132 C354,116 566,116 566,132 L560,224 C560,236 360,236 360,224 Z"/>
          <path class="p-sheen" d="M354,132 C354,116 566,116 566,132 L560,224 C560,236 360,236 360,224 Z"/>

          <!-- Asiento tapizado / moldeado -->
          <polygon class="p-side" points="334,322 586,322 578,342 342,342"/>
          <polygon class="p-main" points="364,292 556,292 586,322 334,322"/>
          <polygon class="p-sheen" points="364,292 556,292 586,322 334,322"/>
          ${isGlass ? `<path d="M400,150 L440,210 M420,150 L460,210" stroke="rgba(255,255,255,0.65)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    estanteria(isGlass) {
      return `
        <ellipse cx="460" cy="508" rx="260" ry="22" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Montantes verticales (estructura/detalles) -->
          <rect class="p-detail-dark" x="255" y="102" width="12" height="400" rx="2"/>
          <rect class="p-detail-dark" x="454" y="102" width="12" height="400" rx="2"/>
          <rect class="p-detail-dark" x="653" y="102" width="12" height="400" rx="2"/>

          <!-- Montantes frontales principales -->
          <rect class="p-detail" x="235" y="112" width="14" height="398" rx="2"/>
          <rect class="p-detail" x="453" y="112" width="14" height="398" rx="2"/>
          <rect class="p-detail" x="671" y="112" width="14" height="398" rx="2"/>

          <!-- Baldas horizontales con perspectiva -->
          ${[124, 212, 300, 388, 466].map((y) => `
            <polygon class="p-main" points="252,${y - 12} 668,${y - 12} 684,${y} 236,${y}"/>
            <rect class="p-side" x="236" y="${y}" width="448" height="14" rx="1"/>
            <polygon class="p-sheen" points="252,${y - 12} 668,${y - 12} 684,${y} 236,${y}"/>
          `).join("")}

          <!-- Módulo contenedor cerrado inferior derecho -->
          <rect class="p-main" x="468" y="302" width="202" height="84" rx="2"/>
          <line class="p-seam" x1="569" y1="306" x2="569" y2="384"/>
          <circle class="p-detail" cx="557" cy="344" r="4"/>
          <circle class="p-detail" cx="581" cy="344" r="4"/>

          <!-- Objetos decorativos arquitectónicos sutiles -->
          <rect x="285" y="156" width="18" height="44" rx="2" fill="rgba(29,28,26,0.12)"/>
          <rect x="307" y="166" width="14" height="34" rx="2" fill="rgba(159,117,75,0.22)"/>
          <ellipse cx="595" cy="196" rx="16" ry="5" fill="rgba(29,28,26,0.10)"/>
          <path d="M583,196 L588,162 L602,162 L607,196 Z" fill="rgba(29,28,26,0.14)"/>
          ${isGlass ? `<path d="M295,126 L345,126 M520,214 L575,214" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    aparador(isGlass) {
      return `
        <ellipse cx="460" cy="482" rx="300" ry="24" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas metálicas / madera -->
          <polygon class="p-detail-dark" points="205,392 222,392 212,462 198,462"/>
          <polygon class="p-detail-dark" points="698,392 715,392 722,462 708,462"/>
          <polygon class="p-detail" points="184,398 204,398 190,480 174,480"/>
          <polygon class="p-detail" points="716,398 736,398 746,480 730,480"/>
          <rect class="p-detail" x="184" y="390" width="552" height="10" rx="2"/>

          <!-- Cuerpo principal del aparador -->
          <polygon class="p-main" points="186,210 734,210 756,232 164,232"/>
          <rect class="p-side" x="164" y="232" width="592" height="160" rx="3"/>
          <rect class="p-main" x="174" y="242" width="572" height="140" rx="2"/>
          <rect class="p-sheen" x="174" y="242" width="572" height="140" rx="2"/>

          <!-- División 4 puertas minimalistas -->
          <line x1="317" y1="242" x2="317" y2="382" stroke="rgba(29,28,26,0.22)" stroke-width="1.5"/>
          <line x1="460" y1="242" x2="460" y2="382" stroke="rgba(29,28,26,0.28)" stroke-width="1.8"/>
          <line x1="603" y1="242" x2="603" y2="382" stroke="rgba(29,28,26,0.22)" stroke-width="1.5"/>

          <!-- Tiradores verticales integrados -->
          <rect class="p-detail" x="303" y="286" width="6" height="44" rx="3"/>
          <rect class="p-detail" x="325" y="286" width="6" height="44" rx="3"/>
          <rect class="p-detail" x="589" y="286" width="6" height="44" rx="3"/>
          <rect class="p-detail" x="611" y="286" width="6" height="44" rx="3"/>
          ${isGlass ? `<path d="M220,256 L275,365 M245,256 L300,365 M500,256 L555,365" stroke="rgba(255,255,255,0.52)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    escritorio(isGlass) {
      return `
        <ellipse cx="460" cy="482" rx="280" ry="24" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas traseras -->
          <polygon class="p-detail-dark" points="236,274 252,274 242,445 228,445"/>
          <polygon class="p-detail-dark" points="668,274 684,274 692,445 678,445"/>
          <!-- Estructura caballete/marco -->
          <polygon class="p-detail" points="195,280 216,280 198,476 180,476"/>
          <polygon class="p-detail" points="704,280 725,280 740,476 722,476"/>
          <!-- Barra de refuerzo lateral -->
          <rect class="p-detail-dark" x="200" y="395" width="38" height="8" rx="2"/>
          <rect class="p-detail-dark" x="682" y="395" width="38" height="8" rx="2"/>

          <!-- Módulo de cajones suspendido -->
          <rect class="p-side" x="488" y="280" width="212" height="86" rx="2"/>
          <rect class="p-main" x="494" y="286" width="200" height="34" rx="1"/>
          <rect class="p-main" x="494" y="324" width="200" height="36" rx="1"/>
          <rect class="p-detail" x="572" y="300" width="44" height="5" rx="2.5"/>
          <rect class="p-detail" x="572" y="339" width="44" height="5" rx="2.5"/>

          <!-- Faldón izquierdo ligero -->
          <rect class="p-side" x="216" y="278" width="272" height="32" rx="1"/>

          <!-- Tablero superior -->
          <polygon class="p-side" points="168,260 752,260 742,282 178,282"/>
          <polygon class="p-main" points="222,208 698,208 752,260 168,260"/>
          <polygon class="p-sheen" points="222,208 698,208 752,260 168,260"/>

          <!-- Pasacables de detalle -->
          <ellipse class="p-detail" cx="635" cy="226" rx="14" ry="5"/>
          ${isGlass ? `<path d="M275,216 L345,254 M520,216 L590,254" stroke="rgba(255,255,255,0.68)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    sillon(isGlass) {
      return `
        <ellipse cx="460" cy="494" rx="210" ry="25" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas cónicas de madera/metal -->
          <polygon class="p-detail-dark" points="300,395 320,395 306,465 290,465"/>
          <polygon class="p-detail-dark" points="600,395 620,395 630,465 614,465"/>
          <polygon class="p-detail" points="274,405 298,405 280,488 260,488"/>
          <polygon class="p-detail" points="622,405 646,405 660,488 640,488"/>

          <!-- Base estructural inferior visible -->
          <rect class="p-detail" x="262" y="388" width="396" height="22" rx="6"/>

          <!-- Respaldo acolchado envolvente -->
          <path class="p-main" d="M286,280 L286,182 C286,144 316,126 364,126 L556,126 C604,126 634,144 634,182 L634,280 Z"/>
          <path class="p-sheen" d="M286,280 L286,182 C286,144 316,126 364,126 L556,126 C604,126 634,144 634,182 L634,280 Z"/>

          <!-- Reposabrazos izquierdo y derecho -->
          <rect class="p-side" x="248" y="248" width="68" height="142" rx="18"/>
          <rect class="p-main" x="252" y="252" width="60" height="134" rx="16"/>
          <rect class="p-side" x="604" y="248" width="68" height="142" rx="18"/>
          <rect class="p-main" x="608" y="252" width="60" height="134" rx="16"/>

          <!-- Cojín de respaldo lumbar -->
          <rect class="p-main" x="318" y="168" width="284" height="130" rx="22"/>
          <path class="p-seam" d="M338,184 L582,184"/>

          <!-- Cojín de asiento mullido -->
          <rect class="p-side" x="296" y="312" width="328" height="78" rx="18"/>
          <rect class="p-main" x="298" y="294" width="324" height="78" rx="20"/>
          <rect class="p-sheen" x="298" y="294" width="324" height="78" rx="20"/>
          <path class="p-seam" d="M318,308 L602,308"/>

          <!-- Ribete detalle en reposabrazos -->
          <rect class="p-detail" x="275" y="268" width="6" height="86" rx="3" opacity="0.65"/>
          <rect class="p-detail" x="639" y="268" width="6" height="86" rx="3" opacity="0.65"/>
          ${isGlass ? `<path d="M350,200 L420,275 M380,200 L450,275" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    sofa(isGlass) {
      return `
        <ellipse cx="460" cy="486" rx="330" ry="26" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas nórdicas -->
          <polygon class="p-detail-dark" points="168,408 186,408 175,468 160,468"/>
          <polygon class="p-detail-dark" points="734,408 752,408 760,468 745,468"/>
          <polygon class="p-detail" points="142,415 164,415 150,484 132,484"/>
          <polygon class="p-detail" points="756,415 778,415 788,484 770,484"/>
          <rect class="p-detail" x="142" y="400" width="636" height="18" rx="5"/>

          <!-- Respaldo amplio -->
          <rect class="p-main" x="146" y="190" width="628" height="175" rx="22"/>
          <rect class="p-sheen" x="146" y="190" width="628" height="175" rx="22"/>

          <!-- Tres cojines de respaldo -->
          <rect class="p-main" x="172" y="210" width="186" height="132" rx="16"/>
          <rect class="p-main" x="367" y="210" width="186" height="132" rx="16"/>
          <rect class="p-main" x="562" y="210" width="186" height="132" rx="16"/>

          <!-- Brazos laterales -->
          <rect class="p-side" x="122" y="264" width="56" height="142" rx="16"/>
          <rect class="p-main" x="126" y="268" width="48" height="134" rx="14"/>
          <rect class="p-side" x="742" y="264" width="56" height="142" rx="16"/>
          <rect class="p-main" x="746" y="268" width="48" height="134" rx="14"/>

          <!-- Cojines de asiento -->
          <rect class="p-side" x="166" y="330" width="588" height="72" rx="14"/>
          <rect class="p-main" x="172" y="316" width="188" height="72" rx="14"/>
          <rect class="p-main" x="366" y="316" width="188" height="72" rx="14"/>
          <rect class="p-main" x="560" y="316" width="188" height="72" rx="14"/>
          <path class="p-seam" d="M188,332 L344,332 M382,332 L538,332 M576,332 L732,332"/>

          <!-- Detalles de ribete -->
          <rect class="p-detail" x="146" y="284" width="6" height="92" rx="3" opacity="0.6"/>
          <rect class="p-detail" x="768" y="284" width="6" height="92" rx="3" opacity="0.6"/>
          ${isGlass ? `<path d="M250,240 L310,300 M440,240 L500,300" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    "mesa-centro"(isGlass) {
      return `
        <ellipse cx="460" cy="486" rx="250" ry="24" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas bajas escultóricas -->
          <polygon class="p-detail-dark" points="268,365 286,365 274,462 258,462"/>
          <polygon class="p-detail-dark" points="634,365 652,365 662,462 646,462"/>
          <polygon class="p-detail" points="234,376 258,376 244,484 224,484"/>
          <polygon class="p-detail" points="662,376 686,376 696,484 676,484"/>
          <!-- Balda inferior revistero -->
          <polygon class="p-detail" points="248,430 672,430 662,442 258,442"/>

          <!-- Sobre grueso arquitectónico -->
          <polygon class="p-side" points="196,348 724,348 710,378 210,378"/>
          <polygon class="p-main" points="262,286 658,286 724,348 196,348"/>
          <polygon class="p-sheen" points="262,286 658,286 724,348 196,348"/>
          ${isGlass ? `<path d="M315,296 L390,340 M355,296 L430,340 M540,296 L605,340" stroke="rgba(255,255,255,0.68)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    cama(isGlass) {
      return `
        <ellipse cx="460" cy="492" rx="310" ry="24" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas -->
          <rect class="p-detail" x="218" y="425" width="18" height="62" rx="3"/>
          <rect class="p-detail" x="684" y="425" width="18" height="62" rx="3"/>

          <!-- Cabecero arquitectónico -->
          <rect class="p-side" x="200" y="140" width="520" height="210" rx="14"/>
          <rect class="p-main" x="210" y="148" width="500" height="196" rx="10"/>
          <rect class="p-sheen" x="210" y="148" width="500" height="196" rx="10"/>
          <line class="p-seam" x1="460" y1="158" x2="460" y2="310"/>

          <!-- Colchón y ropa de cama (usa detalle para textiles/contraste) -->
          <rect class="p-detail" x="228" y="294" width="464" height="84" rx="12"/>
          <!-- Almohadas -->
          <rect class="p-detail" x="256" y="256" width="182" height="54" rx="14"/>
          <rect class="p-detail" x="482" y="256" width="182" height="54" rx="14"/>
          <rect class="p-main" x="220" y="340" width="480" height="44" rx="8" opacity="0.88"/>

          <!-- Bastidor inferior principal -->
          <rect class="p-side" x="196" y="376" width="528" height="56" rx="6"/>
          <rect class="p-main" x="202" y="382" width="516" height="44" rx="4"/>
          ${isGlass ? `<path d="M280,175 L350,250 M540,175 L610,250" stroke="rgba(255,255,255,0.55)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    mesita(isGlass) {
      return `
        <ellipse cx="460" cy="492" rx="165" ry="22" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas finas -->
          <polygon class="p-detail-dark" points="354,410 370,410 362,472 348,472"/>
          <polygon class="p-detail-dark" points="550,410 566,410 572,472 558,472"/>
          <polygon class="p-detail" points="334,416 352,416 340,490 326,490"/>
          <polygon class="p-detail" points="568,416 586,416 594,490 580,490"/>

          <!-- Estructura cúbica -->
          <polygon class="p-main" points="342,205 578,205 604,232 316,232"/>
          <rect class="p-side" x="316" y="232" width="288" height="186" rx="4"/>
          <rect class="p-main" x="328" y="244" width="264" height="78" rx="2"/>
          <rect class="p-main" x="328" y="330" width="264" height="76" rx="2"/>
          <rect class="p-sheen" x="316" y="232" width="288" height="186" rx="4"/>

          <!-- Tiradores -->
          <rect class="p-detail" x="434" y="279" width="52" height="7" rx="3.5"/>
          <rect class="p-detail" x="434" y="364" width="52" height="7" rx="3.5"/>
          ${isGlass ? `<path d="M360,256 L410,305 M480,340 L530,390" stroke="rgba(255,255,255,0.6)" stroke-width="2.2" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    banco(isGlass) {
      return `
        <ellipse cx="460" cy="486" rx="270" ry="22" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas en caballete -->
          <polygon class="p-detail-dark" points="236,368 254,368 240,468 224,468"/>
          <polygon class="p-detail-dark" points="666,368 684,368 696,468 680,468"/>
          <polygon class="p-detail" points="200,378 222,378 202,486 184,486"/>
          <polygon class="p-detail" points="698,378 720,378 736,486 718,486"/>
          <rect class="p-detail" x="212" y="428" width="496" height="10" rx="3"/>

          <!-- Asiento corrido -->
          <polygon class="p-side" points="172,350 748,350 736,378 184,378"/>
          <polygon class="p-main" points="220,308 700,308 748,350 172,350"/>
          <polygon class="p-sheen" points="220,308 700,308 748,350 172,350"/>
          <path class="p-seam" d="M236,322 L684,322"/>
          ${isGlass ? `<path d="M295,314 L350,344 M540,314 L595,344" stroke="rgba(255,255,255,0.65)" stroke-width="2.5" stroke-linecap="round"/>` : ""}
        </g>
      `;
    },

    vitrina(isGlass) {
      return `
        <ellipse cx="460" cy="508" rx="195" ry="22" fill="url(#floor-shadow)"/>
        <g filter="url(#soft-drop)">
          <!-- Patas -->
          <rect class="p-detail" x="322" y="454" width="16" height="52" rx="3"/>
          <rect class="p-detail" x="582" y="454" width="16" height="52" rx="3"/>

          <!-- Cuerpo superior vitrina -->
          <rect class="p-side" x="302" y="96" width="316" height="362" rx="5"/>
          <rect class="p-main" x="312" y="106" width="296" height="342" rx="3"/>

          <!-- Baldas interiores visibles tras el cristal -->
          <rect class="p-detail-dark" x="324" y="176" width="272" height="8" rx="1"/>
          <rect class="p-detail-dark" x="324" y="254" width="272" height="8" rx="1"/>
          <rect class="p-detail-dark" x="324" y="332" width="272" height="8" rx="1"/>

          <!-- Paneles acristalados de las puertas -->
          <rect x="326" y="118" width="128" height="228" rx="2" fill="rgba(220,235,238,0.28)" stroke="rgba(255,255,255,0.55)" stroke-width="1.2"/>
          <rect x="466" y="118" width="128" height="228" rx="2" fill="rgba(220,235,238,0.28)" stroke="rgba(255,255,255,0.55)" stroke-width="1.2"/>
          <path d="M342,140 L410,245 M482,140 L550,245" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round"/>

          <!-- Parte inferior cerrada y tiradores -->
          <rect class="p-main" x="322" y="356" width="134" height="84" rx="2"/>
          <rect class="p-main" x="464" y="356" width="134" height="84" rx="2"/>
          <rect class="p-detail" x="444" y="255" width="6" height="56" rx="3"/>
          <rect class="p-detail" x="470" y="255" width="6" height="56" rx="3"/>
          ${isGlass ? `<path d="M350,375 L410,425 M495,375 L555,425" stroke="rgba(255,255,255,0.55)" stroke-width="2.2" stroke-linecap="round"/>` : ""}
        </g>
      `;
    }
  };

  function renderDimensionGuides(dimensions) {
    return `
      <g class="dimension-guides" opacity="0.88">
        <!-- Cota horizontal inferior -->
        <line class="dim-line" x1="175" y1="536" x2="745" y2="536"/>
        <line class="dim-tick" x1="175" y1="528" x2="175" y2="544"/>
        <line class="dim-tick" x1="745" y1="528" x2="745" y2="544"/>
        <rect x="385" y="523" width="150" height="24" rx="12" fill="#F7F5F0" stroke="#DDD5C7" stroke-width="1"/>
        <text class="dim-text" x="460" y="539" text-anchor="middle">${dimensions}</text>

        <!-- Cota vertical derecha -->
        <line class="dim-line" x1="816" y1="130" x2="816" y2="480"/>
        <line class="dim-tick" x1="808" y1="130" x2="824" y2="130"/>
        <line class="dim-tick" x1="808" y1="480" x2="824" y2="480"/>
      </g>
    `;
  }

  /**
   * API pública de renderizado SVG
   */
  window.renderFurnitureSVG = function renderFurnitureSVG(svgEl, state) {
    if (!svgEl) return;

    const { furniture, material, primaryColor, detailColor, showGrid } = state;
    const isGlass = material.textureType === "glass-clear" || material.textureType === "glass-smoked";

    const defs = buildMaterialDefs(primaryColor, detailColor, material);
    const modelBuilder = MODELS[furniture.id] || MODELS.mesa;

    const roomBackdrop = `
      <!-- Fondo arquitectónico nórdico -->
      <rect x="0" y="0" width="920" height="430" fill="url(#room-wall-grad)"/>
      <rect x="0" y="430" width="920" height="170" fill="url(#room-floor-grad)"/>
      <line x1="0" y1="430" x2="920" y2="430" stroke="#D7CFC1" stroke-width="1.2"/>
      <!-- Haz sutil de luz diagonal -->
      <polygon points="0,0 320,0 520,430 120,430" fill="rgba(255,255,255,0.22)"/>
    `;

    const guides = showGrid ? renderDimensionGuides(furniture.dimensions) : "";

    svgEl.innerHTML = `
      ${defs}
      ${roomBackdrop}
      <g class="furniture-model">
        ${modelBuilder(isGlass)}
      </g>
      ${guides}
    `;
  };
})();
