import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, MessageSquare, Globe, Share2, Search, ArrowLeft, Send, Bot, User as UserIcon } from 'lucide-react'
import { useLocationStore } from '@/stores/useLocationStore'
import { conversations } from '@/data/seed'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import type { Conversation } from '@/types'

export function ConversationInbox() {
  const { selectedLocation } = useLocationStore()
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConvos = (selectedLocation === 'all'
    ? conversations
    : conversations.filter((c) => c.locationId === selectedLocation)
  ).filter((c) =>
    searchQuery === '' ||
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.summary.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'voice': return <Phone className="w-3.5 h-3.5 text-[var(--channel-voice)]" />
      case 'sms': return <MessageSquare className="w-3.5 h-3.5 text-[var(--channel-voice)]" />
      case 'web': return <Globe className="w-3.5 h-3.5 text-primary" />
      case 'social': return <Share2 className="w-3.5 h-3.5 text-warning" />
      default: return null
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive'
      case 'pending': return 'bg-warning'
      default: return 'bg-primary'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'ai_resolved': return { text: 'AI Resolved', color: 'text-primary bg-primary/10' }
      case 'escalated': return { text: 'Escalated', color: 'text-warning bg-warning/10' }
      case 'in_progress': return { text: 'In Progress', color: 'text-[var(--channel-voice)] bg-[var(--channel-voice)]/10' }
      case 'abandoned': return { text: 'Abandoned', color: 'text-destructive bg-destructive/10' }
      default: return { text: status, color: 'text-muted-foreground bg-primary/[0.06]' }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/command-center" className="p-2 rounded-lg hover:bg-primary/[0.05] text-muted-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Conversation Inbox</h1>
          <p className="text-muted-foreground mt-0.5">{filteredConvos.length} conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)] md:h-[calc(100vh-180px)]">
        {/* Conversation List */}
        <div className="lg:col-span-2 card-premium flex flex-col overflow-hidden max-h-[50vh] lg:max-h-none">
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-primary/[0.06] border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scroll-fade-y">
            {filteredConvos.length === 0 && searchQuery !== '' && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Search className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No conversations match your search</p>
              </div>
            )}
            {filteredConvos.map((convo) => {
              const status = statusLabel(convo.status)
              return (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className={cn(
                    'p-3 border-b border-border cursor-pointer transition-all duration-200',
                    selectedConvo?.id === convo.id ? 'bg-primary/[0.06] shadow-[inset_3px_0_0_var(--primary)]' : 'hover:bg-primary/[0.06]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', priorityColor(convo.priority))} />
                      <p className="text-sm font-medium text-foreground truncate">{convo.clientName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {channelIcon(convo.channel)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(convo.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 ml-4">{convo.summary}</p>
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', status.color)}>{status.text}</span>
                    {convo.afterHours && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-primary bg-primary/10">After Hours</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-3 card-premium flex flex-col overflow-hidden">
          {selectedConvo ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-foreground">{selectedConvo.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {channelIcon(selectedConvo.channel)}
                      <span className="text-sm text-muted-foreground">{selectedConvo.clientPhone}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', statusLabel(selectedConvo.status).color)}>
                        {statusLabel(selectedConvo.status).text}
                      </span>
                    </div>
                  </div>
                  {selectedConvo.status !== 'ai_resolved' && (
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      Take Over
                    </button>
                  )}
                </div>

                {/* AI Summary */}
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedConvo.summary}</p>
                </div>
              </div>

              {/* Transcript */}
              <div className="flex-1 overflow-y-auto scroll-fade-y p-4 space-y-3">
                {selectedConvo.transcript.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'client' ? 'justify-start' : 'justify-end'
                    )}
                  >
                    {msg.role === 'client' && (
                      <div className="w-7 h-7 rounded-full bg-[var(--channel-voice)]/20 flex items-center justify-center shrink-0">
                        <UserIcon className="w-3.5 h-3.5 text-[var(--channel-voice)]" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[70%] p-3 rounded-lg text-sm shadow-elevation-sm',
                      msg.role === 'client'
                        ? 'bg-primary/[0.06] text-foreground'
                        : msg.role === 'ai'
                        ? 'bg-primary/10 text-foreground'
                        : 'bg-primary/10 text-foreground'
                    )}>
                      <p>{msg.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role !== 'client' && (
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                        msg.role === 'ai' ? 'bg-primary/20' : 'bg-primary/20'
                      )}>
                        {msg.role === 'ai'
                          ? <Bot className="w-3.5 h-3.5 text-primary" />
                          : <UserIcon className="w-3.5 h-3.5 text-primary" />}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Reply box */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a response or let AI suggest..."
                    className="flex-1 px-3 py-2 bg-primary/[0.06] border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                  />
                  <button className="p-2 bg-primary rounded-lg hover:bg-primary/90 transition-colors">
                    <Send className="w-4 h-4 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select a conversation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
