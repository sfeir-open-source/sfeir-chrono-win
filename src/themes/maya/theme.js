import GenericTheme from '../GenericTheme.js';
import './style.css';

export default class MayaTheme extends GenericTheme {
  constructor() {
    super();
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'maya-canvas';
    document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.particleCount = 100; // Braises de rituel
    
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.drawEmbers = this.drawEmbers.bind(this);
    
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    
    // Initialisation des braises
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
    
    requestAnimationFrame(this.drawEmbers);
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: this.canvas.height + Math.random() * 200,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 1,
      opacity: Math.random() * 0.5 + 0.5,
      hue: Math.floor(Math.random() * 30) + 15 // Teintes de feu (Orange -> Jaune)
    };
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  drawEmbers() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.opacity})`;
      this.ctx.fill();
      
      // Déplacement
      p.y -= p.speedY;
      p.x += p.speedX;
      
      // Oscillation (Wobble)
      p.x += Math.sin(p.y * 0.05) * 0.5;
      
      // Les braises disparaissent en montant
      if (p.y < this.canvas.height * 0.6) {
        p.opacity -= 0.005;
      }
      
      // Réinitialisation si la particule est morte ou sortie de l'écran
      if (p.y < -10 || p.opacity <= 0) {
        this.particles[i] = this.createParticle();
        this.particles[i].y = this.canvas.height + 10;
      }
    }
    
    requestAnimationFrame(this.drawEmbers);
  }
}
