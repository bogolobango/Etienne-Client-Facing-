// ---------------------------------------------------------------------------
// Package Revenue Truth Engine — Data
// ---------------------------------------------------------------------------

import { daysAgo, daysFromNow } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PackageDefinition {
  id: string
  name: string
  service: string
  totalSessions: number
  totalPrice: number
  pricePerSession: number
}

export interface PackageSale {
  id: string
  packageDefId: string
  clientName: string
  clientId: string
  locationId: string
  purchaseDate: string
  sessionsUsed: number
  sessionsRemaining: number
  status: 'active' | 'completed' | 'expired'
  revenueRecognized: number
  revenueDeferred: number
  expirationDate: string
  nextSessionDate?: string
}

export interface RevenueReconciliation {
  locationId: string
  period: string
  reportedRevenue: number
  normalizedRevenue: number
  deferredRevenue: number
  variance: number
  variancePercent: number
}

// ---------------------------------------------------------------------------
// 1. Package Definitions
// ---------------------------------------------------------------------------

export const packageDefinitions: PackageDefinition[] = [
  {
    id: 'pkg-botox-3',
    name: 'Botox 3-Pack',
    service: 'Botox',
    totalSessions: 3,
    totalPrice: 1200,
    pricePerSession: 400,
  },
  {
    id: 'pkg-laser-6',
    name: 'Laser Hair Removal 6-Pack',
    service: 'Laser Hair Removal',
    totalSessions: 6,
    totalPrice: 1800,
    pricePerSession: 300,
  },
  {
    id: 'pkg-hydra-4',
    name: 'Hydrafacial 4-Pack',
    service: 'Hydrafacial',
    totalSessions: 4,
    totalPrice: 880,
    pricePerSession: 220,
  },
  {
    id: 'pkg-body-3',
    name: 'Body Contouring 3-Pack',
    service: 'Body Contouring',
    totalSessions: 3,
    totalPrice: 3000,
    pricePerSession: 1000,
  },
  {
    id: 'pkg-peel-6',
    name: 'Chemical Peel 6-Pack',
    service: 'Chemical Peel',
    totalSessions: 6,
    totalPrice: 1020,
    pricePerSession: 170,
  },
]

// ---------------------------------------------------------------------------
// Helper — look up definition
// ---------------------------------------------------------------------------

const defMap = new Map(packageDefinitions.map((d) => [d.id, d]))

// ---------------------------------------------------------------------------
// 2. Package Sales (25-30 across 5 locations)
// ---------------------------------------------------------------------------

export const packageSales: PackageSale[] = [
  // ---- SoHo Flagship ----
  {
    id: 'sale-001', packageDefId: 'pkg-botox-3', clientName: 'Olivia Park', clientId: 'c-101',
    locationId: 'soho', purchaseDate: daysAgo(45), sessionsUsed: 2, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 800, revenueDeferred: 400,
    expirationDate: daysFromNow(45), nextSessionDate: daysFromNow(12),
  },
  {
    id: 'sale-002', packageDefId: 'pkg-laser-6', clientName: 'Emma Rodriguez', clientId: 'c-102',
    locationId: 'soho', purchaseDate: daysAgo(90), sessionsUsed: 4, sessionsRemaining: 2,
    status: 'active', revenueRecognized: 1200, revenueDeferred: 600,
    expirationDate: daysFromNow(60), nextSessionDate: daysFromNow(8),
  },
  {
    id: 'sale-003', packageDefId: 'pkg-hydra-4', clientName: 'Sophia Kim', clientId: 'c-103',
    locationId: 'soho', purchaseDate: daysAgo(120), sessionsUsed: 4, sessionsRemaining: 0,
    status: 'completed', revenueRecognized: 880, revenueDeferred: 0,
    expirationDate: daysAgo(10),
  },
  {
    id: 'sale-004', packageDefId: 'pkg-body-3', clientName: 'Isabella Park', clientId: 'c-104',
    locationId: 'soho', purchaseDate: daysAgo(60), sessionsUsed: 1, sessionsRemaining: 2,
    status: 'active', revenueRecognized: 1000, revenueDeferred: 2000,
    expirationDate: daysFromNow(30), nextSessionDate: daysFromNow(5),
  },
  {
    id: 'sale-005', packageDefId: 'pkg-peel-6', clientName: 'Ava Thompson', clientId: 'c-105',
    locationId: 'soho', purchaseDate: daysAgo(150), sessionsUsed: 6, sessionsRemaining: 0,
    status: 'completed', revenueRecognized: 1020, revenueDeferred: 0,
    expirationDate: daysAgo(30),
  },
  {
    id: 'sale-006', packageDefId: 'pkg-botox-3', clientName: 'Mia Johnson', clientId: 'c-106',
    locationId: 'soho', purchaseDate: daysAgo(20), sessionsUsed: 0, sessionsRemaining: 3,
    status: 'active', revenueRecognized: 0, revenueDeferred: 1200,
    expirationDate: daysFromNow(70), nextSessionDate: daysFromNow(3),
  },

  // ---- Williamsburg ----
  {
    id: 'sale-007', packageDefId: 'pkg-laser-6', clientName: 'Charlotte Davis', clientId: 'c-107',
    locationId: 'williamsburg', purchaseDate: daysAgo(100), sessionsUsed: 3, sessionsRemaining: 3,
    status: 'active', revenueRecognized: 900, revenueDeferred: 900,
    expirationDate: daysFromNow(20), nextSessionDate: daysFromNow(6),
  },
  {
    id: 'sale-008', packageDefId: 'pkg-hydra-4', clientName: 'Amelia Wilson', clientId: 'c-108',
    locationId: 'williamsburg', purchaseDate: daysAgo(30), sessionsUsed: 1, sessionsRemaining: 3,
    status: 'active', revenueRecognized: 220, revenueDeferred: 660,
    expirationDate: daysFromNow(60), nextSessionDate: daysFromNow(10),
  },
  {
    id: 'sale-009', packageDefId: 'pkg-body-3', clientName: 'Harper Martinez', clientId: 'c-109',
    locationId: 'williamsburg', purchaseDate: daysAgo(75), sessionsUsed: 2, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 2000, revenueDeferred: 1000,
    expirationDate: daysFromNow(15), nextSessionDate: daysFromNow(4),
  },
  {
    id: 'sale-010', packageDefId: 'pkg-peel-6', clientName: 'Evelyn Brown', clientId: 'c-110',
    locationId: 'williamsburg', purchaseDate: daysAgo(140), sessionsUsed: 5, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 850, revenueDeferred: 170,
    expirationDate: daysFromNow(10), nextSessionDate: daysFromNow(7),
  },
  {
    id: 'sale-011', packageDefId: 'pkg-botox-3', clientName: 'Luna Garcia', clientId: 'c-111',
    locationId: 'williamsburg', purchaseDate: daysAgo(180), sessionsUsed: 2, sessionsRemaining: 1,
    status: 'expired', revenueRecognized: 800, revenueDeferred: 400,
    expirationDate: daysAgo(5),
  },

  // ---- Hoboken ----
  {
    id: 'sale-012', packageDefId: 'pkg-botox-3', clientName: 'Chloe Anderson', clientId: 'c-112',
    locationId: 'hoboken', purchaseDate: daysAgo(50), sessionsUsed: 1, sessionsRemaining: 2,
    status: 'active', revenueRecognized: 400, revenueDeferred: 800,
    expirationDate: daysFromNow(40), nextSessionDate: daysFromNow(9),
  },
  {
    id: 'sale-013', packageDefId: 'pkg-laser-6', clientName: 'Ella Taylor', clientId: 'c-113',
    locationId: 'hoboken', purchaseDate: daysAgo(80), sessionsUsed: 5, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 1500, revenueDeferred: 300,
    expirationDate: daysFromNow(25), nextSessionDate: daysFromNow(11),
  },
  {
    id: 'sale-014', packageDefId: 'pkg-hydra-4', clientName: 'Grace Lee', clientId: 'c-114',
    locationId: 'hoboken', purchaseDate: daysAgo(25), sessionsUsed: 1, sessionsRemaining: 3,
    status: 'active', revenueRecognized: 220, revenueDeferred: 660,
    expirationDate: daysFromNow(65), nextSessionDate: daysFromNow(7),
  },
  {
    id: 'sale-015', packageDefId: 'pkg-body-3', clientName: 'Zoey White', clientId: 'c-115',
    locationId: 'hoboken', purchaseDate: daysAgo(110), sessionsUsed: 3, sessionsRemaining: 0,
    status: 'completed', revenueRecognized: 3000, revenueDeferred: 0,
    expirationDate: daysAgo(20),
  },
  {
    id: 'sale-016', packageDefId: 'pkg-peel-6', clientName: 'Riley Harris', clientId: 'c-116',
    locationId: 'hoboken', purchaseDate: daysAgo(35), sessionsUsed: 2, sessionsRemaining: 4,
    status: 'active', revenueRecognized: 340, revenueDeferred: 680,
    expirationDate: daysFromNow(55), nextSessionDate: daysFromNow(6),
  },
  {
    id: 'sale-017', packageDefId: 'pkg-laser-6', clientName: 'Nora Clark', clientId: 'c-117',
    locationId: 'hoboken', purchaseDate: daysAgo(15), sessionsUsed: 1, sessionsRemaining: 5,
    status: 'active', revenueRecognized: 300, revenueDeferred: 1500,
    expirationDate: daysFromNow(75), nextSessionDate: daysFromNow(14),
  },

  // ---- White Plains ----
  {
    id: 'sale-018', packageDefId: 'pkg-botox-3', clientName: 'Lily Adams', clientId: 'c-118',
    locationId: 'white-plains', purchaseDate: daysAgo(40), sessionsUsed: 2, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 800, revenueDeferred: 400,
    expirationDate: daysFromNow(50), nextSessionDate: daysFromNow(15),
  },
  {
    id: 'sale-019', packageDefId: 'pkg-hydra-4', clientName: 'Hannah Nelson', clientId: 'c-119',
    locationId: 'white-plains', purchaseDate: daysAgo(60), sessionsUsed: 3, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 660, revenueDeferred: 220,
    expirationDate: daysFromNow(18), nextSessionDate: daysFromNow(5),
  },
  {
    id: 'sale-020', packageDefId: 'pkg-peel-6', clientName: 'Aria Scott', clientId: 'c-120',
    locationId: 'white-plains', purchaseDate: daysAgo(130), sessionsUsed: 4, sessionsRemaining: 2,
    status: 'active', revenueRecognized: 680, revenueDeferred: 340,
    expirationDate: daysFromNow(22), nextSessionDate: daysFromNow(8),
  },
  {
    id: 'sale-021', packageDefId: 'pkg-body-3', clientName: 'Layla Baker', clientId: 'c-121',
    locationId: 'white-plains', purchaseDate: daysAgo(170), sessionsUsed: 3, sessionsRemaining: 0,
    status: 'completed', revenueRecognized: 3000, revenueDeferred: 0,
    expirationDate: daysAgo(40),
  },
  {
    id: 'sale-022', packageDefId: 'pkg-laser-6', clientName: 'Penelope Young', clientId: 'c-122',
    locationId: 'white-plains', purchaseDate: daysAgo(10), sessionsUsed: 0, sessionsRemaining: 6,
    status: 'active', revenueRecognized: 0, revenueDeferred: 1800,
    expirationDate: daysFromNow(80), nextSessionDate: daysFromNow(4),
  },

  // ---- Stamford ----
  {
    id: 'sale-023', packageDefId: 'pkg-botox-3', clientName: 'Victoria King', clientId: 'c-123',
    locationId: 'stamford', purchaseDate: daysAgo(55), sessionsUsed: 2, sessionsRemaining: 1,
    status: 'active', revenueRecognized: 800, revenueDeferred: 400,
    expirationDate: daysFromNow(35), nextSessionDate: daysFromNow(10),
  },
  {
    id: 'sale-024', packageDefId: 'pkg-hydra-4', clientName: 'Stella Wright', clientId: 'c-124',
    locationId: 'stamford', purchaseDate: daysAgo(85), sessionsUsed: 4, sessionsRemaining: 0,
    status: 'completed', revenueRecognized: 880, revenueDeferred: 0,
    expirationDate: daysAgo(15),
  },
  {
    id: 'sale-025', packageDefId: 'pkg-laser-6', clientName: 'Hazel Green', clientId: 'c-125',
    locationId: 'stamford', purchaseDate: daysAgo(70), sessionsUsed: 3, sessionsRemaining: 3,
    status: 'active', revenueRecognized: 900, revenueDeferred: 900,
    expirationDate: daysFromNow(28), nextSessionDate: daysFromNow(3),
  },
  {
    id: 'sale-026', packageDefId: 'pkg-body-3', clientName: 'Aurora Hill', clientId: 'c-126',
    locationId: 'stamford', purchaseDate: daysAgo(30), sessionsUsed: 1, sessionsRemaining: 2,
    status: 'active', revenueRecognized: 1000, revenueDeferred: 2000,
    expirationDate: daysFromNow(60), nextSessionDate: daysFromNow(9),
  },
  {
    id: 'sale-027', packageDefId: 'pkg-peel-6', clientName: 'Savannah Allen', clientId: 'c-127',
    locationId: 'stamford', purchaseDate: daysAgo(160), sessionsUsed: 3, sessionsRemaining: 3,
    status: 'active', revenueRecognized: 510, revenueDeferred: 510,
    expirationDate: daysFromNow(12), nextSessionDate: daysFromNow(2),
  },
  {
    id: 'sale-028', packageDefId: 'pkg-peel-6', clientName: 'Audrey Turner', clientId: 'c-128',
    locationId: 'stamford', purchaseDate: daysAgo(200), sessionsUsed: 4, sessionsRemaining: 2,
    status: 'expired', revenueRecognized: 680, revenueDeferred: 340,
    expirationDate: daysAgo(12),
  },
]

// ---------------------------------------------------------------------------
// 3. Revenue Reconciliation (30 days × 5 locations)
// ---------------------------------------------------------------------------

function generateReconciliation(): RevenueReconciliation[] {
  const locationConfigs: Record<string, { baseRevenue: number; packageMix: number }> = {
    'soho': { baseRevenue: 8500, packageMix: 0.38 },
    'williamsburg': { baseRevenue: 6200, packageMix: 0.32 },
    'hoboken': { baseRevenue: 5800, packageMix: 0.35 },
    'white-plains': { baseRevenue: 4500, packageMix: 0.28 },
    'stamford': { baseRevenue: 4800, packageMix: 0.30 },
  }

  const records: RevenueReconciliation[] = []
  // Deterministic pseudo-random seeded by day + location index
  const locationIds = ['soho', 'williamsburg', 'hoboken', 'white-plains', 'stamford']

  for (let day = 0; day < 30; day++) {
    const date = daysAgo(29 - day)

    locationIds.forEach((locId, locIdx) => {
      const cfg = locationConfigs[locId]
      // Simple deterministic variation based on day and location
      const seed = (day * 7 + locIdx * 13 + 3) % 20
      const variance = 0.8 + seed / 25 // 0.8 to 1.56 range
      const isPackageSaleDay = (day + locIdx) % 4 === 0 // Every 4th day, staggered per location

      const baseDaily = cfg.baseRevenue * variance
      const packageBump = isPackageSaleDay ? cfg.baseRevenue * cfg.packageMix * 2.5 : 0
      const reportedRevenue = Math.round(baseDaily + packageBump)

      // Normalized revenue spreads package sales evenly
      const normalizedRevenue = Math.round(baseDaily + (cfg.baseRevenue * cfg.packageMix * 0.4))

      // Deferred is the accumulated obligation
      const activeSalesForLoc = packageSales.filter((s) => s.locationId === locId && s.status === 'active')
      const totalDeferred = activeSalesForLoc.reduce((sum, s) => sum + s.revenueDeferred, 0)
      // Slight daily variation in deferred tracking
      const deferredRevenue = Math.round(totalDeferred * (0.95 + (seed % 10) / 100))

      const diff = reportedRevenue - normalizedRevenue
      const diffPercent = normalizedRevenue > 0 ? (diff / normalizedRevenue) * 100 : 0

      records.push({
        locationId: locId,
        period: date,
        reportedRevenue,
        normalizedRevenue,
        deferredRevenue,
        variance: diff,
        variancePercent: Math.round(diffPercent * 10) / 10,
      })
    })
  }

  return records
}

export const revenueReconciliation: RevenueReconciliation[] = generateReconciliation()

// ---------------------------------------------------------------------------
// Helpers for consumers
// ---------------------------------------------------------------------------

export function getPackageDef(defId: string): PackageDefinition | undefined {
  return defMap.get(defId)
}

export function getLocationName(locationId: string): string {
  const names: Record<string, string> = {
    'soho': 'SoHo Flagship',
    'williamsburg': 'Williamsburg',
    'hoboken': 'Hoboken',
    'white-plains': 'White Plains',
    'stamford': 'Stamford',
  }
  return names[locationId] ?? locationId
}
