/* Funzioni comuni: header/footer, formattazione, componenti, archivio locale, feedback. */
(function () {
  "use strict";

  /* ---------- Archivio locale (funziona anche aprendo i file con file://) ---------- */
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    sget(k, def) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    sset(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    sdel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  // Separatore delle migliaia anche per i numeri a 4 cifre (es. 6.480 €)
  const euro = (n) => {
    const [i, d] = Math.abs(n).toFixed(n % 1 ? 2 : 0).split(".");
    return (n < 0 ? "−" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + d : "") + " €";
  };
  const data = (s) => new Date(s + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const campagna = (id) => (window.CAMPAGNE || []).find((c) => c.id === id);

  /* ---------- Icone (SVG inline) ---------- */
  const ico = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9V16h7v-2.1A6 6 0 0012 3z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" width="20" height="20"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true" width="20" height="20"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'
  };

  /* ---------- Account simulati (tutto in localStorage, nessun server) ---------- */
  const DEMO_UTENTI = [
    { email: "giuseppe.demo@esempio.it", pwd: "Prova2026!", nome: "Giuseppe", cognome: "Rinaldi", ruolo: "sostenitore", dal: "2025-04-20" },
    { email: "marco.giordano@unito.it", pwd: "Prova2026!", nome: "Marco", cognome: "Giordano", ruolo: "unito", dal: "2026-09-02" }
  ];
  function seed() {
    if (store.get("ucf_utenti", null)) return;
    store.set("ucf_utenti", DEMO_UTENTI);
    const g = "giuseppe.demo@esempio.it", m = "marco.giordano@unito.it";
    store.set(`ucf_donazioni:${g}`, [
      { id: "patchlab", importo: 50, data: "2026-06-14", ricevuta: "UNITO-2026-482913", metodo: "carta", fiscale: true, aggiorna: true, email: g },
      { id: "api", importo: 30, data: "2025-05-02", ricevuta: "UNITO-2025-118204", metodo: "paypal", fiscale: true, aggiorna: true, email: g }]);
    store.set(`ucf_seguiti:${g}`, ["patchlab", "api", "rare"]);
    store.set(`ucf_ultima_visita:${g}`, "2026-10-01");
    store.set(`ucf_donazioni:${m}`, [{ id: "aria", importo: 20, data: "2026-10-12", ricevuta: "UNITO-2026-300117", metodo: "satispay", fiscale: false, aggiorna: true, email: m }]);
    store.set(`ucf_seguiti:${m}`, ["aria"]);
    store.set(`ucf_candidature:${m}`, [
      { protocollo: "CF-2026-4821", titolo: "Fiumi senza plastica", tema: "ambiente", obiettivo: 6000, data: "2026-10-28", stato: "valutazione",
        nota: "La commissione si riunisce il 18 novembre. Riceverai l'esito via email." },
      { protocollo: "CF-2026-1107", titolo: "Citizen science sul Sangone", tema: "ambiente", obiettivo: 3500, data: "2026-03-10", stato: "respinta",
        nota: "Budget non dettagliato. Puoi ripresentarla: lo sportello ti aiuta a rivederla." }]);
  }
  const utente = () => {
    const s = store.get("ucf_sessione", null) || store.sget("ucf_sessione", null);
    return s ? store.get("ucf_utenti", []).find((u) => u.email === s.email) || null : null;
  };
  // Chiave dei dati personali: per utente se c'è una sessione, altrimenti legata a questo browser
  const key = (n) => { const u = utente(); return u ? `ucf_${n}:${u.email}` : `ucf_${n}`; };

  // ricorda = true: la sessione resta anche chiudendo il browser (localStorage); altrimenti solo per questa scheda
  function login(email, pwd, ricorda = true) {
    const u = store.get("ucf_utenti", []).find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.pwd !== pwd) return null;
    // Collega all'account i contributi e i progetti seguiti da questo browser prima dell'accesso
    const gDon = store.get("ucf_donazioni", []), gSeg = store.get("ucf_seguiti", []);
    const uk = (n) => `ucf_${n}:${u.email}`;
    if (gDon.length) store.set(uk("donazioni"), [...store.get(uk("donazioni"), []), ...gDon]);
    if (gSeg.length) store.set(uk("seguiti"), [...new Set([...store.get(uk("seguiti"), []), ...gSeg])]);
    ["ucf_donazioni", "ucf_seguiti"].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    (ricorda ? store.set : store.sset)("ucf_sessione", { email: u.email, dal: new Date().toISOString() });
    return { utente: u, collegati: gDon.length + gSeg.length };
  }
  function registra(dati) {
    const list = store.get("ucf_utenti", []);
    if (list.some((x) => x.email.toLowerCase() === dati.email.toLowerCase())) return false;
    store.set("ucf_utenti", [...list, Object.assign({ dal: new Date().toISOString().slice(0, 10) }, dati)]);
    return true;
  }
  function logout() { try { localStorage.removeItem("ucf_sessione"); } catch (e) {} store.sdel("ucf_sessione"); }

  /* ---------- Header e footer: stesse voci, stesso ordine (A1 H4) ---------- */
  const NAV = [
    ["campagne.html", "Campagne", "campagne"],
    ["come-funziona.html", "Come funziona", "come-funziona"],
    ["proponi.html", "Proponi un progetto", "proponi"],
    ["risultati.html", "Risultati", "risultati"],
    ["chi-siamo.html", "Chi siamo", "chi-siamo"]
  ];

  /* Riepilogo dei dati personali, usato dal menu del profilo */
  function riepilogoMiei() {
    const don = store.get(key("donazioni"), []), seg = store.get(key("seguiti"), []);
    const sost = [...new Set(don.map((d) => d.id))];
    const segu = seg.filter((id) => !sost.includes(id));
    const prop = utente() ? store.get(key("candidature"), []).length : 0;
    const vis = store.get(key("ultima_visita"), null);
    const novita = [...sost, ...segu].reduce((n, id) => {
      const c = campagna(id); return n + (c ? c.aggiornamenti.filter((a) => !vis || a.data > vis).length : 0);
    }, 0);
    return { sost: sost.length, segu: segu.length, prop, novita };
  }

  function header(page) {
    const nav = NAV.map(([href, label, key]) =>
      `<li><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
    const u = utente(), r = riepilogoMiei();
    const qui = encodeURIComponent(location.pathname.split("/").pop() + location.search);
    const n = (x) => x ? `<span class="pm-n">${x}</span>` : "";
    const voci = `
        <li><a href="i-miei-progetti.html#sostenute"><span class="pm-t">Campagne sostenute</span>${n(r.sost)}</a></li>
        <li><a href="i-miei-progetti.html#seguite"><span class="pm-t">Campagne seguite</span>${n(r.segu)}</a></li>
        <li><a href="i-miei-progetti.html#proposte"><span class="pm-t">Le mie proposte</span>${n(r.prop)}</a></li>`;
    const menu = u
      ? `<div class="pm-head"><span class="avatar" aria-hidden="true">${esc(u.nome[0] + u.cognome[0])}</span><span><strong>${esc(u.nome)} ${esc(u.cognome)}</strong><br><span class="small muted">${esc(u.email)}</span></span></div>
        ${r.novita ? `<p class="pm-news"><span class="badge badge-new">${r.novita}</span> ${r.novita === 1 ? "novità" : "novità"} nei tuoi progetti</p>` : ""}
        <ul>${voci}</ul>
        <ul class="pm-sep"><li><a href="i-miei-progetti.html#account"><span class="pm-t">Profilo e preferenze</span></a></li>
        <li><button type="button" id="logout">Esci</button></li></ul>`
      : `<div class="pm-head pm-guest"><strong>Non hai effettuato l'accesso</strong><span class="small muted">Accedi per ritrovare i tuoi progetti su ogni dispositivo.</span>
          <a class="btn btn-sm btn-block" href="accedi.html?next=${qui}">Accedi</a>
          <a class="btn btn-ghost btn-sm btn-block" href="accedi.html?next=${qui}#registrati">Crea un account</a></div>
        <p class="pm-label">Salvati in questo browser</p>
        <ul>${voci}</ul>`;
    return `
<a class="skip" href="#main">Vai al contenuto</a>
<div class="demo-strip" role="note"><strong>Prototipo didattico</strong> · Corso di Human-Computer Interaction, Università di Torino 2026/27, Gruppo F. Non è un sito ufficiale: campagne, persone e dati sono di fantasia e nessun pagamento è reale.</div>
<div class="topbar"><div class="wrap">
  <span>Iniziativa ufficiale dell'<strong>Università degli Studi di Torino</strong> · Programma di crowdfunding per la ricerca</span>
  <span><a href="come-funziona.html#faq">Aiuto e FAQ</a> · <a href="chi-siamo.html#contatti">Contatti</a></span>
</div></div>
<header class="site-header"><div class="wrap">
  <a class="brand" href="index.html">
    <span class="brand-mark" aria-hidden="true">U</span>
    <span class="brand-text"><strong>UniTO Crowdfunding</strong><span>Sostieni la ricerca</span></span>
  </a>
  <nav class="main-nav" aria-label="Menu principale"><ul>${nav}</ul></nav>
  <div class="header-actions">
    <div class="profile">
      <button type="button" class="profile-btn" id="profile-btn" aria-expanded="false" aria-controls="profile-menu"${page === "miei" ? ' aria-current="page"' : ""}>
        ${u ? `<span class="me" aria-hidden="true">${esc(u.nome[0])}</span> ${esc(u.nome)}` : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg> Accedi`}
        ${r.novita ? `<span class="count" title="Novità nei tuoi progetti">${r.novita}<span class="sr-only"> novità</span></span>` : ""}
        <span class="caret" aria-hidden="true">▾</span>
        <span class="sr-only">: menu del profilo e dei tuoi progetti</span>
      </button>
      <div class="profile-menu" id="profile-menu" hidden>${menu}</div>
    </div>
    <a class="btn btn-sm" href="campagne.html?stato=in-corso">Sostieni un progetto</a>
  </div>
</div></header>`;
  }

  /* Menu del profilo: si apre con clic, Invio o Spazio; si chiude con Esc, clic fuori o uscendo con Tab */
  function initProfileMenu() {
    const btn = document.getElementById("profile-btn"), menu = document.getElementById("profile-menu");
    if (!btn) return;
    const set = (open, focusBtn) => {
      btn.setAttribute("aria-expanded", open); menu.hidden = !open;
      if (open) { const first = menu.querySelector("a, button"); if (first) first.focus(); }
      else if (focusBtn) btn.focus();
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    btn.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { e.preventDefault(); set(true); } });
    menu.addEventListener("keydown", (e) => {
      const items = [...menu.querySelectorAll("a, button")], i = items.indexOf(document.activeElement);
      if (e.key === "Escape") { e.preventDefault(); set(false, true); }
      if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".profile")) set(false); });
    menu.addEventListener("focusout", (e) => { if (e.relatedTarget && !e.relatedTarget.closest(".profile")) set(false); });
    // Le voci che portano a un'altra scheda della stessa pagina chiudono il menu
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
  }

  function footer() {
    const nav = NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("");
    return `
<footer class="site-footer"><div class="wrap">
  <div class="footer-grid">
    <div>
      <a class="brand" href="index.html" style="color:#fff"><span class="brand-mark" aria-hidden="true">U</span><span class="brand-text"><strong>UniTO Crowdfunding</strong></span></a>
      <p style="margin-top:16px">Il programma con cui l'Università di Torino raccoglie fondi per progetti di ricerca, didattica e terza missione. I fondi sono gestiti direttamente dall'Ateneo.</p>
    </div>
    <div><h2>Esplora</h2><ul>${nav}<li><a href="i-miei-progetti.html">I miei progetti</a></li></ul></div>
    <div><h2>Aiuto</h2><ul>
      <li><a href="come-funziona.html#faq">Domande frequenti</a></li>
      <li><a href="come-funziona.html#rimborso">Se l'obiettivo non viene raggiunto</a></li>
      <li><a href="come-funziona.html#ricevute">Ricevute e dichiarazione dei redditi</a></li>
      <li><a href="chi-siamo.html#contatti">Contatti</a></li></ul></div>
    <div><h2>Contatti</h2><p>Ufficio Fundraising<br>Via Verdi 8, Torino<br><a href="mailto:crowdfunding@unito.it">crowdfunding@unito.it</a><br>011 000 0000 (lun–ven, 9–13)</p></div>
  </div>
  <div class="footer-bottom"><span>Prototipo didattico – HCI 2026/27, Gruppo F. Campagne, persone e dati sono di fantasia; nessun pagamento è reale.</span><span><a href="chi-siamo.html#privacy">Privacy</a></span></div>
</div></footer>
<div class="toast" role="status" aria-live="polite" id="toast"></div>`;
  }

  /* ---------- Componenti ---------- */
  function statoBadge(c) {
    if (c.stato === "non-raggiunta") return '<span class="badge badge-fail">Obiettivo non raggiunto · fondi restituiti</span>';
    if (c.raccolti >= c.obiettivo) return '<span class="badge badge-ok">✓ Obiettivo raggiunto</span>';
    return '<span class="badge badge-run">In corso</span>';
  }

  /* Avanzamento: numeri + parole + colore, identico in tutte le pagine (A1-03, A1-06) */
  function progress(c, big) {
    const pct = Math.round((c.raccolti / c.obiettivo) * 100);
    const done = c.raccolti >= c.obiettivo, fail = c.stato === "non-raggiunta";
    const tempo = c.stato === "in-corso" ? `${c.giorni} giorni rimasti` : "Raccolta conclusa";
    return `<div class="progress${big ? " progress-big" : ""}${done ? " done" : ""}${fail ? " fail" : ""}">
      <div class="progress-top">${statoBadge(c)}<span>${tempo}</span></div>
      <div class="progress-nums"><span><strong>${euro(c.raccolti)}</strong> <span class="muted">raccolti su ${euro(c.obiettivo)}</span></span></div>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(pct, 100)}" aria-label="Raccolta al ${pct}%"><span data-w="${Math.min(pct, 100)}"></span></div>
      <div class="progress-meta"><span><strong>${pct}%</strong> dell'obiettivo</span><span>${c.sostenitori.toLocaleString("it-IT")} sostenitori</span></div>
    </div>`;
  }

  function card(c) {
    const t = TEMI[c.tema];
    return `<article class="card" style="--tc:${t.colore}">
      <div class="card-art"><span class="tag" style="--tc:${t.colore}">${t.nome}</span></div>
      <div class="card-body">
        <h3><a href="progetto.html?id=${c.id}">${esc(c.titolo)}</a></h3>
        <p>${esc(c.sottotitolo)}</p>
        <span class="dept">${esc(c.dipartimento)}</span>
        ${progress(c)}
      </div>
    </article>`;
  }

  function animateBars(root) {
    requestAnimationFrame(() => setTimeout(() => {
      (root || document).querySelectorAll(".bar > span[data-w]").forEach((s) => { s.style.width = s.dataset.w + "%"; });
    }, 60));
  }

  /* ---------- Feedback ---------- */
  let toastT;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function copia(testo, btn) {
    const ok = () => {
      toast("Link copiato negli appunti");
      if (btn) { const o = btn.textContent; btn.textContent = "Copiato! ✓"; setTimeout(() => (btn.textContent = o), 2000); }
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(testo).then(ok, () => fallback());
    else fallback();
    function fallback() {
      const ta = document.createElement("textarea"); ta.value = testo; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      ta.remove(); ok();
    }
  }

  /* ---------- Progetti seguiti ---------- */
  function segue(id) { return store.get(key("seguiti"), []).includes(id); }
  function toggleSegui(id) {
    let s = store.get(key("seguiti"), []);
    const on = !s.includes(id);
    s = on ? [...s, id] : s.filter((x) => x !== id);
    store.set(key("seguiti"), s);
    refreshHeader();
    toast(on ? "Aggiunto a I miei progetti" : "Rimosso da I miei progetti");
    return on;
  }

  function refreshHeader() {
    const h = document.getElementById("site-header-slot");
    if (h) { h.innerHTML = header(document.body.dataset.page); initProfileMenu(); }
  }

  /* ---------- Avvio ---------- */
  /* ---------- Parametri dimostrativi per l'analisi di accessibilità ----------
     Gli strumenti automatici (es. MAUVE++) aprono le pagine via URL in un browser vuoto, senza sessione.
     Questi parametri portano la pagina direttamente nello stato da analizzare:
       ?demo=giuseppe | ?demo=marco   accesso con un account di prova (solo per questa scheda)
       ?menu=aperto                   menu del profilo aperto
       ?demo=errori                   invio a vuoto del modulo principale, per mostrare i messaggi di errore
       sostieni-*.html?id=…&demo=1    passi del sostegno e conferma già compilati (vedi sostieni.js) */
  const DEMO = new URLSearchParams(location.search).get("demo");
  function demoLogin() {
    const u = { giuseppe: "giuseppe.demo@esempio.it", marco: "marco.giordano@unito.it" }[DEMO];
    if (u && (!utente() || utente().email !== u)) login(u, "Prova2026!", false);
  }
  function demoStati() {
    if (new URLSearchParams(location.search).get("menu") === "aperto") {
      const b = document.getElementById("profile-btn"), m = document.getElementById("profile-menu");
      if (b) { b.setAttribute("aria-expanded", "true"); m.hidden = false; }
    }
    if (DEMO && DEMO.startsWith("errori")) {
      // dopo che gli script della pagina hanno collegato i loro gestori
      setTimeout(() => {
        const f = document.querySelector(DEMO === "errori-reg" ? "#f-reg" : "form[data-demo-errori]");
        if (f) f.requestSubmit();
      }, 300);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    seed();
    demoLogin();
    const page = document.body.dataset.page || "";
    const top = document.createElement("div"); top.id = "site-header-slot"; top.innerHTML = header(page);
    document.body.prepend(top);
    initProfileMenu();
    document.body.insertAdjacentHTML("beforeend", footer());
    window.addEventListener("load", demoStati);

    document.addEventListener("click", (e) => {
      if (e.target.id !== "logout") return;
      logout();
      toast("Sei uscito dal tuo account");
      setTimeout(() => location.reload(), 600);
    });
    const benv = store.sget("ucf_benvenuto", null);
    if (benv) { store.sdel("ucf_benvenuto"); setTimeout(() => toast(benv), 300); }

    // "Leggi di più" (A1-05)
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-more]");
      if (!b) return;
      const box = document.getElementById(b.getAttribute("aria-controls"));
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", open);
      box.classList.toggle("open", open);
      b.textContent = open ? "Mostra meno" : "Leggi di più";
    });
    animateBars();
  });

  window.UCF = { utente, key, login, logout, registra, seed, store, euro, data, esc, qs, campagna, card, progress, statoBadge, animateBars, toast, copia, segue, toggleSegui, refreshHeader, ico };
})();
