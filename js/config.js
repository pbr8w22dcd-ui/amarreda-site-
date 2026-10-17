/* Configurazione Amarreda. Qui colleghi n8n. Gli URL vuoti = funzione non ancora collegata. */
window.AMARREDA = {
  email: "info@esempio.it",

  /* LOGIN. Webhook n8n (POST, JSON).
     Richiesta:  { action: "login" | "register" | "reset", email, password, nome, consent }
     Risposta OK: { token: "...", name: "Mario", expiresIn: 28800 }   oppure   { message: "Controlla la tua email" }
     Errore:      HTTP 4xx con { error: "testo mostrato all'utente" }
     La password va cifrata (hash) in n8n o nel servizio di autenticazione, mai salvata in chiaro. */
  authWebhook: "",

  /* SOLO PER PROVA: true = accesso finto, senza alcun controllo. Mettere false prima del lancio. */
  demoAuth: false,

  /* CHAT AI (agente n8n). Riceve { token, sessionId, message, brief, history }
     e risponde { reply, quickReplies, brief }. Deve rispondere 401 se il token non è valido. */
  chatWebhook: "",

  /* RICHIESTA FINALE dal configuratore. Riceve { token, contact, brief, transcript, ... }. Deve verificare il token. */
  formWebhook: "",

  /* CANDIDATURE professionisti e rivenditori (pubbliche, senza token). */
  partnerWebhook: ""
};
