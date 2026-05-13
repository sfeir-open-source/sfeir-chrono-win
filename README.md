# Sfeir Chrono Win

Un jeu d'animation web ultra-réactif et hautement configurable, parfait pour des événements et des stands. Le but du jeu est d'arrêter un compteur défilant à toute vitesse au bon moment (sur un chiffre cible) pour gagner des lots.

## Caractéristiques
- **Moteur 100% Vanilla JS** performant basé sur `requestAnimationFrame`.
- **Thèmes dynamiques** : Possibilité de basculer instantanément l'esthétique du jeu (Matrix, Mayas, etc.).
- **Panneau d'administration sécurisé** : Configuration des lots, de la difficulté et du design à chaud.
- **Compatible USB** : Conçu pour se lancer et s'arrêter via la touche **Entrée** (ou bouton USB mappé sur Entrée).
- **Collecte de données native** : Un formulaire natif (remplaçant le Google Form) s'affiche en fin de partie pour enregistrer les informations des participants. Les données sont sauvegardées localement (IndexedDB) pour une sécurité maximale et peuvent être exportées en CSV via le panneau d'administration.

## Installation et Lancement

### 1. Prérequis
- [Node.js](https://nodejs.org/) installé sur votre machine.

### 2. Cloner et Installer
```bash
git clone <url-du-repo>
cd sfeir-chrono-win
npm install
```

### 3. Configuration (.env)
Avant de lancer le jeu, vous devez configurer le mot de passe de l'administration.
Copiez le fichier d'exemple fourni à la racine :
```bash
cp .env.sample .env
```
Éditez le fichier `.env` pour y définir votre propre mot de passe (ex: `VITE_ADMIN_PASSWORD=monmotdepassesecret`).

### 4. Lancer le serveur
```bash
npm run dev
```
Ouvrez le lien généré (généralement `http://localhost:3000`) dans votre navigateur.

## Guide d'Utilisation

### Jouer
- Appuyez sur **Entrée** pour démarrer le compteur.
- Appuyez de nouveau sur **Entrée** pour l'arrêter.
- Un message vous indiquera si vous avez gagné un lot.
- Appuyez encore sur **Entrée** pour ouvrir le formulaire de collecte (s'il est configuré), ou pour réinitialiser le jeu.
- Dans le formulaire, remplissez vos informations. Vous pouvez fermer la popup via le bouton **Fermer** ou la touche **Echap**.
  - En cas de fermeture accidentelle du formulaire, appuyez sur `Shift + F` pour le rouvrir.

### Raccourcis Clavier
- **Entrée** : Démarrer / Arrêter le compteur / Passer à l'écran suivant
- **Echap** : Fermer le formulaire ou le panneau des résultats
- **Shift + A** : Ouvrir le panneau d'administration
- **Shift + F** : Rouvrir manuellement le formulaire (si fermé par erreur)
- **Shift + L** : Ouvrir le panneau des résultats (tableau récapitulatif des participants)

### Administration
- Sur la page du jeu, tapez `Shift + A` sur votre clavier pour ouvrir le panneau d'administration caché.
- Saisissez votre mot de passe (celui du fichier `.env`).
- Vous pouvez y configurer :
  - **Export CSV** : Un bouton pour télécharger la liste complète des participants et leurs scores.
  - **Remise à zéro de la base** : Un bouton pour vider toutes les données collectées.
  - **Le chiffre cible** (le plafond idéal).
  - **Le diviseur de temps** (gère la vitesse de défilement du compteur).
  - **Le thème graphique** (ex: Matrix, Divinités Mayas, Générique).
  - **Les lots** : Définissez le nom du lot, s'il est caché (surprise) ou affiché au public, et la règle pour le gagner. La syntaxe est très flexible (ex: `10000`, ou `9998-10002`, ou `50,60,70`).
- Cliquez sur **Sauvegarder**, le jeu se mettra à jour et rechargera la page automatiquement !
