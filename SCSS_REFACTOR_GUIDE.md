# SCSS Refactoring Guide — Petoria Petshop

## Problem Summary

The Petoria codebase had fundamental architectural issues causing layout breakage and style leakage:

### 1. **Critical Global Rules** (`scss/app.scss`)
```scss
/* ❌ BROKEN RULES */
a {
  white-space: nowrap;  /* Forced ALL links to single line */
}
span, p {
  line-height: 1.2;     /* Compressed ALL text elements */
}
```

**Impact:**
- Breadcrumbs couldn't wrap → horizontal overflow
- Seller cards, buttons, links rendered on single line
- All paragraph/span text compressed (should be 1.4–1.6 for readability)
- Product detail text overlapped due to insufficient spacing

### 2. **Generic Class Names Cause Cascade Conflicts**
- `.wrap` used across homepage, shop, detail, and other pages
- `.card-config` duplicated with different purposes
- Responsive breakpoints conflicted

### 3. **Product Detail Page Structural Issues**
- Dark hero background gradient overlaid content
- Main image used `position: absolute` instead of flex centering
- Gallery lacked `max-width` caps → oversized on desktop
- Breadcrumb margin + page padding = excessive dead space (40px+ before content)
- Seller card links couldn't wrap properly

---

## Solution: Refactored SCSS Architecture

### **Principle: BEM-scoped Classes, No Global Layout Rules**

#### Before (Broken)
```scss
/* Global — affects everything */
a { white-space: nowrap; }
span, p { line-height: 1.2; }

/* Generic class — reused across pages */
.wrap { max-width: 1240px; margin: 0 auto; }

/* No namespace — scope conflicts */
.card-config { ... }
```

#### After (Fixed)
```scss
/* Global — RESET ONLY (no layout) */
a {
  white-space: normal;  /* Allow natural wrapping */
  text-decoration: none;
}

/* Scoped — page/component namespaced */
.product-detail-page {
  /* All styles nested here — no leakage */
  &__breadcrumb { line-height: 1.4; }
  &__gallery { max-width: 520px; }
  &__seller-card { /* seller card scoped to detail page */ }
}

.shop-page {
  /* Shop styles isolated */
  &__grid { ... }
  .card-config { ... }  /* card-config only here */
}
```

---

## Files Modified

### 1. **`scss/app.scss`** — Global Rule Cleanup
**Changes:**
- ✅ Changed `a { white-space: nowrap; }` → `white-space: normal;`
- ✅ REMOVED `span, p { line-height: 1.2; }`
- ✅ Added comment: "Use component-scoped classes instead"

**Why:** Global element selectors break layouts. Layout rules belong in scoped component classes.

---

### 2. **`scss/pc/homepage/homepage.scss`** — Product Detail Page Fixes

#### **Breadcrumb Section**
```scss
/* BEFORE */
&__breadcrumb {
  margin-bottom: 16px;
  /* No line-height override, inherited global 1.2 */
}

/* AFTER */
&__breadcrumb {
  margin-bottom: 12px;  /* Reduce dead space */
  line-height: 1.4;     /* Readable */

  a, span, &-current {
    white-space: normal;   /* Allow wrapping */
    word-break: break-word; /* Prevent overflow */
    line-height: 1.4;
  }
}
```

#### **Gallery Section**
```scss
/* BEFORE */
&__gallery {
  width: 100%;
  /* No max-width — image oversizes on desktop */
}

&__main-img {
  position: relative;
  /* Uses position: absolute for img — can cause overflow */
  
  img {
    position: absolute;
    inset: 0;
    object-fit: contain;
    padding: 12px;
  }
}

/* AFTER */
&__gallery {
  width: 100%;
  max-width: 520px;  /* Cap oversized images */
}

&__main-img {
  position: relative;
  display: flex;  /* Use flex instead of position: absolute */
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 12px;
    display: block;
  }
}
```

**Why:**
- Flex centering is more stable than `position: absolute; inset: 0`
- `max-width: 520px` prevents image from stretching to full viewport
- `display: flex` ensures image stays within bounds

#### **Seller Card Section**
```scss
/* BEFORE */
&__seller-card { /* No line-height override */ }
&__seller-name { /* Inherits global 1.2 */ }
&__seller-link { /* May inherit white-space: nowrap */ }

/* AFTER */
&__seller-card {
  /* Ensure seller info doesn't overlap */
}

&__seller-name {
  line-height: 1.4;
  white-space: normal;  /* Override if global leaks */
  word-break: break-word;
}

&__seller-link {
  line-height: 1.4;
  white-space: normal;
  text-decoration: none;
  
  &:hover { text-decoration: underline; }
}
```

#### **Description & Details Sections**
```scss
/* BEFORE */
&__desc {
  line-height: 1.6;
  /* span/p children inherit global 1.2 */
}

&__specs {
  /* dd elements inherit global 1.2 */
}

/* AFTER */
&__desc {
  line-height: 1.6;
  
  /* Override global rules for children */
  span, p {
    line-height: 1.6;
  }
}

&__specs {
  dt, dd {
    line-height: 1.4;
  }
}
```

#### **Mobile Layout**
```scss
/* AFTER */
.product-detail-page--mobile {
  .product-detail__sections {
    display: none;  /* Hide details/nutrition/reviews on mobile */
  }
  
  .product-detail__layout {
    grid-template-columns: 1fr;  /* Single column */
  }
}

&__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  p { line-height: 1.6; }  /* Override global */
}
```

---

## Recommended SCSS Architecture for Whole Project

### **1. File Structure**
```
scss/
├── app.scss                    # GLOBAL RESETS ONLY
├── variables.scss              # Design tokens
├── reset.scss                  # CSS reset
├── pc/
│   ├── main.scss              # Imports all pages
│   ├── common/                # Shared component styles
│   │   ├── shopProductCard.scss
│   │   └── buttons.scss
│   ├── homepage/
│   │   ├── homepage.scss      # Hero, sections
│   │   └── product-detail.scss # Product detail (MOVED from homepage.scss)
│   ├── shop/
│   │   └── shop.scss          # Shop page (no leakage to detail)
│   ├── mypage/
│   ├── community/
│   └── ... (other pages)
```

### **2. Class Naming Convention (BEM)**
```scss
/* ❌ AVOID: Generic names */
.wrap { }
.card { }
.top { }

/* ✅ USE: Page-namespaced BEM */
.product-detail-page { }
.product-detail__breadcrumb { }
.product-detail__gallery { }
.product-detail__seller-card { }

.shop-page { }
.shop-grid { }
.shop-product-card { }
```

### **3. Global Rules (ONLY in app.scss)**
```scss
/* ✅ RESET ONLY — NO LAYOUT */
a {
  text-decoration: none;
  color: inherit;
  white-space: normal;  /* Allow wrapping */
}

button {
  border: none;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
}

/* ❌ NEVER global */
span, p {
  line-height: 1.2;  /* REMOVE THIS */
}

.wrap {
  max-width: 1240px;  /* MOVE TO page-specific */
}
```

### **4. Component-Scoped Typography**
```scss
/* ✅ DO THIS */
.product-detail-page {
  &__title {
    font-size: 30px;
    line-height: 1.3;
    font-weight: 700;
  }

  &__description {
    font-size: 14px;
    line-height: 1.6;  /* Readable */
    
    span, p {
      line-height: 1.6;  /* Override global if needed */
    }
  }

  &__breadcrumb {
    font-size: 13px;
    line-height: 1.4;
    
    a {
      white-space: normal;  /* Explicit override */
      word-break: break-word;
    }
  }
}

/* ❌ DON'T DO THIS */
span {
  line-height: 1.2;  /* Affects everything */
}

a {
  white-space: nowrap;  /* Breaks all links */
}
```

### **5. Media Query Organization**
```scss
/* ✅ DO THIS — Breakpoints within component */
.product-detail-page {
  padding: 16px 0;
  
  @media (max-width: 1023px) {
    padding: 12px 0;
  }
  
  @media (max-width: 768px) {
    padding: 8px 0;
  }
  
  &__layout {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    
    @media (max-width: 1023px) {
      grid-template-columns: 1fr;
    }
  }
}
```

### **6. Avoid Style Leakage**
```scss
/* ❌ WRONG — Scope conflict */
.shop-page .card-config { /* ... */ }
.product-detail-page .card-config { /* ... */ } /* Oops! Both match */

/* ✅ RIGHT — Explicit namespacing */
.shop-page {
  &__product-card { /* ... */ }
}

.product-detail-page {
  &__seller-card { /* ... */ }
}
```

---

## Testing Checklist

After refactoring, verify:

### **Layout**
- [ ] Breadcrumb text wraps on narrow screens
- [ ] Product title wraps without overlapping image
- [ ] Seller card links don't overflow
- [ ] Product detail layout stacks on mobile
- [ ] No horizontal scrolling at any breakpoint

### **Typography**
- [ ] Paragraph text readable (line-height ≥ 1.4)
- [ ] Buttons text clear and single-line or wrapped as needed
- [ ] Breadcrumb links don't force single line
- [ ] Description text wraps naturally

### **Responsive**
- [ ] Desktop (≥1200px): 2-col layout (gallery + info)
- [ ] Laptop (992–1199px): 2-col layout
- [ ] Tablet (768–991px): 1-col stack
- [ ] Mobile (<768px): 1-col, hides detail sections

### **Design Regression**
- [ ] Colors unchanged (--np, --cb, --bd, etc.)
- [ ] Fonts unchanged (size, weight)
- [ ] Spacing tokens preserved
- [ ] No visual breaks or misalignment

---

## Common Pitfalls to Avoid

### **1. Global Element Selectors**
```scss
/* ❌ NEVER */
a { white-space: nowrap; }
p { font-size: 12px; }
span { color: gray; }

/* ✅ ALWAYS */
.breadcrumb__link { white-space: normal; }
.description__text { font-size: 14px; }
.stat__value { color: var(--t3); }
```

### **2. Generic Class Names**
```scss
/* ❌ AVOID */
.wrap { }
.container { }
.card { }
.top { }

/* ✅ USE */
.product-detail-page__wrap { }
.shop-sidebar__container { }
.product-detail__seller-card { }
.navbar__top { }
```

### **3. Cascading Line-Height**
```scss
/* ❌ WRONG */
p { line-height: 1.2; }
.description p { /* Can't override */ }

/* ✅ RIGHT */
.description {
  line-height: 1.6;
  
  p { line-height: 1.6; }  /* Explicit override */
}
```

### **4. Mixing Layout & Presentation**
```scss
/* ❌ WRONG */
a { white-space: nowrap; text-decoration: none; color: blue; }

/* ✅ RIGHT */
a {
  text-decoration: none;  /* RESET */
}

.nav__link {
  color: blue;  /* STYLE */
  white-space: normal;  /* LAYOUT OVERRIDE */
}
```

---

## Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `scss/app.scss` | Removed `a { white-space: nowrap; }` | Allows natural text wrapping |
| `scss/app.scss` | Removed `span, p { line-height: 1.2; }` | Moved to scoped classes for readability |
| `scss/pc/homepage/homepage.scss` | Added breadcrumb `line-height: 1.4` | Fix compressed text |
| `scss/pc/homepage/homepage.scss` | Added gallery `max-width: 520px` | Prevent oversized images |
| `scss/pc/homepage/homepage.scss` | Changed main-img to flex layout | Better image centering |
| `scss/pc/homepage/homepage.scss` | Added explicit line-height overrides | Override global rules in detail sections |
| `scss/pc/homepage/homepage.scss` | Added mobile detail page styles | Proper mobile layout |

---

## Next Steps

1. **Run production build** to verify no TypeScript or SCSS errors
2. **Test all breakpoints** (desktop, tablet, mobile)
3. **QA breadcrumb wrapping** at various widths
4. **Verify seller card layout** doesn't break
5. **Check text readability** in description sections
6. **Apply BEM pattern** to other pages (shop, mypage, community)
7. **Create SCSS linting rules** to prevent regressions:
   - Ban global `a`, `p`, `span` selectors
   - Require BEM naming for component classes
   - Enforce max-width caps on galleries/images

