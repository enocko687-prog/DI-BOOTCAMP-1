import { useState } from 'react'

function Phone() {
  const [brand] = useState('Samsung')
  const [model] = useState('Galaxy S20')
  const [color, setColor] = useState('black')
  const [year] = useState(2020)

  const changeColor = () => {
    setColor('blue')
  }

  return (
    <>
      <div className="phone-details">
        <p>Brand: <strong>{brand}</strong></p>
        <p>Model: <strong>{model}</strong></p>
        <p>Color: <strong>{color}</strong></p>
        <p>Year: <strong>{year}</strong></p>
      </div>
      <div className="control-row">
        <button type="button" onClick={changeColor}>Change color</button>
      </div>
    </>
  )
}

export default Phone