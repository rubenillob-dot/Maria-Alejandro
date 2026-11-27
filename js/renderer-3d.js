/**
 * Motor 3D Interactivo en Canvas 2D para Creamuebles (sin dependencias externas).
 * - Proyección en perspectiva 3D real con rotación orbital 360° (arrastrar) y zoom
 * - Texturas procedurales mapeadas con perspectiva sobre cada cara según material y color
 * - Separación independiente de color entre estructura principal y detalles/patas
 * - Iluminación direccional de estudio, reflejos especulares, transparencias de cristal y sombra en suelo
 */

(function () {
  const TEX_SIZE = 256;

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function hexToRgb(hex) {
    const clean = (hex || "#C69C6D").replace("#", "");
    const full = clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean.padEnd(6, "0");
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    const toHex = (n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function shadeHex(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    if (amount >= 0) {
      return rgbToHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
    }
    const f = 1 + amount;
    return rgbToHex(r * f, g * f, b * f);
  }

  function getLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  /* ========================================================================
     GENERACIÓN DE TEXTURAS PROCEDURALES (256x256)
     ======================================================================== */
  const textureCache = new Map();

  function createTextureCanvas(hex, textureType) {
    const key = `${hex.toUpperCase()}|${textureType}`;
    if (textureCache.has(key)) return textureCache.get(key);

    const c = document.createElement("canvas");
    c.width = TEX_SIZE;
    c.height = TEX_SIZE;
    const g = c.getContext("2d");
    const isDark = getLuminance(hex) < 0.36;

    // Fondo base
    g.fillStyle = hex;
    g.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

    if (textureType === "wood") {
      const darkLine = isDark ? "rgba(255,255,255,0.12)" : "rgba(55,28,8,0.18)";
      const lightLine = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,244,225,0.16)";
      for (let y = 4; y < TEX_SIZE; y += 9) {
        g.beginPath();
        g.strokeStyle = y % 18 === 4 ? darkLine : lightLine;
        g.lineWidth = y % 27 === 4 ? 1.8 : 1.1;
        g.moveTo(0, y);
        const amp = 4 + (y % 5);
        g.bezierCurveTo(TEX_SIZE * 0.33, y - amp, TEX_SIZE * 0.66, y + amp, TEX_SIZE, y);
        g.stroke();
      }
      g.strokeStyle = darkLine;
      g.lineWidth = 1;
      g.beginPath();
      g.ellipse(150, 124, 24, 6, 0.08, 0, Math.PI * 2);
      g.stroke();
    } else if (textureType === "marble") {
      const vein = isDark ? "rgba(255,255,255,0.24)" : "rgba(65,58,52,0.20)";
      const veinSoft = isDark ? "rgba(255,255,255,0.10)" : "rgba(85,78,70,0.10)";
      g.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        g.beginPath();
        g.strokeStyle = i % 2 === 0 ? vein : veinSoft;
        g.lineWidth = i % 2 === 0 ? 1.8 : 3.2;
        const y0 = 20 + i * 38;
        g.moveTo(0, y0);
        g.bezierCurveTo(85, y0 + 28, 165, y0 - 32, TEX_SIZE, y0 + 14);
        g.stroke();
      }
    } else if (textureType === "travertine") {
      const band = isDark ? "rgba(255,255,255,0.08)" : "rgba(80,68,52,0.11)";
      for (let y = 8; y < TEX_SIZE; y += 22) {
        g.fillStyle = band;
        g.fillRect(0, y, TEX_SIZE, 6);
        g.beginPath();
        g.ellipse((y * 7) % 210 + 20, y + 12, 12, 2.2, 0, 0, Math.PI * 2);
        g.fill();
      }
    } else if (textureType === "granite") {
      const darkDot = isDark ? "rgba(255,255,255,0.22)" : "rgba(35,33,30,0.24)";
      const lightDot = "rgba(255,255,255,0.30)";
      for (let i = 0; i < 420; i++) {
        const x = (i * 73) % TEX_SIZE;
        const y = (i * 137) % TEX_SIZE;
        g.fillStyle = i % 3 === 0 ? lightDot : darkDot;
        g.fillRect(x, y, (i % 2) + 1.5, (i % 2) + 1.5);
      }
    } else if (textureType === "metal-brushed") {
      const grad = g.createLinearGradient(0, 0, TEX_SIZE, TEX_SIZE);
      grad.addColorStop(0, "rgba(255,255,255,0.22)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.02)");
      grad.addColorStop(1, "rgba(0,0,0,0.16)");
      g.fillStyle = grad;
      g.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
      for (let y = 0; y < TEX_SIZE; y += 3) {
        g.fillStyle = y % 6 === 0 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
        g.fillRect(0, y, TEX_SIZE, 1);
      }
    } else if (textureType === "metal-matte" || textureType === "metal-forged") {
      const alpha = textureType === "metal-forged" ? 0.16 : 0.07;
      for (let i = 0; i < 360; i++) {
        const x = (i * 59) % TEX_SIZE;
        const y = (i * 101) % TEX_SIZE;
        g.fillStyle = i % 2 === 0 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
        g.fillRect(x, y, 2, 2);
      }
    } else if (textureType === "textile-linen") {
      const warp = isDark ? "rgba(255,255,255,0.10)" : "rgba(60,52,42,0.10)";
      const weft = "rgba(255,255,255,0.12)";
      for (let i = 0; i < TEX_SIZE; i += 6) {
        g.fillStyle = warp;
        g.fillRect(0, i, TEX_SIZE, 1.4);
        g.fillStyle = weft;
        g.fillRect(i, 0, 1.4, TEX_SIZE);
      }
    } else if (textureType === "textile-boucle") {
      const curlDark = isDark ? "rgba(255,255,255,0.18)" : "rgba(70,62,52,0.14)";
      const curlLight = "rgba(255,255,255,0.32)";
      for (let y = 6; y < TEX_SIZE; y += 12) {
        for (let x = 6; x < TEX_SIZE; x += 12) {
          g.beginPath();
          g.strokeStyle = (x + y) % 24 === 0 ? curlLight : curlDark;
          g.lineWidth = 1.4;
          g.arc(x + ((y % 24) === 6 ? 2 : -2), y, 3.2, 0, Math.PI * 1.7);
          g.stroke();
        }
      }
    } else if (textureType === "textile-velvet") {
      const grad = g.createRadialGradient(110, 90, 12, 128, 128, 170);
      grad.addColorStop(0, "rgba(255,255,255,0.22)");
      grad.addColorStop(0.55, "rgba(255,255,255,0.03)");
      grad.addColorStop(1, "rgba(0,0,0,0.18)");
      g.fillStyle = grad;
      g.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    } else if (textureType === "textile-leather") {
      const grain = isDark ? "rgba(255,255,255,0.10)" : "rgba(40,20,8,0.14)";
      for (let i = 0; i < 240; i++) {
        const x = (i * 89) % TEX_SIZE;
        const y = (i * 149) % TEX_SIZE;
        g.strokeStyle = grain;
        g.lineWidth = 1;
        g.beginPath();
        g.arc(x, y, 4, 0.2, 2.3);
        g.stroke();
      }
    } else if (textureType === "ceramic") {
      const grad = g.createLinearGradient(0, 0, TEX_SIZE, TEX_SIZE);
      grad.addColorStop(0, "rgba(255,255,255,0.14)");
      grad.addColorStop(1, "rgba(0,0,0,0.08)");
      g.fillStyle = grad;
      g.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
    }

    if (textureCache.size > 40) {
      const firstKey = textureCache.keys().next().value;
      textureCache.delete(firstKey);
    }
    textureCache.set(key, c);
    return c;
  }

  /* ========================================================================
     CONSTRUCCIÓN DE GEOMETRÍA 3D PARA LOS 12 MUEBLES
     ======================================================================== */
  /**
   * Añade una caja 3D (con posible estrechamiento inferior en patas cónicas)
   * Coordenadas en cm centradas en X=0, Z=0, suelo Y=0 hacia arriba (+Y)
   */
  function addBox(faces, cx, yBottom, cz, w, h, d, role, opts = {}) {
    const hw = w / 2;
    const hd = d / 2;
    const taper = opts.taperBottom ?? 1;
    const bhw = hw * taper;
    const bhd = hd * taper;
    const tiltX = opts.tiltX || 0; // desplazamiento en X arriba->abajo
    const tiltZ = opts.tiltZ || 0;
    const sub = opts.subdivide || 1;
    const y0 = yBottom;
    const y1 = yBottom + h;

    // 8 vértices: 4 abajo (0..3), 4 arriba (4..7)
    const v = [
      { x: cx - bhw + tiltX, y: y0, z: cz + bhd + tiltZ }, // 0 front-left-bottom
      { x: cx + bhw + tiltX, y: y0, z: cz + bhd + tiltZ }, // 1 front-right-bottom
      { x: cx + bhw + tiltX, y: y0, z: cz - bhd + tiltZ }, // 2 back-right-bottom
      { x: cx - bhw + tiltX, y: y0, z: cz - bhd + tiltZ }, // 3 back-left-bottom
      { x: cx - hw, y: y1, z: cz + hd }, // 4 front-left-top
      { x: cx + hw, y: y1, z: cz + hd }, // 5 front-right-top
      { x: cx + hw, y: y1, z: cz - hd }, // 6 back-right-top
      { x: cx - hw, y: y1, z: cz - hd }  // 7 back-left-top
    ];

    // 6 caras con orden CCW visto desde fuera
    const quadDefs = [
      [4, 5, 6, 7], // top (+Y) -> índice 0 (orientado)
      [0, 3, 2, 1], // bottom (-Y)
      [0, 1, 5, 4], // front (+Z)
      [2, 3, 7, 6], // back (-Z)
      [1, 2, 6, 5], // right (+X)
      [3, 0, 4, 7]  // left (-X)
    ];

    quadDefs.forEach((idxs, qIdx) => {
      if (qIdx === 1 && y0 < 1) return; // cara inferior pegada al suelo no visible
      const p0 = v[idxs[0]];
      const p1 = v[idxs[1]];
      const p2 = v[idxs[2]];
      const p3 = v[idxs[3]];

      // Subdivisión automática proporcional al tamaño de cada cara (~28 cm/celda)
      // para evitar cruces en el ordenamiento de profundidad en perspectiva
      const edgeA = Math.hypot(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
      const edgeB = Math.hypot(p3.x - p0.x, p3.y - p0.y, p3.z - p0.z);
      const stepsU = Math.max(sub, Math.min(6, Math.ceil(edgeA / 28)));
      const stepsV = Math.max(sub, Math.min(6, Math.ceil(edgeB / 28)));

      for (let i = 0; i < stepsU; i++) {
        const u0 = i / stepsU;
        const u1 = (i + 1) / stepsU;
        for (let j = 0; j < stepsV; j++) {
          const v0 = j / stepsV;
          const v1 = (j + 1) / stepsV;
          const lerpQuad = (u, wv) => {
            const topX = p0.x + (p1.x - p0.x) * u;
            const topY = p0.y + (p1.y - p0.y) * u;
            const topZ = p0.z + (p1.z - p0.z) * u;
            const botX = p3.x + (p2.x - p3.x) * u;
            const botY = p3.y + (p2.y - p3.y) * u;
            const botZ = p3.z + (p2.z - p3.z) * u;
            return {
              x: topX + (botX - topX) * wv,
              y: topY + (botY - topY) * wv,
              z: topZ + (botZ - topZ) * wv
            };
          };
          faces.push({
            pts: [lerpQuad(u0, v0), lerpQuad(u1, v0), lerpQuad(u1, v1), lerpQuad(u0, v1)],
            uv: [
              [u0 * TEX_SIZE, v0 * TEX_SIZE],
              [u1 * TEX_SIZE, v0 * TEX_SIZE],
              [u1 * TEX_SIZE, v1 * TEX_SIZE],
              [u0 * TEX_SIZE, v1 * TEX_SIZE]
            ],
            edges: [j === 0, i === stepsU - 1, j === stepsV - 1, i === 0],
            role,
            isTop: qIdx === 0
          });
        }
      }
    });
  }

  function buildFurnitureMesh(id) {
    const faces = [];

    if (id === "mesa") {
      // Tablero 220x100x5 a Y=70..75
      addBox(faces, 0, 70, 0, 220, 5, 100, "main", { subdivide: 4 });
      // Travesaño inferior debajo del tablero
      addBox(faces, 0, 62, 0, 174, 6, 66, "detail", { subdivide: 3 });
      // 4 patas anguladas nórdicas
      addBox(faces, -86, 0, 34, 8, 66, 8, "detail", { taperBottom: 0.72, tiltX: -6, tiltZ: 4 });
      addBox(faces, 86, 0, 34, 8, 66, 8, "detail", { taperBottom: 0.72, tiltX: 6, tiltZ: 4 });
      addBox(faces, -86, 0, -34, 8, 66, 8, "detail", { taperBottom: 0.72, tiltX: -6, tiltZ: -4 });
      addBox(faces, 86, 0, -34, 8, 66, 8, "detail", { taperBottom: 0.72, tiltX: 6, tiltZ: -4 });
      return { faces, bounds: { w: 220, h: 75, d: 100 } };
    }

    if (id === "silla") {
      // Patas
      addBox(faces, -21, 0, 20, 4.5, 43, 4.5, "detail", { taperBottom: 0.75, tiltX: -2, tiltZ: 2 });
      addBox(faces, 21, 0, 20, 4.5, 43, 4.5, "detail", { taperBottom: 0.75, tiltX: 2, tiltZ: 2 });
      addBox(faces, -21, 0, -20, 4.5, 44, 4.5, "detail", { taperBottom: 0.75, tiltX: -2, tiltZ: -2 });
      addBox(faces, 21, 0, -20, 4.5, 44, 4.5, "detail", { taperBottom: 0.75, tiltX: 2, tiltZ: -2 });
      // Montantes respaldo
      addBox(faces, -21, 44, -20, 4.2, 34, 4.2, "detail");
      addBox(faces, 21, 44, -20, 4.2, 34, 4.2, "detail");
      // Travesaño
      addBox(faces, 0, 18, 0, 40, 3, 38, "detail");
      // Asiento y respaldo
      addBox(faces, 0, 43, 1, 50, 4.5, 48, "main", { subdivide: 2 });
      addBox(faces, 0, 56, -21, 50, 22, 4.5, "main", { subdivide: 2 });
      return { faces, bounds: { w: 52, h: 79, d: 54 } };
    }

    if (id === "estanteria") {
      // 6 montantes verticales
      [-86, 0, 86].forEach((x) => {
        addBox(faces, x, 0, 16, 4.5, 195, 4.5, "detail");
        addBox(faces, x, 0, -16, 4.5, 195, 4.5, "detail");
      });
      // 5 baldas
      [14, 58, 102, 146, 188].forEach((y) => {
        addBox(faces, 0, y, 0, 180, 3.8, 38, "main", { subdivide: 2 });
      });
      // Módulo cerrado inferior derecho
      addBox(faces, 43, 62, 0, 82, 40, 34, "main", { subdivide: 2 });
      addBox(faces, 39, 79, 17.5, 2.5, 8, 1.5, "detail");
      addBox(faces, 47, 79, 17.5, 2.5, 8, 1.5, "detail");
      return { faces, bounds: { w: 180, h: 195, d: 38 } };
    }

    if (id === "aparador") {
      // Cuerpo 190x45x52 sobre patas de 24cm
      addBox(faces, 0, 24, 0, 190, 52, 45, "main", { subdivide: 3 });
      // Puertas frontales sutiles
      [-69, -23, 23, 69].forEach((x) => {
        addBox(faces, x, 27, 22.8, 43, 46, 1.6, "main", { subdivide: 1 });
      });
      // Tiradores verticales
      [-45, -1, 45].forEach((x) => {
        addBox(faces, x, 43, 24.2, 2, 14, 1.8, "detail");
      });
      // Base y 4 patas
      addBox(faces, 0, 20, 0, 182, 4, 38, "detail");
      [[-84, 15], [84, 15], [-84, -15], [84, -15]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 6, 20, 6, "detail", { taperBottom: 0.72 });
      });
      return { faces, bounds: { w: 190, h: 76, d: 45 } };
    }

    if (id === "escritorio") {
      // Tablero 150x72x4
      addBox(faces, 0, 71, 0, 150, 4, 72, "main", { subdivide: 3 });
      // Cajonera derecha suspendida
      addBox(faces, 42, 46, 2, 54, 25, 62, "main", { subdivide: 2 });
      addBox(faces, 42, 60, 33.4, 50, 10, 1.5, "main");
      addBox(faces, 42, 48, 33.4, 50, 10, 1.5, "main");
      addBox(faces, 42, 64, 34.5, 14, 1.8, 1.5, "detail");
      addBox(faces, 42, 52, 34.5, 14, 1.8, 1.5, "detail");
      // Faldón izquierdo
      addBox(faces, -28, 63, 2, 84, 8, 56, "main");
      // 4 patas
      [[-68, 28], [68, 28], [-68, -28], [68, -28]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 5.5, 71, 5.5, "detail", { taperBottom: 0.75 });
      });
      return { faces, bounds: { w: 150, h: 75, d: 72 } };
    }

    if (id === "sillon") {
      // Base y patas
      addBox(faces, 0, 16, 0, 76, 5, 78, "detail");
      [[-33, 33], [33, 33], [-33, -33], [33, -33]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 5.5, 16, 5.5, "detail", { taperBottom: 0.7 });
      });
      // Asiento y cojín
      addBox(faces, 0, 21, 3, 62, 18, 68, "main", { subdivide: 2 });
      addBox(faces, 0, 37, 5, 58, 10, 62, "main", { subdivide: 2 });
      // Respaldo y cojín lumbar
      addBox(faces, 0, 21, -33, 78, 57, 14, "main", { subdivide: 2 });
      addBox(faces, 0, 44, -22, 56, 30, 12, "main", { subdivide: 2 });
      // Brazos laterales
      addBox(faces, -35, 21, 0, 12, 38, 76, "main", { subdivide: 2 });
      addBox(faces, 35, 21, 0, 12, 38, 76, "main", { subdivide: 2 });
      // Ribete detalle en brazos
      addBox(faces, -35, 59, 0, 4, 2, 64, "detail");
      addBox(faces, 35, 59, 0, 4, 2, 64, "detail");
      return { faces, bounds: { w: 82, h: 78, d: 84 } };
    }

    if (id === "sofa") {
      // Base y patas
      addBox(faces, 0, 14, 0, 220, 5, 86, "detail");
      [[-102, 36], [102, 36], [-102, -36], [102, -36], [0, 36], [0, -36]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 6, 14, 6, "detail", { taperBottom: 0.72 });
      });
      // Estructura base tapizada
      addBox(faces, 0, 19, 2, 204, 16, 82, "main", { subdivide: 2 });
      // 3 cojines de asiento
      [-67, 0, 67].forEach((x) => {
        addBox(faces, x, 35, 6, 65, 12, 72, "main", { subdivide: 2 });
      });
      // Respaldo y 3 cojines lumbares
      addBox(faces, 0, 19, -38, 224, 57, 15, "main", { subdivide: 2 });
      [-67, 0, 67].forEach((x) => {
        addBox(faces, x, 43, -24, 64, 30, 14, "main", { subdivide: 2 });
      });
      // Brazos
      addBox(faces, -108, 19, 0, 14, 38, 88, "main", { subdivide: 2 });
      addBox(faces, 108, 19, 0, 14, 38, 88, "main", { subdivide: 2 });
      addBox(faces, -108, 57, 0, 4, 2, 74, "detail");
      addBox(faces, 108, 57, 0, 4, 2, 74, "detail");
      return { faces, bounds: { w: 230, h: 76, d: 94 } };
    }

    if (id === "mesa-centro") {
      // Tablero grueso 120x70x6 a Y=32..38
      addBox(faces, 0, 32, 0, 120, 6, 70, "main", { subdivide: 2 });
      // Balda revistero inferior
      addBox(faces, 0, 12, 0, 96, 3.5, 50, "detail", { subdivide: 2 });
      // 4 patas robustas bajas
      [[-48, 24], [48, 24], [-48, -24], [48, -24]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 7, 32, 7, "detail", { taperBottom: 0.78 });
      });
      return { faces, bounds: { w: 120, h: 38, d: 70 } };
    }

    if (id === "cama") {
      // Bastidor principal
      addBox(faces, 0, 16, 4, 180, 18, 202, "main", { subdivide: 3 });
      // 4 patas
      [[-82, 98], [82, 98], [-82, -92], [82, -92]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 7, 16, 7, "detail", { taperBottom: 0.75 });
      });
      // Cabecero alto
      addBox(faces, 0, 16, -98, 182, 89, 10, "main", { subdivide: 3 });
      // Colchón (tono detalle para contraste elegante)
      addBox(faces, 0, 34, 8, 166, 20, 188, "detail", { subdivide: 3 });
      // Cubrecama parcial claramente por encima del colchón
      addBox(faces, 0, 54, 48, 170, 5, 110, "main", { subdivide: 2 });
      // 2 almohadas
      addBox(faces, -42, 54, -72, 68, 12, 38, "detail", { subdivide: 1 });
      addBox(faces, 42, 54, -72, 68, 12, 38, "detail", { subdivide: 1 });
      return { faces, bounds: { w: 180, h: 105, d: 210 } };
    }

    if (id === "mesita") {
      // Cuerpo 52x42x36 sobre patas de 18cm
      addBox(faces, 0, 18, 0, 52, 36, 42, "main", { subdivide: 2 });
      addBox(faces, 0, 37, 21.4, 46, 14, 1.5, "main");
      addBox(faces, 0, 21, 21.4, 46, 14, 1.5, "main");
      addBox(faces, 0, 43, 22.6, 14, 2, 1.5, "detail");
      addBox(faces, 0, 27, 22.6, 14, 2, 1.5, "detail");
      [[-20, 16], [20, 16], [-20, -16], [20, -16]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 4.5, 18, 4.5, "detail", { taperBottom: 0.72 });
      });
      return { faces, bounds: { w: 52, h: 54, d: 42 } };
    }

    if (id === "banco") {
      // Asiento corrido 140x40x5.5
      addBox(faces, 0, 39.5, 0, 140, 5.5, 40, "main", { subdivide: 3 });
      // Travesaño inferior
      addBox(faces, 0, 14, 0, 118, 3.5, 22, "detail");
      // Patas caballete
      [[-58, 13], [58, 13], [-58, -13], [58, -13]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 5.5, 40, 5.5, "detail", { taperBottom: 0.76, tiltX: x < 0 ? -3 : 3 });
      });
      return { faces, bounds: { w: 140, h: 45, d: 40 } };
    }

    if (id === "vitrina") {
      // Patas
      [[-42, 15], [42, 15], [-42, -15], [42, -15]].forEach(([x, z]) => {
        addBox(faces, x, 0, z, 5.5, 20, 5.5, "detail", { taperBottom: 0.75 });
      });
      // Estructura exterior vitrina
      addBox(faces, 0, 20, -17, 100, 165, 5, "main", { subdivide: 2 }); // trasera
      addBox(faces, -47, 20, 0, 6, 165, 42, "main", { subdivide: 2 }); // lateral izq
      addBox(faces, 47, 20, 0, 6, 165, 42, "main", { subdivide: 2 });  // lateral der
      addBox(faces, 0, 180, 0, 100, 5, 42, "main", { subdivide: 2 });  // techo
      addBox(faces, 0, 20, 0, 100, 5, 42, "main", { subdivide: 2 });   // suelo
      // Módulo cerrado inferior
      addBox(faces, 0, 25, 2, 88, 46, 36, "main", { subdivide: 2 });
      // Baldas interiores
      [98, 128, 156].forEach((y) => {
        addBox(faces, 0, y, 0, 88, 3, 35, "detail");
      });
      // Puertas acristaladas frontales
      addBox(faces, -22, 72, 19.5, 43, 108, 2, "glass");
      addBox(faces, 22, 72, 19.5, 43, 108, 2, "glass");
      // Tiradores
      addBox(faces, -4, 114, 21.2, 2, 18, 1.8, "detail");
      addBox(faces, 4, 114, 21.2, 2, 18, 1.8, "detail");
      return { faces, bounds: { w: 100, h: 185, d: 42 } };
    }

    return buildFurnitureMesh("mesa");
  }

  /* ========================================================================
     PROYECCIÓN 3D Y RASTERIZACIÓN CON TEXTURAS EN PERSPECTIVA
     ======================================================================== */
  function projectPoint(pt, rotY, rotX, centerY, scale, cx, cy) {
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const x = pt.x;
    const y = pt.y - centerY;
    const z = pt.z;

    // Rotación Y (yaw)
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotación X (pitch)
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const camDist = 680;
    const persp = camDist / (camDist - z2);

    return {
      sx: cx + x1 * scale * persp,
      sy: cy - y2 * scale * persp,
      vx: x1,
      vy: y2,
      vz: z2
    };
  }

  function computeNormal(a, b, c) {
    const ux = b.x - a.x;
    const uy = b.y - a.y;
    const uz = b.z - a.z;
    const vx = c.x - a.x;
    const vy = c.y - a.y;
    const vz = c.z - a.z;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    return { x: nx / len, y: ny / len, z: nz / len };
  }

  function drawTexturedTriangle(ctx, tex, p0, p1, p2, uv0, uv1, uv2) {
    const [u0, v0] = uv0;
    const [u1, v1] = uv1;
    const [u2, v2] = uv2;

    const denom = u0 * (v1 - v2) - v0 * (u1 - u2) + (u1 * v2 - u2 * v1);
    if (Math.abs(denom) < 1e-4) return;

    const a = (p0.sx * (v1 - v2) + p1.sx * (v2 - v0) + p2.sx * (v0 - v1)) / denom;
    const b = (p0.sy * (v1 - v2) + p1.sy * (v2 - v0) + p2.sy * (v0 - v1)) / denom;
    const c = (p0.sx * (u2 - u1) + p1.sx * (u0 - u2) + p2.sx * (u1 - u0)) / denom;
    const d = (p0.sy * (u2 - u1) + p1.sy * (u0 - u2) + p2.sy * (u1 - u0)) / denom;
    const e = (p0.sx * (u1 * v2 - u2 * v1) + p1.sx * (u2 * v0 - u0 * v2) + p2.sx * (u0 * v1 - u1 * v0)) / denom;
    const f = (p0.sy * (u1 * v2 - u2 * v1) + p1.sy * (u2 * v0 - u0 * v2) + p2.sy * (u0 * v1 - u1 * v0)) / denom;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.sx, p0.sy);
    ctx.lineTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.closePath();
    ctx.clip();
    ctx.transform(a, b, c, d, e, f);
    ctx.drawImage(tex, 0, 0);
    ctx.restore();
  }

  /* ========================================================================
     CONTROLADOR DEL ESTUDIO 3D
     ======================================================================== */
  class Studio3DRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.yaw = -0.58;
      this.pitch = 0.34;
      this.zoom = 1.0;
      this.autoRotate = false;
      this.isDragging = false;
      this.lastX = 0;
      this.lastY = 0;
      this.state = null;
      this.meshCache = new Map();
      this.rafId = null;

      this.bindPointerEvents();
    }

    getMesh(id) {
      if (!this.meshCache.has(id)) {
        this.meshCache.set(id, buildFurnitureMesh(id));
      }
      return this.meshCache.get(id);
    }

    setState(state) {
      this.state = state;
      this.render();
    }

    setAutoRotate(enabled) {
      this.autoRotate = enabled;
      if (enabled) {
        this.startLoop();
      } else if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    adjustZoom(delta) {
      this.zoom = clamp(this.zoom + delta, 0.65, 1.65);
      this.render();
    }

    resetCamera() {
      this.yaw = -0.58;
      this.pitch = 0.34;
      this.zoom = 1.0;
      this.render();
    }

    startLoop() {
      if (this.rafId) return;
      const tick = () => {
        if (!this.autoRotate) {
          this.rafId = null;
          return;
        }
        if (!this.isDragging) {
          this.yaw += 0.008;
          this.render();
        }
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    }

    bindPointerEvents() {
      this.canvas.addEventListener("pointerdown", (e) => {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.canvas.setPointerCapture(e.pointerId);
      });

      this.canvas.addEventListener("pointermove", (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.yaw += dx * 0.009;
        this.pitch = clamp(this.pitch + dy * 0.007, 0.08, 1.12);
        this.render();
      });

      const stopDrag = () => {
        this.isDragging = false;
      };
      this.canvas.addEventListener("pointerup", stopDrag);
      this.canvas.addEventListener("pointercancel", stopDrag);
    }

    render() {
      if (!this.state || !this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(rect.width || 920, 300);
      const height = Math.max(rect.height || 600, 240);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
      }

      const ctx = this.ctx;
      ctx.save();
      ctx.scale(dpr, dpr);

      const { furniture, material, primaryColor, detailColor, showGrid } = this.state;
      const mesh = this.getMesh(furniture.id);
      const maxDim = Math.max(mesh.bounds.w, mesh.bounds.h * 1.15, mesh.bounds.d);
      const baseScale = (Math.min(width, height) * 0.62) / maxDim;
      const scale = baseScale * this.zoom;
      const centerY = mesh.bounds.h * 0.48;
      const cx = width * 0.5;
      const cy = height * 0.52;

      // 1. Fondo arquitectónico de estudio
      const bgGrad = ctx.createRadialGradient(cx, height * 0.35, 30, cx, cy, width * 0.72);
      bgGrad.addColorStop(0, "#FDFCF9");
      bgGrad.addColorStop(0.65, "#F1EDE4");
      bgGrad.addColorStop(1, "#E5DEC9");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Suelo sutil en perspectiva
      const floorCenter = projectPoint({ x: 0, y: 0, z: 0 }, this.yaw, this.pitch, centerY, scale, cx, cy);
      if (showGrid) {
        ctx.save();
        ctx.strokeStyle = "rgba(138, 132, 123, 0.22)";
        ctx.lineWidth = 1;
        const gridHalf = Math.ceil(Math.max(mesh.bounds.w, mesh.bounds.d) * 0.75);
        const step = 40;
        for (let g = -gridHalf; g <= gridHalf; g += step) {
          const pA = projectPoint({ x: g, y: 0, z: -gridHalf }, this.yaw, this.pitch, centerY, scale, cx, cy);
          const pB = projectPoint({ x: g, y: 0, z: gridHalf }, this.yaw, this.pitch, centerY, scale, cx, cy);
          ctx.beginPath();
          ctx.moveTo(pA.sx, pA.sy);
          ctx.lineTo(pB.sx, pB.sy);
          ctx.stroke();

          const pC = projectPoint({ x: -gridHalf, y: 0, z: g }, this.yaw, this.pitch, centerY, scale, cx, cy);
          const pD = projectPoint({ x: gridHalf, y: 0, z: g }, this.yaw, this.pitch, centerY, scale, cx, cy);
          ctx.beginPath();
          ctx.moveTo(pC.sx, pC.sy);
          ctx.lineTo(pD.sx, pD.sy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Sombra proyectada suave bajo el mueble
      ctx.save();
      const shadowRx = (mesh.bounds.w * 0.56) * scale;
      const shadowRy = Math.max(18, (mesh.bounds.d * 0.42) * scale * Math.sin(this.pitch + 0.25));
      const shadowGrad = ctx.createRadialGradient(
        floorCenter.sx, floorCenter.sy, shadowRx * 0.1,
        floorCenter.sx, floorCenter.sy, shadowRx
      );
      shadowGrad.addColorStop(0, "rgba(29, 28, 26, 0.24)");
      shadowGrad.addColorStop(0.65, "rgba(29, 28, 26, 0.08)");
      shadowGrad.addColorStop(1, "rgba(29, 28, 26, 0)");
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(floorCenter.sx, floorCenter.sy + 4, shadowRx, shadowRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Texturas activas
      const isGlobalGlass = material.textureType === "glass-clear" || material.textureType === "glass-smoked";
      const mainTex = createTextureCanvas(primaryColor, material.textureType);
      const detailTexType = material.categoryId === "metales" ? material.textureType : "metal-matte";
      const detailTex = createTextureCanvas(detailColor, detailTexType);

      const strokeMain = shadeHex(primaryColor, getLuminance(primaryColor) < 0.35 ? 0.25 : -0.32);
      const strokeDetail = shadeHex(detailColor, getLuminance(detailColor) < 0.35 ? 0.25 : -0.32);

      // Dirección de luz de estudio (en espacio de vista)
      const lightDir = { x: -0.45, y: 0.72, z: 0.52 };
      const lightLen = Math.hypot(lightDir.x, lightDir.y, lightDir.z);
      lightDir.x /= lightLen;
      lightDir.y /= lightLen;
      lightDir.z /= lightLen;

      // 3. Transformar, filtrar y ordenar caras por profundidad
      const projectedFaces = [];

      for (let i = 0; i < mesh.faces.length; i++) {
        const f = mesh.faces[i];
        const tp = f.pts.map((pt) => projectPoint(pt, this.yaw, this.pitch, centerY, scale, cx, cy));
        const n = computeNormal(
          { x: tp[0].vx, y: tp[0].vy, z: tp[0].vz },
          { x: tp[1].vx, y: tp[1].vy, z: tp[1].vz },
          { x: tp[2].vx, y: tp[2].vy, z: tp[2].vz }
        );

        const isGlassFace = f.role === "glass" || (f.role === "main" && isGlobalGlass);

        // Backface culling en espacio de pantalla (winding / normal Z hacia cámara)
        const area2D =
          (tp[1].sx - tp[0].sx) * (tp[2].sy - tp[0].sy) -
          (tp[2].sx - tp[0].sx) * (tp[1].sy - tp[0].sy);
        if (!isGlassFace && area2D >= 0) continue;

        const avgZ = (tp[0].vz + tp[1].vz + tp[2].vz + tp[3].vz) * 0.25;
        const nDotL = clamp(n.x * lightDir.x + n.y * lightDir.y + n.z * lightDir.z, -1, 1);

        projectedFaces.push({
          tp,
          uv: f.uv,
          edges: f.edges || [true, true, true, true],
          role: f.role,
          isGlassFace,
          avgZ,
          nDotL
        });
      }

      projectedFaces.sort((a, b) => a.avgZ - b.avgZ);

      // 4. Dibujar cada cara con textura + sombreado + arista sutil
      for (let i = 0; i < projectedFaces.length; i++) {
        const pf = projectedFaces[i];
        const [p0, p1, p2, p3] = pf.tp;
        const [uv0, uv1, uv2, uv3] = pf.uv;

        if (pf.isGlassFace) {
          const glassColor = fRoleGlassTint(pf.role, material.textureType, primaryColor);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p0.sx, p0.sy);
          ctx.lineTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p3.sx, p3.sy);
          ctx.closePath();
          ctx.fillStyle = glassColor;
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
          ctx.lineWidth = 1;
          ctx.stroke();

          // Reflejo diagonal sutil sobre cristal
          ctx.clip();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(p0.sx * 0.7 + p1.sx * 0.3, p0.sy * 0.7 + p3.sy * 0.3);
          ctx.lineTo(p1.sx * 0.7 + p2.sx * 0.3, p1.sy * 0.4 + p2.sy * 0.6);
          ctx.stroke();
          ctx.restore();
          continue;
        }

        const tex = pf.role === "detail" ? detailTex : mainTex;
        drawTexturedTriangle(ctx, tex, p0, p1, p2, uv0, uv1, uv2);
        drawTexturedTriangle(ctx, tex, p0, p2, p3, uv0, uv2, uv3);

        // Sombreado direccional
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p0.sx, p0.sy);
        ctx.lineTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.closePath();

        if (pf.nDotL > 0.15) {
          const lift = (pf.nDotL - 0.15) * 0.16;
          ctx.fillStyle = `rgba(255, 252, 245, ${lift.toFixed(3)})`;
          ctx.fill();
        } else {
          const dim = clamp((0.15 - pf.nDotL) * 0.28, 0.04, 0.36);
          ctx.fillStyle = `rgba(20, 18, 15, ${dim.toFixed(3)})`;
          ctx.fill();
        }

        ctx.strokeStyle = pf.role === "detail" ? strokeDetail : strokeMain;
        ctx.globalAlpha = 0.42;
        ctx.lineWidth = 0.9;
        const pts = pf.tp;
        for (let eIdx = 0; eIdx < 4; eIdx++) {
          if (!pf.edges[eIdx]) continue;
          const a = pts[eIdx];
          const b = pts[(eIdx + 1) % 4];
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Etiqueta de medidas en 3D si Cotas está activo
      if (showGrid) {
        ctx.save();
        const badgeW = 152;
        const badgeH = 26;
        const bx = cx - badgeW / 2;
        const by = height - 42;
        ctx.fillStyle = "rgba(247, 245, 240, 0.92)";
        ctx.strokeStyle = "#DDD5C7";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(bx, by, badgeW, badgeH, 13);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#5E5951";
        ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(furniture.dimensions, cx, by + badgeH / 2 + 0.5);
        ctx.restore();
      }

      ctx.restore();
    }
  }

  function fRoleGlassTint(role, textureType, primaryColor) {
    if (role === "glass") {
      return "rgba(210, 228, 232, 0.28)";
    }
    const { r, g, b } = hexToRgb(primaryColor);
    const alpha = textureType === "glass-smoked" ? 0.56 : 0.34;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  window.Creamuebles3DRenderer = Studio3DRenderer;
})();
