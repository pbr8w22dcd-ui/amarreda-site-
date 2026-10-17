# Amarreda

Sito statico (HTML, CSS, JavaScript) per lo studio di progettazione d’interni Amarreda. Nessuna dipendenza, nessuna build.

## Anteprima in locale
```bash
python3 -m http.server 8000   # poi apri http://localhost:8000
```

## Pubblicare su GitHub Pages
1. Crea il repository e carica tutti i file nella radice (`index.html` in cima).
2. *Settings → Pages → Source: GitHub Actions*. Ad ogni push su `main` il workflow verifica i link e pubblica.
3. Dominio proprio: aggiungi un file `CNAME` con il dominio e sostituisci `IL-TUO-DOMINIO.it` in `sitemap.xml` e `robots.txt`.

I percorsi sono tutti relativi: il sito funziona sia su `utente.github.io/repo/` sia su un dominio.

## Login e configuratore (`js/config.js`)
Il configuratore (`configuratore.html`) richiede l'accesso. GitHub Pages è un hosting statico: **il controllo vero lo fa n8n**, il browser conserva solo il token ricevuto.

- `authWebhook` (POST, JSON): riceve `{ action: "login"|"register"|"reset", email, password, nome, consent }`. Risponde `{ token, name, expiresIn }`, oppure `{ message }`, oppure un errore HTTP 4xx con `{ error }`. La password va cifrata con hash (es. bcrypt) e mai salvata in chiaro.
- `chatWebhook`: riceve `{ token, sessionId, message, brief, history }`, risponde `{ reply, quickReplies, brief }`. **Deve verificare il token e rispondere 401 se non è valido.** Senza webhook la chat segue il percorso guidato di cinque domande, senza AI.
- `formWebhook`: richiesta finale `{ token, contact, brief, transcript }`. Anche qui verifica il token.
- `partnerWebhook`: candidature di professionisti e rivenditori (pubbliche, senza token). Senza webhook si apre la mail.
- `demoAuth: true` serve solo per provare il sito: accesso finto e senza protezione. Prima del lancio deve essere `false`.
- Nel Webhook n8n abilita CORS (*Options → Allowed Origins*) con il dominio del sito. Le chiavi API stanno solo in n8n.

## Contenuti da sostituire
Email, telefono e indirizzo provvisori compaiono in tutte le pagine (footer incluso): cerca `info@esempio.it`, `+39 000 000 0000`, `Via Esempio` e sostituiscili. Le immagini in `assets/images/` sono illustrazioni dimostrative: sostituiscile con foto `.jpg` e aggiorna `src` e `alt`. Completa `privacy.html` con un professionista.

## Controllo link
```bash
python3 scripts/check-links.py
```
