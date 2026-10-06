'use client'

import { animate } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

function useStateToRef<T>(value:T) { const ref = useRef(value); ref.current=value; return ref; }

export const CountUp = (props: {
  to: number
  decimals: number
  duration: number
className?: string
}) => {
  const { to, className, decimals, duration } = props
  const [prev, setPrev] = useState(0)
  const [initialNumber, setInitialNumber] = useState(to)
  const initialNumberRef = useStateToRef(initialNumber)
  const nodeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setPrev(initialNumberRef.current)
    setInitialNumber(to)
  }, [to])
  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const controls = animate(prev || initialNumber, initialNumber, {
      duration,
      onUpdate(value) {
        node.textContent = value.toFixed(decimals)
      },
    })

    return () => controls.stop()
  }, [prev, initialNumber, decimals, duration])

  return <span className={className} ref={nodeRef} />
}
