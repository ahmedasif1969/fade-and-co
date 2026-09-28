# Fade & Co. Barbershop Booking Platform

A bespoke, luxury online booking web application and admin management dashboard for **Fade & Co.** (47 King Street, Manchester, UK).

---

## 💈 Features

- **Luxury Customer Booking Flow (`/`)**:
  - **Step 1: Pick a Service**: Real-time service catalog with durations and prices in GBP (£).
  - **Step 2: Pick a Barber**: Master barbers (Marcus, Jay, Tariq) with photo previews + *Any Available* option.
  - **Step 3: Interactive Calendar & Slot Engine**: Real-time slot availability respecting working hours, buffer times between appointments (10m default), minimum advance booking (1h default), maximum advance window (30d default), and blocked slots.
  - **Step 4: Customer Details**: Form validation for contact info & optional styling notes.
  - **Step 5: Booking Review & Instant Confirmation**: Summary breakdown with direct submission.
  - **Step 6: Success Page (`/book/success`)**: 1-Click *Add to Google Calendar* and `.ics` download.

- **Admin Management Portal (`/admin`)**:
  - **Dashboard (`/admin/dashboard`)**: Today's and upcoming appointments with quick status toggles (Completed, No-show, Cancel).
  - **Booking Details (`/admin/bookings/[id]`)**: Full customer history and cancellation flow with automatic customer notification email.
  - **Calendar View (`/admin/calendar`)**: Weekly interactive schedule filterable by staff member.
  - **Manual Booking (`/admin/bookings/new`)**: Direct walk-in and phone booking entry.
  - **Staff Management (`/admin/staff`)**: Full CRUD for barbers, photo URLs, daily opening hours, and active/deactivate toggles.
  - **Services Management (`/admin/services`)**: Full CRUD for treatments, pricing, duration, and active/deactivate toggles.
  - **Block Time Off (`/admin/availability`)**: Block specific barbers or entire shop for holidays, breaks, or maintenance.
  - **Booking Rules & Shop Settings (`/admin/settings`)**: Dynamic buffer time, min/max advance booking rules, auto-confirm toggle, and notification email.

- **Transactional Emails via Resend**:
  1. **Customer Confirmation Email**: Sent immediately upon booking with attached `.ics` calendar invite.
  2. **Customer 24h Reminder Email**: Sent automatically 24 hours prior via hourly cron job.
  3. **Owner Notification Email**: Delivered to `hello@fadeandco.com` with customer phone & booking details.
  4. **Cancellation Notice**: Sent to customer when an appointment is cancelled by the admin.

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the customer booking page.
Admin login is available at [http://localhost:3000/admin](http://localhost:3000/admin):
- **Email:** `hello@fadeandco.com`
- **Password:** `FadeAndCo2026!` (or value configured in `ADMIN_PASSWORD`)

> **Note**: The application has an embedded in-memory database mock initialized with all seed data (Marcus, Jay, Tariq, services, settings), allowing you to immediately explore and test all booking and admin features locally without needing a live Supabase project!

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a new project in [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` and run the script to create tables, constraints, indexes, and the atomic booking stored procedure `create_booking_safe`.
4. Open `supabase/seed.sql` and run it to pre-populate:
   - Marcus (Mon–Sat 9am–6pm, Sun closed)
   - Jay (Tue–Sun 10am–7pm, Mon closed)
   - Tariq (Wed–Sun 11am–8pm, Mon/Tue closed)
   - All 6 default services & pricing
   - Default booking settings (10m buffer, 1h min advance, 30d max advance, auto-confirm)
5. Copy your Project URL, Anon Key, and Service Role Key from **Project Settings > API** into your `.env.local` or production environment variables.

---

## 📧 Resend Email Setup

1. Sign up at [Resend](https://resend.com) and generate an API key.
2. Verify your sending domain (e.g. `fadeandco.com`) or use onboarding domain for testing.
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env.local`.

---

## ⏰ Automated 24h Reminder Cron Job

The project includes `vercel.json` configuring an hourly cron job pointing to `/api/cron/reminders`.
- The endpoint queries confirmed bookings starting in the next 24–25 hour window and dispatches reminder emails.
- To secure this in production, define `CRON_SECRET` in your environment variables.

---

## 🚢 Deploying to Vercel

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables from `.env.example`.
4. Deploy!
