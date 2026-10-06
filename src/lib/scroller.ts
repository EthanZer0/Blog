import { animateValue } from 'motion';
let cancel:(()=>void)|undefined;
export function springScrollToElement(element:HTMLElement,offset=-100) {
  cancel?.();
  const y=Math.max(0,element.getBoundingClientRect().top+scrollY+offset);
  if(matchMedia('(prefers-reduced-motion:reduce)').matches){scrollTo(0,y);return Promise.resolve();}
  return new Promise<void>(resolve=>{
    const cleanup=()=>{removeEventListener('wheel',stop);removeEventListener('touchmove',stop);};
    const stop=()=>{animation.stop();cleanup();resolve();};cancel=stop;
    const animation=animateValue({keyframes:[scrollY+1,y],type:'spring',stiffness:1000,damping:250,onUpdate:value=>scrollTo(0,value),onComplete:()=>{cleanup();resolve();}});
    addEventListener('wheel',stop,{passive:true});addEventListener('touchmove',stop,{passive:true});
  });
}
