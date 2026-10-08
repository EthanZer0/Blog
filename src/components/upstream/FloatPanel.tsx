import type { Placement, Strategy } from '@floating-ui/react-dom'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom'
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react'
import type { FC, PropsWithChildren } from 'react'
import { cloneElement, useEffect, useMemo, useState } from 'react'
import { flushSync } from 'react-dom'

import { clsxm } from './adapters'

import { RootPortal } from './adapters'

interface FloatPanelProps {
  triggerElement: Parameters<typeof cloneElement>[0]
  strategy?: Strategy
  placement?: Placement
}

export const FloatPanel: FC<FloatPanelProps & PropsWithChildren> = (props) => {
  const {
    triggerElement,
    strategy = 'fixed',
    placement = 'right',
    children,
  } = props

  const reduced = useReducedMotion()
  const [panelOpen, setPanelOpen] = useState(false)
  const [portalKey, setPortalKey] = useState(0)

  const { isPositioned, refs, x, y, elements } = useFloating({
    strategy,
    placement,
    middleware: [flip({ padding: 20 }), offset(10), shift({ padding: 16, crossAxis: true })],
    whileElementsMounted: autoUpdate,
  })

  useEffect(() => {
    const reset = () => flushSync(() => { setPanelOpen(false); setPortalKey(key => key + 1) })
    document.addEventListener('astro:before-swap', reset)
    return () => document.removeEventListener('astro:before-swap', reset)
  }, [])
  useEffect(() => {
    if (!panelOpen) return
    const outside = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element) || target.closest('[role="listbox"]')) return
      if (!(elements.reference instanceof Element && elements.reference.contains(target)) && !elements.floating?.contains(target)) setPanelOpen(false)
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented && !document.querySelector('[role="listbox"]')) setPanelOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [panelOpen, elements])

  return (
    <>
      {useMemo(
        () =>
          cloneElement(triggerElement, {
            // @ts-ignore
            ref: refs.setReference,
            onClick: () => {
              setPanelOpen((v) => !v)
            },
          }),
        [refs.setReference, triggerElement],
      )}

      <RootPortal key={portalKey}>
        <AnimatePresence>
          {panelOpen && (
            <m.div
              initial={reduced ? false : { opacity: 0.02, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.02, y: reduced ? 0 : 10 }}
              transition={reduced ? { duration: 0 } : undefined}
              className={clsxm(
                'shadow-out-sm! focus:shadow-out-sm! focus-visible:shadow-out-sm!',
                'rounded-xl border border-zinc-400/20 p-4 shadow-lg outline-hidden backdrop-blur-lg dark:border-zinc-500/30',
                'bg-zinc-50/80 dark:bg-neutral-900/80',

                'relative z-[2] [&>main]:max-w-full',
              )}
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? '',
                left: x ?? '',
                maxWidth: 'calc(100vw - 32px)',
                maxHeight: 'calc(100dvh - 32px)',
                overflowY: 'auto',
                visibility: isPositioned && x !== null ? 'visible' : 'hidden',
              }}
            >
              {children}
            </m.div>
          )}
        </AnimatePresence>
      </RootPortal>
    </>
  )
}
