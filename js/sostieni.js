/* Percorso di sostegno in 3 passi + conferma.
   I dati restano in sessionStorage: tornando indietro non si perde nulla (A1-07). */
(function () {
  "use strict";
  const KEY = "ucf_sostegno";
  const { store, euro, esc, qs, campagna, progress } = UCF;
  const $ = (id) => document.getElementById(id);

  const draft = () => store.sget(KEY, {});
  const save = (patch) => { const d = Object.assign(draft(), patch); store.sset(KEY, d); return d; };

  const METODI = { carta: "Carta di credito o debito", paypal: "PayPal", applepay: "Apple Pay", googlepay: "Google Pay", satispay: "Satispay" };

  /* ---------- Validatori con messaggi che spiegano il motivo (A1-08) ---------- */
  const V = {
    email: (v) => !v ? "Inserisci l'email: ci serve solo per mandarti la conferma e la ricevuta."
      : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "L'email non sembra completa: controlla che ci siano “@” e un dominio, es. nome@esempio.it.",
    nome: (v) => v.trim().length >= 2 ? "" : "Inserisci il nome come compare sui documenti: verrà scritto sulla ricevuta.",
    cognome: (v) => v.trim().length >= 2 ? "" : "Inserisci il cognome: verrà scritto sulla ricevuta.",
    cf: (v) => {
      v = v.toUpperCase().replace(/\s/g, "");
      if (!v) return "Inserisci il codice fiscale: serve solo per intestarti la ricevuta valida ai fini fiscali.";
      if (v.length !== 16) return `Il codice fiscale ha 16 caratteri: ne hai inseriti ${v.length}.`;
      if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(v)) return "Il formato non è corretto: 6 lettere, 2 numeri, 1 lettera, 2 numeri, 1 lettera, 3 numeri, 1 lettera (es. RSSMRA80A01L219X).";
      return "";
    },
    carta: (v) => { v = v.replace(/\s/g, ""); return /^\d{16}$/.test(v) ? "" : "Il numero della carta ha 16 cifre, senza lettere. Lo trovi sul fronte della carta."; },
    scadenza: (v) => {
      const m = v.match(/^(\d{2})\/(\d{2})$/);
      if (!m) return "Scrivi la scadenza nel formato MM/AA, es. 08/28.";
      const mm = +m[1], aa = 2000 + +m[2], now = new Date();
      if (mm < 1 || mm > 12) return "Il mese deve essere tra 01 e 12.";
      if (aa < now.getFullYear() || (aa === now.getFullYear() && mm < now.getMonth() + 1)) return "La carta risulta scaduta: controlla la data o usa un altro metodo.";
      return "";
    },
    cvc: (v) => /^\d{3,4}$/.test(v) ? "" : "Il codice di sicurezza è di 3 cifre e si trova sul retro della carta."
  };

  function setErr(input, msg) {
    const f = input.closest(".field");
    const box = f.querySelector(".error-msg");
    f.classList.toggle("has-error", !!msg);
    f.classList.toggle("is-valid", !msg && input.value !== "");
    input.setAttribute("aria-invalid", !!msg);
    if (box) box.textContent = msg || "";
    return !msg;
  }

  /* ---------- Parti comuni ---------- */
  function stepper(n, id) {
    const s = ["Importo", "I tuoi dati", "Riepilogo e pagamento"];
    const href = [`sostieni.html?id=${id}`, `sostieni-dati.html?id=${id}`, null];
    return `<ol class="stepper" aria-label="Passaggi">${s.map((l, i) => {
      const cls = i + 1 < n ? "done" : i + 1 === n ? "current" : "";
      const lab = i + 1 < n && href[i] ? `<a href="${href[i]}">${l}</a>` : l;
      return `<li class="${cls}"${i + 1 === n ? ' aria-current="step"' : ""}>${lab}<span class="sr-only">${i + 1 < n ? " (completato)" : ""}</span></li>`;
    }).join("")}</ol>`;
  }

  // Riquadro laterale con progetto e importo sempre visibili (A1-06)
  function riepilogoLaterale(c, d) {
    return `<aside class="sticky" aria-label="Il tuo contributo"><div class="panel summary-box" style="--tc:${TEMI[c.tema].colore}">
      <p class="eyebrow" style="margin-bottom:4px">Stai sostenendo</p>
      <h3><a href="progetto.html?id=${c.id}" style="color:inherit">${esc(c.titolo)}</a></h3>
      ${progress(c)}
      <div style="margin-top:16px">
        <div class="summary-row"><span class="k">Contributo</span><span class="v" id="side-imp">${d.importo ? euro(d.importo) : "—"}</span></div>
        <div class="summary-row"><span class="k">Tipo</span><span class="v">Una tantum</span></div>
      </div>
      <p class="secure">${UCF.ico.lock}<span>Pagamento protetto, gestito dall'Università di Torino. Rimborso garantito se l'obiettivo non viene raggiunto.</span></p>
    </div></aside>`;
  }

  function guard(c) {
    if (c && c.stato === "in-corso") return true;
    document.getElementById("main").innerHTML = `<div class="empty" style="margin-top:40px"><h1 style="font-size:1.8rem">${c ? "La raccolta di questa campagna è conclusa" : "Scegli prima una campagna"}</h1>
      <p class="muted">${c ? "Non è più possibile contribuire, ma puoi seguirne i risultati." : "Per contribuire parti dalla scheda di una campagna."}</p>
      <a class="btn" href="campagne.html?stato=in-corso">Vedi le campagne aperte</a></div>`;
    return false;
  }

  function crumbs(c, last) {
    return `<nav class="crumbs" aria-label="Percorso"><ol><li><a href="index.html">Home</a></li><li><a href="campagne.html">Campagne</a></li><li><a href="progetto.html?id=${c.id}">${esc(c.titolo)}</a></li><li aria-current="page">${last}</li></ol></nav>`;
  }

  /* ---------- Passo 1: importo ---------- */
  function passo1(c) {
    let d = draft();
    if (d.id !== c.id) d = save({ id: c.id, importo: null, preset: null }) && draft();
    const preset = c.impatto.map(([a, w]) => `<div class="opt"><input type="radio" name="imp" id="i${a}" value="${a}"${d.preset == a ? " checked" : ""}>
      <label for="i${a}"><span class="radio" aria-hidden="true"></span><span class="amt">${euro(a)}</span><span class="what">${esc(w)}</span></label></div>`).join("");
    $("main").innerHTML = `${crumbs(c, "Sostieni")}
    <div class="page-head" style="margin-bottom:28px"><h1>Sostieni “${esc(c.titolo)}”</h1></div>
    <div class="layout-side"><div>
      ${stepper(1, c.id)}
      <form id="f" novalidate>
        <fieldset style="border:0;padding:0;margin:0">
          <legend class="label" style="font-size:1.2rem;margin-bottom:14px">Quanto vuoi donare?</legend>
          <div class="options">${preset}
            <div class="opt"><input type="radio" name="imp" id="ialtro" value="altro"${d.preset === "altro" ? " checked" : ""}>
              <label for="ialtro"><span class="radio" aria-hidden="true"></span><span class="amt" style="font-size:1.1rem">Altro importo</span><span class="what">Scegli tu la cifra, da 5 €</span></label></div>
          </div>
          <div class="field" id="altro-box" style="margin-top:14px;max-width:280px" ${d.preset === "altro" ? "" : "hidden"}>
            <label for="altro">Importo in euro</label>
            <input type="number" id="altro" min="5" max="5000" step="1" inputmode="numeric" value="${d.preset === "altro" && d.importo ? d.importo : ""}">
            <span class="error-msg" id="altro-err"></span>
          </div>
        </fieldset>
        <div class="alert alert-info small" style="margin-top:8px"><span><strong>Contributo una tantum:</strong> non verranno fatti altri addebiti. Non serve registrarsi.</span></div>
        <div class="form-errors" id="ferr" role="alert"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:24px">
          <a href="progetto.html?id=${c.id}">← Torna alla campagna</a>
          <button class="btn" type="submit">Continua</button>
        </div>
      </form>
    </div>${riepilogoLaterale(c, d)}</div>`;

    const f = $("f"), altro = $("altro");
    const validaAltro = () => {
      const v = altro.value.trim();
      if (!v) return setErr(altro, "Scrivi l'importo che vuoi donare.");
      if (!/^\d+$/.test(v)) return setErr(altro, "Usa solo numeri interi, senza centesimi o simboli.");
      if (+v < 5) return setErr(altro, "L'importo minimo è 5 €, per coprire i costi fissi del pagamento.");
      if (+v > 5000) return setErr(altro, "Per importi oltre 5.000 € contatta l'Ufficio Fundraising: ti aiuteremo con un bonifico.");
      return setErr(altro, "");
    };
    f.addEventListener("change", (e) => {
      if (e.target.name !== "imp") return;
      const isAltro = e.target.value === "altro";
      $("altro-box").hidden = !isAltro;
      $("ferr").classList.remove("show");
      if (isAltro) { altro.focus(); save({ preset: "altro", importo: +altro.value || null }); }
      else save({ preset: +e.target.value, importo: +e.target.value });
      $("side-imp").textContent = draft().importo ? euro(draft().importo) : "—";
    });
    altro.addEventListener("input", () => { if (/^\d+$/.test(altro.value)) save({ importo: +altro.value }); $("side-imp").textContent = altro.value ? euro(+altro.value || 0) : "—"; });
    altro.addEventListener("blur", validaAltro);
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const sel = f.querySelector("input[name=imp]:checked");
      if (!sel) { $("ferr").innerHTML = "<strong>Scegli un importo</strong> per continuare."; $("ferr").classList.add("show"); f.querySelector("input[name=imp]").focus(); return; }
      if (sel.value === "altro" && !validaAltro()) { altro.focus(); return; }
      location.href = `sostieni-dati.html?id=${c.id}`;
    });
  }

  /* ---------- Passo 2: dati e metodo ---------- */
  function passo2(c) {
    const u = UCF.utente();
    if (u && !draft().email) save({ email: u.email, nome: u.nome, cognome: u.cognome });
    const d = draft();
    if (d.id !== c.id || !d.importo) { location.replace(`sostieni.html?id=${c.id}`); return; }
    const accesso = u
      ? `<div class="alert alert-ok small"><span>Hai effettuato l'accesso come <strong>${esc(u.email)}</strong>: il contributo comparirà in I miei progetti.</span></div>`
      : `<div class="alert alert-info small"><span>Non serve un account per donare. Se ne hai uno, <a href="accedi.html?next=${encodeURIComponent("sostieni-dati.html?id=" + c.id)}">accedi</a> per ritrovare il contributo in I miei progetti: i dati inseriti qui non andranno persi.</span></div>`;
    const metodo = d.metodo || "";
    const fld = (id, label, type, hint, extra = "") => `<div class="field"><label for="${id}">${label}${hint ? `<span class="hint">${hint}</span>` : ""}</label>
      <input type="${type}" id="${id}" value="${esc(d[id] || "")}" ${extra}><span class="error-msg" id="${id}-err"></span></div>`;
    $("main").innerHTML = `${crumbs(c, "I tuoi dati")}
    <div class="page-head" style="margin-bottom:28px"><h1>I tuoi dati</h1><p class="muted" style="margin:0">Ti chiediamo solo quello che serve. I campi con <span class="req">*</span> sono obbligatori.</p></div>
    <div class="layout-side"><div>
      ${stepper(2, c.id)}
      ${accesso}
      <form id="f" novalidate>
        <div class="form-errors" id="ferr" role="alert" tabindex="-1"></div>
        <h2 style="font-size:1.3rem">Contatto</h2>
        ${fld("email", 'Email <span class="req">*</span>', "email", "Per la conferma e la ricevuta. Niente pubblicità.", 'autocomplete="email" required')}

        <h2 style="font-size:1.3rem;margin-top:12px">Metodo di pagamento</h2>
        <fieldset style="border:0;padding:0;margin:0 0 8px"><legend class="sr-only">Metodo di pagamento</legend>
        <div class="options pay-grid">${Object.entries(METODI).map(([k, l]) => `<div class="opt"><input type="radio" name="metodo" id="m-${k}" value="${k}"${metodo === k ? " checked" : ""}>
          <label for="m-${k}"><span class="radio" aria-hidden="true"></span><span class="what"><strong>${l}</strong></span></label></div>`).join("")}</div></fieldset>
        <span class="error-msg" id="metodo-err" style="margin-bottom:12px"></span>
        <div id="carta-box" ${metodo === "carta" ? "" : "hidden"} class="panel-soft" style="margin:12px 0 20px">
          ${fld("carta", 'Numero della carta <span class="req">*</span>', "text", "", 'inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="19"')}
          <div class="row2">
            ${fld("scadenza", 'Scadenza <span class="req">*</span>', "text", "", 'placeholder="MM/AA" autocomplete="cc-exp" maxlength="5"')}
            ${fld("cvc", 'Codice di sicurezza (CVC) <span class="req">*</span>', "text", "", 'inputmode="numeric" autocomplete="cc-csc" maxlength="4"')}
          </div>
          <p class="small muted" style="margin:0">Prototipo: inserisci numeri di prova, nessun addebito è reale.</p>
        </div>
        <p class="small muted" id="wallet-note" ${metodo && metodo !== "carta" ? "" : "hidden"}>Confermerai il pagamento con ${metodo ? METODI[metodo] : ""} nell'ultimo passaggio, senza lasciare questo sito.</p>

        <h2 style="font-size:1.3rem;margin-top:12px">Ricevuta e preferenze</h2>
        <label class="check"><input type="checkbox" id="ricevuta"${d.ricevuta ? " checked" : ""}><span><strong>Voglio la ricevuta per la dichiarazione dei redditi</strong><span class="hint">Facoltativo. Puoi richiederla anche dopo, dalla pagina di conferma.</span></span></label>
        <div id="ricevuta-box" class="panel-soft" style="margin:4px 0 18px" ${d.ricevuta ? "" : "hidden"}>
          <div class="row2">${fld("nome", 'Nome <span class="req">*</span>', "text", "", 'autocomplete="given-name"')}${fld("cognome", 'Cognome <span class="req">*</span>', "text", "", 'autocomplete="family-name"')}</div>
          ${fld("cf", 'Codice fiscale <span class="req">*</span>', "text", "Serve solo per intestarti la ricevuta valida ai fini fiscali.", 'maxlength="16" autocomplete="off" style="text-transform:uppercase"')}
        </div>
        <label class="check"><input type="checkbox" id="anonimo"${d.anonimo ? " checked" : ""}><span>Contribuisci in forma anonima<span class="hint">Il tuo nome non comparirà tra i sostenitori.</span></span></label>
        <label class="check"><input type="checkbox" id="aggiorna"${d.aggiorna ? " checked" : ""}><span>Inviami gli aggiornamenti di questo progetto<span class="hint">Solo notizie sul progetto, al massimo una email al mese. Puoi annullare quando vuoi.</span></span></label>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:28px">
          <a href="sostieni.html?id=${c.id}">← Modifica l'importo</a>
          <button class="btn" type="submit">Continua al riepilogo</button>
        </div>
      </form>
    </div>${riepilogoLaterale(c, d)}</div>`;

    const f = $("f");
    const campi = () => {
      const m = (f.querySelector("input[name=metodo]:checked") || {}).value;
      const list = ["email"];
      if (m === "carta") list.push("carta", "scadenza", "cvc");
      if ($("ricevuta").checked) list.push("nome", "cognome", "cf");
      return list;
    };
    // Salvataggio continuo, tranne il CVC (dato sensibile)
    f.addEventListener("input", (e) => {
      const t = e.target;
      if (t.id === "carta") t.value = t.value.replace(/[^\d]/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
      if (t.id === "scadenza") t.value = t.value.replace(/[^\d/]/g, "").replace(/^(\d{2})(\d)/, "$1/$2").slice(0, 5);
      if (t.id === "cf") t.value = t.value.toUpperCase();
      if (t.id && t.id !== "cvc" && t.type !== "radio") save({ [t.id]: t.type === "checkbox" ? t.checked : t.value });
      if (t.closest(".field.has-error") && V[t.id]) setErr(t, V[t.id](t.value));
    });
    f.addEventListener("change", (e) => {
      const t = e.target;
      if (t.name === "metodo") {
        save({ metodo: t.value });
        $("carta-box").hidden = t.value !== "carta";
        $("wallet-note").hidden = t.value === "carta";
        $("wallet-note").textContent = `Confermerai il pagamento con ${METODI[t.value]} nell'ultimo passaggio, senza lasciare questo sito.`;
        $("metodo-err").style.display = "none";
      }
      if (t.id === "ricevuta") $("ricevuta-box").hidden = !t.checked;
    });
    f.addEventListener("focusout", (e) => { const t = e.target; if (V[t.id] && t.value) setErr(t, V[t.id](t.value)); });

    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const errs = [];
      campi().forEach((id) => { const el = $(id); const m = V[id](el.value); setErr(el, m); if (m) errs.push([id, el.closest(".field").querySelector("label").childNodes[0].textContent.trim()]); });
      const m = f.querySelector("input[name=metodo]:checked");
      if (!m) { $("metodo-err").textContent = "Scegli come vuoi pagare."; $("metodo-err").style.display = "block"; errs.splice(errs[0] && errs[0][0] === "email" ? 1 : 0, 0, ["m-carta", "Metodo di pagamento"]); }
      if (errs.length) {
        $("ferr").innerHTML = `<strong>Controlla ${errs.length === 1 ? "questo campo" : `questi ${errs.length} campi`}:</strong><ul style="margin:6px 0 0">${errs.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join("")}</ul>`;
        $("ferr").classList.add("show"); $("ferr").focus();
        return;
      }
      save({ cvcOk: true });
      location.href = `sostieni-riepilogo.html?id=${c.id}`;
    });
    $("ferr").addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) { e.preventDefault(); $(a.getAttribute("href").slice(1)).focus(); } });
  }

  /* ---------- Passo 3: riepilogo e conferma ---------- */
  function passo3(c) {
    const d = draft();
    if (d.id !== c.id || !d.importo || !d.email || !d.metodo) { location.replace(`sostieni${d.importo ? "-dati" : ""}.html?id=${c.id}`); return; }
    const row = (k, v, edit) => `<div class="summary-row"><span class="k">${k}</span><span class="v">${v}${edit ? ` · <a href="${edit}" style="font-weight:400">Modifica</a>` : ""}</span></div>`;
    const p1 = `sostieni.html?id=${c.id}`, p2 = `sostieni-dati.html?id=${c.id}`;
    const metodoTxt = d.metodo === "carta" ? `Carta che termina con ${String(d.carta || "").replace(/\s/g, "").slice(-4)}` : METODI[d.metodo];
    $("main").innerHTML = `${crumbs(c, "Riepilogo")}
    <div class="page-head" style="margin-bottom:28px"><h1>Controlla e conferma</h1><p class="muted" style="margin:0">Non è ancora stato addebitato nulla.</p></div>
    <div class="layout-side"><div>
      ${stepper(3, c.id)}
      <div class="panel">
        <h2 style="font-size:1.3rem">Il tuo contributo</h2>
        ${row("Campagna", esc(c.titolo))}
        ${row("Importo", `<span style="font-size:1.3rem">${euro(d.importo)}</span>`, p1)}
        ${row("Tipo", "Una tantum, nessun addebito ricorrente")}
        ${row("Email", esc(d.email), p2)}
        ${row("Pagamento", metodoTxt, p2)}
        ${row("Ricevuta fiscale", d.ricevuta ? `Sì, intestata a ${esc(d.nome)} ${esc(d.cognome)}` : "No (puoi richiederla dopo)", p2)}
        ${row("Visibilità", d.anonimo ? "Anonimo" : "Nome visibile tra i sostenitori", p2)}
        ${row("Aggiornamenti via email", d.aggiorna ? "Sì, solo su questo progetto" : "No", p2)}
      </div>
      <p class="small muted" style="margin-top:16px">Confermando accetti le <a href="come-funziona.html#regole">regole del programma</a>. Se la campagna non raggiunge l'obiettivo entro la scadenza, l'importo ti verrà restituito per intero.</p>
      <div class="form-errors" id="ferr" role="alert"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
        <a href="${p2}">← Indietro</a>
        <button class="btn btn-accent" type="button" id="paga" style="min-width:260px">Conferma e dona ${euro(d.importo)}</button>
      </div>
      <p aria-live="polite" class="sr-only" id="stato"></p>
    </div>${riepilogoLaterale(c, d)}</div>`;

    $("paga").addEventListener("click", (e) => {
      const b = e.currentTarget;
      if (b.disabled) return;                       // un solo clic: niente doppi pagamenti
      b.disabled = true;
      b.innerHTML = '<span class="spinner" aria-hidden="true"></span> Pagamento in corso…';
      $("stato").textContent = "Pagamento in corso, attendi qualche secondo.";
      setTimeout(() => {
        const ric = "UNITO-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 900000) + 100000);
        const don = { id: c.id, importo: d.importo, data: new Date().toISOString().slice(0, 10), ricevuta: ric, metodo: d.metodo, email: d.email, fiscale: !!d.ricevuta, aggiorna: !!d.aggiorna };
        store.set(UCF.key("donazioni"), [...store.get(UCF.key("donazioni"), []), don]);
        if (d.aggiorna) store.set(UCF.key("seguiti"), [...new Set([...store.get(UCF.key("seguiti"), []), c.id])]);
        store.sset("ucf_ultima", don);
        store.sdel(KEY);
        location.replace(`sostieni-conferma.html?id=${c.id}`);   // replace: "indietro" non ripropone il pagamento
      }, 1600);
    });
  }

  /* ---------- Conferma ---------- */
  function conferma(c) {
    const d = store.sget("ucf_ultima", null);
    if (!d || d.id !== c.id) {
      $("main").innerHTML = `<div class="empty" style="margin-top:40px"><h1 style="font-size:1.8rem">Nessun contributo da mostrare</h1><p class="muted">Trovi tutti i tuoi contributi in I miei progetti.</p><a class="btn" href="i-miei-progetti.html">Vai a I miei progetti</a></div>`;
      return;
    }
    const link = `https://crowdfunding.unito.it/${c.id}`;
    $("main").innerHTML = `
    <div class="confirm-hero">
      <div class="confirm-check" aria-hidden="true">✓</div>
      <h1>Grazie! Il tuo contributo di ${euro(d.importo)} è andato a buon fine</h1>
      <p class="lead muted">Abbiamo inviato la conferma a <strong>${esc(d.email)}</strong>. Numero dell'operazione: <strong>${d.ricevuta}</strong></p>
    </div>
    <div class="grid g2" style="margin-top:24px;align-items:start">
      <div class="panel" style="--tc:${TEMI[c.tema].colore}">
        ${c.ringraziamento ? `<blockquote class="quote">“${esc(c.ringraziamento)}”</blockquote>` : ""}
        <div class="person" style="margin-top:18px"><div class="avatar" aria-hidden="true">${c.responsabile.iniziali}</div><div><strong>${esc(c.responsabile.nome)}</strong><br><span class="muted small">${esc(c.titolo)}</span></div></div>
        <div style="margin-top:22px">${progress(Object.assign({}, c, { raccolti: c.raccolti + d.importo, sostenitori: c.sostenitori + 1 }))}</div>
        <p class="small muted">Con il tuo contributo la raccolta è salita.</p>
      </div>
      <div>
        <div class="panel">
          <h2 style="font-size:1.3rem">Cosa succede adesso</h2>
          <ol style="padding-left:20px;margin:0 0 6px">
            <li>Ricevi subito un'email con il riepilogo${d.fiscale ? " e la ricevuta fiscale in PDF" : ""}.</li>
            <li>${d.aggiorna ? "Riceverai gli aggiornamenti dei ricercatori, al massimo uno al mese." : "Puoi seguire il progetto da I miei progetti."}</li>
            <li>Se l'obiettivo non viene raggiunto entro ${c.giorni} giorni, ti restituiamo ${euro(d.importo)}.</li>
          </ol>
          ${d.fiscale ? "" : `<div class="alert alert-info small" style="margin:14px 0 0"><span>Ti serve la ricevuta per la dichiarazione dei redditi? <button class="linkbtn" id="chiedi">Richiedila ora</button></span></div>
          <form id="fric" class="panel-soft" hidden style="margin-top:12px" novalidate>
            <div class="field"><label for="cf">Codice fiscale <span class="hint">Serve solo per intestarti la ricevuta.</span></label><input id="cf" maxlength="16" style="text-transform:uppercase"><span class="error-msg"></span></div>
            <button class="btn btn-sm" type="submit">Invia la ricevuta</button></form>`}
        </div>
        <div class="panel" style="margin-top:20px">
          <h2 style="font-size:1.3rem">Aiuta il progetto a crescere</h2>
          <p class="muted small">Condividi la campagna: è il modo più efficace per sostenerla.</p>
          <div class="shortlink"><code>${link.replace("https://", "")}</code><button type="button" id="copia">Copia link</button></div>
          <div class="share-row" style="margin-top:10px">
            <a class="btn btn-ghost btn-sm" href="#" data-share="WhatsApp">WhatsApp</a>
            <a class="btn btn-ghost btn-sm" href="#" data-share="Telegram">Telegram</a>
            <a class="btn btn-ghost btn-sm" href="#" data-share="LinkedIn">Condividi su LinkedIn</a>
          </div>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:36px">
      <a class="btn" href="i-miei-progetti.html">Vai a I miei progetti</a>
      <a class="btn btn-ghost" href="progetto.html?id=${c.id}">Torna alla campagna</a>
    </div>`;
    $("copia").addEventListener("click", (e) => UCF.copia(link, e.currentTarget));
    document.querySelectorAll("[data-share]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); UCF.toast(`Nel sito reale si aprirebbe la condivisione su ${a.dataset.share}`); }));
    const ch = $("chiedi");
    if (ch) {
      ch.addEventListener("click", () => { $("fric").hidden = false; $("cf").focus(); });
      $("fric").addEventListener("submit", (e) => {
        e.preventDefault();
        if (!setErr($("cf"), V.cf($("cf").value))) return;
        $("fric").outerHTML = `<p class="alert alert-ok small" style="margin-top:12px">✓ Ricevuta inviata a ${esc(d.email)}.</p>`;
        UCF.toast("Ricevuta inviata");
      });
    }
    UCF.animateBars();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const c = campagna(qs("id"));
    const step = document.body.dataset.step;
    if (step === "conferma") { if (c) conferma(c); else guard(null); return; }
    if (!guard(c)) return;
    ({ 1: passo1, 2: passo2, 3: passo3 })[step](c);
    UCF.animateBars();
  });
})();
