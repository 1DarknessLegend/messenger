import { useState } from 'react'
import { LogOut, MessageSquarePlus, Search, X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useChatStore } from '../stores/chatStore'
import { ChatListItem } from './ChatListItem'
import { Avatar } from './Avatar'
import { generateId } from '../lib/utils'

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { chats, activeChatId, setActiveChat, createChat, seedDemoData } = useChatStore()
  const [search, setSearch] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatName, setNewChatName] = useState('')

  const filtered = chats.filter((c) => {
    const name =
      c.name ||
      Object.values(c.memberNames || {}).join(' ') ||
      ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const handleCreate = () => {
    if (!newChatName.trim() || !user) return
    // Создаём "чат с ботом" для демо
    const botId = 'bot-' + generateId().slice(0, 6)
    const id = createChat(
      [botId],
      { [botId]: newChatName.trim() },
      newChatName.trim()
    )
    setActiveChat(id)
    setShowNewChat(false)
    setNewChatName('')
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 flex flex-col bg-slate-900 border-r border-slate-800 h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={user?.displayName || 'U'} size="md" online />
          <div className="min-w-0">
            <div className="font-semibold text-slate-100 truncate">
              {user?.displayName}
            </div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            title="Новый чат"
          >
            <MessageSquarePlus size={20} />
          </button>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
            title="Выйти"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* New chat modal */}
      {showNewChat && (
        <div className="mx-3 mb-3 p-3 bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Новый чат</span>
            <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Имя собеседника"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition"
          >
            Создать
          </button>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8 px-4">
            <p>Нет чатов</p>
            <button
              onClick={() => seedDemoData()}
              className="mt-3 text-indigo-400 hover:text-indigo-300 underline text-sm"
            >
              Загрузить демо-чат
            </button>
          </div>
        ) : (
          filtered.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => setActiveChat(chat.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}
