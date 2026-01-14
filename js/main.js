// /js/main.js
(() => {
  "use strict";

  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  function lockScroll(lock) {
    document.documentElement.classList.toggle("no-scroll", lock);
    document.body.classList.toggle("no-scroll", lock);
  }

  function initMenu() {
    const btn = document.querySelector(".header-menu");
    const menu = document.getElementById("mobile-menu");

    if (!btn || !menu) return;

    // Prevent double-binding if initMenu gets called again
    if (btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    const label = btn.querySelector(".menu-label");

    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      if (label) label.textContent = "X";
      menu.hidden = false;
      menu.classList.add("is-open");
      lockScroll(true);
    };

    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Open menu");
      if (label) label.textContent = "Menu";
      menu.classList.remove("is-open");
      menu.hidden = true;
      lockScroll(false);
    };

    const toggle = () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    };

    // Initial state
    btn.setAttribute("aria-expanded", "false");
    if (!btn.getAttribute("aria-label")) btn.setAttribute("aria-label", "Open menu");
    close();

    // Events
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggle();
    });

    // Close if user clicks a link
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });

    // Close on ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // Optional: close if user clicks outside the menu content
    menu.addEventListener("click", (e) => {
      // If menu is a full-screen overlay, clicking empty area closes
      if (e.target === menu) close();
    });
  }

  function initAll() {
    setYear();
    initMenu();
  }

  // Run after regular DOM load (for pages without partials)
  document.addEventListener("DOMContentLoaded", initAll);

  // Run after partials are injected (this is the important one)
  document.addEventListener("partials:loaded", initAll);
})();

// -------------------- HERO SLIDER --------------------
(function(){
  const track = document.querySelector('.hero-track');
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  const prev = document.querySelector('.hero-arrow.left');
  const next = document.querySelector('.hero-arrow.right');

  if (!track || slides.length === 0) return;

  let index = 0;

  function update(){
    track.style.transform = `translateX(-${index * 100}%)`;

    dots.forEach(d => d.classList.remove('active'));
    if (dots[index]) dots[index].classList.add('active');
  }

  next?.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });

  prev?.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      index = i;
      update();
    });
  });

  // ✅ AUTO-ADVANCE
  setInterval(() => {
    index = (index + 1) % slides.length;
    update();
  }, 5000);

})();


