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

- **Admin Order Management**: Dashboard view for tracking and managing customer orders.
- **Revenue Analytics Fix**: Corrected dashboard revenue calculation to track only successful Stripe payments.
- **User Order History**: Page for users to view their past orders and status.
- **Filter and Sort Functions**: Product filtering by price/color and sorting by price/popularity/newness.
- **Admin Email Broadcasting**: Tool for admins to send mass announcements to all users via Resend.
- **Transactional Emails**: Automated order confirmation and delivery notification emails.
- **AI Image Generation**: Integrated **Pollinations.ai (Flux Model)** for free, unlimited, high-quality product image generation.

### Realistic Rating
- **Code Quality**: 8.5/10 (Modern practices, clean structure).
- **Completeness**: 7/10 (Payments, order management, email system, and filtering implemented. Shipping and advanced AI features pending).
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


### 4. 404 and loading custom pages
- **Implementation**: Build UI for `404` and `loading` pages CRUD operations.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.


### 5.multi language support 
- **Description**: Allow admins to create/edit languages via dashboard.
- **Implementation**: Build UI for `Language` model CRUD operations. Update `Product` form to select from dynamic languages.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.


### 6.multi currency support 
- **Description**: Allow admins to create/edit currencies via dashboard.
- **Implementation**: Build UI for `Currency` model CRUD operations. Update `Product` form to select from dynamic currencies.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.

### Business Suggestions
1.  **Email Marketing**: Integrate **Resend** or **SendGrid** to send abandoned cart emails and order confirmations. This is the highest ROI activity you can add.
2.  **SEO & Metadata**: Ensure every product page has dynamic `metadata` (OpenGraph images, titles, descriptions) so links look good on social media.
3.  **Trust Signals**: Add a "Verified by Stripe" badge and more detailed return policies to the footer to increase conversion rates.


### Development Suggestions
1.  **Testing**: Implement **Playwright** for End-to-End (E2E) testing. Critical for payments and checkout flows to ensure they never break.
2.  **Rate Limiting**: Use **Upstash Ratelimit** on your AI routes (`/api/search`, `/api/assistant`) to prevent abuse and control costs.
3.  **Image Optimization**: Ensure all user-uploaded images (UploadThing) are automatically resized and compressed. Large images are the #1 cause of slow sites.
4.  **Accessibility**: Audit the site with **Lighthouse**. Ensure all buttons have `aria-labels` and colors have sufficient contrast.


### Section 4: Current Issues
