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
  };

  const patternItems = Math.ceil((state.columns * state.rows) / sourceItems.length) * sourceItems.length;
  const tileInstances = [];
  const fragment = document.createDocumentFragment();

  for (let patternY = 0; patternY < 3; patternY += 1) {
    for (let patternX = 0; patternX < 3; patternX += 1) {
      for (let index = 0; index < patternItems; index += 1) {
        const item = sourceItems[index % sourceItems.length].cloneNode(true);
        const image = item.querySelector("[data-hero-image]");
        const imageUrl = heroImageUrls.get(item.dataset.image);
        if (image && imageUrl) {
          image.src = imageUrl;
          image.loading = "lazy";
        }
        tileInstances.push({ item, patternX, patternY, index });
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

    while (state.cameraX >= 0) state.cameraX -= state.patternWidth;
    while (state.cameraX <= -state.patternWidth * 2) state.cameraX += state.patternWidth;
    while (state.cameraY >= 0) state.cameraY -= state.patternHeight;
    while (state.cameraY <= -state.patternHeight * 2) state.cameraY += state.patternHeight;
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

    tileInstances.forEach(({ item, patternX, patternY, index }) => {
      const column = index % state.columns;
      const row = Math.floor(index / state.columns);
      const x = (patternX + 1) * state.patternWidth + column * (state.tileWidth + state.gap);
      const y = (patternY + 1) * state.patternHeight + row * (state.tileHeight + state.gap);
      item.style.width = `${state.tileWidth}px`;
      item.style.height = `${state.tileHeight}px`;
      item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    state.cameraX = -state.patternWidth;
    state.cameraY = -state.patternHeight;
    render();
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
  layoutGrid();
}

initializeHeroGrid();
