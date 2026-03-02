import { useState, useEffect, useMemo } from 'react'
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Phone,
  Calendar,
  Brain,
  Settings,
  Bell,
  ChevronDown,
  User,
  Menu,
  PanelLeftClose,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { ZenotiSyncBadge } from '@/components/ZenotiSyncBadge'

const locations = [
  { id: 'soho', name: 'SoHo Flagship' },
  { id: 'williamsburg', name: 'Williamsburg' },
  { id: 'hoboken', name: 'Hoboken' },
  { id: 'white-plains', name: 'White Plains' },
  { id: 'stamford', name: 'Stamford' },
]

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  children?: { label: string; path: string }[]
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  {
    label: 'Conversations', path: '/command-center', icon: Phone,
    children: [
      { label: 'Inbox', path: '/command-center/inbox' },
      { label: 'Performance', path: '/command-center/performance' },
    ],
  },
  {
    label: 'Smart Schedule', path: '/scheduling', icon: Calendar,
    children: [
      { label: 'Calendar', path: '/scheduling/calendar' },
      { label: 'Utilization', path: '/scheduling/utilization' },
    ],
  },
  {
    label: 'Revenue Intel', path: '/intelligence', icon: Brain,
    children: [
      { label: 'Scorecard', path: '/intelligence/scorecard' },
      { label: 'AI Analyst', path: '/intelligence/analyst' },
      { label: 'Reports', path: '/intelligence/reports' },
    ],
  },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function LocationSelector() {
  const { selectedLocation, setLocation } = useLocationStore()

  return (
    <div className="relative">
      <select
        value={selectedLocation}
        onChange={(e) => setLocation(e.target.value)}
        className="appearance-none cursor-pointer rounded-full border border-primary/15 bg-card px-4 py-2 pr-9 text-sm text-foreground outline-none transition-all hover:border-primary/30 focus:border-primary/50 focus:shadow-[0_0_12px_rgba(0,212,170,0.15)]"
      >
        <option value="all">All Locations</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

function RoleToggle() {
  const { role, toggleRole } = useAuthStore()

  return (
    <div className="flex h-9 items-center rounded-full border border-border bg-secondary p-1">
      <button
        onClick={() => role !== 'owner' && toggleRole()}
        className={`relative rounded-full px-4 py-1 text-sm font-medium transition-all duration-200 ${
          role === 'owner'
            ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,212,170,0.35)]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Owner
      </button>
      <button
        onClick={() => role !== 'staff' && toggleRole()}
        className={`relative rounded-full px-4 py-1 text-sm font-medium transition-all duration-200 ${
          role === 'staff'
            ? 'bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(0,212,170,0.35)]'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Staff
      </button>
    </div>
  )
}

function SidebarItem({ item }: { item: NavItem }) {
  const { pathname } = useLocation()

  const isParentActive =
    item.path === '/'
      ? pathname === '/'
      : pathname.startsWith(item.path)

  const Icon = item.icon

  return (
    <div>
      <NavLink
        to={item.path}
        end={item.path === '/'}
        className={({ isActive }) => {
          const active = item.path === '/' ? isActive : isParentActive
          return [
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
            active
              ? 'border-l-[3px] border-l-primary bg-primary/[0.08] pl-[9px] text-foreground shadow-[inset_0_0_20px_rgba(0,212,170,0.06)]'
              : 'border-l-[3px] border-l-transparent pl-[9px] text-muted-foreground hover:bg-primary/[0.04] hover:text-foreground',
          ].join(' ')
        }}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span>{item.label}</span>
      </NavLink>

      {item.children && isParentActive && (
        <div className="ml-8 mt-1 flex flex-col gap-0.5">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                [
                  'rounded-lg px-3 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                ].join(' ')
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

const STAFF_HIDDEN_PATHS = ['/intelligence', '/settings']

function SidebarContent({ onClose, showClose }: { onClose?: () => void; showClose?: boolean }) {
  const { role } = useAuthStore()

  const visibleNav = useMemo(() => {
    if (role === 'staff') {
      return navItems.filter((item) => !STAFF_HIDDEN_PATHS.includes(item.path))
    }
    return navItems
  }, [role])

  return (
    <>
      {/* Logo + Close button */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-primary">Etienne</span>
          <span className="text-lg font-light text-foreground">Intelligence</span>
        </div>
        {showClose && onClose && (
          <button
            className="p-1.5 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
            onClick={onClose}
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scroll-fade-y px-3 py-4">
        {visibleNav.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </nav>
    </>
  )
}

export function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)
  const location = useLocation()
  const { role } = useAuthStore()
  const { setLocation } = useLocationStore()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  // Force staff to SoHo location
  useEffect(() => {
    if (role === 'staff') {
      setLocation('soho')
    }
  }, [role, setLocation])

  // Redirect staff from restricted routes
  const isRestricted = role === 'staff' && (
    location.pathname.startsWith('/intelligence') ||
    location.pathname.startsWith('/settings')
  )
  if (isRestricted) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-secondary md:hidden"
            >
              <SidebarContent onClose={() => setMobileSidebarOpen(false)} showClose />

              {/* Mobile-only: Location & Role controls */}
              <div className="border-t border-border px-3 py-3 space-y-3">
                <LocationSelector />
                <RoleToggle />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <AnimatePresence initial={false}>
        {!desktopCollapsed && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="hidden md:flex h-full shrink-0 flex-col border-r border-border bg-secondary overflow-hidden"
          >
            <SidebarContent onClose={() => setDesktopCollapsed(true)} showClose />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-3 md:px-6 z-10">
          <div className="flex items-center gap-2">
            {/* Mobile: hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop: reopen collapsed sidebar */}
            {desktopCollapsed && (
              <button
                className="hidden md:flex p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
                onClick={() => setDesktopCollapsed(false)}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <span className="text-base font-bold text-primary md:hidden">Etienne</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block"><LocationSelector /></div>
            <div className="hidden md:block"><RoleToggle /></div>
            <div className="hidden md:block"><ZenotiSyncBadge /></div>

            <button className="relative rounded-full p-2 text-muted-foreground transition-all hover:bg-primary/[0.08] hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-[0_2px_8px_rgba(0,212,170,0.4)]">
                3
              </span>
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/[0.08] text-muted-foreground ring-1 ring-primary/15 transition-all hover:ring-primary/40 hover:text-foreground">
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Staff banner */}
        {role === 'staff' && (
          <div className="shrink-0 px-4 md:px-6 py-2 bg-primary/[0.06] border-b border-primary/10">
            <p className="text-xs text-muted-foreground">
              Viewing as <span className="text-primary font-medium">Staff</span> — SoHo Flagship
            </p>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
