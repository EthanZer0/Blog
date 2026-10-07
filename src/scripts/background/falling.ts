import type { BackgroundRenderer } from './types';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const between = (min: number, max: number) => min + Math.random() * (max - min);
type Flake = { x: number; y: number; depth: number; size: number; alpha: number; seed: number; rotation: number; spin: number; tilt: number; tumble: number };

// Locally drawn petals and six-arm snowflakes; no reference shader is bundled.
function sprites(snow: boolean) {
  return Array.from({ length: 6 }, (_, variant) => {
    const image = document.createElement('canvas');
    image.width = image.height = 128;
    const ctx = image.getContext('2d')!;
    if (snow) {
      ctx.translate(64, 64);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 51);
      gradient.addColorStop(0, '#f7fbff'); gradient.addColorStop(1, '#9eadc7');
      ctx.strokeStyle = gradient; ctx.lineCap = 'round'; ctx.lineWidth = 2.8 + variant * .35;
      for (let arm = 0; arm < 6; arm++) {
        ctx.save(); ctx.rotate(arm * Math.PI / 3);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -49);
        for (let branch = 1; branch <= 3; branch++) {
          const y = -branch * 12, length = 12 - branch * 1.8 + variant * .35;
          ctx.moveTo(0, y); ctx.lineTo(-length, y - length);
          ctx.moveTo(0, y); ctx.lineTo(length, y - length);
        }
        ctx.stroke(); ctx.restore();
      }
    } else {
      const petal = new Path2D();
      petal.moveTo(64, 111);
      petal.bezierCurveTo(22, 75, 24, 18, 46, 14);
      petal.quadraticCurveTo(56, 12, 64, 28 + variant);
      petal.quadraticCurveTo(73, 10, 86, 15);
      petal.bezierCurveTo(106, 27, 100, 79, 64, 111);
      const pink = ['#ffe5ed', '#ffd0df', '#ffc1d5', '#f6adc6', '#fff0f5', '#ef9abc'][variant];
      const gradient = ctx.createLinearGradient(64, 110, 64, 18);
      gradient.addColorStop(0, '#e985ac'); gradient.addColorStop(.48, pink); gradient.addColorStop(1, '#fff4f8');
      ctx.fillStyle = gradient; ctx.fill(petal);
      ctx.save(); ctx.clip(petal); ctx.strokeStyle = 'rgba(218, 108, 153, .15)'; ctx.lineWidth = .8;
      for (let vein = -2; vein <= 2; vein++) {
        ctx.beginPath(); ctx.moveTo(64, 108); ctx.quadraticCurveTo(64 + vein * 10, 65, 64 + vein * 17, 20); ctx.stroke();
      }
      ctx.restore();
    }
    return [0, 1, 2, 3].map(blur => {
      const softened = document.createElement('canvas'); softened.width = softened.height = 128;
      const target = softened.getContext('2d')!; target.filter = `blur(${blur}px)`; target.drawImage(image, 0, 0);
      return softened;
    });
  });
}

export function createFallingBackground(ctx: CanvasRenderingContext2D, snow: boolean): BackgroundRenderer {
  const images = sprites(snow);
  const settings = snow
    ? { density: Math.random() < .5 ? 1 : 2, speed: .5, intensity: .7, direction: between(45, 135), wind: between(10, 20), volume: 1, weight: 1, flutter: 1 }
    : { density: between(.8, 1.3), speed: between(.9, 1.1), intensity: between(.8, 1.2), direction: between(10, 60), wind: between(.6, 1.3), volume: between(.9, 1.2), weight: between(.9, 1.1), flutter: between(.8, 1.3) };
  let width = 0, height = 0, elapsed = 0;
  let flakes: Flake[] = [];
  function spawn(initial: boolean): Flake {
    const depth = Math.random(), near = 1 - depth;
    return {
      x: between(-width / 2 - 80, width / 2 + 80),
      y: -height / 2 - (snow ? 80 : 60) - Math.random() * (initial ? clamp(height * (snow ? 1.1 : 1), snow ? 500 : 400, snow ? 1600 : 1400) + 100 : 100),
      depth, size: snow ? 4 + near * 12 + Math.random() * 6 : 8 + near * 18 + Math.random() * 10,
      alpha: snow ? .25 + near * .55 + Math.random() * .15 : .35 + near * .45 + Math.random() * .15,
      seed: Math.random(), rotation: Math.random() * Math.PI * 2,
      spin: between(-1, 1) * (snow ? .6 + near * 1.2 : .8 + near * .8), tilt: Math.random() * Math.PI * 2, tumble: between(-1.5, 1.5),
    };
  }
  return {
    resize(w, h) {
      width = w; height = h;
      const count = Math.floor(clamp(w * h / (snow ? 12000 : 18000), snow ? 120 : 60, snow ? 700 : 400) * settings.density);
      flakes = Array.from({ length: count }, () => spawn(true));
    },
    draw(_now, dt) {
      elapsed += dt; ctx.clearRect(0, 0, width, height);
      const direction = settings.direction * Math.PI / 180;
      const wind = settings.wind * Math.max(0, snow ? 20 + Math.sin(elapsed * .5) + .5 * Math.sin(elapsed * 1.5) : 15 + 1.5 * Math.sin(elapsed * .3) + .8 * Math.sin(elapsed * .8) + .3 * Math.sin(elapsed * 1.5));
      for (let index = 0; index < flakes.length; index++) {
        const flake = flakes[index], near = 1 - flake.depth;
        const ratio = clamp((flake.size * settings.volume - (snow ? 4 : 8) * settings.volume) / ((snow ? 18 : 28) * settings.volume), 0, 1);
        const drag = 1 / (1 + (snow ? .15 + .55 * ratio : .2 + .4 * ratio) * (snow ? 1.5 : 1.2));
        const amplitude = (snow ? 10 + 15 * near : 15 + 20 * near) * drag * (1 + (.5 - ratio) * (snow ? .6 : .8)) / settings.weight * settings.flutter;
        const frequency = .6 + .4 * flake.seed;
        const sway = snow ? Math.sin(elapsed * .8 + flake.seed * 10) + Math.cos(elapsed * 1.3 + flake.y * .002)
          : 1.2 * Math.sin(elapsed * frequency + flake.seed * 15) + .8 * Math.cos(elapsed * frequency * 1.7 + flake.y * .003) + .5 * Math.sin(elapsed * frequency * .5 + flake.seed * 8);
        const breeze = wind * (snow ? .6 + .8 * near : .5 + .7 * near) * drag / settings.weight;
        const bob = snow ? Math.sin(elapsed * 1.1 + flake.seed * 12) + Math.cos(elapsed * .9 + flake.x * .002)
          : Math.sin(elapsed * frequency * .8 + flake.seed * 12) + Math.cos(elapsed * frequency * .6 + flake.x * .002);
        flake.x += (breeze * Math.cos(direction) + sway * amplitude) * dt;
        const downward = (snow ? 40 + 80 * near : 25 + 50 * near) * settings.speed * settings.intensity * drag * settings.weight;
        flake.y += Math.max((snow ? 15 : 8) * settings.speed * settings.intensity * drag * settings.weight, downward + breeze * Math.sin(direction) + bob * amplitude * (snow ? .2 : .15)) * dt;
        flake.rotation += flake.spin * dt;
        if (!snow) {
          flake.tilt += flake.tumble * dt;
          flake.spin += (.5 * Math.sin(elapsed * 2 + flake.seed * 20) - flake.spin * .1) * dt;
          flake.tumble += (.8 * Math.cos(elapsed * 1.5 + flake.seed * 15) - flake.tumble * .1) * dt;
        }
        if (flake.y > height / 2 + 100) { flakes[index] = spawn(false); continue; }
        if (flake.x > width / 2 + 100) flake.x = -width / 2 - 100;
        if (flake.x < -width / 2 - 100) flake.x = width / 2 + 100;
        const distance = .25 + flake.depth * (snow ? 1.45 : 1.25);
        const size = clamp(flake.size * settings.volume / distance, snow ? 2 : 4, snow ? 32 : 45);
        const blur = clamp((distance - (snow ? .78 : .75)) / (snow ? .92 : .75) * (snow ? 1.26 : 1), 0, 1);
        ctx.save(); ctx.translate(flake.x / distance + width / 2, flake.y / distance + height / 2);
        if (!snow) ctx.scale(Math.max(.2, Math.abs(Math.cos(flake.tilt))), Math.max(.35, Math.abs(Math.cos(flake.tilt * .7 + .5))));
        ctx.rotate(flake.rotation);
        ctx.globalAlpha = clamp(flake.alpha * (snow ? .9 + .1 * near : .85 + .15 * near) * settings.intensity * (1 - blur * .1), 0, 1);
        ctx.drawImage(images[Math.floor(flake.seed * images.length)][Math.round(blur * 3)], -size / 2, -size / 2, size, size);
        ctx.restore();
      }
    },
  };
}
