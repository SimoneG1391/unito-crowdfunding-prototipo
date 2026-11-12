/* Dati di esempio del prototipo (campagne di fantasia). Nessuna richiesta di rete: tutto è qui. */
window.TEMI = {
  ambiente:   { nome: "Ambiente",   colore: "#2f7d5b" },
  salute:     { nome: "Salute",     colore: "#8a4b7d" },
  tecnologia: { nome: "Tecnologia", colore: "#2f6fa3" },
  societa:    { nome: "Società",    colore: "#b0602a" }
};

window.CAMPAGNE = [
  {
    id: "aria", titolo: "Aria pulita in classe", tema: "ambiente", stato: "in-corso",
    sottotitolo: "Sensori low-cost per misurare la qualità dell'aria in 12 scuole medie di Torino",
    raccolti: 6480, obiettivo: 9000, sostenitori: 142, giorni: 18, inizio: "2026-10-01",
    dipartimento: "Dipartimento di Chimica",
    responsabile: { nome: "Laura Bertone", ruolo: "Ricercatrice in Chimica ambientale", email: "laura.bertone@unito.it", iniziali: "LB" },
    team: ["Laura Bertone", "Paolo Giraudo (dottorando)", "Sara Mollo (tecnica di laboratorio)"],
    sintesi: "Installiamo 40 sensori nelle aule di 12 scuole medie per misurare CO₂ e polveri sottili. I dati saranno pubblici e aiuteranno le scuole a decidere quando e come aerare le classi.",
    descrizione: [
      "Nelle aule affollate la CO₂ supera spesso i valori consigliati, con effetti su attenzione e benessere degli studenti. Oggi però le scuole non hanno strumenti per misurarla.",
      "Con sensori a basso costo costruiti in laboratorio misureremo per un anno scolastico CO₂, PM2.5, temperatura e umidità. Ogni scuola riceverà un cruscotto semplice e un report finale con consigli pratici.",
      "Studenti e insegnanti parteciperanno alla lettura dei dati con due laboratori per ogni scuola."
    ],
    fondi: [["40 sensori (componenti e assemblaggio)", 4800], ["Installazione e manutenzione in 12 scuole", 1800], ["Analisi dei dati e report pubblici", 1900], ["Commissioni sui pagamenti", 500]],
    impatto: [[10, "una settimana di misurazioni in un'aula"], [25, "il kit di montaggio di un sensore"], [50, "un laboratorio con una classe"], [120, "un sensore completo installato"]],
    aggiornamenti: [
      { data: "2026-11-04", titolo: "Superato il 70% dell'obiettivo", testo: "Grazie a 142 sostenitori abbiamo raccolto più di 6.000 €. Le prime 5 scuole hanno confermato le date di installazione." },
      { data: "2026-10-15", titolo: "Il primo prototipo funziona", testo: "Il sensore di prova installato nel nostro laboratorio ha registrato dati stabili per due settimane." }
    ],
    ringraziamento: "Grazie! Con il tuo contributo le aule di Torino saranno un po' più sane. — Laura e il team"
  },
  {
    id: "rare", titolo: "Dati contro le malattie rare", tema: "salute", stato: "in-corso",
    sottotitolo: "Un algoritmo predittivo per anticipare la diagnosi di tre malattie rare pediatriche",
    raccolti: 11200, obiettivo: 15000, sostenitori: 203, giorni: 25, inizio: "2026-10-10",
    dipartimento: "Dipartimento di Informatica · Scienze della Sanità pubblica e pediatriche",
    responsabile: { nome: "Davide Ferrero", ruolo: "Professore associato di Informatica", email: "davide.ferrero@unito.it", iniziali: "DF" },
    team: ["Davide Ferrero", "Giulia Sacco (pediatra)", "Ahmed Rahimi (data scientist)"],
    sintesi: "Addestriamo un modello su dati clinici anonimi per segnalare ai medici i casi sospetti con mesi di anticipo. I fondi coprono calcolo, anonimizzazione dei dati e validazione clinica.",
    descrizione: [
      "Una malattia rara viene diagnosticata in media dopo 4 anni. Anticipare la diagnosi significa iniziare prima le cure.",
      "Il modello verrà validato insieme a un ospedale pediatrico torinese e il codice sarà pubblicato con licenza aperta."
    ],
    fondi: [["Server di calcolo (12 mesi)", 6000], ["Anonimizzazione e sicurezza dei dati", 4000], ["Validazione clinica", 4200], ["Commissioni sui pagamenti", 800]],
    impatto: [[10, "un'ora di calcolo per addestrare il modello"], [25, "l'anonimizzazione di 50 cartelle cliniche"], [50, "una licenza software per il laboratorio"], [150, "una settimana di validazione clinica"]],
    aggiornamenti: [{ data: "2026-11-02", titolo: "200 sostenitori!", testo: "Abbiamo superato i 200 sostenitori. Grazie alla rete Alumni UniTO per il passaparola." }],
    ringraziamento: "Grazie per aver scelto di sostenere la ricerca sulle malattie rare. — Davide e il team"
  },
  {
    id: "patchlab", titolo: "PatchLab: cerotti intelligenti", tema: "salute", stato: "conclusa",
    sottotitolo: "Cerotti con sensori che segnalano le infezioni delle ferite croniche",
    raccolti: 20750, obiettivo: 20000, sostenitori: 388, giorni: 0, inizio: "2026-05-01",
    dipartimento: "Dipartimento di Scienza e Tecnologia del Farmaco",
    responsabile: { nome: "Elisa Martini", ruolo: "Ricercatrice in Tecnologie farmaceutiche", email: "elisa.martini@unito.it", iniziali: "EM" },
    team: ["Elisa Martini", "Luca Rinaldi (ingegnere biomedico)"],
    sintesi: "Un cerotto che cambia colore quando la ferita si infetta. La raccolta è conclusa e il progetto è nella fase di sperimentazione.",
    descrizione: ["Le ferite croniche colpiscono soprattutto le persone anziane. Riconoscere presto un'infezione evita ricoveri e terapie pesanti."],
    fondi: [["Materiali e sensori", 9000], ["Prototipi e test di laboratorio", 8000], ["Pubblicazione dei risultati", 2200], ["Commissioni sui pagamenti", 1550]],
    impatto: [[10, "un cerotto di prova"], [25, "un test di laboratorio"], [50, "dieci prototipi"], [100, "un ciclo completo di test"]],
    aggiornamenti: [
      { data: "2026-11-06", titolo: "Primi test su campioni reali", testo: "I prototipi hanno riconosciuto correttamente 9 infezioni su 10 nei campioni di laboratorio. Prossimo passo: la richiesta al comitato etico." },
      { data: "2026-09-20", titolo: "Materiali acquistati", testo: "Con i fondi raccolti abbiamo acquistato i sensori e avviato la produzione dei primi 200 cerotti." },
      { data: "2026-07-31", titolo: "Obiettivo raggiunto!", testo: "Abbiamo raccolto 20.750 € grazie a 388 persone. Grazie!" }
    ],
    risultati: "200 prototipi prodotti; 9 infezioni su 10 riconosciute nei test di laboratorio.",
    ringraziamento: "Grazie! — Elisa e il team"
  },
  {
    id: "orti", titolo: "Orti in Ateneo", tema: "ambiente", stato: "in-corso",
    sottotitolo: "Un orto didattico e condiviso al Campus Luigi Einaudi, curato da studenti",
    raccolti: 2100, obiettivo: 5000, sostenitori: 96, giorni: 32, inizio: "2026-10-20",
    dipartimento: "Associazione studentesca Green UniTO · Dip. di Scienze agrarie",
    responsabile: { nome: "Marta Dellavalle", ruolo: "Studentessa, presidente di Green UniTO", email: "greenunito@unito.it", iniziali: "MD" },
    team: ["Marta Dellavalle", "Dip. di Scienze agrarie (tutor scientifico)"],
    sintesi: "Trasformiamo 300 m² di prato in un orto didattico aperto a studenti e quartiere, con laboratori gratuiti sulla coltivazione sostenibile.",
    descrizione: ["L'orto sarà curato da un gruppo di 30 volontari e ospiterà laboratori mensili aperti a tutti."],
    fondi: [["Cassoni, terra e attrezzi", 2600], ["Impianto di irrigazione a goccia", 1500], ["Laboratori (materiali)", 600], ["Commissioni sui pagamenti", 300]],
    impatto: [[5, "una bustina di semi biologici"], [10, "un attrezzo per i volontari"], [25, "un metro di cassone"], [50, "un laboratorio aperto al quartiere"]],
    aggiornamenti: [{ data: "2026-10-28", titolo: "Il prato è stato misurato", testo: "Abbiamo il via libera dal Campus. Ora tocca a voi!" }],
    ringraziamento: "Grazie! Ti aspettiamo alla prima semina. — Green UniTO"
  },
  {
    id: "stem", titolo: "Borse per giovani ricercatrici STEM", tema: "societa", stato: "in-corso",
    sottotitolo: "Due borse di 6 mesi per laureate magistrali in materie scientifiche",
    raccolti: 7900, obiettivo: 12000, sostenitori: 121, giorni: 40, inizio: "2026-10-05",
    dipartimento: "Comitato Unico di Garanzia · Scuola di Scienze della Natura",
    responsabile: { nome: "Francesca Gallo", ruolo: "Professoressa di Fisica", email: "francesca.gallo@unito.it", iniziali: "FG" },
    team: ["Francesca Gallo", "Comitato Unico di Garanzia"],
    sintesi: "Finanziamo due borse di ricerca per ridurre il divario di genere nelle carriere scientifiche.",
    descrizione: ["Le borse saranno assegnate con un bando pubblico; la commissione pubblicherà i criteri e gli esiti."],
    fondi: [["Due borse di ricerca da 6 mesi", 11200], ["Commissioni sui pagamenti", 800]],
    impatto: [[10, "un'ora di tutoraggio"], [25, "un libro di testo"], [50, "un giorno di ricerca"], [200, "una settimana di borsa"]],
    aggiornamenti: [],
    ringraziamento: "Grazie per aver investito nel talento delle ricercatrici. — Francesca"
  },
  {
    id: "mano", titolo: "Un robot per la riabilitazione della mano", tema: "tecnologia", stato: "in-corso",
    sottotitolo: "Un guanto robotico stampato in 3D per la riabilitazione dopo un ictus",
    raccolti: 4400, obiettivo: 10000, sostenitori: 77, giorni: 30, inizio: "2026-10-25",
    dipartimento: "Dipartimento di Neuroscienze",
    responsabile: { nome: "Andrea Costa", ruolo: "Ricercatore in Bioingegneria", email: "andrea.costa@unito.it", iniziali: "AC" },
    team: ["Andrea Costa", "Chiara Novero (fisioterapista)"],
    sintesi: "Un guanto robotico economico che permette di proseguire la riabilitazione a casa.",
    descrizione: ["Il prototipo costerà meno di 300 € contro i 5.000 € dei dispositivi commerciali."],
    fondi: [["Stampa 3D e motori", 5000], ["Test con 20 pazienti", 4300], ["Commissioni sui pagamenti", 700]],
    impatto: [[10, "un motore"], [25, "una stampa 3D di prova"], [50, "una sessione di test"], [100, "un guanto completo"]],
    aggiornamenti: [],
    ringraziamento: "Grazie! — Andrea e il team"
  },
  {
    id: "api", titolo: "Api in città", tema: "ambiente", stato: "conclusa",
    sottotitolo: "Arnie sensorizzate per studiare la salute delle api a Torino",
    raccolti: 8300, obiettivo: 8000, sostenitori: 164, giorni: 0, inizio: "2025-04-01",
    dipartimento: "Dipartimento di Scienze della Vita e Biologia dei Sistemi",
    responsabile: { nome: "Roberto Viale", ruolo: "Ricercatore in Zoologia", email: "roberto.viale@unito.it", iniziali: "RV" },
    team: ["Roberto Viale"],
    sintesi: "Dieci arnie con sensori in parchi cittadini per monitorare la salute delle api.",
    descrizione: ["Il progetto si è concluso nel 2026 con la pubblicazione dei dati."],
    fondi: [["10 arnie sensorizzate", 5500], ["Analisi di laboratorio", 2100], ["Commissioni sui pagamenti", 400]],
    impatto: [[10, "un sensore di temperatura"], [25, "un'analisi di laboratorio"], [50, "un telaio"], [100, "metà arnia"]],
    aggiornamenti: [{ data: "2026-06-12", titolo: "Pubblicati i risultati", testo: "I dati di un anno sono online, con una mappa della salute delle api nei parchi." }],
    risultati: "10 arnie installate, 1 anno di dati pubblici, 2 articoli scientifici.",
    ringraziamento: "Grazie! — Roberto"
  },
  {
    id: "biblioteca", titolo: "Biblioteca accessibile", tema: "societa", stato: "non-raggiunta",
    sottotitolo: "Postazioni e libri in formato accessibile per studenti con disabilità visive",
    raccolti: 3100, obiettivo: 6000, sostenitori: 58, giorni: 0, inizio: "2026-03-01",
    dipartimento: "Sistema bibliotecario di Ateneo",
    responsabile: { nome: "Irene Bosio", ruolo: "Bibliotecaria", email: "irene.bosio@unito.it", iniziali: "IB" },
    team: ["Irene Bosio"],
    sintesi: "La campagna non ha raggiunto l'obiettivo: come previsto dalla regola \"tutto o niente\", i 3.100 € sono stati restituiti ai sostenitori.",
    descrizione: ["Il progetto verrà riproposto nel 2027 con un obiettivo ridotto."],
    fondi: [["Postazioni con sintesi vocale", 4000], ["Libri in formato accessibile", 1600], ["Commissioni sui pagamenti", 400]],
    impatto: [], aggiornamenti: [{ data: "2026-05-05", titolo: "Fondi restituiti", testo: "Tutti i contributi sono stati rimborsati entro 10 giorni lavorativi." }],
    risultati: "Obiettivo non raggiunto: contributi restituiti a 58 sostenitori.",
    ringraziamento: ""
  }
];
