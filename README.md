# Gestion Formation

Application web de gestion des inscriptions aux formations professionnelles.

## Fonctionnalites

### Page d'accueil publique
- Presentation des 4 formations disponibles (Power BI, Digital Marketing, Automatisation & Fullstack, Ressources Humaines)
- Systeme d'inscription avec formulaire de contact
- Affichage en temps reel des places disponibles
- Systeme de pre-inscription automatique lorsqu'une session est complete
- Interface entierement en francais

### Tableau de bord administrateur
- Authentification securisee par mot de passe
- Statistiques en temps reel (inscriptions totales, hebdomadaires, sessions completes, pre-inscriptions)
- Gestion de la capacite des formations (+/- places)
- Activation/desactivation des formations
- Liste detaillee des inscrits par formation
- Export CSV des inscriptions
- Mises a jour en temps reel via Supabase

### Notifications automatiques
A chaque nouvelle inscription, trois notifications sont envoyees en parallele :
- **WhatsApp** : Message au numero de l'administrateur via Twilio
- **Email** : Email HTML detaille via Resend
- **Google Sheets** : Ajout d'une ligne dans un tableur Google

## Technologies utilisees

- **Framework** : Next.js 14 (App Router)
- **Base de donnees** : Supabase (PostgreSQL avec real-time)
- **Stylisation** : Tailwind CSS
- **Notifications** : Twilio (WhatsApp), Resend (Email), Google Sheets API
- **Authentification** : JWT avec cookies HTTP-only

## Installation

### Prerequisites

- Node.js 18+ installe
- Compte Supabase (gratuit)
- Compte Twilio (optionnel, pour WhatsApp)
- Compte Resend (optionnel, pour Email)
- Compte Google Cloud (optionnel, pour Google Sheets)

### Etapes d'installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd gestion-formation
   ```

2. **Installer les dependances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   Editez `.env.local` et remplissez les valeurs (voir section Configuration).

4. **Configurer la base de donnees Supabase**

   a. Creez un nouveau projet sur [supabase.com](https://supabase.com)

   b. Executez le script de migration :
   ```bash
   # Via le SQL Editor de Supabase (recommande)
   # Copiez le contenu de supabase/migrations/001_init.sql
   # et executez-le dans l'editeur SQL
   ```

   c. Executez le script de seed :
   ```bash
   # Copiez le contenu de supabase/seed.sql
   # et executez-le dans l'editeur SQL
   ```

5. **Lancer le serveur de developpement**
   ```bash
   npm run dev
   ```

   L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Configuration

### Supabase

1. Creez un projet sur [supabase.com](https://supabase.com)
2. Dans Settings > API, recuperez :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Authentification Admin

- `ADMIN_PASSWORD` : Mot de passe pour acceder a /admin
- `JWT_SECRET` : Chaine aleatoire d'au moins 32 caracteres

### Twilio (WhatsApp)

1. Creez un compte sur [twilio.com](https://twilio.com)
2. Activez le sandbox WhatsApp ou achetez un numero
3. Recuperez vos identifiants dans la console

### Resend (Email)

1. Creez un compte sur [resend.com](https://resend.com)
2. Verifiez votre domaine d'envoi
3. Creez une cle API

### Google Sheets

1. Creez un projet sur [console.cloud.google.com](https://console.cloud.google.com)
2. Activez l'API Google Sheets
3. Creez un compte de service et telechargez le fichier JSON
4. Partagez votre feuille avec l'email du compte de service

## Structure du projet

```
gestion-formation/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Page d'accueil
│   │   ├── layout.tsx                  # Layout racine
│   │   ├── globals.css                 # Styles globaux
│   │   ├── api/                        # Routes API
│   │   │   ├── register/               # Inscription
│   │   │   └── admin/                  # API admin
│   │   └── admin/                      # Pages admin
│   │       ├── page.tsx                # Tableau de bord
│   │       ├── layout.tsx              # Layout admin
│   │       └── login/                  # Page de connexion
│   ├── components/
│   │   ├── landing/                    # Composants page d'accueil
│   │   ├── admin/                      # Composants admin
│   │   └── ui/                         # Composants UI reutilisables
│   ├── lib/
│   │   ├── supabase/                   # Clients Supabase
│   │   ├── notifications/              # Services de notification
│   │   ├── utils/                      # Utilitaires
│   │   └── constants.ts                # Constantes
│   ├── hooks/                          # Hooks React personnalises
│   └── types/                          # Types TypeScript
├── supabase/
│   ├── migrations/001_init.sql         # Schema de base de donnees
│   └── seed.sql                        # Donnees initiales
├── .env.example                        # Template variables d'environnement
└── README.md                           # Ce fichier
```

## Commandes disponibles

```bash
npm run dev          # Serveur de developpement
npm run build        # Build de production
npm run start        # Demarrer en production
npm run lint         # Verification ESLint
```

## Deploiement

### Vercel (recommande)

1. Connectez votre repo Github a [vercel.com](https://vercel.com)
2. Configurez les variables d'environnement dans le dashboard Vercel
3. Deploiement automatique a chaque push

### Autres plateformes

L'application peut etre deployee sur n'importe quelle plateforme supportant Next.js :
- Netlify
- Railway
- Render
- Self-hosted (Docker)

## Design

### Couleurs

- **Fond principal** : #090E1A (bleu marine fonce)
- **Cartes** : #111827
- **Accent** : #00C896 (vert/turquoise)
- **Avertissement** : #F59E0B (ambre)
- **Erreur** : #EF4444 (rouge)

### Typographie

- **Titres** : Bricolage Grotesque (Google Fonts)
- **Corps** : DM Sans (Google Fonts)

## Licence

Ce projet est prive et destine a un usage interne uniquement.

## Support

Pour toute question ou probleme, contactez l'equipe de developpement.
