import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import PracticeApp from './practice/PracticeApp.jsx'

// The accounting practice management UI lives at the #/practice hash route
// so it works on any static host with zero server-side rewrite config,
// entirely separate from the restaurant app's own screens/state.
const isPracticeRoute = window.location.hash.startsWith('#/practice')

// Check for a new deployed version every time the app becomes visible again
// (opening the PWA from the home screen, switching back to the tab) so a
// fix pushed to the server reaches the device on the next open instead of
// waiting for the browser's own once-a-day service worker check.
const updateSW = registerSW({ immediate: true })
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') updateSW()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPracticeRoute ? <PracticeApp /> : <App />}
  </StrictMode>,
)
