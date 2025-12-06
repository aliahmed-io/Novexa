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
- **Admin Email Broadcasting**: Tool for admins to send mass announcements to all users via Resend, with audience segmentation and image support.
- **Transactional Emails**: Automated order confirmation and delivery notification emails.
- **AI Image Generation**: Integrated **Pollinations.ai (Flux Model)** for free, unlimited, high-quality product image generation.
- **Dynamic Categories**: Admin system to create, edit, and delete product categories with sub-category support.
- **Admin Dashboard Flexibility**: Customizable columns and bulk updates (Status, Category, Price) for products.
- **Enhanced Email Selection**: Multi-select UI for targeting specific users in email broadcasts.
- **Customer Contact System**: Complete support ticket system with public form, admin dashboard, status workflow (Pending/Completed/Ignored), and real-time notifications.
- **Enhanced Admin Dashboard**: Improved product management with bulk actions, dynamic category filtering, and customizable table views.
- **Advanced Email Broadcasting**: Segmentation, image support, and multi-recipient selection for targeted marketing.
- **Performance Optimization**: Implemented caching for hero/products and optimized LCP images.
- **Custom Loading & 404 Pages**: Added branded 404 page and context-aware loading states (Spinner for landing, Skeletons for store/admin).

### Realistic Rating
- **Code Quality**: 8.5/10 (Modern practices, clean structure).
- **Completeness**: 7/10 (Payments, order management, email system, and filtering implemented. Shipping and advanced AI features pending).
- **Commercial Value**: Potential is high due to the premium 3D niche, but currently $0 revenue capability until payments are integrated.

_________________________________________________________________________________________________________________________________________________________________

## Section 2: Future State & Implementation Plan

This section outlines the path to a fully featured, high-value e-commerce platform.


### 1. Shipment Integration
- **Description**: Real-time shipping rates and label generation. and dont forget to make the order status automated based on the shipment status.
- **Implementation**: Integrate Shippo or EasyPost API. Connect to `Shipment` model.
- **Difficulty**: Medium/High (Complex logic with carriers).
- **Value**: High (Operational efficiency).
- **Price Impact**: +$500 value.


### 2. AI Dressing Room (Virtual Try-On)
- **Description**: User uploads photo + selects shoe -> AI generates image of them wearing it.
- **Implementation**: Use Replicate API (e.g., IDM-VTON or custom Flux LoRA). Store results in `TryOnSession`.
- **Difficulty**: **High** (AI model tuning, API costs, latency).
- **Value**: **Very High** (Unique selling point).
- **Price Impact**: +$2000+ value (if working flawlessly).



### section 3: business suggestions
1.  **Email Marketing**: Integrate **Resend** or **SendGrid** to send abandoned cart emails and order confirmations. This is the highest ROI activity you can add.
2.  **SEO & Metadata**: Ensure every product page has dynamic `metadata` (OpenGraph images, titles, descriptions) so links look good on social media.
3.  **Trust Signals**: Add a "Verified by Stripe" badge and more detailed return policies to the footer to increase conversion rates.


### Development Suggestions
1.  **Testing**: Implement **Playwright** for End-to-End (E2E) testing. Critical for payments and checkout flows to ensure they never break.
2.  **Accessibility**: Audit the site with **Lighthouse**. Ensure all buttons have `aria-labels` and colors have sufficient contrast.

### Section 4: Current Issues


### Section 5: Good Ideas for Future

### 1. Multi Language Support
- **Description**: Allow admins to create/edit languages via dashboard.
- **Implementation**: Build UI for `Language` model CRUD operations. Update `Product` form to select from dynamic languages.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.

### 2. Multi Currency Support
- **Description**: Allow admins to create/edit currencies via dashboard.
- **Implementation**: Build UI for `Currency` model CRUD operations. Update `Product` form to select from dynamic currencies.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.



