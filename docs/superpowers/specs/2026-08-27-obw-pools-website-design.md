# OBW Pools Corporate Website & Field Platform Portal - Design Document

**Date:** 2026-08-27  
**Status:** Approved  
**Author:** Antigravity AI  
**Scope:** Landing Page, Interactive Showcase, Pricing Calculator, Lead Generator & Platform Switcher

---

## 1. Executive Summary & Brand Identity

The **OBW Pools Website** serves as the primary corporate presence and customer acquisition hub for OBW Pools (*"Cleaning • Maintenance • Repairs - Cleaner Pools. Stronger Performance"*). 

The website addresses two distinct user segments:
1. **Prospective & Current Pool Owners / Commercial Managers**: Exploring premium maintenance packages, checking service coverage across the Dallas-Fort Worth (DFW) Metroplex, testing the interactive pricing calculator, viewing verified before/after transformations, and requesting instant quotes.
2. **Technicians & Operations Personnel**: Accessing the field service management platform via a single-click portal button (*"🚀 Acessar Plataforma / Tech Portal"*).

---

## 2. Visual Architecture & Design Tokens

- **Theme**: Ultra-luxury aquatic dark mode with deep navy backgrounds, vibrant cyan/teal glowing accents, and glassmorphic card elements.
- **Color Palette**:
  - `Background Dark`: `#030d1a` to `#07172b` (deep ocean gradient)
  - `Surface Glass`: `rgba(13, 33, 62, 0.7)` with `backdrop-filter: blur(16px)` and border `1px solid rgba(0, 242, 254, 0.15)`
  - `Primary Neon`: `#00f2fe` to `#4facfe` (cyan-blue electric gradient)
  - `Secondary Gold/Amber`: `#f59e0b` (for ratings, badges, and VIP tiers)
  - `Text Primary`: `#f8fafc` (crisp white)
  - `Text Secondary`: `#94a3b8` (slate blue/grey)
- **Typography**: Inter / Outfit sans-serif with bold display headlines and clear, legible body text.
- **Assets**: Official metallic emblem (`client/public/logo.png`) with luminous neon glow.

---

## 3. Structural Sections

### 3.1 Global Header & Navigation
- **Logo & Slogan**: OBW Pools high-resolution brand badge.
- **Navigation Links**: *Serviços*, *Diferenciais*, *Antes & Depois*, *Planos*, *Cobertura DFW*, *Contato*.
- **Phone Quick Action**: Click-to-call `(972) 555-POOL`.
- **Portal Action CTA**: Glowing button `🚀 Acessar Plataforma` that instantly switches the SPA mode to the Field Operations Platform.

### 3.2 Immersive Hero Section
- **Badge**: *"#1 Premium Pool Care in Dallas-Fort Worth"*.
- **Headline**: *"Água Cristalina. Alta Performance. Cuidado de Elite para sua Piscina."*
- **Subheadline**: *"Equilíbrio químico com precisão laboratorial LSI, técnicos certificados e comprovante fotográfico no seu WhatsApp a cada visita."*
- **Primary CTAs**:
  - `🌟 Solicitar Orçamento Grátis` (Smooth-scrolls to the Instant Quote Form).
  - `🚀 Acessar Plataforma Técnica` (Switches view to the operations platform).
- **Stat Badges**:
  - 💧 **100%** Água Equilibrada LSI
  - 🏊 **+500** Piscinas Atendidas no DFW
  - ⭐ **4.9 / 5.0** Avaliação Média
  - 📸 **100%** Comprovante Fotográfico Digital

### 3.3 Services Showcase (Grid Layout)
1. **Limpeza Semanal Completa**: Aspiração profunda, escovação de bordas e paredes, remoção de detritos e limpeza dos cestos de skimmer e pré-filtro.
2. **Química Científica & LSI**: Monitoramento contínuo do Índice de Saturação de Langelier para prevenir corrosão de aquecedores e incrustação de azulejos.
3. **Manutenção de Equipamentos**: Monitoramento de pressão do manômetro com retrolavagem preventiva de filtros e inspeção de células de sal (SWG).
4. **Reparos & O.S. Especializadas**: Diagnóstico de vazamentos, substituição de bombas, aquecedores a gás, iluminação LED e automação.

### 3.4 Interactive Before & After Showcase
- Interactive comparison widget allowing potential customers to drag or toggle between a murky/green pool and crystal-clear turquoise water after OBW Pools service.

### 3.5 Technological Advantages
- **Digital Door Hanger**: Relatório com carimbo de data/hora e fotos de Antes/Depois enviado no WhatsApp assim que o técnico sai da residência.
- **Proteção LSI Certificada**: Previne danos caros à alvenaria, pastilhas e trocadores de calor.
- **Radar Climático Ativo**: Ações preventivas automáticas para geadas de inverno (*Freeze Warning*) e calor extremo de verão (*Heatwave*).

### 3.6 Interactive Pricing & Plan Estimator
- **Standard Weekly Care**: `$180/mês` (Visita semanal, limpeza completa e balanceamento básico).
- **Salt Chem Plus (Recomendado)**: `$220/mês` (Piscinas de sal SWG, produtos químicos inclusos, auditoria mensal de LSI).
- **Commercial & HOA**: `$450/mês` (Condomínios residenciais e clubes, relatórios formais e visitas bi-semanais).
- **Interactive Calculator Widget**: Permite ao usuário escolher o tipo de piscina (tradicional vs. salina), tamanho estimado e obter a cotação estimada em tempo real com botão de contratação direta via WhatsApp.

### 3.7 Dallas-Fort Worth Service Area Map
- Cidades atendidas com badges interativos: *Frisco, Plano, McKinney, Southlake, University Park, Dallas, Prosper, Allen, Carrollton*.

### 3.8 Customer Testimonials & Trust Signals
- Depoimentos reais com fotos, estrelas e selo de cliente verificado.

### 3.9 Instant Quote Lead Form & Footer
- Formulário intuitivo: *Nome, Telefone / WhatsApp, Cidade no DFW, Tipo de Piscina, Mensagem*.
- Disparo de lead com confirmação instantânea.
- Footer corporativo com redes sociais, horários e termos de serviço.

---

## 4. Technical Architecture & File Integration

### 4.1 Component Mapping
```
client/src/
├── components/
│   ├── LandingPage.tsx          # [NEW] Main public website component
│   ├── BeforeAfterSlider.tsx    # [NEW] Interactive before/after pool visual comparison
│   ├── PricingCalculator.tsx    # [NEW] Interactive pricing estimator widget
│   ├── QuoteFormModal.tsx       # [NEW] Instant quote modal & lead capture
│   ├── Navbar.tsx               # [MODIFY] Add "🌐 Ir para o Site" / "🚀 Acessar Plataforma"
│   └── ... (Existing Field Platform Components: RouteManager, WaterLab, etc.)
└── App.tsx                      # [MODIFY] Manage state 'view' (default: 'landing', toggle to 'app')
```

### 4.2 State Management & View Switching
- In `App.tsx`:
  - `viewMode`: `'landing' | 'app'` (defaults to `'landing'`).
  - Switching to `'app'` renders the full field service platform.
  - In `'app'` mode, the top navbar includes a prominent button **"🌐 Voltar ao Site Principal"** to return to the landing page anytime.
  - In `'landing'` mode, any click on "Acessar Plataforma" immediately switches `viewMode` to `'app'`.

---

## 5. Verification Plan

1. **Build Verification**: Run `npm run build` to confirm zero TypeScript errors.
2. **Responsive Visual Testing**: Test desktop, tablet, and mobile layouts.
3. **Interactive Features**: Test Before/After slider, Pricing calculator adjustments, lead form submission, and view switching.
4. **App Persistence**: Verify seamless navigation between the public landing page and the operations platform.
