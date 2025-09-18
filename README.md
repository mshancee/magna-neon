# Magna Coders

```
I'm Gonna write a description here. 👊
```

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router and React Server Components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Database**: [Neon Postgres](https://neon.tech/) (serverless Postgres)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Auth.js](https://authjs.dev/) (NextAuth v5) with Credentials provider and JWT sessions
- **Security**: [Arcjet](https://arcjet.io/) for bot detection and rate limiting
- **IP Geolocation**: [IPInfo](https://ipinfo.io/) for country detection during signup
- **Password Security**: [bcryptjs](https://www.npmjs.com/package/bcryptjs) for password hashing
- **Validation**: [Zod](https://zod.dev/) for form and API validation

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn
- A PostgreSQL database (Neon recommended and used for this project) for `DATABASE_URL`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   # or on Windows
   copy .env.example .env
   ```

2. Edit the `.env` file with your credentials (see [.env.example](.env.example) for details):
   - `DATABASE_URL` - Postgres connection URL for Neon
   - `AUTH_SECRET` - Secret for Auth.js sessions (generate with `npx auth secret`)
   - `ARCJET_KEY` - API key for Arcjet protection
   - `IPINFO_TOKEN` - Token for IP geolocation

> **Note:** Both `.env` and `.env.local` are required because Drizzle’s migration tooling does not fully support `.env.local` on its own.

### Database Setup

This project uses Drizzle ORM with Neon Postgres. After installing dependencies and setting up your environment, you can run these commands:

1. **Generate migrations** - Creates SQL migration files based on your schema changes:

   ```bash
   npx drizzle-kit generate
   ```

2. **Apply migrations** - Runs the migration files against your database to update the schema:

   ```bash
   npx drizzle-kit migrate
   ```

3. **Drizzle Studio** - Starts a local web interface to browse your database:
   ```bash
   npx drizzle-kit studio
   ```

### Running the Application

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Key Features

- User authentication with email/password
- Country detection during signup using IP geolocation
- Rate limiting and bot protection with Arcjet
- Responsive UI components with shadcn/ui
- Server actions for secure data handling
- PostgreSQL database with Drizzle ORM

## Learn More

For detailed instructions on environment variables, check the [.env.example](.env.example) file.

To understand the database schema, see the [drizzle/schema](drizzle/schema) directory.

For security configuration, review [lib/security/arcjet.ts](lib/security/arcjet.ts).
