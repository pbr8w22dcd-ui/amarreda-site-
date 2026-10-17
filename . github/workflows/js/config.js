/* Configurazione del configuratore. Qui colleghi n8n. */
window.AMARREDA = {
  /* Chat: webhook n8n (nodo "Webhook", metodo POST). Vuoto = percorso guidato locale, senza AI.
     Richiesta:  { sessionId, message, brief, history }
     Risposta:   { reply: "testo", quickReplies: ["opz1","opz2"], brief: { chiave: "valore" } } */
  chatWebhook: "",
  /* Invio finale del modulo: webhook n8n (POST, JSON). Vuoto = apre il client email con il riepilogo. */
  formWebhook: "",
  email: "info@esempio.it"
};
