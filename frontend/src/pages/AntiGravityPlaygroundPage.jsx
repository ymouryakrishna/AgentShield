import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  Orbit, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Zap, 
  Bot, 
  Maximize2 
} from 'lucide-react';
import Card from '../components/horizon/Card';

export default function AntiGravityPlaygroundPage() {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const itemsRef = useRef([]);
  const [gravityMode, setGravityMode] = useState('normal'); // 'antigravity' | 'zerog' | 'normal'
  const [bounciness, setBounciness] = useState(0.75);

  useEffect(() => {
    const { Engine, World, Bodies, Mouse, MouseConstraint, Body } = Matter;

    // 1. Initialize Matter.js Physics Engine
    const engine = Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    engine.gravity.x = 0;
    engine.gravity.y = 1;

    // 2. Build Screen Boundary Walls
    const container = sceneRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    const wallThickness = 120;

    const createWalls = () => [
      // Ground
      Bodies.rectangle(width / 2, height + wallThickness / 2, width * 2, wallThickness, { isStatic: true }),
      // Ceiling
      Bodies.rectangle(width / 2, -wallThickness / 2, width * 2, wallThickness, { isStatic: true }),
      // Left wall
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true }),
      // Right wall
      Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, { isStatic: true })
    ];

    let walls = createWalls();
    World.add(world, walls);

    // 3. Convert DOM Elements into Rigid Physics Bodies
    const elements = container.querySelectorAll('.grav-item');
    const items = [];

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const parentRect = container.getBoundingClientRect();

      const x = rect.left - parentRect.left + rect.width / 2;
      const y = rect.top - parentRect.top + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        restitution: bounciness,
        friction: 0.1,
        frictionAir: 0.02,
        density: 0.002
      });

      World.add(world, body);

      el.style.position = 'absolute';
      el.style.left = '0px';
      el.style.top = '0px';
      el.style.margin = '0px';

      items.push({ el, body, width: rect.width, height: rect.height, initialX: x, initialY: y });
    });

    itemsRef.current = items;

    // 4. Mouse Drag & Throw Interaction
    const mouse = Mouse.create(container);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    World.add(world, mouseConstraint);

    // 5. Physics Sync Loop
    let animId;
    function updatePhysics() {
      Engine.update(engine, 1000 / 60);

      items.forEach(({ el, body, width, height }) => {
        const posX = body.position.x - width / 2;
        const posY = body.position.y - height / 2;
        const angle = body.angle;

        el.style.transform = `translate3d(${posX}px, ${posY}px, 0px) rotate(${angle}rad)`;
      });

      animId = requestAnimationFrame(updatePhysics);
    }
    animId = requestAnimationFrame(updatePhysics);

    // 6. Handle Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;

      World.remove(world, walls);
      walls = createWalls();
      World.add(world, walls);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      World.clear(world);
      Engine.clear(engine);
    };
  }, []);

  // Mode Controller: Anti-Gravity
  const handleTriggerAntiGravity = () => {
    setGravityMode('antigravity');
    if (!engineRef.current) return;
    engineRef.current.gravity.y = -1.2;
    engineRef.current.gravity.x = 0;

    itemsRef.current.forEach(({ body }) => {
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.06,
        y: -0.06
      });
    });
  };

  // Mode Controller: Zero-G
  const handleTriggerZeroG = () => {
    setGravityMode('zerog');
    if (!engineRef.current) return;
    engineRef.current.gravity.y = 0;
    engineRef.current.gravity.x = 0;

    itemsRef.current.forEach(({ body }) => {
      body.frictionAir = 0.04;
      Matter.Body.applyForce(body, body.position, {
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02
      });
    });
  };

  // Mode Controller: Standard Gravity
  const handleTriggerStandardGravity = () => {
    setGravityMode('normal');
    if (!engineRef.current) return;
    engineRef.current.gravity.y = 1;
    engineRef.current.gravity.x = 0;

    itemsRef.current.forEach(({ body }) => {
      body.frictionAir = 0.02;
    });
  };

  // Reset Elements Position
  const handleResetPositions = () => {
    if (!engineRef.current) return;
    itemsRef.current.forEach(({ body, initialX, initialY }) => {
      Matter.Body.setPosition(body, { x: initialX, y: initialY });
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      Matter.Body.setAngle(body, 0);
      Matter.Body.setAngularVelocity(body, 0);
    });
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white font-body pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Anti-Gravity Physics Playground
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-widest font-mono">
              Matter.js 2D Rigidbodies
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mt-1">
            Grab, toss, and bounce live UI components in real-time with zero-gravity and anti-gravity physics simulations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerAntiGravity}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
              gravityMode === 'antigravity'
                ? 'bg-rose-600 text-white shadow-rose-600/30'
                : 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Anti-Gravity (Float Up)</span>
          </button>

          <button
            onClick={handleTriggerZeroG}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
              gravityMode === 'zerog'
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-white dark:bg-navy-800 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Zero Gravity</span>
          </button>

          <button
            onClick={handleTriggerStandardGravity}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
              gravityMode === 'normal'
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Standard Drop</span>
          </button>

          <button
            onClick={handleResetPositions}
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 cursor-pointer transition-colors shadow-xs"
            title="Reset Elements"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Physics Canvas Arena */}
      <div 
        ref={sceneRef}
        className="relative w-full h-[620px] rounded-[24px] border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-slate-900/5 via-indigo-950/10 to-slate-900/20 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 overflow-hidden shadow-2xl select-none"
      >
        {/* Subtle Cyber Grid Matrix */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px]" />

        {/* Floating Instruction Banner */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none bg-white/70 dark:bg-navy-900/80 border border-slate-200/60 dark:border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300">
          💡 Click and drag any card or pill to toss it across the physics field
        </div>

        {/* --- PHYSICAL RIGIDBODY ITEMS --- */}

        {/* Hero Title */}
        <div 
          className="grav-item cursor-grab active:cursor-grabbing p-4 rounded-2xl bg-white/85 dark:bg-navy-800/85 backdrop-blur-xl border border-indigo-500/30 shadow-lg text-slate-900 dark:text-white font-extrabold text-xl tracking-tight flex items-center space-x-2.5 font-display"
          style={{ top: '12%', left: '38%' }}
        >
          <span className="text-xl">🌌</span>
          <span>Zero-G Agent Playground</span>
        </div>

        {/* Nav Pill 1 */}
        <div 
          className="grav-item cursor-grab active:cursor-grabbing px-4 py-2.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center space-x-2 shadow-md backdrop-blur-lg"
          style={{ top: '24%', left: '26%' }}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>🚀 Deterministic Firewall</span>
        </div>

        {/* Nav Pill 2 */}
        <div 
          className="grav-item cursor-grab active:cursor-grabbing px-4 py-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-2 shadow-md backdrop-blur-lg"
          style={{ top: '24%', left: '54%' }}
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span>⚡ Razorpay Settlement</span>
        </div>

        {/* Card 1: Modular Architecture */}
        <div 
          className="grav-item cursor-grab active:cursor-grabbing w-64 p-5 rounded-2xl bg-white/90 dark:bg-navy-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl"
          style={{ top: '38%', left: '18%' }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Bot className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modular Architecture</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Grab and toss this box anywhere across the canvas. Real-time angular velocity and collision dampening active.
          </p>
        </div>

        {/* Card 2: Real-Time Rigidbodies */}
        <div 
          className="grav-item cursor-grab active:cursor-grabbing w-64 p-5 rounded-2xl bg-white/90 dark:bg-navy-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-xl"
          style={{ top: '38%', left: '58%' }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Rigidbodies</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Every element maintains realistic collision geometry, kinetic bouncing restitution, and rotational friction.
          </p>
        </div>

        {/* Nav Pill 3: Policy Vault */}
        <div 
          className="grav-item cursor-grab active:cursor-grabbing px-4 py-2.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center space-x-2 shadow-md backdrop-blur-lg"
          style={{ top: '64%', left: '42%' }}
        >
          <Lock className="w-4 h-4 text-rose-500" />
          <span>📦 SHA-256 Receipts</span>
        </div>

      </div>

    </div>
  );
}
