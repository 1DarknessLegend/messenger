import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'
import { MessageBubble } from './MessageBubble'
import { Avatar } from './Avatar'

export function ChatWindow() {
  const { activeChatId, chats, getMessages, sendMessage, setTyping, typingUsers } =
    useChatStore()
  const user = useAuthStore((s) => s.user)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const chat = chats.find((c) => c.id === activeChatId)
  const messages = activeChatId ? getMessages(activeChatId) : []

  const displayName = chat
    ? chat.type === 'group'
      ? chat.name || 'Группа'
      : Object.entries(chat.memberNames || {}).find(([id]) => id !== user?.uid)?.[1] ||
        chat.name ||
        'Чат'
    : ''

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeChatId])

  const handleSend = () => {
    if (!activeChatId || !text.trim()) return
    sendMessage(activeChatId, text)
    setText('')
    setTyping(activeChatId, false)
  }

  const handleInput = (value: string) => {
    setText(value)
    if (!activeChatId) return
    setTyping(activeChatId, true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setTyping(activeChatId, false), 1500)
  }

  if (!activeChatId || !chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500">
        <MessageCircle size={64} className="mb-4 opacity-40" />
        <p className="text-lg">Выберите чат или создайте новый</p>
        <p className="text-sm mt-1 opacity-70">Сообщения появятся здесь</p>
      </div>
    )
  }

  const typing = (typingUsers[activeChatId] || []).filter((n) => n !== user?.displayName)

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full min-w-0">
      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80 backdrop-blur">
        <Avatar name={displayName} size="md" online />
        <div>
          <div className="font-semibold text-slate-100">{displayName}</div>
          <div className="text-xs text-slate-400">
            {typing.length > 0 ? (
              <span className="text-emerald-400">{typing.join(', ')} печатает...</span>
            ) : (
              'онлайн'
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-10">
            Начните переписку — отправьте первое сообщение
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Напишите сообщение..."
            rows={1}
            className="flex-1 resize-none bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
