import Matter from 'matter-js';

const { Engine, Render, Runner, World, Bodies } = Matter;

const FACE_IMAGE =
  'https://res.cloudinary.com/khriztianmoreno/image/upload/q_auto,f_auto,w_90/v1604105684/KM-brand/profile%20imgs/CARA_KHRIZTIAN_final-01.png';

const engine = Engine.create();
const runner = Runner.create();

let render: Matter.Render | null = null;
let activeCanvas: HTMLCanvasElement | null = null;
let mountCount = 0;

function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function syncCanvasSize(canvas: HTMLCanvasElement) {
  const { width, height } = getViewportSize();
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return { width, height };
}

function createFaceBody(width: number) {
  return Bodies.circle(Math.round(Math.random() * width), -30, 35, {
    angle: Math.PI * (Math.random() * 2 - 1),
    friction: 0.001,
    frictionAir: 0.01,
    restitution: 0.75,
    render: {
      fillStyle: 'transparent',
      strokeStyle: 'transparent',
      lineWidth: 0,
      sprite: {
        texture: FACE_IMAGE,
        xScale: 1,
        yScale: 1,
      },
    },
  });
}

function createBoundaries(width: number, height: number) {
  const options = {
    isStatic: true,
    render: {
      fillStyle: 'transparent',
      strokeStyle: 'transparent',
      lineWidth: 0,
    },
  };

  return [
    Bodies.rectangle(width / 2, height, width + 20, 4, options),
    Bodies.rectangle(0, height / 2, 4, height + 60, options),
    Bodies.rectangle(width, height / 2, 4, height + 60, options),
  ];
}

function addBoundaries(width: number, height: number) {
  World.add(engine.world, createBoundaries(width, height));
}

export function addPool() {
  const { width } = getViewportSize();
  World.add(engine.world, [createFaceBody(width)]);
}

function handleResize() {
  if (!render || !activeCanvas) return;

  const nextSize = syncCanvasSize(activeCanvas);
  render.options.width = nextSize.width;
  render.options.height = nextSize.height;
  Render.setPixelRatio(render, window.devicePixelRatio || 1);

  World.clear(engine.world, false);
  addBoundaries(nextSize.width, nextSize.height);
}

function destroyPhysics() {
  if (!render) return;

  window.removeEventListener('resize', handleResize);
  Render.stop(render);
  Runner.stop(runner);
  World.clear(engine.world, false);
  Engine.clear(engine);
  render = null;
  activeCanvas = null;
}

export function mountFaceCanvas(className = '') {
  if (typeof document === 'undefined') {
    return () => {};
  }

  mountCount += 1;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = `face-drop-canvas pointer-events-none fixed inset-0 z-[10050] ${className}`.trim();
  document.body.appendChild(canvas);
  activeCanvas = canvas;

  const { width, height } = syncCanvasSize(canvas);

  if (!render) {
    render = Render.create({
      canvas,
      engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false,
        pixelRatio: window.devicePixelRatio || 1,
      },
    });

    render.canvas.style.background = 'transparent';
    addBoundaries(width, height);
    Render.run(render);
    Runner.run(runner, engine);
    window.addEventListener('resize', handleResize);
  }

  return () => {
    canvas.remove();

    if (activeCanvas === canvas) {
      activeCanvas = null;
    }

    mountCount -= 1;

    if (mountCount === 0) {
      destroyPhysics();
    }
  };
}
