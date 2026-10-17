(function () {
  var d = document, C = window.AMARREDA || {};
  /* Menu mobile */
  var b = d.querySelector('.burger'), n = d.getElementById('nav');
  if (b && n) {
    var close = function () { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.textContent = 'Menu'; d.body.style.overflow = ''; };
    b.addEventListener('click', function () {
      var o = n.classList.toggle('open');
      b.setAttribute('aria-expanded', o); b.textContent = o ? 'Chiudi' : 'Menu'; d.body.style.overflow = o ? 'hidden' : '';
    });
    n.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    matchMedia('(min-width:901px)').addEventListener('change', close);
  }
  /* Ispirazioni: filtri e lightbox */
  var fb = d.querySelectorAll('.filters button'), items = d.querySelectorAll('.gal figure'), lb = d.getElementById('lb');
  fb.forEach(function (x) {
    x.addEventListener('click', function () {
      fb.forEach(function (y) { y.setAttribute('aria-pressed', y === x); });
      items.forEach(function (f) { f.hidden = !(x.dataset.f === 'tutte' || f.dataset.cat === x.dataset.f); });
    });
  });
  if (lb) {
    var open = function (f) {
      var i = f.querySelector('img'); lb.querySelector('img').src = i.src; lb.querySelector('img').alt = i.alt;
      lb.querySelector('p').textContent = f.querySelector('figcaption').textContent; lb.showModal();
    };
    items.forEach(function (f) {
      f.tabIndex = 0; f.setAttribute('role', 'button');
      f.addEventListener('click', function () { open(f); });
      f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(f); } });
    });
    lb.addEventListener('click', function () { lb.close(); });
  }
  /* Configuratore: chat + modulo */
  var log = d.getElementById('chat-log'); if (!log) return;
  var quick = d.getElementById('chat-quick'), inp = d.getElementById('chat-input'), cform = d.getElementById('chat-form'),
      form = d.getElementById('contact-form'), status = d.getElementById('form-status'), out = d.getElementById('brief'),
      sid = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), brief = {}, history = [], busy = false, step = 0;
  var LABEL = { tipo: 'Progetto', spazio: 'Spazio', stile: 'Atmosfera', tempi: 'Tempi', budget: 'Budget' };
  var FLOW = [
    { k: 'tipo', q: 'Ciao, sono l’assistente di Amarreda. Di che progetto si tratta?', o: ['Interni completi', 'Cucina', 'Consulenza d’arredo', 'Non lo so ancora'] },
    { k: 'spazio', q: 'Che spazio dobbiamo sistemare? Scrivimi gli ambienti e i metri quadri, anche a occhio.' },
    { k: 'stile', q: 'Quale atmosfera ti somiglia di più?', o: ['Calda e materica', 'Essenziale e luminosa', 'Scura e raccolta', 'Non saprei'] },
    { k: 'tempi', q: 'Quando vorresti iniziare?', o: ['Entro 3 mesi', 'Entro l’anno', 'Sto solo esplorando'] },
    { k: 'budget', q: 'Hai un budget di riferimento? Se preferisci parlarne a voce, va benissimo.', o: ['Preferisco parlarne a voce'] }
  ];
  var END = 'Ho preso nota di tutto. Compila nome ed email nel modulo e ti ricontattiamo con una proposta di primo incontro.';
  function add(t, who, cls) { var m = d.createElement('div'); m.className = 'msg ' + who + (cls ? ' ' + cls : ''); m.textContent = t; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
  function chips(list) {
    quick.innerHTML = '';
    (list || []).forEach(function (t) { var x = d.createElement('button'); x.type = 'button'; x.textContent = t; x.addEventListener('click', function () { send(t); }); quick.appendChild(x); });
  }
  function render() {
    var k = Object.keys(brief);
    out.innerHTML = k.length ? k.map(function (x) { return '<dt></dt><dd></dd>'; }).join('') : '<p class="empty">Le risposte che dai in chat compaiono qui.</p>';
    k.forEach(function (x, i) { out.children[i * 2].textContent = LABEL[x] || x; out.children[i * 2 + 1].textContent = brief[x]; });
    form.elements.brief.value = JSON.stringify(brief);
  }
  function ask() { var s = FLOW[step]; if (s) { add(s.q, 'bot'); chips(s.o); } else { add(END, 'bot'); chips([]); } }
  function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    add(text, 'me'); history.push({ role: 'user', text: text }); inp.value = ''; chips([]);
    if (!C.chatWebhook) { if (FLOW[step]) { brief[FLOW[step].k] = text; step++; render(); } setTimeout(ask, 350); history.push({ role: 'bot', text: FLOW[step] ? FLOW[step].q : END }); return; }
    busy = true; var t = add('Sto scrivendo…', 'bot', 'typing');
    fetch(C.chatWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid, message: text, brief: brief, history: history }) })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { t.remove(); add(j.reply || '…', 'bot'); history.push({ role: 'bot', text: j.reply || '' }); if (j.brief) { Object.assign(brief, j.brief); render(); } chips(j.quickReplies); })
      .catch(function () { t.remove(); add('Non riesco a rispondere in questo momento. Puoi continuare dal modulo qui accanto: leggiamo tutto noi.', 'bot'); })
      .then(function () { busy = false; inp.focus({ preventScroll: true }); });
  }
  cform.addEventListener('submit', function (e) { e.preventDefault(); send(inp.value); });
  render();
  if (C.chatWebhook) { add('Ciao, sono l’assistente di Amarreda. Raccontami cosa vuoi cambiare in casa.', 'bot'); } else { ask(); }
  /* Invio modulo */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (form.elements['bot-field'].value) return;
    var f = form.elements, payload = { source: 'amarreda-configuratore', createdAt: new Date().toISOString(), sessionId: sid, consent: true,
      contact: { nome: f.nome.value, email: f.email.value, telefono: f.telefono.value, note: f.note.value }, brief: brief, transcript: history };
    if (!C.formWebhook) {
      var body = 'Nome: ' + f.nome.value + '\nEmail: ' + f.email.value + '\nTelefono: ' + f.telefono.value + '\n\n' +
        Object.keys(brief).map(function (k) { return (LABEL[k] || k) + ': ' + brief[k]; }).join('\n') + '\n\nNote: ' + f.note.value;
      status.textContent = 'Si apre la tua app di posta con il riepilogo: premi Invia per spedirlo.';
      location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Richiesta di consulenza') + '&body=' + encodeURIComponent(body); return;
    }
    status.textContent = 'Invio in corso…';
    fetch(C.formWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw 0; location.href = 'grazie.html'; })
      .catch(function () { status.textContent = 'Invio non riuscito. Riprova tra poco o scrivi a ' + C.email + '.'; });
  });
})();
