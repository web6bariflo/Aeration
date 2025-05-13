
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MqttProvider } from './store/MqttContext.jsx'

createRoot(document.getElementById('root')).render(
  <MqttProvider>
    <App />
  </MqttProvider>
)
