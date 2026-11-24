/* ============================================================
   Obryx OS — interactions
   ------------------------------------------------------------
   The ISO link, filename and hash are private per browser.
   Open admin.html, enter your code, and save them there.
   Without a saved link the download simply can't start — the
   site no longer redirects to the repository.
   ============================================================ */

const ADMIN_CONFIG_KEY = "obryxAdminConfig";
const VISIT_KEY = "obryxVisits";

const DEFAULT_GALLERY = Array.from({ length: 7 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    src: `assets/screenshots/obryx-shot-${number}.png`,
    title: `Screenshot ${number}`,
    caption: "Obryx OS 0.4 Alpha4 · live session",
    alt: `Obryx OS screenshot ${index + 1}`
  };
});

const DEFAULT_APPEARANCE = {
  accent: "teal",
  particles: true,
  magnetic: true,
  ticker: true,
  backTop: true
};

const DEFAULT_COPY = {
  eyebrow: "Obryx OS / 0.4 Alpha4",
  heroTop: "Try Linux first.",
  heroAccent: "Install it later.",
  heroLead: "Obryx OS runs straight from a USB stick. No installation, no changes to your drive — just boot it up and see what it feels like.",
  fineprint: "One file. Nothing to unzip. Nothing to combine.",
  ticker: "Live USB|Nothing to install|UEFI · x86_64|Beta build|Windows stays put"
};

const DEFAULT_STYLE = {
  glow: 110,
  grain: 55,
  scan: 12,
  vignette: 35,
  radius: 14,
  speed: 100,
  hero: 100,
  grainOn: true,
  scanOn: true,
  vignetteOn: true,
  cornersOn: true,
  heroShineOn: true,
  css: ""
};

let APPEARANCE = { ...DEFAULT_APPEARANCE, customColor: "#57e6c5" };
let COPY = { ...DEFAULT_COPY };
let STYLE = { ...DEFAULT_STYLE };
let GALLERY_ITEMS = DEFAULT_GALLERY.map((item) => ({ ...item }));
let DOWNLOAD_URL = "";
let REMOTE_COUNTER_URL = "";
let ISO_FILENAME = "Obryx-OS-0.4-Alpha4-x86_64.iso";
let EXPECTED_HASH = "46d071d4d011ff0061a7baf3316e9689484490169a2b9ca1ca892a2e712cbefb";
let VERIFY_COMMAND = buildVerifyCommand();

let lightboxItems = [];
let lightboxIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadAdminConfig();
  trackVisit();
  setupDeviceGate();
  setupDownloadButtons();
  setupDownloadModal();
  setupCredits();
  setupNavigation();
  setupScrollEffects();
  setupRevealAnimations();
  setupActiveLinks();
  setupCopyButtons();
  setupHeroPointer();
  setupTilt();
  setupUltra();
  setupScreenshots();
  setupLightbox();
});

/* ── Private, per-browser download configuration ───────────── */
function buildVerifyCommand() {
  return `(Get-FileHash .\\${ISO_FILENAME}).Hash`;
}

function loadAdminConfig() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(ADMIN_CONFIG_KEY) || "{}") || {};
  } catch (_) { /* ignore broken saved data */ }

  if (typeof saved.downloadUrl === "string") DOWNLOAD_URL = saved.downloadUrl.trim();
  if (typeof saved.isoFilename === "string" && saved.isoFilename.trim()) ISO_FILENAME = saved.isoFilename.trim();
  if (typeof saved.hash === "string" && saved.hash.trim()) EXPECTED_HASH = saved.hash.trim();
  VERIFY_COMMAND = buildVerifyCommand();

  if (saved.appearance && typeof saved.appearance === "object") {
    APPEARANCE = { ...DEFAULT_APPEARANCE, customColor: "#57e6c5", ...saved.appearance };
  }
  if (typeof saved.remoteCounterUrl === "string") REMOTE_COUNTER_URL = saved.remoteCounterUrl.trim();
  if (Array.isArray(saved.gallery)) GALLERY_ITEMS = normalizeGallery(saved.gallery);
  if (saved.copy && typeof saved.copy === "object") COPY = normalizeCopy(saved.copy);
  if (saved.style && typeof saved.style === "object") STYLE = normalizeStyle(saved.style);
  applyAppearance();
  applyStyle();
  applyCopy();
}

function normalizeCopy(raw) {
  const out = { ...DEFAULT_COPY };
  Object.keys(DEFAULT_COPY).forEach((key) => {
    if (typeof raw[key] !== "string") return;
    const value = raw[key].trim();
    if (!value) return;
    out[key] = value.slice(0, key === "ticker" ? 400 : 180);
  });
  return out;
}

function normalizeStyle(raw) {
  const out = { ...DEFAULT_STYLE };
  const number = (key, min, max) => {
    const value = Number(raw[key]);
    if (!Number.isFinite(value)) return;
    out[key] = Math.min(max, Math.max(min, Math.round(value)));
  };
  number("glow", 0, 200);
  number("grain", 0, 100);
  number("scan", 0, 50);
  number("vignette", 0, 80);
  number("radius", 0, 32);
  number("speed", 30, 250);
  number("hero", 70, 140);
  ["grainOn", "scanOn", "vignetteOn", "cornersOn", "heroShineOn"].forEach((key) => {
    if (typeof raw[key] === "boolean") out[key] = raw[key];
  });
  if (typeof raw.css === "string") {
    out.css = raw.css.replace(/<\/style/gi, "").replace(/@import/gi, "").slice(0, 8000);
  }
  return out;
}

function applyStyle() {
  const root = document.documentElement;
  root.style.setProperty("--obryx-glow", (STYLE.glow / 100).toFixed(2));
  root.style.setProperty("--obryx-grain", (STYLE.grain / 1000).toFixed(3));
  root.style.setProperty("--obryx-scan", (STYLE.scan / 100).toFixed(3));
  root.style.setProperty("--obryx-vignette", (STYLE.vignette / 100).toFixed(3));
  root.style.setProperty("--obryx-radius", `${STYLE.radius}px`);
  root.style.setProperty("--obryx-speed", (STYLE.speed / 100).toFixed(2));
  root.style.setProperty("--obryx-hero", (STYLE.hero / 100).toFixed(2));
  root.classList.toggle("no-grain", STYLE.grainOn === false || STYLE.grain === 0);
  root.classList.toggle("no-scan", STYLE.scanOn === false);
  root.classList.toggle("no-vignette", STYLE.vignetteOn === false);
  root.classList.toggle("no-corners", STYLE.cornersOn === false);
  root.classList.toggle("no-hero-shine", STYLE.heroShineOn === false);

  let styleTag = document.getElementById("obryxCustomStyle");
  if (STYLE.css) {
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "obryxCustomStyle";
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = STYLE.css;
  } else if (styleTag) {
    styleTag.remove();
  }
}

function applyCopy() {
  document.querySelectorAll("[data-copy-text]").forEach((element) => {
    const value = COPY[element.dataset.copyText];
    if (value) element.textContent = value;
  });

  const track = document.querySelector(".ticker-track");
  if (!track) return;
  const items = COPY.ticker.split(/[|\n]/).map((part) => part.trim()).filter(Boolean).slice(0, 16);
  if (!items.length) items.push("Live USB");
  const group = document.createElement("div");
  group.className = "ticker-group";
  items.forEach((item, index) => {
    if (index) {
      const star = document.createElement("b");
      star.textContent = "✦";
      group.appendChild(star);
    }
    const span = document.createElement("span");
    span.textContent = item;
    group.appendChild(span);
  });
  track.replaceChildren(group.cloneNode(true), group.cloneNode(true));
}

function normalizeGallery(list) {
  return list.slice(0, 40).filter((item) => {
    if (!item || typeof item.src !== "string" || !item.src.trim()) return false;
    const src = item.src.trim();
    if (/^javascript:/i.test(src)) return false;
    return /^(data:image\/|https?:\/\/|file:|\.\/|\/)/i.test(src) || !/^[a-z][a-z0-9+.-]*:/i.test(src);
  }).map((item, index) => {
    const src = item.src.trim();
    const fallback = `Screenshot ${String(index + 1).padStart(2, "0")}`;
    return {
      src,
      title: typeof item.title === "string" && item.title.trim() ? item.title.trim().slice(0, 80) : fallback,
      caption: typeof item.caption === "string" && item.caption.trim() ? item.caption.trim().slice(0, 120) : "Custom screenshot",
      alt: typeof item.alt === "string" && item.alt.trim()
        ? item.alt.trim().slice(0, 120)
        : (typeof item.title === "string" && item.title.trim() ? item.title.trim().slice(0, 120) : fallback)
    };
  });
}

function applyAppearance() {
  const root = document.documentElement;
  const accent = ["teal", "indigo", "amber", "violet", "custom"].includes(APPEARANCE.accent)
    ? APPEARANCE.accent
    : "teal";
  root.dataset.accent = accent;
  if (accent === "custom") {
    const color = /^#[a-f0-9]{6}$/i.test(APPEARANCE.customColor || "") ? APPEARANCE.customColor : "#57e6c5";
    root.style.setProperty("--teal", color);
    root.style.setProperty("--indigo", "#7c8cff");
  } else {
    root.style.removeProperty("--teal");
    root.style.removeProperty("--indigo");
  }
  root.classList.toggle("no-particles", APPEARANCE.particles === false);
  root.classList.toggle("no-ticker", APPEARANCE.ticker === false);
  root.classList.toggle("no-back-top", APPEARANCE.backTop === false);
}

/* ── Visit tracking (local log + optional remote endpoint) ─── */
function trackVisit() {
  const now = Date.now();
  let hits = [];
  try {
    hits = JSON.parse(localStorage.getItem(VISIT_KEY) || "[]");
    if (!Array.isArray(hits)) hits = [];
  } catch (_) { hits = []; }

  const cutoff = now - 30 * 24 * 60 * 60 * 1000;
  hits = hits.filter((time) => typeof time === "number" && time > cutoff).slice(-500);
  hits.push(now);
  try { localStorage.setItem(VISIT_KEY, JSON.stringify(hits)); } catch (_) { /* storage full or blocked */ }

  if (/^https?:\/\//i.test(REMOTE_COUNTER_URL)) {
    fetch(REMOTE_COUNTER_URL, { mode: "cors", cache: "no-store" }).catch(() => {});
  }
}

function isLocalNameOnHostedSite() {
  return !!DOWNLOAD_URL && !/^[a-z][a-z0-9+.-]*:/i.test(DOWNLOAD_URL) && location.protocol === "https:";
}

function isExternalLink() {
  if (!DOWNLOAD_URL || !/^[a-z][a-z0-9+.-]*:/i.test(DOWNLOAD_URL)) return false;
  if (/^file:/i.test(DOWNLOAD_URL)) return false;
  try {
    return new URL(DOWNLOAD_URL, location.href).origin !== location.origin;
  } catch (_) {
    return false;
  }
}

/* ── Desktop-only gate: block phones and tablets ───────────── */
function setupDeviceGate() {
  const gate = document.getElementById("deviceGate");
  if (!gate) return;

  const query = window.matchMedia("(max-width: 820px), (hover: none) and (pointer: coarse)");
  const apply = () => {
    const blocked = query.matches;
    gate.hidden = !blocked;
    document.body.classList.toggle("is-gated", blocked);
    document.querySelectorAll("#main, .site-header, .site-footer").forEach((el) => {
      el.inert = blocked;
    });
  };

  apply();
  if (query.addEventListener) query.addEventListener("change", apply);
  else if (query.addListener) query.addListener(apply);
}

/* ── Download buttons: warning first, then redirect ────────── */
function setupDownloadButtons() {
  document.querySelectorAll("[data-download]").forEach((link) => {
    link.href = DOWNLOAD_URL || "#";
    link.setAttribute("aria-label", `${link.textContent.trim()} — opens a beta warning first`);
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openDownloadModal(link);
    });
  });
}

/* ── Beta confirmation modal ───────────────────────────────── */
function setupDownloadModal() {
  const modal = document.getElementById("downloadModal");
  if (!modal) return;

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    const trigger = modal.dataset.trigger;
    if (trigger) document.getElementById(trigger)?.focus();
  };

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  const agree = document.getElementById("agreeDownload");
  if (agree) {
    agree.addEventListener("click", () => {
      const fine = document.getElementById("downloadFine");
      if (!DOWNLOAD_URL) {
        if (fine) {
          fine.textContent = "No ISO link is configured for this browser. Ask the admin to set it in admin.html.";
          fine.classList.add("is-warning");
        }
        return;
      }
      if (isLocalNameOnHostedSite()) {
        if (fine) {
          fine.textContent = "That's a local filename — open the site files on your PC for it to work, or save a direct URL in admin.html.";
          fine.classList.add("is-warning");
        }
        return;
      }
      downloadIso();
      closeModal();
    });
  }
}

/* ── Credits modal ────────────────────────────────────────── */
function setupCredits() {
  const modal = document.getElementById("creditsModal");
  if (!modal) return;

  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = "";
    document.getElementById("creditsTrigger")?.focus();
  };

  document.querySelectorAll("[data-open-credits]").forEach((el) => {
    el.id = el.id || "creditsTrigger";
    el.addEventListener("click", (event) => {
      event.preventDefault();
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      modal.querySelector("[data-close-credits]")?.focus();
    });
  });

  modal.querySelectorAll("[data-close-credits]").forEach((el) => {
    el.addEventListener("click", close);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) close();
  });
}

function downloadIso() {
  const link = document.createElement("a");
  link.href = DOWNLOAD_URL;
  link.rel = "noopener noreferrer";
  if (isExternalLink()) {
    // Cross-origin hosts (GoFile, Drive, NAS…) can't be forced into the
    // Downloads folder — open their page so the visitor clicks Download.
    link.target = "_blank";
  } else {
    link.download = ISO_FILENAME;
  }
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openDownloadModal(trigger) {
  const modal = document.getElementById("downloadModal");
  if (!modal) return;
  const fine = document.getElementById("downloadFine");
  if (fine) {
    if (isLocalNameOnHostedSite()) {
      fine.textContent = "Local filename detected — it only works when the site is opened from your own PC.";
      fine.classList.add("is-warning");
    } else if (isExternalLink()) {
      fine.textContent = "Opens the file host in a new tab — click Download there.";
      fine.classList.remove("is-warning");
    } else {
      fine.textContent = "The ISO will be saved to your Downloads folder.";
      fine.classList.remove("is-warning");
    }
  }
  modal.dataset.trigger = trigger && trigger.id ? trigger.id : "";
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector(".modal-close")?.focus();
}

/* ── Mobile menu ───────────────────────────────────────────── */
function setupNavigation() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("primaryNav");
  if (!toggle || !links) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    links.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    links.classList.toggle("is-open", !open);
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav") && links.classList.contains("is-open")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

/* ── Scroll progress + header state ────────────────────────── */
function setupScrollEffects() {
  const bar = document.getElementById("scrollProgress");
  const header = document.getElementById("siteHeader");
  const backTop = document.getElementById("backTop");
  let queued = false;

  const update = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    const progress = max > 0 ? root.scrollTop / max : 0;
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (header) header.classList.toggle("is-scrolled", root.scrollTop > 24);
    if (backTop) backTop.classList.toggle("is-visible", root.scrollTop > 500);
    queued = false;
  };

  window.addEventListener("scroll", () => {
    if (!queued) {
      window.requestAnimationFrame(update);
      queued = true;
    }
  }, { passive: true });

  update();
}

/* ── Reveal on scroll ──────────────────────────────────────── */
function setupRevealAnimations() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  items.forEach((item) => {
    if (item.getBoundingClientRect().top < window.innerHeight * 0.9) {
      item.classList.add("is-visible");
    }
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  items.forEach((item) => observer.observe(item));

  window.setTimeout(() => {
    items.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight) {
        item.classList.add("is-visible");
      }
    });
  }, 1200);
}

/* ── Highlight the section currently being read ───────────── */
function setupActiveLinks() {
  const links = document.querySelectorAll(".nav-links a");
  if (!("IntersectionObserver" in window) || !links.length) return;

  const sections = [...links]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-40% 0px -52% 0px" });

  sections.forEach((section) => observer.observe(section));
}

/* ── Copy command / hash ───────────────────────────────────── */
function setupCopyButtons() {
  const values = { command: () => VERIFY_COMMAND, hash: () => EXPECTED_HASH };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = values[button.dataset.copy]?.();
      if (!text) return;
      const ok = await copyToClipboard(text);
      const label = button.querySelector("span");
      const old = label ? label.textContent : "";

      button.classList.toggle("is-done", ok);
      if (label) label.textContent = ok ? "Copied!" : "Select it";
      window.setTimeout(() => {
        button.classList.remove("is-done");
        if (label) label.textContent = old;
      }, 1800);
    });
  });
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) { /* fall through to the fallback */ }
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch (_) {
    return false;
  }
}

/* ── Soft glow following the pointer on the hero visual ───── */
function setupHeroPointer() {
  const visual = document.getElementById("heroVisual");
  if (!visual || !window.matchMedia("(pointer: fine)").matches) return;

  visual.addEventListener("pointermove", (event) => {
    const rect = visual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    visual.style.setProperty("--mx", `${x}%`);
    visual.style.setProperty("--my", `${y}%`);
  });
}

/* ── Subtle 3D tilt on cards ───────────────────────────────── */
function setupTilt() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = Number(card.dataset.tiltMax || 7);
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });
}

/* ── Screenshots ───────────────────────────────────────────── */
function setupScreenshots() {
  const grid = document.querySelector(".shots-grid");
  const note = document.querySelector(".gallery-note");
  if (!grid) return;

  if (!GALLERY_ITEMS.length) {
    grid.innerHTML = "";
    if (note) note.textContent = "No screenshots are configured. Add some from the private admin console.";
    lightboxItems = [];
    return;
  }

  grid.innerHTML = "";
  lightboxItems = GALLERY_ITEMS.map((item) => ({ src: item.src, alt: item.alt || item.title }));

  GALLERY_ITEMS.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "shot reveal is-visible";
    figure.style.setProperty("--delay", `${(index % 3) * 0.06}s`);

    const frame = document.createElement("div");
    frame.className = "shot-frame";

    const img = document.createElement("img");
    img.className = "shot-img";
    img.dataset.shot = item.src;
    img.src = item.src;
    img.alt = item.alt || item.title;
    img.loading = "lazy";
    img.addEventListener("click", () => openLightbox(index));

    const probe = new Image();
    probe.onerror = () => { img.hidden = true; };
    probe.src = item.src;

    frame.appendChild(img);
    const caption = document.createElement("figcaption");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const sub = document.createElement("span");
    sub.textContent = item.caption;
    caption.appendChild(title);
    caption.appendChild(sub);
    figure.appendChild(frame);
    figure.appendChild(caption);
    grid.appendChild(figure);
  });

  if (note) note.textContent = `${GALLERY_ITEMS.length} screenshot${GALLERY_ITEMS.length === 1 ? "" : "s"} in this gallery.`;
}

/* ── Screenshot lightbox with navigation ──────────────────── */
function setupLightbox() {
  const box = document.getElementById("lightbox");
  if (!box) return;

  document.getElementById("lightboxClose")?.addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev")?.addEventListener("click", () => stepLightbox(-1));
  document.getElementById("lightboxNext")?.addEventListener("click", () => stepLightbox(1));

  box.addEventListener("click", (event) => {
    if (event.target === box || event.target.classList.contains("modal-backdrop")) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (box.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });
}

function openLightbox(index) {
  const box = document.getElementById("lightbox");
  if (!box || !lightboxItems.length) return;
  box.dataset.returnFocusId = document.activeElement && document.activeElement.id ? document.activeElement.id : "";
  lightboxIndex = index;
  showLightboxImage();
  box.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("lightboxClose")?.focus();
}

function stepLightbox(direction) {
  if (!lightboxItems.length) return;
  lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
  showLightboxImage();
}

function showLightboxImage() {
  const item = lightboxItems[lightboxIndex];
  if (!item) return;
  const image = document.getElementById("lightboxImg");
  image.src = item.src;
  image.alt = item.alt;
  document.getElementById("lightboxCaption").textContent = item.alt;
  document.getElementById("lightboxCount").textContent =
    `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(lightboxItems.length).padStart(2, "0")}`;
}

function closeLightbox() {
  const box = document.getElementById("lightbox");
  if (!box || box.hidden) return;
  box.hidden = true;
  document.body.style.overflow = "";
  document.getElementById("lightboxImg")?.removeAttribute("src");
  const id = box.dataset.returnFocusId;
  if (id) document.getElementById(id)?.focus();
}

/* ── ULTRA layer: particles, cursor aura, magnetic buttons ─── */
function setupUltra() {
  setupParticleField();
  setupMagneticButtons();
}

function prefersLessMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasFinePointer() {
  return window.matchMedia("(pointer: fine)").matches;
}

function setupParticleField() {
  const canvas = document.getElementById("particleField");
  const hero = document.querySelector(".hero");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (!canvas || !hero || !ctx || APPEARANCE.particles === false) return;

  const still = prefersLessMotion();
  let width = 0;
  let height = 0;
  let particles = [];
  let running = false;
  let frameId = 0;

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(16, Math.min(44, Math.round(width / 26)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - .5) * .22,
      vy: (Math.random() - .5) * .22,
      r: Math.random() * 1.3 + .5
    }));
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      if (!still) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(190, 235, 224, .4)";
      ctx.fill();
    }

    const range = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > range * range) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(87, 230, 197, ${(1 - distSq / (range * range)) * .13})`;
        ctx.lineWidth = .6;
        ctx.stroke();
      }
    }
  }

  function frame() {
    render();
    if (document.hidden) {
      running = false;
      return;
    }
    frameId = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || still || document.hidden) return;
    running = true;
    frameId = window.requestAnimationFrame(frame);
  }

  resize();
  render();
  start();

  window.addEventListener("resize", () => {
    resize();
    render();
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      window.cancelAnimationFrame(frameId);
    } else {
      start();
    }
  });
}

function setupMagneticButtons() {
  if (!hasFinePointer() || prefersLessMotion() || APPEARANCE.magnetic === false) return;

  document.querySelectorAll(".btn--primary").forEach((button) => {
    button.setAttribute("data-magnetic", "");
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * .1;
      const dy = (event.clientY - rect.top - rect.height / 2) * .14;
      button.style.transform = `translate(${dx.toFixed(1)}px, ${(dy - 3).toFixed(1)}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}
