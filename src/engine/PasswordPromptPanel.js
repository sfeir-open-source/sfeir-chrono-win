export default class PasswordPromptPanel {
  constructor({ title, checkPassword, onSuccess }) {
    this.title = title;
    this.checkPassword = checkPassword;
    this.onSuccess = onSuccess;
    this.element = null;
    this.escapeHandler = null;
    
    this.createDom();
  }

  createDom() {
    let overlay = document.getElementById('password-prompt-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'password-prompt-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100vw';
      overlay.style.height = '100vh';
      overlay.style.background = 'rgba(0, 0, 0, 0.85)';
      overlay.style.zIndex = '1100';
      overlay.style.display = 'none';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      document.body.appendChild(overlay);
    }
    this.element = overlay;
  }

  show() {
    this.element.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 8px; width: 90%; max-width: 400px; color: #333; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <h2 style="margin-top: 0; color: #000; font-family: sans-serif;">${this.title}</h2>
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: bold; font-family: sans-serif;">Mot de passe :</label>
          <input type="password" id="prompt-pwd-input" style="padding: 0.5rem; width: 100%; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <button id="prompt-cancel-btn" style="padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: white;">Annuler</button>
          <button id="prompt-submit-btn" style="padding: 0.5rem 1rem; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 4px; font-weight: bold;">Valider</button>
        </div>
      </div>
    `;

    this.element.style.display = 'flex';
    const input = document.getElementById('prompt-pwd-input');
    setTimeout(() => {
      if (input) input.focus();
    }, 50);

    const submit = () => {
      const pwd = input.value;
      if (this.checkPassword(pwd)) {
        this.hide();
        this.onSuccess();
      } else {
        alert("Mot de passe incorrect");
        input.value = '';
        input.focus();
      }
    };

    document.getElementById('prompt-submit-btn').addEventListener('click', submit);
    document.getElementById('prompt-cancel-btn').addEventListener('click', () => this.hide());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submit();
    });

    this.escapeHandler = (e) => {
      if (e.key === 'Escape') this.hide();
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  hide() {
    this.element.style.display = 'none';
    this.element.innerHTML = '';
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }
}
