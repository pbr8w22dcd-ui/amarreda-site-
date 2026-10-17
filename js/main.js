(function () {
  var d = document, C = window.AMARREDA || {}, A = window.AmarredaAuth;
  function post(url, body) { return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
  function mail(subject, text) { location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text); }

  /* Menu mobile */
  var b = d.querySelector('.burger'), n = d.getElementById('nav');
  if (b && n) {
    var close = function () { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.textContent = 'Menu'; d.body.style.overflow = ''; };
    b.addEventListener('click', function () { var o = n.classList.toggle('open'); b.setAttribute('aria-expanded', o); b.textContent = o ? 'Chiudi' : 'Menu'; d.body.style.overflow = o ? 'hidden' : ''; });
    n.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    matchMedia('(min-width:1280px)').addEventListener('change', close);
  }

  /* Accedi / Esci nell'header */
  var al = d.querySelector('[data-auth-link]');
  if (al && A && A.session()) {
    al.textContent = 'Esci'; al.href = '#';
    al.addEventListener('click', function (e) { e.preventDefault(); A.clear(); location.href = 'index.html'; });
  }

  /* Ispirazioni: filtri e lightbox */
  var fb = d.querySelectorAll('.filters button'), items = d.querySelectorAll('.gal figure'), lb = d.getElementById('lb');
  fb.forEach(function (x) { x.addEventListener('click', function () { fb.forEach(function (y) { y.setAttribute('aria-pressed', y === x); }); items.forEach(function (f) { f.hidden = !(x.dataset.f === 'tutte' || f.dataset.cat === x.dataset.f); }); }); });
  if (lb) {
    var open = function (f) { var i = f.querySelector('img'); lb.querySelector('img').src = i.src; lb.querySelector('img').alt = i.alt; lb.querySelector('p').textContent = f.querySelector('figcaption').textContent; lb.showModal(); };
    items.forEach(function (f) {
      f.tabIndex = 0; f.setAttribute('role', 'button');
      f.addEventListener('click', function () { open(f); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(f); } });
    });
    lb.addEventListener('click', function () { lb.close(); });
  }

  /* Pagina di accesso */
  var af = d.getElementById('auth-form');
  if (af) {
    var mode = 'login', st = d.getElementById('auth-status'), note = d.getElementById('auth-note'), tabs = af.parentNode.querySelectorAll('[role=tab]'),
        nx = new URLSearchParams(location.search).get('next'); nx = /^[a-z-]+\.html$/.test(nx || '') ? nx : 'configuratore.html';
    if (A.session()) { location.replace(nx); return; }
    if (new URLSearchParams(location.search).get('expired')) st.textContent = 'La sessione è scaduta. Accedi di nuovo.';
    if (C.demoAuth) { note.hidden = false; note.textContent = 'Modalità demo: l’accesso non è protetto. Disattivala in js/config.js prima del lancio.'; }
    else if (!C.authWebhook) { note.hidden = false; note.textContent = 'L’accesso non è ancora attivo: manca il collegamento del servizio di autenticazione.'; }
    var setMode = function (m) {
      mode = m;
      tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.mode === m); });
      af.querySelectorAll('[data-only]').forEach(function (e) { var on = e.dataset.only === m; e.hidden = !on; e.querySelectorAll('input').forEach(function (i) { i.required = on && i.dataset.req === '1'; }); });
      af.elements.password.autocomplete = m === 'login' ? 'current-password' : 'new-password';
      af.querySelector('button[type=submit]').textContent = m === 'login' ? 'Accedi' : 'Crea account';
      st.textContent = '';
    };
    tabs.forEach(function (t) { t.addEventListener('click', function () { setMode(t.dataset.mode); }); });
    setMode('login');
    var done = function (j) { A.save(j.token, j.name || af.elements.nome.value || af.elements.email.value, j.expiresIn); location.href = nx; };
    d.getElementById('forgot').addEventListener('click', function (e) {
      e.preventDefault();
      if (!af.elements.email.value) { st.textContent = 'Scrivi la tua email, poi tocca di nuovo “Password dimenticata?”.'; return; }
      if (!C.authWebhook) { st.textContent = 'Recupero non ancora attivo.'; return; }
      post(C.authWebhook, { action: 'reset', email: af.elements.email.value }).then(function () { st.textContent = 'Se l’indirizzo è registrato, riceverai le istruzioni via email.'; }).catch(function () { st.textContent = 'Richiesta non riuscita. Riprova tra poco.'; });
    });
    af.addEventListener('submit', function (e) {
      e.preventDefault(); var f = af.elements;
      if (C.demoAuth) return done({ token: 'demo', name: f.nome.value || f.email.value });
      if (!C.authWebhook) { st.textContent = 'L’accesso non è ancora attivo.'; return; }
      st.textContent = mode === 'login' ? 'Accesso in corso…' : 'Creazione account…';
      post(C.authWebhook, { action: mode, email: f.email.value, password: f.password.value, nome: f.nome.value, consent: f.consent.checked })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.ok && x.j.token) return done(x.j);
          if (x.ok && x.j.message) { st.textContent = x.j.message; return; }
          st.textContent = x.j.error || 'Credenziali non valide o servizio non disponibile. Riprova.';
        })
        .catch(function () { st.textContent = 'Connessione non riuscita. Riprova tra poco.'; });
    });
  }

  /* Candidature professionisti e rivenditori */
  d.querySelectorAll('.partner-form').forEach(function (pf) {
    var ps = pf.querySelector('.status');
    pf.addEventListener('submit', function (e) {
      e.preventDefault(); if (pf.elements['bot-field'].value) return;
      var data = {}; new FormData(pf).forEach(function (v, k) { if (k !== 'bot-field') data[k] = v; });
      var payload = { source: 'amarreda-partner', role: pf.dataset.role, createdAt: new Date().toISOString(), consent: true, fields: data };
      if (!C.partnerWebhook) {
        ps.textContent = 'Si apre la tua app di posta con la candidatura: premi Invia per spedirla.';
        mail('Candidatura ' + pf.dataset.role, Object.keys(data).map(function (k) { return k + ': ' + data[k]; }).join('\n')); return;
      }
      ps.textContent = 'Invio in corso…';
      post(C.partnerWebhook, payload).then(function (r) { if (!r.ok) throw 0; location.href = 'grazie.html'; }).catch(function () { ps.textContent = 'Invio non riuscito. Riprova tra poco o scrivi a ' + C.email + '.'; });
    });
  });

  /* Configuratore: chat + modulo (pagina protetta) */
  var log = d.getElementById('chat-log'); if (!log) return;
  var quick = d.getElementById('chat-quick'), inp = d.getElementById('chat-input'), cform = d.getElementById('chat-form'),
      form = d.getElementById('contact-form'), status = d.getElementById('form-status'), out = d.getElementById('brief'),
      who = (A.session() || {}).name, sid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), brief = {}, history = [], busy = false, step = 0;
  var LABEL = { tipo: 'Progetto', spazio: 'Spazio', stile: 'Atmosfera', tempi: 'Tempi', budget: 'Budget' };
  var hi = 'Ciao' + (who ? ' ' + who : '') + ', sono l’assistente di Amarreda. ';
  var FLOW = [
    { k: 'tipo', q: hi + 'Di che progetto si tratta?', o: ['Interni completi', 'Cucina', 'Consulenza d’arredo', 'Non lo so ancora'] },
    { k: 'spazio', q: 'Che spazio dobbiamo sistemare? Scrivimi gli ambienti e i metri quadri, anche a occhio.' },
    { k: 'stile', q: 'Quale atmosfera ti somiglia di più?', o: ['Calda e materica', 'Essenziale e luminosa', 'Scura e raccolta', 'Non saprei'] },
    { k: 'tempi', q: 'Quando vorresti iniziare?', o: ['Entro 3 mesi', 'Entro l’anno', 'Sto solo esplorando'] },
    { k: 'budget', q: 'Hai un budget di riferimento? Se preferisci parlarne a voce, va benissimo.', o: ['Preferisco parlarne a voce'] }
  ];
  var END = 'Ho preso nota di tutto. Compila nome ed email nel modulo e ti ricontattiamo con una proposta di primo incontro.';
  function add(t, who, cls) { var m = d.createElement('div'); m.className = 'msg ' + who + (cls ? ' ' + cls : ''); m.textContent = t; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
  function chips(list) { quick.innerHTML = ''; (list || []).forEach(function (t) { var x = d.createElement('button'); x.type = 'button'; x.textContent = t; x.addEventListener('click', function () { send(t); }); quick.appendChild(x); }); }
  function render() {
    var k = Object.keys(brief);
    out.innerHTML = k.length ? k.map(function () { return '<dt></dt><dd></dd>'; }).join('') : '<p class="empty">Le risposte che dai in chat compaiono qui.</p>';
    k.forEach(function (x, i) { out.children[i * 2].textContent = LABEL[x] || x; out.children[i * 2 + 1].textContent = brief[x]; });
  }
  function ask() { var s = FLOW[step]; if (s) { add(s.q, 'bot'); chips(s.o); } else { add(END, 'bot'); chips([]); } }
  function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    add(text, 'me'); history.push({ role: 'user', text: text }); inp.value = ''; chips([]);
    if (!C.chatWebhook) { if (FLOW[step]) { brief[FLOW[step].k] = text; step++; render(); } setTimeout(ask, 350); history.push({ role: 'bot', text: FLOW[step] ? FLOW[step].q : END }); return; }
    busy = true; var t = add('Sto scrivendo…', 'bot', 'typing');
    post(C.chatWebhook, { token: A.token(), sessionId: sid, message: text, brief: brief, history: history })
      .then(function (r) { if (r.status === 401) { A.expire(); throw 0; } if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { t.remove(); add(j.reply || '…', 'bot'); history.push({ role: 'bot', text: j.reply || '' }); if (j.brief) { Object.assign(brief, j.brief); render(); } chips(j.quickReplies); })
      .catch(function () { t.remove(); add('Non riesco a rispondere in questo momento. Puoi continuare dal modulo qui accanto: leggiamo tutto noi.', 'bot'); })
      .then(function () { busy = false; });
  }
  cform.addEventListener('submit', function (e) { e.preventDefault(); send(inp.value); });
  render();
  if (C.chatWebhook) add(hi + 'Raccontami cosa vuoi cambiare in casa.', 'bot'); else ask();

  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (form.elements['bot-field'].value) return;
    var f = form.elements, payload = { token: A.token(), source: 'amarreda-configuratore', createdAt: new Date().toISOString(), sessionId: sid, consent: true,
      contact: { nome: f.nome.value, email: f.email.value, telefono: f.telefono.value, note: f.note.value }, brief: brief, transcript: history };
    if (!C.formWebhook) {
      status.textContent = 'Si apre la tua app di posta con il riepilogo: premi Invia per spedirlo.';
      mail('Richiesta di consulenza', 'Nome: ' + f.nome.value + '\nEmail: ' + f.email.value + '\nTelefono: ' + f.telefono.value + '\n\n' + Object.keys(brief).map(function (k) { return (LABEL[k] || k) + ': ' + brief[k]; }).join('\n') + '\n\nNote: ' + f.note.value); return;
    }
    status.textContent = 'Invio in corso…';
    post(C.formWebhook, payload).then(function (r) { if (r.status === 401) { A.expire(); throw 0; } if (!r.ok) throw 0; location.href = 'grazie.html'; })
      .catch(function () { status.textContent = 'Invio non riuscito. Riprova tra poco o scrivi a ' + C.email + '.'; });
  });
})();
