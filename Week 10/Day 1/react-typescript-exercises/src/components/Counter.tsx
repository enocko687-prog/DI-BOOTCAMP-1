import { useState } from "react";

type LastAction = "None yet" | "Incremented" | "Decremented";

function Counter() {
  const [count, setCount] = useState<number>(0);
  const [lastAction, setLastAction] = useState<LastAction>("None yet");

  function increment() {
    setCount((currentCount) => currentCount + 1);
    setLastAction("Incremented");
  }

  function decrement() {
    setCount((currentCount) => currentCount - 1);
    setLastAction("Decremented");
  }

  return (
    <div className="counter-content">
      <p className="counter-value" aria-live="polite">
        {count}
      </p>
      <div className="counter-controls">
        <button
          className="counter-button secondary-button"
          type="button"
          onClick={decrement}
          aria-label="Decrement counter"
        >
          −
        </button>
        <button
          className="counter-button primary-button"
          type="button"
          onClick={increment}
          aria-label="Increment counter"
        >
          +
        </button>
      </div>
      <p className="muted-copy action-label">
        Last action: <span>{lastAction}</span>
      </p>
    </div>
  );
}

export default Counter;
