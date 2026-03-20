import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ClientState {
  clientName: string
  setClientName: (name: string) => void
}

export const useClientStore = create<ClientState>()(
  persist(
    (set) => ({
      clientName: 'GlowUp Aesthetics',
      setClientName: (name) => set({ clientName: name }),
    }),
    { name: 'eip-client-config' }
  )
)
