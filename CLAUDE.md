# CLAUDE.md — Petoria Petshop Project

> Read this file before making ANY change to the codebase.
> This file defines the UI design system, page structure, and rules.
> Do NOT change colors, layouts, or component structure without explicit user instruction.

---

## 1. Tech Stack

- **Framework:** Next.js (Pages Router)
- **Language:** TypeScript
- **UI:** MUI (Material UI) + custom SCSS
- **State:** Apollo Client reactive vars
- **Auth:** JWT token
- **API:** GraphQL (Apollo)
- **Real-time:** WebSocket (native ws)
- **AI Chat:** Anthropic Claude API (`claude-sonnet-4-20250514`)

---

## 2. Design System

### Color Palette (DO NOT change)
```scss
--nb:  #2D5016   // navbar dark green
--nm:  #3A6B1E   // medium green
--np:  #4E8A28   // primary green (buttons, links, badges)
--nl:  #6DB535   // light green
--ns:  #A8CC7A   // soft green (text on dark bg)
--nbg: #EAF3DE   // pale green background
--pb:  #F4FAF0   // page background light
--cb:  #ffffff   // card background
--t1:  #1A2E0A   // primary text
--t2:  #3A5020   // secondary text
--t3:  #6B8A4E   // muted text
--bd:  #C8E6A0   // border color
```

### Dark Mode (data-theme toggle)
```scss
[data-dark] {
  --pb:  #0f1a08
  --cb:  #1a2e10
  --t1:  #E8F5D0
  --t2:  #A8CC7A
  --t3:  #6DB535
  --bd:  #27500A
  --nb:  #0f1a08
  --nm:  #1a2e10
}
```

### Theme Toggle
```typescript
// libs/store/themeStore.ts
import { makeVar } from '@apollo/client';
const saved = typeof window !== 'undefined'
  ? (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light'
  : 'light';
export const themeVar = makeVar<'light' | 'dark'>(saved);
```

### Typography
- Font: system sans-serif (var(--font-sans))
- Base font size: 13px
- Section titles: 13–14px, font-weight 500
- Small labels: 10–11px
- Card names: 11–12px

### Border radius
- Cards: 10px
- Buttons: 6px
- Chips/pills: 14–20px
- Avatars: 50%

---

## 3. Project Structure

```
petoriashop-next/
├── apollo/
│   ├── admin/mutation.ts       # Admin mutations
│   ├── admin/query.ts          # Admin queries
│   ├── user/mutation.ts        # User mutations
│   ├── user/query.ts           # User queries
│   ├── client.ts
│   └── store.ts                # userVar, socketVar, themeVar
├── libs/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── LayoutAdmin.tsx     # Admin panel (dark green sidebar)
│   │   │   ├── LayoutBasic.tsx     # Pages with banner header
│   │   │   ├── LayoutFull.tsx      # Full layout, no banner
│   │   │   └── LayoutHome.tsx      # Homepage with hero + HeaderFilter
│   │   ├── homepage/
│   │   │   ├── HeaderFilter.tsx        # Hero search + pet type chips
│   │   │   ├── BrandsStrip.tsx         # Top brands horizontal scroll
│   │   │   ├── CategoryGrid.tsx        # 4-col category grid (FOOD/TOY/MEDICINE/ACCESSORY)
│   │   │   ├── PopularProducts.tsx     # DOG/CAT/BIRD/FISH tabs + 4 cards
│   │   │   ├── PopularProductCard.tsx  # Like, cart, type badge, stock warning
│   │   │   ├── TopProducts.tsx         # Top 3 (gold/silver/bronze rank badges)
│   │   │   ├── TopProductCard.tsx
│   │   │   ├── TrendProducts.tsx       # 4 newest products
│   │   │   ├── TrendProductCard.tsx    # "NEW" badge
│   │   │   ├── TopAgents.tsx           # Top 4 sellers
│   │   │   ├── TopAgentCard.tsx        # Seller card with follow button
│   │   │   ├── Advertisement.tsx       # Video banner + 2 promo cards
│   │   │   ├── HeroBanner.tsx          # Hero section with search
│   │   │   ├── NewArrivals.tsx         # 4 newest arrivals (2-col)
│   │   │   ├── PromoBanner.tsx         # Green promo banner (free delivery)
│   │   │   ├── Events.tsx              # 4 event cards
│   │   │   ├── CommunityBoards.tsx     # Article tabs + 3 articles
│   │   │   ├── CommunityCard.tsx
│   │   │   └── VideoBanner.tsx         # Dark video banner with play button
│   │   ├── common/
│   │   │   ├── ShopProductCard.tsx     # Real backend card (MyFavorites, RecentlyViewed)
│   │   │   ├── ShopFilter.tsx          # Type+Category+Brand+Size+Price+Sale filter
│   │   │   ├── SellerCard.tsx          # Seller grid card
│   │   │   ├── CommunityCard.tsx       # Article card
│   │   │   └── ReviewCard.tsx          # Comment/review card
│   │   ├── product/
│   │   │   └── ProductCard.tsx         # Shop list card (like PropertyCard structure)
│   │   ├── mypage/
│   │   │   ├── MyMenu.tsx              # Sidebar: SELLER menu + community + account
│   │   │   ├── MyProfile.tsx           # Avatar upload + form fields + save
│   │   │   ├── MyProducts.tsx          # ACTIVE/SOLD/DELETE tabs + ProductCard rows
│   │   │   ├── MyFavorites.tsx         # Saved products grid
│   │   │   ├── MyArticles.tsx          # Article list + edit/delete
│   │   │   ├── RecentlyViewed.tsx      # Recently viewed products
│   │   │   ├── WriteArticle.tsx        # TuiEditor
│   │   │   ├── AddNewProduct.tsx       # Product form (type/category/brand/price/stock/size/sale)
│   │   │   └── ProductCard.tsx         # Mypage product row card (named export)
│   │   ├── member/
│   │   │   ├── MemberMenu.tsx          # Member sidebar
│   │   │   ├── MyProducts.tsx          # Member's products list
│   │   │   ├── MemberFollowers.tsx
│   │   │   ├── MemberFollowings.tsx
│   │   │   └── MemberArticles.tsx
│   │   ├── admin/
│   │   │   ├── product/ProductList.tsx       # ProductPanelList table
│   │   │   ├── users/MemberList.tsx
│   │   │   └── community/CommunityArticleList.tsx
│   │   ├── Top.tsx        # Navbar: logo, search, links, cart, chat popup, login/signup, dark toggle
│   │   ├── Footer.tsx     # Footer: links, newsletter, social
│   │   ├── Chat.tsx       # Chat popup: Live (WebSocket) + AI (Claude API) side by side
│   │   └── Review.tsx
│   ├── store/
│   │   └── themeStore.ts  # themeVar reactive var
│   ├── enums/
│   │   ├── product.enum.ts    # ProductType, ProductStatus, ProductCategory, Direction
│   │   ├── member.enum.ts     # MemberType, MemberStatus
│   │   ├── board-article.enum.ts
│   │   └── comment.enum.ts
│   ├── types/
│   │   ├── product/product.ts
│   │   ├── product/product.input.ts
│   │   └── product/product.update.ts
│   ├── hooks/useDeviceDetect.ts
│   ├── auth/index.ts
│   └── config.ts              # API_URL, Messages, topProductRank
├── pages/
│   ├── _app.tsx               # ApolloProvider + ThemeProvider + dark mode effect
│   ├── index.tsx              # Homepage
│   ├── about/index.tsx
│   ├── account/join.tsx       # Login / Signup
│   ├── shop/index.tsx         # Product list + ShopFilter sidebar
│   ├── shop/detail.tsx        # Product detail
│   ├── seller/index.tsx       # Seller list
│   ├── seller/detail.tsx      # Seller profile + products + reviews
│   ├── community/index.tsx    # Articles (FREE/RECOMMEND/NEWS/HUMOR)
│   ├── community/detail.tsx   # Article detail + comments
│   ├── cs/index.tsx           # Notice + FAQ
│   ├── member/index.tsx       # Member profile
│   ├── mypage/index.tsx       # My page
│   └── _admin/
│       ├── index.tsx
│       ├── users/index.tsx
│       ├── product/index.tsx
│       └── community/index.tsx
└── pages/api/
    └── ai-chat.ts             # Anthropic Claude API route
```

---

## 4. Enums (EXACT values — do not change)

```typescript
ProductType:     DOG | CAT | BIRD | FISH
ProductStatus:   ACTIVE | SOLD | DELETE
ProductCategory: FOOD | MEDICINE | ACCESSORY | TOY
MemberType:      USER | SELLER | ADMIN
MemberStatus:    ACTIVE | BLOCK | DELETE
Direction:       ASC | DESC
```

---

## 5. Page UI Design Specifications

### 5.1 NAVBAR (Top.tsx)
```
[🐾 Petoria] [Search bar ──────────────] [Home] [Shop] [Vets & Zoo] [Community] [🛒 3] [💬 chat] [Login] [Sign up] [🌙]
```
- Logo: left, color #A8CC7A
- Search: flex:1, rounded, dark green bg
- Nav links: color #6DB535
- Cart button: green bg, item count badge
- Chat button: icon + red badge (online count) → opens popup on click
- Login/Signup: rightmost, Login=transparent border, Signup=green bg
- Dark mode toggle: moon/sun icon, rightmost
- When logged in: Login/Signup hidden → user avatar icon + dark toggle

### 5.2 WEATHER BAR (below navbar)
```
[☀️] [24°C] [Clear & sunny] [Spring badge] ──────── [Daejeon, KR] [☀️][🌧️][❄️][🌸]
```
- Weather icons animate hero section background
- ☀️ Spring → green gradient hero
- 🌧️ Rainy → dark blue hero + rain animation
- ❄️ Winter → dark blue hero + snowflake animation
- 🌸 Spring blossom → dark pink hero + petal animation

### 5.3 VIDEO BANNER (below weather bar, replaces page tabs)
```
[▶ Play btn]  [Petoria Pet Care Guide 2026]           [🚚 Free delivery]
              [Learn how to keep your pet healthy]    [🎁 PETORIA2026]
              [🐶 Dog care] [🐱 Cat tips] [💊 Health] [🍖 Nutrition]
```
- Background: #0f1f09 dark with dot pattern overlay
- Play button: green circle, toggles pause on click

### 5.4 HOMEPAGE SECTIONS (in order)
1. **BrandsStrip** — horizontal scroll, brand pills (🦁 Royal Canin, 🏔 Hill's, 🌿 Orijen...)
2. **CategoryGrid** — 4 cols: 🍖 Food / 🎾 Toys / 💊 Medicine / 🎀 Accessories
3. **PopularProducts** — DOG/CAT/BIRD/FISH tabs, 4 product cards
4. **PromoBanner** — green bg: "Free delivery on first order!" + promo code + 🚚
5. **NewArrivals** — 2-col grid, 4 items with "NEW" badge
6. **TopProducts** — 3-col, rank badges 🥇🥈🥉
7. **TopAgents (Sellers)** — 4-col seller cards with follow button
8. **VideoBanner** — dark video section
9. **Events** — 4-col event cards
10. **CommunityBoards** — tabs + 3 article cards
11. **Footer**

### 5.5 CHAT POPUP (Chat.tsx)
- Opens on 💬 navbar button click, closes on outside click
- Two panels side by side (no tabs — always both visible):
  - LEFT: Live chat (WebSocket) — "All users", online count badge, real messages
  - RIGHT: AI assistant (Claude API) — always online, pet care Q&A
- Both panels: header bar (dark green), message area, input + send button

### 5.6 AUTH PAGE (account/join.tsx)
- Centered modal card
- Login / Sign Up tabs at top
- Login: nickname + password + remember me + forgot password
- Sign Up: nickname + password + phone + register as (USER 🐾 / SELLER 🛍)
- Navbar: Login (transparent border) + Sign up (green) buttons at far right

### 5.7 MY PAGE (mypage/index.tsx)
- Only visible when logged in — redirect to auth if not
- Profile header: gradient green bg, avatar, name, type, stats (Orders/Favorites/Following/Followers)
- 5 tabs:
  1. **👤 Profile** — avatar upload, username, phone, address, bio textarea, Save button
  2. **📦 Orders** — status chips (All/Pending/In transit/Delivered/Cancelled), order cards with:
     - Order ID, status badge (colored), product emoji list, total, date
     - Tracking bar (Ordered→Packed→Shipped→Delivered) for in-transit orders
     - Action buttons (View/Reorder/Review/Cancel/Track)
  3. **💳 Payment** — spending summary card, saved payment methods (Visa/KakaoPay), billing address
  4. **❤️ Favorites** — 4-col product grid
  5. **✍️ Articles** — list with edit/delete buttons + write new button

### 5.8 SHOP PAGE (shop/index.tsx)
- Layout: 160px filter sidebar (left) + product grid (right)
- Filter sidebar sections:
  - Pet type: DOG/CAT/BIRD/FISH checkboxes
  - Category: FOOD/TOY/MEDICINE/ACCESSORY checkboxes
  - Brand: list with "show more" toggle (5 visible)
  - Size/Weight: XS/S/M/L/XL/1KG/3KG/5KG chips
  - Price range: slider $0–$500
  - On sale only: checkbox
  - Reset filters button
- Product grid: sort dropdown (Newest/Price low/Price high/Popular) + 3-col grid

### 5.9 SHOP DETAIL PAGE (shop/detail.tsx)
- Breadcrumb: Home / Shop / Category / Product name
- Left: product images (main large + 3 thumbnails)
- Right:
  - Brand name (clickable → brand page), pet type + category tags
  - Product name (large), rating + review count
  - Price + original price (strikethrough) + discount % badge
  - Size/weight chips
  - Stock warning (⚠️ Only N left!)
  - Qty selector (−/+) + Add to cart button + ❤️ like
  - Free delivery estimate
- 3 tabs: Description (feature cards) / Nutrition (per 100g table) / Reviews (rating bar + write)
- Related products: 4-col grid

### 5.10 BRAND DETAIL PAGE (brand/[id].tsx or shop?brand=X)
- Hero: brand logo big, brand name, tagline, pet type tags, stats (Products/Rating/Reviews/Founded), Follow button
- 4 tabs:
  1. **Products** — category filter chips + 3-col product grid
  2. **Brand story** — history text, feature boxes (4-col stats), certifications row
  3. **Reviews** — rating bar chart + review cards
  4. **Related brands** — 4-col related brand cards

### 5.11 COMMUNITY PAGE (community/index.tsx)
- Vertical tabs (left sidebar): FREE / RECOMMEND / NEWS / HUMOR
- Right: title + subtitle + Write button + article list
- Petoria logo in left sidebar above tabs

### 5.12 COMMUNITY DETAIL (community/detail.tsx)
- Category chips + title + author + date + read time
- Hero image area
- Article content + key takeaways box
- Like / Share / Save buttons
- Comments list + write comment form
- Related articles (3 cards)

### 5.13 CS PAGE (cs/index.tsx)
- Banner: green gradient + "Petoria Support Center" + Call / Live chat buttons
- 2 tabs:
  1. **Notice** — type filter chips, notice items with colored type badges
  2. **FAQ** — category chips + accordion (click to expand/collapse)
- Contact cards: Phone / Email / Live Chat (3-col)

### 5.14 ABOUT PAGE (about/index.tsx)
- Hero: dark green gradient, 🐾 emoji, mission statement
- Stats: 4-col (10K+ owners / 500+ products / 50+ brands / 4.9★)
- Mission cards: 3 items (Authentic / Science-based / Eco-friendly)
- Team: 3 members
- Partner brand pills
- CTA banner: dark green + contact info + button

### 5.15 MEMBER PROFILE (member/index.tsx)
- Profile header: gradient green, avatar, name, type, bio quote, stats, Follow + Message buttons
- 3 tabs:
  1. **Articles** — article list with meta
  2. **Followers** — member list with follow/unfollow button
  3. **Following** — member list with unfollow button

### 5.16 VETS & ZOO PAGE (services page)
- Sections:
  1. Veterinary clinics (2-col cards: name, type, rating, hours, distance)
  2. Zoo & animal parks (2-col)
  3. Zoo cafes (3-col)
  4. Pet shops nearby (3-col)
- Each card: icon, name, type+distance, star rating, hours/price, distance badge

### 5.17 ADMIN PAGES (_admin/)
- Layout: dark green sidebar (#2D5016) + white content area
- AdminUsers: tabs (All/Active/Blocked/Deleted) + search + member type filter + MemberPanelList table
- AdminProducts: tabs (All/Active/Sold/Deleted) + ProductType filter dropdown + ProductPanelList table
- AdminCommunity: tabs (All/Active/Deleted) + BoardArticleCategory filter + CommunityArticleList table
- Delete = UPDATE with status DELETE (no REMOVE mutation)

---

## 6. API Rules (CRITICAL — never change these)

### Import paths
```typescript
// ✅ Correct
import ProductCard from '../../libs/components/product/ProductCard';
import { ProductCard } from '../mypage/ProductCard';   // named export
import { API_URL } from '../../config';                // NOT REACT_APP_API_URL

// ❌ Wrong
import ProductCard from '../../libs/components/homepage/ProductCard'; // emoji version!
import { REACT_APP_API_URL } from '../../config';
```

### Mutations
```typescript
// ✅ Correct
likeTargetBoardArticle({ variables: { articleId: id } });
likeTargetMember({ variables: { input: id } });
likeTargetProduct({ variables: { input: id } });

// ❌ Wrong
likeTargetBoardArticle({ variables: { input: id } }); // must be articleId!
```

### MemberType
```typescript
user.memberType === 'SELLER'  // ✅
user.memberType === 'AGENT'   // ❌ old Nestar value
```

### Admin delete
```typescript
// ✅ No REMOVE mutation — use DELETE status
updateProductByAdmin({ variables: { input: { _id: id, productStatus: 'DELETE' } } });
// ❌ Does not exist:
removeProductByAdmin({ variables: { input: id } });
```

---

## 7. WebSocket Chat

```typescript
// apollo/store.ts
export const socketVar = makeVar<WebSocket>(new WebSocket(process.env.NEXT_PUBLIC_WS_URL!));

// Events from backend:
{ event: 'info',        totalClients: number }
{ event: 'getMessages', list: MessagePayload[] }
{ event: 'message',     text: string, memberData: Member }

// Send:
socket.send(JSON.stringify({ event: 'message', data: messageInput }));
```

---

## 8. AI Chat (Claude API)

```typescript
// pages/api/ai-chat.ts
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY!,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are Petoria's AI pet assistant. Help users find products, answer pet care questions. Be friendly and use 🐾 emoji.`,
    messages,
  }),
});
```

---

## 9. Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3007
NEXT_PUBLIC_WS_URL=ws://localhost:3007
REACT_APP_API_GRAPHQL_URL=http://localhost:3007/graphql
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 10. Already Fixed (do NOT revert)

- `REACT_APP_API_URL` → `API_URL` ✅
- `GET_AGENT_PRODUCTS` → `GET_SELLER_PRODUCTS` ✅
- `AGENT` → `SELLER` (MemberType) ✅
- `likeTargetBoardArticle` → `{ articleId: id }` ✅
- `ProductStatus.INACTIVE` → `ProductStatus.DELETE` ✅
- `admin/products/ProductList` → `admin/product/ProductList` ✅
- `AllProductsInquiry` exists in product.input.ts ✅
- No `REMOVE_PRODUCT_BY_ADMIN` — use UPDATE with DELETE status ✅
