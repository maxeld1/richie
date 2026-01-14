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

  // Make sure widths are correct before first render
  update();
  startAuto();
}

/**
 * IMPORTANT:
 * If your page uses partials.js to inject header/footer (and maybe hero),
 * init after the DOM settles.
 */
window.addEventListener("load", () => {
  initHeroSlider();

  // If your hero is injected AFTER load (rare), retry a couple times:
  let tries = 0;
  const retry = setInterval(() => {
    if (document.querySelector(".hero .hero-track")) {
      initHeroSlider();
      clearInterval(retry);
    }
    if (++tries > 10) clearInterval(retry);
  }, 150);
});
