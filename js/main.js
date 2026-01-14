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
