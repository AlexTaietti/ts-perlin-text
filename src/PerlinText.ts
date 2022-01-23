import { PerlinParticles } from './PerlinParticles';
import { createFittingCanvas, makeImageData, cloneCanvas } from './utils';
import webfontloader from 'webfontloader';

export class PerlinText {

   private readonly container: HTMLElement;
   private readonly PerlinParticles: PerlinParticles;
   private readonly canvas: HTMLCanvasElement;
   private readonly context: CanvasRenderingContext2D;
   private readonly text: string;
   private readonly fontSize: number;
   private readonly referenceCanvas: HTMLCanvasElement;
   private readonly defaultFont: string = 'monospace';
   private readonly pixelRatio: number = window.devicePixelRatio;

   private frameID: number = 0;
   private imageData: ImageData | undefined;
   private fontFamily: string;

   public idle: boolean = false;
   public unmount: () => void;

   constructor(container: HTMLElement | null, text: string, fontSize: number, fontFamily: string) {

      if (!container) throw new Error('PerlinText: Cannot initialise without a valid container');

      this.text = text;
      this.fontSize = fontSize;
      this.fontFamily = fontFamily;
      this.container = container;
      [this.canvas, this.context] = createFittingCanvas(container, this.pixelRatio);
      this.referenceCanvas = cloneCanvas(this.canvas);
      this.imageData = undefined;
      this.PerlinParticles = new PerlinParticles(this.context.canvas.width, this.context.canvas.height, this.pixelRatio);

      webfontloader.load({
        google: {families: [fontFamily]},
        fontactive: (loadedFont) => this.initialiseParticleText(loadedFont),
        inactive: () => this.initialiseParticleText(this.defaultFont)
      });

      const updateMousePosition = (event: MouseEvent) => {

         this.PerlinParticles.setMousePosition({
            x: event.offsetX,
            y: event.offsetY
         });

      }

      const resetMousePosition = () => { this.PerlinParticles.setMousePosition({ x: -1, y: -1 }); }

      this.canvas.addEventListener('mousemove', updateMousePosition);
      this.canvas.addEventListener('mouseleave', resetMousePosition);

      this.unmount = () => {
         this.stop();
         this.canvas.removeEventListener('mousemove', updateMousePosition);
         this.canvas.removeEventListener('mouseleave', resetMousePosition);
      };

   }

   private setFont(font: string) {

      this.fontFamily = font;

      const referenceContext = this.referenceCanvas.getContext('2d');

      if (!referenceContext) throw new Error(`2d context not supported );`);

      referenceContext.font = `${this.fontSize}px ${this.fontFamily}`;
      referenceContext.textAlign = "center";
      referenceContext.textBaseline = "middle";

   }

   private initialiseParticleText(font: string) {
      this.setFont(font);
      this.imageData = makeImageData(this.referenceCanvas, this.text);
      this.PerlinParticles.initFormation(this.imageData);
   }

   private materialiseText() { this.PerlinParticles.initFormation(this.imageData); }

   private disperseParticles() { this.PerlinParticles.endFormation(); }

   public resize() {

      const newWidth = this.pixelRatio * this.container.clientWidth;
      const newHeight = this.pixelRatio * this.container.clientHeight;

      if (newWidth === this.context.canvas.width && newHeight === this.context.canvas.height) return;

      this.disperseParticles();

      this.context.canvas.width = newWidth;
      this.context.canvas.height = newHeight;

      this.canvas.style.width = `${this.container.clientWidth + "px"}`;
      this.canvas.style.height = `${this.container.clientHeight + "px"}`;

      const referenceContext = this.referenceCanvas.getContext('2d') as CanvasRenderingContext2D;

      referenceContext.canvas.width = this.context.canvas.width;
      referenceContext.canvas.height = this.context.canvas.height;

      referenceContext.font = `${this.fontSize}px ${this.fontFamily}`;
      referenceContext.textAlign = "center";
      referenceContext.textBaseline = "middle";

      this.imageData = makeImageData(this.referenceCanvas, this.text);

      this.PerlinParticles.updateBounds(this.context.canvas.width, this.context.canvas.height);

      this.materialiseText();

   }

   public stop() {

      window.cancelAnimationFrame(this.frameID);

      this.idle = true;

   }

   public resume() {

      this.frameID = window.requestAnimationFrame(this.animate.bind(this));

      this.idle = false;

   }

   public animate() {

      this.PerlinParticles.animateParticles(this.context);

      this.frameID = window.requestAnimationFrame(this.animate.bind(this));

   }


}