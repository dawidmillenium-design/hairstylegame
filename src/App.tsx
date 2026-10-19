import { useEffect, useRef, useState } from 'react';
import { HERO_BODY_URL, HERO_PORTRAIT_URL } from './assets/hero';
import { GORILLA_URL, MERHUJUS_URL, MRPING_URL } from './assets/extra';

// ============================================
// BLACKHUJUS the GREEN HAIR STYLE v8.0
// - Real pixel-art hero sprite (Blackhujus) + gorilla black-wine transformation
// - White wine = wings (higher, longer jumps); black wine = GORILLA MODE
// - Merhujus & Mr Ping (YAYAYA) cameos in the background
// - Engine mounts ONCE: pausing / toggling sound no longer resets the run
// ============================================

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<{ start: () => void } | null>(null);
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'paused' | 'over'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [tireCount, setTireCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Refs so the (single-mount) game engine always reads fresh values
  const statusRef = useRef(gameStatus);
  const soundRef = useRef(soundEnabled);
  const highRef = useRef(highScore);
  useEffect(() => { statusRef.current = gameStatus; }, [gameStatus]);
  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { highRef.current = highScore; }, [highScore]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sth_hi_v7');
      if (saved) setHighScore(parseInt(saved) || 0);
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive sizing
    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        const w = Math.min(800, container.clientWidth - 20);
        const ratio = 800 / 450;
        canvas.style.width = w + 'px';
        canvas.style.height = (w / ratio) + 'px';
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Audio context for sound effects
    let audioCtx: AudioContext | null = null;
    const getAudioCtx = () => {
      if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) { /* no audio */ }
      }
      return audioCtx;
    };

    const playSound = (type: 'jump' | 'collect' | 'super' | 'hit' | 'gameover' | 'combo' | 'yayaya', comboLvl: number = 0) => {
      if (!soundRef.current) return;
      const ac = getAudioCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);

      switch (type) {
        case 'jump':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.1);
          gain.gain.setValueAtTime(0.15, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.15);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.15);
          break;
        case 'collect':
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.08);
          gain.gain.setValueAtTime(0.1, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.12);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.12);
          break;
        case 'super':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1600, ac.currentTime + 0.3);
          gain.gain.setValueAtTime(0.12, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.4);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.4);
          break;
        case 'hit':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, ac.currentTime + 0.3);
          gain.gain.setValueAtTime(0.2, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.35);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.35);
          break;
        case 'gameover':
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.5);
          gain.gain.setValueAtTime(0.15, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.6);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.6);
          break;
        case 'combo':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600 + comboLvl * 100, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900 + comboLvl * 150, ac.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.15);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.15);
          break;
        case 'yayaya':
          osc.type = 'square';
          osc.frequency.setValueAtTime(500, ac.currentTime);
          osc.frequency.setValueAtTime(700, ac.currentTime + 0.07);
          osc.frequency.setValueAtTime(900, ac.currentTime + 0.14);
          gain.gain.setValueAtTime(0.07, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.24);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.24);
          break;
      }
    };

    // Game constants
    const W = 800, H = 450;
    const GROUND = H - 70;
    const GRAVITY = 0.85;
    const JUMP_FORCE = -17;
    const MAX_SPEED = 14;
    const HERO_H = 132;

    // Real hero sprite, with hand-drawn pixel-art fallback while it loads
    const heroImg = new Image();
    let heroReady = false;
    let heroW = 56; // updated from the real aspect ratio once loaded
    heroImg.onload = () => {
      heroReady = true;
      heroW = Math.round(HERO_H * (heroImg.naturalWidth / heroImg.naturalHeight));
    };
    heroImg.src = HERO_BODY_URL;

    // Gorilla transformation sprite (black wine)
    const gorillaImg = new Image();
    let gorillaReady = false;
    gorillaImg.onload = () => { gorillaReady = true; };
    gorillaImg.src = GORILLA_URL;

    // Background cameos: Merhujus & Mr Ping
    const merImg = new Image();
    let merReady = false;
    merImg.onload = () => { merReady = true; };
    merImg.src = MERHUJUS_URL;
    const pingImg = new Image();
    let pingReady = false;
    pingImg.onload = () => { pingReady = true; };
    pingImg.src = MRPING_URL;

    // Pixel art fallback data for Blackhujus
    const PX_ROWS = [
      "....GG.GG.GG.GG.....",
      "...GGGGGGGGGGGGGG...",
      "..GGgGGGGGGGGGGgGG..",
      "..gGGGGGGGGGGGGGGg..",
      "..SSSSSSSSSSSSSSSS..",
      ".SSEESSSSSSSSSSEESS.",
      ".SSEESSSSSSSSSSEESS.",
      "..SSSSSbbbbbSSSSSS..",
      "..SSSSSbbbbbSSSSSS..",
      "..SSSSSSSSSSSSSSSS..",
      ".OOOOSSSSSSSSSSOOOO.",
      "..OOOOSSSSSSSSOOOO..",
      "..WWWWWWWWWWWWWWWW..",
      "..WWWWNNNNNNNNWWWW..",
      "..WWWWNNNNNNNNWWWW..",
      ".WWWWWyNNNNNNyWWWWW.",
      "yWWWWWyNNNNNNyWWWWWy",
      ".WWWWWyNNNNNNyWWWWW.",
      "..WWWWWWWWWWWWWWWW..",
      "..wwwwwwwwwwwwwwww..",
      "..PPPPPPPPPPPPPPPP..",
      "..PPpPPPPPPPPPPpPP..",
      "..PPPPPPPPPPPPPPPP..",
      "...PPPPP....PPPPP...",
      "...PPPPP....PPPPP...",
      "...PPpPP....PPpPP...",
      "...PPPPP....PPPPP...",
      "...YYYYY....YYYYY...",
      "..KYYYYY....YYYYYK..",
      "..KKKKK......KKKKK.."];
    const PX_PAL: Record<string, string> = {
      G: '#35b34a', g: '#1f7a2e', S: '#8d5524', s: '#a76a3a',
      E: '#ffffff', b: '#f5f5f5', O: '#f5f2e8', W: '#f2f2f2', w: '#c9c9c9',
      N: '#2e4a72', y: '#f4c542', P: '#d9d9d9', p: '#b0b0b0', Y: '#f4c542', K: '#3a3a3a'
    };

    const buildPixelHero = () => {
      const c = document.createElement('canvas');
      c.width = 20; c.height = PX_ROWS.length;
      const cc = c.getContext('2d')!;
      for (let r = 0; r < PX_ROWS.length; r++)
        for (let col = 0; col < 20; col++) {
          const ch = PX_ROWS[r].charAt(col);
          if (PX_PAL[ch]) { cc.fillStyle = PX_PAL[ch]; cc.fillRect(col, r, 1, 1); }
        }
      return c;
    };
    const heroCanvas = buildPixelHero();

    // Game state
    interface Player { x: number; y: number; w: number; h: number; vy: number; jump: boolean; ang: number; }
    interface Tire { x: number; y: number; r: number; rot: number; bob: number; golden: boolean; }
    interface Obstacle { x: number; w: number; type: 'cone' | 'pot' | 'barrier'; h: number; }
    interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; c: string; size: number; }
    interface Popup { x: number; y: number; txt: string; c: string; life: number; maxLife: number; }
    interface BgTruck { x: number; y: number; scale: number; factor: number; alpha: number; rot: number; type: string; cab: string; }
    interface Star { x: number; y: number; size: number; speed: number; }
    interface PowerUp { x: number; y: number; type: 'shield' | 'magnet' | 'slow' | 'wineW' | 'wineB'; r: number; bob: number; }

    interface GameState {
      player: Player;
      tires: Tire[];
      obstacles: Obstacle[];
      particles: Particle[];
      pops: Popup[];
      bgTrucks: BgTruck[];
      stars: Star[];
      powerUps: PowerUp[];
      score: number;
      tireCount: number;
      speed: number;
      frame: number;
      groundOff: number;
      inv: number;
      flash: number;
      running: boolean;
      over: boolean;
      combo: number;
      comboTimer: number;
      lives: number;
      shieldActive: boolean;
      shieldTimer: number;
      magnetActive: boolean;
      magnetTimer: number;
      slowActive: boolean;
      slowTimer: number;
      wingActive: boolean;
      wingTimer: number;
      gorillaActive: boolean;
      gorillaTimer: number;
      ping: { x: number };
      mer: { x: number };
      distanceTraveled: number;
      maxCombo: number;
    }

    const CAB_COLORS = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#2ecc71'];
    const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

    const initState = (): GameState => ({
      player: { x: 100, y: GROUND - HERO_H, w: heroW, h: HERO_H, vy: 0, jump: false, ang: 0 },
      tires: [],
      obstacles: [],
      particles: [],
      pops: [],
      bgTrucks: [],
      stars: [],
      powerUps: [],
      score: 0,
      tireCount: 0,
      speed: 5,
      frame: 0,
      groundOff: 0,
      inv: 0,
      flash: 0,
      running: true,
      over: false,
      combo: 0,
      comboTimer: 0,
      lives: 3,
      shieldActive: false,
      shieldTimer: 0,
      magnetActive: false,
      magnetTimer: 0,
      slowActive: false,
      slowTimer: 0,
      wingActive: false,
      wingTimer: 0,
      gorillaActive: false,
      gorillaTimer: 0,
      ping: { x: W + 300 },
      mer: { x: W * 0.55 },
      distanceTraveled: 0,
      maxCombo: 0
    });

    let state = initState();

    // Initialize background elements
    const initBg = () => {
      state.stars = [];
      for (let i = 0; i < 30; i++) {
        state.stars.push({ x: Math.random() * W, y: Math.random() * (GROUND - 100), size: Math.random() * 2 + 1, speed: Math.random() * 0.5 + 0.1 });
      }
      state.bgTrucks = [];
      for (let i = 0; i < 3; i++) {
        state.bgTrucks.push(createBgTruck(W * 0.3 + i * 300, i % 2 === 0));
      }
    };

    const createBgTruck = (x: number, far: boolean): BgTruck => ({
      x,
      y: far ? GROUND - 110 : GROUND - 40,
      scale: far ? 0.45 : 0.75,
      factor: far ? 0.18 : 0.38,
      alpha: far ? 0.7 : 0.95,
      rot: Math.random() * 6,
      type: Math.random() < 0.5 ? 'box' : 'flat',
      cab: pick(CAB_COLORS)
    });

    const spawnTire = () => {
      const floating = Math.random() < 0.3;
      state.tires.push({
        x: W + 40,
        y: floating ? GROUND - 140 - Math.random() * 40 : GROUND - 30,
        r: 22,
        rot: 0,
        bob: Math.random() * 6.28,
        golden: false
      });
    };

    const spawnSuperTire = () => {
      if (!state.tires.some(t => t.golden)) {
        state.tires.push({ x: W + 40, y: GROUND - 80, r: 28, rot: 0, bob: 0, golden: true });
      }
    };

    const spawnPowerUp = () => {
      const types: Array<'shield' | 'magnet' | 'slow' | 'wineW' | 'wineB'> = ['shield', 'magnet', 'slow', 'wineW', 'wineW', 'wineB', 'wineB'];
      state.powerUps.push({
        x: W + 40,
        y: GROUND - 100 - Math.random() * 60,
        type: types[Math.floor(Math.random() * types.length)],
        r: 18,
        bob: Math.random() * 6.28
      });
    };

    const spawnObstacle = () => {
      const types: Array<'cone' | 'pot' | 'barrier'> = ['cone', 'pot', 'barrier'];
      const type = types[Math.floor(Math.random() * types.length)];
      state.obstacles.push({
        x: W + 40,
        w: type === 'barrier' ? 55 : 38,
        type,
        h: type === 'barrier' ? 50 : type === 'cone' ? 40 : 14
      });
    };

    const addParticles = (x: number, y: number, color: string, count: number, spread: number = 7) => {
      for (let i = 0; i < count; i++) {
        state.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * spread,
          vy: -Math.random() * spread,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          c: color,
          size: 2 + Math.random() * 4
        });
      }
    };

    const addPopup = (x: number, y: number, txt: string, color: string) => {
      state.pops.push({ x, y, txt, c: color, life: 60, maxLife: 60 });
    };

    const startGame = () => {
      state = initState();
      state.player.w = heroW;
      state.player.y = GROUND - state.player.h;
      initBg();
      setGameStatus('playing');
      setScore(0);
      setTireCount(0);
      setLives(3);
      setCombo(0);
    };

    // Input handling
    const handleJump = () => {
      if (statusRef.current !== 'playing') return;
      if (!state.player.jump) {
        state.player.vy = state.wingActive ? JUMP_FORCE * 1.35 : JUMP_FORCE;
        state.player.jump = true;
        playSound('jump');
        addParticles(state.player.x + state.player.w / 2, GROUND, '#c8b88a', 5, 4);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (statusRef.current === 'menu' || statusRef.current === 'over') {
          startGame();
        } else if (statusRef.current === 'playing') {
          handleJump();
        }
      }
      if (e.code === 'KeyP') {
        if (statusRef.current === 'playing') setGameStatus('paused');
        else if (statusRef.current === 'paused') setGameStatus('playing');
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (statusRef.current === 'menu' || statusRef.current === 'over') {
        startGame();
      } else if (statusRef.current === 'playing') {
        handleJump();
      }
    };

    const handleClick = () => {
      if (statusRef.current === 'menu' || statusRef.current === 'over') {
        startGame();
      } else if (statusRef.current === 'playing') {
        handleJump();
      }
    };

    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    // ---- UPDATE ----
    const update = () => {
      if (!state.running || statusRef.current !== 'playing') return;
      state.frame++;

      const effectiveSpeed = state.slowActive ? state.speed * 0.5 : state.speed;
      state.distanceTraveled += effectiveSpeed;
      state.score += effectiveSpeed * 0.12;
      state.speed = Math.min(5 + state.frame * 0.003, MAX_SPEED);

      if (state.inv > 0) state.inv--;
      if (state.flash > 0) state.flash--;
      if (state.comboTimer > 0) {
        state.comboTimer--;
        if (state.comboTimer === 0) state.combo = 0;
      }
      if (state.shieldTimer > 0) { state.shieldTimer--; if (state.shieldTimer === 0) state.shieldActive = false; }
      if (state.magnetTimer > 0) { state.magnetTimer--; if (state.magnetTimer === 0) state.magnetActive = false; }
      if (state.slowTimer > 0) { state.slowTimer--; if (state.slowTimer === 0) state.slowActive = false; }
      if (state.wingTimer > 0) { state.wingTimer--; if (state.wingTimer === 0) state.wingActive = false; }
      if (state.gorillaTimer > 0) { state.gorillaTimer--; if (state.gorillaTimer === 0) state.gorillaActive = false; }

      // Background cameos scroll with the world
      state.ping.x -= effectiveSpeed * 0.55;
      if (state.ping.x < -160) state.ping.x = W + 250 + Math.random() * 300;
      state.mer.x -= effectiveSpeed * 0.3;
      if (state.mer.x < -120) state.mer.x = W + 500 + Math.random() * 400;

      // Mr Ping scream
      if (state.frame % 300 === 120) playSound('yayaya');

      // Player physics
      state.player.vy += state.wingActive ? GRAVITY * 0.55 : GRAVITY;
      state.player.y += state.player.vy;
      state.player.ang += effectiveSpeed * 0.02;
      state.player.w = heroW; // adopt real sprite width once loaded
      if (state.player.y >= GROUND - state.player.h) {
        state.player.y = GROUND - state.player.h;
        state.player.vy = 0;
        state.player.jump = false;
      }

      // Spawning
      if (state.frame % Math.max(35, 60 - Math.floor(state.speed * 2)) === 0) spawnTire();
      if (state.frame % 500 === 250) spawnSuperTire();
      if (state.frame % 800 === 400) spawnPowerUp();
      if (state.frame > 100 && state.frame % Math.max(40, 100 - Math.floor(state.speed * 3)) === 0) spawnObstacle();

      // Ground scroll
      state.groundOff = (state.groundOff + effectiveSpeed) % 60;

      // Background trucks
      if (state.frame % 150 === 0) state.bgTrucks.push(createBgTruck(W + 100, Math.random() < 0.5));
      state.bgTrucks.forEach(t => { t.x -= effectiveSpeed * t.factor; t.rot += effectiveSpeed * t.factor * 0.05; });
      state.bgTrucks = state.bgTrucks.filter(t => t.x > -250 * t.scale);

      // Stars
      state.stars.forEach(s => { s.x -= effectiveSpeed * s.speed; if (s.x < -5) { s.x = W + 5; s.y = Math.random() * (GROUND - 100); } });

      // Tires
      const footX = state.player.x + state.player.w * 0.5;
      const footY = state.player.y + state.player.h * 0.8;
      state.tires.forEach(t => {
        t.x -= effectiveSpeed;
        t.rot += effectiveSpeed * 0.05;
        t.bob += 0.08;
        // Magnet pull
        if (state.magnetActive) {
          const d = Math.hypot(t.x - footX, t.y - footY);
          if (d < 250) { t.x += (footX - t.x) * 0.15; t.y += (footY - t.y) * 0.15; }
        }
      });
      state.tires = state.tires.filter(t => t.x > -60);

      // Power-ups
      state.powerUps.forEach(p => { p.x -= effectiveSpeed; p.bob += 0.06; });
      state.powerUps = state.powerUps.filter(p => p.x > -40);

      // Obstacles
      state.obstacles.forEach(o => { o.x -= effectiveSpeed; });
      state.obstacles = state.obstacles.filter(o => o.x > -80);

      // Tire collection
      state.tires = state.tires.filter(t => {
        const d = Math.hypot(t.x - footX, t.y - footY);
        if (d < t.r + state.player.w * 0.4) {
          state.combo++;
          state.comboTimer = 120;
          if (state.combo > state.maxCombo) state.maxCombo = state.combo;
          const comboMult = Math.min(state.combo, 10);

          if (t.golden) {
            state.inv = 240;
            state.score += 150 * comboMult;
            state.flash = 30;
            addPopup(t.x, t.y - 30, `SUPER! x${comboMult}`, '#ffd23f');
            addParticles(t.x, t.y, '#ffd23f', 20);
            playSound('super');
          } else {
            state.tireCount++;
            state.score += 50 * comboMult;
            addPopup(t.x, t.y - 20, `+${50 * comboMult}`, '#ffd23f');
            addParticles(t.x, t.y, '#ffd23f', 8);
            if (state.combo > 2) playSound('combo', state.combo);
            else playSound('collect');
          }
          return false;
        }
        return true;
      });

      // Power-up collection
      state.powerUps = state.powerUps.filter(p => {
        const d = Math.hypot(p.x - footX, p.y - footY);
        if (d < p.r + state.player.w * 0.35) {
          switch (p.type) {
            case 'shield': state.shieldActive = true; state.shieldTimer = 360; break;
            case 'magnet': state.magnetActive = true; state.magnetTimer = 480; break;
            case 'slow': state.slowActive = true; state.slowTimer = 300; break;
            case 'wineW': state.wingActive = true; state.wingTimer = 600; break;
            case 'wineB': state.gorillaActive = true; state.gorillaTimer = 480; break;
          }
          const label = p.type === 'wineW' ? 'WHITE WINE! WINGS!' : p.type === 'wineB' ? 'BLACK WINE! GORILLA!' : p.type.toUpperCase() + '!';
          addPopup(p.x, p.y - 20, label, p.type === 'wineB' ? '#c678dd' : '#00ffaa');
          addParticles(p.x, p.y, '#00ffaa', 12);
          playSound('super');
          return false;
        }
        return true;
      });

      // Collision detection
      const pl = state.player.x + state.player.w * 0.25;
      const pr = state.player.x + state.player.w * 0.75;
      const pb = state.player.y + state.player.h;
      const pt = state.player.y + state.player.h * 0.15;

      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const o = state.obstacles[i];
        let hit = false;

        if (o.type === 'cone') {
          if (pr > o.x + 5 && pl < o.x + o.w - 5 && pb > GROUND - o.h && pt < GROUND) hit = true;
        } else if (o.type === 'pot') {
          if (pr > o.x + 4 && pl < o.x + o.w - 4 && pb > GROUND - o.h - 4) hit = true;
        } else if (o.type === 'barrier') {
          if (pr > o.x + 3 && pl < o.x + o.w - 3 && pb > GROUND - o.h && pt < GROUND) hit = true;
        }

        if (hit) {
          if (state.inv > 0 || state.shieldActive || state.gorillaActive) {
            addParticles(o.x + o.w / 2, GROUND - 20, '#ffffff', 15);
            addPopup(o.x, GROUND - 60, state.gorillaActive ? 'GORILLA SMASH!' : 'SMASHED!', '#ffffff');
            state.score += 30;
            state.obstacles.splice(i, 1);
            playSound('hit');
          } else {
            state.lives--;
            state.inv = 90;
            state.combo = 0;
            state.comboTimer = 0;
            addParticles(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2, '#ff5555', 25);
            playSound('hit');
            state.obstacles.splice(i, 1);

            if (state.lives <= 0) {
              state.running = false;
              state.over = true;
              addParticles(state.player.x + state.player.w / 2, state.player.y + state.player.h / 2, '#ff3333', 40, 10);
              playSound('gameover');
              const finalScore = Math.floor(state.score);
              setScore(finalScore);
              setTireCount(state.tireCount);
              setLives(0);
              setCombo(state.maxCombo);
              setGameStatus('over');
              if (finalScore > highRef.current) {
                setHighScore(finalScore);
                try { localStorage.setItem('sth_hi_v7', String(finalScore)); } catch (e) { /* ignore */ }
              }
            } else {
              setLives(state.lives);
            }
          }
        }
      }

      // Update particles
      state.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life--; });
      state.particles = state.particles.filter(p => p.life > 0);

      // Update popups
      state.pops.forEach(p => { p.y -= 1.2; p.life--; });
      state.pops = state.pops.filter(p => p.life > 0);

      // Update React HUD state periodically
      if (state.frame % 10 === 0) {
        setScore(Math.floor(state.score));
        setTireCount(state.tireCount);
        setLives(state.lives);
        setCombo(state.combo);
      }
    };

    // ---- DRAW ----
    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#4a8fd4');
      g.addColorStop(0.5, '#7cb8e8');
      g.addColorStop(0.85, '#b8d8f0');
      g.addColorStop(1, '#e8e4d8');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 200 - state.groundOff * 0.2) % (W + 200) + W + 200) % (W + 200) - 100;
        const cy = 30 + i * 22 + Math.sin(i * 1.5) * 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + i * 3, 0, 6.29);
        ctx.arc(cx + 22, cy + 5, 15 + i * 2, 0, 6.29);
        ctx.arc(cx - 18, cy + 6, 13 + i * 2, 0, 6.29);
        ctx.fill();
      }

      // Distant hills
      ctx.fillStyle = '#7fae6a';
      ctx.beginPath();
      ctx.moveTo(0, GROUND - 60);
      for (let x = 0; x <= W; x += 30) {
        ctx.lineTo(x, GROUND - 60 - 25 * Math.abs(Math.sin((x + state.groundOff * 0.5) * 0.007)));
      }
      ctx.lineTo(W, GROUND);
      ctx.lineTo(0, GROUND);
      ctx.fill();
    };

    const drawWheel = (wx: number, rot: number, r: number) => {
      ctx.fillStyle = '#1c1c1c';
      ctx.beginPath(); ctx.arc(wx, -r, r, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#5a5a5a';
      ctx.beginPath(); ctx.arc(wx, -r, r * 0.5, 0, 6.29); ctx.fill();
      ctx.strokeStyle = '#262626'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        const a = rot + i * 1.57;
        ctx.beginPath(); ctx.moveTo(wx, -r);
        ctx.lineTo(wx + Math.cos(a) * r * 0.85, -r + Math.sin(a) * r * 0.85); ctx.stroke();
      }
      ctx.fillStyle = '#9a9a9a';
      ctx.beginPath(); ctx.arc(wx, -r, r * 0.18, 0, 6.29); ctx.fill();
    };

    const drawBgTruck = (t: BgTruck) => {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);
      ctx.globalAlpha = t.alpha;

      // Road strip
      ctx.fillStyle = '#8d9399';
      ctx.fillRect(-30, -2, 220, 4);
      ctx.fillStyle = '#f4d03f';
      for (let dx = -20; dx < 200; dx += 22) ctx.fillRect(dx, -0.5, 10, 1.2);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath(); ctx.ellipse(-70, 2, 90, 4, 0, 0, 6.29); ctx.fill();

      // Cab
      ctx.fillStyle = t.cab;
      ctx.beginPath();
      ctx.moveTo(-28, -6); ctx.lineTo(-28, -28);
      ctx.quadraticCurveTo(-28, -34, -22, -34); ctx.lineTo(-10, -34);
      ctx.quadraticCurveTo(-4, -34, -3, -25); ctx.lineTo(-3, -6);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#bfe6f5';
      ctx.fillRect(-24, -30, 10, 8);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(-30, -12, 4, 6);

      if (t.type === 'box') {
        ctx.fillStyle = '#e8e8e8';
        ctx.fillRect(-140, -38, 110, 32);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 1;
        ctx.strokeRect(-140, -38, 110, 32);
        drawWheel(-18, t.rot, 7);
        drawWheel(-60, t.rot, 7);
        drawWheel(-120, t.rot, 7);
      } else {
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(-150, -12, 120, 4);
        ctx.fillStyle = '#b7410e';
        ctx.fillRect(-145, -28, 55, 16);
        ctx.fillStyle = '#2c5f8a';
        ctx.fillRect(-88, -28, 55, 16);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.8;
        for (let cx = -143; cx < -92; cx += 5) { ctx.beginPath(); ctx.moveTo(cx, -26); ctx.lineTo(cx, -14); ctx.stroke(); }
        for (let cx = -86; cx < -35; cx += 5) { ctx.beginPath(); ctx.moveTo(cx, -26); ctx.lineTo(cx, -14); ctx.stroke(); }
        drawWheel(-18, t.rot, 7);
        drawWheel(-100, t.rot, 7);
        drawWheel(-130, t.rot, 7);
      }

      ctx.restore();
    };

    // ---- Background cameos: Merhujus & Mr Ping ----
    const drawMer = () => {
      if (!merReady) return;
      const mh = 118;
      const mw = mh * (merImg.naturalWidth / merImg.naturalHeight);
      const mx = state.mer.x;
      const my = GROUND - mh + 6;
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(merImg, mx, my, mw, mh);
      ctx.restore();
      // Wine break: raises a bottle every few seconds
      const cycle = state.frame % 360;
      if (cycle > 140 && cycle < 200) {
        ctx.save();
        ctx.translate(mx + mw * 0.75, my + mh * 0.28);
        ctx.rotate(-0.9);
        ctx.fillStyle = '#e8f6d8';
        ctx.fillRect(-3, -12, 6, 14);
        ctx.fillRect(-1.5, -17, 3, 5);
        ctx.fillStyle = '#f2e9c8';
        ctx.fillRect(-2.5, -5, 5, 7);
        ctx.restore();
        // LadyBoy transformation shimmer
        ctx.fillStyle = 'rgba(255,150,220,0.25)';
        ctx.beginPath();
        ctx.ellipse(mx + mw / 2, my + mh / 2, mw * 0.75, mh * 0.55, 0, 0, 6.29);
        ctx.fill();
        ctx.fillStyle = '#ff9ade';
        ctx.font = 'bold 12px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('LADYBOY MODE!', mx + mw / 2, my - 24);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '10px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('MERHUJUS', mx + mw / 2, GROUND + 16);
    };

    const drawPing = () => {
      if (!pingReady) return;
      const ph2 = 104;
      const pw2 = ph2 * (pingImg.naturalWidth / pingImg.naturalHeight);
      const hop = Math.abs(Math.sin(state.frame * 0.07)) * 54;
      const px2 = state.ping.x;
      const py2 = GROUND - ph2 + 4 - hop;
      ctx.save();
      ctx.globalAlpha = 0.96;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(pingImg, px2, py2, pw2, ph2);
      ctx.restore();
      // YAYAYA scream bubble
      if (state.frame % 300 > 100 && state.frame % 300 < 190) {
        const bx = px2 + pw2 / 2, by = py2 - 26;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e33';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(bx, by, 46, 16, 0, 0, 6.29);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bx - 8, by + 13); ctx.lineTo(bx - 2, by + 24); ctx.lineTo(bx + 5, by + 13);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e33';
        ctx.font = 'bold 13px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('YAYAYA!', bx, by + 1);
        ctx.textBaseline = 'alphabetic';
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '10px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('MR PING aka YAYAYAHUJUS', px2 + pw2 / 2, GROUND + 16);
    };

    const drawRoad = () => {
      ctx.fillStyle = '#3a3a3f';
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let x = 0; x < W; x += 3) {
        if (Math.random() < 0.3) ctx.fillRect(x, GROUND + Math.random() * (H - GROUND), 2, 1);
      }
      ctx.fillStyle = '#f4d03f';
      for (let x = -state.groundOff; x < W; x += 55) ctx.fillRect(x, GROUND + 32, 30, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, GROUND + 3, W, 3);
      ctx.fillRect(0, H - 10, W, 3);
    };

    const drawTire = (t: Tire) => {
      const y = t.golden ? t.y + Math.sin(t.bob * 0.6) * 12 : t.y + Math.sin(t.bob) * 4;
      if (t.golden) {
        const glow = ctx.createRadialGradient(t.x, y, t.r * 0.5, t.x, y, t.r + 20);
        glow.addColorStop(0, 'rgba(255,210,63,0.4)');
        glow.addColorStop(1, 'rgba(255,210,63,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(t.x, y, t.r + 20, 0, 6.29); ctx.fill();
      }
      ctx.save();
      ctx.translate(t.x, y);
      ctx.rotate(t.rot);
      ctx.fillStyle = t.golden ? '#8B6914' : '#141414';
      ctx.beginPath(); ctx.arc(0, 0, t.r, 0, 6.29); ctx.fill();
      ctx.strokeStyle = t.golden ? '#ffd23f' : '#333';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 8; i++) {
        ctx.rotate(0.785);
        ctx.beginPath(); ctx.moveTo(t.r - 5, 0); ctx.lineTo(t.r + 2, 0); ctx.stroke();
      }
      ctx.fillStyle = t.golden ? '#ffe680' : '#555';
      ctx.beginPath(); ctx.arc(0, 0, t.r * 0.4, 0, 6.29); ctx.fill();
      ctx.fillStyle = t.golden ? '#8B6914' : '#2b2b2b';
      for (let i = 0; i < 5; i++) {
        const a = i * 1.256;
        ctx.beginPath(); ctx.arc(Math.cos(a) * t.r * 0.25, Math.sin(a) * t.r * 0.25, 2.5, 0, 6.29); ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath(); ctx.arc(t.x - t.r * 0.35, y - t.r * 0.4, t.r * 0.2, 0, 6.29); ctx.fill();
    };

    const drawPowerUp = (p: PowerUp) => {
      const y = p.y + Math.sin(p.bob) * 8;
      if (p.type === 'wineW' || p.type === 'wineB') {
        const dark = p.type === 'wineB';
        const glow = ctx.createRadialGradient(p.x, y, 4, p.x, y, 34);
        glow.addColorStop(0, dark ? 'rgba(160,60,200,0.45)' : 'rgba(255,255,220,0.45)');
        glow.addColorStop(1, dark ? 'rgba(160,60,200,0)' : 'rgba(255,255,220,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(p.x, y, 34, 0, 6.29); ctx.fill();
        // Big wine bottle
        ctx.save();
        ctx.translate(p.x, y);
        ctx.rotate(Math.sin(p.bob * 0.5) * 0.12);
        ctx.fillStyle = dark ? '#1a0a1e' : '#e8f6d8';
        ctx.fillRect(-9, -22, 18, 38);            // body
        ctx.fillRect(-4, -34, 8, 12);             // neck
        ctx.fillStyle = dark ? '#4a0e2e' : '#f2e9c8';
        ctx.fillRect(-7, -8, 14, 22);             // wine inside
        ctx.fillStyle = dark ? '#2e2e2e' : '#ffffff';
        ctx.fillRect(-9, -4, 18, 12);             // label
        ctx.fillStyle = dark ? '#c678dd' : '#7a9a4a';
        ctx.font = 'bold 7px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dark ? 'BLACK' : 'WHITE', 0, 1);
        ctx.fillText('WINE', 0, 7);
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(-3, -38, 6, 5);              // cork
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-9, -22, 18, 38);
        ctx.restore();
        ctx.textBaseline = 'alphabetic';
        return;
      }
      const colors: Record<string, string> = { shield: '#4488ff', magnet: '#ff44aa', slow: '#44ff88' };
      const icons: Record<string, string> = { shield: '🛡', magnet: '🧲', slow: '⏱' };
      const glow = ctx.createRadialGradient(p.x, y, p.r * 0.3, p.x, y, p.r + 15);
      glow.addColorStop(0, colors[p.type] + '88');
      glow.addColorStop(1, colors[p.type] + '00');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, y, p.r + 15, 0, 6.29); ctx.fill();
      ctx.fillStyle = colors[p.type];
      ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, 6.29); ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '16px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icons[p.type], p.x, y);
    };

    const drawObstacle = (o: Obstacle) => {
      if (o.type === 'cone') {
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(o.x + o.w / 2, GROUND - o.h);
        ctx.lineTo(o.x + o.w, GROUND);
        ctx.lineTo(o.x, GROUND);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(o.x + 8, GROUND - 22, o.w - 16, 6);
        ctx.fillRect(o.x + 12, GROUND - 34, o.w - 24, 5);
        ctx.fillStyle = '#d35400';
        ctx.fillRect(o.x - 3, GROUND - 4, o.w + 6, 5);
      } else if (o.type === 'pot') {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(o.x + o.w / 2, GROUND - 2, o.w / 2 + 4, 10, 0, 0, 6.29);
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(o.x + 5, GROUND - 8); ctx.lineTo(o.x + o.w - 5, GROUND + 2);
        ctx.moveTo(o.x + o.w - 8, GROUND - 6); ctx.lineTo(o.x + 8, GROUND + 3);
        ctx.stroke();
      } else if (o.type === 'barrier') {
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(o.x, GROUND - o.h, o.w, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(o.x, GROUND - o.h + 12, o.w, 10);
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(o.x, GROUND - o.h + 22, o.w, 12);
        ctx.fillStyle = '#888';
        ctx.fillRect(o.x + 5, GROUND - o.h + 34, 4, o.h - 34);
        ctx.fillRect(o.x + o.w - 9, GROUND - o.h + 34, 4, o.h - 34);
      }
    };

    const drawHero = () => {
      const bob = state.player.jump ? 0 : Math.sin(state.player.ang) * 3;
      const pw = state.player.w;
      const ph = state.player.h;
      const px = state.player.x;
      const py = state.player.y + bob;

      // Invincibility flash
      if (state.inv > 0 && Math.floor(state.inv / 4) % 2 === 0) ctx.globalAlpha = 0.5;

      // Shield visual
      if (state.shieldActive) {
        ctx.strokeStyle = 'rgba(68,136,255,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2, ph * 0.55, 0, 6.29);
        ctx.stroke();
      }

      // Super invincibility glow
      if (state.inv > 0) {
        const glow = ctx.createRadialGradient(px + pw / 2, py + ph / 2, 10, px + pw / 2, py + ph / 2, ph * 0.6);
        glow.addColorStop(0, 'rgba(255,210,63,0.3)');
        glow.addColorStop(1, 'rgba(255,210,63,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph / 2, ph * 0.6, 0, 6.29);
        ctx.fill();
      }

      // Ground shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath();
      ctx.ellipse(px + pw / 2, GROUND + 4, pw * 0.55 * (1 - (GROUND - (py + ph)) / 400), 5, 0, 0, 6.29);
      ctx.fill();

      // Wings from white wine (behind hero)
      if (state.wingActive) {
        const flap = Math.sin(state.frame * 0.3) * 10;
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.strokeStyle = '#d8e6ff';
        ctx.lineWidth = 2;
        for (const dir of [-1, 1]) {
          ctx.save();
          ctx.translate(px + pw / 2, py + ph * 0.3);
          ctx.beginPath();
          ctx.ellipse(dir * pw * 0.55, -flap, pw * 0.55, 16 + flap * 0.4, dir * -0.4, 0, 6.29);
          ctx.fill(); ctx.stroke();
          ctx.beginPath();
          ctx.ellipse(dir * pw * 0.45, 14 - flap * 0.6, pw * 0.4, 11, dir * -0.3, 0, 6.29);
          ctx.fill(); ctx.stroke();
          ctx.restore();
        }
      }

      // Draw hero: gorilla (black wine) > real sprite > pixel fallback
      if (state.gorillaActive && gorillaReady) {
        const gh = ph * 1.3;
        const gw = gh * (gorillaImg.naturalWidth / gorillaImg.naturalHeight);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(gorillaImg, px + pw / 2 - gw / 2, py + ph - gh, gw, gh);
        ctx.restore();
      } else if (heroReady) {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(heroImg, px, py, pw, ph);
        ctx.restore();
      } else {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(heroCanvas, px, py, pw, ph);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Speed lines when running
      if (!state.player.jump && state.running) {
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          const ly = py + 25 + i * 38 + Math.sin(state.player.ang + i) * 8;
          ctx.beginPath();
          ctx.moveTo(px - 5, ly);
          ctx.lineTo(px - 30 - Math.random() * 15, ly);
          ctx.stroke();
        }
      }

      // Magnet visual
      if (state.magnetActive) {
        ctx.strokeStyle = 'rgba(255,68,170,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + ph * 0.8, 100 + Math.sin(state.frame * 0.1) * 20, 0, 6.29);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const drawHUD = () => {
      // Score panel
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(8, 8, 180, 75);
      ctx.strokeStyle = '#7CFC00';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, 180, 75);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "Courier New"';
      ctx.fillText(`SCORE: ${Math.floor(state.score)}`, 16, 28);
      ctx.fillStyle = '#ffd23f';
      ctx.font = '14px "Courier New"';
      ctx.fillText(`TIRES: ${state.tireCount}`, 16, 48);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '12px "Courier New"';
      ctx.fillText(`HI: ${highRef.current}`, 16, 66);

      // Lives
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(W - 110, 8, 102, 30);
      ctx.strokeStyle = '#ff5555';
      ctx.lineWidth = 1;
      ctx.strokeRect(W - 110, 8, 102, 30);
      ctx.font = '18px serif';
      ctx.textAlign = 'right';
      for (let i = 0; i < state.lives; i++) {
        ctx.fillText('❤️', W - 15 - i * 28, 30);
      }

      // Combo
      if (state.combo > 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(W / 2 - 50, 8, 100, 28);
        ctx.strokeStyle = '#ff8800';
        ctx.lineWidth = 1;
        ctx.strokeRect(W / 2 - 50, 8, 100, 28);
        ctx.fillStyle = '#ff8800';
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO x${state.combo}`, W / 2, 27);
      }

      // Active power-ups
      let puY = 90;
      if (state.shieldActive) {
        ctx.fillStyle = 'rgba(68,136,255,0.7)';
        ctx.fillRect(8, puY, 80, 18);
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`🛡 ${Math.ceil(state.shieldTimer / 60)}s`, 14, puY + 13);
        puY += 22;
      }
      if (state.magnetActive) {
        ctx.fillStyle = 'rgba(255,68,170,0.7)';
        ctx.fillRect(8, puY, 80, 18);
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`🧲 ${Math.ceil(state.magnetTimer / 60)}s`, 14, puY + 13);
        puY += 22;
      }
      if (state.slowActive) {
        ctx.fillStyle = 'rgba(68,255,136,0.7)';
        ctx.fillRect(8, puY, 80, 18);
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`⏱ ${Math.ceil(state.slowTimer / 60)}s`, 14, puY + 13);
        puY += 22;
      }
      if (state.wingActive) {
        ctx.fillStyle = 'rgba(240,240,255,0.8)';
        ctx.fillRect(8, puY, 86, 18);
        ctx.fillStyle = '#334455';
        ctx.font = 'bold 10px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`WINGS ${Math.ceil(state.wingTimer / 60)}s`, 14, puY + 13);
        puY += 22;
      }
      if (state.gorillaActive) {
        ctx.fillStyle = 'rgba(120,60,160,0.8)';
        ctx.fillRect(8, puY, 86, 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`GORILLA ${Math.ceil(state.gorillaTimer / 60)}s`, 14, puY + 13);
        puY += 22;
      }

      // Invincibility indicator
      if (state.inv > 0) {
        ctx.fillStyle = '#ffd23f';
        ctx.font = 'bold 13px "Courier New"';
        ctx.textAlign = 'right';
        ctx.fillText(`★ SUPER ${Math.ceil(state.inv / 60)}s`, W - 16, 56);
      }

      // Speed indicator
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(W - 80, H - 30, 72, 22);
      ctx.fillStyle = '#7CFC00';
      ctx.font = '11px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText(`SPD: ${state.speed.toFixed(1)}`, W - 14, H - 14);
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      drawSky();
      state.bgTrucks.forEach(drawBgTruck);
      drawRoad();
      drawMer();
      drawPing();
      state.powerUps.forEach(drawPowerUp);
      state.tires.forEach(drawTire);
      state.obstacles.forEach(drawObstacle);
      drawHero();

      // Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, 6.29);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Popups
      state.pops.forEach(p => {
        ctx.fillStyle = p.c;
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(p.txt, p.x, p.y);
      });
      ctx.globalAlpha = 1;

      // Flash effect
      if (state.flash > 0) {
        ctx.fillStyle = `rgba(255,210,63,${state.flash / 60})`;
        ctx.fillRect(0, 0, W, H);
      }

      drawHUD();

      // Pause overlay
      if (statusRef.current === 'paused') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', W / 2, H / 2 - 10);
        ctx.font = '16px "Courier New"';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Press P to resume', W / 2, H / 2 + 25);
      }
    };

    // Game loop
    let rafId = 0;
    const loop = () => {
      update();
      draw();
      rafId = requestAnimationFrame(loop);
    };

    engineRef.current = { start: startGame };

    initBg();
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      engineRef.current = null;
      if (audioCtx) audioCtx.close();
    };
  }, []);

  const handleStart = () => {
    engineRef.current?.start();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[840px]">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-green-400 tracking-wider font-mono">
            BLACKHUJUS the GREEN HAIR STYLE
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-mono">
            Blackhujus collects black truck tires on the interstate. Gotta go fast-ish.
          </p>
        </div>

        {/* Game Container */}
        <div className="relative bg-black border-2 border-green-400 rounded-xl p-2 shadow-lg shadow-green-400/20">
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="w-full rounded-lg cursor-pointer block"
            style={{ imageRendering: 'pixelated', touchAction: 'manipulation' }}
          />

          {/* Menu Overlay */}
          {gameStatus === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-xl">
              <div className="text-center px-4">
                <img
                  src={HERO_PORTRAIT_URL}
                  alt="Blackhujus - the hero"
                  className="w-28 md:w-36 mx-auto mb-3 drop-shadow-[0_0_25px_rgba(74,222,128,0.35)]"
                />
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 font-mono mb-1">BLACKHUJUS</h2>
                <p className="text-green-300 text-lg font-mono mb-1">the GREEN HAIR STYLE</p>
                <p className="text-yellow-300 text-base font-mono mb-4">v8.0 - Wine & Gorilla Edition</p>
                <div className="space-y-1.5 mb-6">
                  <p className="text-gray-300 text-sm font-mono">🏃 Collect tires, avoid obstacles</p>
                  <p className="text-gray-300 text-sm font-mono">⭐ Grab golden tires for invincibility</p>
                  <p className="text-gray-300 text-sm font-mono">🛡🧲⏱ Power-ups: Shield, Magnet, Slow-mo</p>
                  <p className="text-gray-300 text-sm font-mono">🍷 White wine = WINGS — jump higher & longer</p>
                  <p className="text-gray-300 text-sm font-mono">🍇 Black wine = GORILLA MODE — smash everything</p>
                  <p className="text-gray-300 text-sm font-mono">❤️ 3 lives - combo for bonus points!</p>
                </div>
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold font-mono rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  ▶ START GAME
                </button>
                <p className="text-gray-500 text-xs mt-4 font-mono">SPACE / UP / TAP to jump • P to pause</p>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameStatus === 'over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-xl">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-red-500 font-mono mb-4">GAME OVER</h2>
                <div className="bg-gray-800/80 rounded-lg p-4 mb-6 border border-gray-600">
                  <p className="text-yellow-300 text-xl font-mono">Score: {score}</p>
                  <p className="text-gray-300 font-mono mt-1">Tires: {tireCount}</p>
                  <p className="text-gray-300 font-mono mt-1">Best Combo: x{combo}</p>
                  <p className="text-green-400 font-mono mt-2">High Score: {highScore}</p>
                  {score >= highScore && score > 0 && (
                    <p className="text-yellow-400 font-mono mt-2 animate-pulse">🏆 NEW HIGH SCORE! 🏆</p>
                  )}
                </div>
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-bold font-mono rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  ▶ PLAY AGAIN
                </button>
                <p className="text-gray-500 text-xs mt-3 font-mono">Press SPACE or tap to restart</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
              soundEnabled
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </button>
          <button
            onClick={() => {
              if (gameStatus === 'playing') setGameStatus('paused');
              else if (gameStatus === 'paused') setGameStatus('playing');
            }}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-mono text-sm hover:bg-yellow-500 transition-all"
          >
            {gameStatus === 'paused' ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-mono text-sm hover:bg-blue-500 transition-all"
          >
            🔄 Restart
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs font-mono">
            SPACE / UP / TAP = jump • P = pause • avoid cones, potholes & barriers • golden SUPER TIRE = invincible
          </p>
          <p className="text-gray-600 text-xs font-mono mt-1">
            Collect tires in sequence for combo multiplier • 🛡 Shield • 🧲 Magnet • ⏱ Slow-mo • 🍷 White wine = wings • 🍇 Black wine = gorilla
          </p>
        </div>
      </div>
    </div>
  );
}