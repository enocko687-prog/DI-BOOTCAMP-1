import { useState } from 'react'
import Garage from './Garage'

function Car({ carInfo }) {
  const [color] = useState('red')

  return (
    <>
      <h3>This car is {color} {carInfo.model}</h3>
      <p className="detail-line">Manufacturer: {carInfo.name}</p>
      <Garage size="small" />
    </>
  )
}

export default Car