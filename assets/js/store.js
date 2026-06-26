/* store.js — Gestion des données (localStorage) */

const STORE = {
  get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getOne: (key, id) => STORE.get(key).find(x => x.id == id) || null,
  remove: (key, id) => STORE.set(key, STORE.get(key).filter(x => x.id != id)),
};

/* ── Helpers dates ── */
function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function daysUntil(dateStr) {
  if (!dateStr) return 9999;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return Math.round((d - now) / 86400000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function countryFlag(pays) {
  const flags = {
    'canada': '🇨🇦', 'france': '🇫🇷', 'allemagne': '🇩🇪', 'états-unis': '🇺🇸',
    'etats-unis': '🇺🇸', 'royaume-uni': '🇬🇧', 'union européenne': '🇪🇺',
    'chine': '🇨🇳', 'japon': '🇯🇵', 'australie': '🇦🇺', 'pays-bas': '🇳🇱',
    'belgique': '🇧🇪', 'suisse': '🇨🇭', 'espagne': '🇪🇸', 'italie': '🇮🇹',
    'maroc': '🇲🇦', 'sénégal': '🇸🇳', 'côte d\'ivoire': '🇨🇮', 'bénin': '🇧🇯',
    'ghana': '🇬🇭', 'nigeria': '🇳🇬', 'afrique du sud': '🇿🇦',
  };
  return flags[pays.toLowerCase()] || '🌍';
}

/* ── Seed data ── */
function seedData() {
  if (localStorage.getItem('bourseup_v1_seeded')) return;

  STORE.set('bourses', [
    {
      id: 1, nom: 'Mastercard Foundation Scholars', pays: 'Canada',
      lien: 'https://mastercardfdn.org/all-programs/scholars/',
      desc: 'Bourse complète couvrant frais de scolarité, logement et billets d\'avion pour les étudiants africains talentueux et méritants.',
      debut: futureDate(-30), deadline: futureDate(12), statut: 'ouverte',
    },
    {
      id: 2, nom: 'Bourse Eiffel Excellence', pays: 'France',
      lien: 'https://www.campusfrance.org/fr/eiffel',
      desc: 'Programme d\'excellence du gouvernement français pour attirer les meilleurs étudiants étrangers en master et doctorat.',
      debut: futureDate(-20), deadline: futureDate(18), statut: 'ouverte',
    },
    {
      id: 3, nom: 'Erasmus Mundus', pays: 'Union Européenne',
      lien: 'https://erasmus-plus.ec.europa.eu',
      desc: 'Programme de bourses de l\'UE pour des études conjointes dans plusieurs universités européennes partenaires.',
      debut: futureDate(10), deadline: futureDate(45), statut: 'bientot',
    },
    {
      id: 4, nom: 'DAAD Excellence', pays: 'Allemagne',
      lien: 'https://www.daad.de',
      desc: 'Bourse du service allemand d\'échanges universitaires pour masters et doctorats dans les meilleures universités d\'Allemagne.',
      debut: futureDate(5), deadline: futureDate(60), statut: 'ouverte',
    },
    {
      id: 5, nom: 'Commonwealth Scholarship', pays: 'Royaume-Uni',
      lien: 'https://cscuk.fcdo.gov.uk',
      desc: 'Bourse pour ressortissants des pays du Commonwealth souhaitant poursuivre des études supérieures au Royaume-Uni.',
      debut: futureDate(-10), deadline: futureDate(5), statut: 'ouverte',
    },
    {
      id: 6, nom: 'Fulbright Program', pays: 'États-Unis',
      lien: 'https://foreign.fulbrightonline.org',
      desc: 'Programme phare du gouvernement américain pour les échanges universitaires internationaux depuis 1946.',
      debut: futureDate(-60), deadline: futureDate(-10), statut: 'fermee',
    },
  ]);

  STORE.set('documents', [
    { id: 1, nom: 'Passeport',            desc: 'Passeport valide 2024–2029',               statut: 'Disponible', pdfName: null, pdfData: null },
    { id: 2, nom: 'Acte de naissance',    desc: 'Acte de naissance légalisé et apostillé',  statut: 'Disponible', pdfName: null, pdfData: null },
    { id: 3, nom: 'Diplôme BAC',          desc: 'Diplôme du baccalauréat série C 2021',      statut: 'Disponible', pdfName: null, pdfData: null },
    { id: 4, nom: 'Relevés de notes L1–L3', desc: 'Relevés de notes des 3 années de licence', statut: 'Disponible', pdfName: null, pdfData: null },
    { id: 5, nom: 'CV académique',        desc: 'CV mis à jour – format Europass 2025',      statut: 'Disponible', pdfName: null, pdfData: null },
    { id: 6, nom: 'Lettre de motivation', desc: 'LM générique à personnaliser par bourse',   statut: 'En attente', pdfName: null, pdfData: null },
    { id: 7, nom: 'Attestation TOEFL',   desc: 'Score TOEFL iBT – en cours de passage',     statut: 'En attente', pdfName: null, pdfData: null },
    { id: 8, nom: 'Lettre de recommandation', desc: 'Lettre du Directeur de mémoire',        statut: 'En attente', pdfName: null, pdfData: null },
  ]);

  localStorage.setItem('bourseup_v1_seeded', '1');
}

