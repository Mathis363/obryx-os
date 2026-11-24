/* ============================================================
   Obryx OS — interactions
   ------------------------------------------------------------
   ⚠️  ONLY THING YOU NEED TO EDIT TO MAKE "DOWNLOAD" WORK:
   Replace DOWNLOAD_URL below with the DIRECT link to the ISO.
   A 3.7 GB file cannot live in a GitHub repo or on GitHub Pages,
   so host it on a file host and paste its direct URL here.
   Until then the buttons point to the Releases page.
   ============================================================ */

const DOWNLOAD_URL = "https://github.com/Mathis363/obryx-os/releases";

const ISO_FILENAME = "Obryx-OS-0.4-Alpha4-x86_64.iso";
const EXPECTED_HASH = "46d071d4d011ff0061a7baf3316e9689484490169a2b9ca1ca892a2e712cbefb";
const VERIFY_COMMAND = `(Get-FileHash .\\${ISO_FILENAME}).Hash`;

document.addEventListener("DOMContentLoaded", () => {
  setupDownloadButtons();
  setupNavigation();
  setupScrollEffects();
  setupRevealAnimations();
  setupActiveLinks();
  setupCopyButtons();
  setupHeroPointer();
  setupScreenshots();
  setupLightbox();
});

/* ── Download buttons (one URL for the whole page) ─────────── */
function setupDownloadButtons() {
  document.querySelectorAll("[data-download]").forEach((link) => {
    link.href = DOWNLOAD_URL || "#";
    if (DOWNLOAD_URL && !DOWNLOAD_URL.startsWith("#")) {
      link.setAttribute("aria-label", `${link.textContent.trim()} (3.7 GB)`);
    }
  });
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

  // Show whatever is already on screen right away (no blank first paint).
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

  // Safety net for browsers/tabs that delay observer callbacks.
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
  const values = { command: VERIFY_COMMAND, hash: EXPECTED_HASH };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = values[button.dataset.copy];
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

/* ── Screenshots: drop files in assets/screenshots/ and they
      appear automatically — no HTML edit needed for existing
      slots. Names: obryx-shot-01.png, obryx-shot-02.png, obryx-shot-03.png ── */
function setupScreenshots() {
  document.querySelectorAll(".shot-img[data-shot]").forEach((img) => {
    const src = img.dataset.shot;
    const probe = new Image();

    probe.onload = () => {
      img.src = src;
      img.hidden = false;
      const placeholder = img.parentElement.querySelector(".shot-placeholder");
      if (placeholder) placeholder.hidden = true;
      img.addEventListener("click", () => openLightbox(src, img.alt));
    };
    probe.onerror = () => { /* keep the illustrated placeholder */ };
    probe.src = src;
  });
}

/* ── Screenshot lightbox ───────────────────────────────────── */
function setupLightbox() {
  const box = document.getElementById("lightbox");
  if (!box) return;
  const closeButton = document.getElementById("lightboxClose");
  const image = document.getElementById("lightboxImg");
  const caption = document.getElementById("lightboxCaption");

  closeButton.addEventListener("click", closeLightbox);
  box.addEventListener("click", (event) => {
    if (event.target === box) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !box.hidden) closeLightbox();
  });
}

function openLightbox(src, alt) {
  const box = document.getElementById("lightbox");
  if (!box) return;
  box.dataset.returnFocus = document.activeElement ? "1" : "0";
  box.dataset.returnFocusId = document.activeElement && document.activeElement.id ? document.activeElement.id : "";
  const image = document.getElementById("lightboxImg");
  const caption = document.getElementById("lightboxCaption");
  image.src = src;
  image.alt = alt;
  caption.textContent = alt;
  box.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("lightboxClose").focus();
}

function closeLightbox() {
  const box = document.getElementById("lightbox");
  if (!box || box.hidden) return;
  box.hidden = true;
  document.body.style.overflow = "";
  const image = document.getElementById("lightboxImg");
  image.removeAttribute("src");
  if (box.dataset.returnFocusId) {
    document.getElementById(box.dataset.returnFocusId)?.focus();
  }
}
