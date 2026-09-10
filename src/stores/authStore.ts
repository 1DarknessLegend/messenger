import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { isFirebaseConfigured, auth } from '../lib/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { generateId } from '../lib/utils'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isDemo: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clearError: () => void
  initAuth: () => () => void
  enterDemoMode: (name: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,
      isDemo: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      clearError: () => set({ error: null }),

      enterDemoMode: (name: string) => {
        const demoUser: User = {
          uid: 'demo-' + generateId(),
          email: 'demo@local.dev',
          displayName: name || 'Демо Пользователь',
          online: true,
        }
        set({ user: demoUser, isDemo: true, loading: false, error: null })
      },

      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          if (!isFirebaseConfigured) {
            // Демо-режим: простой вход без Firebase
            if (password.length < 4) throw new Error('Пароль слишком короткий')
            const demoUser: User = {
              uid: 'local-' + btoa(email).slice(0, 12),
              email,
              displayName: email.split('@')[0],
              online: true,
            }
            set({ user: demoUser, isDemo: true, loading: false })
            return
          }
          const cred = await signInWithEmailAndPassword(auth, email, password)
          const u = cred.user
          set({
            user: {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || email.split('@')[0],
              photoURL: u.photoURL || undefined,
              online: true,
            },
            isDemo: false,
            loading: false,
          })
        } catch (e: any) {
          set({ error: e.message || 'Ошибка входа', loading: false })
          throw e
        }
      },

      register: async (email, password, displayName) => {
        set({ loading: true, error: null })
        try {
          if (!isFirebaseConfigured) {
            if (password.length < 4) throw new Error('Пароль слишком короткий (мин. 4)')
            const demoUser: User = {
              uid: 'local-' + btoa(email).slice(0, 12),
              email,
              displayName: displayName || email.split('@')[0],
              online: true,
            }
            set({ user: demoUser, isDemo: true, loading: false })
            return
          }
          const cred = await createUserWithEmailAndPassword(auth, email, password)
          await updateProfile(cred.user, { displayName })
          set({
            user: {
              uid: cred.user.uid,
              email: cred.user.email || '',
              displayName,
              online: true,
            },
            isDemo: false,
            loading: false,
          })
        } catch (e: any) {
          set({ error: e.message || 'Ошибка регистрации', loading: false })
          throw e
        }
      },

      logout: async () => {
        if (isFirebaseConfigured && !get().isDemo) {
          await signOut(auth)
        }
        set({ user: null, isDemo: false, error: null })
      },

      initAuth: () => {
        if (!isFirebaseConfigured) {
          set({ loading: false })
          return () => {}
        }
        const unsub = onAuthStateChanged(auth, (u) => {
          if (u) {
            set({
              user: {
                uid: u.uid,
                email: u.email || '',
                displayName: u.displayName || u.email?.split('@')[0] || 'User',
                photoURL: u.photoURL || undefined,
                online: true,
              },
              isDemo: false,
              loading: false,
            })
          } else {
            set({ user: null, loading: false })
          }
        })
        return unsub
      },
    }),
    {
      name: 'messenger-auth',
      partialize: (s) => ({ user: s.user, isDemo: s.isDemo }),
    }
  )
)
