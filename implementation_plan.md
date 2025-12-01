# PulseKart UI/UX Overhaul Plan

## Goal
Transform the PulseKart landing page into a premium, high-trust, and interactive experience, addressing the 10-point improvement list provided by the user.

## Phase 1: Hero & Header (First Impression)
- [ ] **Navbar Upgrades** (`components/layout/Navbar.tsx`)
    - [ ] Implement "Smart Search" UI (mock auto-suggestions, voice icon).
    - [ ] Add scroll listener for "shrink/lock" behavior.
    - [ ] Add "Mini-Offers Strip" / Instant Delivery Banner at the top.
- [ ] **Hero Section** (`app/page.tsx`)
    - [ ] Add micro-animations (floating image, pulsing buttons) using `framer-motion`.
    - [ ] Enhance typography with "Powered by..." micro-line.
    - [ ] Add Trust Badges (NABL, Encryption, AI).
    - [ ] Implement "Instant Delivery" banner (if not in Navbar).

## Phase 2: Categories & Discovery
- [ ] **Category Section** (`app/page.tsx`)
    - [ ] Redesign category cards (hover scale, float, glow).
    - [ ] Add short descriptions to categories.
    - [ ] Add "View All" micro-link.
    - [ ] Implement mobile carousel behavior (horizontal scroll).
- [ ] **Health Goals Section** (`app/page.tsx`)
    - [ ] Create new "Shop by Health Goal" section (Diabetes, Immunity, etc.).

## Phase 3: Product Experience
- [ ] **Product Cards** (`components/ui/ProductCard.tsx`)
    - [ ] Add badges (Bestseller, Pharmacist Rec, Express).
    - [ ] Implement hover effects (shadow lift, tilt, button glow).
    - [ ] **Concept**: Quick-view popup trigger (UI only).
- [ ] **Featured Section** (`app/page.tsx`)
    - [ ] Apply new card styles to the Featured Products grid.

## Phase 4: Trust & Social Proof
- [ ] **USPs** (`app/page.tsx`)
    - [ ] Add animated micro-icons.
    - [ ] Add explanatory sub-text.
    - [ ] Add "AI-Enhanced Consultation" USP.
- [ ] **Reviews** (`app/page.tsx`)
    - [ ] Add customer photos and location tags.
    - [ ] Implement carousel behavior (auto-slide + swipe).
    - [ ] Improve visual contrast and "breathing glow" on active card.

## Phase 5: Footer & Global Polish
- [ ] **Footer** (`components/layout/Footer.tsx`)
    - [ ] Add micro-icons to links.
    - [ ] Add WhatsApp floating button.
    - [ ] Add App Download badges.
- [ ] **Global Behaviors**
    - [ ] Smooth page transitions.
    - [ ] Scroll animations (fade-in sections).
    - [ ] Skeleton loaders for grids.
    - [ ] "Back to top" button logic.

## Phase 6: Additional Features
    - [ ] Add "Reorder" button.
    - [ ] Hover tooltip for timeline.
    - [ ] Slide-in details panel.
- [ ] **Mobile Behavior**
    - [ ] Bottom tabs for mobile (Home | Orders | Wallet | Chat).
    - [ ] Vertical card stacking.
- [ ] **New Sections**
    - [ ] Health Records & Consultation History.
    - [ ] Daily Health Tip & Activity Streak.

## Phase 8: Cart Overhaul (New Request)
- [ ] **Header Area** (`app/cart/page.tsx`)
    - [ ] Add "Order almost ready" line.
    - [ ] Add "Express Delivery" badge.
- [ ] **Product Rows**
    - [ ] Add details (strength, size) & badges (Rx, In-stock).
    - [ ] Animated quantity selector.
    - [ ] Mobile: Stacked card layout.
- [ ] **Smart Upsell**
    - [ ] "You may also need" section (mock logic).
- [ ] **Order Summary**
    - [ ] Detailed breakdown (Savings, ETA, Taxes).
    - [ ] "100% Secure" badge & Returns policy.
    - [ ] Animated numbers & pulsing checkout button.
- [ ] **Payment & Trust**
    - [ ] Sticky "Pay Now" button.
    - [ ] Auto-focus & numeric keyboards.
- [ ] **Compliance & Trust**
    - [ ] Pharmacist verification text.
    - [ ] Secure payment badges.

## Phase 9: Admin Dashboard (New Request)
- [NEW] `app/admin/layout.tsx`: Admin-specific layout with sidebar.
- [NEW] `app/admin/page.tsx`: Ops Cockpit with live KPIs.
- [NEW] `app/admin/orders/page.tsx`: Order management list & details.
- [NEW] `app/admin/products/page.tsx`: Product catalog CRUD.
- [NEW] `app/admin/inventory/page.tsx`: Warehouse & stock management.
- [NEW] `app/admin/prescriptions/page.tsx`: Pharmacist queue & approval workflow.
- [NEW] `app/admin/coupons/page.tsx`: Coupon management.
- [NEW] `app/admin/finance/page.tsx`: Payments & refunds reconciliation.
- [NEW] `app/admin/users/page.tsx`: User management & support.
- [NEW] `app/admin/settings/page.tsx`: System configuration.

## Phase 10: HR & Payroll (New Request)
- [NEW] `app/admin/hr/layout.tsx`: HR-specific layout.
- [NEW] `app/admin/hr/employees/page.tsx`: Employee master list & profiles.
- [NEW] `app/admin/hr/payroll/page.tsx`: Payroll runs & approvals.
- [NEW] `app/admin/hr/attendance/page.tsx`: Attendance dashboard & corrections.
- [NEW] `app/admin/hr/leaves/page.tsx`: Leave requests & balances.
- [NEW] `app/admin/hr/advances/page.tsx`: Loan/Advance requests & ledger.
- [NEW] `app/admin/hr/expenses/page.tsx`: Expense claim workflow.
- [NEW] `app/admin/hr/reports/page.tsx`: Statutory & payroll reports.

## Phase 11: AI Admin Worker (New Request)
- [NEW] `components/admin/AIAssistantModal.tsx`: Chat & Actions UI.
- [NEW] `app/api/admin/ai/route.ts`: Main AI handler (RAG + Prompt).
- [NEW] `lib/ai/executor.ts`: Action execution logic.
- [NEW] `lib/ai/rag.ts`: Weaviate integration.
