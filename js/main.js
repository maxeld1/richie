document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".header-menu");
  const menu = document.getElementById("mobile-menu");

  if (!btn || !menu) return;

  // ensure initial state is closed
  btn.setAttribute("aria-expanded", "false");
  menu.classList.remove("is-open");
  menu.hidden = true;

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!isOpen));

    menu.hidden = isOpen;              // accessibility
    menu.classList.toggle("is-open");  // your CSS uses this
  });

  // optional: close menu when clicking a link
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    btn.setAttribute("aria-expanded", "false");
    menu.hidden = true;
    menu.classList.remove("is-open");
  });
});

function wireMenu() {
  const btn = document.querySelector(".header-menu");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  const open = () => {
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Close menu");
    menu.hidden = false;
    menu.classList.add("is-open");
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
  };

  const close = () => {
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "Open menu");
    menu.classList.remove("is-open");
    menu.hidden = true;
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
  };

  // Ensure clean state
  close();

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    isOpen ? close() : open();
  });

  // Close on link click
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });

  // Close on ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// Works even if header is injected after DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  wireMenu();
  // In case partials load after:
  setTimeout(wireMenu, 50);
  setTimeout(wireMenu, 250);
});
