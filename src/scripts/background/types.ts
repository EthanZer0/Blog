export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type BackgroundMode = Season | 'auto' | 'none';
export type BackgroundEffect = 'sakura' | 'fireflies' | 'autumn' | 'snow' | 'particles';
export interface BackgroundRenderer {
  resize(width: number, height: number): void;
  draw(now: number, delta: number): void;
  pointerDown?(x: number, y: number): void;
}

export function selectBackground(mode: BackgroundMode, dark: boolean, date = new Date()): BackgroundEffect | null {
  if (mode === 'none') return null;
  const month = date.getMonth();
  const season = mode === 'auto'
    ? month === 11 || month === 0 ? 'winter' : month <= 4 ? 'spring' : month <= 7 ? 'summer' : 'autumn'
    : mode;
  if (season === 'spring') return 'sakura';
  if (season === 'autumn') return 'autumn';
  if (!dark) return 'particles';
  return season === 'winter' ? 'snow' : 'fireflies';
}
