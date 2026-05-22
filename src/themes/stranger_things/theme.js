import GenericTheme from '../GenericTheme.js';

export default class StrangerThingsTheme extends GenericTheme {
  constructor() {
    super();
    this.loadCSS('src/themes/stranger_things/style.css');
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'stranger-things-canvas';
    document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.topParticles = [];
    this.bottomParticles = [];
    this.topParticleCount = 25; // Très léger
    this.bottomParticleCount = 300; // Plus dense (augmenté)
    
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.drawParticles = this.drawParticles.bind(this);
    
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    
    // Init Top Particles (Lumières légères)
    for (let i = 0; i < this.topParticleCount; i++) {
      this.topParticles.push(this.createTopParticle());
    }
    
    // Init Bottom Particles (Spores Upside Down)
    for (let i = 0; i < this.bottomParticleCount; i++) {
      this.bottomParticles.push(this.createBottomParticle());
    }
    
    requestAnimationFrame(this.drawParticles);
  }

  createTopParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * (this.canvas.height / 2),
      size: Math.random() * 1.5 + 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      glow: Math.random() > 0.5 // Pour donner un petit effet brillant par moment
    };
  }

  createBottomParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: (this.canvas.height / 2) + Math.random() * (this.canvas.height / 2),
      size: Math.random() * 2.5 + 1,
      speedY: (Math.random() - 0.5) * 1.5,
      speedX: (Math.random() - 0.5) * 1,
      opacity: Math.random() * 0.5 + 0.1
    };
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Top Particles
    for (let i = 0; i < this.topParticles.length; i++) {
      let p = this.topParticles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 220, 150, ${p.opacity})`;
      if (p.glow) {
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = 'rgba(255, 220, 150, 0.8)';
      } else {
        this.ctx.shadowBlur = 0;
      }
      this.ctx.fill();
      
      p.y += p.speedY;
      p.x += p.speedX;
      
      // Wrap around top half
      if (p.y > this.canvas.height / 2) p.y = 0;
      if (p.y < 0) p.y = this.canvas.height / 2;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.x < 0) p.x = this.canvas.width;
      
      // Scintillement
      p.opacity += (Math.random() - 0.5) * 0.05;
      if (p.opacity > 0.8) p.opacity = 0.8;
      if (p.opacity < 0.1) p.opacity = 0.1;
    }
    
    this.ctx.shadowBlur = 0; // Reset shadow
    
    // Draw Bottom Particles
    for (let i = 0; i < this.bottomParticles.length; i++) {
      let p = this.bottomParticles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(180, 200, 220, ${p.opacity})`; // Blanc bleuté pour les spores
      this.ctx.fill();
      
      p.y += p.speedY;
      p.x += p.speedX;
      
      // Wobble
      p.x += Math.sin(p.y * 0.02) * 0.5;
      
      // Wrap around bottom half
      if (p.y < this.canvas.height / 2) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = this.canvas.height / 2;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.x < 0) p.x = this.canvas.width;
    }
    
    requestAnimationFrame(this.drawParticles);
  }
}
