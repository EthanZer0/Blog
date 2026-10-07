import type { BackgroundRenderer } from './types';

type Particle = { x: number; y: number; size: number; speed: number; angle: number; phase: number; glow: number; alpha: number; fade: number; scared: number; color: number };
const fireflyColors = ['#ccff66', '#66ff66', '#66ccff'];
const pastelColors = ['#bf91ae', '#8fb3c5', '#a0bea0', '#c6ae85', '#aba0cc', '#cea18e'];

function createQuietParticles(ctx: CanvasRenderingContext2D): BackgroundRenderer {
  type Dot = { x: number; y: number; radius: number; speed: number; angle: number; phase: number; alpha: number; color: string };
  let width = 0, height = 0, elapsed = 0;
  let dots: Dot[] = [];
  return {
    resize(w, h) {
      width = w; height = h;
      // One jittered dot per cell gives even, sparse coverage without side bias.
      const columns = Math.ceil(w / 170), rows = Math.ceil(h / 170);
      dots = Array.from({ length: columns * rows }, (_, index) => ({
        x: (index % columns + .15 + Math.random() * .7) * w / columns,
        y: (Math.floor(index / columns) + .15 + Math.random() * .7) * h / rows,
        radius: 1.3 + Math.random() * .8,
        speed: 2 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        alpha: .75 + Math.random() * .15,
        color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      }));
    },
    draw(_now, dt) {
      elapsed += dt; ctx.clearRect(0, 0, width, height);
      for (const dot of dots) {
        const angle = dot.angle + .35 * Math.sin(elapsed * .13 + dot.phase);
        dot.x = (dot.x + Math.cos(angle) * dot.speed * dt + width) % width;
        dot.y = (dot.y + Math.sin(angle) * dot.speed * dt + height) % height;
        ctx.globalAlpha = dot.alpha;
        ctx.fillStyle = dot.color;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
  };
}

export function createParticleBackground(ctx: CanvasRenderingContext2D, fireflies: boolean): BackgroundRenderer {
  if (!fireflies) return createQuietParticles(ctx);
  let width = 0, height = 0, elapsed = 0;
  let particles: Particle[] = [];
  // Radial sprites are cached; drawImage does all per-frame compositing.
  const images = fireflyColors.map(color => {
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
    const paint = sprite.getContext('2d')!;
    const glow = paint.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, color); glow.addColorStop(.18, color); glow.addColorStop(.5, `${color}45`); glow.addColorStop(1, 'transparent');
    paint.fillStyle = glow; paint.fillRect(0, 0, 64, 64); return sprite;
  });
  function spawn(): Particle {
    const content = Math.min(1280, width * .9), gutter = (width - content) / 2;
    const edge = gutter > 50 && Math.random() < .85;
    const left = Math.random() < .5;
    const x = edge ? left ? Math.random() * gutter : width - Math.random() * gutter : gutter + Math.random() * content;
    const y = edge ? Math.random() * height : Math.random() < .5 ? Math.random() * height * .25 : height * (.75 + Math.random() * .25);
    return { x, y, size: Math.random() + .4, speed: Math.random() * .3 + .2, angle: Math.random() * Math.PI * 2, phase: Math.random() * Math.PI * 2, glow: Math.random() * .5 + .5, alpha: .4 + Math.random() * .6, fade: 1, scared: 0, color: Math.floor(Math.random() * images.length) };
  }
  return {
    resize(w, h) {
      width = w; height = h;
      particles = Array.from({ length: Math.floor(w * h / 60000) }, spawn);
    },
    pointerDown(x, y) {
      for (const particle of particles) {
        if (Math.hypot(particle.x - x, particle.y - y) < 150) {
          particle.scared = 1 + Math.random() * .5; particle.angle = Math.atan2(particle.y - y, particle.x - x);
        }
      }
    },
    draw(_now, dt) {
      elapsed += dt; ctx.clearRect(0, 0, width, height);
      const frames = dt * 60, content = Math.min(1280, width * .9), gutter = (width - content) / 2;
      for (let index = 0; index < particles.length; index++) {
        const particle = particles[index];
        const scared = particle.scared > 0;
        particle.angle += (Math.random() - .5) * .1 * frames;
        particle.x += Math.cos(particle.angle) * particle.speed * (scared ? 3 : 1) * frames;
        particle.y += Math.sin(particle.angle) * particle.speed * (scared ? 3 : 1) * frames;
        particle.scared = Math.max(0, particle.scared - dt);
        const inset = .2;
        const inside = particle.x > gutter + content * inset && particle.x < width - gutter - content * inset && particle.y > height * inset && particle.y < height * (1 - inset);
        particle.fade = Math.max(0, Math.min(1, particle.fade + (inside ? -.02 : .05) * frames));
        if ((inside && particle.fade === 0 && gutter > 50) || particle.x < -20 || particle.x > width + 20 || particle.y < -20 || particle.y > height + 20) { particles[index] = spawn(); continue; }
        const brightness = Math.abs(Math.sin(elapsed * particle.glow));
        const pulse = .7 + .3 * Math.sin(elapsed * brightness * 2 + particle.phase);
        ctx.globalAlpha = Math.max(0, Math.min(1, brightness * pulse * particle.fade * particle.alpha));
        const size = particle.size * 10;
        ctx.drawImage(images[particle.color], particle.x - size / 2, particle.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    },
  };
}
