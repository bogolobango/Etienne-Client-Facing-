import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Brain, Sparkles, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/useChatStore'
import { useLocationStore } from '@/stores/useLocationStore'
import { computeContext } from '@/lib/ai-context'
import { generateAIResponse } from '@/lib/ai-responses'
import type { ChatMessage } from '@/types'

const SUGGESTED_PROMPTS = [
  { label: 'Which center is underperforming this month?', icon: '📍' },
  { label: 'How much revenue are we losing to no-shows?', icon: '💰' },
  { label: 'Compare SoHo vs Williamsburg performance', icon: '📊' },
  { label: 'What should I focus on this week?', icon: '🎯' },
  { label: 'Where are the biggest revenue gaps right now?', icon: '🔮' },
  { label: 'Which provider has the best rebooking rate?', icon: '⭐' },
]

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead>{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
        th: ({ children }) => (
          <th className="text-left p-2 border-b border-border text-muted-foreground font-medium">{children}</th>
        ),
        td: ({ children }) => (
          <td className="p-2 border-b border-border/50 text-foreground font-mono">{children}</td>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-semibold text-foreground mt-1 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h3>
        ),
        strong: ({ children }) => (
          <strong className="text-foreground font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-muted-foreground">{children}</em>
        ),
        p: ({ children }) => (
          <p className="text-sm text-foreground/90 leading-relaxed mb-2">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="space-y-1 mb-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="space-y-1 mb-2">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-foreground/90 ml-4 mb-1">{children}</li>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-') || (typeof children === 'string' && children.includes('\n'))
          if (isBlock) {
            return (
              <pre className="bg-primary/[0.06] rounded-lg p-3 overflow-x-auto my-2">
                <code className="text-sm font-mono text-foreground/80 whitespace-pre">{children}</code>
              </pre>
            )
          }
          return <code className="text-xs bg-muted/50 text-primary px-1.5 py-0.5 rounded">{children}</code>
        },
        pre: ({ children }) => <>{children}</>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
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

    const ctx = computeContext(selectedLocation)
    const fullResponse = generateAIResponse(content, ctx)

    setTimeout(() => {
      idCounter.current += 1
      const assistantMessage: ChatMessage = {
        id: `assistant-${idCounter.current}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }
      addMessage(assistantMessage)

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

      <div className="flex-1 card-premium flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-fade-y p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-lg"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Your AI Revenue Analyst
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  I analyze your Zenoti data across all 5 centers — appointments, guests, invoices, and opportunities — to surface revenue gaps you'd otherwise miss.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt.label}
                      onClick={() => sendMessage(prompt.label)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-primary/[0.06] hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
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
