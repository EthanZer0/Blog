// Shiroi's seasonal component is not in the public Shiro source snapshot.
// Draw our own ginkgo sprites; match the reference's autumn motion parameters.
type Leaf = {
  x: number; y: number; depth: number; size: number; alpha: number;
  seed: number; rotation: number; spin: number; tilt: number; tumble: number; phase: number;
};
const TAU = Math.PI * 2;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function createSprites() {
  const colors = ['#ffe040', '#faeb80', '#fad12e', '#f2bf26', '#f5b833', '#d9a640'];
  return colors.map((color, variant) => {
    const leaf = document.createElement('canvas');
    leaf.width = leaf.height = 128;
    const ctx = leaf.getContext('2d')!;
    const fan = new Path2D();
    const stem = { x: 64, y: 87 };
    fan.moveTo(stem.x, stem.y);
    // A broad, gently scalloped fan, with a shallow central cleft on some leaves.
    for (let i = 0; i <= 64; i++) {
      const angle = -1.35 + i / 64 * 2.7;
      const cleft = variant % 3 ? 10 * Math.max(0, 1 - Math.abs(angle) / .18) : 0;
      const radius = 72 + 3 * Math.sin(angle * (6 + variant) + variant) - cleft;
      fan.lineTo(stem.x + Math.sin(angle) * radius * .78, stem.y - Math.cos(angle) * radius);
    }
    fan.closePath();
    const fill = ctx.createLinearGradient(64, 90, 64, 18);
    fill.addColorStop(0, '#c4a047');
    fill.addColorStop(.45, color);
    fill.addColorStop(1, color);
    ctx.fillStyle = fill;
    ctx.fill(fan);
    ctx.save();
    ctx.clip(fan);
    ctx.strokeStyle = 'rgba(255, 249, 190, .22)';
    ctx.lineWidth = .65;
    for (let i = -5; i <= 5; i++) {
      const angle = i * .23;
      ctx.beginPath();
      ctx.moveTo(stem.x, stem.y);
      ctx.lineTo(stem.x + Math.sin(angle) * 72 * .78, stem.y - Math.cos(angle) * 72);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = '#c8a348';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(64, 87);
    ctx.lineTo(63, 113);
    ctx.stroke();
    // Cache depth softness once instead of applying filters to every frame.
    return [0, .7, 1.4, 2.1].map(blur => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = 128;
      const target = sprite.getContext('2d')!;
      target.filter = `blur(${blur}px)`;
      target.drawImage(leaf, 0, 0);
      return sprite;
    });
  });
}

export function mountAutumnBackground() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-autumn-background]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const mobile = matchMedia('(max-width: 1024px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let sprites: ReturnType<typeof createSprites> | undefined;
  let width = 0, height = 0, frame = 0, lastTime = 0, elapsed = 0;
  let leaves: Leaf[] = [];

  function spawn(initial: boolean): Leaf {
    const depth = Math.random();
    return {
      x: (Math.random() - .5) * (width + 110),
      y: -height / 2 - 45 - Math.random() * 70 - (initial ? Math.random() * clamp(height * .85, 320, 1100) : 0),
      depth, size: 14 + (1 - depth) * 20 + Math.random() * 10,
      alpha: .5 + (1 - depth) * .35 + Math.random() * .12,
      seed: Math.random(), rotation: Math.random() * TAU, spin: (Math.random() - .5) * 1.6,
      tilt: Math.random() * TAU, tumble: (Math.random() - .5) * 3, phase: Math.random() * TAU,
    };
  }

  function resize() {
    if (width === innerWidth && height === innerHeight) return;
    width = innerWidth; height = innerHeight;
    // Reference uses CSS-pixel resolution; retain the same soft distant edges.
    canvas!.width = width; canvas!.height = height;
    leaves = Array.from({ length: Math.round(clamp(width * height / 20000, 45, 280)) }, () => spawn(true));
  }

  function draw(now: number) {
    const dt = lastTime ? clamp((now - lastTime) / 1000, .001, .05) : 0;
    lastTime = now; elapsed += dt;
    ctx!.clearRect(0, 0, width, height);
    const wind = 12 + 4 * (.5 * Math.sin(elapsed * .2) + .5) * Math.sin(elapsed * .8) * 1.5;
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      const near = 1 - leaf.depth;
      const drag = 1.1 / (1.15 + .3 * clamp((leaf.size - 14) / 30, 0, 1));
      const frequency = .5 + .3 * leaf.seed;
      const amplitude = (18 + 22 * near) * drag;
      const sway = (Math.sin(elapsed * frequency + leaf.phase) + .4 * Math.sin(elapsed * frequency * 1.8 + leaf.seed * 5)) * amplitude;
      const breeze = wind * (.45 + .55 * near) * drag;
      leaf.x += (breeze * Math.cos(50 * Math.PI / 180) + sway * .4) * dt;
      leaf.y += Math.max(10 * drag, (28 + 55 * near) * drag + breeze * Math.sin(50 * Math.PI / 180) + Math.cos(elapsed * frequency * .7 + leaf.phase) * amplitude * .15) * dt;
      leaf.spin += (sway * .03 - leaf.spin) * .1;
      leaf.rotation += leaf.spin * dt;
      leaf.tilt += leaf.tumble * dt;
      leaf.tumble += (.8 * Math.sin(elapsed * 1.2 + leaf.seed * 10) - leaf.tumble * .08) * dt;
      if (leaf.y > height / 2 + 60) { leaves[i] = spawn(false); continue; }
      if (leaf.x > width / 2 + 60) leaf.x = -width / 2 - 60;
      if (leaf.x < -width / 2 - 60) leaf.x = width / 2 + 60;
      const distance = .28 + leaf.depth * 1.07;
      const size = clamp(leaf.size / distance, 8, 50);
      const blur = clamp((distance - .7) / .65 * .8, 0, 1);
      ctx!.save();
      ctx!.translate(leaf.x / distance + width / 2, leaf.y / distance + height / 2);
      ctx!.scale(Math.max(.2, Math.abs(Math.cos(leaf.tilt))), Math.max(.35, Math.abs(Math.cos(leaf.tilt * .7 + .5))));
      ctx!.rotate(-leaf.rotation);
      ctx!.globalAlpha = clamp(leaf.alpha * (.82 + .18 * near) * (1 - blur * .2) * 1.1, 0, 1);
      const sprite = sprites![Math.floor(leaf.seed * sprites!.length)][Math.round(blur * 3)];
      ctx!.drawImage(sprite, -size / 2, -size / 2, size, size);
      ctx!.restore();
    }
    frame = requestAnimationFrame(draw);
  }

  function update() {
    const hidden = mobile.matches || reducedMotion.matches || !!document.querySelector('[data-article-body]');
    canvas!.hidden = hidden;
    if (hidden || document.hidden) {
      cancelAnimationFrame(frame); frame = 0; lastTime = 0;
      return;
    }
    resize();
    sprites ??= createSprites();
    if (!frame) frame = requestAnimationFrame(draw);
  }

  // Persist one canvas across Astro swaps; never accumulate animation loops.
  document.addEventListener('astro:page-load', update);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('resize', update, { passive: true });
  mobile.addEventListener('change', update);
  reducedMotion.addEventListener('change', update);
  update();
}
