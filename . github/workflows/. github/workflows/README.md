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

## Collegare il configuratore a n8n (`js/config.js`)
- `chatWebhook`: URL del nodo Webhook n8n (POST) che alimenta l’agente AI. Riceve `{ sessionId, message, brief, history }` e risponde `{ reply, quickReplies, brief }`. Se vuoto, la chat segue un percorso guidato di 5 domande, senza AI.
- `formWebhook`: URL del Webhook che riceve la richiesta finale (JSON con contatti, riepilogo e trascrizione). Se vuoto, il modulo apre la mail con il riepilogo.
- Nel Webhook n8n abilita CORS (*Options → Allowed Origins*) con il dominio del sito.
- Non inserire mai chiavi API nel codice: stanno in n8n.

## Contenuti da sostituire
Email, telefono e indirizzo provvisori compaiono in tutte le pagine (footer incluso): cerca `info@esempio.it`, `+39 000 000 0000`, `Via Esempio` e sostituiscili. Le immagini in `assets/images/` sono illustrazioni dimostrative: sostituiscile con foto `.jpg` e aggiorna `src` e `alt`. Completa `privacy.html` con un professionista.

## Controllo link
```bash
python3 scripts/check-links.py
```
