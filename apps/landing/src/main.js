// Persists the visitor's chosen locale (set on any locale page visit) and wires the language switcher.
const COOKIE_NAME = "savda_locale";
const COOKIE_MAX_AGE_DAYS = 365;

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const currentLocale = document.documentElement.lang;
if (currentLocale) {
  setCookie(COOKIE_NAME, currentLocale, COOKIE_MAX_AGE_DAYS);
}

document.querySelectorAll(".lang-switch a").forEach((link) => {
  link.addEventListener("click", () => {
    const targetLocale = link.getAttribute("href").replace(/\//g, "");
    setCookie(COOKIE_NAME, targetLocale, COOKIE_MAX_AGE_DAYS);
  });
});

const heroImageModules = import.meta.glob([
  "../assets/*.{jpeg,jpg,webp}",
  "!../assets/product-photo-contact-sheet.jpeg",
], {
  eager: true,
  import: "default",
  query: "?url",
});

const heroImageUrls = new Map(
  Object.entries(heroImageModules).map(([path, url]) => [path.split("/").at(-1), url]),
);

function initializeHeroGrid() {
  const viewport = document.querySelector(".hero-grid-viewport");
  const grid = document.querySelector("[data-hero-grid]");
  if (!viewport || !grid) return;

  const sourceItems = Array.from(grid.querySelectorAll("[data-hero-item]"));
  if (!sourceItems.length) return;

  sourceItems.forEach((item) => {
    const image = item.querySelector("[data-hero-image]");
    const imageUrl = heroImageUrls.get(item.dataset.image);
    if (image && imageUrl) {
      image.src = imageUrl;
    }
  });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    cameraX: 0,
    cameraY: 0,
    columns: 4,
    rows: 5,
    tileWidth: 0,
    tileHeight: 0,
    gap: 0,
    patternWidth: 0,
    patternHeight: 0,
    velocityX: 0,
    velocityY: 0,
    frame: 0,
    previousFrameTime: 0,
    pointer: null,
    pointerId: null,
    dragStartX: 0,
    dragStartY: 0,
    previousDragX: 0,
    previousDragY: 0,
    isDragging: false,
    hasDragged: false,
    isPaused: false,
    suppressNextClick: false,
    activeItem: null,
    activeScaleX: 1,
    activeScaleY: 1,
    reframeFrame: 0,
  };

  const patternItems = Math.ceil((state.columns * state.rows) / sourceItems.length) * sourceItems.length;
  const tileInstances = [];
  const tileInstanceByElement = new Map();
  const fragment = document.createDocumentFragment();

  for (let patternY = -1; patternY <= 1; patternY += 1) {
    for (let patternX = -1; patternX <= 1; patternX += 1) {
      for (let index = 0; index < patternItems; index += 1) {
        const item = sourceItems[index % sourceItems.length].cloneNode(true);
        const image = item.querySelector("[data-hero-image]");
        const imageUrl = heroImageUrls.get(item.dataset.image);
        if (image && imageUrl) {
          image.src = imageUrl;
          image.loading = "lazy";
          image.alt = "";
        }
        const tileInstance = { item, patternX, patternY, index, x: 0, y: 0 };
        tileInstances.push(tileInstance);
        tileInstanceByElement.set(item, tileInstance);
        fragment.append(item);
      }
    }
  }

  grid.replaceChildren(fragment);

  function render() {
    grid.style.transform = `translate3d(${state.cameraX}px, ${state.cameraY}px, 0)`;
  }

  function wrapCamera() {
    if (!state.patternWidth || !state.patternHeight) return;

    while (state.cameraX >= state.patternWidth) state.cameraX -= state.patternWidth;
    while (state.cameraX <= -state.patternWidth) state.cameraX += state.patternWidth;
    while (state.cameraY >= state.patternHeight) state.cameraY -= state.patternHeight;
    while (state.cameraY <= -state.patternHeight) state.cameraY += state.patternHeight;
  }

  function positionTile(tileInstance) {
    const { item, x, y } = tileInstance;
    const isActive = state.activeItem === item;
    const scaleX = isActive ? state.activeScaleX : 1;
    const scaleY = isActive ? state.activeScaleY : 1;
    const width = state.tileWidth * scaleX;
    const height = state.tileHeight * scaleY;
    const direction = item.dataset.spotlightDirection;
    const expandedX = direction === "left" ? x - (width - state.tileWidth) : x;
    const expandedY = y - (height - state.tileHeight) / 2;

    item.style.width = `${width}px`;
    item.style.height = `${height}px`;
    item.style.transform = `translate3d(${expandedX}px, ${expandedY}px, 0)`;
  }

  function setSpotlightAccessibility(item, isActive) {
    const overlay = item.querySelector(".hero-grid-overlay");
    const controls = item.querySelectorAll(".hero-grid-close, .hero-grid-visit");
    if (!overlay) return;

    overlay.setAttribute("aria-hidden", String(!isActive));
    controls.forEach((control) => {
      control.tabIndex = isActive ? 0 : -1;
    });
  }

  function deactivateSpotlight(resumeMotion = true) {
    if (!state.activeItem) return;

    cancelAnimationFrame(state.reframeFrame);
    state.reframeFrame = 0;
    const activeItem = state.activeItem;
    activeItem.classList.remove("is-spotlight");
    delete activeItem.dataset.spotlightDirection;
    state.activeItem = null;
    state.activeScaleX = 1;
    state.activeScaleY = 1;
    positionTile(tileInstanceByElement.get(activeItem));
    setSpotlightAccessibility(activeItem, false);
    grid.classList.remove("has-spotlight");
    if (resumeMotion) setPaused(viewport.matches(":focus-within"));
  }

  function animateCameraTo(offsetX, offsetY) {
    if (!offsetX && !offsetY) return;

    cancelAnimationFrame(state.reframeFrame);
    const startX = state.cameraX;
    const startY = state.cameraY;
    const duration = motionQuery.matches ? 0 : 240;
    const startedAt = performance.now();

    function reframe(frameTime) {
      const progress = duration ? Math.min((frameTime - startedAt) / duration, 1) : 1;
      const eased = 1 - (1 - progress) ** 3;
      state.cameraX = startX + offsetX * eased;
      state.cameraY = startY + offsetY * eased;
      wrapCamera();
      render();
      if (progress < 1) {
        state.reframeFrame = requestAnimationFrame(reframe);
      } else {
        state.reframeFrame = 0;
      }
    }

    state.reframeFrame = requestAnimationFrame(reframe);
  }

  function reframeSpotlight(item) {
    const viewportRect = viewport.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const inset = viewport.clientWidth < 640 ? 16 : 24;
    const expandedLeft = itemRect.left;
    const expandedTop = itemRect.top;
    const expandedRight = itemRect.right;
    const expandedBottom = itemRect.bottom;
    const safeLeft = viewportRect.left + inset;
    const safeTop = viewportRect.top + inset;
    const safeRight = viewportRect.right - inset;
    const safeBottom = viewportRect.bottom - inset;
    let offsetX = 0;
    let offsetY = 0;

    if (expandedLeft < safeLeft) offsetX = safeLeft - expandedLeft;
    else if (expandedRight > safeRight) offsetX = safeRight - expandedRight;
    if (expandedTop < safeTop) offsetY = safeTop - expandedTop;
    else if (expandedBottom > safeBottom) offsetY = safeBottom - expandedBottom;

    animateCameraTo(offsetX, offsetY);
  }

  function activateSpotlight(item) {
    if (state.activeItem === item) return;

    deactivateSpotlight(false);
    const itemRect = item.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const inset = viewport.clientWidth < 640 ? 16 : 24;
    const maximumWidth = viewportRect.width - inset * 2;
    const isCompact = viewport.clientWidth < 640;
    const scaleX = Math.min(isCompact ? 2.75 : 1.92, maximumWidth / itemRect.width);
    const spaceLeft = itemRect.left - viewportRect.left - inset;
    const spaceRight = viewportRect.right - itemRect.right - inset;
    const direction = spaceRight >= spaceLeft ? "right" : "left";

    state.activeItem = item;
    state.activeScaleX = Math.max(1, scaleX);
    state.activeScaleY = isCompact ? 1.08 : 1.14;
    item.dataset.spotlightDirection = direction;
    item.classList.add("is-spotlight");
    grid.classList.add("has-spotlight");
    positionTile(tileInstanceByElement.get(item));
    setSpotlightAccessibility(item, true);
    setPaused(true);
    reframeSpotlight(item);
  }

  function layoutGrid() {
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    state.columns = viewportWidth < 640 ? 3 : viewportWidth < 1024 ? 4 : 5;
    state.rows = Math.ceil(patternItems / state.columns);
    state.gap = viewportWidth < 640 ? 8 : 12;
    state.tileWidth = Math.max(116, (viewportWidth - state.gap * (state.columns - 1)) / state.columns);
    state.tileHeight = Math.max(150, state.tileWidth * 1.18);
    state.patternWidth = state.columns * (state.tileWidth + state.gap);
    state.patternHeight = Math.max(
      state.rows * (state.tileHeight + state.gap),
      viewportHeight + state.tileHeight,
    );

    tileInstances.forEach((tileInstance) => {
      const { item, patternX, patternY, index } = tileInstance;
      const column = index % state.columns;
      const row = Math.floor(index / state.columns);
      const x = patternX * state.patternWidth + column * (state.tileWidth + state.gap);
      const y = patternY * state.patternHeight + row * (state.tileHeight + state.gap);
      tileInstance.x = x;
      tileInstance.y = y;
      positionTile(tileInstance);
    });

    state.cameraX = 0;
    state.cameraY = 0;
    render();
    if (state.activeItem) {
      reframeSpotlight(state.activeItem);
    }
  }

  function edgeVelocity(position, length) {
    const edgeSize = Math.min(160, length * 0.2);
    if (position < edgeSize) return 360 * (1 - position / edgeSize) ** 2;
    if (position > length - edgeSize) return -360 * (1 - (length - position) / edgeSize) ** 2;
    return 0;
  }

  function updateVelocity() {
    if (!state.pointer || state.isDragging || state.isPaused || motionQuery.matches) {
      state.velocityX = 0;
      state.velocityY = 0;
      return;
    }

    const rect = viewport.getBoundingClientRect();
    state.velocityX = edgeVelocity(state.pointer.x - rect.left, rect.width);
    state.velocityY = edgeVelocity(state.pointer.y - rect.top, rect.height);
    if (state.velocityX || state.velocityY) startAnimation();
  }

  function stopAnimation() {
    if (state.frame) {
      cancelAnimationFrame(state.frame);
      state.frame = 0;
    }
    state.previousFrameTime = 0;
  }

  function animate(frameTime) {
    if (!state.velocityX && !state.velocityY) {
      stopAnimation();
      return;
    }

    const elapsed = state.previousFrameTime ? (frameTime - state.previousFrameTime) / 1000 : 0;
    state.previousFrameTime = frameTime;
    state.cameraX += state.velocityX * elapsed;
    state.cameraY += state.velocityY * elapsed;
    wrapCamera();
    render();
    state.frame = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!state.frame) state.frame = requestAnimationFrame(animate);
  }

  function setPaused(isPaused) {
    state.isPaused = isPaused;
    updateVelocity();
  }

  viewport.addEventListener("pointermove", (event) => {
    if (state.isDragging && event.pointerId === state.pointerId) {
      const distanceX = event.clientX - state.previousDragX;
      const distanceY = event.clientY - state.previousDragY;
      state.previousDragX = event.clientX;
      state.previousDragY = event.clientY;
      state.hasDragged ||= Math.hypot(event.clientX - state.dragStartX, event.clientY - state.dragStartY) > 6;
      state.cameraX += distanceX;
      state.cameraY += distanceY;
      wrapCamera();
      render();
      return;
    }

    if (event.pointerType === "mouse") {
      state.pointer = { x: event.clientX, y: event.clientY };
      updateVelocity();
    }
  });

  viewport.addEventListener("pointerleave", () => {
    if (!state.isDragging) {
      state.pointer = null;
      updateVelocity();
    }
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(".hero-grid-close, .hero-grid-visit")) return;
    state.pointerId = event.pointerId;
    state.dragStartX = event.clientX;
    state.dragStartY = event.clientY;
    state.previousDragX = event.clientX;
    state.previousDragY = event.clientY;
    state.isDragging = true;
    state.hasDragged = false;
    state.velocityX = 0;
    state.velocityY = 0;
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointerup", (event) => {
    if (event.pointerId !== state.pointerId) return;
    state.suppressNextClick = state.hasDragged;
    state.isDragging = false;
    state.pointerId = null;
    viewport.releasePointerCapture(event.pointerId);
    if (event.pointerType !== "mouse" && !state.hasDragged) {
      const item = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-hero-item]");
      if (item) {
        if (state.activeItem === item) deactivateSpotlight();
        else activateSpotlight(item);
      }
    }
    state.pointer = { x: event.clientX, y: event.clientY };
    updateVelocity();
  });

  viewport.addEventListener("pointercancel", () => {
    state.isDragging = false;
    state.pointerId = null;
    state.pointer = null;
    updateVelocity();
  });

  viewport.addEventListener("click", (event) => {
    if (!state.suppressNextClick) return;
    event.preventDefault();
    event.stopPropagation();
    state.suppressNextClick = false;
  }, true);

  viewport.addEventListener("focusin", () => setPaused(true));
  viewport.addEventListener("focusout", (event) => {
    if (!viewport.contains(event.relatedTarget)) setPaused(false);
  });

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.activeItem) {
      deactivateSpotlight();
      viewport.focus();
      event.preventDefault();
      return;
    }

    const movement = 96;
    if (event.key === "ArrowLeft") state.cameraX += movement;
    else if (event.key === "ArrowRight") state.cameraX -= movement;
    else if (event.key === "ArrowUp") state.cameraY += movement;
    else if (event.key === "ArrowDown") state.cameraY -= movement;
    else return;

    event.preventDefault();
    wrapCamera();
    render();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      state.velocityX = 0;
      state.velocityY = 0;
      stopAnimation();
    }
  });

  motionQuery.addEventListener("change", updateVelocity);
  window.addEventListener("resize", layoutGrid);
  tileInstances.forEach(({ item }) => {
    setSpotlightAccessibility(item, false);
    item.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") activateSpotlight(item);
    });
    item.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse" && state.activeItem === item && !item.contains(event.relatedTarget)) {
        deactivateSpotlight();
      }
    });
  });
  grid.addEventListener("focusin", (event) => {
    const item = event.target.closest("[data-hero-item]");
    if (item) activateSpotlight(item);
  });
  grid.addEventListener("click", (event) => {
    if (!event.target.closest(".hero-grid-close")) return;
    event.preventDefault();
    deactivateSpotlight();
    viewport.focus();
  });
  layoutGrid();
}

initializeHeroGrid();
