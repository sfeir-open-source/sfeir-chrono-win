import './themes/generic.css';
import GameEngine from './engine/GameEngine.js';
import AdminPanel from './engine/AdminPanel.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Chrono Win - Game Engine Initialization');
  
  // Read config to get active theme
  const savedConfig = localStorage.getItem('chrono-win-config');
  let activeThemeName = 'maya'; // default
  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      if (parsed.theme) activeThemeName = parsed.theme;
    } catch (e) {}
  }

  let theme;
  if (activeThemeName === 'matrix') {
    const { default: MatrixTheme } = await import('./themes/matrix/theme.js');
    theme = new MatrixTheme();
  } else if (activeThemeName === 'generic') {
    const { default: GenericTheme } = await import('./themes/GenericTheme.js');
    theme = new GenericTheme();
  } else {
    const { default: MayaTheme } = await import('./themes/maya/theme.js');
    theme = new MayaTheme();
  }
  
  const engine = new GameEngine(theme);
  const adminPanel = new AdminPanel(engine);
  
  // Initialisation du jeu (écoute Espace pour démarrer)
  engine.init();
});
