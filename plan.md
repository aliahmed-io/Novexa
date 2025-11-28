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

### Realistic Rating
- **Code Quality**: 8.5/10 (Modern practices, clean structure).
- **Completeness**: 4/10 (Missing payments, checkout, shipping, and user account management).
- **Commercial Value**: Potential is high due to the premium 3D niche, but currently $0 revenue capability until payments are integrated.

_________________________________________________________________________________________________________________________________________________________________

## Section 2: Future State & Implementation Plan

This section outlines the path to a fully featured, high-value e-commerce platform.

### 1. Payment Integration
- **Description**: A working checkout page accepting credit cards/Apple Pay.
- **Implementation**: Integrate Stripe or Lemon Squeezy. Use the new `Payment` model.
- **Difficulty**: Medium (Standard integration).
- **Value**: **Critical**. The site cannot function without it.
- **Price Impact**: +$500-$1000 value.

### 2. Dynamic Categories (Admin)
- **Description**: Allow admins to create/edit categories via dashboard.
- **Implementation**: Build UI for `Category` model CRUD operations. Update `Product` form to select from dynamic categories.
- **Difficulty**: Low (Standard CRUD).
- **Value**: High (Flexibility).
- **Price Impact**: +$200 value.

### 3. Shipment Integration
- **Description**: Real-time shipping rates and label generation.
- **Implementation**: Integrate Shippo or EasyPost API. Connect to `Shipment` model.
- **Difficulty**: Medium/High (Complex logic with carriers).
- **Value**: High (Operational efficiency).
- **Price Impact**: +$500 value.

### 4. 3D Landing Page
- **Description**: An immersive 3D experience on the landing page (e.g., floating shoes, scroll-triggered animations).
- **Implementation**: Use React Three Fiber (Canvas) in the Hero section.
- **Difficulty**: Medium (Requires design skills).
- **Value**: High (Marketing/Wow factor).
- **Price Impact**: +$300 value.

### 5. AI Chatbot & Smart Search
- **Description**: Assistant to answer queries and semantic search for products.
- **Implementation**: Vercel AI SDK + OpenAI/Gemini. Vector database (pgvector on Neon) for product embeddings.
- **Difficulty**: Medium.
- **Value**: Medium/High (User experience).
- **Price Impact**: +$400 value.

### 6. AI Dressing Room (Virtual Try-On)
- **Description**: User uploads photo + selects shoe -> AI generates image of them wearing it.
- **Implementation**: Use Replicate API (e.g., IDM-VTON or custom Flux LoRA). Store results in `TryOnSession`.
- **Difficulty**: **High** (AI model tuning, API costs, latency).
- **Value**: **Very High** (Unique selling point).
- **Price Impact**: +$2000+ value (if working flawlessly).

### 7. AI Admin Dashboard (Suggestions)
- **Description**: Dashboard widget giving business advice based on sales data.
- **Implementation**: Feed `DailyStat` and `Order` data to an LLM (Gemini/GPT-4) to generate insights.
- **Difficulty**: Medium.
- **Value**: Medium (Nice to have).
- **Price Impact**: +$200 value.

### 8. Admin Analytics
- **Description**: Charts for visitors, sales, orders.
- **Implementation**: Recharts library. Aggregation queries on `Order` and `User` tables.
- **Difficulty**: Low/Medium.
- **Value**: High (Essential for admins).
- **Price Impact**: +$300 value.

### 9. AI Image Generation (Admin Assets)
- **Description**: Generate professional product photos from basic inputs.
- **Implementation**: Integrate Midjourney or Flux API into the product creation form.
- **Difficulty**: Medium.
- **Value**: High (Saves photography costs).
- **Price Impact**: +$400 value.

### 10. Discount System
- **Description**: Coupon codes for checkout.
- **Implementation**: UI for `Discount` model. Logic in checkout to validate and apply percentage off.
- **Difficulty**: Low.
- **Value**: Medium (Marketing tool).
- **Price Impact**: +$150 value.

### 11. Bulk Product Importer
- **Description**: Upload CSV to create mass products.
- **Implementation**: `papaparse` library to read CSV. Batch create in Prisma.
- **Difficulty**: Medium (Validation logic is tricky).
- **Value**: High (For large stores).
- **Price Impact**: +$300 value.

### 12. Review System
- **Description**: Star ratings and comments on products.
- **Implementation**: New `Review` model. UI on product page.
- **Difficulty**: Low.
- **Value**: Medium (Social proof).
- **Price Impact**: +$200 value.

---

## Section 3: Suggestions & Recommendations

### Business Suggestions
1.  **Niche Down**: The "3D/AI" angle is your competitive advantage. Focus heavily on the "Virtual Try-On" and "3D Viewer" as your primary marketing hooks. General e-commerce stores are common; immersive ones are rare.
2.  **SaaS Potential**: Consider selling the *platform itself* (the 3D viewer + AI try-on tech) to other shoe brands, rather than just selling shoes. This could be a B2B SaaS pivot.
3.  **Pre-Orders**: Use the 3D models to sell "digital-first" or pre-order items before manufacturing them, reducing inventory risk.

### Development Suggestions
1.  **Prioritize Payments**: Stop building new features until you can accept money. This is the difference between a hobby project and a business.
2.  **Optimize 3D Assets**: Ensure all 3D models are GLB compressed (Draco compression) to keep load times low. Heavy models kill conversion rates.
3.  **Mobile First**: 70%+ of e-commerce traffic is mobile. Ensure the 3D viewer and AI try-on work perfectly on phones.
4.  **Security**: With payments and user data, ensure you have proper RLS (Row Level Security) or logic checks in your server actions (you are already doing this with Kinde, keep it up).
