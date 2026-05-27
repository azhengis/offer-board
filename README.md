# Offer Board

A web app for posting and tracking job offers, built with Next.js and Supabase.

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** for auth and database
- **Resend** for transactional email
- **Tailwind CSS**
- **TypeScript**

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account (for email)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/azhengis/offer-board.git
cd offer-board
npm install
```

2. Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Apply the database migrations:

```bash
supabase db push
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/          # App source code (Next.js App Router)
supabase/
  migrations/ # Database schema migrations
```
