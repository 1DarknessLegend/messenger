import type { Message } from '../types'
import { formatTime, cn } from '../lib/utils'
import { useAuthStore } from '../stores/authStore'

interface Props {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const user = useAuthStore((s) => s.user)
  const isMine = message.senderId === user?.uid

  return (
    <div className={cn('flex mb-3', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isMine
            ? 'bg-indigo-600 text-white rounded-br-md'
            : 'bg-slate-700 text-slate-100 rounded-bl-md'
        )}
      >
        {!isMine && (
          <div className="text-xs font-medium text-indigo-300 mb-0.5">
            {message.senderName}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <div
          className={cn(
            'text-[10px] mt-1 text-right',
            isMine ? 'text-indigo-200' : 'text-slate-400'
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  )
}
