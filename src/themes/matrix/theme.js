import GenericTheme from '../GenericTheme.js';

export default class MatrixTheme extends GenericTheme {
  constructor() {
    super();
    this.loadCSS('src/themes/matrix/style.css');
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    document.body.prepend(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Matrix characters (Katakana + Latin)
    this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/`~ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ'.split('');
    this.fontSize = 16;
    this.columns = 0;
    this.drops = [];
    
    this.resizeCanvas = this.resizeCanvas.bind(this);
    this.drawMatrix = this.drawMatrix.bind(this);
    
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
    
    // Run the matrix rain animation loop
    setInterval(this.drawMatrix, 33);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.columns = this.canvas.width / this.fontSize;
    this.drops = [];
    for (let x = 0; x < this.columns; x++) {
      // Start drops at random heights to avoid a unified line dropping at once
      this.drops[x] = Math.random() * -100;
    }
  }

  drawMatrix() {
    // Fading effect for the trails
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.font = this.fontSize + 'px monospace';
    
    for (let i = 0; i < this.drops.length; i++) {
      const text = this.letters[Math.floor(Math.random() * this.letters.length)];
      
      // Highlight the leading character with white
      if (Math.random() > 0.95) {
        this.ctx.fillStyle = '#FFF';
      } else {
        this.ctx.fillStyle = '#0F0';
      }
      
      this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
      
      if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
  }
}
