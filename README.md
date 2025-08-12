# 🚧 TrackPro - Gestion de Projets de Construction

TrackPro est une plateforme complète de gestion de projets de construction. Elle permet de gérer les projets, les membres, les tâches, les équipements, les matériaux, les affectations et les équipes. Le backend est développé avec **NestJS**, en architecture modulaire, et il est prêt pour l'intégration d'une interface web et/ou mobile.

---

## 📁 Structure du projet

backend/
├── auth/ # Authentification & autorisation (JWT, rôles)
├── users/ # Gestion des utilisateurs
├── projects/ # Projets de construction
├── tasks/ # Tâches planifiées
├── equipe/ # Équipes spécialisées (électricité, béton...)
├── equipement/ # Équipements (coût, statut, suivi)
├── materiau/ # Matériaux (stock, commande fournisseur)
├── affectation-membre-projet/ # Affectations des membres aux projets
├── gpt/ # Intégration GPT (analyse ou génération)
├── main.ts
└── app.module.ts


---

## 🚀 Installation & Lancement

### 🛠️ Prérequis

- Node.js ≥ 18.x
- PostgreSQL (ou autre DB compatible TypeORM)
- NestJS CLI : `npm i -g @nestjs/cli`
- Docker (optionnel pour conteneurisation)

### ⚙️ Installation

Créer un fichier `.env` :

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=trackpro
JWT_SECRET=your_jwt_secret

### ⚙️ Variables d’environnement

 # 1. Cloner le projet
git clone https://github.com/votre-compte/trackpro.git
cd trackpro/backend

# 2. Installer les dépendances
npm install

# 3. Démarrer le serveur
npm run start:dev

### ⚙️ Tests

# Exécuter tous les tests unitaires
npm run test


📌 Fonctionnalités principales
✅ Authentification avec JWT
✅ Rôles : ADMIN, CHEF_PROJET, MEMBRE_EQUIPE, etc.
✅ Création & gestion de projets
✅ Planification des tâches
✅ Gestion des équipements (coût, statut, stock)
✅ Gestion des matériaux (stock, seuil, commandes automatiques)
✅ Affectation des membres aux projets
✅ Notifications internes (approvisionnement, alertes)
✅ Intégration GPT (futur)



