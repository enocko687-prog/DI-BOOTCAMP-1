import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Exercises from './exersice xp.js'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Exercises />
  </StrictMode>,
)
