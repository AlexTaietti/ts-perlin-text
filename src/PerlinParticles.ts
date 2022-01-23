import { Perlin3D } from './Perlin3D';
import { Square, Vec2D } from './types';

//cheeky shortcuts
const random = Math.random;
const PI2 = Math.PI * 2;
const SIN = Math.sin;
const COS = Math.cos;
const NOW = Date.now;


export class PerlinParticles {

   private readonly bounds: Square; //will have to be calculated on initialisation
   private readonly pixelRatio: number;

   //build a home for our particles <3
   private readonly particleFields = 6; // number of properties used to identify each particle, 4 regarding it's location and speed and two regarding any target it might be moving towards
   private readonly particlesNumber = 20000;
   private readonly particleArrayTotalSize = this.particlesNumber * this.particleFields;
   private readonly particles = new Float32Array(this.particleArrayTotalSize); //takes particle array total size on initialisation
   private readonly randomness = 0.854; //randomness threshold used to pick a particle

   //all of these props determine the final feel of the swarm
   private readonly speedMultiplier = 0.953;
   private readonly gridShrinkFactor = 190;
   private readonly zComponentShrink = 4000;
   private readonly formationHampering = 0.0093;
   private readonly shapeSharpness = 19.8;
   private readonly formationNoiseIntensity = 0.6;
   private readonly noiseIntensity = 0.8;
   private readonly seekerNoiseIntensity = 0.88;
   private readonly seekerHampering = 0.00036;
   private readonly perlin = Perlin3D;

   //these two props are temporary coordinate holders for every particle's update cycle (all particles are sharing them), used to avoid allocating memory needlessly on every individual particle's update cycle...particle, particle...particle, particle, particle...you get the gist
   private x = -1;
   private y = -1;

   private inFormation = false;
   private hue = Math.random() * (Math.PI * 2);
   private RAINBOW = false;
   private mousePosition: Vec2D = { x: -1, y: -1 }

   constructor(worldWidth: number, worldHeight: number, pixelRatio: number, rainbowMode?: boolean) {

      this.bounds = {
         width: worldWidth,
         height: worldHeight
      };

      this.pixelRatio = pixelRatio;

      for (let i = 0; i < this.particleArrayTotalSize; i += this.particleFields) {
         this.particles[i] = random() * worldWidth;
         this.particles[i + 1] = random() * worldHeight;
         this.particles[i + 2] = 0;
         this.particles[i + 3] = 0;
         this.particles[i + 4] = -1;
         this.particles[i + 5] = -1;
      }

      if (rainbowMode) this.RAINBOW = true;

   }

   public setMousePosition(offset: Vec2D) {
      this.mousePosition.x = offset.x;
      this.mousePosition.y = offset.y;
   }

   public updateBounds(worldWidth: number, worldHeight: number) {
      this.bounds.width = worldWidth;
      this.bounds.height = worldHeight;
   }


   public initFormation(imageData: ImageData | undefined) {

      if (!imageData) {
         console.warn('Particle text could not get into formation because of undefined image data');
         return;
      }

      const data = imageData.data;

      for (let i = -1, particleArrayPointer = ~~(random() * this.particlesNumber), pixelIndex = undefined; i < data.length; i += 4) {
         if (data[i] > 0 && Math.random() > this.randomness) {
            pixelIndex = (i - 3) / 4;
            this.particles[this.particleFields * (particleArrayPointer % this.particlesNumber) + 4] = pixelIndex % imageData.width;
            this.particles[this.particleFields * ((particleArrayPointer++) % this.particlesNumber) + 5] = pixelIndex / imageData.width;
         }
      }

      this.inFormation = true;

   }

   public endFormation() {

      for (let i = 0; i < this.particleArrayTotalSize; i += this.particleFields) {
         this.particles[i + 4] = -1;
         this.particles[i + 5] = -1;
      }

      this.inFormation = false;

   }

   public areInFormation() { return this.inFormation; }

   private generateNoiseComponents(particleIndex: number): [number, number] {
      const noiseX = this.perlin(this.particles[particleIndex] / this.gridShrinkFactor, this.particles[particleIndex + 1] / this.gridShrinkFactor, -NOW() / this.zComponentShrink);
      const noiseY = this.perlin(this.particles[particleIndex] / this.gridShrinkFactor, this.particles[particleIndex + 1] / this.gridShrinkFactor, NOW() / this.zComponentShrink);
      return [noiseX, noiseY];
   }

   public animateParticles(context: CanvasRenderingContext2D) {

      const mouseX = this.mousePosition.x * this.pixelRatio;
      const mouseY = this.mousePosition.y * this.pixelRatio;
      
      const worldWidth = this.bounds.width;
      const worldHeight = this.bounds.height;

      //draw background
      context.fillStyle = `hsl(0, 0.0%, 1%)`;
      context.fillRect(0, 0, worldWidth, worldHeight);

      for (let i = 0, noiseX, noiseY; i < this.particleArrayTotalSize; i += this.particleFields) {

         [noiseX, noiseY] = this.generateNoiseComponents(i);

         //approach coordinates of target pixel if one has been assigned to this specific particle
         if (this.particles[i + 4] > 0 && this.particles[i + 5] > 0) {

            this.particles[i + 2] += ((this.particles[i + 4] - this.particles[i]) * this.formationHampering) + ((random() / this.shapeSharpness) * COS(random() * (PI2)) + noiseX * this.formationNoiseIntensity);
            this.particles[i + 3] += ((this.particles[i + 5] - this.particles[i + 1]) * this.formationHampering) + ((random() / this.shapeSharpness) * SIN(random() * (PI2)) + noiseY * this.formationNoiseIntensity);

         } else if (mouseX >= 0 && mouseY >= 0) {

            this.particles[i + 2] += ((mouseX - this.particles[i]) * this.seekerHampering) + ((random() / 4) * COS(random() * (PI2)) + noiseX * this.seekerNoiseIntensity);
            this.particles[i + 3] += ((mouseY - this.particles[i + 1]) * this.seekerHampering) + ((random() / 4) * SIN(random() * (PI2)) + noiseY * this.seekerNoiseIntensity);

         } else { //simply change velocity components based on noise

            this.particles[i + 2] += ((random() / 4) * COS(random() * (PI2)) + noiseX * this.noiseIntensity);
            this.particles[i + 3] += ((random() / 4) * SIN(random() * (PI2)) + noiseY * this.noiseIntensity);

         }

         //slow the current particle and move it around
         this.x = this.particles[i] += (this.particles[i + 2] *= this.speedMultiplier);
         this.y = this.particles[i + 1] += (this.particles[i + 3] *= this.speedMultiplier);

         //wrap particles around edges only if they have not been assigned a target pixel
         if (this.particles[i + 4] < 0 && this.particles[i + 5] < 0 && (mouseX < 0 && mouseY < 0)) {
            if (this.x > worldWidth) {
               this.particles[i] = 0;
            } else if (this.x < 0) {
               this.particles[i] = worldWidth;
            }

            if (this.y > worldHeight) {
               this.particles[i + 1] = 0;
            } else if (this.y < 0) {
               this.particles[i + 1] = worldHeight;
            }
         }

         //draw particles
         context.fillStyle = this.RAINBOW ? `hsl(${this.hue += .4}, 100%, 50%)` : `hsl(213, 100%, 50%)`;
         context.fillRect(this.x, this.y, 1, 1);

      }

   }

};