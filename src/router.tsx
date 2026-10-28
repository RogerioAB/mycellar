import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { RequireLayout } from './components/layout/RequireLayout'
import { useAuth } from './hooks/useAuth'
import AddBottlePage from './pages/AddBottlePage'
import BottleDetailPage from './pages/BottleDetailPage'
import CellarPage from './pages/CellarPage'
import HistoryPage from './pages/HistoryPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OnboardingLayoutPage from './pages/OnboardingLayoutPage'
import PrivacyPage from './pages/PrivacyPage'
import SettingsLayoutPage from './pages/SettingsLayoutPage'
import SettingsPage from './pages/SettingsPage'
import SignupPage from './pages/SignupPage'
import TermsPage from './pages/TermsPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/cellar" replace />
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <LandingPage />
          </RedirectIfAuthed>
        }
      />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <SignupPage />
          </RedirectIfAuthed>
        }
      />

      <Route
        path="/onboarding/layout"
        element={
          <RequireAuth>
            <OnboardingLayoutPage />
          </RequireAuth>
        }
      />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route
          path="/cellar"
          element={
            <RequireLayout>
              <CellarPage />
            </RequireLayout>
          }
        />
        <Route
          path="/bottles/add"
          element={
            <RequireLayout>
              <AddBottlePage />
            </RequireLayout>
          }
        />
        <Route path="/bottles/:id" element={<BottleDetailPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings/layout" element={<SettingsLayoutPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
