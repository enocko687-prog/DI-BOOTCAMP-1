import { useEffect, useState } from 'react'

function Clock() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const tick = () => {
    setCurrentDate(new Date())
  }

  useEffect(() => {
    const intervalId = setInterval(tick, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="clock-panel" aria-label="Local time">
      <p className="clock-time" aria-live="off">
        {currentDate.toLocaleTimeString()}
      </p>
      <p className="clock-date">{currentDate.toLocaleDateString()}</p>
    </div>
  )
}

export default Clock