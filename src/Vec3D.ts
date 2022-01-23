export class Vec3D {

    private x: number;
    private y: number;
    private z: number;
 
    constructor(x = 0, y = 0, z = 0) {
       this.x = x;
       this.y = y;
       this.z = z;
       return this;
    }
 
    public dot(x: number, y: number, z: number) { return this.x * x + this.y * y + this.z * z; }
 
 }