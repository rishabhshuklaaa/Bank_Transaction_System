import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext' // Import the brain of your app

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrapping App with AuthProvider ensures every component can 
        access login/logout and user status */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)