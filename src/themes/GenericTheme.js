export default class GenericTheme {
  constructor() {
    this.loadCSS('src/themes/generic.css');
    this.counterElement = document.getElementById('counter');
    this.messageBox = document.getElementById('message-box');
    this.prizesDisplay = document.getElementById('prizes-display');
    this.prizesList = document.getElementById('prizes-list');
  }

  loadCSS(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  updatePrizesList(prizes) {
    if (!this.prizesDisplay || !this.prizesList) return;
    
    if (prizes.length === 0) {
      this.prizesDisplay.classList.add('hidden');
      return;
    }
    
    this.prizesDisplay.classList.remove('hidden');
    this.prizesList.innerHTML = '';
    
    prizes.forEach(prize => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${prize.name}</strong> <em>(Cible : ${prize.rule})</em>`;
      this.prizesList.appendChild(li);
    });
  }

  updateCounter(value) {
    if (this.counterElement) {
      this.counterElement.textContent = value;
    }
  }

  showStartScreen() {
    this.updateCounter(0);
    if (this.messageBox) {
      this.messageBox.textContent = "Appuyez sur Entrée pour lancer";
      this.messageBox.classList.remove('hidden');
    }
  }

  showReadyScreen() {
    this.updateCounter(0);
    if (this.messageBox) {
      this.messageBox.textContent = "Appuyez sur Entrée pour lancer le compteur";
      this.messageBox.classList.remove('hidden');
    }
  }

  showVictory(prizeName, isHidden = false) {
    if (this.messageBox) {
      if (isHidden) {
        this.messageBox.textContent = `Gagné ! Lot mystère : ${prizeName}`;
      } else {
        this.messageBox.textContent = `Gagné ! Lot : ${prizeName}`;
      }
      this.messageBox.classList.remove('hidden');
    }
  }

  showDefeat() {
    if (this.messageBox) {
      this.messageBox.textContent = "Perdu !";
      this.messageBox.classList.remove('hidden');
    }
  }

  hideMessage() {
    if (this.messageBox) {
      this.messageBox.classList.add('hidden');
    }
  }

  // Hook appelé à l'initialisation du thème
  init() {
    this.showStartScreen();
  }
}
