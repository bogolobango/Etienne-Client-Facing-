# CLAUDE.md — EIP Technical Audit & Build Sprint

**Owner**: Jim (CEO) | Rumeer (CTO) | Claude Code (execution)
**Date**: March 2026
**Objective**: Get EIP demo-ready for Ryan Bloch within 10 days

## CONTEXT

Jim has a demo call with Ryan Bloch, co-founder of Treat Medspa and CEO of Skinney MedSpa (45+ locations across four brands). The business model has pivoted to consulting + dashboard hybrid:

- **Sell**: $2,500 one-time cross-location gap analysis
- **Upsell**: $5,000/month ongoing intelligence consulting with dashboard access
- The dashboard is the delivery mechanism, not the product. The insight is the product.

## TWO CODEBASES

| Codebase | Repo | Purpose |
|----------|------|---------|
| Marketing Site | etienneagency.com (separate repo) | Public-facing website |
| EIP Dashboard | bogolobango/Etienne-Client-Facing- | Client-facing intelligence dashboard (THIS REPO) |

## ARCHITECTURE

- **Framework**: Vite + React 19 SPA
- **State**: Zustand (useLocationStore, useAuthStore, useChatStore)
- **Routing**: React Router v7
- **Styling**: TailwindCSS 4 + Framer Motion (dark theme only)
- **Charts**: Recharts
- **Deployment**: Vercel (SPA + `/api` serverless functions)
- **AI**: Claude API via Vercel serverless (`/api/analyst`, `/api/generate-report`)

## KEY DIRECTORIES

```
src/
├── components/          # Reusable UI (MetricCard, AgentStatusBadge, etc.)
├── data/               # seed.ts (mock data), benchmarks.ts (industry data)
├── hooks/              # Custom React hooks
├── integrations/zenoti/ # Zenoti API client, endpoints, hooks, mappers
├── layouts/            # DashboardLayout (sidebar, topbar, location/role)
├── lib/                # ai-context.ts, ai-responses.ts, build-analyst-context.ts
├── modules/
│   ├── dashboard/      # DashboardHome
│   ├── command-center/ # CommandCenterOverview, ConversationInbox, ChannelPerformance
│   ├── scheduling/     # SchedulingOverview, CalendarView, UtilizationDashboard
│   ├── intelligence/   # IntelligenceOverview, AIAnalyst, GapAnalysis, RevenueScorecard, Reports
│   └── settings/       # Settings (Zenoti integration hub)
├── stores/             # Zustand stores
└── types/              # TypeScript types
api/
├── analyst.ts          # Claude API streaming for AI Analyst
└── generate-report.ts  # Claude API streaming for Gap Analysis report
```

## ENVIRONMENT VARIABLES

```bash
# Vercel Dashboard → Settings → Environment Variables
ANTHROPIC_API_KEY=sk-ant-...          # For AI Analyst + Report Generation
# Future (Priority 2):
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_KEY=eyJ...
```

## PRIORITY ORDER

1. **P0**: Dashboard must not break in demo (audit checklist)
2. **P1**: Real Claude API for AI Analyst (streaming, graceful fallback)
3. **P3**: Gap Analysis report generation
4. **P4**: Website copy update (separate repo)
5. **P2**: Zenoti data ingestion (post-demo, for first paid client)

## LANGUAGE DISCIPLINE

**NEVER use**: capture, automate, handle calls, respond to inquiries, AI receptionist, chatbot, 24/7 response
**ALWAYS use**: surface, identify, visibility, gaps, patterns, benchmarking, cross-location, intelligence, audit, operational insight

## AI ANALYST

- Calls `/api/analyst` (Vercel Edge function) with real dashboard metrics as context
- Falls back to keyword matching in `ai-responses.ts` if API unavailable
- Streams responses character-by-character
- Context injected via `build-analyst-context.ts` using `computeContext()` from seed data

## GAP ANALYSIS REPORT

- Route: `/intelligence/gap-analysis`
- Calls `/api/generate-report` for AI-powered report
- Falls back to local template generation
- Downloadable as markdown
- Designed as the $2,500 deliverable

## DEMO DATA

- 5 locations: SoHo Flagship, Williamsburg, Hoboken, White Plains, Stamford
- Company: "GlowUp Aesthetics" (demo placeholder)
- Industry benchmarks from AmSpa 2024, Zenoti 2025 Benchmark Report
