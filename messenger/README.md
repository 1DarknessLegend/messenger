# Messenger — веб-мессенджер

Современный мессенджер на **React + Vite + TypeScript + Tailwind CSS + Firebase**.

## Возможности

- 🔐 Регистрация / вход (Email + пароль) через Firebase Auth
- 💬 Личные и групповые чаты
- ⚡ Сообщения в реальном времени
- 📱 Адаптивный дизайн (мобильный + десктоп)
- 🌙 Тёмная тема
- 🎭 **Демо-режим** без Firebase (данные в `localStorage`)

## Быстрый старт

### 1. Клонировать и установить

```bash
git clone https://github.com/YOUR_USERNAME/messenger.git
cd messenger
npm install
```

### 2. (Опционально) Firebase

1. Создай проект на [Firebase Console](https://console.firebase.google.com/)
2. Включи **Authentication → Email/Password**
3. Создай **Firestore Database** (в режиме production + настрой Security Rules)
4. Скопируй конфиг в `.env`:

```bash
cp .env.example .env
# заполни значения
```

Если Firebase не настроен — приложение автоматически работает в **демо-режиме**.

### 3. Запуск

```bash
npm run dev
```

Открой http://localhost:5173/messenger/

### 4. Сборка

```bash
npm run build
```

## Деплой на GitHub Pages

1. Создай репозиторий с именем `messenger` (или измени `base` в `vite.config.ts`)
2. Включи GitHub Pages: **Settings → Pages → Source: GitHub Actions**
3. Запушь в `main` — workflow автоматически соберёт и задеплоит

Сайт будет доступен по адресу:  
`https://YOUR_USERNAME.github.io/messenger/`

## Структура проекта

```
src/
├── components/     # UI-компоненты
├── pages/          # Login, Register, Chat
├── stores/         # Zustand (auth + chats)
├── lib/            # Firebase + utils
└── types/          # TypeScript типы
```

## Security Rules (Firestore) — пример

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.members;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Лицензия

MIT
