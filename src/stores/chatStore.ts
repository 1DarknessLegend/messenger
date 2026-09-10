import { create } from 'zustand'
import type { Chat, Message } from '../types'
import { generateId } from '../lib/utils'
import { useAuthStore } from './authStore'

interface ChatState {
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
  loading: boolean
  typingUsers: Record<string, string[]> // chatId -> names

  setActiveChat: (id: string | null) => void
  loadChats: () => void
  createChat: (memberIds: string[], memberNames: Record<string, string>, name?: string) => string
  sendMessage: (chatId: string, text: string) => void
  getMessages: (chatId: string) => Message[]
  setTyping: (chatId: string, isTyping: boolean) => void
  // demo helpers
  seedDemoData: () => void
}

const STORAGE_KEY = 'messenger-chats-v1'
const MSG_KEY = 'messenger-msgs-v1'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data))
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  activeChatId: null,
  loading: false,
  typingUsers: {},

  setActiveChat: (id) => set({ activeChatId: id }),

  loadChats: () => {
    const chats = loadFromStorage<Chat[]>(STORAGE_KEY, [])
    const messages = loadFromStorage<Record<string, Message[]>>(MSG_KEY, {})
    set({ chats, messages })
  },

  createChat: (memberIds, memberNames, name) => {
    const user = useAuthStore.getState().user
    if (!user) return ''

    const allMembers = Array.from(new Set([user.uid, ...memberIds]))
    const id = generateId()
    const now = Date.now()

    const chat: Chat = {
      id,
      type: allMembers.length > 2 ? 'group' : 'private',
      name: name || (allMembers.length === 2
        ? memberNames[memberIds[0]] || 'Чат'
        : name || 'Группа'),
      members: allMembers,
      memberNames: { ...memberNames, [user.uid]: user.displayName },
      createdAt: now,
      updatedAt: now,
    }

    const chats = [chat, ...get().chats]
    set({ chats })
    saveToStorage(STORAGE_KEY, chats)
    return id
  },

  sendMessage: (chatId, text) => {
    const user = useAuthStore.getState().user
    if (!user || !text.trim()) return

    const msg: Message = {
      id: generateId(),
      chatId,
      senderId: user.uid,
      senderName: user.displayName,
      text: text.trim(),
      createdAt: Date.now(),
      readBy: [user.uid],
    }

    const messages = { ...get().messages }
    messages[chatId] = [...(messages[chatId] || []), msg]

    const chats = get().chats.map((c) =>
      c.id === chatId
        ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt, updatedAt: msg.createdAt }
        : c
    ).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))

    set({ messages, chats })
    saveToStorage(MSG_KEY, messages)
    saveToStorage(STORAGE_KEY, chats)

    // Broadcast for multi-tab
    try {
      const bc = new BroadcastChannel('messenger')
      bc.postMessage({ type: 'message', chatId, msg })
      bc.close()
    } catch {}
  },

  getMessages: (chatId) => get().messages[chatId] || [],

  setTyping: (chatId, isTyping) => {
    const user = useAuthStore.getState().user
    if (!user) return
    // simple local typing indicator (demo)
    set((s) => {
      const current = s.typingUsers[chatId] || []
      let next: string[]
      if (isTyping) {
        next = current.includes(user.displayName) ? current : [...current, user.displayName]
      } else {
        next = current.filter((n) => n !== user.displayName)
      }
      return { typingUsers: { ...s.typingUsers, [chatId]: next } }
    })
  },

  seedDemoData: () => {
    const user = useAuthStore.getState().user
    if (!user) return

    const existing = loadFromStorage<Chat[]>(STORAGE_KEY, [])
    if (existing.length > 0) {
      get().loadChats()
      return
    }

    const botId = 'bot-assistant'
    const chatId = generateId()
    const now = Date.now()

    const chat: Chat = {
      id: chatId,
      type: 'private',
      name: 'Grok Assistant',
      members: [user.uid, botId],
      memberNames: {
        [user.uid]: user.displayName,
        [botId]: 'Grok Assistant',
      },
      lastMessage: 'Привет! Это демо-мессенджер. Напиши что-нибудь 👋',
      lastMessageAt: now - 60000,
      createdAt: now - 3600000,
      updatedAt: now - 60000,
    }

    const msgs: Message[] = [
      {
        id: generateId(),
        chatId,
        senderId: botId,
        senderName: 'Grok Assistant',
        text: 'Привет! Это демо-мессенджер на React + Vite + Tailwind.',
        createdAt: now - 120000,
      },
      {
        id: generateId(),
        chatId,
        senderId: botId,
        senderName: 'Grok Assistant',
        text: 'Данные хранятся в localStorage. Для реального Firebase просто добавь ключи в .env',
        createdAt: now - 90000,
      },
      {
        id: generateId(),
        chatId,
        senderId: botId,
        senderName: 'Grok Assistant',
        text: 'Привет! Это демо-мессенджер. Напиши что-нибудь 👋',
        createdAt: now - 60000,
      },
    ]

    set({
      chats: [chat],
      messages: { [chatId]: msgs },
      activeChatId: chatId,
    })
    saveToStorage(STORAGE_KEY, [chat])
    saveToStorage(MSG_KEY, { [chatId]: msgs })
  },
}))
