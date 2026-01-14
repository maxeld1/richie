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
