import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import RandomQuoteGenerator from './Miniproject random quote generator.js'
import Calculator from './Daily challange calculator.js'
import SnapshotGallery from './mini project day snap shot.js'
import './styles.css'
import './snapshot.css'
import './Daily challange calculator.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/SnapScout/mountain" />} />
        <Route path="/SnapScout/:category" element={<SnapshotGallery />} />
        <Route path="/search" element={<SnapshotGallery />} />
        <Route path="/quotes" element={<RandomQuoteGenerator />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="*" element={<Navigate replace to="/SnapScout/mountain" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
