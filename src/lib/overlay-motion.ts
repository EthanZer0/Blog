import { useMemo } from 'react';
import { useReducedMotion, type Transition } from 'motion/react';

// Shared by Motion panels and native Radix/Vaul animations.
const enterSeconds = .24, exitSeconds = .18;
const ease: [number, number, number, number] = [.22, 1, .36, 1];
export const overlayTokens = {
  '--overlay-enter-duration': `${enterSeconds * 1000}ms`,
  '--overlay-exit-duration': `${exitSeconds * 1000}ms`,
  '--overlay-ease': `cubic-bezier(${ease.join(",")})`,
};
const transition = (reduced: boolean, closing = false): Transition => ({
  type: 'tween', duration: reduced ? 0 : closing ? exitSeconds : enterSeconds, ease,
});
export function useOverlayMotion(centered = false) {
  const reduced = !!useReducedMotion();
  return useMemo(() => ({
    initial: reduced ? false as const : { opacity: 0, y: 8, ...(centered ? { scale: .98 } : {}) },
    animate: { opacity: 1, y: 0, ...(centered ? { scale: 1 } : {}), transition: transition(reduced) },
    exit: { opacity: 0, y: reduced ? 0 : 8, ...(centered ? { scale: reduced ? 1 : .98 } : {}), transition: transition(reduced, true) },
    transition: transition(reduced),
  }), [reduced, centered]);
}
