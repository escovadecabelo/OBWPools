# OBW Pools Corporate Website & Field Platform Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a luxury, high-converting corporate website and customer acquisition landing page for OBW Pools with an interactive before/after slider, real-time pricing estimator, lead capture modal, and an integrated portal gateway to launch the field operations platform.

**Architecture:** A single-page application built on React 19 + TypeScript + Vite where the corporate website is the default view (`viewMode = 'landing'`), and users/technicians can seamlessly launch the field operations platform (`viewMode = 'app'`) with a single click and return anytime.

**Tech Stack:** React 19, TypeScript, Lucide Icons, Canvas-Confetti, Vanilla CSS (Aquatic Design System), Vite, FastAPI backend.

**Spec:** [docs/superpowers/specs/2026-08-27-obw-pools-website-design.md](file:///c:/ai-project/OBWPools/docs/superpowers/specs/2026-08-27-obw-pools-website-design.md)

## Global Constraints
- Theme: Aquatic Luxury Dark Mode (`#030d1a`, `#07172b`, `#00f2fe`, `#4facfe`).
- Branding: Official OBW Pools Logo (`client/public/logo.png`) and slogan *"CLEANING • MAINTENANCE • REPAIRS - CLEANER POOLS. STRONGER PERFORMANCE."*
- Strictly typed TypeScript with zero build errors (`npm run build`).
- Smooth transitions between Landing Page and Field Platform without page refresh.

---

### Task 1: Interactive Before & After Slider Component

**Files:**
- Create: `client/src/components/BeforeAfterSlider.tsx`

**Interfaces:**
- Consumes: React hooks (`useState`, `useRef`, `useCallback`), Lucide Icons (`Sparkles`, `MoveHorizontal`).
- Produces: `BeforeAfterSlider` component with draggable slider handle, touch/mouse dragging, before/after label badges, and high-resolution pool transformation images.

- [ ] **Step 1: Create `BeforeAfterSlider.tsx`**
Implement the interactive comparison slider with smooth clip-path dragging and touch/mouse responsiveness.

- [ ] **Step 2: Verify component exports and TypeScript typing**
Run `npm --prefix client run build` to verify types.

---

### Task 2: Real-time Pricing Calculator & Plan Estimator

**Files:**
- Create: `client/src/components/PricingCalculator.tsx`

**Interfaces:**
- Consumes: React hooks, Lucide Icons (`CheckCircle2`, `Calculator`, `ShieldCheck`, `ArrowRight`, `Sparkles`, `Zap`).
- Produces: `PricingCalculator` component rendering standard tiers (*Weekly Standard $180*, *Salt Chem Plus $220*, *Commercial $450*) and an interactive slider calculator adjusting for pool size and treatment type with instant WhatsApp quotation link.

- [ ] **Step 1: Create `PricingCalculator.tsx`**
Implement the tiers, frequency toggles, pool volume slider, and instant WhatsApp booking generator.

- [ ] **Step 2: Verify component exports and TypeScript typing**
Run `npm --prefix client run build` to verify types.

---

### Task 3: Instant Quote Request & Lead Capture Modal

**Files:**
- Create: `client/src/components/QuoteFormModal.tsx`

**Interfaces:**
- Consumes: React hooks, Lucide Icons (`X`, `Send`, `CheckCircle`, `Phone`, `Mail`, `MapPin`), `canvas-confetti`.
- Produces: `QuoteFormModal` component with field validation (name, phone, email, DFW city, pool type, service needed), instant WhatsApp pre-formatted message trigger, and success confirmation modal with confetti.

- [ ] **Step 1: Create `QuoteFormModal.tsx`**
Implement the modal, validation, WhatsApp redirect, and celebration effect.

- [ ] **Step 2: Verify component exports and TypeScript typing**
Run `npm --prefix client run build` to verify types.

---

### Task 4: Complete Corporate Website Landing Page

**Files:**
- Create: `client/src/components/LandingPage.tsx`

**Interfaces:**
- Consumes: `BeforeAfterSlider`, `PricingCalculator`, `QuoteFormModal`, Lucide Icons, OBW Pools logo (`/logo.png`), navigation triggers.
- Produces: `LandingPage` component rendering:
  - Sticky Top Navbar with portal button
  - Immersive Hero section with luminous background and stats
  - 4 Key Service Cards with icon badges
  - Before/After interactive showcase
  - Technological Advantages (Digital Door Hanger, LSI Protection, Texas Weather Radar)
  - Interactive Pricing & Calculator
  - DFW Metroplex Service Area Map with city chips
  - Verified Customer Testimonials & Reviews
  - Instant Quote Lead Banner & Footer

- [ ] **Step 1: Create `LandingPage.tsx`**
Assemble the full landing page using modular sections and cohesive design tokens.

- [ ] **Step 2: Verify component compilation**
Run `npm --prefix client run build` to verify types.

---

### Task 5: Integrate View Mode Switcher in `App.tsx` and Navigation Header

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/Navbar.tsx`

**Interfaces:**
- Consumes: `viewMode: 'landing' | 'app'` state, handler functions `onLaunchApp()`, `onBackToLanding()`.
- Produces: Seamless switching between the corporate landing page and the field service platform, adding a "🌐 Voltar ao Site Principal" button in the platform navbar.

- [ ] **Step 1: Update `App.tsx` to handle `viewMode`**
Set initial state `viewMode = 'landing'`, render `LandingPage` with `onLaunchApp={() => setViewMode('app')}`, and render the platform when `viewMode === 'app'`.

- [ ] **Step 2: Update `Navbar.tsx`**
Add the back-to-website button `🌐 Voltar ao Site` in the platform navigation bar.

- [ ] **Step 3: Test compilation**
Run `npm --prefix client run build` to verify types.

---

### Task 6: Enhanced Aquatic & Glassmorphic CSS Styling

**Files:**
- Modify: `client/src/index.css`

**Interfaces:**
- Produces: CSS classes for hero glowing backdrop, aquatic ripple highlights, glassmorphic cards, before/after slider handle, testimonial cards, and mobile responsiveness.

- [ ] **Step 1: Add new styling classes to `client/src/index.css`**
Add styles for landing page hero, feature badges, slider, calculator cards, and responsive media queries.

---

### Task 7: Full Test Suite, Build Verification & Quality Assurance

**Files:**
- Run: `npm run build`
- Run: `python -m pytest tests -v`

- [ ] **Step 1: Run client build verification**
Ensure TypeScript compilation is completely clean with 0 warnings or errors.

- [ ] **Step 2: Run backend test suite**
Verify all 13 Python pytest test cases pass cleanly.
