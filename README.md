# Sfeir Chrono Win

Un jeu d'animation web ultra-réactif et hautement configurable, parfait pour des événements et des stands. Le but du jeu est d'arrêter un compteur défilant à toute vitesse au bon moment (sur un chiffre cible) pour gagner des lots.

## Caractéristiques
- **Moteur 100% Vanilla JS** performant basé sur `requestAnimationFrame`.
- **Thèmes dynamiques** : Possibilité de basculer instantanément l'esthétique du jeu (Matrix, Mayas, etc.).
- **Panneau d'administration sécurisé** : Configuration des lots, de la difficulté et du design à chaud.
- **Compatible USB** : Conçu pour se lancer et s'arrêter via la touche **Espace**, idéal pour brancher un gros bouton poussoir "Buzzer" en USB.

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
- Appuyez sur **Espace** pour démarrer le compteur.
- Appuyez de nouveau sur **Espace** pour l'arrêter.
- Un message vous indiquera si vous avez gagné un lot.
- Appuyez encore sur **Espace** pour réinitialiser le jeu pour le joueur suivant.

### Administration
- Sur la page du jeu, tapez `Shift + A` sur votre clavier pour ouvrir le panneau d'administration caché.
- Saisissez votre mot de passe (celui du fichier `.env`).
- Vous pouvez y configurer :
  - **Le chiffre cible** (le plafond idéal).
  - **Le diviseur de temps** (gère la vitesse de défilement du compteur).
  - **Le thème graphique** (ex: Matrix, Divinités Mayas, Générique).
  - **Les lots** : Définissez le nom du lot, s'il est caché (surprise) ou affiché au public, et la règle pour le gagner. La syntaxe est très flexible (ex: `10000`, ou `9998-10002`, ou `50,60,70`).
- Cliquez sur **Sauvegarder**, le jeu se mettra à jour et rechargera la page automatiquement !
