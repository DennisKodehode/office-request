import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './index.css'
import './components/forms.css'
import App from './App.tsx'
import { PowerProvider } from './power/PowerProvider'
import { ToastProvider } from './components/toast/ToastProvider'
import { ThemeProvider } from './theme/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <PowerProvider>
          <App />
        </PowerProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
