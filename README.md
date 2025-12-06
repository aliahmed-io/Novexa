
# Novexa - Premium AI-Powered E-commerce

Novexa is a modern, high-performance e-commerce platform built with Next.js 15, specialized for premium headwear and footwear. It features cutting-edge AI integrations for a personalized shopping experience.

## Features

- **Storefront**: Responsive, high-performance UI/UX with smooth animations.
- **Admin Dashboard**: Comprehensive management for products, orders, categories, and banners.
- **Secure Authentication**: Powered by Kinde Auth.
- **Payments**: Stripe integration for secure checkout.
- **Shipping**: Real-time shipping rates and label generation via Shippo.
- **AI Integrations**:
    - **AI Assistant**: Intelligent chatbot for product recommendations (Gemini 2.5 Flash).
    - **Vision Tagging**: Auto-generate product tags and attributes from images.
    - **3D Models**: Generate 3D product models from 2D images using Meshy AI.
- **Observability**: Integration health dashboard and audit logging.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Kinde Auth
- **Payments**: Stripe
- **Shipping**: Shippo
- **AI**: Google Gemini, Meshy
- **Monitoring**: Sentry (Configured), Custom Health Checks
- **Testing**: Playwright (E2E)

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Setup Environment Variables**: Copy `.env.example` to `.env` and fill in API keys.
4.  **Run Development Server**: `npm run dev`
5.  **Run Tests**: `npm run test:e2e`

## Deployment

Deployable to Vercel with zero configuration. Ensure all environment variables are set in the Vercel dashboard.
