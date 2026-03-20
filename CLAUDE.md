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
- **State**: Zustand (useLocationStore, useAuthStore, useChatStore, useClientStore)
- **Routing**: React Router v7
- **Styling**: TailwindCSS 4 + Framer Motion (dark theme only)
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer (lazy-loaded)
- **Email**: Resend API via serverless
- **Deployment**: Vercel (SPA + `/api` serverless functions)
- **AI**: Claude API via Vercel serverless (`/api/analyst`, `/api/generate-report`)

## ROUTES (11 pages)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | DashboardHome | Overview with metrics, charts, activity feed |
| `/performance` | Performance | Revenue scorecard, benchmarks, provider stats |
| `/intelligence` | IntelligenceOverview | Hub page with 6 intelligence tool cards |
| `/intelligence/analyst` | AIAnalyst | Chat with Claude about business data |
| `/intelligence/packages` | PackageTruth | Package revenue truth — distortion analysis |
| `/intelligence/alerts` | PredictiveAlerts | Proactive warnings with severity filtering |
| `/intelligence/reports` | AutomatedReports | Weekly briefs and scheduled reports |
| `/intelligence/simulator` | WhatIfSimulator | Scenario modeling with revenue projections |
| `/gap-analysis` | GapAnalysis | $2,500 deliverable — PDF/email export |
| `/settings` | Settings | Client config, Zenoti integration, sign out |
| (password gate) | PasswordGate | Shown when CLIENT_PASSWORD is set |

## KEY DIRECTORIES

```
src/
├── components/          # Reusable UI (MetricCard, AgentStatusBadge, PasswordGate, etc.)
├── data/               # seed.ts (mock data), benchmarks.ts (industry data)
├── hooks/              # useAuth.ts + custom React hooks
├── integrations/zenoti/ # Zenoti API client, endpoints, hooks, mappers
├── layouts/            # DashboardLayout (sidebar, topbar, location/role)
├── lib/                # ai-context.ts, ai-responses.ts, build-analyst-context.ts, generate-pdf.tsx
├── modules/
│   ├── dashboard/      # DashboardHome
│   ├── intelligence/   # IntelligenceOverview, AIAnalyst, GapAnalysis, PackageTruth,
│   │                   # PredictiveAlerts, AutomatedReports, WhatIfSimulator
│   ├── performance/    # Performance (scorecard, benchmarks, providers)
│   └── settings/       # Settings (client config, Zenoti integration hub, sign out)
├── stores/             # useLocationStore, useAuthStore, useChatStore, useClientStore, useZenotiStore
└── types/              # TypeScript types
api/
├── analyst.ts          # Claude API streaming for AI Analyst
├── auth.ts             # Password gate verification endpoint
├── generate-report.ts  # Claude API streaming for Gap Analysis report
├── send-report.ts      # Email sending via Resend API
└── zenoti-proxy.ts     # Zenoti API proxy
```

## ENVIRONMENT VARIABLES

```bash
# Vercel Dashboard → Settings → Environment Variables
ANTHROPIC_API_KEY=sk-ant-...          # For AI Analyst + Report Generation
CLIENT_PASSWORD=...                   # Optional — password gate for dashboard access (skip if unset)
RESEND_API_KEY=re_...                 # Optional — email delivery for gap analysis reports
# Future (Priority 2):
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_KEY=eyJ...
```

## PRIORITY ORDER

1. **P0**: Dashboard must not break in demo (audit checklist)
2. **P1**: Real Claude API for AI Analyst (streaming, graceful fallback)
3. **P3**: Gap Analysis report generation + PDF export + email
4. **P4**: Website copy update (separate repo)
5. **P2**: Zenoti data ingestion (post-demo, for first paid client)

## LANGUAGE DISCIPLINE

**NEVER use**: capture, automate, handle calls, respond to inquiries, AI receptionist, chatbot, 24/7 response
**ALWAYS use**: surface, identify, visibility, gaps, patterns, benchmarking, cross-location, intelligence, audit, operational insight

## AI ANALYST

- Calls `/api/analyst` (Vercel serverless) with real dashboard metrics + clientName as context
- Falls back to keyword matching in `ai-responses.ts` if API unavailable
- Streams responses character-by-character
- Context injected via `build-analyst-context.ts` using `computeContext()` from seed data

## GAP ANALYSIS REPORT

- Route: `/gap-analysis`
- Calls `/api/generate-report` for AI-powered report
- Falls back to local template generation
- Downloadable as PDF (professional consulting format) or markdown
- Emailable via `/api/send-report` (requires RESEND_API_KEY)
- Designed as the $2,500 deliverable
- Client name is configurable via Settings → Practice Name

## CLIENT CONFIGURATION

- Practice name stored in `useClientStore` (Zustand + localStorage persist)
- Configurable in Settings page under "Client Configuration"
- Propagates to: AI Analyst system prompt, Gap Analysis reports, PDF headers, email subjects, dashboard topbar
- Default: "GlowUp Aesthetics" (demo placeholder)

## PASSWORD GATE

- Optional: only active when `CLIENT_PASSWORD` env var is set in Vercel
- Client-side gate with server-side verification via `/api/auth`
- Session-based (sessionStorage) — clears on tab close
- Sign Out button in Settings clears session

## DEMO DATA

- 5 locations: SoHo Flagship, Williamsburg, Hoboken, White Plains, Stamford
- Company: "GlowUp Aesthetics" (configurable in Settings)
- Industry benchmarks from AmSpa 2024, Zenoti 2025 Benchmark Report
- Location count is fully dynamic — works for 3, 5, or 45+ locations
