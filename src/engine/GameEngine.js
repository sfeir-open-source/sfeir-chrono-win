import Database from './Database.js';

const STATE_IDLE = 'IDLE';
const STATE_RUNNING = 'RUNNING';
const STATE_FINISHED = 'FINISHED';
const STATE_FORM = 'FORM';
const STATE_RESULTS = 'RESULTS';
const STATE_READY = 'READY';

export default class GameEngine {
  constructor(theme) {
    this.theme = theme;
    this.state = STATE_IDLE;
    this.isRunning = false;
    this.startTime = 0;
    this.currentValue = 0;
    this.db = new Database();
    this.pendingParticipantData = null;
    this.hasSubmittedForm = false;
    
    this.loadConfig();
    
    this.animationFrameId = null;
    
    // Bindings
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.loop = this.loop.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.closeResults = this.closeResults.bind(this);
  }

  getAdminPassword() {
    const envPassword = (typeof import.meta.env !== 'undefined' && import.meta.env) ? import.meta.env.VITE_ADMIN_PASSWORD : null;
    return localStorage.getItem('chrono-win-admin-password') || envPassword || 'sfeir';
  }

  checkAdminPassword(password) {
    return password === this.getAdminPassword();
  }

  saveAdminPassword(newPassword) {
    if (newPassword !== undefined && newPassword.trim() !== '') {
      localStorage.setItem('chrono-win-admin-password', newPassword);
    }
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
    this.db.init().catch(console.error);
    
    // Écoute de la barre Espace ou bouton USB
    document.addEventListener('keydown', this.handleKeyDown);

    const closeBtn = document.getElementById('close-form-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (this.state === STATE_FORM) {
          this.skipFormAndPlay();
        } else {
          this.closeForm();
        }
      });
    }

    const closeResultsBtn = document.getElementById('close-results-btn');
    if (closeResultsBtn) {
      closeResultsBtn.addEventListener('click', this.closeResults);
    }

    const nativeForm = document.getElementById('native-form');
    if (nativeForm) {
      nativeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        this.pendingParticipantData = {
          nom: document.getElementById('form-nom').value,
          prenom: document.getElementById('form-prenom').value,
          email: document.getElementById('form-email').value,
          telephone: document.getElementById('form-telephone').value,
          formation: document.getElementById('form-formation').checked,
          opportunite: document.getElementById('form-opportunite').checked
        };
        this.hasSubmittedForm = true;
        
        nativeForm.reset();
        
        const popup = document.getElementById('form-popup');
        if (popup) popup.classList.add('hidden');
        
        this.prepareRun();
      });
    }
  }

  skipFormAndPlay() {
    this.pendingParticipantData = null;
    this.hasSubmittedForm = false;
    
    const nativeForm = document.getElementById('native-form');
    if (nativeForm) nativeForm.reset();
    
    const popup = document.getElementById('form-popup');
    if (popup) popup.classList.add('hidden');
    
    this.prepareRun();
  }

  prepareRun() {
    this.state = STATE_READY;
    this.currentValue = 0;
    this.theme.updateCounter(0);
    this.theme.showReadyScreen();
  }

  startRun() {
    this.state = STATE_RUNNING;
    this.theme.hideMessage();
    this.startTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  async stopRun() {
    this.state = STATE_FINISHED;
    cancelAnimationFrame(this.animationFrameId);
    this.checkResult();
    
    if (this.hasSubmittedForm && this.pendingParticipantData) {
      const data = {
        score: this.currentValue,
        ...this.pendingParticipantData
      };
      try {
        await this.db.saveParticipant(data);
      } catch (err) {
        console.error("Erreur lors de l'enregistrement automatique du score:", err);
      }
      this.hasSubmittedForm = false;
      this.pendingParticipantData = null;
    }
  }

  resetToIdle() {
    this.state = STATE_IDLE;
    this.currentValue = 0;
    this.pendingParticipantData = null;
    this.hasSubmittedForm = false;
    this.theme.showStartScreen();
  }

  openForm() {
    this.state = STATE_FORM;
    const popup = document.getElementById('form-popup');
    const scoreInput = document.getElementById('form-score');
    
    if (popup && scoreInput) {
      scoreInput.value = this.currentValue;
      popup.classList.remove('hidden');
    } else {
      this.resetToIdle();
    }
  }

  closeForm() {
    const popup = document.getElementById('form-popup');
    if (popup) popup.classList.add('hidden');
    
    this.resetToIdle();
  }

  async openResults() {
    this.state = STATE_RESULTS;
    const popup = document.getElementById('results-popup');
    const tbody = document.querySelector('#results-table tbody');
    
    if (popup && tbody) {
      try {
        const participants = await this.db.getAllParticipants();
        
        // Calculate lot for each
        const enhancedParticipants = participants.map(p => {
          let wonPrize = "Aucun";
          for (const prize of this.prizes) {
            if (prize.numbersSet && prize.numbersSet.has(parseInt(p.score, 10))) {
              wonPrize = prize.name;
              break; 
            }
          }
          return { ...p, lot: wonPrize };
        });
        
        // Sort: Lot gagné (ceux qui ont gagné en premier), puis Score, puis Date
        enhancedParticipants.sort((a, b) => {
          const aWon = a.lot !== "Aucun";
          const bWon = b.lot !== "Aucun";
          
          if (aWon && !bWon) return -1;
          if (!aWon && bWon) return 1;
          
          // Si les deux ont gagné ou les deux n'ont pas gagné, on trie par score
          const scoreDiff = parseInt(a.score, 10) - parseInt(b.score, 10);
          if (scoreDiff !== 0) return scoreDiff;
          
          // Si même score, on trie par date
          return new Date(a.date) - new Date(b.date);
        });
        
        // Render
        tbody.innerHTML = enhancedParticipants.map(p => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 0.5rem;">${new Date(p.date).toLocaleString()}</td>
            <td style="padding: 0.5rem; font-weight: bold;">${p.score}</td>
            <td style="padding: 0.5rem; font-weight: ${p.lot !== 'Aucun' ? 'bold' : 'normal'}; color: ${p.lot !== 'Aucun' ? '#4CAF50' : '#333'}">${p.lot}</td>
            <td style="padding: 0.5rem;">${p.nom}</td>
            <td style="padding: 0.5rem;">${p.prenom}</td>
            <td style="padding: 0.5rem;">${p.telephone}</td>
            <td style="padding: 0.5rem;">${p.email}</td>
          </tr>
        `).join('');
        
        popup.classList.remove('hidden');
      } catch (err) {
        console.error("Erreur chargement résultats", err);
        alert("Impossible de charger les résultats.");
        this.resetToIdle();
      }
    } else {
      this.resetToIdle();
    }
  }

  closeResults() {
    const popup = document.getElementById('results-popup');
    if (popup) popup.classList.add('hidden');
    this.resetToIdle();
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
    // Ne pas déclencher si on est dans un champ de saisie
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.key === 'Escape') {
      if (this.state === STATE_FORM) {
        this.skipFormAndPlay();
      } else if (this.state === STATE_READY) {
        this.resetToIdle();
      } else if (this.state === STATE_RESULTS) {
        this.closeResults();
      }
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      // On peut rouvrir le formulaire si on est IDLE ou FINISHED
      if (this.state === STATE_IDLE || this.state === STATE_FINISHED) {
        this.openForm();
      }
      return;
    }

    if (event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      if (this.state === STATE_IDLE || this.state === STATE_FINISHED) {
        const pwd = prompt("Entrez le mot de passe pour accéder aux résultats :");
        if (this.checkAdminPassword(pwd)) {
          this.openResults();
        } else if (pwd !== null) {
          alert("Mot de passe incorrect");
        }
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault(); // Empêche le scroll ou la validation de formulaire par défaut
      
      if (this.state === STATE_IDLE) {
        this.openForm();
      } else if (this.state === STATE_READY) {
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
