import { create } from 'zustand'
import type { LocationFilter } from '@/types'

interface LocationState {
  selectedLocation: LocationFilter
  setLocation: (location: LocationFilter) => void
}

export const useLocationStore = create<LocationState>((set) => ({
  selectedLocation: 'all',
  setLocation: (location) => set({ selectedLocation: location }),
}))
