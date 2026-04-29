const STATE_IDLE = 'IDLE';
const STATE_RUNNING = 'RUNNING';
const STATE_FINISHED = 'FINISHED';

export default class GameEngine {
  constructor(theme) {
    this.theme = theme;
    this.state = STATE_IDLE;
    this.isRunning = false;
    this.startTime = 0;
    this.currentValue = 0;
    
    this.loadConfig();
    
    this.animationFrameId = null;
    
    // Bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.loop = this.loop.bind(this);
  }

  loadConfig() {
    const saved = localStorage.getItem('chrono-win-config');
    let config;
    if (saved) {
      try {
        config = JSON.parse(saved);
      } catch(e) {}
    }
    
    if (!config) {
      // Configuration par défaut si rien n'est sauvegardé
      config = {
        targetValue: 10000,
        timeDivider: 10,
        prizes: [
          { rule: "998-1002", name: 'Une peluche', isHidden: false, numbers: [998,999,1000,1001,1002] }
        ]
      };
    }
    
    this.targetValue = config.targetValue;
    this.timeDivider = config.timeDivider || 10;
    
    // Convert array of numbers to a Set for O(1) fast lookup
    this.prizes = (config.prizes || []).map(p => {
      let nums = p.numbers || [];
      // Rétrocompatibilité
      if (nums.length === 0 && p.min !== undefined) {
        for (let i = p.min; i <= p.max; i++) nums.push(i);
      }
      return {
        ...p,
        numbersSet: new Set(nums)
      };
    });
    
    // Met à jour l'affichage public des lots non-cachés
    const visiblePrizes = this.prizes.filter(p => !p.isHidden);
    this.theme.updatePrizesList(visiblePrizes);
  }

  // Appelé au démarrage de l'app
  init() {
    this.theme.init();
    
    // Écoute de la barre Espace ou bouton USB
    document.addEventListener('keydown', this.handleKeyDown);
  }

  startRun() {
    this.state = STATE_RUNNING;
    this.theme.hideMessage();
    this.startTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stopRun() {
    this.state = STATE_FINISHED;
    cancelAnimationFrame(this.animationFrameId);
    this.checkResult();
  }

  resetToIdle() {
    this.state = STATE_IDLE;
    this.currentValue = 0;
    this.theme.showStartScreen();
  }

  loop(timestamp) {
    if (this.state !== STATE_RUNNING) return;
    
    const elapsedMs = timestamp - this.startTime;
    
    // L'unité affichée dépend du diviseur (10ms par défaut = centième de seconde)
    this.currentValue = Math.floor(elapsedMs / this.timeDivider);
    
    // Mise à jour de l'UI
    this.theme.updateCounter(this.currentValue);
    
    // On boucle au prochain frame
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  handleKeyDown(event) {
    if (event.code === 'Space') {
      event.preventDefault(); // Empêche le scroll de la page
      
      if (this.state === STATE_IDLE) {
        this.startRun();
      } else if (this.state === STATE_RUNNING) {
        this.stopRun();
      } else if (this.state === STATE_FINISHED) {
        this.resetToIdle();
      }
    }
  }

  checkResult() {
    let wonPrize = null;
    let wonHidden = false;
    
    for (const prize of this.prizes) {
      if (prize.numbersSet && prize.numbersSet.has(this.currentValue)) {
        wonPrize = prize.name;
        wonHidden = prize.isHidden || false;
        break; 
      }
    }
    
    if (wonPrize) {
      this.theme.showVictory(wonPrize, wonHidden);
    } else {
      this.theme.showDefeat();
    }
  }
}
