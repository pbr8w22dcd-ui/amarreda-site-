/* Sessione di accesso. Il vero controllo avviene sui webhook n8n, che verificano il token. */
(function () {
  var K = 'amarreda_session';
  function get() {
    try { var s = JSON.parse(localStorage.getItem(K)); if (s && s.token && s.exp > Date.now()) return s; } catch (e) {}
    try { localStorage.removeItem(K); } catch (e) {}
    return null;
  }
  window.AmarredaAuth = {
    session: get,
    token: function () { var s = get(); return s ? s.token : ''; },
    save: function (t, name, sec) { try { localStorage.setItem(K, JSON.stringify({ token: t, name: name || '', exp: Date.now() + (sec || 28800) * 1000 })); } catch (e) {} },
    clear: function () { try { localStorage.removeItem(K); } catch (e) {} },
    expire: function () { this.clear(); location.href = 'accedi.html?next=configuratore.html&expired=1'; }
  };
  if (document.documentElement.hasAttribute('data-protected') && !get()) {
    document.documentElement.style.visibility = 'hidden';
    location.replace('accedi.html?next=configuratore.html');
  }
})();
