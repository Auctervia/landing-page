This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Booking

"Book a pilot" opens a booking dialog (ported from sciaxo-landing). Requests go to `POST /api/bookings`
(slot availability: `GET /api/availability`) and are stored in the `auctervia_bookings` table, which is
created on first use (`src/lib/db.ts`), then emailed to the team through Resend.

`.env.local` (not committed):

```
DATABASE_URL=postgres://...                  # Neon pooled connection string
RESEND_API_KEY=re_...                        # needs a verified auctervia.tech domain in Resend
RESEND_FROM="Auctervia <userform@auctervia.tech>"
BOOKING_NOTIFY_EMAIL=a@x.com,b@y.com         # comma-separated
```

Slots are weekdays, 10:00 to 14:00 and 16:00 to 19:00 IST, in 30-minute steps, up to 60 days ahead
(`src/lib/booking.ts`), shown in the visitor's own time zone.

## UI regression check

With the dev server on port 3000 and `playwright-cli` available:

```bash
playwright-cli open http://localhost:3000
playwright-cli run-code --filename=tests/polish.browser.js
playwright-cli run-code --filename=tests/gradient.browser.js
playwright-cli run-code --filename=tests/final.browser.js
playwright-cli run-code --filename=tests/brand-menu.browser.js
```

Checks five viewport widths in both themes and motion modes, including the centered-to-stats heading
transition, overflow, static 8px buttons, and removal of the WebGL background.
The gradient check covers word/number reveals, fading chart trails, permanent crate fills, static bento
cards/panels, dark-mode glow removal, and reduced motion.
The final check covers system/explicit theme persistence, live OS preference changes, initial reveal
opacity, hero cropping, desktop suite gutters, 36px buttons, enlarged agent labels and 404 copy.

The footer color-mode selector offers Light, System and Dark. New visits follow the system;
explicit choices are remembered. Alt/Option+D still toggles between explicit Light and Dark.
Public product context for assistants is available at `/agents.md`; repository `AGENTS.md` remains
developer guidance. The sitemap lists the homepage; metadata assets and API endpoints are not pages.

The header logo links to `/`; right-click either brand logo (or press Shift+F10 while focused) to copy
the full logo or logomark as SVG/PNG. SVGs contain outlined paths; PNGs are transparent at 3× size.
Copying requires a secure context and clipboard permission. Footer link columns, including legal links,
are temporarily retained under a hidden footer navigation; the color selector sits on the right.
