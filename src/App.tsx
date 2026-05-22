import { Desktop } from './components/Desktop'
import { MobileLayout } from './components/MobileLayout'
import './App.css'

function App() {
  return window.innerWidth <= 768 ? <MobileLayout /> : <Desktop />
}

export default App
