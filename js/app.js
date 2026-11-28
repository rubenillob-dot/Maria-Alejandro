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
    autoRotate: false,
    activeProjectCategory: "todos",
    lightboxIndex: -1
  };

  let renderer3D = null;
  let revealObserver = null;
  let lastFocusedTrigger = null;

  // Referencias DOM
  const els = {
    readingProgressBar: document.getElementById("reading-progress-bar"),
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
    summaryDimensions: document.getElementById("summary-dimensions"),
    summaryPrice: document.getElementById("summary-price"),
    summaryMaterial: document.getElementById("summary-material"),
    summaryPrimarySwatch: document.getElementById("summary-primary-swatch"),
    summaryPrimaryText: document.getElementById("summary-primary-text"),
    summaryDetailSwatch: document.getElementById("summary-detail-swatch"),
    summaryDetailText: document.getElementById("summary-detail-text"),
    requestQuoteBtn: document.getElementById("request-quote-btn"),
    directorActionBtns: document.querySelectorAll("[data-contact-director]"),

    contactSection: document.getElementById("contacto"),
    contactFormWrap: document.querySelector(".contact-form-wrap"),
    contactForm: document.getElementById("contact-form"),
    contactName: document.getElementById("contact-name"),
    contactEmail: document.getElementById("contact-email"),
    contactMessage: document.getElementById("contact-message"),
    prefillBanner: document.getElementById("prefill-banner"),
    clearPrefillBtn: document.getElementById("clear-prefill-btn"),
    formFeedback: document.getElementById("form-feedback"),

    projectsFilters: document.getElementById("projects-filters"),
    projectsCount: document.getElementById("projects-count"),
    projectsGrid: document.getElementById("projects-grid"),
    lightbox: document.getElementById("project-lightbox"),
    lightboxCloseBtn: document.getElementById("lightbox-close-btn"),
    lightboxPrevBtn: document.getElementById("lightbox-prev-btn"),
    lightboxNextBtn: document.getElementById("lightbox-next-btn"),
    lightboxImg: document.getElementById("lightbox-img"),
    lightboxCounter: document.getElementById("lightbox-counter"),
    lightboxCategory: document.getElementById("lightbox-category"),
    lightboxTitle: document.getElementById("lightbox-title"),
    lightboxDescription: document.getElementById("lightbox-description"),
    lightboxMaterials: document.getElementById("lightbox-materials"),
    lightboxDimensions: document.getElementById("lightbox-dimensions"),
    lightboxYear: document.getElementById("lightbox-year"),
    lightboxInquireBtn: document.getElementById("lightbox-inquire-btn")
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

  function updateStageAndSummary(transitionMode = false) {
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
    if (els.summaryDimensions) {
      els.summaryDimensions.textContent = furniture.dimensions;
    }
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

    if (transitionMode === true || transitionMode === "switch") {
      els.svgViewport.classList.add("is-switching");
      window.setTimeout(() => {
        renderActiveViewport(renderArgs);
        els.svgViewport.classList.remove("is-switching");
      }, 150);
    } else if (transitionMode === "tone") {
      els.svgViewport.classList.remove("is-tone-updating");
      renderActiveViewport(renderArgs);
      void els.svgViewport.offsetWidth;
      els.svgViewport.classList.add("is-tone-updating");
    } else {
      renderActiveViewport(renderArgs);
    }
  }

  function applyColor(hex, animateTone = true) {
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
    updateStageAndSummary(animateTone ? "tone" : false);
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
      updateStageAndSummary("tone");
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
        updateStageAndSummary("tone");
      }
    });

    // Paleta de colores curada
    els.colorPalette.addEventListener("click", (e) => {
      const swatch = e.target.closest("[data-hex]");
      if (!swatch) return;
      applyColor(swatch.dataset.hex, true);
    });

    // Color picker nativo en tiempo real
    els.customColorInput.addEventListener("input", (e) => {
      applyColor(e.target.value, false);
    });

    // Entrada manual de código HEX
    els.customHexInput.addEventListener("input", (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith("#")) val = `#${val}`;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        applyColor(val, true);
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

    // Botones directos en tarjetas editoriales de Alejandro y María
    els.directorActionBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const directorName = btn.dataset.contactDirector || "Creamuebles";
        const firstName = directorName.split(" ")[0];
        const currentMsg = els.contactMessage.value.trim();

        if (!currentMsg) {
          els.contactMessage.value = `Hola ${firstName}, me gustaría recibir asesoramiento personalizado para un mueble a medida:\n\n`;
        }

        els.contactFormWrap.classList.remove("highlight-pulse");
        void els.contactFormWrap.offsetWidth;
        els.contactFormWrap.classList.add("highlight-pulse");

        els.contactFormWrap.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => {
          if (!els.contactName.value.trim()) {
            els.contactName.focus({ preventScroll: true });
          } else {
            els.contactMessage.focus({ preventScroll: true });
          }
        }, 420);
      });
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

    // Sombra sutil en header, estado activo de sección y barra de progreso de lectura
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    let scrollRafPending = false;

    function updateScrollUI() {
      scrollRafPending = false;
      const scrollY = window.scrollY;
      els.header.classList.toggle("scrolled", scrollY > 18);

      if (els.readingProgressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
        els.readingProgressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
      }

      const scrollPos = scrollY + 140;
      let currentId = "inicio";
      for (const sec of sections) {
        if (sec.offsetTop <= scrollPos) {
          currentId = sec.id;
        }
      }
      els.navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === currentId);
      });
    }

    updateScrollUI();
    window.addEventListener(
      "scroll",
      () => {
        if (!scrollRafPending) {
          scrollRafPending = true;
          window.requestAnimationFrame(updateScrollUI);
        }
      },
      { passive: true }
    );
  }

  /* ========================================================================
     GALERÍA DE PROYECTOS Y LIGHTBOX MODAL
     ======================================================================== */
  function getFilteredProjects() {
    const list = DATA.projects || [];
    if (state.activeProjectCategory === "todos") return list;
    return list.filter((project) => project.categoryId === state.activeProjectCategory);
  }

  function renderProjectFilters() {
    if (!els.projectsFilters || !DATA.projectCategories) return;
    els.projectsFilters.innerHTML = DATA.projectCategories
      .map((cat) => {
        const isActive = cat.id === state.activeProjectCategory;
        return `
          <button
            type="button"
            class="project-filter-btn ${isActive ? "active" : ""}"
            data-project-category="${cat.id}"
            role="tab"
            aria-selected="${isActive}"
          >
            ${cat.name}
          </button>
        `;
      })
      .join("");
  }

  function renderProjectCards(animateFilter = false) {
    if (!els.projectsGrid) return;
    const projects = getFilteredProjects();

    if (els.projectsCount) {
      els.projectsCount.textContent = `${projects.length} ${projects.length === 1 ? "proyecto" : "proyectos"}`;
    }

    const buildCardsHtml = () =>
      projects
        .map((project, index) => {
          const delay = (index % 3) * 70;
          const revealClasses = animateFilter ? "reveal is-visible is-entering" : "reveal";
          const delayStyle = animateFilter ? `style="animation-delay: ${index * 45}ms"` : `data-delay="${delay}"`;
          return `
            <article class="project-card ${revealClasses}" ${delayStyle}>
              <button
                type="button"
                class="project-card-trigger"
                data-project-id="${project.id}"
                aria-label="Ver ficha ampliada de ${project.title}, ${project.categoryLabel}"
              >
                <div class="project-card-media">
                  <img
                    src="${project.image}"
                    alt="${project.alt}"
                    loading="lazy"
                  />
                  <span class="project-card-scrim" aria-hidden="true"></span>
                  <span class="project-card-cue" aria-hidden="true">
                    <span>Ver ficha</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                      <path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
                <div class="project-card-body">
                  <div class="project-card-meta">
                    <span class="project-category">${project.categoryLabel}</span>
                    <span class="project-year">${project.year}</span>
                  </div>
                  <h3 class="project-title">${project.title}</h3>
                  <p class="project-material">${project.materialSummary}</p>
                </div>
              </button>
            </article>
          `;
        })
        .join("");

    if (animateFilter) {
      els.projectsGrid.classList.add("is-filtering");
      window.setTimeout(() => {
        els.projectsGrid.innerHTML = buildCardsHtml();
        void els.projectsGrid.offsetWidth;
        els.projectsGrid.classList.remove("is-filtering");
      }, 180);
    } else {
      els.projectsGrid.innerHTML = buildCardsHtml();
      if (revealObserver) {
        els.projectsGrid.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
          revealObserver.observe(el);
        });
      }
    }
  }

  function updateLightboxContent(swapAnimation = false) {
    const projects = getFilteredProjects();
    if (!projects.length || state.lightboxIndex < 0 || state.lightboxIndex >= projects.length) return;

    const project = projects[state.lightboxIndex];
    const total = String(projects.length).padStart(2, "0");
    const current = String(state.lightboxIndex + 1).padStart(2, "0");

    const applyFields = () => {
      els.lightboxImg.src = project.image;
      els.lightboxImg.alt = project.alt;
      els.lightboxCounter.textContent = `${current} / ${total}`;
      els.lightboxCategory.textContent = project.categoryLabel;
      els.lightboxTitle.textContent = project.title;
      els.lightboxDescription.textContent = project.description;
      els.lightboxMaterials.textContent = project.materials;
      els.lightboxDimensions.textContent = project.dimensions;
      els.lightboxYear.textContent = `${project.year} · ${project.location}`;
    };

    const showNav = projects.length > 1;
    els.lightboxPrevBtn.disabled = !showNav;
    els.lightboxNextBtn.disabled = !showNav;

    if (swapAnimation) {
      els.lightboxImg.classList.add("is-swapping");
      window.setTimeout(() => {
        applyFields();
        els.lightboxImg.classList.remove("is-swapping");
      }, 120);
    } else {
      applyFields();
    }
  }

  function openLightbox(projectId, triggerEl = null) {
    if (!els.lightbox) return;
    const projects = getFilteredProjects();
    const index = projects.findIndex((p) => p.id === projectId);
    if (index === -1) return;

    lastFocusedTrigger = triggerEl || document.activeElement;
    state.lightboxIndex = index;
    updateLightboxContent(false);

    els.lightbox.classList.add("is-open");
    els.lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    window.setTimeout(() => {
      els.lightboxCloseBtn.focus({ preventScroll: true });
    }, 60);
  }

  function closeLightbox(restoreFocus = true) {
    if (!els.lightbox || !els.lightbox.classList.contains("is-open")) return;
    els.lightbox.classList.remove("is-open");
    els.lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    state.lightboxIndex = -1;

    if (restoreFocus && lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
      lastFocusedTrigger.focus({ preventScroll: true });
    }
    lastFocusedTrigger = null;
  }

  function navigateLightbox(step) {
    const projects = getFilteredProjects();
    if (projects.length <= 1) return;
    state.lightboxIndex = (state.lightboxIndex + step + projects.length) % projects.length;
    updateLightboxContent(true);
  }

  function bindProjectsEvents() {
    if (!els.projectsFilters || !els.projectsGrid || !els.lightbox) return;

    els.projectsFilters.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-project-category]");
      if (!btn) return;
      const nextCategory = btn.dataset.projectCategory;
      if (nextCategory === state.activeProjectCategory) return;

      state.activeProjectCategory = nextCategory;
      renderProjectFilters();
      renderProjectCards(true);
    });

    els.projectsGrid.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-project-id]");
      if (!trigger) return;
      openLightbox(trigger.dataset.projectId, trigger);
    });

    els.lightboxCloseBtn.addEventListener("click", () => closeLightbox(true));
    els.lightboxPrevBtn.addEventListener("click", () => navigateLightbox(-1));
    els.lightboxNextBtn.addEventListener("click", () => navigateLightbox(1));

    els.lightbox.addEventListener("click", (e) => {
      if (e.target.closest("[data-lightbox-close]")) {
        closeLightbox(true);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!els.lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox(true);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateLightbox(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateLightbox(1);
      }
    });

    els.lightboxInquireBtn.addEventListener("click", () => {
      const projects = getFilteredProjects();
      const project = projects[state.lightboxIndex];
      closeLightbox(false);

      if (project && els.contactMessage) {
        els.contactMessage.value = [
          `Hola Alejandro y María, me gustaría consultar por un diseño similar al proyecto «${project.title}» (${project.categoryLabel}):`,
          "",
          `• Acabados de referencia: ${project.materialSummary}`,
          `• Dimensiones orientativas del proyecto: ${project.dimensions}`,
          "",
          "Me gustaría valorar su adaptación a las medidas de mi espacio."
        ].join("\n");
        els.prefillBanner.classList.remove("hidden");
      }

      if (els.contactSection) {
        els.contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (els.contactFormWrap) {
        els.contactFormWrap.classList.remove("highlight-pulse");
        void els.contactFormWrap.offsetWidth;
        els.contactFormWrap.classList.add("highlight-pulse");
      }
      window.setTimeout(() => {
        if (els.contactName) els.contactName.focus({ preventScroll: true });
      }, 550);
    });
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

    revealObserver = new IntersectionObserver(
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
        revealObserver.observe(el);
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
    renderProjectFilters();
    renderProjectCards(false);
    bindConfiguratorEvents();
    bindProjectsEvents();
    bindContactAndNavEvents();
    initScrollReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
