import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // The main scrollable area is the <main> inside DashboardLayout,
    // not window (which is overflow-hidden at the root).
    const main = document.getElementById('main-scroll-area')
    if (main) {
      main.scrollTo(0, 0)
    }
    // Fallback for pages outside the layout (e.g. PasswordGate)
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
