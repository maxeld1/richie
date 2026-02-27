// /js/main.js
(function () {
  function wireMenu() {
    const btn = document.querySelector(".header-menu");
    const menu = document.getElementById("mobile-menu");

    if (!btn || !menu) return;

    // Avoid double-binding if this runs multiple times
    if (btn.dataset.wired === "true") return;
    btn.dataset.wired = "true";

    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");

      menu.hidden = false;                 // allow it to render
      menu.classList.add("is-open");       // CSS anim state
      document.body.classList.add("no-scroll");
    };

    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");

      menu.classList.remove("is-open");
      // wait for CSS fade to finish, then hide
      window.setTimeout(() => {
        if (btn.getAttribute("aria-expanded") === "false") {
          menu.hidden = true;
        }
      }, 200);

      document.body.classList.remove("no-scroll");
    };

    // Start closed
    close();

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    });

    // Close when clicking a link
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });

    // ESC to close
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // Click outside menu to close (optional)
    document.addEventListener("click", (e) => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;
      if (e.target.closest("#mobile-menu") || e.target.closest(".header-menu")) return;
      close();
    });
  }

  // Works with injected partials: try a few times
  document.addEventListener("DOMContentLoaded", () => {
    wireMenu();
    setTimeout(wireMenu, 50);
    setTimeout(wireMenu, 250);
    setTimeout(wireMenu, 600);
  });
})();

function initHeroSlider() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  if (hero.dataset.sliderWired === "true") return;
  hero.dataset.sliderWired = "true";

  const track = hero.querySelector(".hero-track");
  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const prevBtn = hero.querySelector(".hero-arrow.left");
  const nextBtn = hero.querySelector(".hero-arrow.right");
  const dotsWrap = hero.querySelector(".hero-dots");

  if (!track || slides.length === 0) return;

  let index = 0;
  let timer = null;
  const INTERVAL_MS = 4500;

  // Build dots if container exists
  let dots = [];
  if (dotsWrap) {
    dotsWrap.innerHTML = "";
    dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.className = "dot" + (i === 0 ? " active" : "");
      b.type = "button";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
      return b;
    });
  }

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    update();
    if (userAction) restartAuto();
  }

  function next(userAction = false) {
    goTo(index + 1, userAction);
  }

  function prev(userAction = false) {
    goTo(index - 1, userAction);
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => next(false), INTERVAL_MS);
  }

  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restartAuto() {
    startAuto();
  }

  // Wire buttons
  if (nextBtn) nextBtn.addEventListener("click", () => next(true));
  if (prevBtn) prevBtn.addEventListener("click", () => prev(true));

  // Pause on hover (desktop)
  hero.addEventListener("mouseenter", stopAuto);
  hero.addEventListener("mouseleave", startAuto);

  // Pause on touch while interacting (mobile)
  hero.addEventListener("touchstart", stopAuto, { passive: true });
  hero.addEventListener("touchend", startAuto, { passive: true });

  // Swipe support (mobile)
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_THRESHOLD = 40;

  hero.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  hero.addEventListener("touchend", (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) < Math.abs(dy)) return;

    dx < 0 ? next(true) : prev(true);
  }, { passive: true });

  // Make sure widths are correct before first render
  update();
  startAuto();
}

// ---- Reveal / fade (single source of truth + stagger) ----
(function () {
  document.documentElement.classList.add("js");

  function applyStagger(el) {
    // If element has data-stagger="120", use that spacing (ms)
    const parent = el.closest("[data-stagger]");
    if (!parent) return;

    const spacing = parseInt(parent.getAttribute("data-stagger") || "120", 10);
    const items = Array.from(parent.querySelectorAll(".fade-line"));

    items.forEach((node, i) => {
      node.style.transitionDelay = `${i * spacing}ms`;
    });
  }

  function initReveals() {
    const els = document.querySelectorAll(".fade-up, .fade-line, .reveal");
    if (!els.length) return;

    // Apply stagger delays (for fade-line groups)
    els.forEach(applyStagger);

    if (!("IntersectionObserver" in window)) {
      els.forEach(el => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -10% 0px" });

    els.forEach(el => io.observe(el));
  }

  window.addEventListener("load", () => {
    initReveals();
    setTimeout(initReveals, 80);
    setTimeout(initReveals, 300);
    setTimeout(initReveals, 700);
  });
})();

function initHomeFanOnTrigger() {
  const body = document.body;
  if (!body.classList.contains("page-home")) return;

  const trigger = document.querySelector(".fan-trigger");
  const items = Array.from(document.querySelectorAll(".fan-item"));
  if (!trigger || !items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const itemObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3, rootMargin: "0px 0px -10% 0px" });

  const triggerObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      trigger.classList.add("is-visible");

      const parseTime = (val) => {
        const v = val.trim();
        if (v.endsWith("ms")) return parseFloat(v);
        if (v.endsWith("s")) return parseFloat(v) * 1000;
        return parseFloat(v) || 0;
      };

      const style = window.getComputedStyle(trigger);
      const durations = style.transitionDuration.split(",").map(parseTime);
      const delays = style.transitionDelay.split(",").map(parseTime);
      const maxDur = Math.max(...durations, 0);
      const maxDelay = Math.max(...delays, 0);
      const wait = maxDur + maxDelay;

      setTimeout(() => {
        items.forEach((item) => itemObserver.observe(item));
      }, Math.max(wait, 600));
      obs.disconnect();
    });
  }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });

  triggerObserver.observe(trigger);
}

window.addEventListener("load", () => {
  initHomeFanOnTrigger();
});

/**
 * IMPORTANT:
 * init after the DOM settles.
 */
window.addEventListener("load", () => {
  initHeroSlider();

  // If hero is injected after load, retry briefly
  let tries = 0;
  const retry = setInterval(() => {
    if (document.querySelector(".hero .hero-track")) {
      initHeroSlider();
      clearInterval(retry);
    }
    if (++tries > 10) clearInterval(retry);
  }, 150);
});

function initPortfolioFilters() {
  const filterWrap = document.querySelector(".portfolio-filters");
  if (!filterWrap) return;

  const buttons = Array.from(filterWrap.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".portfolio-card"));
  if (!buttons.length || !cards.length) return;

  function setActive(filter) {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    cards.forEach((card) => {
      const categories = (card.dataset.category || "")
        .split(/\s+/)
        .filter(Boolean);
      const isMatch = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !isMatch);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn.dataset.filter || "all");
    });
  });

  const initial = buttons.find((btn) => btn.classList.contains("is-active"));
  setActive((initial && initial.dataset.filter) || "all");
}

window.addEventListener("load", () => {
  initPortfolioFilters();
});

function initPortfolioModal() {
  const modal = document.getElementById("portfolio-modal");
  if (!modal) return;

  const cards = Array.from(document.querySelectorAll(".portfolio-card"));
  if (!cards.length) return;

  const titleEl = document.getElementById("portfolio-modal-title");
  const metaEl = document.getElementById("portfolio-modal-meta");
  const notesEl = document.getElementById("portfolio-modal-notes");
  const ctaEl = document.getElementById("portfolio-modal-cta");
  const coverEl = document.getElementById("portfolio-modal-cover");
  const closeBtn = modal.querySelector(".portfolio-modal-close");
  const closeEls = Array.from(modal.querySelectorAll("[data-modal-close]"));

  let lastFocus = null;

  function buildMetaRow(label, value) {
    if (!value) return null;
    const row = document.createElement("div");
    row.className = "portfolio-modal-row";
    const key = document.createElement("span");
    key.className = "portfolio-modal-key";
    key.textContent = label;
    const val = document.createElement("span");
    val.className = "portfolio-modal-value";
    val.textContent = value;
    row.appendChild(key);
    row.appendChild(val);
    return row;
  }

  function open(card) {
    const data = card.dataset || {};
    const title = data.show || card.getAttribute("aria-label") || "Project Details";

    if (titleEl) titleEl.textContent = title;

    if (coverEl) {
      if (data.cover) {
        coverEl.src = data.cover;
        coverEl.alt = title;
        coverEl.style.display = "block";
        modal.classList.add("has-cover");
      } else {
        coverEl.removeAttribute("src");
        coverEl.alt = "";
        coverEl.style.display = "none";
        modal.classList.remove("has-cover");
      }
    }

    if (metaEl) {
      metaEl.innerHTML = "";
      const rows = [
        buildMetaRow("Directed By", data.directed),
        buildMetaRow("Location", data.location),
        buildMetaRow("Date", data.date),
        buildMetaRow("Role", data.role),
      ].filter(Boolean);
      rows.forEach((row) => metaEl.appendChild(row));
      metaEl.style.display = rows.length ? "grid" : "none";
    }

    if (notesEl) {
      if (data.notes) {
        notesEl.textContent = data.notes;
        notesEl.style.display = "block";
      } else {
        notesEl.textContent = "";
        notesEl.style.display = "none";
      }
    }

    if (ctaEl) {
      if (data.gallery) {
        ctaEl.href = data.gallery;
        ctaEl.style.display = "inline-flex";
      } else {
        ctaEl.removeAttribute("href");
        ctaEl.style.display = "none";
      }
    }

    lastFocus = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.preventDefault();
      open(card);
    });
  });

  closeEls.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      close();
    }
  });
}

window.addEventListener("load", () => {
  initPortfolioModal();
});

function initAudioPlayers() {
  const cards = Array.from(document.querySelectorAll("[data-audio-card]"));
  if (!cards.length) return;

  function formatTime(time) {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  function pauseAll(except) {
    cards.forEach((card) => {
      const audio = card.querySelector("[data-audio]");
      const btn = card.querySelector("[data-audio-toggle]");
      if (!audio || !btn || audio === except) return;
      audio.pause();
      btn.textContent = "Play";
      btn.classList.remove("is-playing");
    });
  }

  cards.forEach((card) => {
    const audio = card.querySelector("[data-audio]");
    const btn = card.querySelector("[data-audio-toggle]");
    const bar = card.querySelector("[data-audio-bar]");
    const progress = card.querySelector("[data-audio-progress]");
    const timeEl = card.querySelector("[data-audio-time]");

    if (!audio || !btn || !bar || !progress || !timeEl) return;

    btn.addEventListener("click", () => {
      if (audio.paused) {
        pauseAll(audio);
        audio.play();
        btn.textContent = "Pause";
        btn.classList.add("is-playing");
      } else {
        audio.pause();
        btn.textContent = "Play";
        btn.classList.remove("is-playing");
      }
    });

    audio.addEventListener("timeupdate", () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      progress.style.width = `${pct}%`;
      timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("loadedmetadata", () => {
      timeEl.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });

    audio.addEventListener("ended", () => {
      btn.textContent = "Play";
      btn.classList.remove("is-playing");
      progress.style.width = "0%";
      timeEl.textContent = `0:00 / ${formatTime(audio.duration)}`;
    });

    bar.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(1, pct)) * audio.duration;
    });
  });
}

window.addEventListener("load", () => {
  initAudioPlayers();
});

function initGalleryLightbox() {
  const modal = document.getElementById("gallery-modal");
  if (!modal) return;

  const images = Array.from(document.querySelectorAll(".project-gallery-grid img"));
  if (!images.length) return;

  const imgEl = document.getElementById("gallery-modal-image");
  const closeEls = Array.from(modal.querySelectorAll("[data-gallery-close]"));
  const prevBtn = modal.querySelector("[data-gallery-prev]");
  const nextBtn = modal.querySelector("[data-gallery-next]");
  let index = 0;
  let lastFocus = null;

  function show(i) {
    index = (i + images.length) % images.length;
    const src = images[index].getAttribute("src");
    const alt = images[index].getAttribute("alt") || "";
    if (imgEl) {
      imgEl.src = src;
      imgEl.alt = alt;
    }
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    if (prevBtn) prevBtn.focus();
  }

  function close() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  images.forEach((img, i) => {
    img.style.cursor = "pointer";
    img.addEventListener("click", () => open(i));
  });

  if (prevBtn) prevBtn.addEventListener("click", () => show(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => show(index + 1));

  closeEls.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      close();
    });
  });

  window.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}

window.addEventListener("load", () => {
  initGalleryLightbox();
});

function initHomeReady() {
  const body = document.body;
  if (!body.classList.contains("page-home")) return;
  body.classList.add("home-ready");
}

window.addEventListener("load", () => {
  initHomeReady();
});
