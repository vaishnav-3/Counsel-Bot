#  

<!-- Add your project banner image here -->
![Banner](./public/banner.png)

# AI Counseling Bot 🤖

An AI-powered counseling platform built with **Next.js**, **tRPC**, **TanStack Query**, **NextAuth**, **Drizzle ORM**, **PostgreSQL**, **TailwindCSS**, **ShadcnUI**, and **Gemini API**.

---

## 🚀 Tech Stack

- **Next.js** – Full-stack React framework  
- **TypeScript** – Type safety for scalability  
- **tRPC** – End-to-end type-safe APIs  
- **TanStack Query** – Data fetching & state management  
- **NextAuth.js** – Authentication & session management  
- **Drizzle ORM** – Type-safe database queries  
- **PostgreSQL** – Relational database  
- **TailwindCSS** – Utility-first CSS framework  
- **ShadcnUI** – Pre-built UI components  
- **Gemini API** – AI-powered conversations  

---

## 📂 Project Structure

```bash
.
├── drizzle
│   └── meta
├── public
└── src
    ├── app
    │   ├── api
    │   │   ├── auth
    │   │   │   ├── [...nextauth]
    │   │   │   └── signup
    │   │   └── trpc
    │   │       └── [trpc]
    │   ├── auth
    │   │   ├── signin
    │   │   └── signup
    │   └── chat
    │       └── [sessionId]
    ├── components
    │   ├── chat
    │   └── ui
    ├── db
    ├── hooks
    ├── lib
    ├── server
    │   └── trpc
    │       └── routers
    ├── trpc
    └── types
```

---

## ⚡ Features

- 🔐 **Secure Authentication** with NextAuth
- 📡 **Type-safe API calls** using tRPC
- 🗄 **Drizzle ORM + PostgreSQL** for database
- 🎨 **Beautiful UI** with Tailwind + ShadcnUI
- 🤖 **AI-powered counseling** using Gemini API
- ⚡ **Optimized data fetching** with TanStack Query

---

## 🛠 Setup & Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/ai-counseling-bot.git
cd ai-counseling-bot
```

2. **Install dependencies:**

```bash
npm install
```

3. **Setup environment variables** in `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

4. **Run database migrations:**

```bash
npx drizzle-kit push
```

5. **Start the development server:**

```bash
npm run dev
```

---

## 📸 Screenshots
1. **Login Page:**
![screenshot1](./public/screenshots/screenshot1.png)


2. **ChatUI:**
![screenshot2](./public/screenshots/screenshot2.png)


1. **ChatUI:Darkmode:**
![screenshot3](./public/screenshots/screenshot3.png)
---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork and open a PR.

---
