import GenericTheme from '../GenericTheme.js';
import './google.css';

export default class GoogleTheme extends GenericTheme {
  constructor() {
    super();
    this.initShapes();
  }

  initShapes() {
    // Nettoyer si déjà existant
    const oldContainer = document.getElementById('google-shapes-container');
    if (oldContainer) {
      oldContainer.remove();
    }

    // Create container
    this.shapesContainer = document.createElement('div');
    this.shapesContainer.id = 'google-shapes-container';
    
    // Définition des formes décoratives
    const shapes = [
      'google-shape shape-top-right-yellow',
      'google-shape shape-top-right-red',
      'google-shape shape-top-right-blue',
      'google-shape shape-bottom-left-green',
      'google-shape shape-bottom-left-blue',
      'google-shape shape-bottom-right-red',
      'google-sphere-blue',
      'google-sphere-orange'
    ];
    
    shapes.forEach(className => {
      const el = document.createElement('div');
      el.className = className;
      this.shapesContainer.appendChild(el);
    });
    
    document.body.prepend(this.shapesContainer);
  }

  init() {
    super.init();
    // Forcer le nettoyage des classes précédentes si besoin
    document.body.className = '';
    document.body.classList.add('theme-google');
  }
}
