/**
 * Controlador principal de Creamuebles:
 * - Estado del configurador en tiempo real (12 muebles, 22 materiales, 10 colores + HEX)
 * - Conmutación fluida entre Vista 2D (SVG arquitectónico) y Vista 3D (Canvas orbital)
 * - Cálculo dinámico de precio orientativo y ficha resumen
 * - Conexión automática con el formulario de Contacto
 * - Navegación fija, menú móvil y animaciones scroll-reveal
 */

(function () {
  const DATA = window.CREAMUEBLES_DATA;
  if (!DATA) return;

  const state = {
    furnitureId: "mesa",
    categoryId: "maderas",
    materialId: "roble-natural",
    primaryColor: "#C69C6D",
    detailColor: "#1E1E1E",
    activeColorTarget: "primary", // "primary" | "detail"
    syncColors: false,
    showGrid: true,
    viewMode: "2d", // "2d" | "3d"
    autoRotate: false
  };

  let renderer3D = null;

  // Referencias DOM
  const els = {
    header: document.getElementById("site-header"),
    navToggle: document.getElementById("nav-toggle"),
    mainNav: document.getElementById("main-nav"),
    navLinks: document.querySelectorAll(".nav-link"),

    svgViewport: document.getElementById("svg-viewport"),
    furnitureSvg: document.getElementById("furniture-svg"),
    canvas3D: document.getElementById("furniture-3d-canvas"),
    hud3D: document.getElementById("hud-3d"),
    viewModeBtns: document.querySelectorAll("[data-view-mode]"),
    autoRotateBtn: document.getElementById("auto-rotate-btn"),
    zoomInBtn: document.getElementById("zoom-in-btn"),
    zoomOutBtn: document.getElementById("zoom-out-btn"),
    resetCameraBtn: document.getElementById("reset-camera-btn"),

    stageBadge: document.getElementById("stage-category-badge"),
    stageDimensions: document.getElementById("stage-dimensions"),
    stageMaterialSwatch: document.getElementById("stage-material-swatch"),
    stageMaterialName: document.getElementById("stage-material-name"),
    stageMaterialDesc: document.getElementById("stage-material-desc"),
    stagePrimaryDot: document.getElementById("stage-primary-dot"),
    stagePrimaryHex: document.getElementById("stage-primary-hex"),
    stageDetailDot: document.getElementById("stage-detail-dot"),
    stageDetailHex: document.getElementById("stage-detail-hex"),

    toggleGridBtn: document.getElementById("toggle-grid-btn"),
    resetConfigBtn: document.getElementById("reset-config-btn"),

    furnitureSelector: document.getElementById("furniture-selector"),
    materialTabs: document.getElementById("material-tabs"),
    materialsGrid: document.getElementById("materials-grid"),
    colorPalette: document.getElementById("color-palette"),
    segBtns: document.querySelectorAll(".seg-btn"),
    syncColorsCheckbox: document.getElementById("sync-colors-checkbox"),
    activeTargetHint: document.getElementById("active-target-hint"),
    customColorInput: document.getElementById("custom-color-input"),
    customHexInput: document.getElementById("custom-hex-input"),

    summaryFurnitureName: document.getElementById("summary-furniture-name"),
    summaryPrice: document.getElementById("summary-price"),
    summaryMaterial: document.getElementById("summary-material"),
    summaryPrimarySwatch: document.getElementById("summary-primary-swatch"),
    summaryPrimaryText: document.getElementById("summary-primary-text"),
    summaryDetailSwatch: document.getElementById("summary-detail-swatch"),
    summaryDetailText: document.getElementById("summary-detail-text"),
    requestQuoteBtn: document.getElementById("request-quote-btn"),

    contactSection: document.getElementById("contacto"),
    contactFormWrap: document.querySelector(".contact-form-wrap"),
    contactForm: document.getElementById("contact-form"),
    contactName: document.getElementById("contact-name"),
    contactEmail: document.getElementById("contact-email"),
    contactMessage: document.getElementById("contact-message"),
    prefillBanner: document.getElementById("prefill-banner"),
    clearPrefillBtn: document.getElementById("clear-prefill-btn"),
    formFeedback: document.getElementById("form-feedback")
  };

  function getSelectedFurniture() {
    return DATA.furnitureTypes.find((f) => f.id === state.furnitureId) || DATA.furnitureTypes[0];
  }

  function getSelectedMaterial() {
    return DATA.materials.find((m) => m.id === state.materialId) || DATA.materials[0];
  }

  function findColorName(hex) {
    const normalized = hex.toUpperCase();
    const match = DATA.colors.find((c) => c.hex.toUpperCase() === normalized);
    return match ? `${match.name} (${normalized})` : `Personalizado (${normalized})`;
  }

  function calculatePrice(furniture, material) {
    const differentToneBonus = state.primaryColor.toUpperCase() !== state.detailColor.toUpperCase() ? 45 : 0;
    const raw = furniture.basePrice * material.priceFactor + differentToneBonus;
    const rounded = Math.round(raw / 10) * 10;
    return `${rounded.toLocaleString("es-ES")} €`;
  }

  /* ========================================================================
     RENDERIZADO DE CONTROLES DEL CONFIGURADOR
     ======================================================================== */
  function renderFurnitureOptions() {
    els.furnitureSelector.innerHTML = DATA.furnitureTypes
      .map((item) => {
        const isActive = item.id === state.furnitureId;
        return `
          <button
            type="button"
            class="furniture-option ${isActive ? "active" : ""}"
            data-furniture-id="${item.id}"
            role="radio"
            aria-checked="${isActive}"
          >
            ${item.icon}
            <span>${item.name}</span>
          </button>
        `;
      })
      .join("");
  }

  function renderMaterialTabs() {
    els.materialTabs.innerHTML = DATA.materialCategories
      .map((cat) => {
        const isActive = cat.id === state.categoryId;
        return `
          <button
            type="button"
            class="material-tab ${isActive ? "active" : ""}"
            data-category-id="${cat.id}"
            role="tab"
            aria-selected="${isActive}"
          >
            ${cat.name}
          </button>
        `;
      })
      .join("");
  }

  function renderMaterialOptions() {
    const filtered = DATA.materials.filter((m) => m.categoryId === state.categoryId);
    els.materialsGrid.innerHTML = filtered
      .map((mat) => {
        const isActive = mat.id === state.materialId;
        return `
          <button
            type="button"
            class="material-card ${isActive ? "active" : ""}"
            data-material-id="${mat.id}"
            role="radio"
            aria-checked="${isActive}"
          >
            <span
              class="material-swatch ${mat.swatchClass}"
              style="background-color: ${mat.swatchBg};"
              aria-hidden="true"
            ></span>
            <span class="material-meta">
              <strong>${mat.name}</strong>
              <span>${mat.categoryName}</span>
            </span>
          </button>
        `;
      })
      .join("");
  }

  function renderColorPalette() {
    const activeHex = (state.activeColorTarget === "primary" ? state.primaryColor : state.detailColor).toUpperCase();

    els.colorPalette.innerHTML = DATA.colors
      .map((color) => {
        const isActive = color.hex.toUpperCase() === activeHex;
        return `
          <button
            type="button"
            class="color-swatch-btn ${isActive ? "active" : ""}"
            data-hex="${color.hex}"
            role="radio"
            aria-checked="${isActive}"
            title="${color.name} (${color.hex})"
          >
            <span class="swatch-circle" style="background-color: ${color.hex};"></span>
            <span class="swatch-name">${color.name}</span>
          </button>
        `;
      })
      .join("");

    els.customColorInput.value = activeHex;
    els.customHexInput.value = activeHex;
    els.activeTargetHint.textContent =
      state.activeColorTarget === "primary"
        ? "Aplicando a estructura principal"
        : "Aplicando a detalles y patas";
  }

  function renderActiveViewport(renderArgs) {
    if (state.viewMode === "3d" && renderer3D) {
      renderer3D.setState(renderArgs);
    } else if (window.renderFurnitureSVG) {
      window.renderFurnitureSVG(els.furnitureSvg, renderArgs);
    }
  }

  function setViewMode(mode) {
    if (mode === state.viewMode) return;
    state.viewMode = mode;

    els.viewModeBtns.forEach((btn) => {
      const isActive = btn.dataset.viewMode === mode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    els.svgViewport.classList.add("is-switching");
    window.setTimeout(() => {
      const is3D = mode === "3d";
      els.furnitureSvg.classList.toggle("hidden", is3D);
      els.canvas3D.classList.toggle("hidden", !is3D);
      els.hud3D.classList.toggle("hidden", !is3D);
      els.autoRotateBtn.classList.toggle("hidden", !is3D);

      if (!is3D && renderer3D) {
        state.autoRotate = false;
        renderer3D.setAutoRotate(false);
        els.autoRotateBtn.setAttribute("aria-pressed", "false");
      }

      updateStageAndSummary(false);
      els.svgViewport.classList.remove("is-switching");
    }, 150);
  }

  function updateStageAndSummary(withSwitchAnimation = false) {
    const furniture = getSelectedFurniture();
    const material = getSelectedMaterial();
    const priceStr = calculatePrice(furniture, material);

    // Actualizar textos de la vista previa
    els.stageBadge.textContent = furniture.name;
    els.stageDimensions.textContent = furniture.dimensions;

    els.stageMaterialSwatch.className = `material-mini-swatch ${material.swatchClass}`;
    els.stageMaterialSwatch.style.backgroundColor = state.primaryColor;
    els.stageMaterialName.textContent = material.name;
    els.stageMaterialDesc.textContent = material.description;

    els.stagePrimaryDot.style.backgroundColor = state.primaryColor;
    els.stagePrimaryHex.textContent = state.primaryColor.toUpperCase();
    els.stageDetailDot.style.backgroundColor = state.detailColor;
    els.stageDetailHex.textContent = state.detailColor.toUpperCase();

    // Actualizar ficha resumen en tiempo real
    els.summaryFurnitureName.textContent = furniture.name;
    els.summaryPrice.textContent = priceStr;
    els.summaryMaterial.textContent = `${material.categoryName} · ${material.name}`;

    els.summaryPrimarySwatch.style.backgroundColor = state.primaryColor;
    els.summaryPrimaryText.textContent = findColorName(state.primaryColor);

    els.summaryDetailSwatch.style.backgroundColor = state.detailColor;
    els.summaryDetailText.textContent = findColorName(state.detailColor);

    const renderArgs = {
      furniture,
      material,
      primaryColor: state.primaryColor,
      detailColor: state.detailColor,
      showGrid: state.showGrid
    };

    if (withSwitchAnimation) {
      els.svgViewport.classList.add("is-switching");
      window.setTimeout(() => {
        renderActiveViewport(renderArgs);
        els.svgViewport.classList.remove("is-switching");
      }, 150);
    } else {
      renderActiveViewport(renderArgs);
    }
  }

  function applyColor(hex) {
    const normalized = hex.toUpperCase();
    if (state.syncColors) {
      state.primaryColor = normalized;
      state.detailColor = normalized;
    } else if (state.activeColorTarget === "primary") {
      state.primaryColor = normalized;
    } else {
      state.detailColor = normalized;
    }
    renderColorPalette();
    updateStageAndSummary(false);
  }

  /* ========================================================================
     EVENTOS DEL CONFIGURADOR
     ======================================================================== */
  function bindConfiguratorEvents() {
    // Conmutar vista 2D / 3D
    els.viewModeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        setViewMode(btn.dataset.viewMode);
      });
    });

    // Controles específicos de cámara 3D
    els.autoRotateBtn.addEventListener("click", () => {
      state.autoRotate = !state.autoRotate;
      els.autoRotateBtn.setAttribute("aria-pressed", String(state.autoRotate));
      if (renderer3D) renderer3D.setAutoRotate(state.autoRotate);
    });

    els.zoomInBtn.addEventListener("click", () => {
      if (renderer3D) renderer3D.adjustZoom(0.14);
    });

    els.zoomOutBtn.addEventListener("click", () => {
      if (renderer3D) renderer3D.adjustZoom(-0.14);
    });

    els.resetCameraBtn.addEventListener("click", () => {
      if (renderer3D) renderer3D.resetCamera();
    });

    window.addEventListener("resize", () => {
      if (state.viewMode === "3d" && renderer3D) {
        renderer3D.render();
      }
    });

    // Selección de tipo de mueble
    els.furnitureSelector.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-furniture-id]");
      if (!btn) return;
      const newId = btn.dataset.furnitureId;
      if (newId === state.furnitureId) return;

      state.furnitureId = newId;
      renderFurnitureOptions();
      updateStageAndSummary(true);
    });

    // Cambio de categoría de material
    els.materialTabs.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-category-id]");
      if (!tab) return;
      state.categoryId = tab.dataset.categoryId;
      renderMaterialTabs();
      renderMaterialOptions();
    });

    // Selección de material concreto
    els.materialsGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-material-id]");
      if (!card) return;
      state.materialId = card.dataset.materialId;
      const mat = getSelectedMaterial();

      state.primaryColor = mat.defaultHex.toUpperCase();
      if (state.syncColors) {
        state.detailColor = state.primaryColor;
      }

      renderMaterialOptions();
      renderColorPalette();
      updateStageAndSummary(false);
    });

    // Selector de zona de color (Estructura principal vs Detalles/patas)
    els.segBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeColorTarget = btn.dataset.target;
        els.segBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", String(active));
        });
        renderColorPalette();
      });
    });

    // Unificar color entre estructura y detalles
    els.syncColorsCheckbox.addEventListener("change", (e) => {
      state.syncColors = e.target.checked;
      if (state.syncColors) {
        state.detailColor = state.primaryColor;
        renderColorPalette();
        updateStageAndSummary(false);
      }
    });

    // Paleta de colores curada
    els.colorPalette.addEventListener("click", (e) => {
      const swatch = e.target.closest("[data-hex]");
      if (!swatch) return;
      applyColor(swatch.dataset.hex);
    });

    // Color picker nativo en tiempo real
    els.customColorInput.addEventListener("input", (e) => {
      applyColor(e.target.value);
    });

    // Entrada manual de código HEX
    els.customHexInput.addEventListener("input", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = `#${val}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        applyColor(val);
      }
    });

    els.customHexInput.addEventListener("blur", () => {
      const activeHex = (state.activeColorTarget === "primary" ? state.primaryColor : state.detailColor).toUpperCase();
      els.customHexInput.value = activeHex;
    });

    // Cotas arquitectónicas
    els.toggleGridBtn.addEventListener("click", () => {
      state.showGrid = !state.showGrid;
      els.toggleGridBtn.setAttribute("aria-pressed", String(state.showGrid));
      updateStageAndSummary(false);
    });

    // Reiniciar al estado por defecto del mueble actual
    els.resetConfigBtn.addEventListener("click", () => {
      const furniture = getSelectedFurniture();
      const defaultMat = DATA.materials.find((m) => m.id === furniture.defaultMaterial) || DATA.materials[0];
      state.categoryId = defaultMat.categoryId;
      state.materialId = defaultMat.id;
      state.primaryColor = furniture.defaultPrimaryColor;
      state.detailColor = furniture.defaultDetailColor;
      state.syncColors = false;
      els.syncColorsCheckbox.checked = false;
      if (renderer3D) renderer3D.resetCamera();

      renderMaterialTabs();
      renderMaterialOptions();
      renderColorPalette();
      updateStageAndSummary(true);
    });

    // Solicitar presupuesto -> llevar a Contacto y rellenar el mensaje automáticamente
    els.requestQuoteBtn.addEventListener("click", () => {
      const furniture = getSelectedFurniture();
      const material = getSelectedMaterial();
      const priceStr = calculatePrice(furniture, material);

      const summaryText = [
        "Hola Alejandro y María, me gustaría solicitar presupuesto para el siguiente diseño configurado en Creamuebles:",
        "",
        `• Mueble: ${furniture.name} (${furniture.dimensions})`,
        `• Material: ${material.categoryName} — ${material.name}`,
        `• Color estructura principal: ${findColorName(state.primaryColor)}`,
        `• Color detalles y patas: ${findColorName(state.detailColor)}`,
        `• Precio orientativo mostrado: ${priceStr}`,
        "",
        "Quedo atento/a a vuestra propuesta y disponibilidad de muestras."
      ].join("\n");

      els.contactMessage.value = summaryText;
      els.prefillBanner.classList.remove("hidden");

      els.contactSection.scrollIntoView({ behavior: "smooth", block: "start" });

      els.contactFormWrap.classList.remove("highlight-pulse");
      void els.contactFormWrap.offsetWidth;
      els.contactFormWrap.classList.add("highlight-pulse");

      window.setTimeout(() => {
        els.contactName.focus({ preventScroll: true });
      }, 650);
    });
  }

  /* ========================================================================
     FORMULARIO DE CONTACTO Y NAVEGACIÓN
     ======================================================================== */
  function bindContactAndNavEvents() {
    els.clearPrefillBtn.addEventListener("click", () => {
      els.contactMessage.value = "";
      els.prefillBanner.classList.add("hidden");
      els.contactMessage.focus();
    });

    els.contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = els.contactName.value.trim();
      const email = els.contactEmail.value.trim();
      const message = els.contactMessage.value.trim();

      els.formFeedback.className = "form-feedback";
      els.formFeedback.textContent = "";

      if (!name || !email || !message) {
        els.formFeedback.classList.add("is-error");
        els.formFeedback.textContent = "Por favor, completa tu nombre, correo electrónico y mensaje para enviar la solicitud.";
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        els.formFeedback.classList.add("is-error");
        els.formFeedback.textContent = "Introduce un correo electrónico válido para que podamos responderte.";
        return;
      }

      els.formFeedback.classList.add("is-success");
      els.formFeedback.textContent = `Gracias, ${name}. Hemos recibido tu solicitud en Creamuebles; Alejandro Pachón y María Fernández revisarán tu propuesta y te responderán en menos de 24 h a ${email}.`;

      els.contactForm.reset();
      els.prefillBanner.classList.add("hidden");
    });

    // Menú móvil
    els.navToggle.addEventListener("click", () => {
      const isOpen = els.mainNav.classList.toggle("open");
      els.navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    els.navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        els.mainNav.classList.remove("open");
        els.navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Sombra sutil en header al hacer scroll y estado activo de sección
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    window.addEventListener("scroll", () => {
      els.header.classList.toggle("scrolled", window.scrollY > 18);

      const scrollPos = window.scrollY + 140;
      let currentId = "inicio";
      for (const sec of sections) {
        if (sec.offsetTop <= scrollPos) {
          currentId = sec.id;
        }
      }
      els.navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === currentId);
      });
    }, { passive: true });
  }

  /* ========================================================================
     ANIMACIONES SUAVES AL HACER SCROLL
     ======================================================================== */
  function revealElement(el) {
    const delay = Number(el.dataset.delay || 0);
    if (delay === 0) {
      el.classList.add("is-visible");
    } else {
      window.setTimeout(() => {
        el.classList.add("is-visible");
      }, delay);
    }
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal");
    targets.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.05) {
        el.classList.add("is-visible");
      }
    });

    document.body.classList.add("reveal-ready");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" }
    );

    targets.forEach((el) => {
      if (!el.classList.contains("is-visible")) {
        observer.observe(el);
      }
    });
  }

  /* ========================================================================
     INICIALIZACIÓN
     ======================================================================== */
  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const mueble = params.get("mueble");
    if (mueble && DATA.furnitureTypes.some((f) => f.id === mueble)) {
      const f = DATA.furnitureTypes.find((item) => item.id === mueble);
      const defaultMat = DATA.materials.find((m) => m.id === f.defaultMaterial) || DATA.materials[0];
      state.furnitureId = f.id;
      state.categoryId = defaultMat.categoryId;
      state.materialId = defaultMat.id;
      state.primaryColor = f.defaultPrimaryColor;
      state.detailColor = f.defaultDetailColor;
    }

    const vista = params.get("vista");
    const initialMode = vista === "3d" ? "3d" : "2d";
    state.viewMode = initialMode;

    els.viewModeBtns.forEach((btn) => {
      const isActive = btn.dataset.viewMode === initialMode;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", String(isActive));
    });

    const is3D = initialMode === "3d";
    els.furnitureSvg.classList.toggle("hidden", is3D);
    els.canvas3D.classList.toggle("hidden", !is3D);
    els.hud3D.classList.toggle("hidden", !is3D);
    els.autoRotateBtn.classList.toggle("hidden", !is3D);
  }

  function init() {
    if (window.Creamuebles3DRenderer && els.canvas3D) {
      renderer3D = new window.Creamuebles3DRenderer(els.canvas3D);
    }
    applyUrlParams();
    renderFurnitureOptions();
    renderMaterialTabs();
    renderMaterialOptions();
    renderColorPalette();
    updateStageAndSummary(false);
    bindConfiguratorEvents();
    bindContactAndNavEvents();
    initScrollReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
