/* ============================================================
   Obryx OS — interactions
   ------------------------------------------------------------
   The ISO link, filename and hash are private per browser.
   Open admin.html, enter your code, and save them there.
   Without a saved link the download simply can't start — the
   site no longer redirects to the repository.
   ============================================================ */

const ADMIN_CONFIG_KEY = "obryxAdminConfig";

let DOWNLOAD_URL = "";
let ISO_FILENAME = "Obryx-OS-0.4-Alpha4-x86_64.iso";
let EXPECTED_HASH = "46d071d4d011ff0061a7baf3316e9689484490169a2b9ca1ca892a2e712cbefb";
let VERIFY_COMMAND = buildVerifyCommand();

let lightboxItems = [];
let lightboxIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  loadAdminConfig();
  setupDeviceGate();
  setupDownloadButtons();
  setupDownloadModal();
  setupNavigation();
  setupScrollEffects();
  setupRevealAnimations();
  setupActiveLinks();
  setupCopyButtons();
  setupHeroPointer();
  setupTilt();
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
      if (!DOWNLOAD_URL) {
        const fine = document.getElementById("downloadFine");
        if (fine) {
          fine.textContent = "No ISO link is configured for this browser. Ask the admin to set it in admin.html.";
          fine.classList.add("is-warning");
        }
        return;
      }
      downloadIso();
      closeModal();
    });
  }
}

function downloadIso() {
  const link = document.createElement("a");
  link.href = DOWNLOAD_URL;
  link.download = ISO_FILENAME;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function openDownloadModal(trigger) {
  const modal = document.getElementById("downloadModal");
  if (!modal) return;
  const fine = document.getElementById("downloadFine");
  if (fine) {
    fine.textContent = "The ISO will be saved to your Downloads folder.";
    fine.classList.remove("is-warning");
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
  let queued = false;

  const update = () => {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    const progress = max > 0 ? root.scrollTop / max : 0;
    if (bar) bar.style.transform = `scaleX(${progress})`;
    if (header) header.classList.toggle("is-scrolled", root.scrollTop > 24);
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
  const images = [...document.querySelectorAll(".shot-img[data-shot]")];
  lightboxItems = images.map((img, index) => ({
    src: img.dataset.shot || img.getAttribute("src"),
    alt: img.alt || `Obryx OS screenshot ${index + 1}`
  }));

  images.forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));

    // Keep illustrated fallback if an image is ever missing.
    const probe = new Image();
    probe.onerror = () => {
      img.hidden = true;
      const placeholder = img.parentElement.querySelector(".shot-placeholder");
      if (placeholder) placeholder.hidden = false;
    };
    probe.src = img.dataset.shot;
  });
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
