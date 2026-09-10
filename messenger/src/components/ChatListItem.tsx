import type { Chat } from '../types'
import { Avatar } from './Avatar'
import { formatTime, cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'

interface Props {
  chat: Chat
  isActive: boolean
  onClick: () => void
}

export function ChatListItem({ chat, isActive, onClick }: Props) {
  const user = useAuthStore((s) => s.user)

  const displayName =
    chat.type === 'group'
      ? chat.name || 'Группа'
      : Object.entries(chat.memberNames || {})
          .find(([id]) => id !== user?.uid)?.[1] || chat.name || 'Чат'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 text-left transition-colors rounded-xl',
        isActive ? 'bg-indigo-600/30' : 'hover:bg-slate-800/80'
      )}
    >
      <Avatar name={displayName} online={true} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-100 truncate">{displayName}</span>
          {chat.lastMessageAt && (
            <span className="text-[11px] text-slate-400 flex-shrink-0">
              {formatTime(chat.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 truncate mt-0.5">
          {chat.lastMessage || 'Нет сообщений'}
        </p>
      </div>
    </button>
  )
}
