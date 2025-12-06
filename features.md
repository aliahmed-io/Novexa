# Novexa – Feature Overview

Novexa is a modern, AI‑enhanced e‑commerce application built with Next.js 15 and a full admin dashboard. It delivers a complete buyer journey (from landing page to fulfilled order), with 3D product experiences and AI features already wired to real services.

This document is a **feature overview for potential buyers** and lists only what is currently implemented, assuming the required API keys and environment variables are provided.

---

## 1. Storefront & Shopping Experience

- **Landing & brand experience**
  - Visually rich landing page with premium design and animated hero section.
  - Clear navigation into the store and product catalog.

- **Product catalog**
  - Responsive product grid showing images, price, discounts, and key attributes.
  - Filtering by price, color, main category (Men/Women/Kids), and sub‑category via dropdown.
  - Sorting by price, popularity (review count), and newest arrivals.
  - Standard keyword search plus AI‑powered search (see section 5).

- **Product detail pages**
  - High‑resolution image gallery and optional 3D viewer per product.
  - Price with discount support and crossed‑out original price when on sale.
  - Detailed description, tags, and feature bullets.
  - Customer reviews with rating summary and review submission form, including bad‑language filtering on comments.

- **Cart / “Bag”**
  - Redis‑backed cart per user/session.
  - Add‑to‑bag from product pages.
  - Support for discount codes that affect order totals.

---

## 2. Checkout, Payments & Shipping

- **Authenticated checkout**
  - Login/signup via Kinde.
  - Only authenticated users can proceed to checkout and place orders.
  - Optional newsletter opt-in checkbox during checkout to join the marketing list.

- **Shipping address capture**
  - Dedicated `/store/checkout` page that collects:
    - Name, phone, street, city, state, postal code, country.
  - Shipping details are stored as a snapshot on each `Order` record.

- **Real‑time shipping rates**
  - Live rate calculation via Shippo using the entered shipping address.
  - Customer sees multiple options (e.g. cheapest/fastest) and must select one.
  - Selected service level and price are saved on the order.

- **Stripe payments**
  - Stripe Checkout Sessions for secure card payments.
  - Cart items and shipping charge are passed as line items.
  - Stripe webhooks create/update `Payment` entries and finalize order status.

- **Orders & shipping status**
  - `Order`, `Payment`, and `Shipment` models wired end‑to‑end.
  - Admin can fetch shipping rates and purchase labels via Shippo from the dashboard.
  - Shippo webhooks update `Shipment` and `Order` statuses (e.g. shipped, delivered).

---

## 3. Customer Account & Self‑Service

- **Account area**
  - `/store/account` page with “Profile” and “Addresses” tabs.
  - Profile tab shows Kinde‑provided name, email, and avatar.

- **Address book**
  - Add, validate, and delete addresses stored in the `Address` model.
  - First saved address is used to pre‑fill the checkout shipping form when available.

- **Wishlist**
  - Per‑user wishlist backed by the `WishlistItem` model.
  - Heart icon on product cards and product pages to add/remove items.
  - `/store/wishlist` page listing saved products.

- **Orders & returns**
  - `/store/orders` lists past orders with status and total.
  - `/store/orders/[id]` shows:
    - Items, quantities, and order total.
    - Shipping address snapshot and chosen shipping service level.
    - Tracking information when a label has been purchased.
  - “Request Return” button for delivered orders opens a return form.
  - Return requests are stored in `ReturnRequest` and managed by admins.

- **Support & contact**
  - Public contact form for pre‑ and post‑sale questions.
  - Messages stored as `Contact` records and managed from the admin “contact center”.
  - Smart priority ordering in the inbox: **Pending** messages are shown first, then **Completed**, then **Ignored**.
  - Unread messages highlighted, with quick status actions (Pending / Completed / Ignored) and a bulk “mark all as read” control.

---

## 4. Admin Dashboard

- **Product & catalog management**
  - Create, edit, and archive products with:
    - Images, pricing, status, categories (sub‑categories), tags, and 3D model URL fields.
  - Category management:
    - Dedicated Categories page to create, edit, and delete sub‑categories as needed (with a guard to protect the default/general category).
    - Categories are used as sub‑categories beneath main segments (Men/Women/Kids) and power storefront filtering.
  - Banner management for landing/homepage hero content.
  - Advanced product table:
    - Toggle column visibility (image, name, status, price, date).
    - Bulk product operations from the admin table (multi‑select update/delete).
    - Bulk status updates, bulk main/sub‑category assignment, and bulk percentage price adjustments.
  - One‑click CSV export of all products (including tags, features, categories, and 3D fields).
  - CSV import tooling with:
    - Downloadable template.
    - File upload or paste‑in CSV text.
    - Preview of parsed rows before import.
    - Automatic category creation and safe mapping of main category values.

- **Orders & fulfillment**
  - Orders table showing status, amount, and customer info.
  - Integrated flow to fetch shipping rates and purchase labels via Shippo.
  - Shipment details (carrier, tracking number, label URL, ETA) stored in `Shipment`.

- **Returns management**
  - `/store/dashboard/returns` page to review `ReturnRequest` entries.
  - Approve/reject actions for pending requests.

- **Email marketing & newsletter**
  - Newsletter subscription system backed by a `NewsletterSubscriber` model linked to `User`.
  - Multiple opt-in points:
    - Newsletter signup section on the landing page.
    - Footer newsletter form on storefront pages.
    - Optional marketing opt-in checkbox during checkout.
  - Broadcast email tools using Resend from the admin dashboard, with:
    - Audience selection: all users, newsletter subscribers, or specific recipients.
    - Searchable multi‑select recipient picker with chips.
    - Optional uploaded banner image per campaign.
  - Every broadcast email includes a one-click unsubscribe link taking users to a public `/newsletter/unsubscribe` page that updates their subscription status.
  - Transactional emails:
    - Order confirmation email after successful Stripe payment.
    - Delivery email template ready to hook into shipping/delivery events.

- **System health & analytics**
  - Admin analytics dashboard with:
    - Revenue charts based on successful payments.
    - Recent orders/sales list.
    - Basic KPIs (e.g. total revenue, order counts).
  - Integration health widget on the main dashboard showing the status of key services (Database, Stripe, Shippo, Resend, Gemini) as healthy, misconfigured, or unhealthy, with simple explanations.

---

## 5. AI & 3D Features

- **AI shopping assistant**
  - Chat‑style assistant (“ShoeAssistant”) that answers product questions.
  - Backed by Google Gemini, using live product data for recommendations.

- **AI‑powered search & ranking**
  - AI search endpoint that re‑ranks products based on a natural language query.
  - Falls back gracefully if AI is unavailable.

- **AI image generation**
  - Integration with Pollinations/Flux to generate high‑quality product imagery from prompts.
  - Generated images can be attached to products from the admin UI.

- **AI vision‑based product tagging**
  - Gemini Vision looks at product images and auto‑suggests color, style, height, pattern, tags, and feature lists.
  - Suggestions are stored back on the `Product` record to speed up catalog creation.

- **3D product experiences**
  - 3D product viewer on product pages using Three.js/React Three Fiber.
  - Per‑product 3D models exposed via the `modelUrl` field.
  - Admin tools to trigger 3D model generation via Meshy AI and feed results into the viewer.

---

## 6. Architecture & Tech Stack

- **Framework & language**
  - Next.js 15 (App Router) with React 19.
  - TypeScript across the stack.

- **Data & storage**
  - PostgreSQL (Neon) with Prisma ORM.
  - Redis (Upstash) for carts and session‑like data.
  - UploadThing for product and media uploads.

- **Auth & payments**
  - Kinde for authentication and user identity.
  - Stripe for payments and checkout.

- **Styling & UI**
  - Tailwind CSS and a modern component library for consistent UI.
  - Branded global 404 page for unknown routes.
  - Route‑specific loading states (Next.js `loading.tsx`) for store, product grid, product detail, and dashboard views, so users see skeletons/spinners while data loads.

- **AI & external services**
  - Google Gemini for AI assistant and AI search.
  - Pollinations / Flux for image generation.
  - Meshy for 3D model generation.
  - Shippo for shipping rates, labels, and tracking.
  - Resend for transactional and marketing emails.

---

## 7. Reliability & Testing

- **Error tracking**
  - Sentry is integrated for client, server, and edge runtimes, capturing errors and performance traces when DSN environment variables are configured.

- **Health checks**
  - `/api/health` endpoint pings the database and returns a simple JSON status, used by admin smoke tests to verify core connectivity.

- **End-to-end tests (Playwright)**
  - Storefront smoke tests covering the landing page, navigation into the shop, and product detail views.
  - Customer flow test that adds a product to the bag and proceeds to checkout (including the authentication redirect when not logged in).
  - Admin/dashboard access control tests ensuring unauthenticated users are redirected away from protected routes and that the health endpoint responds as expected.

- **Unit tests (Vitest)**
  - Tests for currency formatting logic.
  - Cart total and discount calculations via a dedicated `calculateCartTotal` helper.
  - AI search `filterProducts` helper, including multi‑word queries and no‑match fallback behaviour.

---

This overview is designed for buyers evaluating Novexa as a starting point for a real e‑commerce business. All features listed above are implemented and live in the codebase today, subject to correct configuration of external services.
