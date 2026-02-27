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
      case 'voice': return <Phone className="w-3.5 h-3.5 text-[#3B82F6]" />
      case 'sms': return <MessageSquare className="w-3.5 h-3.5 text-[#00D4AA]" />
      case 'web': return <Globe className="w-3.5 h-3.5 text-[#8B5CF6]" />
      case 'social': return <Share2 className="w-3.5 h-3.5 text-[#FFB547]" />
      default: return null
    }
  }

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-[#FF6B6B]'
      case 'pending': return 'bg-[#FFB547]'
      default: return 'bg-[#00D4AA]'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'ai_resolved': return { text: 'AI Resolved', color: 'text-[#00D4AA] bg-[#00D4AA]/10' }
      case 'escalated': return { text: 'Escalated', color: 'text-[#FFB547] bg-[#FFB547]/10' }
      case 'in_progress': return { text: 'In Progress', color: 'text-[#3B82F6] bg-[#3B82F6]/10' }
      case 'abandoned': return { text: 'Abandoned', color: 'text-[#FF6B6B] bg-[#FF6B6B]/10' }
      default: return { text: status, color: 'text-[#94A3B8] bg-white/5' }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/command-center" className="p-2 rounded-lg hover:bg-[#7B61FF]/[0.05] text-[#94A3B8] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9]">Conversation Inbox</h1>
          <p className="text-[#94A3B8] mt-0.5">{filteredConvos.length} conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-180px)]">
        {/* Conversation List */}
        <div className="lg:col-span-2 card-premium flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-[#7B61FF]/[0.08]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#7B61FF]/[0.06] border border-[#7B61FF]/[0.08] rounded-lg text-sm text-[#F1F5F9] placeholder:text-[#64748B] outline-none focus:border-[#00D4AA]/50"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.map((convo) => {
              const status = statusLabel(convo.status)
              return (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvo(convo)}
                  className={cn(
                    'p-3 border-b border-[#7B61FF]/[0.08] cursor-pointer transition-colors',
                    selectedConvo?.id === convo.id ? 'bg-[#7B61FF]/[0.06]' : 'hover:bg-[#7B61FF]/[0.03]'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full shrink-0', priorityColor(convo.priority))} />
                      <p className="text-sm font-medium text-[#F1F5F9] truncate">{convo.clientName}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {channelIcon(convo.channel)}
                      <span className="text-xs text-[#64748B]">
                        {new Date(convo.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2 ml-4">{convo.summary}</p>
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', status.color)}>{status.text}</span>
                    {convo.afterHours && (
                      <span className="text-xs px-2 py-0.5 rounded-full text-[#8B5CF6] bg-[#8B5CF6]/10">After Hours</span>
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
              <div className="p-4 border-b border-[#7B61FF]/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-[#F1F5F9]">{selectedConvo.clientName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {channelIcon(selectedConvo.channel)}
                      <span className="text-sm text-[#94A3B8]">{selectedConvo.clientPhone}</span>
                      <span className="text-xs text-[#64748B]">·</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', statusLabel(selectedConvo.status).color)}>
                        {statusLabel(selectedConvo.status).text}
                      </span>
                    </div>
                  </div>
                  {selectedConvo.status !== 'ai_resolved' && (
                    <button className="px-4 py-2 bg-[#00D4AA] text-[#0A0F1C] rounded-lg text-sm font-medium hover:bg-[#00D4AA]/90 transition-colors">
                      Take Over
                    </button>
                  )}
                </div>

                {/* AI Summary */}
                <div className="mt-3 p-3 rounded-lg bg-[#8B5CF6]/5 border border-[#8B5CF6]/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span className="text-xs font-medium text-[#8B5CF6]">AI Summary</span>
                  </div>
                  <p className="text-sm text-[#94A3B8]">{selectedConvo.summary}</p>
                </div>
              </div>

              {/* Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      <div className="w-7 h-7 rounded-full bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                        <UserIcon className="w-3.5 h-3.5 text-[#3B82F6]" />
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[70%] p-3 rounded-lg text-sm',
                      msg.role === 'client'
                        ? 'bg-[#7B61FF]/[0.06] text-[#F1F5F9]'
                        : msg.role === 'ai'
                        ? 'bg-[#8B5CF6]/10 text-[#F1F5F9]'
                        : 'bg-[#00D4AA]/10 text-[#F1F5F9]'
                    )}>
                      <p>{msg.content}</p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role !== 'client' && (
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                        msg.role === 'ai' ? 'bg-[#8B5CF6]/20' : 'bg-[#00D4AA]/20'
                      )}>
                        {msg.role === 'ai'
                          ? <Bot className="w-3.5 h-3.5 text-[#8B5CF6]" />
                          : <UserIcon className="w-3.5 h-3.5 text-[#00D4AA]" />}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Reply box */}
              <div className="p-3 border-t border-[#7B61FF]/[0.08]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a response or let AI suggest..."
                    className="flex-1 px-3 py-2 bg-[#7B61FF]/[0.06] border border-[#7B61FF]/[0.08] rounded-lg text-sm text-[#F1F5F9] placeholder:text-[#64748B] outline-none focus:border-[#00D4AA]/50"
                  />
                  <button className="p-2 bg-[#00D4AA] rounded-lg hover:bg-[#00D4AA]/90 transition-colors">
                    <Send className="w-4 h-4 text-[#0A0F1C]" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
                <p className="text-[#94A3B8]">Select a conversation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
