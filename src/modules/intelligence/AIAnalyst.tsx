import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Brain, Sparkles, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { computeContext } from '@/lib/ai-context'
import { generateAIResponse } from '@/lib/ai-responses'
import type { ChatMessage } from '@/types'

const SUGGESTED_PROMPTS = [
  { label: 'Why did revenue change this week?', icon: '📊' },
  { label: 'Which location is underperforming?', icon: '📍' },
  { label: 'What should I focus on this week?', icon: '🎯' },
  { label: 'Compare my locations', icon: '🏢' },
  { label: 'Show me no-show trends', icon: '📉' },
  { label: 'How is the opportunity pipeline?', icon: '🔮' },
]

// Safe markdown renderer — renders to React elements
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
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
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
      i++
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
  const { messages, isLoading, addMessage, updateLastMessage, setLoading, clearMessages } = useChatStore()
  const { selectedLocation } = useLocationStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const idCounter = useRef(0)
  const streamRef = useRef<number | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) clearInterval(streamRef.current)
    }
  }, [])

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

    // Generate full response using context-aware system
    const ctx = computeContext(selectedLocation)
    const fullResponse = generateAIResponse(content, ctx)

    // Start streaming after a brief "thinking" delay
    setTimeout(() => {
      idCounter.current += 1
      const assistantMessage: ChatMessage = {
        id: `assistant-${idCounter.current}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }
      addMessage(assistantMessage)

      // Stream character by character
      let charIndex = 0
      const chunkSize = 3
      streamRef.current = window.setInterval(() => {
        charIndex += chunkSize
        if (charIndex >= fullResponse.length) {
          charIndex = fullResponse.length
          if (streamRef.current) {
            clearInterval(streamRef.current)
            streamRef.current = null
          }
          setLoading(false)
        }
        updateLastMessage(fullResponse.slice(0, charIndex))
      }, 12)
    }, 600)
  }, [isLoading, addMessage, updateLastMessage, setLoading, selectedLocation])

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
          onClick={() => {
            if (streamRef.current) {
              clearInterval(streamRef.current)
              streamRef.current = null
            }
            setLoading(false)
            clearMessages()
          }}
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
                  I have access to all your Zenoti data across 5 locations.
                  Ask me anything about revenue, performance, trends, or get actionable recommendations.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.label)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-primary/[0.06] hover:border-primary/30 hover:bg-primary/5 hover:shadow-elevation-sm transition-all text-left"
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
                      : 'bg-primary/[0.06] text-foreground'
                  )}>
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-primary/[0.06] rounded-lg p-4">
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
