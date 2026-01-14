// /js/main.js
(() => {
  function wireMenu() {
    const btn = document.querySelector(".header-menu");
    const menu = document.getElementById("mobile-menu");
    if (!btn || !menu) return;

    // Prevent double-binding if wireMenu runs multiple times
    if (btn.dataset.wired === "true") return;
    btn.dataset.wired = "true";

    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      menu.classList.add("is-open");
      document.documentElement.classList.add("no-scroll");
      document.body.classList.add("no-scroll");
    };

    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      menu.hidden = true;
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };

    const toggle = () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      isOpen ? close() : open();
    };

    // Start closed
    close();

    // Toggle on button click
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // important if you also close on outside click
      toggle();
    });

    // Click inside menu should NOT close unless it's a link
    menu.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (link) close();
      e.stopPropagation();
    });

    // Click outside closes
    document.addEventListener("click", () => {
      if (btn.getAttribute("aria-expanded") === "true") close();
    });

    // ESC closes
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // Works with partial injection:
  // - run once on DOM ready
  // - then retry a few times while header is being injected
  document.addEventListener("DOMContentLoaded", () => {
    wireMenu();
    setTimeout(wireMenu, 50);
    setTimeout(wireMenu, 200);
    setTimeout(wireMenu, 500);
  });
})();
