# MAM Cars - Gestion de Stock Automobile

Application web de gestion de stock automobile pour concession de voitures d'occasion.

## 🚀 Stack Technique

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: PostgreSQL
- **ORM**: Prisma
- **Authentification**: NextAuth.js
- **Déploiement**: Vercel
- **Icônes**: Lucide React

## 📋 Fonctionnalités

### Phase 1 - MVP
- ✅ Authentification (login/register)
- ✅ CRUD véhicules complet
- ✅ Gestion des interventions
- ✅ Dashboard avec statistiques
- ✅ Filtres et recherche
- ✅ Calcul automatique des marges
- ✅ Historique des modifications

### Phase 2 - Futures
- 📸 Upload de photos multiples
- 📊 Statistiques avancées
- 📤 Export de données
- 🔔 Notifications

## 🛠️ Installation

### Prérequis
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Étapes

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd mam_cars
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditez `.env` et configurez :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `NEXTAUTH_SECRET` : Générer avec `openssl rand -base64 32`
- `NEXTAUTH_URL` : URL de l'application (http://localhost:3000 en dev)

4. **Initialiser la base de données**
```bash
# Créer la base de données et appliquer les migrations
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

5. **Créer un utilisateur admin (optionnel)**
```bash
npx prisma studio
# Créer manuellement un utilisateur avec role="ADMIN"
```

6. **Lancer l'application**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
mam_cars/
├── app/
│   ├── (auth)/              # Pages d'authentification
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Pages protégées
│   │   ├── page.tsx         # Dashboard principal
│   │   ├── vehicules/       # Gestion véhicules
│   │   └── interventions/   # Gestion interventions
│   └── api/                 # API Routes
│       ├── auth/
│       ├── vehicules/
│       ├── interventions/
│       └── upload/
├── components/
│   ├── ui/                  # Composants UI réutilisables
│   ├── vehicules/           # Composants spécifiques véhicules
│   ├── interventions/       # Composants spécifiques interventions
│   └── dashboard/           # Composants dashboard
├── lib/
│   ├── prisma.ts           # Client Prisma singleton
│   ├── auth.ts             # Configuration NextAuth
│   └── utils.ts            # Utilitaires
└── prisma/
    ├── schema.prisma        # Schéma de base de données
    └── migrations/          # Migrations
```

## 🗄️ Schéma de Base de Données

### Models Principaux

- **User** : Utilisateurs de l'application (ADMIN/USER)
- **Vehicule** : Véhicules en stock
- **Intervention** : Réparations et maintenances
- **Photo** : Images des véhicules
- **Historique** : Traçabilité des modifications

### Enums

- **StatutVehicule** : EN_STOCK, EN_REPARATION, PRET_A_VENDRE, VENDU, RESERVE
- **TypeIntervention** : MECANIQUE, CARROSSERIE, CONTROLE_TECHNIQUE, etc.
- **StatutIntervention** : A_FAIRE, EN_COURS, TERMINE, ANNULE
- **Carburant** : ESSENCE, DIESEL, HYBRIDE, ELECTRIQUE, GPL
- **Transmission** : MANUELLE, AUTOMATIQUE, SEMI_AUTO

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linter
npm run lint

# Prisma Studio (interface DB)
npx prisma studio

# Créer une migration
npx prisma migrate dev --name <nom_migration>

# Réinitialiser la DB
npx prisma migrate reset
```

## 🔐 Authentification

L'application utilise NextAuth.js avec un provider Credentials.

- Les routes du dashboard sont protégées
- Deux rôles : ADMIN et USER
- Les mots de passe sont hashés avec bcryptjs

## 🎨 Design

- Interface épurée et professionnelle
- Responsive (mobile-first)
- Palette sobre (bleu/gris)
- Feedback visuel pour toutes les actions

## 📝 Conventions de Code

- TypeScript strict
- Composants en PascalCase
- Server Components par défaut
- Client Components uniquement si nécessaire
- Commentaires en français pour la logique métier
- Validation Zod pour toutes les entrées
- Gestion d'erreurs avec try/catch

## 🚀 Déploiement

### Vercel (recommandé)

1. Push le code sur GitHub
2. Importer le projet sur Vercel
3. Configurer les variables d'environnement
4. Déployer

### Base de données

- **Développement** : PostgreSQL local
- **Production** : Vercel Postgres ou autre provider

## 📄 Licence

Projet privé - Tous droits réservés

## 👥 Équipe

MAM Cars - Gestion interne

---

**Note** : Ce projet est en cours de développement. Phase 1 (MVP) en construction.

