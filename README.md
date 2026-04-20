# Article — Personal Publishing Platform

A Medium-style personal blog built with Next.js 14, TypeScript, TailwindCSS, TipTap, Prisma, Supabase, and NextAuth.js.

## Stack

- **Next.js 14** (App Router, Server Components)
- **TypeScript**
- **TailwindCSS** + `@tailwindcss/typography`
- **TipTap** rich text editor
- **Prisma ORM** + **Supabase** (PostgreSQL)
- **NextAuth.js** — GitHub OAuth, admin-only
- **Cloudflare R2** — image uploads via AWS S3-compatible SDK
- **Vercel** — deployment target

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Akanksha-Nakati/Article.git
cd Article
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and fill in every value:

```bash
cp .env.local.example .env.local
```

### 3. Push the database schema

```bash
npx prisma db push
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (public)/           → Homepage feed + article reader (server components)
  (admin)/            → Dashboard + TipTap editor (client components, auth-protected)
  api/                → REST API routes
components/
  editor/             → TipTapEditor, EditorToolbar
  reader/             → ArticleCard, ArticleBody
  ui/                 → Button, TagPill
lib/                  → db, auth, storage, utils
prisma/               → schema.prisma
middleware.ts         → Route protection
```

## Environment Variables

See `.env.local.example` for all required keys and their descriptions.

## License

MIT
