# Sfeir Chrono Win - Contexte IA

## Objectif du Projet
"Chrono Win" est un jeu web hautement configurable, basé sur un système de thèmes, où un compteur s'incrémente extrêmement rapidement. Le joueur doit arrêter le compteur en appuyant sur la touche "Espace" (ou un bouton USB mappé sur Espace). S'il s'arrête sur un chiffre spécifique (ou une plage de chiffres), il remporte un lot.

## Stack Technique
- **Frontend** : Vanilla HTML / CSS / JavaScript. Aucun framework UI (React, Vue, etc. sont strictement interdits).
- **Outillage** : Vite (configuration minimale, utilisé pour le serveur de développement, le chargement du fichier `.env` et les imports dynamiques).
- **Stockage** : `localStorage` pour sauvegarder la configuration du jeu (chiffre cible, diviseur de temps, lots, thème actif).

## Architecture & Principes
1. **Séparation Moteur / Thème** : La logique est strictement séparée de la présentation.
   - `src/engine/GameEngine.js` : Boucle principale du jeu utilisant `requestAnimationFrame`, machine à états (IDLE, RUNNING, FINISHED).
   - `src/engine/AdminPanel.js` : Panneau de configuration protégé par mot de passe (accessible via `Shift + A`), parsing complexe des règles de lots, validation des conflits.
   - `src/themes/` : Contient les thèmes visuels. Tous les thèmes doivent hériter de `src/themes/GenericTheme.js`.
2. **Thèmes Dynamiques** : Les thèmes sont importés dynamiquement dans `src/main.js` en fonction de la configuration. Cela empêche les conflits CSS, car Vite injecte uniquement le CSS du thème actif.

## Commandes Importantes
- Installer les dépendances : `npm install`
- Lancer le serveur de développement : `npm run dev`
- Builder pour la production : `npm run build`

## Panneau d'Administration
- Raccourci : `Shift + A`
- Mot de passe : Lu depuis la variable `VITE_ADMIN_PASSWORD` dans le fichier `.env`.
