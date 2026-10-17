import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))
const show = (node) => root.render(<StrictMode>{node}</StrictMode>)

// /admin is a separate, lazily loaded screen: visitors never download it.
if (/^\/admin\/?$/.test(window.location.pathname)) {
  import('./admin/AdminApp.jsx').then(({ default: AdminApp }) => show(<AdminApp />))
} else {
  show(<App />)
}
