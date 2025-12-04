# Project Plan: Novexa (Nexus)

## Section 1: Current State Assessment

### Overview
Novexa is a modern, high-performance e-commerce application built with the latest web technologies. It features a premium design aesthetic with a focus on 3D product visualization and smooth user interactions. The project is currently in a **late-prototype / early-MVP (Minimum Viable Product)** stage. It has a solid foundation but requires key functional integrations (payments, shipping) to be commercially viable.

### Technology Stack
- **Framework**: Next.js 15 (App Router) & React 19
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Styling**: Tailwind CSS v4, Framer Motion (animations)
- **3D Graphics**: Three.js, React Three Fiber, @google/model-viewer
- **Authentication**: Kinde Auth
- **File Storage**: UploadThing
- **State Management**: Server Actions + React Hooks

### Pages & Structure
- **Landing Page**: A visually rich entry point with Hero, Features, Showcase, Testimonials, and Newsletter sections.
- **Storefront**:
    - **Home**: Featured products, categories.
    - **Product Page**: Detailed view with **3D interactive viewer**, price, description, and "Add to Bag".
    - **Shopping Bag**: Cart management (Redis-backed).
- **Admin Dashboard**:
    - **Products**: Create, edit, delete products.
    - **Banners**: Manage homepage banners.

### Key Features Implemented
- **3D Product Viewer**: "AntigravityViewer" allows users to rotate and inspect products in 3D.
- **Authentication**: Secure login/signup via Kinde.
- **Database Schema**: Robust schema supporting Users, Products, Orders, and recently added support for Payments, Shipments, and AI features.
- **Modern UI**: Glassmorphism effects, smooth transitions, and responsive layout.
- **3D Landing Page**: Interactive 3D hero section with `HatModel` using React Three Fiber.
- **Prisma Configuration**: Updated to support Prisma v6/v7 with `prisma.config.ts` and explicit client configuration.
- **AI Chatbot & Smart Search**: Implemented using Google Gemini for product ranking and `ShoeAssistant` for conversational UI.
- **Admin Analytics**: Dashboard with charts for revenue and recent sales.
- **Payment Integration**: Stripe Checkout (Sandbox) implemented with Webhooks for order processing.
- **AI Admin Dashboard**: Business advisor widget using Gemini to analyze sales data.
- **AI Image Generation**: Integrated into product creation form to generate product images.
- **Bulk Product Importer**: Upload CSV to create mass products. Implemented using `papaparse`.
- **AI Image Indexing (Visual Search)**: Automated tagging of product images (color, style, features) using Gemini Vision for accurate search results.
- **Enhanced Search & AI Assistant**: Fixed "colorblind" search issues with strict word matching and improved AI product recommendations.
- **Review System**: Full review system with star ratings, comments, and dynamic average rating calculation.
- **Review System Improvements**: Removed character limits, fixed auth redirects, and added a profanity filter.
- **Dynamic Auth Redirect**: Smart redirection returning users to their previous page after login/signup.
- **Discount System**: Comprehensive discount code management with percentage-based reductions and expiry dates.
- **Product-Specific Discounts**: Individual product discount management with UI indicators (crossed-out prices).
- **Bulk Product Edit**: Admin interface for mass updating product prices and statuses.
- **AI 3D Generation Pipeline**: Integrated Meshy API for generating 3D models from 2D images directly within the admin dashboard.

- **Admin Order Management**: Dashboard view for tracking and managing customer orders.
- **Revenue Analytics Fix**: Corrected dashboard revenue calculation to track only successful Stripe payments.

### Realistic Rating
- **Code Quality**: 8.5/10 (Modern practices, clean structure).
- **Completeness**: 4/10 (Missing payments, checkout, shipping, and user account management).
- **Commercial Value**: Potential is high due to the premium 3D niche, but currently $0 revenue capability until payments are integrated.

_________________________________________________________________________________________________________________________________________________________________

## Section 2: Future State & Implementation Plan

This section outlines the path to a fully featured, high-value e-commerce platform.



### 1. Dynamic Categories (Admin)
- **Description**: Allow admins to create/edit categories via dashboard.
- **Implementation**: Build UI for `Category` model CRUD operations. Update `Product` form to select from dynamic categories.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.

### 2. Shipment Integration
- **Description**: Real-time shipping rates and label generation.
- **Implementation**: Integrate Shippo or EasyPost API. Connect to `Shipment` model.
- **Difficulty**: Medium/High (Complex logic with carriers).
- **Value**: High (Operational efficiency).
- **Price Impact**: +$500 value.


### 3. AI Dressing Room (Virtual Try-On)
- **Description**: User uploads photo + selects shoe -> AI generates image of them wearing it.
- **Implementation**: Use Replicate API (e.g., IDM-VTON or custom Flux LoRA). Store results in `TryOnSession`.
- **Difficulty**: **High** (AI model tuning, API costs, latency).
- **Value**: **Very High** (Unique selling point).
- **Price Impact**: +$2000+ value (if working flawlessly).

### 4. User Order History
- **Description**: Page for users to view their past orders and status.
- **Implementation**: Create `/store/orders` page. Fetch orders by `userId`.
- **Difficulty**: Low.
- **Value**: High (User experience).
- **Price Impact**: +$100 value.

### 5. Admin Email Broadcasting
- **Description**: Admin tool to send mass emails (announcements, events, discounts) to all users.
- **Implementation**: Integrate Resend/SendGrid. Build admin compose UI. Background job for bulk sending.
- **Difficulty**: Medium.
- **Value**: High (Marketing & Engagement).
- **Price Impact**: +$300 value.
### Business Suggestions
1.  **Email Marketing**: Integrate **Resend** or **SendGrid** to send abandoned cart emails and order confirmations. This is the highest ROI activity you can add.
2.  **SEO & Metadata**: Ensure every product page has dynamic `metadata` (OpenGraph images, titles, descriptions) so links look good on social media.
3.  **Trust Signals**: Add a "Verified by Stripe" badge and more detailed return policies to the footer to increase conversion rates.

### 6. filter and sort functionss in the catrgory:






### Development Suggestions
1.  **Testing**: Implement **Playwright** for End-to-End (E2E) testing. Critical for payments and checkout flows to ensure they never break.
2.  **Rate Limiting**: Use **Upstash Ratelimit** on your AI routes (`/api/search`, `/api/assistant`) to prevent abuse and control costs.
3.  **Image Optimization**: Ensure all user-uploaded images (UploadThing) are automatically resized and compressed. Large images are the #1 cause of slow sites.
4.  **Accessibility**: Audit the site with **Lighthouse**. Ensure all buttons have `aria-labels` and colors have sufficient contrast.


section 4: proplems.
1. all product ratings is 5 stars and unchangeable 
2. admin dashboard does not take the actual money,it takes the checkout price even if the user just didnt buy in stripe and left.
3. i want to make it easier for admin to edit multiple products at once.
4, show that there was a discount on the product card.