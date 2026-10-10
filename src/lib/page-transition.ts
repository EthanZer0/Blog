import type { TransitionAnimationPair, TransitionDirectionalAnimations } from 'astro';

// Astro generates native View Transition rules and its non-native fallback.
const page: TransitionAnimationPair = {
  old: { name: 'page-leave', duration: '80ms', easing: 'ease-out', fillMode: 'both' },
  new: { name: 'page-enter', duration: '340ms', delay: '80ms', easing: 'cubic-bezier(.22, 1, .36, 1)', fillMode: 'both' },
};
export const pageTransition: TransitionDirectionalAnimations = { forwards: page, backwards: page };
