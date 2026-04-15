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
  formationsCount: 1,
  satisfactionRate: 98,
  yearsExperience: 5,
};

export const FAQ_ITEMS = [
  {
    question: "Quels sont les prerequis pour la formation Power BI ?",
    answer:
      "Aucun prerequis technique n'est necessaire. Une connaissance de base d'Excel est un plus, mais pas obligatoire. La formation est concu pour les debutants comme pour ceux qui souhaitent approfondir leurs connaissances.",
  },
  {
    question: "Qu'est-ce que je vais apprendre dans cette formation ?",
    answer:
      "Vous apprendrez a connecter des sources de donnees, transformer et nettoyer vos donnees avec Power Query, creer des modeles de donnees, ecrire des formules DAX, et concevoir des tableaux de bord interactifs professionnels.",
  },
  {
    question: "Puis-je suivre la formation en visioconference ?",
    answer:
      "Oui, la formation est disponible en presentiel et en visioconference. Vous recevrez un lien de connexion avant la session et aurez acces aux memes contenus et exercices pratiques.",
  },
  {
    question: "Que se passe-t-il si la session est complete ?",
    answer:
      "Si la session est complete, vous pouvez vous pre-inscrire pour la prochaine session. Vous serez automatiquement inscrit(e) des qu'une place se libere ou pour la prochaine date disponible.",
  },
  {
    question: "Recevrai-je une certification apres la formation ?",
    answer:
      "Oui, une attestation de formation vous sera delivree a l'issue de la session. Cette attestation detaille les competences acquises en Power BI et peut etre utilisee pour votre developpement professionnel.",
  },
];

export const FEATURES = [
  {
    title: "Formateur Expert Power BI",
    description:
      "Notre formateur est certifie Microsoft et possede plus de 10 ans d'experience en Business Intelligence.",
    icon: "academic-cap",
  },
  {
    title: "Projets Reels",
    description:
      "Travaillez sur des cas pratiques bases sur des donnees reelles d'entreprise pour une experience concrete.",
    icon: "adjustments",
  },
  {
    title: "Suivi Post-Formation",
    description:
      "Beneficiez d'un accompagnement personnalise apres la formation pour repondre a vos questions.",
    icon: "support",
  },
  {
    title: "Satisfaction Garantie",
    description:
      "98% de nos apprenants recommandent notre formation Power BI. Votre reussite est notre priorite.",
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
