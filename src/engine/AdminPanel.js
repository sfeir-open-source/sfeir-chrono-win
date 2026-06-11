import PasswordPromptPanel from './PasswordPromptPanel.js';

export default class AdminPanel {
  constructor(engine) {
    this.engine = engine;
    this.panelElement = document.getElementById('admin-panel');
    this.isAuthenticated = false;
  }

  togglePanel() {
    if (this.panelElement.classList.contains('hidden')) {
      this.showPanel();
    } else {
      this.hidePanel();
    }
  }

  hidePanel() {
    this.panelElement.classList.add('hidden');
  }

  showPanel() {
    this.panelElement.classList.remove('hidden');

    if (!this.isAuthenticated) {
      this.renderLogin();
    } else {
      this.renderConfig();
    }
  }

  renderLogin() {
    // Hide empty admin panel during prompt input
    this.panelElement.classList.add('hidden');

    const adminPrompt = new PasswordPromptPanel({
      title: "Administration",
      checkPassword: (pwd) => this.engine.checkAdminPassword(pwd),
      onSuccess: () => {
        this.isAuthenticated = true;
        this.panelElement.classList.remove('hidden');
        this.renderConfig();
      }
    });

    // If cancel/escape is pressed in password prompt, make sure to hide the main admin panel too
    const originalHide = adminPrompt.hide.bind(adminPrompt);
    adminPrompt.hide = () => {
      originalHide();
      this.hidePanel();
    };

    adminPrompt.show();
  }

  getConfig() {
    const saved = localStorage.getItem('chrono-win-config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    // Return default equivalent to engine fallback
    return {
      targetValue: 10000,
      timeDivider: 10,
      theme: 'maya',
      prizes: [
        { min: 998, max: 1002, name: 'Une peluche' },
        { min: 900, max: 1100, name: 'Des stickers' }
      ]
    };
  }

  renderConfig() {
    const config = this.getConfig();

    let html = `
      <h2 style="margin-top: 0;">Configuration</h2>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: bold;">Chiffre cible :</label>
        <input type="number" id="config-target" value="${config.targetValue}" style="padding: 0.5rem; width: 100%; box-sizing: border-box;" />
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: bold;">Diviseur de temps (10 = centièmes) :</label>
        <input type="number" id="config-divider" value="${config.timeDivider}" style="padding: 0.5rem; width: 100%; box-sizing: border-box;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: bold;">Mot de passe Admin :</label>
        <input type="password" id="config-password" value="${this.engine.getAdminPassword()}" style="padding: 0.5rem; width: 100%; box-sizing: border-box;" />
      </div>

      <div style="margin-bottom: 1rem;">
        <label style="display: block; font-weight: bold;">Thème Graphique :</label>
        <select id="config-theme" style="padding: 0.5rem; width: 100%; box-sizing: border-box;">
          <option value="generic" ${config.theme === 'generic' ? 'selected' : ''}>Générique (Minimaliste)</option>
          <option value="matrix" ${config.theme === 'matrix' ? 'selected' : ''}>Matrix (Pluie Numérique)</option>
          <option value="maya" ${config.theme === 'maya' || !config.theme ? 'selected' : ''}>Divinités Mayas</option>
          <option value="stranger_things" ${config.theme === 'stranger_things' ? 'selected' : ''}>Stranger Things</option>
          <option value="google" ${config.theme === 'google' ? 'selected' : ''}>Google Cloud Event</option>
        </select>
      </div>
      
      <h3 style="margin-bottom: 0.5rem;">Lots et Fourchettes</h3>
      <div id="prizes-container" style="max-height: 200px; overflow-y: auto; margin-bottom: 1rem;">
    `;

    config.prizes.forEach((prize) => {
      // Rétrocompatibilité ou nouveau format
      const ruleStr = prize.rule || (prize.min !== undefined ? `${prize.min}-${prize.max}` : '');
      html += this.getPrizeHTML(ruleStr, prize.name, prize.isHidden || false);
    });

    html += `
      </div>
      <button id="add-prize-btn" style="padding: 0.5rem; margin-bottom: 1rem; cursor: pointer;">+ Ajouter un lot</button>
      
      <hr style="border: none; border-top: 1px solid #ccc; margin-bottom: 1rem;"/>
      
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <button id="export-csv-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #2196F3; color: white; border: none; border-radius: 4px; font-weight: bold;">Exporter les participants (CSV)</button>
        <button id="reset-db-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #f44336; color: white; border: none; border-radius: 4px; font-weight: bold;">Remise à zéro de la base</button>
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <button id="save-config-btn" style="background: #4CAF50; color: white; font-weight: bold; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">Sauvegarder Configuration</button>
        <button id="admin-close-btn" style="padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: white;">Fermer</button>
      </div>
    `;

    this.panelElement.innerHTML = html;

    // Bind events
    document.getElementById('add-prize-btn').addEventListener('click', () => {
      const container = document.getElementById('prizes-container');
      const div = document.createElement('div');
      div.innerHTML = this.getPrizeHTML('', '', false);
      container.appendChild(div.firstElementChild);
    });

    document.getElementById('save-config-btn').addEventListener('click', () => {
      this.saveConfig();
    });

    document.getElementById('admin-close-btn').addEventListener('click', () => this.hidePanel());

    document.getElementById('export-csv-btn').addEventListener('click', async () => {
      try {
        const participants = await this.engine.db.getAllParticipants();
        if (participants.length === 0) {
          alert("Aucun participant à exporter.");
          return;
        }
        
        const header = ["Date", "Score", "Nom", "Prénom", "Email", "Téléphone", "Formation", "Opportunité"];
        const rows = participants.map(p => [
          p.date,
          p.score,
          p.nom,
          p.prenom,
          p.email,
          p.telephone,
          p.formation ? "Oui" : "Non",
          p.opportunite ? "Oui" : "Non"
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + header.join(";") + "\n"
            + rows.map(e => e.join(";")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `participants_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error(e);
        alert("Erreur lors de l'export.");
      }
    });

    document.getElementById('reset-db-btn').addEventListener('click', async () => {
      if (confirm("Attention ! Voulez-vous vraiment supprimer toutes les données des participants ? Cette action est irréversible.")) {
        try {
          await this.engine.db.clearDatabase();
          alert("Base de données réinitialisée.");
        } catch(e) {
          console.error(e);
          alert("Erreur lors de la remise à zéro.");
        }
      }
    });
  }

  getPrizeHTML(rule, name, isHidden) {
    return `
      <div class="prize-row" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem; align-items: center;">
        <input type="text" class="prize-rule" value="${rule}" placeholder="Ex: 50-80,90" style="width: 150px; padding: 0.25rem;" />
        <input type="text" class="prize-name" value="${name}" placeholder="Nom du lot" style="flex: 1; padding: 0.25rem;" />
        <label style="font-size: 0.8rem; display: flex; align-items: center; gap: 0.2rem; cursor: pointer;">
          <input type="checkbox" class="prize-hidden" ${isHidden ? 'checked' : ''} /> Caché
        </label>
        <button onclick="this.parentElement.remove()" style="cursor: pointer; padding: 0.25rem 0.5rem;">X</button>
      </div>
    `;
  }

  parseRules(ruleStr) {
    const numbers = new Set();
    if (!ruleStr) return [];
    
    const parts = ruleStr.split(',');
    for (let part of parts) {
      part = part.trim();
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            numbers.add(i);
          }
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          numbers.add(num);
        }
      }
    }
    return Array.from(numbers);
  }

  saveConfig() {
    const targetValue = parseInt(document.getElementById('config-target').value, 10) || 10000;
    let timeDivider = parseInt(document.getElementById('config-divider').value, 10);
    if (isNaN(timeDivider) || timeDivider <= 0) timeDivider = 10;

    const newPassword = document.getElementById('config-password').value;
    this.engine.saveAdminPassword(newPassword);

    const prizes = [];
    const usedNumbers = new Set();
    let conflictError = null;

    const rows = document.querySelectorAll('.prize-row');
    rows.forEach(row => {
      const rule = row.querySelector('.prize-rule').value;
      const name = row.querySelector('.prize-name').value;
      const isHidden = row.querySelector('.prize-hidden').checked;
      
      if (rule.trim() !== '' && name.trim() !== '') {
        const parsedNumbers = this.parseRules(rule);
        
        for (const num of parsedNumbers) {
          if (usedNumbers.has(num)) {
            conflictError = num;
          }
          usedNumbers.add(num);
        }
        
        prizes.push({ 
          rule: rule.trim(), 
          name: name.trim(), 
          isHidden,
          numbers: parsedNumbers
        });
      }
    });

    if (conflictError !== null) {
      alert(`Erreur : Le chiffre ${conflictError} est assigné à plusieurs lots en même temps. Veuillez corriger le conflit.`);
      return;
    }

    const theme = document.getElementById('config-theme').value;

    const newConfig = { targetValue, timeDivider, theme, prizes };
    localStorage.setItem('chrono-win-config', JSON.stringify(newConfig));

    this.engine.loadConfig();
    this.hidePanel();
    alert("Configuration sauvegardée ! L'application va se recharger pour appliquer le thème.");
    window.location.reload();
  }
}
