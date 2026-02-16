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

function initHomeScrollReveal() {
  const body = document.body;
  if (!body.classList.contains("page-home")) return;

  body.classList.add("home-ready");

  const onScroll = () => {
    if (window.scrollY > 10) {
      body.classList.add("has-scrolled");
      window.removeEventListener("scroll", onScroll);
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

window.addEventListener("load", () => {
  initHomeScrollReveal();
});
