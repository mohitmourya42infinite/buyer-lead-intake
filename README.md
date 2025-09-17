# Buyer Lead Intake App

A Next.js application for capturing, managing, and tracking buyer leads with CSV import/export functionality.

## Features

- **Lead Management**: Create, view, edit, and track buyer leads
- **Search & Filter**: Find leads by name, phone, email, city, property type, status, and timeline
- **CSV Import/Export**: Bulk import leads from CSV files and export filtered results
- **Authentication**: Simple demo login system
- **Real-time Updates**: Track changes with history logging
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mohitmourya42infinite/buyer-lead-intake.git
cd buyer-lead-intake
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `GET /api/buyers` - List buyers with pagination and filtering
- `POST /api/buyers` - Create a new buyer lead
- `GET /api/buyers/[id]` - Get buyer details and history
- `PUT /api/buyers/[id]` - Update buyer information
- `GET /api/buyers/export` - Export buyers as CSV
- `POST /api/buyers/import` - Import buyers from CSV

## Deployment

### Vercel

1. **Set up a PostgreSQL database** (required for production):
   - **Vercel Postgres** (recommended): Go to your Vercel dashboard → Storage → Create Database → Postgres
   - **Supabase**: Create a new project at [supabase.com](https://supabase.com)
   - **Railway**: Create a PostgreSQL database at [railway.app](https://railway.app)
   - **Neon**: Create a database at [neon.tech](https://neon.tech)

2. **Connect your repository to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Set environment variables in Vercel dashboard**:
   - `DATABASE_URL` - Your PostgreSQL connection string (e.g., `postgresql://user:password@host:5432/dbname`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your app's URL (e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_BASE_URL` - Your app's public URL (e.g., `https://your-app.vercel.app`)

4. **Deploy!** Vercel will automatically:
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Build and deploy your app

### Environment Variables

**Required for production:**
```bash
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
```

**Example PostgreSQL URLs:**
- Vercel Postgres: `postgres://default:password@ep-xxx.us-east-1.postgres.vercel-storage.com/verceldb`
- Supabase: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
- Railway: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## License

MIT# Auto-deployment test
