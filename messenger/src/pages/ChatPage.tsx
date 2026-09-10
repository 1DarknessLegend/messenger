import { useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { ChatWindow } from '../components/ChatWindow'
import { useChatStore } from '../stores/chatStore'
import { useAuthStore } from '../stores/authStore'

export function ChatPage() {
  const loadChats = useChatStore((s) => s.loadChats)
  const seedDemoData = useChatStore((s) => s.seedDemoData)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    loadChats()
    // если чатов нет — предложим демо
    const chats = useChatStore.getState().chats
    if (chats.length === 0 && user) {
      // не авто-seed, пользователь сам нажмёт
    }
  }, [loadChats, user])

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  )
}
