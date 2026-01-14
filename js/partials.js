// /js/partials.js
(() => {
  "use strict";

  const INCLUDE_ATTR = 'data-include';
  const PARTIALS_DIR = 'partials';

  // Compute prefix so links work from / and /pages/
  const isSubpage = location.pathname.includes('/pages/');
  const P = isSubpage ? '../' : '';

  async function fetchText(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    return await res.text();
  }

  function applyPrefixPlaceholders(html) {
    return html.replaceAll('{{P}}', P);
  }

  async function injectOne(placeholderEl) {
    const name = placeholderEl.getAttribute(INCLUDE_ATTR); // "header" or "footer"
    if (!name) return null;

    const file = `${name}.html`;
    const url = `${P}${PARTIALS_DIR}/${file}`;

    const raw = await fetchText(url);
    const html = applyPrefixPlaceholders(raw);

    // Convert HTML string to real nodes
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();

    const fragment = tpl.content;

    // Replace placeholder with injected fragment
    placeholderEl.replaceWith(fragment);

    return { name, file, url };
  }

  async function injectAll() {
    const placeholders = Array.from(document.querySelectorAll(`[${INCLUDE_ATTR}]`));
    const injected = [];

    for (const el of placeholders) {
      try {
        const info = await injectOne(el);
        if (info) injected.push(info);
      } catch (err) {
        console.error(`Include failed: ${el.getAttribute(INCLUDE_ATTR)}`, err);
      }
    }

    // Expose prefix globally for convenience (optional)
    window.__P = P;

    // Notify other scripts that partials are now in the DOM
    document.dispatchEvent(
        new CustomEvent('partials:loaded', { detail: { prefix: P, injected } })
    );

    return injected;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(() => {
    injectAll();
  });
})();
