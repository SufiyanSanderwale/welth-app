# Full Stack AI Fianace Platform with Next JS, Supabase, Tailwind, Prisma, Inngest, ArcJet, Shadcn UI Tutorial 🔥🔥
## https://youtu.be/egS6fnZAdzk

<img width="1470" alt="Screenshot 2024-12-10 at 9 45 45 AM" src="https://github.com/user-attachments/assets/1bc50b85-b421-4122-8ba4-ae68b2b61432">

### Make sure to create a `.env` file with following variables -

```
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

GEMINI_API_KEY=

RESEND_API_KEY=

ARCJET_KEY=
```

## Free Market Data & Widgets

This project now includes free upgrades you can enable without paid plans:

- Quotes proxy API using Financial Modeling Prep (free tier)
  - Sign up: https://site.financialmodelingprep.com/developer
  - Add to `.env.local`:
    
    ```bash
    FMP_API_KEY=your_key_here
    ```
  - Test locally:
    
    ```
    http://localhost:3000/api/market/quote?symbols=AAPL,MSFT,GOOGL
    ```

- TradingView Economic Calendar (free embed)
  - Docs: https://www.tradingview.com/widgets/economic-calendar/
  - Implemented in `app/(main)/dashboard/_components/economic-calendar.jsx`.

## New Dashboard Sections

- `Monthly-Budget Surplus Suggestions` in `app/(main)/dashboard/_components/surplus-suggestions.jsx`
- `Watchlist` in `app/(main)/dashboard/_components/watchlist.jsx`
- Wired in `app/(main)/dashboard/page.jsx`

### Local Setup (Supabase)

1. Create a file named `.env.local` in the project root. Use the keys below (copy from `README` or create your own template):

```
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

GEMINI_API_KEY=
RESEND_API_KEY=
ARCJET_KEY=
FMP_API_KEY=
```

- In Supabase Dashboard → Project settings → Database → Connection string → URI, copy the Postgres URL into `DATABASE_URL` and `DIRECT_URL`.

2. Install deps and generate Prisma client:

```bash
npm install
npm run postinstall
```

3. Push the schema to Supabase (runs against `DATABASE_URL`):

```bash
npx prisma db push
```

4. Run the dev server:

```bash
npm run dev
```

5. Optional seed: after you have created a user/account in the UI, you can hit `http://localhost:3000/api/seed` to generate demo transactions (update the placeholder IDs in `actions/seed.js` first).

