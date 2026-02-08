# Highline Cars Pre-Purchase Inspection App

Brutalist Next.js PWA-ready web app for vehicle inspections. Built with Next.js App Router, Tailwind, shadcn-style components, and Supabase.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Set env vars (create `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
REPORT_BASE_URL=http://localhost:3000
```

3. Ensure a Supabase Storage bucket named `inspection-media` exists (public or with appropriate policies).

4. Install Playwright browsers for PDF generation:

```bash
npx playwright install
```

5. Seed demo data (optional):

```bash
npm run seed
```

6. Run dev server:

```bash
npm run dev
```

## Notes
- SQL schema: `src/db/schema.sql`
- PDF generation: `GET /api/reports/:id/pdf?type=a|b&token=...`
- Reports: `/report-a/:id` and `/report-b/:id`
- Share links: `/r/:token`
