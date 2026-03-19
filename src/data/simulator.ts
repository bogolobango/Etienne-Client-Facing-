import { dailyMetrics, locations } from '@/data/seed'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScenarioTemplate {
  id: string
  name: string
  description: string
  icon: string
  parameters: ScenarioParameter[]
}

export interface ScenarioParameter {
  id: string
  label: string
  type: 'number' | 'percent' | 'currency' | 'select' | 'text'
  defaultValue: number | string
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
  unit?: string
}

export interface ScenarioResult {
  currentState: {
    monthlyRevenue: number
    utilization: number
    appointments: number
    staffCost: number
    netProfit: number
  }
  projectedState: {
    monthlyRevenue: number
    utilization: number
    appointments: number
    staffCost: number
    netProfit: number
  }
  netImpact: number
  confidence: 'high' | 'medium' | 'low'
  assumptions: string[]
  risks: string[]
  timeToImpact: string
}

// ---------------------------------------------------------------------------
// Location options (shared across templates)
// ---------------------------------------------------------------------------

const locationOptions = locations.map((l) => ({ label: l.name, value: l.id }))

// ---------------------------------------------------------------------------
// Scenario Templates
// ---------------------------------------------------------------------------

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'extend-hours',
    name: 'Extend Hours',
    description: 'Model the impact of extending operating hours at a location',
    icon: 'Clock',
    parameters: [
      { id: 'location', label: 'Location', type: 'select', defaultValue: 'soho', options: locationOptions },
      { id: 'additionalHours', label: 'Additional Hours per Day', type: 'number', defaultValue: 2, min: 1, max: 6, step: 1, unit: 'hrs' },
      { id: 'daysPerWeek', label: 'Days per Week', type: 'number', defaultValue: 5, min: 1, max: 7, step: 1, unit: 'days' },
    ],
  },
  {
    id: 'add-provider',
    name: 'Add Provider',
    description: 'Estimate revenue from adding a new provider to a location',
    icon: 'UserPlus',
    parameters: [
      { id: 'location', label: 'Location', type: 'select', defaultValue: 'soho', options: locationOptions },
      { id: 'providerType', label: 'Provider Type', type: 'select', defaultValue: 'aesthetician', options: [
        { label: 'MD', value: 'md' },
        { label: 'PA', value: 'pa' },
        { label: 'NP', value: 'np' },
        { label: 'Aesthetician', value: 'aesthetician' },
      ]},
      { id: 'daysPerWeek', label: 'Days per Week', type: 'number', defaultValue: 5, min: 1, max: 6, step: 1, unit: 'days' },
    ],
  },
  {
    id: 'raise-prices',
    name: 'Raise Prices',
    description: 'Project revenue changes from a price increase on a service category',
    icon: 'DollarSign',
    parameters: [
      { id: 'serviceCategory', label: 'Service Category', type: 'select', defaultValue: 'Injectable', options: [
        { label: 'Injectable', value: 'Injectable' },
        { label: 'Facial', value: 'Facial' },
        { label: 'Laser', value: 'Laser' },
        { label: 'Body', value: 'Body' },
      ]},
      { id: 'percentageIncrease', label: 'Price Increase', type: 'percent', defaultValue: 10, min: 1, max: 50, step: 1, unit: '%' },
    ],
  },
  {
    id: 'add-location',
    name: 'Add Location',
    description: 'Model a new location opening with configurable capacity',
    icon: 'MapPin',
    parameters: [
      { id: 'marketSize', label: 'Market Size', type: 'select', defaultValue: 'medium', options: [
        { label: 'Small Market', value: 'small' },
        { label: 'Medium Market', value: 'medium' },
        { label: 'Large Market', value: 'large' },
      ]},
      { id: 'rooms', label: 'Treatment Rooms', type: 'number', defaultValue: 4, min: 2, max: 10, step: 1, unit: 'rooms' },
      { id: 'initialProviders', label: 'Initial Providers', type: 'number', defaultValue: 2, min: 1, max: 6, step: 1, unit: 'providers' },
    ],
  },
  {
    id: 'launch-service',
    name: 'Launch New Service',
    description: 'Forecast revenue from introducing a new service offering',
    icon: 'Sparkles',
    parameters: [
      { id: 'serviceName', label: 'Service Name', type: 'text', defaultValue: 'New Treatment' },
      { id: 'pricePoint', label: 'Price Point', type: 'currency', defaultValue: 500, min: 50, max: 5000, step: 25, unit: '$' },
      { id: 'weeklyDemand', label: 'Est. Weekly Demand', type: 'number', defaultValue: 15, min: 1, max: 100, step: 1, unit: 'appts' },
    ],
  },
  {
    id: 'reduce-no-shows',
    name: 'Reduce No-Shows',
    description: 'Calculate recovered revenue from lowering no-show rates',
    icon: 'ShieldCheck',
    parameters: [
      { id: 'targetNoShowRate', label: 'Target No-Show Rate', type: 'percent', defaultValue: 5, min: 0, max: 25, step: 1, unit: '%' },
      { id: 'method', label: 'Method', type: 'select', defaultValue: 'sms', options: [
        { label: 'SMS Reminders', value: 'sms' },
        { label: 'Deposit Required', value: 'deposit' },
        { label: 'Waitlist Backfill', value: 'waitlist' },
      ]},
    ],
  },
]

// ---------------------------------------------------------------------------
// Baseline helpers
// ---------------------------------------------------------------------------

function getBaseline(locationId: string) {
  // Use most recent 30 days of data for the location
  const locMetrics = dailyMetrics
    .filter((m) => locationId === 'all' ? true : m.locationId === locationId)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, locationId === 'all' ? 150 : 30)

  if (locMetrics.length === 0) {
    return { monthlyRevenue: 0, utilization: 0, appointments: 0, noShowRate: 0, avgRevenuePerAppt: 0 }
  }

  const totalRevenue = locMetrics.reduce((s, m) => s + m.revenue, 0)
  const totalBookings = locMetrics.reduce((s, m) => s + m.bookings, 0)
  const avgUtil = locMetrics.reduce((s, m) => s + m.utilizationRate, 0) / locMetrics.length
  const avgNoShow = locMetrics.reduce((s, m) => s + m.noShowRate, 0) / locMetrics.length
  const daysCount = new Set(locMetrics.map((m) => m.date)).size
  const scaleFactor = 30 / daysCount

  return {
    monthlyRevenue: Math.round(totalRevenue * scaleFactor),
    utilization: +avgUtil.toFixed(1),
    appointments: Math.round(totalBookings * scaleFactor),
    noShowRate: +avgNoShow.toFixed(1),
    avgRevenuePerAppt: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 400,
  }
}

function getLocationInfo(locationId: string) {
  const loc = locations.find((l) => l.id === locationId)
  return loc ?? { rooms: 4, providers: 2 }
}

// Assumptions for staff cost by provider type (annual salary / 12)
const providerMonthlyCost: Record<string, number> = {
  md: 22000,
  pa: 13000,
  np: 12000,
  aesthetician: 7500,
}

// Revenue-per-appointment multiplier by provider type
const providerRevenueMultiplier: Record<string, number> = {
  md: 1.4,
  pa: 1.15,
  np: 1.1,
  aesthetician: 0.85,
}

// ---------------------------------------------------------------------------
// Category revenue share (approximate, based on seed service mix)
// ---------------------------------------------------------------------------
const categoryRevenueShare: Record<string, number> = {
  Injectable: 0.45,
  Facial: 0.20,
  Laser: 0.15,
  Body: 0.20,
}

// Demand elasticity — how much volume drops per 1% price increase
const priceElasticity = -0.3

// ---------------------------------------------------------------------------
// calculateScenario
// ---------------------------------------------------------------------------

export function calculateScenario(
  templateId: string,
  params: Record<string, number | string>,
  locationId: string,
): ScenarioResult {
  const baseline = getBaseline(locationId)
  const locInfo = getLocationInfo(locationId)

  // Default staff cost estimate: ~35% of revenue
  const currentStaffCost = Math.round(baseline.monthlyRevenue * 0.35)
  const currentNetProfit = Math.round(baseline.monthlyRevenue * 0.22) // ~22% margin

  const current = {
    monthlyRevenue: baseline.monthlyRevenue,
    utilization: baseline.utilization,
    appointments: baseline.appointments,
    staffCost: currentStaffCost,
    netProfit: currentNetProfit,
  }

  let projected = { ...current }
  let confidence: ScenarioResult['confidence'] = 'medium'
  let assumptions: string[] = []
  let risks: string[] = []
  let timeToImpact = '4-6 weeks'

  switch (templateId) {
    case 'extend-hours': {
      const addlHours = Number(params.additionalHours) || 2
      const days = Number(params.daysPerWeek) || 5
      // Current assumption: 10 operating hours/day, 6 days/week
      const currentHoursPerMonth = 10 * 6 * 4.3
      const additionalHoursPerMonth = addlHours * days * 4.3
      const capacityIncrease = additionalHoursPerMonth / currentHoursPerMonth

      // Extended hours typically run at 60% of peak utilization
      const extendedEfficiency = 0.6
      const revenueGain = Math.round(baseline.monthlyRevenue * capacityIncrease * extendedEfficiency)
      const addlStaffCost = Math.round(revenueGain * 0.40) // slightly higher staff cost ratio for extended hours
      const addlAppts = Math.round(baseline.appointments * capacityIncrease * extendedEfficiency)

      projected = {
        monthlyRevenue: current.monthlyRevenue + revenueGain,
        utilization: Math.min(95, +(current.utilization + capacityIncrease * extendedEfficiency * 8).toFixed(1)),
        appointments: current.appointments + addlAppts,
        staffCost: current.staffCost + addlStaffCost,
        netProfit: current.netProfit + revenueGain - addlStaffCost,
      }
      confidence = 'medium'
      assumptions = [
        `Current operating hours: 10 hours/day, 6 days/week`,
        `Extended hours run at ~60% of peak-hour utilization`,
        `Staff cost increases proportionally at 40% of incremental revenue`,
        `No additional room/equipment investment required`,
      ]
      risks = [
        'Demand may not materialize during extended hours',
        'Staff burnout and overtime cost may exceed projections',
        'Building/lease may restrict operating hours',
      ]
      timeToImpact = '2-4 weeks'
      break
    }

    case 'add-provider': {
      const providerType = String(params.providerType) || 'aesthetician'
      const days = Number(params.daysPerWeek) || 5
      const monthlyCost = providerMonthlyCost[providerType] || 10000
      const revenueMultiplier = providerRevenueMultiplier[providerType] || 1.0

      // A provider can see ~6 appointments per day on average
      const addlAppts = Math.round(6 * days * 4.3)
      const addlRevenue = Math.round(addlAppts * baseline.avgRevenuePerAppt * revenueMultiplier)
      // Ramp: first 3 months avg ~65% of full capacity
      const rampedRevenue = Math.round(addlRevenue * 0.65)

      projected = {
        monthlyRevenue: current.monthlyRevenue + rampedRevenue,
        utilization: Math.min(95, +(current.utilization + (addlAppts / (baseline.appointments || 1)) * 15).toFixed(1)),
        appointments: current.appointments + Math.round(addlAppts * 0.65),
        staffCost: current.staffCost + monthlyCost,
        netProfit: current.netProfit + rampedRevenue - monthlyCost,
      }
      confidence = 'medium'
      assumptions = [
        `${providerType.toUpperCase()} works ${days} days/week at ~6 appointments/day`,
        `Average revenue per appointment: $${baseline.avgRevenuePerAppt} (adjusted by provider type)`,
        `First 3 months projected at 65% capacity (ramp-up period)`,
        `Monthly provider cost: $${monthlyCost.toLocaleString()}`,
      ]
      risks = [
        'Ramp-up period may be longer than 3 months',
        'Existing provider schedules may lose appointments to the new provider',
        'Recruiting and onboarding delays',
      ]
      timeToImpact = '6-12 weeks'
      break
    }

    case 'raise-prices': {
      const category = String(params.serviceCategory) || 'Injectable'
      const pctIncrease = Number(params.percentageIncrease) || 10
      const categoryShare = categoryRevenueShare[category] || 0.25

      // Revenue impact: price increase * category share, reduced by demand elasticity
      const grossRevenueChange = baseline.monthlyRevenue * categoryShare * (pctIncrease / 100)
      const volumeChange = pctIncrease * priceElasticity / 100 // negative
      const netRevenueChange = Math.round(grossRevenueChange * (1 + volumeChange))
      const apptLoss = Math.round(baseline.appointments * categoryShare * Math.abs(volumeChange))

      projected = {
        monthlyRevenue: current.monthlyRevenue + netRevenueChange,
        utilization: +(current.utilization + volumeChange * 5).toFixed(1),
        appointments: current.appointments - apptLoss,
        staffCost: current.staffCost, // no change
        netProfit: current.netProfit + netRevenueChange,
      }
      confidence = 'high'
      assumptions = [
        `${category} represents ~${Math.round(categoryShare * 100)}% of total revenue`,
        `Price elasticity of demand: ${priceElasticity} (${Math.abs(priceElasticity * 100)}% volume drop per 1% price increase)`,
        `Staff costs remain unchanged`,
        `Competitor pricing remains stable`,
      ]
      risks = [
        'Clients may switch to competitors with lower prices',
        'Elasticity may be higher in price-sensitive markets',
        'Negative reviews or perception of reduced value',
      ]
      timeToImpact = '1-2 weeks'
      break
    }

    case 'add-location': {
      const market = String(params.marketSize) || 'medium'
      const rooms = Number(params.rooms) || 4
      const providers = Number(params.initialProviders) || 2

      const marketMultiplier = { small: 0.6, medium: 1.0, large: 1.4 }[market] ?? 1.0

      // Benchmark: smallest existing location generates ~$48K/mo; scale by market and capacity
      const baseRevenue = 48000
      const capacityFactor = (rooms / 3) * (providers / 2)
      const monthlyRevenue = Math.round(baseRevenue * marketMultiplier * capacityFactor * 0.5) // 50% ramp in early months
      const staffCost = Math.round(providers * 8500 + 6000) // avg provider cost + overhead
      const setupAppts = Math.round(providers * 5 * 4.3 * 0.5) // 50% fill during ramp

      projected = {
        monthlyRevenue: current.monthlyRevenue + monthlyRevenue,
        utilization: 40, // new location starts at ~40%
        appointments: current.appointments + setupAppts,
        staffCost: current.staffCost + staffCost,
        netProfit: current.netProfit + monthlyRevenue - staffCost,
      }
      confidence = 'low'
      assumptions = [
        `${market.charAt(0).toUpperCase() + market.slice(1)} market with ${rooms} rooms and ${providers} providers`,
        `First 6 months projected at 50% of steady-state revenue`,
        `Baseline revenue modeled from smallest existing location ($48K/mo)`,
        `Does not include one-time buildout costs ($150K-$400K typical)`,
      ]
      risks = [
        'Buildout delays and cost overruns',
        'Market demand uncertainty in new geography',
        'Cannibalization of existing location revenue',
        'Significant upfront capital required before break-even',
      ]
      timeToImpact = '4-6 months'
      break
    }

    case 'launch-service': {
      const price = Number(params.pricePoint) || 500
      const weeklyDemand = Number(params.weeklyDemand) || 15
      const monthlyAppts = Math.round(weeklyDemand * 4.3)
      const monthlyRevenue = Math.round(price * monthlyAppts * 0.7) // 70% ramp for new service

      // COGS for new service ~30%
      const cogs = Math.round(monthlyRevenue * 0.30)
      const addlStaffCost = Math.round(monthlyRevenue * 0.15) // training + incremental labor

      projected = {
        monthlyRevenue: current.monthlyRevenue + monthlyRevenue,
        utilization: Math.min(95, +(current.utilization + (monthlyAppts / (baseline.appointments || 1)) * 10).toFixed(1)),
        appointments: current.appointments + Math.round(monthlyAppts * 0.7),
        staffCost: current.staffCost + addlStaffCost + cogs,
        netProfit: current.netProfit + monthlyRevenue - cogs - addlStaffCost,
      }
      confidence = 'low'
      assumptions = [
        `Price point: $${price} per appointment`,
        `Estimated weekly demand: ${weeklyDemand} appointments (70% ramp)`,
        `Cost of goods: ~30% of service revenue`,
        `Incremental staff/training cost: ~15% of service revenue`,
      ]
      risks = [
        'Demand estimates may not reflect actual market interest',
        'Staff training period may reduce existing service throughput',
        'Equipment or product procurement lead times',
        'Regulatory or licensing requirements for new services',
      ]
      timeToImpact = '6-10 weeks'
      break
    }

    case 'reduce-no-shows': {
      const targetRate = Number(params.targetNoShowRate) || 5
      const method = String(params.method) || 'sms'
      const currentNoShowRate = baseline.noShowRate

      if (targetRate >= currentNoShowRate) {
        // No improvement
        projected = { ...current }
        assumptions = [`Current no-show rate (${currentNoShowRate}%) is already at or below target (${targetRate}%)`]
        risks = []
        confidence = 'high'
        timeToImpact = 'N/A'
        break
      }

      const rateReduction = currentNoShowRate - targetRate // percentage points recovered
      const recoveredAppts = Math.round(baseline.appointments * (rateReduction / 100))
      const recoveredRevenue = Math.round(recoveredAppts * baseline.avgRevenuePerAppt)

      // Method-specific cost
      const methodCost: Record<string, number> = {
        sms: Math.round(baseline.appointments * 0.15 * 4.3), // ~$0.15 per SMS
        deposit: 0, // deposits don't cost, but may reduce bookings
        waitlist: Math.round(recoveredRevenue * 0.05), // minimal admin cost
      }
      const implCost = methodCost[method] || 0

      // Deposit method may reduce total bookings slightly
      const bookingPenalty = method === 'deposit' ? Math.round(baseline.appointments * 0.03) : 0

      projected = {
        monthlyRevenue: current.monthlyRevenue + recoveredRevenue,
        utilization: Math.min(95, +(current.utilization + rateReduction * 0.8).toFixed(1)),
        appointments: current.appointments + recoveredAppts - bookingPenalty,
        staffCost: current.staffCost + implCost,
        netProfit: current.netProfit + recoveredRevenue - implCost,
      }
      confidence = 'high'
      assumptions = [
        `Current no-show rate: ${currentNoShowRate}% -> Target: ${targetRate}%`,
        `Average revenue per recovered appointment: $${baseline.avgRevenuePerAppt}`,
        `Method: ${method === 'sms' ? 'SMS Reminders' : method === 'deposit' ? 'Deposit Required' : 'Waitlist Backfill'}`,
        method === 'deposit' ? 'Deposit requirement may reduce bookings by ~3%' : 'Minimal impact on booking volume',
      ]
      risks = [
        'No-show behavior varies significantly by demographics',
        method === 'deposit' ? 'Deposit requirement may deter price-sensitive clients' : 'Implementation requires staff buy-in and process changes',
        'Results may take several weeks to stabilize',
      ]
      timeToImpact = method === 'sms' ? '1-2 weeks' : '2-4 weeks'
      break
    }

    default:
      break
  }

  return {
    currentState: current,
    projectedState: projected,
    netImpact: projected.netProfit - current.netProfit,
    confidence,
    assumptions,
    risks,
    timeToImpact,
  }
}
