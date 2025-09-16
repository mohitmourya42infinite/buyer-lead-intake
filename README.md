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

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` - Your database connection string
   - `NEXTAUTH_SECRET` - A random secret for authentication
   - `NEXTAUTH_URL` - Your app's URL
   - `NEXT_PUBLIC_BASE_URL` - Your app's public URL

4. Deploy!

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## License

MIT