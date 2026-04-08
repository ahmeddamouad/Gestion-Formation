// Application constants

export const FORMATIONS_DATA = [
  {
    slug: "powerbi",
    titre: "Formation Power BI",
    description:
      "Maitrisez la visualisation de donnees et la business intelligence avec Power BI. Apprenez a creer des tableaux de bord interactifs, analyser vos donnees et prendre des decisions eclairees.",
    icon: "chart-bar",
  },
  {
    slug: "marketing",
    titre: "Formation Digital Marketing",
    description:
      "Strategies digitales, reseaux sociaux, SEO et campagnes publicitaires. Developpez votre presence en ligne et atteignez vos objectifs commerciaux.",
    icon: "megaphone",
  },
  {
    slug: "automatisation",
    titre: "Formation Automatisation & Fullstack Vibe Coding",
    description:
      "No-code, automatisation de workflows, et developpement fullstack moderne. Creez des applications completes sans ecrire des milliers de lignes de code.",
    icon: "cog",
  },
  {
    slug: "rh",
    titre: "Formation Ressources Humaines",
    description:
      "Gestion des talents, recrutement moderne et developpement organisationnel. Transformez votre departement RH avec les meilleures pratiques actuelles.",
    icon: "users",
  },
] as const;

export const LANDING_STATS = {
  totalLearners: 500,
  formationsCount: 4,
  satisfactionRate: 98,
  yearsExperience: 5,
};

export const FAQ_ITEMS = [
  {
    question: "Comment se deroule une formation en presentiel ?",
    answer:
      "Nos formations en presentiel se deroulent dans nos locaux equipes. Vous beneficiez d'un accompagnement personnalise avec nos formateurs experts, de supports de cours et d'exercices pratiques. Le groupe est limite a 15 personnes pour garantir une attention optimale.",
  },
  {
    question: "Puis-je suivre une formation en visioconference ?",
    answer:
      "Oui, toutes nos formations sont disponibles en visioconference. Vous recevrez un lien de connexion avant la session. Vous aurez acces aux memes contenus et pourrez interagir en direct avec le formateur et les autres participants.",
  },
  {
    question: "Que se passe-t-il si la session est complete ?",
    answer:
      "Si la session est complete, vous pouvez vous pre-inscrire pour la prochaine session. Vous serez automatiquement inscrit(e) des qu'une place se libere ou pour la prochaine date disponible.",
  },
  {
    question: "Quels sont les modes de paiement acceptes ?",
    answer:
      "Nous acceptons les virements bancaires, les cartes de credit et le financement par votre entreprise ou OPCO. Contactez-nous pour discuter des options de financement adaptees a votre situation.",
  },
  {
    question: "Recevrai-je une certification apres la formation ?",
    answer:
      "Oui, une attestation de formation vous sera delivree a l'issue de chaque session. Cette attestation detaille les competences acquises et peut etre utilisee pour votre developpement professionnel.",
  },
];

export const FEATURES = [
  {
    title: "Formateurs Experts",
    description:
      "Nos formateurs sont des professionnels avec plus de 10 ans d'experience dans leur domaine.",
    icon: "academic-cap",
  },
  {
    title: "Flexibilite Totale",
    description:
      "Choisissez entre presentiel et visio selon vos preferences et contraintes.",
    icon: "adjustments",
  },
  {
    title: "Suivi Personnalise",
    description:
      "Un accompagnement individuel pendant et apres la formation pour garantir votre reussite.",
    icon: "support",
  },
  {
    title: "Satisfaction Garantie",
    description:
      "98% de nos apprenants recommandent nos formations. Votre satisfaction est notre priorite.",
    icon: "badge-check",
  },
];

// Validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+212|0)[5-7][0-9]{8}$/,
  name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
};

// Error messages in French
export const ERROR_MESSAGES = {
  required: "Ce champ est obligatoire",
  invalidEmail: "Veuillez entrer une adresse email valide",
  invalidPhone:
    "Veuillez entrer un numero de telephone valide (ex: 0612345678)",
  invalidName: "Veuillez entrer un nom valide (2-50 caracteres)",
  serverError: "Une erreur est survenue. Veuillez reessayer.",
  alreadyRegistered: "Vous etes deja inscrit(e) a cette formation",
  formationNotFound: "Cette formation n'est pas disponible",
};

// Success messages in French
export const SUCCESS_MESSAGES = {
  registrationConfirmed:
    "Votre inscription a ete confirmee ! Vous recevrez un email de confirmation.",
  preregistrationConfirmed:
    "Votre pre-inscription a ete enregistree ! Nous vous contacterons des qu'une place sera disponible.",
};
