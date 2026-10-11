// Font lab: try title fonts on the case study headline. Only web fonts
// (Google Fonts), so every choice renders the same on every browser.
// Only loads when the URL has ?fonts (see index.html). Not part of the site.
(function () {
  // [name, Google Fonts weights, kind]
  const FONTS = [
    ["Domine", "400;500;600;700", "serif"],
    ["Newsreader", "400;500;600;700", "serif"],
    ["Lora", "400;500;600;700", "serif"],
    ["Alegreya", "400;500;600;700;800", "serif"],
    ["EB Garamond", "400;500;600;700;800", "serif"],
    ["Cormorant Garamond", "400;500;600;700", "serif"],
    ["Libre Baskerville", "400;700", "serif"],
    ["Libre Caslon Text", "400;700", "serif"],
    ["Source Serif 4", "400;500;600;700", "serif"],
    ["Merriweather", "400;700;900", "serif"],
    ["Playfair Display", "400;500;600;700;800", "serif"],
    ["Fraunces", "400;500;600;700", "serif"],
    ["Crimson Pro", "400;500;600;700", "serif"],
    ["Spectral", "400;500;600;700", "serif"],
    ["Bitter", "400;500;600;700", "serif"],
    ["Young Serif", "400", "serif"],
    ["DM Serif Display", "400", "serif"],
    ["Instrument Serif", "400", "serif"],
    ["Gloock", "400", "serif"],
    ["Nunito Sans", "400;500;600;700;800", "sans"],
    ["Open Sans", "400;500;600;700;800", "sans"],
    ["Inter", "400;500;600;700;800", "sans"],
    ["DM Sans", "400;500;600;700", "sans"],
    ["Manrope", "400;500;600;700;800", "sans"],
    ["Plus Jakarta Sans", "400;500;600;700;800", "sans"],
    ["Space Grotesk", "400;500;600;700", "sans"],
  ].map(([name, weights, kind, stack]) => ({
    name, kind,
    weights: weights ? weights.split(";").map(Number) : [400, 700],
    stack: stack || `"${name}", ${kind === "serif" ? "Georgia, serif" : "system-ui, sans-serif"}`,
    href: weights ? `https://fonts.googleapis.com/css2?family=${name.replace(/ /g, "+")}:wght@${weights}&display=swap` : null,
  }));

  const KEY = "font-lab";
  let state = { name: "Domine", weight: 600, size: 40 };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}

  const loaded = new Set();
  const load = (f) => {
    if (!f.href || loaded.has(f.name)) return;
    loaded.add(f.name);
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = f.href;
    document.head.appendChild(l);
  };
  FONTS.forEach(load); // all at once so the compare view is instant

  const style = document.createElement("style");
  document.head.appendChild(style);

  const css = `
    .fl { position: fixed; left: 16px; bottom: 16px; z-index: 100; width: 260px; max-height: calc(100vh - 32px);
      display: flex; flex-direction: column; background: var(--surface, #fff); color: var(--text, #111);
      border: 1px solid rgba(127,127,127,.35); border-radius: 14px; box-shadow: 0 10px 40px rgba(0,0,0,.25);
      font: 13px/1.3 "Nunito Sans", system-ui, sans-serif; }
    .fl.is-min .fl__body { display: none; }
    .fl__head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid rgba(127,127,127,.25); }
    .fl__head strong { flex: 1; }
    .fl button { font: inherit; color: inherit; background: none; border: 1px solid rgba(127,127,127,.35); border-radius: 8px; padding: 4px 8px; cursor: pointer; }
    .fl button:hover { border-color: currentColor; }
    .fl__body { display: flex; flex-direction: column; min-height: 0; }
    .fl__controls { padding: 10px 12px; display: grid; gap: 8px; border-bottom: 1px solid rgba(127,127,127,.25); }
    .fl__row { display: flex; align-items: center; gap: 8px; }
    .fl__row label { width: 46px; opacity: .7; }
    .fl__row input[type=range] { flex: 1; }
    .fl__row output { width: 34px; text-align: right; font-variant-numeric: tabular-nums; }
    .fl__weights { display: flex; flex-wrap: wrap; gap: 4px; }
    .fl__weights button.is-on, .fl__list button.is-on { background: #c9b5ff; color: #1a1033; border-color: #c9b5ff; }
    .fl__list { overflow: auto; padding: 6px; display: grid; gap: 2px; }
    .fl__list button { border: 0; text-align: left; padding: 6px 8px; font-size: 18px; display: flex; justify-content: space-between; align-items: baseline; }
    .fl__list small { font: 11px "Nunito Sans", sans-serif; opacity: .55; }
    .fl__hint { padding: 8px 12px; opacity: .6; font-size: 11px; border-top: 1px solid rgba(127,127,127,.25); }
    .flc { position: fixed; inset: 0; z-index: 99; overflow: auto; background: var(--bg, #fafaf8); color: var(--text, #111); padding: 24px 24px 24px 300px; }
    .flc[hidden] { display: none; }
    .flc__item { display: block; width: 100%; text-align: left; background: none; border: 0; border-bottom: 1px solid rgba(127,127,127,.2);
      padding: 14px 8px; cursor: pointer; color: inherit; }
    .flc__item:hover { background: rgba(127,127,127,.08); }
    .flc__item.is-on { background: rgba(201,181,255,.25); }
    .flc__name { font: 12px "Nunito Sans", sans-serif; opacity: .6; margin-bottom: 4px; }
    .flc__title { line-height: 1.12; letter-spacing: -.015em; }
    @media (max-width: 700px) { .flc { padding: 16px 16px 340px; } }
  `;

  const panel = document.createElement("div");
  panel.className = "fl";
  panel.innerHTML = `
    <div class="fl__head"><strong>Title font</strong>
      <button type="button" data-act="compare">Compare all</button>
      <button type="button" data-act="min" aria-label="Minimize">–</button></div>
    <div class="fl__body">
      <div class="fl__controls">
        <div class="fl__row"><label>Weight</label><div class="fl__weights"></div></div>
        <div class="fl__row"><label for="fl-size">Size</label><input id="fl-size" type="range" min="24" max="64" step="1" /><output></output></div>
        <div class="fl__row"><button type="button" data-act="open">Open a case study</button><button type="button" data-act="copy">Copy CSS</button></div>
      </div>
      <div class="fl__list"></div>
      <div class="fl__hint">↑ ↓ to step through fonts</div>
    </div>`;
  const compare = document.createElement("div");
  compare.className = "flc"; compare.hidden = true;

  const current = () => FONTS.find((f) => f.name === state.name) || FONTS[0];
  const nearestWeight = (f, w) => f.weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
  const sampleTitle = () => document.querySelector(".cs__content h1")?.textContent || "Building an AI product suite";

  function apply() {
    const f = current();
    const w = nearestWeight(f, state.weight);
    style.textContent = css + `
      .cs__content h1 { font-family: ${f.stack} !important; font-weight: ${w} !important;
        font-size: clamp(30px, 5.5vw, ${state.size}px) !important; font-optical-sizing: auto; }`;
    panel.querySelector(".fl__weights").innerHTML = f.weights
      .map((x) => `<button type="button" data-weight="${x}" class="${x === w ? "is-on" : ""}">${x}</button>`).join("");
    panel.querySelector("#fl-size").value = state.size;
    panel.querySelector("output").textContent = state.size + "px";
    panel.querySelectorAll(".fl__list button").forEach((b) => b.classList.toggle("is-on", b.dataset.font === f.name));
    compare.querySelectorAll(".flc__item").forEach((b) => b.classList.toggle("is-on", b.dataset.font === f.name));
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  function renderList() {
    panel.querySelector(".fl__list").innerHTML = FONTS
      .map((f) => `<button type="button" data-font="${f.name}" style="font-family:${f.stack.replace(/"/g, "&quot;")}">${f.name}<small>${f.kind}</small></button>`).join("");
  }

  function renderCompare() {
    const t = sampleTitle();
    compare.innerHTML = FONTS.map((f) => {
      const w = nearestWeight(f, state.weight);
      return `<button type="button" class="flc__item" data-font="${f.name}">
        <div class="flc__name">${f.name} · ${w}</div>
        <div class="flc__title" style="font-family:${f.stack.replace(/"/g, "&quot;")};font-weight:${w};font-size:${state.size}px">${t}</div></button>`;
    }).join("");
  }

  panel.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.font) { state.name = b.dataset.font; }
    else if (b.dataset.weight) { state.weight = +b.dataset.weight; if (!compare.hidden) renderCompare(); }
    else if (b.dataset.act === "min") panel.classList.toggle("is-min");
    else if (b.dataset.act === "compare") { compare.hidden = !compare.hidden; b.textContent = compare.hidden ? "Compare all" : "Close compare"; if (!compare.hidden) renderCompare(); }
    else if (b.dataset.act === "open") document.querySelector(".card")?.click();
    else if (b.dataset.act === "copy") {
      const f = current();
      navigator.clipboard?.writeText(`font: ${nearestWeight(f, state.weight)} clamp(30px, 5.5vw, ${state.size}px)/1.12 ${f.stack};`);
      b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy CSS"), 1200);
    }
    apply();
  });
  compare.addEventListener("click", (e) => {
    const b = e.target.closest(".flc__item"); if (!b) return;
    state.name = b.dataset.font; apply();
  });
  panel.querySelector("#fl-size").addEventListener("input", (e) => {
    state.size = +e.target.value; apply(); if (!compare.hidden) renderCompare();
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input[type=text], textarea") || !/^Arrow(Up|Down)$/.test(e.key)) return;
    if (!panel.matches(":hover") && compare.hidden) return; // don't hijack page scrolling
    e.preventDefault();
    const i = FONTS.indexOf(current());
    state.name = FONTS[(i + (e.key === "ArrowDown" ? 1 : -1) + FONTS.length) % FONTS.length].name;
    apply();
    panel.querySelector(`.fl__list button[data-font="${CSS.escape(state.name)}"]`)?.scrollIntoView({ block: "nearest" });
  });

  const mount = () => { document.body.append(compare, panel); renderList(); apply(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
})();
