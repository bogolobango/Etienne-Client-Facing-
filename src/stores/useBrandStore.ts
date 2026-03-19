import { create } from 'zustand'

export interface Brand {
  id: string
  name: string
  locationIds: string[]
  color: string
  logo?: string
}

interface BrandState {
  brands: Brand[]
  selectedBrand: 'all' | string
  setBrand: (brand: 'all' | string) => void
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [
    { id: 'skinney', name: 'Skinney MedSpa', locationIds: ['soho', 'williamsburg'], color: '#00D4AA' },
    { id: 'treat', name: 'Treat MedSpa', locationIds: ['hoboken', 'white-plains'], color: '#6366F1' },
    { id: 'glow', name: 'Glow Aesthetics', locationIds: ['stamford'], color: '#F59E0B' },
    { id: 'radiance', name: 'Radiance Clinics', locationIds: ['soho', 'hoboken'], color: '#EC4899' },
  ],
  selectedBrand: 'all',
  setBrand: (brand) => set({ selectedBrand: brand }),
}))
