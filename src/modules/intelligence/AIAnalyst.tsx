import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Brain, Sparkles, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'
import type { ChatMessage } from '@/types'

const SUGGESTED_PROMPTS = [
  { label: 'Why did revenue change this week?', icon: '📊' },
  { label: 'Which location is underperforming?', icon: '📍' },
  { label: 'What should I focus on this week?', icon: '🎯' },
  { label: 'Compare my locations', icon: '🏢' },
  { label: 'Predict next month\'s revenue', icon: '🔮' },
  { label: 'Show me no-show trends', icon: '📉' },
]

// Simulated AI responses based on prompts
function generateResponse(prompt: string): string {
  const lower = prompt.toLowerCase()

  if (lower.includes('revenue') && lower.includes('change')) {
    return `## Revenue Analysis — This Week

**Total revenue is up 12.3% week-over-week**, driven primarily by strong performance at SoHo and Hoboken.

### Key Drivers:
- **SoHo Flagship**: +18.5% ($42,300 → $50,100) — Body Contouring bookings surged after the Tuesday promo
- **Hoboken**: +15.2% — New client acquisition from social media campaign
- **Williamsburg**: -3.1% — Slight dip due to provider schedule change

### Revenue Breakdown:
| Source | Amount | Change |
|--------|--------|--------|
| Botox | $38,200 | +8.5% |
| Dermal Filler | $24,600 | +22.1% |
| Hydrafacial | $12,400 | +5.3% |
| Body Contouring | $18,900 | +35.0% |

### Recommendation:
The Body Contouring surge suggests strong demand. Consider extending the Tuesday promo at SoHo and rolling it out to Williamsburg and White Plains.`
  }

  if (lower.includes('underperform')) {
    return `## Location Performance Analysis

**White Plains is currently underperforming** relative to its capacity.

### Metrics Comparison:
| Location | Utilization | Revenue/Room | No-Show Rate |
|----------|-------------|--------------|--------------|
| SoHo Flagship | 78% | $2,850/day | 10.2% |
| Williamsburg | 68% | $2,100/day | 12.5% |
| Hoboken | 72% | $2,400/day | 11.8% |
| **White Plains** | **52%** | **$1,340/day** | **16.1%** |
| Stamford | 61% | $1,620/day | 13.4% |

### White Plains Issues:
1. **High no-show rate (16.1%)** — Above the 12% benchmark
2. **Low utilization (52%)** — 3 rooms, only averaging 1.5 in use
3. **Weak Tuesday-Thursday traffic** — Weekend bookings are fine

### Action Items:
- Deploy targeted no-show prevention (tiered reminders + deposits)
- Launch a "Midweek Glow" promotion for Tue-Thu slots
- Consider cross-promoting to SoHo clients who live in Westchester`
  }

  if (lower.includes('focus') || lower.includes('priority')) {
    return `## This Week's Priority Actions

Based on your current data, here are the **top 5 things to focus on**:

### 1. 🔴 White Plains No-Show Crisis
- Rate jumped to 16.1% — costing ~$4,200/week in lost revenue
- **Action**: Enable mandatory deposit for new clients, increase reminder cadence

### 2. 🟡 Williamsburg Staffing Gap
- Dr. Park is on PTO next week — 12 slots at risk
- **Action**: Redistribute to Dr. Ross or activate waitlist auto-fill

### 3. 🟢 SoHo Body Contouring Demand
- Demand up 35% — you're now waitlisting clients
- **Action**: Add a Saturday Body Contouring block, consider hiring

### 4. 🟡 Stamford Lead Follow-up
- 23 warm leads from social media haven't been contacted in >48h
- **Action**: Assign Text Concierge to auto-nurture sequence

### 5. 🟢 Rebooking Rate Optimization
- Current rebooking rate is 62% — industry benchmark is 75%
- **Action**: Enable AI rebooking prompt at checkout for all locations`
  }

  if (lower.includes('compare') && lower.includes('location')) {
    return `## Multi-Location Comparison Report

### Revenue Performance (Last 30 Days)
\`\`\`
SoHo Flagship  ████████████████████████████ $128,400  (+15.8%)
Hoboken        ████████████████████         $82,300   (+12.1%)
Williamsburg   ██████████████████           $74,200   (+4.2%)
Stamford       ████████████                 $48,600   (+8.9%)
White Plains   ██████████                   $38,100   (-2.3%)
\`\`\`

### Key Metrics Comparison:
| Metric | SoHo | W'burg | Hoboken | W.Plains | Stamford |
|--------|------|--------|---------|----------|----------|
| Util. Rate | 78% | 68% | 72% | 52% | 61% |
| No-Show | 10.2% | 12.5% | 11.8% | 16.1% | 13.4% |
| Avg Ticket | $520 | $445 | $490 | $380 | $410 |
| New Clients | 45 | 28 | 35 | 18 | 22 |
| Rebook Rate | 71% | 64% | 68% | 55% | 59% |

### Insights:
- **SoHo** is the clear leader — highest utilization, lowest no-show, highest ticket
- **White Plains** needs immediate attention — declining revenue, high no-shows
- **Hoboken** is the rising star — fastest growth rate per provider
- **Stamford** has untapped potential — good no-show rate but low utilization`
  }

  if (lower.includes('predict') || lower.includes('forecast')) {
    return `## Revenue Forecast — Next 30 Days

Based on current trends, seasonality patterns, and pipeline analysis:

### Projected Revenue: **$398,500** (+5.2% vs current month)

### By Location:
| Location | Current | Projected | Change |
|----------|---------|-----------|--------|
| SoHo | $128,400 | $138,200 | +7.6% |
| Hoboken | $82,300 | $88,500 | +7.5% |
| Williamsburg | $74,200 | $76,800 | +3.5% |
| Stamford | $48,600 | $52,100 | +7.2% |
| White Plains | $38,100 | $42,900 | +12.6%* |

*White Plains projected increase assumes no-show intervention is implemented.

### Confidence Level: **82%**

### Risk Factors:
- ⚠️ If White Plains no-shows aren't addressed: -$8,400
- ⚠️ Dr. Park PTO at Williamsburg: -$4,200
- ✅ Body Contouring demand surge: +$6,800
- ✅ New social media campaign launching: +$3,200`
  }

  if (lower.includes('no-show') || lower.includes('no show')) {
    return `## No-Show Trend Analysis

### 90-Day Overview:
\`\`\`
Before EIP (Day 1-30):   ████████████████████████████ 28.2%
Ramp-up (Day 31-60):     ██████████████████           18.1%
Current (Day 61-90):     ████████████                 12.4%
\`\`\`

**Total reduction: 56% (28.2% → 12.4%)**

### Impact:
- **$47,200/month** in recovered revenue from prevented no-shows
- **~94 appointments saved** per month across all locations
- Average appointment value saved: $502

### By Location (Current):
- SoHo: 10.2% ✅ (Target: <12%)
- Williamsburg: 12.5% ⚠️
- Hoboken: 11.8% ✅
- White Plains: 16.1% 🔴 (Needs attention)
- Stamford: 13.4% ⚠️

### What's Working:
1. **Tiered reminders** (48h, 24h, 2h) — reduced no-shows by 35%
2. **Risk scoring** — high-risk flagging catches 78% of actual no-shows
3. **Waitlist auto-fill** — 85% of cancellation slots are filled within 2 hours`
  }

  // Default response
  return `## Analysis

I've looked into your question. Here's what I found:

Based on the current performance data across your 5 locations:

- **Total monthly revenue**: ~$380,000 across all locations
- **Revenue recovered by AI**: $47,200 this month
- **Top performing location**: SoHo Flagship ($128,400/month)
- **No-show rate**: Down from 28% to 12.4% since implementing EIP

### Key Insight:
Your biggest opportunity right now is **White Plains** — it's running at only 52% utilization with a 16.1% no-show rate. Addressing these two issues could add an estimated **$12,000-15,000/month** in additional revenue.

Would you like me to:
- Deep dive into a specific location?
- Analyze a particular service category?
- Generate a weekly P&L impact report?`
}

// Safe markdown renderer — renders to React elements instead of raw HTML
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let key = 0

  const renderInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = []
    let remaining = text
    let inlineKey = 0

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      // Inline code
      const codeMatch = remaining.match(/`([^`]+)`/)

      const boldIdx = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity
      const codeIdx = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity

      if (boldIdx === Infinity && codeIdx === Infinity) {
        parts.push(remaining)
        break
      }

      if (boldIdx <= codeIdx && boldMatch) {
        if (boldIdx > 0) parts.push(remaining.slice(0, boldIdx))
        parts.push(<strong key={`b${inlineKey++}`} className="text-foreground">{boldMatch[1]}</strong>)
        remaining = remaining.slice(boldIdx + boldMatch[0].length)
      } else if (codeMatch) {
        if (codeIdx > 0) parts.push(remaining.slice(0, codeIdx))
        parts.push(<code key={`c${inlineKey++}`} className="text-xs text-primary bg-primary/[0.06] px-1 rounded">{codeMatch[1]}</code>)
        remaining = remaining.slice(codeIdx + codeMatch[0].length)
      }
    }

    return parts
  }

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      elements.push(
        <pre key={key++} className="bg-primary/[0.06] rounded-lg p-3 overflow-x-auto">
          <code className="bg-transparent p-0 text-sm">{codeLines.join('\n')}</code>
        </pre>
      )
      continue
    }

    // Table detection
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableRows: string[][] = []
      let hasHeader = false

      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').filter(Boolean).map(c => c.trim())
        if (cells.every(c => /^[-:]+$/.test(c))) {
          hasHeader = true
          i++
          continue
        }
        tableRows.push(cells)
        i++
      }

      elements.push(
        <table key={key++} className="w-full text-sm">
          {hasHeader && tableRows.length > 0 && (
            <thead>
              <tr className="border-b border-border">
                {tableRows[0].map((cell, ci) => (
                  <th key={ci} className="text-left text-muted-foreground font-medium pb-2 pr-4 text-xs">{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableRows.slice(hasHeader ? 1 : 0).map((row, ri) => (
              <tr key={ri} className="border-b border-border">
                {row.map((cell, ci) => (
                  <td key={ci} className="py-1.5 pr-4 text-muted-foreground text-sm font-mono">{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-sm font-semibold text-foreground mt-4 mb-2">{renderInline(line.slice(4))}</h3>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-lg font-semibold text-foreground mt-0 mb-3">{renderInline(line.slice(3))}</h2>)
      i++
      continue
    }

    // List items
    if (line.match(/^- /)) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].match(/^- /)) {
        listItems.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="space-y-1">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-muted-foreground">{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      elements.push(
        <ul key={key++} className="space-y-1">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-muted-foreground">{renderInline(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraphs
    elements.push(<p key={key++} className="text-sm text-muted-foreground my-2">{renderInline(line)}</p>)
    i++
  }

  return <div className="prose prose-sm max-w-none space-y-2">{elements}</div>
}

export function AIAnalyst() {
  const { messages, isLoading, addMessage, setLoading, clearMessages } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback((content: string) => {
    if (!content.trim() || isLoading) return

    idCounter.current += 1
    const userMessage: ChatMessage = {
      id: `user-${idCounter.current}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }
    addMessage(userMessage)
    setInput('')
    setLoading(true)

    // Simulate streaming delay
    setTimeout(() => {
      const response = generateResponse(content)
      idCounter.current += 1
      const assistantMessage: ChatMessage = {
        id: `assistant-${idCounter.current}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }
      addMessage(assistantMessage)
      setLoading(false)
    }, 1500)
  }, [isLoading, addMessage, setLoading])

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)]">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/intelligence" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">AI Revenue Analyst</h1>
          </div>
          <p className="text-muted-foreground mt-0.5">Powered by Claude — Ask anything about your business</p>
        </div>
        <button
          onClick={clearMessages}
          className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors"
          title="Clear conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card-premium flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-fade-y p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Your AI Revenue Analyst
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  I have access to all your business data across 5 locations.
                  Ask me anything about revenue, performance, trends, or get actionable recommendations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.label)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-primary/[0.03] hover:border-primary/30 hover:bg-primary/5 hover:shadow-elevation-sm transition-all text-left"
                    >
                      <span className="text-lg">{prompt.icon}</span>
                      <span className="text-sm text-muted-foreground">{prompt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[80%] rounded-lg p-4',
                    msg.role === 'user'
                      ? 'bg-primary/10 text-foreground'
                      : 'bg-primary/[0.03] text-foreground'
                  )}>
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-primary/[0.03] rounded-lg p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          {messages.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto scroll-fade-x pb-1">
              {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => sendMessage(prompt.label)}
                  className="px-3 py-1.5 text-xs whitespace-nowrap rounded-full border border-border text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask about revenue, performance, trends..."
              className="flex-1 px-4 py-3 bg-primary/[0.06] border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className={cn(
                'px-4 py-3 rounded-lg transition-colors flex items-center gap-2',
                input.trim() && !isLoading
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-primary/[0.06] text-muted-foreground cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
