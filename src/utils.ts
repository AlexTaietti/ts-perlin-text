//canvas utils
export const cloneCanvas = (canvas: HTMLCanvasElement) => {

    const clone = document.createElement('canvas');
    const cloneContext = clone.getContext('2d');
 
    const originalContext = canvas.getContext('2d');
 
    if (!cloneContext || !originalContext) throw new Error(`2d context not supported );`);
 
    cloneContext.canvas.width = originalContext.canvas.width;
    cloneContext.canvas.height = originalContext.canvas.height;
 
    return clone;
 
 };
 
 export const createReferenceCanvas = (canvas: HTMLCanvasElement, fontSize: number, fontFamily: string) => {
 
    const clonedCanvas = cloneCanvas(canvas);
    const clonedContext = clonedCanvas.getContext('2d');
 
    if (!clonedContext) throw new Error(`2d context not supported );`);
 
    clonedContext.font = `${fontSize}px ${fontFamily}`;
    clonedContext.textAlign = "center";
    clonedContext.textBaseline = "middle";
 
    return clonedCanvas;
 
 };
 
 export const createFittingCanvas = (container: HTMLElement): [HTMLCanvasElement, CanvasRenderingContext2D] => {
 
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;
 
    if (!context) throw new Error(`2d context not supported );`);
 
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
 
    canvas.style.width = `${containerWidth + "px"}`;
    canvas.style.height = `${containerHeight + "px"}`;
 
    context.canvas.width = containerWidth * pixelRatio;
    context.canvas.height = containerHeight * pixelRatio;
 
    container.append(canvas);
 
    return [canvas, context];
 
 };
 
 export const makeImageData = (canvas: HTMLCanvasElement, text: string) => {
 
    const context = canvas.getContext('2d');
 
    if (!context) throw new Error(`2d context not supported );`);
 
    const centerX = context.canvas.width / 2;
    const centerY = context.canvas.height / 2;
 
    context.fillText(text, centerX, centerY);
 
    const data = context.getImageData(0, 0, canvas.width, canvas.height);
 
    return data;
 
 };
 
 //quick mafs
 export const rad2deg = (rad: number) => rad * 180 / Math.PI;
 export const deg2rad = (deg: number) => deg * Math.PI / 180;
 export const mapToRange = (v: number, low0: number, high0: number, low1: number, high1: number) => (((high1 - low1) / (high0 - low0)) * (v - low0)) + low1;
 export const randomInRange = (low: number, high: number) => (Math.random() * (high - low)) + low;
 
 //misc
 export const pickRandom = (array: Array<any>) => array[~~(Math.random() * array.length)];