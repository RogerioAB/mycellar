import { BrowserRouter } from 'react-router-dom'
import { PhoneFrame } from './components/layout/PhoneFrame'
import { AuthProvider } from './context/AuthContext'
import { AppRouter } from './router'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PhoneFrame>
          <AppRouter />
        </PhoneFrame>
      </AuthProvider>
    </BrowserRouter>
  )
}
