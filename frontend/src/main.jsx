import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css' // บรรทัดนี้สำคัญมาก! เพื่อดึงเอาธีมกระจกและสีน้ำเงินเข้ามา

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)