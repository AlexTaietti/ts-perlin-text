import { Vec3D } from './Vec3D';
import { PerlinNoise3DFunction } from './types';

const perlinSmooth = (t: number) => { return t * t * t * (10 + (6 * t - 15) * t); }

const lerp = (t: number, v0: number, v1: number) => { return v0 * (1 - t) + v1 * t; }

export const Perlin3D: PerlinNoise3DFunction = (() => {

   //constants
   const scrambledIndexes = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

   const gradients = [
      new Vec3D(1, 1, 0), new Vec3D(1, -1, 0), new Vec3D(-1, -1, 0), new Vec3D(-1, 1, 0),
      new Vec3D(1, 0, -1), new Vec3D(-1, 0, -1), new Vec3D(1, 0, 1), new Vec3D(-1, 0, 1),
      new Vec3D(0, 1, -1), new Vec3D(0, -1, -1), new Vec3D(0, 1, 1), new Vec3D(0, -1, 1)
   ];

   const permutationTable = new Array(512);

   for (let i = 0; i < 256; i++) {
      permutationTable[i] = permutationTable[i + 256] = scrambledIndexes[i];
   }

   const noise: PerlinNoise3DFunction = (x, y, z) => {

      //find the location of the cube the point we are considering sits in, in our imaginary lattice
      let X = Math.floor(x);
      let Y = Math.floor(y);
      let Z = Math.floor(z);

      //find the components of the vector describing the relative location of the point within the cube
      const tx = x - X;
      const ty = y - Y;
      const tz = z - Z;

      //wrap the coordinates of the cube if needed (just in case we are outside of the noise function's domain)
      X = X & 255;
      Y = Y & 255;
      Z = Z & 255;

      //find the index of a random gradient using an hash table
      const gradientIndex000 = permutationTable[X + permutationTable[Y + permutationTable[Z]]] % gradients.length;
      const gradientIndex001 = permutationTable[X + permutationTable[Y + permutationTable[Z + 1]]] % gradients.length;
      const gradientIndex010 = permutationTable[X + permutationTable[Y + 1 + permutationTable[Z]]] % gradients.length;
      const gradientIndex011 = permutationTable[X + permutationTable[Y + 1 + permutationTable[Z + 1]]] % gradients.length;
      const gradientIndex100 = permutationTable[X + 1 + permutationTable[Y + permutationTable[Z]]] % gradients.length;
      const gradientIndex101 = permutationTable[X + 1 + permutationTable[Y + permutationTable[Z + 1]]] % gradients.length;
      const gradientIndex110 = permutationTable[X + 1 + permutationTable[Y + 1 + permutationTable[Z]]] % gradients.length;
      const gradientIndex111 = permutationTable[X + 1 + permutationTable[Y + 1 + permutationTable[Z + 1]]] % gradients.length;

      //find the dot product between the gradients we just found and the initial point's relative position vector
      const dot000 = gradients[gradientIndex000].dot(tx, ty, tz);
      const dot100 = gradients[gradientIndex100].dot(tx - 1, ty, tz);
      const dot010 = gradients[gradientIndex010].dot(tx, ty - 1, tz);
      const dot110 = gradients[gradientIndex110].dot(tx - 1, ty - 1, tz);
      const dot001 = gradients[gradientIndex001].dot(tx, ty, tz - 1);
      const dot101 = gradients[gradientIndex101].dot(tx - 1, ty, tz - 1);
      const dot011 = gradients[gradientIndex011].dot(tx, ty - 1, tz - 1);
      const dot111 = gradients[gradientIndex111].dot(tx - 1, ty - 1, tz - 1);

      //remap the point's relative position vector's components using Perlin's fave polynomial function
      const smoothX = perlinSmooth(tx);
      const smoothY = perlinSmooth(ty);
      const smoothZ = perlinSmooth(tz);

      //start interpolating, one axis at a time
      const interpolX00 = lerp(smoothX, dot000, dot100);
      const interpolX01 = lerp(smoothX, dot001, dot101);
      const interpolX10 = lerp(smoothX, dot010, dot110);
      const interpolX11 = lerp(smoothX, dot011, dot111);

      const interpolXY0 = lerp(smoothY, interpolX00, interpolX10);
      const interpolXY1 = lerp(smoothY, interpolX01, interpolX11);

      const noise = lerp(smoothZ, interpolXY0, interpolXY1); //make some noise

      return noise;

   }

   return noise;

})();