# Petoria Petshop

A full-stack e-commerce platform for pet supplies, built as a portfolio project to demonstrate production-oriented frontend development with Next.js, TypeScript, GraphQL, and real-time features.

---

## Overview

Petoria Petshop is a feature-complete online pet store covering the full user journey — browsing and filtering products, managing a cart, placing orders, tracking delivery status, and participating in a community board. The platform supports three user roles (customer, seller, admin) and includes a real-time community chat powered by WebSocket.

The frontend is built with Next.js (Pages Router), TypeScript, Apollo Client, and MUI. The backend API is a separate NestJS + GraphQL + MongoDB service.

---

## Features

### Shopping
- Product catalog with filters: pet type (DOG / CAT / BIRD / FISH), category, brand, size, price range, and sale flag
- Product detail page with image gallery, stock warning, size selector, and quantity control
- Like / save to favorites functionality
- Recently viewed products

### Cart & Checkout
- Persistent cart backed by localStorage
- Korean address lookup via Daum Postcode API
- Free shipping threshold calculation
- Multi-step payment flow with selectable payment methods (credit card, Apple Pay, Naver Pay, Kakao Pay, Toss Bank)
- Card save/default/remove management

### Orders
- Full order lifecycle: Pending → Processing → Confirmed → Delivered
- Visual delivery tracking progress bar
- Order cancellation with confirmation
- Order history with search (by order ID or product name) and year filter

### User Dashboard (My Page)
- Profile editing with avatar upload
- Order history and tracking
- Saved payment methods
- Favorited products
- Community articles authored by the user

### Seller Features
- Seller dashboard with product management (active / sold / deleted tabs)
- Add and edit product listings with image upload (up to 5 images)
- Seller public profile page visible to other users

### Community
- Article board with categories: Free / Recommend / News / Humor
- Rich text editor (Toast UI Editor) for writing articles
- Commenting with character limit
- Like and pagination

### Admin Panel
- Member management: view, change type (USER / SELLER / ADMIN), change status (ACTIVE / BLOCK / DELETE)
- Product management: filter by type and status, update product status
- Order management: view all orders with status and payment details
- Community moderation: view and remove articles

### Real-Time & Integrations
- Live community chat via WebSocket (connected to NestJS WebSocket gateway)
- Online user count in chat badge
- Weather widget (OpenWeatherMap API) with animated hero section based on current conditions
- AI pet assistant integration via Anthropic Claude API (configured, in progress)

### UI & Accessibility
- Responsive layout with dedicated mobile and desktop views
- Dark mode via CSS custom properties (`data-dark` attribute toggle)
- Multi-language support: English, Korean (한국어), Russian (Русский)
- Accessible interactive elements with `aria-label` and semantic HTML

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.0 | Framework (Pages Router, API routes, i18n) |
| TypeScript | 5.0.4 | Type safety |
| Apollo Client | 3.10.8 | GraphQL client, reactive state (`makeVar`) |
| MUI (Material UI) | 5.x | UI component library |
| SCSS | — | Custom design system, dark mode, responsive breakpoints |
| next-i18next | 14.x | Internationalisation (EN / KR / RU) |
| react-scrollable-feed | — | Auto-scrolling chat feed |
| Toast UI Editor | 3.x | Rich text editor for community articles |
| SweetAlert2 | 11.x | User-facing error and confirmation dialogs |

### Backend (separate repository)
| Technology | Purpose |
|---|---|
| NestJS | REST + GraphQL API server |
| GraphQL | API query language |
| MongoDB | Primary database |
| WebSocket | Real-time chat gateway |
| JWT | Authentication |

---

## Architecture

```
Browser (Next.js)
     │
     ├── Apollo Client ──────► GraphQL API (NestJS)  ──► MongoDB
     │      └── InMemoryCache                               │
     │      └── Reactive vars (userVar, socketVar…)         └── Collections: members, products,
     │                                                             orders, board-articles, comments
     ├── WebSocket ──────────► WebSocket Gateway (NestJS)
     │      └── Live chat, online user count
     │
     ├── Next.js API Routes
     │      └── /api/* ──────► Anthropic Claude API (AI assistant, planned)
     │      └── Weather fetch ► OpenWeatherMap API
     │
     └── localStorage
            └── JWT access token, cart, theme preference
```

### Major Frontend Modules

| Module | Path | Responsibility |
|---|---|---|
| Apollo layer | `apollo/` | All GraphQL queries, mutations, and client configuration |
| User queries | `apollo/user/query.ts` | Product, member, order, article, comment queries |
| Admin queries | `apollo/admin/` | Admin-scoped queries and mutations |
| Global state | `apollo/store.ts` | Reactive vars: `userVar`, `socketVar`, `chatOpenVar`, `unreadMsgCountVar` |
| Components | `libs/components/` | Organised by domain: `homepage/`, `mypage/`, `admin/`, `community/`, `seller/` |
| Auth | `libs/auth/index.ts` | Login, sign-up, JWT decode, logout, cross-tab session sync |
| Cart | `libs/cart.ts` | localStorage-backed cart with event-based sync |
| Enums & Types | `libs/enums/`, `libs/types/` | Shared TypeScript contracts |
| Pages | `pages/` | Next.js file-based routing |

---

## Installation

### Prerequisites
- Node.js 18+
- The backend NestJS API must be running (see backend repository)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/petoriashop-next.git
cd petoriashop-next

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables section)

# 4. Start the development server
npm run dev
# App runs at http://localhost:4000
```

### Available Scripts

```bash
npm run dev       # Start development server (port 4000)
npm run build     # Build for production
npm run start     # Start production server (port 4000)
npm run lint      # Run ESLint
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values. None of the variables below should be committed with real values.

```env
# Backend API (NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_API_GRAPHQL_URL=http://localhost:3002/graphql
NEXT_PUBLIC_API_WS=ws://localhost:3002

# AI Assistant — Anthropic Claude API
# Get a key at https://console.anthropic.com
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Weather widget — OpenWeatherMap
# Get a free key at https://openweathermap.org/api
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_key_here

# Fallback location when GPS and IP geolocation both fail
NEXT_PUBLIC_WEATHER_FALLBACK_LAT=37.5385
NEXT_PUBLIC_WEATHER_FALLBACK_LNG=127.2153
NEXT_PUBLIC_WEATHER_FALLBACK_CITY=Seoul
```

> **Note:** `ANTHROPIC_API_KEY` is a server-side variable and is never sent to the browser. The weather key prefixed with `NEXT_PUBLIC_` is exposed to the client — use a free-tier key with domain restrictions.

---

## Project Structure

```
petoriashop-next/
├── apollo/
│   ├── client.ts              # Apollo Client setup (auth link, WebSocket split, error handling)
│   ├── store.ts               # Apollo reactive variables (user, socket, chat state)
│   ├── user/
│   │   ├── query.ts           # All user-facing GraphQL queries
│   │   └── mutation.ts        # All user-facing GraphQL mutations
│   └── admin/
│       ├── query.ts           # Admin-scoped queries
│       └── mutation.ts        # Admin-scoped mutations
│
├── libs/
│   ├── components/
│   │   ├── layout/            # Layout HOCs: LayoutHome, LayoutBasic, LayoutFull, LayoutAdmin
│   │   ├── homepage/          # Homepage sections: HeroBanner, PopularProducts, TrendProducts…
│   │   ├── common/            # Shared components: ShopProductCard, ShopFilter, CommunityCard…
│   │   ├── mypage/            # My Page tabs: MyProfile, MyOrders, MyProducts, PaymentModal…
│   │   ├── seller/            # Seller dashboard components
│   │   ├── member/            # Public member profile components
│   │   ├── admin/             # Admin panel tables: MemberList, ProductList, CommunityArticleList
│   │   ├── community/         # Community editor (Toast UI) and article components
│   │   ├── cs/                # Customer support: FAQ accordion, Notice list
│   │   ├── Top.tsx            # Navbar: search, navigation, cart, chat button, auth, dark/language toggle
│   │   ├── Footer.tsx         # Site footer
│   │   └── Chat.tsx           # Real-time chat popup (WebSocket)
│   ├── auth/index.ts          # Authentication helpers (login, signup, logout, JWT decode)
│   ├── cart.ts                # Cart store (localStorage persistence + event sync)
│   ├── config.ts              # API URL, shared constants
│   ├── enums/                 # TypeScript enums: ProductType, ProductStatus, MemberType…
│   ├── hooks/                 # Custom hooks: useDeviceDetect, useCart, useToast
│   ├── store/themeStore.ts    # Theme reactive variable (light / dark)
│   ├── sweetAlert.ts          # SweetAlert2 helper wrappers
│   └── types/                 # TypeScript interfaces for all domain models
│
├── pages/
│   ├── index.tsx              # Homepage
│   ├── shop/index.tsx         # Product listing with filter sidebar
│   ├── shop/[id].tsx          # Product detail
│   ├── cart/index.tsx         # Cart and checkout
│   ├── mypage/index.tsx       # Authenticated user dashboard
│   ├── seller/                # Seller profile and dashboard
│   ├── member/index.tsx       # Public member profile
│   ├── community/             # Article board and detail
│   ├── account/join.tsx       # Login and sign-up
│   ├── about/index.tsx        # About page
│   ├── cs/index.tsx           # Customer support (FAQ, notices)
│   ├── vet/index.tsx          # Veterinary clinics and pet services
│   └── _admin/                # Admin panel (users, products, orders, community)
│
├── scss/
│   ├── variables.scss         # CSS custom properties: color palette, dark mode overrides
│   ├── mixins.scss            # SCSS mixins
│   ├── app.scss               # Global styles
│   ├── pc/                    # Desktop-specific styles per page
│   └── mobile/                # Mobile-specific styles per page
│
├── public/
│   └── locales/
│       ├── en/                # English translations
│       ├── kr/                # Korean translations
│       └── ru/                # Russian translations
│
├── next.config.js             # Next.js config (i18n, redirects)
├── next-i18next.config.js     # i18n locale config
└── .env.example               # Environment variable template
```

---

## Screenshots

### Homepage

> *(Add screenshot here)*

### Product Detail

> *(Add screenshot here)*

### Cart & Checkout

> *(Add screenshot here)*

### My Orders

> *(Add screenshot here)*

### Seller Dashboard

> *(Add screenshot here)*

### Admin Dashboard

> *(Add screenshot here)*

### Community Board

> *(Add screenshot here)*

### Live Chat

> *(Add screenshot here)*

---

## Demo

**Demo URL:** Coming soon

> The frontend requires the NestJS backend to be running. A hosted demo will be linked here once the backend is deployed.

---

## User Roles

| Role | Access |
|---|---|
| Guest | Browse products, read community articles |
| User (Customer) | All guest access + cart, checkout, orders, favorites, community participation |
| Seller | All user access + product listing management, seller dashboard |
| Admin | Full access including member management, product moderation, and order overview |

---

## Future Improvements

- Replace simulated payment flow with a real payment processor (e.g., Toss Payments or Stripe)
- Complete the Anthropic Claude AI assistant integration with a `/api/ai-chat` route
- Add `next/image` throughout to enable automatic image optimisation, lazy loading, and WebP conversion
- Implement Apollo Cache TypePolicies for paginated query merging
- Add a global error boundary component for unhandled API failures
- Integrate error tracking (e.g., Sentry)
- Fix token refresh link — currently configured but non-functional
- Add security headers (CSP, X-Frame-Options) via `next.config.js`
- Write unit and integration tests

---

## License

MIT
