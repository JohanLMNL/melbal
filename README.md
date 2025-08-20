# MelbalApp

Application de réservation pour les restaurants Melkior et Bal'tazar.

## Installation

```bash
npm install
```

## Configuration

L'application est configurée pour utiliser Supabase avec les paramètres suivants :
- URL: `https://datjoleofcjcpejnhddd.supabase.co`
- Clé publique intégrée dans `src/lib/supabase.ts`

## Création du compte admin

Avant la première utilisation, créez le compte admin en appelant l'API de seed :

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, créer le compte admin
curl -X POST http://localhost:3000/api/seed
```

Cela créera l'utilisateur admin :
- **Pseudo**: Johan
- **Email technique**: johan@app.local  
- **Mot de passe**: ChangeMe!123
- **Rôle**: admin

## Démarrage

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Tests

### 1. Connexion admin
- Aller sur `/auth/login`
- Pseudo: `Johan`
- Mot de passe: `ChangeMe!123`

### 2. Créer une réservation
- Aller sur `/reservations`
- Cliquer "Nouvelle réservation"
- Salle: Melkior
- Date: aujourd'hui
- Nom: Test Client
- Personnes: 4
- Sélectionner tables 3 et 5
- Valider

### 3. Tester la contrainte d'unicité
- Créer une nouvelle réservation
- Même salle/date
- Essayer de sélectionner la table 5 → devrait être indisponible

### 4. Marquer "arrivé"
- Cliquer le bouton "En attente" → devient "Arrivé"
- La ligne devient atténuée (opacité 40%)

### 5. Administration
- Aller sur `/admin/users`
- Voir la liste des utilisateurs
- Modifier un rôle (sauf le sien)

## Structure

- **Base de données**: Schéma `app` avec tables `profiles`, `tables`, `reservations`, `reservation_tables`
- **Auth**: Pseudo + mot de passe (email technique `<pseudo>@app.local`)
- **Rôles**: admin, server, porter
- **PWA**: Manifest et service worker configurés
- **UI**: shadcn/ui avec thème dark forcé

## Fonctionnalités

- ✅ Authentification par pseudo/mot de passe
- ✅ Gestion des réservations (CRUD)
- ✅ Sélection multi-tables avec vérification disponibilité
- ✅ Contrainte d'unicité par table/salle/date
- ✅ Statut "arrivé" avec interface toggle
- ✅ Filtrage par date et recherche par nom
- ✅ Administration des utilisateurs (admin uniquement)
- ✅ Interface responsive et accessible
- ✅ PWA avec manifest
- ✅ Mode dark global
