export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  online?: boolean
  lastSeen?: number
}

export interface Chat {
  id: string
  type: 'private' | 'group'
  name?: string
  members: string[]
  memberNames?: Record<string, string>
  lastMessage?: string
  lastMessageAt?: number
  createdAt: number
  updatedAt: number
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  text: string
  createdAt: number
  readBy?: string[]
}

export interface TypingStatus {
  chatId: string
  userId: string
  userName: string
  isTyping: boolean
}
