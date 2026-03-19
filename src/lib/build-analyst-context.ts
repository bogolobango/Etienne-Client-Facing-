import { computeContext } from './ai-context'
import { INDUSTRY_BENCHMARKS } from '@/data/benchmarks'

export function buildAnalystContext(selectedLocation: string) {
  const ctx = computeContext(selectedLocation)

  const metrics = JSON.stringify(
    {
      totalRevenue: ctx.totalRevenue,
      totalNormalizedRevenue: ctx.totalNormalizedRevenue,
      revenueDisaggregation: {
        serviceRevenue: ctx.revenueByType.service,
        packageRevenue: ctx.revenueByType.package,
        productRevenue: ctx.revenueByType.product,
        membershipRevenue: ctx.revenueByType.membership,
        giftcardRevenue: ctx.revenueByType.giftcard,
        packageDistortion: ctx.totalRevenue - ctx.totalNormalizedRevenue,
      },
      totalPackageBookings: ctx.totalPackageBookings,
      avgUtilization: ctx.avgUtil,
      avgNoShowRate: ctx.avgNoShow,
      avgRebookRate: ctx.avgRebook,
      totalRecovered: ctx.totalRecovered,
      totalBookings: ctx.totalBookings,
      totalNewClients: ctx.totalNewClients,
      aiResolvedConversations: ctx.aiResolved,
      aiBookings: ctx.aiBooked,
      highRiskAppointments: ctx.highRiskAppts,
      avgResponseTime: ctx.avgResponseTime,
      pipelineValue: ctx.oppPipelineValue,
      opportunitiesByStatus: ctx.oppsByStatus,
      industryBenchmarks: {
        noShowRate: `${INDUSTRY_BENCHMARKS.noShowRate.avg}% avg, ${INDUSTRY_BENCHMARKS.noShowRate.topPerformer}% top performer`,
        utilization: `${INDUSTRY_BENCHMARKS.utilizationRate.avg}% avg, ${INDUSTRY_BENCHMARKS.utilizationRate.topPerformer}% top performer`,
        rebookRate: `${INDUSTRY_BENCHMARKS.rebookingRate.avg}% avg, ${INDUSTRY_BENCHMARKS.rebookingRate.topPerformer}% top performer`,
        avgTicket: `$${INDUSTRY_BENCHMARKS.avgTicket.avg} avg, $${INDUSTRY_BENCHMARKS.avgTicket.topPerformer} top performer`,
      },
    },
    null,
    2
  )

  const locations = ctx.byLocation
    .map(
      (c) =>
        `${c.name}: Revenue $${c.revenue.toLocaleString()}, No-shows ${c.noShowRate.toFixed(1)}%, Utilization ${c.utilization.toFixed(1)}%, Rebook ${c.rebookingRate.toFixed(1)}%, New Clients ${c.newClients}`
    )
    .join(' | ')

  const alerts = JSON.stringify(
    [
      ctx.avgNoShow > 15 ? `High no-show rate across network: ${ctx.avgNoShow.toFixed(1)}%` : null,
      ctx.avgUtil < 65 ? `Low utilization across network: ${ctx.avgUtil.toFixed(1)}%` : null,
      ...ctx.byLocation
        .filter((l) => l.noShowRate > 18)
        .map((l) => `${l.name} has critical no-show rate: ${l.noShowRate.toFixed(1)}%`),
      ...ctx.byLocation
        .filter((l) => l.utilization < 60)
        .map((l) => `${l.name} has low utilization: ${l.utilization.toFixed(1)}%`),
      ctx.oppsByStatus.new > 5 ? `${ctx.oppsByStatus.new} new leads awaiting contact` : null,
    ].filter(Boolean),
    null,
    2
  )

  return { metrics, locations, alerts }
}
