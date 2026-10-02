import { useState } from 'react'

function Events() {
  const [isToggleOn, setIsToggleOn] = useState(true)

  const clickMe = () => {
    alert('I was clicked')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      alert(event.currentTarget.value)
    }
  }

  const toggleButton = () => {
    setIsToggleOn((currentValue) => !currentValue)
  }

  return (
    <>
      <div className="control-row">
        <button type="button" onClick={clickMe}>Click me</button>
        <button type="button" onClick={toggleButton}>
          {isToggleOn ? 'ON' : 'OFF'}
        </button>
      </div>
      <input
        type="text"
        aria-label="Type a message and press Enter"
        placeholder="Type a message and press Enter"
        onKeyDown={handleKeyDown}
      />
    </>
  )
}

export default Events