(() => {
  const thread = document.getElementById("thread");
  const chat = document.getElementById("chat");
  const form = document.getElementById("form");
  const input = document.getElementById("input");
  const suggestions = document.getElementById("suggestions");
  const drawer = document.getElementById("drawer");
  const drawerBody = document.getElementById("drawer-body");

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const scrollDown = () => chat.scrollTo({ top: chat.scrollHeight, behavior: "smooth" });

  const ALL_TAGS = [...new Set(PROJECTS.flatMap((p) => p.tags))];
  const TAG_COUNT = Object.fromEntries(ALL_TAGS.map((t) => [t, PROJECTS.filter((p) => p.tags.includes(t)).length]));
  const shownTags = (p) => (p.showTags && p.showTags.length ? p.showTags : p.tags.slice(0, 3));

  const avatarHTML = (cls = "avatar") =>
    PROFILE.photo
      ? `<span class="${cls}" aria-hidden="true"><img src="${esc(PROFILE.photo)}" alt="" /></span>`
      : `<span class="${cls}" aria-hidden="true">${esc(PROFILE.initials)}</span>`;

  document.getElementById("brand-avatar").outerHTML = avatarHTML("avatar avatar--sm");

  // ── Messages ──────────────────────────────────────────────
  // The assistant's avatar: a simple lavender dot (header keeps Anjali's photo).
  // While its reply is read aloud, it moves down to follow the line being spoken.
  const BOT_FACE = `<span class="avatar avatar--bot" aria-hidden="true"><span class="bot-dot"></span></span>`;

  function addUser(text) {
    const el = document.createElement("div");
    el.className = "msg msg--user";
    el.innerHTML = `<div class="bubble">${esc(text)}</div>`;
    thread.appendChild(el);
    scrollDown();
  }

  async function addBot(html, { delay = 650 } = {}) {
    const el = document.createElement("div");
    el.className = "msg msg--bot";
    el.innerHTML = `${BOT_FACE}
      <div class="msg__body"><div class="bubble typing"><span></span><span></span><span></span></div></div>`;
    thread.appendChild(el);
    scrollDown();
    await wait(delay);
    const body = el.querySelector(".msg__body");
    body.innerHTML = html;
    attachAudio(el);
    const duration = reveal(body);
    scrollToMsg(el);
    await wait(duration);
    return el;
  }

  // Keep the start of a tall reply (and the question above it) in view; otherwise stick to the bottom
  function scrollToMsg(el) {
    if (el.offsetHeight > chat.clientHeight * 0.8) {
      const anchor = el.previousElementSibling?.classList.contains("msg--user") ? el.previousElementSibling : el;
      const top = anchor.getBoundingClientRect().top - chat.getBoundingClientRect().top + chat.scrollTop;
      chat.scrollTo({ top: top - 16, behavior: "smooth" });
    } else {
      scrollDown();
    }
  }

  // ── Streaming reveal ──────────────────────────────────────
  // Wraps every word in the reply's bubbles in a span and fades them in
  // one after another; each bubble's Listen button and any lists, cards,
  // or buttons follow in page order.
  // Returns how long the whole reveal takes (ms).
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveal(body) {
    if (reduceMotion) return 0;

    // Wrap every word of each bubble in a span (buttons inside bubbles excluded)
    const words = [];
    const wordsOf = new Map();
    for (const bubble of body.querySelectorAll(".bubble")) {
      const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.parentElement.closest(".linkrow") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      const own = [];
      for (const node of nodes) {
        if (!node.textContent.trim()) continue;
        const frag = document.createDocumentFragment();
        for (const part of node.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement("span");
          w.className = "w";
          w.textContent = part;
          frag.append(w);
          own.push(w);
        }
        node.replaceWith(frag);
      }
      if (own.length) { bubble.dataset.at = ""; wordsOf.set(bubble, own); words.push(...own); }
    }

    // Short replies type at a natural pace; long ones speed up to finish in ~2.4s
    const step = Math.min(34, 2400 / Math.max(words.length, 1));

    // Play the reply in order: each bubble types out, then its Listen button,
    // then whatever follows (project list, timeline, next bubble…)
    const blocks = [];
    const show = (el, at) => {
      el.classList.add("reveal-block");
      el.style.transitionDelay = `${Math.round(at)}ms`;
      blocks.push(el);
    };
    let t = 0;
    for (const child of body.children) {
      if (child.classList.contains("bubble")) {
        const own = wordsOf.get(child) || [];
        child.style.animationDelay = `${Math.round(t)}ms`;
        own.forEach((w, i) => (w.style.transitionDelay = `${Math.round(t + i * step)}ms`));
        t += own.length * step;
        for (const row of child.querySelectorAll(".linkrow")) show(row, t + 80);
        t += 150;
      } else if (child.classList.contains("cards") || child.classList.contains("timeline")) {
        show(child, t);
        for (const row of child.querySelectorAll(".card, .tl")) show(row, (t += 80));
        t += 200;
      } else if (child.classList.contains("quotes")) {
        for (const item of child.children) {
          show(item.querySelector(".quote") || item, t);
          const listen = item.querySelector(".speak");
          if (listen) show(listen, t + 250);
          t += 100;
        }
        t += 300;
      } else {
        show(child, t); // Listen buttons, résumé card, etc.
        t += child.classList.contains("speak") ? 60 : 150;
      }
    }

    body.classList.add("is-revealing");
    body.offsetWidth; // commit the hidden state before transitioning
    requestAnimationFrame(() => body.classList.add("is-revealed"));

    const total = t + 450;
    // Clear delays afterwards so hover transitions on cards stay snappy
    setTimeout(() => {
      body.classList.remove("is-revealing", "is-revealed");
      for (const b of blocks) { b.classList.remove("reveal-block"); b.style.transitionDelay = ""; }
      for (const w of words) w.style.transitionDelay = "";
    }, total);
    return total;
  }

  // ── Audio (text-to-speech) ────────────────────────────────
  const tts = "speechSynthesis" in window ? window.speechSynthesis : null;
  let speakingBtn = null;

  function pickVoice() {
    const voices = tts.getVoices();
    for (const name of VOICE.preferredVoices) {
      const v = voices.find((x) => x.name.startsWith(name) && x.lang.startsWith(VOICE.lang.slice(0, 2)));
      if (v) return v;
    }
    const sameLang = voices.filter((v) => v.lang.replace("_", "-") === VOICE.lang);
    return (
      sameLang.find((v) => /natural|premium|enhanced/i.test(v.name)) ||
      sameLang[0] ||
      voices.find((v) => v.lang.startsWith("en")) ||
      null
    );
  }

  // ── Spoken-word highlight ─────────────────────────────────
  // While a reply is read aloud, the word being spoken gets a lavender
  // highlight. The voice reports its position in the text (boundary events);
  // each word on screen is a span, mapped to its character range in that text.
  const SKIP_GLYPHS = /\p{Extended_Pictographic}|[↗→]/gu;

  // Swap in phonetic spellings from PRONUNCIATIONS (e.g. Anjali → Un-juh-lee)
  const PRONOUNCE_RE = new RegExp(`\\b(${Object.keys(PRONUNCIATIONS).join("|")})\\b`, "gi");
  const pronounce = (word) =>
    Object.keys(PRONUNCIATIONS).length
      ? word.replace(PRONOUNCE_RE, (m) => PRONUNCIATIONS[Object.keys(PRONUNCIATIONS).find((k) => k.toLowerCase() === m.toLowerCase())])
      : word;

  // Wrap the words inside `root` in .w spans (reusing any the reveal already made)
  function wordSpans(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.parentElement.closest(".linkrow, .speak, .w") || !n.textContent.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const w = document.createElement("span");
        w.className = "w";
        w.textContent = part;
        frag.append(w);
      }
      node.replaceWith(frag);
    }
    return [...root.querySelectorAll(".w")].filter((w) => !w.closest(".linkrow, .speak"));
  }

  // Build what the voice says plus a map from character ranges to word spans.
  // Testimonials read the quote then who said it; the project list reads each
  // project's title and company; headings get a pause after them.
  function buildSpeech(item) {
    let text = "";
    const map = [];
    const say = (str) => (text = (/^[,.]/.test(str) ? text.trimEnd() : text) + str);
    const words = (el) => {
      if (!el) return;
      const spans = wordSpans(el);
      spans.forEach((w, i) => {
        const clean = pronounce(w.textContent.replace(SKIP_GLYPHS, ""));
        if (!clean) return;
        map.push({ el: w, start: text.length, end: text.length + clean.length });
        say(clean);
        // Pause after headings, step labels, and stat numbers
        const PAUSE_AFTER = "h1, h2, h3, li > strong, .cs__stats strong";
        const heading = w.closest(PAUSE_AFTER);
        const lastInHeading = heading && spans[i + 1]?.closest(PAUSE_AFTER) !== heading;
        say(lastInHeading && !/[.!?:]$/.test(clean) ? ". " : " ");
      });
    };

    if (item.classList.contains("timeline")) {
      // Heading, then each role: dates, company · role, and the one-line summary (tags skipped)
      words(item.querySelector(".timeline__head"));
      say(". ");
      for (const row of item.querySelectorAll(".tl")) {
        words(row.querySelector(".tl__dates"));
        say(", ");
        words(row.querySelector(".tl__role"));
        say(". ");
        words(row.querySelector(".tl__summary"));
        say(" ");
      }
    } else if (item.classList.contains("cards")) {
      for (const card of item.querySelectorAll(".card")) {
        words(card.querySelector(".card__title"));
        say(", at ");
        words(card.querySelector(".card__meta"));
        say(". ");
      }
    } else if (item.classList.contains("quote")) {
      words(item.querySelector("blockquote"));
      say(" — ");
      words(item.querySelector("figcaption strong"));
      say(", ");
      words(item.querySelector("figcaption span span"));
      say(".");
    } else {
      words(item);
    }
    return { text: text.replace(/\s+/g, " ").trim(), map };
  }

  let spokenMap = [];
  let spokenEl = null;
  let wordTimer = 0;
  let gotBoundary = false;

  function highlightWord(entry) {
    if (spokenEl) spokenEl.classList.remove("is-spoken");
    spokenEl = entry ? entry.el : null;
    if (spokenEl) {
      spokenEl.classList.add("is-spoken");
      followWord(spokenEl); // the dot follows the line being read
      pulseBars(spokenEl.textContent); // the Stop button's bars react to the word
      keepInView(spokenEl); // case studies scroll to follow the voice
    }
  }

  // While a case study is read aloud, scroll the panel so the spoken line
  // stays comfortably in view (below the sticky header)
  function keepInView(wordEl) {
    const panel = wordEl.closest(".drawer__panel");
    if (!panel) return;
    const view = panel.getBoundingClientRect();
    const r = wordEl.getBoundingClientRect();
    const barH = panel.querySelector(".drawer__bar")?.offsetHeight || 0;
    if (r.top < view.top + barH + 40 || r.bottom > view.bottom - 80) {
      panel.scrollTo({ top: panel.scrollTop + (r.top - view.top) - view.height * 0.35, behavior: "smooth" });
    }
  }

  // The four bars on the playing button jump to a shape made from the spoken
  // word's letters (so each word looks different, longer words reach higher),
  // then settle back down between words
  let barsTimer = 0;

  function setBars(heights) {
    const bars = speakingBtn?.querySelectorAll(".speak__bars i");
    bars?.forEach((bar, i) => (bar.style.transform = `scaleY(${heights[i]})`));
  }

  function pulseBars(word) {
    if (!speakingBtn) return;
    const letters = word.replace(/[^a-z0-9]/gi, "") || word;
    const energy = Math.min(0.55 + letters.length * 0.06, 1);
    setBars([0, 1, 2, 3].map((i) => {
      const code = letters.charCodeAt((i * 2) % letters.length) || 0;
      return (0.3 + 0.7 * ((code * (i + 3)) % 10) / 9) * energy;
    }));
    clearTimeout(barsTimer);
    barsTimer = setTimeout(() => setBars([0.3, 0.45, 0.35, 0.3]), 140 + Math.min(letters.length * 15, 150));
  }

  // ── Talking dot ───────────────────────────────────────────
  // The dot beside the reply being read glides down to stay level with the
  // line currently being spoken, then returns to the top when playback ends
  let talkingBot = null;

  function followWord(wordEl) {
    const dot = talkingBot?.querySelector(".bot-dot");
    if (!dot || !wordEl) return;
    const home = talkingBot.getBoundingClientRect();
    const word = wordEl.getBoundingClientRect();
    const y = Math.max(0, Math.round(word.top + word.height / 2 - (home.top + home.height / 2)));
    // Only move when the voice reaches a new line — tiny per-word differences
    // would keep restarting the glide (very noticeable on phones' short lines)
    if (Math.abs(y - (dot._y ?? 0)) < 8) return;
    glideDot(dot, y);
  }

  // Animate the dot from wherever it is right now to `y`. Uses the Web
  // Animations API rather than a CSS transition, which iPhones skip when
  // Reduce Motion is on — so the glide looks the same on phones as on desktop.
  function glideDot(dot, y) {
    const m = getComputedStyle(dot).transform.match(/matrix(?:3d)?\(([^)]+)\)/);
    const vals = m ? m[1].split(",").map(Number) : [];
    const from = vals.length === 16 ? vals[13] : vals.length === 6 ? vals[5] : 0;
    dot._anim?.cancel();
    dot._y = y;
    dot.style.transform = `translate3d(0, ${y}px, 0)`;
    dot._anim = dot.animate(
      [{ transform: `translate3d(0, ${from}px, 0)` }, { transform: `translate3d(0, ${y}px, 0)` }],
      { duration: 700, easing: "cubic-bezier(.45,0,.25,1)" }
    );
  }

  function setTalkingBot(item) {
    talkingBot?.classList.remove("is-talking");
    const dot = talkingBot?.querySelector(".bot-dot");
    if (dot) glideDot(dot, 0); // slide back to the top when playback ends
    talkingBot = item ? item.closest(".msg")?.querySelector(".avatar--bot") || null : null;
    talkingBot?.classList.add("is-talking");
  }


  function highlightAt(charIndex) {
    highlightWord(spokenMap.find((m) => charIndex < m.end) || null);
  }

  // Fallback for voices that don't report word boundaries: step at speaking pace
  function startWordTimer() {
    clearTimeout(wordTimer);
    let i = 0;
    wordTimer = setTimeout(function next() {
      if (gotBoundary || i >= spokenMap.length) return;
      highlightWord(spokenMap[i++]);
      wordTimer = setTimeout(next, 330 / VOICE.rate);
    }, 600);
  }

  function clearHighlight() {
    clearTimeout(wordTimer);
    highlightWord(null);
    spokenMap = [];
    setTalkingBot(null);
  }

  function stopSpeaking() {
    if (!tts) return;
    tts.cancel();
    if (speakingBtn) setBtnState(speakingBtn, false);
    speakingBtn = null;
    clearHighlight();
  }

  function setBtnState(btn, playing) {
    btn.classList.toggle("is-playing", playing);
    if (!playing) btn.querySelectorAll(".speak__bars i").forEach((bar) => (bar.style.transform = ""));
    btn.setAttribute("aria-label", playing ? "Stop reading" : btn.id === "read-page" ? "Listen to case study" : "Read reply aloud");
    btn.querySelector(".speak__label").textContent = playing ? "Stop" : btn.dataset.idle || "Listen";
  }

  function speak(item, btn) {
    stopSpeaking();
    const { text, map } = buildSpeech(item);
    spokenMap = map;
    setTalkingBot(item);
    gotBoundary = false;
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = VOICE.lang;
    u.rate = VOICE.rate;
    u.pitch = VOICE.pitch;
    u.onstart = startWordTimer;
    u.onboundary = (e) => {
      if (e.name && e.name !== "word") return;
      gotBoundary = true;
      highlightAt(e.charIndex);
    };
    u.onend = u.onerror = () => {
      if (speakingBtn === btn) { setBtnState(btn, false); speakingBtn = null; clearHighlight(); }
    };
    speakingBtn = btn;
    setBtnState(btn, true);
    tts.speak(u);
  }

  // Read several elements in order (one utterance each, so long pages don't
  // get cut off), highlighting words as it goes
  function speakSequence(items, btn) {
    stopSpeaking();
    speakingBtn = btn;
    setBtnState(btn, true);
    let i = 0;
    const next = () => {
      if (speakingBtn !== btn) return;
      if (i >= items.length) { setBtnState(btn, false); speakingBtn = null; clearHighlight(); return; }
      const { text, map } = buildSpeech(items[i++]);
      if (!text) return next();
      spokenMap = map;
      gotBoundary = false;
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = VOICE.lang;
      u.rate = VOICE.rate;
      u.pitch = VOICE.pitch;
      u.onstart = startWordTimer;
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        gotBoundary = true;
        highlightAt(e.charIndex);
      };
      u.onend = next;
      u.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") return;
        next();
      };
      tts.speak(u);
    };
    next();
  }

  // One Listen button under each bubble, project list, timeline, and testimonial card; it reads only that item.
  function attachAudio(el) {
    if (!tts) return;
    const body = el.querySelector(".msg__body");
    for (const bubble of body.querySelectorAll(":scope > .bubble, :scope > .cards, :scope > .timeline, .quote")) {

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "speak";
      btn.innerHTML = `<span class="speak__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M14 10a3 3 0 0 1 0 4M16.5 7.5a6.5 6.5 0 0 1 0 9M19 5a10 10 0 0 1 0 14"/></svg>
          <span class="speak__bars"><i></i><i></i><i></i><i></i></span>
        </span><span class="speak__label">Listen</span>`;
      setBtnState(btn, false);
      btn.addEventListener("click", () => (speakingBtn === btn ? stopSpeaking() : speak(bubble, btn)));
      bubble.after(btn);
    }
  }

  if (tts) tts.getVoices(); // warm up voice list (loads async in Chrome)

  // ── Project cards ─────────────────────────────────────────
  const metaHTML = (p) => [p.company, p.year].filter(Boolean).map(esc).join(" · ");

  function cardHTML(p) {
    return `<button class="card" data-project="${esc(p.id)}">
      <div class="card__body">
        <div class="card__meta">${metaHTML(p)}</div>
        <div class="card__title">${esc(p.title)}</div>
        <div class="tags">${shownTags(p).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
    </button>`;
  }

  function timelineHTML() {
    return `<div class="timeline">
      <div class="timeline__head">Recent Work Experience</div>
      <ol>${EXPERIENCE.map((x, i) => {
        return `<li class="tl${i === 0 ? " tl--current" : ""}" style="--i:${i}">
          <span class="tl__dot" aria-hidden="true"></span>
          <div class="tl__dates">${x.start === x.end ? esc(x.start) : `${esc(x.start)} – ${esc(x.end)}`}</div>
          <div class="tl__role"><strong class="tl__company">${esc(x.company)}</strong> · ${esc(x.role)}</div>
          <p class="tl__summary">${esc(x.summary)}</p>
          ${x.tags && x.tags.length ? `<div class="tags tl__tags">${x.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
        </li>`;
      }).join("")}</ol>
    </div>`;
  }

  function resumeCardHTML() {
    const r = PROFILE.resume;
    return `<div class="file">
      <button type="button" class="file__preview" data-view-resume aria-label="Enlarge resume">
        <img src="${esc(r.preview)}" alt="Page one of ${esc(PROFILE.name)}'s resume" />
        <span class="file__zoom">⤢ View full size</span>
      </button>
      <div class="file__row">
        <span class="file__icon" aria-hidden="true">PDF</span>
        <div class="file__info">
          <div class="file__name">${esc(r.title)}</div>
          <div class="file__meta">${esc(r.meta)}</div>
        </div>
      </div>
      <div class="file__actions">
        <button type="button" class="btn btn--sm btn--accent" data-view-resume>View</button>
        <a class="btn btn--sm" href="${esc(r.file)}" download="${esc(r.downloadName)}">Download</a>
      </div>
    </div>`;
  }

  function quotesHTML() {
    return `<div class="quotes">${TESTIMONIALS.map((t) => `
      <div class="quote-item"><figure class="quote">
        <span class="quote__mark" aria-hidden="true">&rdquo;</span>
        <blockquote>${esc(t.quote)}</blockquote>
        <figcaption>
          ${t.photo ? `<img src="${esc(t.photo)}" alt="" loading="lazy" />` : ""}
          <span><strong>${esc(t.name)}</strong><span>${esc(t.title)}</span></span>
        </figcaption>
      </figure></div>`).join("")}</div>`;
  }

  // After a topic reply: its related projects, or an offer to see all case studies
  function relatedHTML(topic) {
    const list = topic.related ? PROJECTS.filter((p) => p.tags.includes(topic.related)) : [];
    if (list.length) {
      return `<div class="bubble">${list.length > 1 ? "Related case studies:" : "Related case study:"}</div>${cardsHTML(list)}`;
    }
    return `<div class="bubble bubble--follow">Would you like to see her case studies?
      <div class="linkrow"><button type="button" class="btn btn--accent btn--sm" data-ask="Yes, show me!" data-once>Yes</button></div>
    </div>`;
  }

  const cardsHTML = (list) => `<div class="cards">${list.map(cardHTML).join("")}</div>`;

  // ── Search ────────────────────────────────────────────────
  // Tags drive matching. A query word matches a tag when it's the start of
  // any word in the tag ("res" → "user research"), so partial typing works.
  const STOP = new Set(["show", "me", "your", "her", "the", "and", "for", "with", "work", "projects", "project", "any", "some", "about", "in", "on", "of", "a", "an", "to", "do", "you", "have", "what"]);
  const queryWords = (q) => q.toLowerCase().split(/[\s,]+/).filter((w) => w && !STOP.has(w));
  const tagWords = (t) => t.toLowerCase().split(/[\s\-\/]+/);
  const tagMatches = (t, w) => t === w || tagWords(t).some((tw) => tw.startsWith(w));

  function score(p, q) {
    const ql = q.toLowerCase().trim();
    const words = queryWords(ql);
    let s = 0;
    for (const t of p.tags) {
      if (t === ql) s += 10;
      else if (ql.includes(t)) s += 6;
      else s += words.filter((w) => tagMatches(t, w)).length * 3;
    }
    const name = `${p.title} ${p.company}`.toLowerCase();
    s += words.filter((w) => name.includes(w)).length * 4;
    return s;
  }

  // Live filter: every typed word must match a tag, title, or company
  function liveMatch(p, q) {
    const words = queryWords(q);
    if (!words.length) return true;
    const name = `${p.title} ${p.company}`.toLowerCase();
    return words.every((w) => name.includes(w) || p.tags.some((t) => tagMatches(t, w)));
  }

  function search(q) {
    return PROJECTS.map((p) => [p, score(p, q)])
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([p]) => p);
  }

  // ── Intent routing ────────────────────────────────────────
  async function respond(raw) {
    const q = raw.trim().toLowerCase().replace(/[’‘]/g, "'"); // phones type curly apostrophes

    if (/\b(thanks?|thank you|thx|ty|cheers|appreciate it|much appreciated)\b/.test(q)) {
      const linkedin = PROFILE.links.find((l) => /linkedin/i.test(l.label));
      await addBot(`<div class="bubble"><p>No problem, you can reach Anjali at <a href="mailto:${esc(PROFILE.email)}">${esc(PROFILE.email)}</a>.</p>
        <div class="linkrow">
          ${linkedin ? `<a class="btn btn--ghost btn--sm" href="${esc(linkedin.href)}" target="_blank" rel="noopener">LinkedIn ↗</a>` : ""}
          ${PROFILE.resume ? `<button type="button" class="btn btn--ghost btn--sm" data-view-resume>Resume</button>` : ""}
        </div></div>`);
      return setSuggestions(followUps(raw));
    }

    // Testimonials: recs, references, reviews, or anything like "what do people say/think about her"
    const TESTIMONIAL_RE = /\b(testimonials?|reviews?|recs?|recommend(ations?|ed|s)?|references?|referrals?|endorse(ments?|d)?|vouch(es)?|feedback|kudos|praise|quotes about|word of mouth|working with)\b|\b(what|how) (do|does|did|would|will) (her )?(people|others|colleagues|coworkers|co-workers|teammates|managers|clients|engineers|pms|designers|her team|anyone)\b.*\b(say|think|feel|describe)\b|\b(say|said|think|thinks|speak|spoke) (about|of|highly of) (her|anjali)\b|\blike (to )?work(ing)? with( her| anjali)?\b|\bwhat(s|'s| is) (she|anjali) like\b/;
    if (TESTIMONIAL_RE.test(q)) {
      await addBot(`<div class="bubble">Here's what people who've worked with Anjali have to say:</div>${quotesHTML()}`, { delay: 800 });
      return setSuggestions(followUps(raw));
    }

    if (/\b(about|yourself|who are you|bio|background)\b/.test(q)) {
      await addBot(`<div class="bubble bubble--about">${PROFILE.about.map((t) => `<p>${esc(t)}</p>`).join("")}</div>
        ${timelineHTML()}
        <div class="bubble bubble--follow">Want to see what she's been working on?
          <div class="linkrow"><button type="button" class="btn btn--accent btn--sm" data-ask="Yes, show me!" data-once>Yes, show me</button></div>
        </div>`);
      return setSuggestions(followUps(raw));
    }

    if (/\b(resume|résumé|cv)\b/.test(q)) {
      if (PROFILE.resume) {
        await addBot(`<div class="bubble">Here's Anjali's resume — open it up for a closer look or download a copy.</div>${resumeCardHTML()}`);
      } else {
        // No résumé posted: show her work history, then how to get in touch
        const linkedin = PROFILE.links.find((l) => /linkedin/i.test(l.label));
        await addBot(`<div class="bubble">Here's where Anjali has worked:</div>
          ${timelineHTML()}
          <div class="bubble"><p>For her full resume, reach out at <a href="mailto:${esc(PROFILE.email)}">${esc(PROFILE.email)}</a> and she'll send it over.</p>
            ${linkedin ? `<div class="linkrow"><a class="btn btn--ghost btn--sm" href="${esc(linkedin.href)}" target="_blank" rel="noopener">LinkedIn ↗</a></div>` : ""}</div>`);
      }
      return setSuggestions(followUps(raw));
    }

    if (/\b(contact|email|reach|hire|touch|linkedin)\b/.test(q)) {
      await addBot(`<div class="bubble"><p>The best way to reach Anjali is <a href="mailto:${esc(PROFILE.email)}">${esc(PROFILE.email)}</a>.</p>
        <div class="linkrow">${PROFILE.links.map((l) => /resume/i.test(l.label)
          ? `<button type="button" class="btn btn--ghost btn--sm" data-view-resume>Resume</button>`
          : `<a class="btn btn--ghost btn--sm" href="${esc(l.href)}"${/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(l.label)} ↗</a>`).join("")}</div></div>`);
      return setSuggestions(STARTER_SUGGESTIONS);
    }

    // Topics with their own reply (e.g. healthcare, B2B): copy + visual, then
    // related case studies, or an offer to see them
    const topic = SPECIAL_TOPICS.find((t) => t.match.test(q));
    if (topic) {
      await addBot(`<div class="bubble"><p>${esc(topic.body)}</p></div>
        ${[topic.image, ...(topic.images || [])].filter(Boolean)
          .map((img) => `<figure class="reply-img"><img src="${esc(img.src)}" alt="${esc(img.alt || "")}" /></figure>`).join("")}
        ${relatedHTML(topic)}`, { delay: 800 });
      return setSuggestions(followUps(raw));
    }

    if (/^(yes|yeah|yep|sure|ok|okay)\b/.test(q)) {
      await addBot(`<div class="bubble">Here's what she's been working on — ${PROJECTS.length} projects:</div>${cardsHTML(PROJECTS)}`, { delay: 900 });
      return setSuggestions(followUps(raw));
    }

    if (/\b(best|featured|highlight|top|favorite)\b/.test(q)) {
      const list = PROJECTS.filter((p) => p.featured);
      await addBot(`<div class="bubble">Here are a few she's most proud of:</div>${cardsHTML(list)}`, { delay: 900 });
      return setSuggestions(followUps(raw));
    }

    if (/\b(all|everything|every project|projects|work)\b/.test(q) && search(q).length === 0) {
      await addBot(`<div class="bubble">Here's everything — ${PROJECTS.length} projects:</div>${cardsHTML(PROJECTS)}`, { delay: 900 });
      return setSuggestions(followUps(raw));
    }

    if (/^(hi|hello|hey|yo|sup)\b/.test(q)) {
      await addBot(`<div class="bubble">Hey there 👋 What kind of work are you curious about?</div>`);
      return setSuggestions(STARTER_SUGGESTIONS);
    }

    const results = search(q);
    if (results.length) {
      const n = results.length;
      await addBot(`<div class="bubble">I found ${n} project${n > 1 ? "s" : ""} related to <strong>“${esc(raw.trim())}”</strong>:</div>${cardsHTML(results)}`, { delay: 900 });
      return setSuggestions(followUps(raw));
    }

    // No matching project: show her career overview instead of a dead end
    await addBot(`<div class="bubble">There isn't a project that fits <strong>“${esc(raw.trim())}”</strong> yet, but here's an overview of Anjali's product design career:</div>
      ${timelineHTML()}`);
    setSuggestions(followUps(raw));
  }

  // After a reply, keep the main suggestion chips — minus the one just asked
  function followUps(current = "") {
    const asked = current.trim().toLowerCase();
    return STARTER_SUGGESTIONS.filter((s) => s.ask.toLowerCase() !== asked);
  }

  // ── Suggestion chips ──────────────────────────────────────
  let currentSuggestions = STARTER_SUGGESTIONS;

  const chipHTML = (s) => `<button type="button" class="chip" role="listitem" data-ask="${esc(s.ask)}">${esc(s.label)}</button>`;
  const CHIP_EASE = { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" };
  const chipGone = { width: "0px", opacity: 0, paddingLeft: "0px", paddingRight: "0px", borderLeftWidth: "0px", borderRightWidth: "0px", marginRight: "-8px" };

  // Instant swap (used while typing, where chips become tag matches)
  function renderChips(list) {
    suggestions.innerHTML = list.map(chipHTML).join("");
  }

  // Animated swap: chips that stay put stay put, removed chips shrink away so
  // the rest slide over, and returning chips grow back into place
  function morphChips(list) {
    suggestions.querySelectorAll(".chip:not([data-ask]), .chip.is-leaving").forEach((el) => el.remove());
    const existing = new Map([...suggestions.querySelectorAll(".chip[data-ask]")].map((el) => [el.dataset.ask, el]));
    const keep = new Set(list.map((s) => s.ask));
    for (const [ask, el] of existing) {
      if (keep.has(ask)) continue;
      el.classList.add("is-leaving");
      el.style.overflow = "hidden";
      el.style.pointerEvents = "none";
      el.animate([{ width: `${el.offsetWidth}px`, opacity: 1 }, chipGone], CHIP_EASE).onfinish = () => el.remove();
    }
    let prev = null;
    for (const s of list) {
      let el = existing.get(s.ask);
      if (!el) {
        el = document.createRange().createContextualFragment(chipHTML(s)).firstElementChild;
        el.style.animation = "none"; // skip the default rise; it grows in instead
        prev ? prev.after(el) : suggestions.prepend(el);
        el.style.overflow = "hidden";
        const w = el.offsetWidth;
        el.animate([chipGone, { width: `${w}px`, opacity: 1 }], CHIP_EASE).onfinish = () => (el.style.overflow = "");
      } else if (el.textContent !== s.label) {
        el.textContent = s.label;
      }
      prev = el;
    }
  }

  function setSuggestions(list) {
    currentSuggestions = list;
    suggestions.querySelector(".chip[data-ask]") && !input.value ? morphChips(list) : renderChips(list);
  }

  // Live filter: as the visitor types, the latest project grid dims cards
  // that don't match, and the chips become matching tags (with counts).
  const hint = document.querySelector(".composer__hint");
  const defaultHint = hint.textContent;

  function dimCards(q) {
    const grid = [...thread.querySelectorAll(".cards")].at(-1);
    if (!grid) return null;
    let shown = 0;
    const cards = [...grid.querySelectorAll(".card")];
    for (const card of cards) {
      const p = PROJECTS.find((x) => x.id === card.dataset.project);
      const hit = !q || (p && liveMatch(p, q));
      card.classList.toggle("is-dimmed", !hit);
      if (hit) shown++;
    }
    return { shown, total: cards.length };
  }

  function clearFilter() {
    dimCards("");
    hint.textContent = defaultHint;
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      clearFilter();
      return renderChips(currentSuggestions);
    }
    const res = dimCards(q);
    hint.textContent = res
      ? `${res.shown} of ${res.total} projects match “${input.value.trim()}” — press enter to filter`
      : `Press enter to search “${input.value.trim()}”`;

    const words = queryWords(q);
    const last = words.at(-1) || q;
    const tagHits = ALL_TAGS.filter((t) => tagMatches(t, last))
      .sort((a, b) => TAG_COUNT[b] - TAG_COUNT[a])
      .map((t) => ({ label: `# ${t} · ${TAG_COUNT[t]}`, ask: t }));
    const projHits = PROJECTS.filter((p) => p.title.toLowerCase().includes(q) || p.company.toLowerCase().includes(q))
      .map((p) => ({ label: `↗ ${p.title}`, ask: `open:${p.id}` }));
    const topicHits = SPECIAL_TOPICS.filter((t) => t.match.test(q) || t.id.startsWith(last))
      .map((t) => ({ label: t.chip, ask: t.id }));
    if (/^(rec|test|revi|ref|endor|kudo|vouch)/.test(last) || /\b(say|think)\b/.test(q))
      topicHits.unshift({ label: "Testimonials", ask: "What do people say about working with Anjali?" });
    const hits = [...topicHits, ...projHits, ...tagHits].slice(0, 8);
    hits.length ? renderChips(hits) : (suggestions.innerHTML = `<span class="chip chip--empty">No projects tagged “${esc(input.value.trim())}” — press enter for her career overview</span>`);
  });

  // ── Send ──────────────────────────────────────────────────
  let busy = false;
  async function send(text) {
    if (!text.trim() || busy) return;
    if (text.startsWith("open:")) {
      input.value = "";
      clearFilter();
      renderChips(currentSuggestions);
      return openProject(text.slice(5));
    }
    busy = true;
    stopSpeaking();
    clearFilter();
    input.value = "";
    setSuggestions(followUps(text));
    addUser(text);
    await respond(text);
    busy = false;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });

  document.addEventListener("click", (e) => {
    const ask = e.target.closest("[data-ask]");
    if (ask) {
      e.preventDefault();
      if (ask.hasAttribute("data-once")) ask.closest(".linkrow").remove();
      send(ask.dataset.ask);
      return;
    }
    const card = e.target.closest("[data-project]");
    if (card) openProject(card.dataset.project);
    if (e.target.closest("[data-close]")) closeProject();
    if (e.target.closest("[data-view-resume]")) openViewer();
    if (e.target.closest("[data-close-viewer]")) closeViewer();
  });

  // ── Case study drawer ─────────────────────────────────────
  // One section of a project's case study: heading + paragraphs, optional
  // numbered steps and stat tiles, a pull quote, or a row of images
  function caseSectionHTML(s) {
    if (s.images) {
      // Load right away (lazy-loading big GIFs inside the scrolling panel can fail on iPhones);
      // `mobile: false` hides an image on phones
      return `<div class="cs__gallery">${s.images.map((img) => `<img src="${esc(img.src)}" alt="${esc(img.alt || "")}"${img.mobile === false ? ' class="hide-mobile"' : ""} />`).join("")}</div>`;
    }
    if (s.quote) {
      return `<figure class="cs__quote">
        <blockquote>${esc(s.quote)}</blockquote>
        <figcaption><strong>${esc(s.by)}</strong>${s.byTitle ? ` · ${esc(s.byTitle)}` : ""}</figcaption>
      </figure>`;
    }
    return `<section class="cs__section">
      ${s.heading ? `<h2>${esc(s.heading)}</h2>` : ""}
      ${(s.body || []).map((t) => `<p>${esc(t)}</p>`).join("")}
      ${s.steps ? `<ol class="cs__steps">${s.steps.map(([k, v]) => `<li><strong>${esc(k)}</strong><span>${esc(v)}</span></li>`).join("")}</ol>` : ""}
      ${s.stats ? `<div class="cs__stats">${s.stats.map(([v, l]) => `<div><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join("")}</div>` : ""}
    </section>`;
  }

  // Give each gallery image a share of the row equal to its aspect ratio, so
  // images side by side all end up the same height
  function sizeGallery(img) {
    const apply = () => {
      if (img.naturalWidth) img.style.flexGrow = (img.naturalWidth / img.naturalHeight).toFixed(4);
    };
    img.complete ? apply() : img.addEventListener("load", apply, { once: true });
  }

  function openProject(id) {
    const p = PROJECTS.find((x) => x.id === id);
    if (!p) return;
    const cs = p.caseStudy;
    if (speakingBtn === readPageBtn) stopSpeaking();
    document.getElementById("drawer-bar-title").textContent = p.title;
    drawer.classList.remove("has-scrolled");
    drawerBody.innerHTML = `
      <div class="cs__content">
        <div class="card__meta">${metaHTML(p)}</div>
        <h1 id="drawer-title">${esc(p.title)}</h1>
        <p class="cs__lede">${esc(cs?.overview || p.summary)}</p>
        <dl class="cs__facts">
          ${(cs?.facts || [["Role", p.role], ["Timeline", "X months"], ["Team", "PM, Eng ×3, Research"]])
            .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
        </dl>
        <div class="tags">${shownTags(p).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        ${p.image ? `<div class="cs__hero"><img src="${esc(p.image)}" alt="${esc(p.title)}" /></div>` : ""}
        ${cs ? cs.sections.map(caseSectionHTML).join("") : CASE_STUDY_SECTIONS.map((s) => `
          <section class="cs__section">
            <h2>${esc(s.heading)}</h2>
            ${s.body ? `<p>${esc(s.body)}</p>` : ""}
            ${s.image ? `<div class="cs__img"><span>Image placeholder</span></div>` : ""}
            ${s.stats ? `<div class="cs__stats">${(p.stats || s.stats).map(([v, l]) => `<div><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join("")}</div>` : ""}
          </section>`).join("")}
        <div class="cs__next">${nextProjectHTML(p)}</div>
      </div>`;
    drawerBody.querySelectorAll(".cs__gallery img").forEach(sizeGallery);
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    drawer.querySelector(".drawer__panel").scrollTop = 0;
    document.body.style.overflow = "hidden";
  }

  function nextProjectHTML(p) {
    const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];
    return `<span class="card__meta">Next project</span>
      <button class="cs__nextbtn" data-project="${esc(next.id)}">${esc(next.title)} →</button>`;
  }

  // ── Case study header ─────────────────────────────────────
  const readPageBtn = document.getElementById("read-page");
  const drawerPanel = drawer.querySelector(".drawer__panel");
  if (tts) readPageBtn.hidden = false;

  // Everything worth reading on the case study, in page order
  function caseStudyReadables() {
    return [...drawerBody.querySelectorAll(
      "#drawer-title, .cs__lede, .cs__section h2, .cs__section > p, .cs__steps li, .cs__stats > div, .cs__quote blockquote, .cs__quote figcaption"
    )];
  }

  readPageBtn.addEventListener("click", () =>
    speakingBtn === readPageBtn ? stopSpeaking() : speakSequence(caseStudyReadables(), readPageBtn)
  );

  drawerPanel.addEventListener("scroll", () => {
    const title = drawerBody.querySelector("#drawer-title");
    drawer.classList.toggle("has-scrolled", !!title && title.getBoundingClientRect().bottom < drawerPanel.getBoundingClientRect().top + 60);
  }, { passive: true });

  const expandBtn = document.getElementById("drawer-expand");
  function setExpanded(on) {
    drawer.classList.toggle("is-expanded", on);
    expandBtn.setAttribute("aria-pressed", String(on));
    expandBtn.setAttribute("aria-label", on ? "Exit full screen" : "Expand to full screen");
    expandBtn.title = on ? "Collapse" : "Expand";
  }
  expandBtn.addEventListener("click", () => setExpanded(!drawer.classList.contains("is-expanded")));

  // ── Resume viewer ─────────────────────────────────────────
  const viewer = document.getElementById("viewer");
  const viewerFrame = document.getElementById("viewer-frame");

  function openViewer() {
    const r = PROFILE.resume;
    document.getElementById("viewer-title").textContent = r.title;
    const dl = document.getElementById("viewer-download");
    dl.href = r.file;
    dl.setAttribute("download", r.downloadName);
    document.getElementById("viewer-newtab").href = r.file;
    if (!viewerFrame.src) viewerFrame.src = `${r.file}#view=FitH`;
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function closeProject() {
    if (speakingBtn === readPageBtn) stopSpeaking();
    drawer.classList.remove("is-open", "has-scrolled");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") viewer.classList.contains("is-open") ? closeViewer() : closeProject();
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });

  // ── Light / dark toggle ───────────────────────────────────
  // Dark by default; the choice is remembered for next visit
  const themeBtn = document.getElementById("theme-toggle");
  function syncThemeButton() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    themeBtn.setAttribute("aria-label", `Switch to ${next} mode`);
    themeBtn.title = `Switch to ${next} mode`;
  }
  themeBtn.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
    syncThemeButton();
  });
  syncThemeButton();

  // ── Phone viewport ────────────────────────────────────────
  // Keep the pinned page exactly the size and position of the visible screen.
  // Phone browsers change it when the keyboard opens or the address bar hides;
  // without this, iPhones scroll the whole page instead of the chat.
  function fitViewport() {
    const vv = window.visualViewport;
    const root = document.documentElement.style;
    root.setProperty("--app-h", `${Math.round(vv ? vv.height : window.innerHeight)}px`);
    root.setProperty("--app-top", `${Math.round(vv ? vv.offsetTop : 0)}px`);
    if (window.scrollY) window.scrollTo(0, 0);
  }
  fitViewport();
  window.visualViewport?.addEventListener("resize", fitViewport);
  window.visualViewport?.addEventListener("scroll", fitViewport);
  window.addEventListener("resize", fitViewport);
  window.addEventListener("orientationchange", fitViewport);

  // ── Boot ──────────────────────────────────────────────────
  async function start() {
    stopSpeaking();
    thread.innerHTML = "";
    setSuggestions([]);
    const ordered = [...PROJECTS.filter((p) => p.featured), ...PROJECTS.filter((p) => !p.featured)];
    await addBot(`<div class="bubble bubble--intro">
        <h1 class="intro__title">${esc(PROFILE.tagline)}</h1>
        <p class="intro__sub">${esc(PROFILE.taglineSub)}</p>
        <p class="intro__text">${esc(PROFILE.intro)}</p>
      </div>${cardsHTML(ordered)}`, { delay: 500 });
    setSuggestions(STARTER_SUGGESTIONS);
  }

  document.getElementById("restart").addEventListener("click", (e) => {
    e.preventDefault();
    start();
  });

  start();
})();
