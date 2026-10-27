/* ==========================================================================
   KINGDOM CREW FELLOWSHIP — MAIN SCRIPT
   Runs on every page. Each feature only starts if its elements exist.
   Settings come from config.js; Bible book data from scriptures.js.
   ========================================================================== */
(function () {
  'use strict';
  const C = window.KCF_CONFIG;

  // ---------- tiny helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (text !== undefined) node.textContent = text; // textContent = safe, no HTML injection
    return node;
  };
  const api = (path) => (C.apiBase || '') + path;

  // ---------- social icons (simple inline SVG paths) ----------
  const ICONS = {
    facebook: 'M13.5 22v-8h2.7l.5-3.2h-3.2V8.8c0-.9.3-1.6 1.7-1.6h1.6V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.5H7.6V14h2.8v8h3.1z',
    instagram: 'M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM17.2 6a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3c-2.4 0-2.7 0-3.7.1-2.2.1-3.6 1.5-3.7 3.7C4.5 7.8 4.5 8.1 4.5 12s0 4.2.1 5.2c.1 2.2 1.5 3.6 3.7 3.7 1 .1 1.300.1 3.700.1s2.700 0 3.700-.1c2.200-.1 3.600-1.500 3.700-3.700.1-1 .1-1.300.1-5.200s0-4.200-.1-5.200c-.1-2.200-1.500-3.600-3.700-3.700C14.700 3 14.400 3 12 3z',
    tiktok: 'M16.6 3h-3v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.800a5.700 5.700 0 1 0 4.800 5.600V9a7 7 0 0 0 4 1.300V7.300A4.300 4.300 0 0 1 16.600 3z',
    youtube: 'M21.600 7.200a2.500 2.500 0 0 0-1.800-1.800C18.200 5 12 5 12 5s-6.200 0-7.800.4A2.500 2.500 0 0 0 2.400 7.200C2 8.800 2 12 2 12s0 3.200.4 4.800a2.500 2.500 0 0 0 1.800 1.800C5.800 19 12 19 12 19s6.200 0 7.800-.4a2.500 2.500 0 0 0 1.800-1.800c.4-1.600.4-4.800.4-4.800s0-3.200-.4-4.800zM10 15V9l5.200 3L10 15z',
    whatsapp: 'M12 2a10 10 0 0 0-8.600 15L2 22l5.100-1.300A10 10 0 1 0 12 2zm5.300 14.100c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.200-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800s.7-2 1-2.300c.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 2c.1.200.1.400 0 .5l-.3.500-.4.400c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.100 1 2 1.300 2.300 1.400.3.100.4.100.6-.1l.8-1c.2-.2.400-.2.600-.1l1.900.9c.2.100.4.200.4.300.1.200.1.800-.1 1.400z',
    email: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7L4 7.500V17h16V7.500L12 12zm0-2l7.500-3.500h-15L12 10z',
  };
  function socialItem(key, label, url, hint) {
    const li = el('li');
    const live = Boolean(url);
    const a = el(live ? 'a' : 'span', { class: 'social-link' + (live ? '' : ' disabled') });
    if (live) {
      a.setAttribute('href', url);
      if (!url.startsWith('mailto:')) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    } else {
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('title', 'Link coming soon' + (hint ? ' — ' + hint : ''));
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', ICONS[key]);
    svg.appendChild(p);
    a.appendChild(svg);
    a.appendChild(document.createTextNode(live ? label : label + ' (soon)'));
    li.appendChild(a);
    return li;
  }
  function renderSocial(container) {
    const ul = el('ul', { class: 'social-list' });
    Object.entries(C.social).forEach(([key, s]) => ul.appendChild(socialItem(key, s.label, s.url, s.hint)));
    ul.appendChild(socialItem('email', 'Email', 'mailto:' + C.email));
    container.appendChild(ul);
  }

  // ---------- shared header + footer ----------
  const PAGES = [
    ['index.html', 'Home'], ['about.html', 'About'], ['activities.html', 'Activities'],
    ['events.html', 'Events'], ['bible.html', 'Bible'], ['gallery.html', 'Gallery'], ['contact.html', 'Contact'],
  ];
  function buildHeader() {
    const host = $('#site-header');
    if (!host) return;
    const current = document.body.dataset.page;
    const header = el('header', { class: 'site-header' });
    const wrap = el('div', { class: 'container nav-wrap' });

    const brand = el('a', { class: 'brand', href: 'index.html', 'aria-label': C.name + ' home' });
    const mark = el('span', { class: 'brand-mark', 'aria-hidden': 'true' });
    mark.appendChild(el('img', { src: 'images/logo-emblem-light.png', alt: '' }));
    brand.appendChild(mark);
    const label = el('span', {}, 'Kingdom Crew');
    label.appendChild(el('small', {}, 'Fellowship · UNILAK'));
    brand.appendChild(label);

    const toggle = el('button', { class: 'nav-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'nav-links', 'aria-label': 'Open menu' }, '☰');
    const ul = el('ul', { class: 'nav-links', id: 'nav-links' });
    PAGES.forEach(([href, name]) => {
      const li = el('li');
      const a = el('a', { href }, name);
      if (href.replace('.html', '') === current) a.setAttribute('aria-current', 'page');
      li.appendChild(a);
      ul.appendChild(li);
    });
    toggle.addEventListener('click', () => {
      const open = ul.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    });
    wrap.append(brand, toggle, ul);
    header.appendChild(wrap);
    host.replaceWith(header);
  }

  function buildFooter() {
    const host = $('#site-footer');
    if (!host) return;
    const f = el('footer', { class: 'site-footer' });
    const wrap = el('div', { class: 'container' });
    const grid = el('div', { class: 'footer-grid' });

    const c1 = el('div');
    c1.appendChild(el('img', { class: 'footer-logo', src: 'images/logo-full-light.png', alt: 'Kingdom Crew Fellowship logo: a cross above an open Bible' }));
    c1.appendChild(el('h3', {}, C.name));
    c1.appendChild(el('p', {}, C.motto));
    c1.appendChild(el('p', {}, C.campus));

    const c2 = el('div');
    c2.appendChild(el('h3', {}, 'Meet with us'));
    c2.appendChild(el('p', {}, C.meeting.day + ', ' + C.meeting.time));
    c2.appendChild(el('p', {}, C.venue));

    const c3 = el('div');
    c3.appendChild(el('h3', {}, 'Contact'));
    const p = el('p');
    const mail = el('a', { href: 'mailto:' + C.email }, C.email);
    p.appendChild(mail);
    C.phones.forEach((ph) => { p.appendChild(el('br')); p.appendChild(el('a', { href: 'tel:' + ph }, ph)); });
    c3.appendChild(p);

    const c4 = el('div', { id: 'footer-social' });
    c4.appendChild(el('h3', {}, 'Connect With Us'));
    renderSocial(c4);

    grid.append(c1, c2, c3, c4);
    wrap.appendChild(grid);
    wrap.appendChild(el('p', { class: 'footer-note' }, '© ' + new Date().getFullYear() + ' ' + C.name + ', UNILAK Rwamagana. Built with prayer and care.'));
    f.appendChild(wrap);
    host.replaceWith(f);
  }

  // ---------- fill [data-kcf] text from config ----------
  function fillText() {
    $$('[data-kcf]').forEach((node) => {
      const k = node.dataset.kcf;
      if (k === 'email') { node.textContent = C.email; if (node.tagName === 'A') node.href = 'mailto:' + C.email; }
      if (k === 'venue') node.textContent = C.venue;
      if (k === 'meeting') node.textContent = C.meeting.day + ', ' + C.meeting.time;
      if (k === 'motto') node.textContent = C.motto;
      if (k === 'phones') {
        node.textContent = '';
        C.phones.forEach((ph, i) => {
          if (i) node.appendChild(document.createTextNode(' / '));
          node.appendChild(el('a', { href: 'tel:' + ph }, ph));
        });
      }
    });
    $$('[data-social]').forEach((node) => renderSocial(node));
    // WhatsApp button(s): active only when a real link is supplied
    $$('[data-whatsapp]').forEach((a) => {
      const url = C.social.whatsapp.url;
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      else { a.removeAttribute('href'); a.setAttribute('aria-disabled', 'true'); a.textContent = 'WhatsApp Community link coming soon'; a.classList.add('disabled'); }
    });
  }

  // ---------- events ----------
  function eventCard(ev) {
    const card = el('article', { class: 'card' });
    card.appendChild(el('span', { class: 'tag' + (ev.sample ? ' sample' : '') }, ev.sample ? 'Example · ' + ev.category : ev.category));
    card.appendChild(el('h3', {}, ev.title));
    card.appendChild(el('p', {}, ev.description));
    const ul = el('ul', { class: 'meta' });
    ['📅 ' + ev.date, '🕒 ' + ev.time, '📍 ' + ev.venue].forEach((t) => ul.appendChild(el('li', {}, t)));
    card.appendChild(ul);
    return card;
  }
  async function loadEvents() {
    const hosts = $$('[data-events]');
    if (!hosts.length) return;
    let list = C.events;
    // Try the database first; quietly fall back to config.js if unavailable.
    try {
      const r = await fetch(api('/api/events'));
      if (r.ok) {
        const { events } = await r.json();
        if (events && events.length) {
          const fmt = (d) => new Date(d);
          list = events.map((e) => ({
            title: e.title, description: e.description || '', category: e.category || 'Fellowship',
            venue: e.venue || 'To be confirmed', sample: false,
            date: fmt(e.starts_at).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: fmt(e.starts_at).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
          }));
        }
      }
    } catch (_) { /* offline or no backend: use config.js */ }
    hosts.forEach((host) => {
      const limit = Number(host.dataset.events) || list.length;
      host.textContent = '';
      list.slice(0, limit).forEach((ev) => host.appendChild(eventCard(ev)));
    });
  }

  // ---------- gallery + lightbox ----------
  function buildGallery() {
    const host = $('#gallery');
    if (!host) return;
    const box = el('div', { class: 'lightbox', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer' });
    const big = el('img', { alt: '' });
    const close = el('button', { type: 'button', 'aria-label': 'Close image' }, '✕');
    box.append(big, close);
    document.body.appendChild(box);
    const hide = () => box.classList.remove('open');
    close.addEventListener('click', hide);
    box.addEventListener('click', (e) => { if (e.target === box) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

    C.gallery.forEach((g) => {
      const fig = el('figure', { class: 'gallery-item' });
      if (g.src) {
        const btn = el('button', { type: 'button', 'aria-label': 'Enlarge: ' + g.alt });
        btn.appendChild(el('img', { src: g.src, alt: g.alt, loading: 'lazy' }));
        btn.addEventListener('click', () => { big.src = g.src; big.alt = g.alt; box.classList.add('open'); close.focus(); });
        fig.appendChild(btn);
      } else {
        const ph = el('div', { class: 'gallery-ph', role: 'img', 'aria-label': g.alt }, '🖼');
        fig.appendChild(ph);
      }
      fig.appendChild(el('figcaption', {}, g.caption));
      host.appendChild(fig);
    });
  }

  // ---------- contact form ----------
  function setupContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('#form-status');
    const show = (ok, msg) => { status.className = 'form-status show ' + (ok ? 'ok' : 'bad'); status.textContent = msg; };
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    function check() {
      let valid = true;
      const rules = [
        ['name', (v) => v.trim().length >= 2, 'Please enter your name.'],
        ['email', (v) => emailOk(v.trim()), 'Please enter a valid email address.'],
        ['subject', (v) => v.trim().length >= 3, 'Please add a short subject.'],
        ['message', (v) => v.trim().length >= 10, 'Please write at least 10 characters.'],
      ];
      rules.forEach(([id, test, msg]) => {
        const input = form.elements[id];
        const err = $('#err-' + id);
        const ok = test(input.value);
        input.setAttribute('aria-invalid', String(!ok));
        err.textContent = ok ? '' : msg;
        if (!ok) valid = false;
      });
      const consent = form.elements.consent;
      const cErr = $('#err-consent');
      cErr.textContent = consent.checked ? '' : 'Please tick the box so we may reply to you.';
      if (!consent.checked) valid = false;
      return valid;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form-status';
      if (!check()) { show(false, 'Please fix the highlighted fields.'); return; }
      const btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      const body = Object.fromEntries(new FormData(form).entries());
      body.consent = form.elements.consent.checked;
      try {
        const r = await fetch(api('/api/inquiries'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await r.json().catch(() => ({}));
        if (r.ok) { show(true, 'Thank you! Your message was received. We will reply by email.'); form.reset(); }
        else show(false, (data.error || 'Could not send.') + ' You can also email ' + C.email + '.');
      } catch (_) {
        show(false, 'We could not reach the server. Please email us directly at ' + C.email + '.');
      } finally { btn.disabled = false; btn.textContent = 'Send message'; }
    });
  }

  // ---------- Bible page ----------
  function setupBible() {
    const root = $('#bible-app');
    if (!root) return;
    const books = window.KCF_BOOKS;
    const bookSel = $('#book'), chapSel = $('#chapter'), transSel = $('#translation');
    const summary = $('#book-summary'), reader = $('#reader'), index = $('#book-index'), search = $('#passage-search'), quick = $('#quick');

    books.forEach((b, i) => bookSel.appendChild(el('option', { value: i }, b.n)));

    function showSummary() {
      const b = books[bookSel.value];
      summary.textContent = '';
      summary.appendChild(el('strong', {}, b.n + ' · ' + (b.t === 'OT' ? 'Old Testament' : 'New Testament') + ' · ' + b.c + (b.c === 1 ? ' chapter' : ' chapters')));
      summary.appendChild(el('span', {}, b.s));
      $$('.book-btn', index).forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.i === bookSel.value)));
    }
    function fillChapters() {
      const b = books[bookSel.value];
      chapSel.textContent = '';
      for (let i = 1; i <= b.c; i++) chapSel.appendChild(el('option', { value: i }, 'Chapter ' + i));
      showSummary();
    }
    function pickBook(i) { bookSel.value = String(i); fillChapters(); }

    // book index buttons (grouped by testament)
    ['OT', 'NT'].forEach((t) => {
      index.appendChild(el('h3', { style: 'grid-column:1/-1;margin:.8rem 0 0;font-size:1rem' }, t === 'OT' ? 'Old Testament' : 'New Testament'));
      books.forEach((b, i) => {
        if (b.t !== t) return;
        const btn = el('button', { type: 'button', class: 'book-btn', 'data-i': i, 'aria-pressed': 'false' }, b.n);
        btn.addEventListener('click', () => { pickBook(i); load(b.n + ' ' + chapSel.value); window.scrollTo({ top: root.offsetTop - 80, behavior: 'smooth' }); });
        index.appendChild(btn);
      });
    });

    // quick passages
    window.KCF_QUICK_PASSAGES.forEach((q) => {
      const chip = el('button', { type: 'button', class: 'chip' }, q.label);
      chip.addEventListener('click', () => load(q.ref));
      quick.appendChild(chip);
    });

    let lastRef = '';
    async function load(ref) {
      lastRef = ref;
      reader.textContent = '';
      reader.appendChild(el('p', { class: 'placeholder' }, 'Loading ' + ref + '…'));
      try {
        const url = 'https://bible-api.com/' + encodeURIComponent(ref) + '?translation=' + encodeURIComponent(transSel.value);
        const r = await fetch(url);
        if (!r.ok) throw new Error('not found');
        const d = await r.json();
        if (!d.verses || !d.verses.length) throw new Error('empty');
        reader.textContent = '';
        reader.appendChild(el('h2', {}, d.reference));
        d.verses.forEach((v) => {
          const p = el('p', { class: 'verse' });
          p.appendChild(el('sup', {}, String(v.verse)));
          p.appendChild(document.createTextNode(v.text.trim()));
          reader.appendChild(p);
        });
        reader.appendChild(el('p', { class: 'credit' }, 'Translation: ' + (d.translation_name || transSel.value.toUpperCase()) + '. Text provided by the free bible-api.com service.'));
        const ask = el('button', { type: 'button', class: 'btn btn-dark ask-ai' }, '✨ Ask the assistant about this passage');
        ask.addEventListener('click', () => window.KCF_openChat('Please explain ' + d.reference + ' in simple terms: context, meaning and one practical takeaway.'));
        reader.appendChild(ask);
      } catch (_) {
        reader.textContent = '';
        reader.appendChild(el('p', { class: 'placeholder' }, 'Could not load "' + ref + '". Check the spelling (for example "John 3:16" or "Psalm 23"), or your internet connection, and try again.'));
      }
    }

    $('#read-btn').addEventListener('click', () => load(books[bookSel.value].n + ' ' + chapSel.value));
    bookSel.addEventListener('change', fillChapters);
    transSel.addEventListener('change', () => { if (lastRef) load(lastRef); });
    $('#search-form').addEventListener('submit', (e) => { e.preventDefault(); if (search.value.trim()) load(search.value.trim()); });

    fillChapters();
    reader.appendChild(el('p', { class: 'placeholder' }, 'Choose a book and chapter, search a passage, or tap a quick passage to begin reading.'));
  }

  // ---------- AI chat widget ----------
  function setupChat() {
    const fab = el('button', { class: 'chat-fab', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'chat-panel' }, '✨ Ask Assistant');
    const panel = el('section', { class: 'chat-panel', id: 'chat-panel', 'aria-label': 'Kingdom Crew AI assistant' });
    const head = el('div', { class: 'chat-head' });
    head.appendChild(el('strong', {}, 'Kingdom Crew Assistant'));
    const closeBtn = el('button', { type: 'button', 'aria-label': 'Close assistant' }, '✕');
    head.appendChild(closeBtn);
    const log = el('div', { class: 'chat-log', 'aria-live': 'polite' });
    const form = el('form', { class: 'chat-form' });
    const input = el('input', { type: 'text', placeholder: 'Ask about the Bible or the fellowship…', 'aria-label': 'Your question', maxlength: '500' });
    const send = el('button', { type: 'submit' }, 'Send');
    form.append(input, send);
    const note = el('p', { class: 'chat-disclaimer' }, 'AI can make mistakes and is not a pastor or counselor. For personal support, talk to a fellowship leader.');
    panel.append(head, log, form, note);
    document.body.append(fab, panel);

    const history = [];
    const add = (cls, text) => { const m = el('div', { class: 'msg ' + cls }, text); log.appendChild(m); log.scrollTop = log.scrollHeight; return m; };
    add('bot', 'Hello! I can help you understand Bible passages or answer questions about Kingdom Crew Fellowship. What would you like to know?');

    const toggle = (open) => {
      panel.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', String(open));
      if (open) input.focus();
    };
    fab.addEventListener('click', () => toggle(!panel.classList.contains('open')));
    closeBtn.addEventListener('click', () => toggle(false));

    async function ask(text) {
      add('me', text);
      history.push({ role: 'user', content: text });
      const wait = add('bot', 'Thinking…');
      send.disabled = true;
      try {
        const r = await fetch(api('/api/chat'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-10) }) });
        const d = await r.json().catch(() => ({}));
        wait.remove();
        if (r.ok && d.reply) { add('bot', d.reply); history.push({ role: 'assistant', content: d.reply }); }
        else { history.pop(); add('err', d.error || 'Sorry, something went wrong.'); }
      } catch (_) {
        wait.remove(); history.pop();
        add('err', 'The assistant needs the website server to be running. Please try again later or email ' + C.email + '.');
      } finally { send.disabled = false; }
    }
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = input.value.trim();
      if (!t) return;
      input.value = '';
      ask(t);
    });
    // lets other pages (the Bible reader) open the chat with a prepared question
    window.KCF_openChat = (q) => { toggle(true); if (q) ask(q); };
  }

  // ---------- start ----------
  document.addEventListener('DOMContentLoaded', () => {
    buildHeader();
    buildFooter();
    fillText();
    loadEvents();
    buildGallery();
    setupContactForm();
    setupBible();
    setupChat();
  });
})();
