/**
 * Catálogo de datos del configurador Creamuebles:
 * - 6 tipologías de mobiliario
 * - 5 categorías de material (22 materiales totales)
 * - 10 colores curados de inspiración nórdica/contemporánea
 */

window.CREAMUEBLES_DATA = {
  furnitureTypes: [
    {
      id: "mesa",
      name: "Mesa de comedor",
      dimensions: "220 × 100 × 75 cm",
      basePrice: 1290,
      defaultMaterial: "roble-natural",
      defaultPrimaryColor: "#C69C6D",
      defaultDetailColor: "#1E1E1E",
      icon: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 11h24v3H4z"/>
        <path d="M7 14v11M25 14v11M10 14l-1.5 11M22 14l1.5 11"/>
      </svg>`
    },
    {
      id: "silla",
      name: "Silla minimalista",
      dimensions: "52 × 54 × 79 cm",
      basePrice: 360,
      defaultMaterial: "haya",
      defaultPrimaryColor: "#D8CBB8",
      defaultDetailColor: "#7A4E2D",
      icon: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 6h12v9H10z"/>
        <path d="M9 15h14l1.5 3.5H7.5L9 15z"/>
        <path d="M10 18.5L8.5 27M22 18.5L23.5 27"/>
      </svg>`
    },
    {
      id: "estanteria",
      name: "Estantería modular",
      dimensions: "180 × 38 × 195 cm",
      basePrice: 1120,
      defaultMaterial: "fresno",
      defaultPrimaryColor: "#C69C6D",
      defaultDetailColor: "#3A3C3E",
      icon: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 5v22M26 5v22M16 5v22"/>
        <path d="M6 8h20M6 15h20M6 22h20"/>
      </svg>`
    },
    {
      id: "aparador",
      name: "Aparador",
      dimensions: "190 × 45 × 76 cm",
      basePrice: 1380,
      defaultMaterial: "nogal-americano",
      defaultPrimaryColor: "#7A4E2D",
      defaultDetailColor: "#1E1E1E",
      icon: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="9" width="24" height="12" rx="1"/>
        <path d="M12 9v12M20 9v12M7 21v5M25 21v5"/>
      </svg>`
    },
    {
      id: "escritorio",
      name: "Escritorio",
      dimensions: "150 × 72 × 75 cm",
      basePrice: 890,
      defaultMaterial: "roble-natural",
      defaultPrimaryColor: "#D8CBB8",
      defaultDetailColor: "#1E1E1E",
      icon: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="10" width="24" height="4.5" rx="0.8"/>
        <path d="M6 14.5V26M26 14.5V26M18 14.5v4.5h8"/>
      </svg>`
    },
    {
      id: "sillon",
      name: "Sillón",
      dimensions: "82 × 84 × 78 cm",
      basePrice: 980,
      defaultMaterial: "boucle",
      defaultPrimaryColor: "#F5F2EB",
      defaultDetailColor: "#7A4E2D",
      icon: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 14V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5"/>
        <path d="M5 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v5h12v-5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v6H5v-6z"/>
        <path d="M8 21v5M24 21v5"/>
      </svg>`
    }
  ],

  materialCategories: [
    { id: "maderas", name: "Maderas" },
    { id: "piedras", name: "Piedras y Cerámicos" },
    { id: "metales", name: "Metales" },
    { id: "textiles", name: "Textiles y Tapizados" },
    { id: "cristales", name: "Cristales" }
  ],

  materials: [
    // Maderas
    {
      id: "roble-natural",
      categoryId: "maderas",
      categoryName: "Maderas",
      name: "Roble natural",
      description: "Veta orgánica equilibrada con acabado al aceite mate.",
      defaultHex: "#C69C6D",
      swatchBg: "#C69C6D",
      swatchClass: "tex-wood-grain",
      textureType: "wood",
      priceFactor: 1.0
    },
    {
      id: "nogal-americano",
      categoryId: "maderas",
      categoryName: "Maderas",
      name: "Nogal americano",
      description: "Madera noble oscura de veta profunda y calidez envolvente.",
      defaultHex: "#7A4E2D",
      swatchBg: "#7A4E2D",
      swatchClass: "tex-wood-grain",
      textureType: "wood",
      priceFactor: 1.22
    },
    {
      id: "haya",
      categoryId: "maderas",
      categoryName: "Maderas",
      name: "Haya",
      description: "Grano fino uniforme en tonos rosados y miel suave.",
      defaultHex: "#D3B08A",
      swatchBg: "#D3B08A",
      swatchClass: "tex-wood-grain",
      textureType: "wood",
      priceFactor: 0.96
    },
    {
      id: "fresno",
      categoryId: "maderas",
      categoryName: "Maderas",
      name: "Fresno",
      description: "Fibra elástica clara con vetas expresivas escandinavas.",
      defaultHex: "#DEC7A8",
      swatchBg: "#DEC7A8",
      swatchClass: "tex-wood-grain",
      textureType: "wood",
      priceFactor: 1.05
    },
    {
      id: "pino-nordico",
      categoryId: "maderas",
      categoryName: "Maderas",
      name: "Pino nórdico",
      description: "Madera ligera de crecimiento lento y nudos sutiles.",
      defaultHex: "#E3CFAF",
      swatchBg: "#E3CFAF",
      swatchClass: "tex-wood-grain",
      textureType: "wood",
      priceFactor: 0.88
    },
    {
      id: "bambu",
      categoryId: "maderas",
      categoryName: "Maderas",
      name: "Bambú",
      description: "Laminado sostenible de fibra recta y alta densidad.",
      defaultHex: "#C9A86A",
      swatchBg: "#C9A86A",
      swatchClass: "tex-wood-grain",
      textureType: "wood",
      priceFactor: 0.98
    },

    // Piedras y Cerámicos
    {
      id: "marmol-carrara",
      categoryId: "piedras",
      categoryName: "Piedras y Cerámicos",
      name: "Mármol blanco Carrara",
      description: "Superficie pulida con delicadas vetas grises fluidas.",
      defaultHex: "#F2EFE9",
      swatchBg: "#F2EFE9",
      swatchClass: "tex-stone-vein",
      textureType: "marble",
      priceFactor: 1.38
    },
    {
      id: "marmol-marquina",
      categoryId: "piedras",
      categoryName: "Piedras y Cerámicos",
      name: "Mármol negro Marquina",
      description: "Piedra mineral profunda atravesada por vetas claras.",
      defaultHex: "#232322",
      swatchBg: "#232322",
      swatchClass: "tex-stone-vein",
      textureType: "marble",
      priceFactor: 1.42
    },
    {
      id: "travertino",
      categoryId: "piedras",
      categoryName: "Piedras y Cerámicos",
      name: "Travertino",
      description: "Roca caliza porosa de estratos arena apomazados.",
      defaultHex: "#D8CBB8",
      swatchBg: "#D8CBB8",
      swatchClass: "tex-wood-grain",
      textureType: "travertine",
      priceFactor: 1.3
    },
    {
      id: "granito",
      categoryId: "piedras",
      categoryName: "Piedras y Cerámicos",
      name: "Granito",
      description: "Mineral moteado de cuarzo y mica de gran resistencia.",
      defaultHex: "#9D9890",
      swatchBg: "#9D9890",
      swatchClass: "tex-stone-speckle",
      textureType: "granite",
      priceFactor: 1.25
    },
    {
      id: "porcelanico",
      categoryId: "piedras",
      categoryName: "Piedras y Cerámicos",
      name: "Porcelánico",
      description: "Cerámica técnica ultracompacta de acabado sedoso mate.",
      defaultHex: "#E6E1D8",
      swatchBg: "#E6E1D8",
      swatchClass: "tex-stone-speckle",
      textureType: "ceramic",
      priceFactor: 1.18
    },

    // Metales
    {
      id: "acero-negro-mate",
      categoryId: "metales",
      categoryName: "Metales",
      name: "Acero negro mate",
      description: "Acero lacado al horno con textura microgranulada mate.",
      defaultHex: "#1E1E1E",
      swatchBg: "#1E1E1E",
      swatchClass: "tex-metal-brushed",
      textureType: "metal-matte",
      priceFactor: 1.08
    },
    {
      id: "laton-cepillado",
      categoryId: "metales",
      categoryName: "Metales",
      name: "Latón cepillado",
      description: "Reflejo dorado cálido con cepillado direccional satinado.",
      defaultHex: "#C5A059",
      swatchBg: "#C5A059",
      swatchClass: "tex-metal-brushed",
      textureType: "metal-brushed",
      priceFactor: 1.26
    },
    {
      id: "aluminio-anodizado",
      categoryId: "metales",
      categoryName: "Metales",
      name: "Aluminio anodizado",
      description: "Aleación ligera de brillo sutil satinado arquitectónico.",
      defaultHex: "#B5B3AE",
      swatchBg: "#B5B3AE",
      swatchClass: "tex-metal-brushed",
      textureType: "metal-brushed",
      priceFactor: 1.12
    },
    {
      id: "hierro-forjado",
      categoryId: "metales",
      categoryName: "Metales",
      name: "Hierro forjado",
      description: "Forja artesanal oscura con sutil carácter mineral.",
      defaultHex: "#3A3C3E",
      swatchBg: "#3A3C3E",
      swatchClass: "tex-stone-speckle",
      textureType: "metal-forged",
      priceFactor: 1.16
    },

    // Textiles y Tapizados
    {
      id: "lino-natural",
      categoryId: "textiles",
      categoryName: "Textiles y Tapizados",
      name: "Lino natural",
      description: "Trama vegetal transpirable con caída orgánica luminosa.",
      defaultHex: "#DFD7C8",
      swatchBg: "#DFD7C8",
      swatchClass: "tex-textile-weave",
      textureType: "textile-linen",
      priceFactor: 1.06
    },
    {
      id: "terciopelo",
      categoryId: "textiles",
      categoryName: "Textiles y Tapizados",
      name: "Terciopelo",
      description: "Pelo corto denso con suaves cambios de luz según el tacto.",
      defaultHex: "#2C4D59",
      swatchBg: "#2C4D59",
      swatchClass: "tex-metal-brushed",
      textureType: "textile-velvet",
      priceFactor: 1.18
    },
    {
      id: "boucle",
      categoryId: "textiles",
      categoryName: "Textiles y Tapizados",
      name: "Bouclé",
      description: "Tejido rizado de lana y algodón de gran volumen táctil.",
      defaultHex: "#F5F2EB",
      swatchBg: "#F5F2EB",
      swatchClass: "tex-textile-boucle",
      textureType: "textile-boucle",
      priceFactor: 1.24
    },
    {
      id: "piel-cuero",
      categoryId: "textiles",
      categoryName: "Textiles y Tapizados",
      name: "Piel / Cuero",
      description: "Cuero plena flor curtido vegetal con grano natural.",
      defaultHex: "#8C5835",
      swatchBg: "#8C5835",
      swatchClass: "tex-stone-speckle",
      textureType: "textile-leather",
      priceFactor: 1.36
    },
    {
      id: "algodon-organico",
      categoryId: "textiles",
      categoryName: "Textiles y Tapizados",
      name: "Algodón orgánico",
      description: "Loneta suave de trama tupida y certificación ecológica.",
      defaultHex: "#D8CBB8",
      swatchBg: "#D8CBB8",
      swatchClass: "tex-textile-weave",
      textureType: "textile-linen",
      priceFactor: 1.02
    },

    // Cristales
    {
      id: "vidrio-templado",
      categoryId: "cristales",
      categoryName: "Cristales",
      name: "Vidrio templado transparente",
      description: "Cristal extraclaro de seguridad con cantos pulidos.",
      defaultHex: "#DCE7E8",
      swatchBg: "#DCE7E8",
      swatchClass: "tex-glass-clear",
      textureType: "glass-clear",
      priceFactor: 1.14
    },
    {
      id: "cristal-ahumado",
      categoryId: "cristales",
      categoryName: "Cristales",
      name: "Cristal ahumado",
      description: "Vidrio templado tintado en masa con reflejo arquitectónico.",
      defaultHex: "#555A5E",
      swatchBg: "#555A5E",
      swatchClass: "tex-glass-clear",
      textureType: "glass-smoked",
      priceFactor: 1.2
    }
  ],

  colors: [
    { name: "Blanco roto", hex: "#F5F2EB" },
    { name: "Arena", hex: "#D8CBB8" },
    { name: "Gris piedra", hex: "#9D9890" },
    { name: "Antracita", hex: "#3A3C3E" },
    { name: "Negro mate", hex: "#1E1E1E" },
    { name: "Verde salvia", hex: "#7D8E7A" },
    { name: "Terracota", hex: "#B86B4B" },
    { name: "Azul petróleo", hex: "#2C4D59" },
    { name: "Madera natural", hex: "#C69C6D" },
    { name: "Tostado", hex: "#7A4E2D" }
  ]
};
