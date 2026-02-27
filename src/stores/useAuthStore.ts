import { create } from 'zustand'
import type { Role } from '@/types'

interface AuthState {
  role: Role
  setRole: (role: Role) => void
  toggleRole: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'owner',
  setRole: (role) => set({ role }),
  toggleRole: () => set((state) => ({ role: state.role === 'owner' ? 'staff' : 'owner' })),
}))
