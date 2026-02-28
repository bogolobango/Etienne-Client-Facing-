import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Phone,
  Calendar,
  Brain,
  Settings,
  Bell,
  ChevronDown,
  User,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { GradientOrbs } from '@/components/GradientOrbs'

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
    label: 'Voice & Text', path: '/command-center', icon: Phone,
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
        className="appearance-none cursor-pointer rounded-full border border-[#7C3AED]/[0.15] bg-white px-4 py-2 pr-9 text-sm text-[#111827] outline-none transition-all hover:border-[#7C3AED]/30 focus:border-[#7C3AED]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.15)]"
      >
        <option value="all">All Locations</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
    </div>
  )
}

function RoleToggle() {
  const { role, toggleRole } = useAuthStore()

  return (
    <div className="flex h-9 items-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-1">
      <button
        onClick={() => role !== 'owner' && toggleRole()}
        className={`relative rounded-full px-4 py-1 text-sm font-medium transition-all duration-200 ${
          role === 'owner'
            ? 'bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.35)]'
            : 'text-[#6B7280] hover:text-[#111827]'
        }`}
      >
        Owner
      </button>
      <button
        onClick={() => role !== 'staff' && toggleRole()}
        className={`relative rounded-full px-4 py-1 text-sm font-medium transition-all duration-200 ${
          role === 'staff'
            ? 'bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.35)]'
            : 'text-[#6B7280] hover:text-[#111827]'
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
              ? 'border-l-[3px] border-l-[#7C3AED] bg-[#7C3AED]/[0.08] pl-[9px] text-[#111827] shadow-[inset_0_0_20px_rgba(124,58,237,0.06)]'
              : 'border-l-[3px] border-l-transparent pl-[9px] text-[#6B7280] hover:bg-[#7C3AED]/[0.04] hover:text-[#111827]',
          ].join(' ')
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </motion.div>
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
                    ? 'text-[#7C3AED] font-medium'
                    : 'text-[#6B7280] hover:text-[#111827]',
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

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="relative flex h-full w-60 shrink-0 flex-col border-r border-[#E5E7EB] bg-[#F9FAFB]">
        {/* Sidebar orb glow */}
        <div className="absolute -left-20 top-1/4 w-[200px] h-[200px] rounded-full bg-[#7C3AED] opacity-[0.03] blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-[#E5E7EB] px-5">
          <span className="text-lg font-bold tracking-tight text-[#7C3AED]">GlowUp</span>
          <span className="text-lg font-light text-[#111827]">Aesthetics</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <SidebarItem key={item.path} item={item} />
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm px-6 z-10">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-base font-bold text-[#7C3AED]">GlowUp</span>
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <LocationSelector />
            <RoleToggle />

            <button className="relative rounded-full p-2 text-[#6B7280] transition-all hover:bg-[#7C3AED]/[0.08] hover:text-[#111827]">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(124,58,237,0.4)]">
                3
              </span>
            </button>

            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED]/[0.08] text-[#6B7280] ring-1 ring-[#7C3AED]/[0.15] transition-all hover:ring-[#7C3AED]/40 hover:text-[#111827]">
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content area with orbs */}
        <main className="relative flex-1 overflow-y-auto p-6">
          <GradientOrbs variant="default" />
          <div className="relative z-[1]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
