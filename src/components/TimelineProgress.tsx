'use client'

import { useEffect, useState } from 'react'

import { CountUp } from './upstream/CountUp'
import {
  dayOfYear,
  daysOfYear,
  secondOfDay,
  secondOfDays,
} from './upstream/datetime'

const PROGRESS_DURATION = 2
export const TimelineProgress = () => {
  const [percentOfYear, setPercentYear] = useState(0)
  const [percentOfDay, setPercentDay] = useState(0)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentDay, setCurrentDay] = useState(dayOfYear())

  function updatePercent() {
    setCurrentDay(dayOfYear())
    setCurrentYear(new Date().getFullYear())
    const nowY = (dayOfYear() / daysOfYear(new Date().getFullYear())) * 100
    const nowD = (secondOfDay() / secondOfDays) * 100
    if (nowY !== percentOfYear) {
      setPercentYear(nowY)
    }
    setPercentDay(nowD)
  }
  useEffect(() => {
    updatePercent()
    const timer = setInterval(updatePercent, 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  return (
    <>
      <p>
        <span className="shrink-0">今天是 {currentYear} 年的第</span>
        <CountUp
          to={currentDay}
          className="mx-1"
          decimals={0}
          duration={PROGRESS_DURATION}
        />
        <span className="shrink-0">天</span>
      </p>
      <p>
        今年已过{' '}
        <CountUp to={percentOfYear} decimals={6} duration={PROGRESS_DURATION} />
        %
      </p>
      <p>
        今天已过{' '}
        <CountUp to={percentOfDay} decimals={6} duration={PROGRESS_DURATION} />%
      </p>
    </>
  )
}

export default TimelineProgress;
