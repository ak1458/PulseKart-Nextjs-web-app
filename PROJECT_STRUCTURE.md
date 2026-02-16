# PulseKart Project Structure

> 📚 **Guide for Interns**: This document explains how the project is organized. Read this first before making any changes.

---

## 📁 Folder Overview

```
pulse-kart/
├── app/                    # Next.js frontend pages
├── backend/                # NestJS API server
├── components/             # Reusable React components
├── context/                # React state management
├── lib/                    # Helper functions & utilities
├── public/                 # Static assets (images, fonts)
├── docs/                   # API docs & schemas
└── scripts/                # Build & deployment scripts
```

---

## 🎨 Frontend (Next.js)

### `app/` - Page Routes
| Folder | Purpose | Example URL |
|--------|---------|-------------|
| `page.tsx` | Home page | `/` |
| `shop/` | Product listing | `/shop` |
| `product/[slug]/` | Product detail | `/product/aspirin` |
| `login/`, `signup/` | Auth pages | `/login`, `/signup` |
| `dashboard/` | User account | `/dashboard` |
| `admin/` | Admin panel | `/admin` |
| `api/` | API routes (serverless) | `/api/ai/chat` |

**Rule**: Each folder with `page.tsx` = One route

### `components/` - Reusable UI
```
components/
├── ui/              # Basic UI (buttons, cards, inputs)
├── layout/          # Layout parts (Navbar, Footer)
├── auth/            # Auth-related (AuthMiddleware)
└── admin/           # Admin-specific components
```

**When to use**: If a UI element appears in 2+ places, make it a component here.

### `context/` - Global State
| File | Purpose |
|------|---------|
| `AuthContext.tsx` | User login/logout state |
| `CartContext.tsx` | Shopping cart state |

**Rule**: Use context for data needed across many components.

### `lib/` - Utilities
| File | Purpose |
|------|---------|
| `api.ts` | API URL helper |
| `icons.tsx` | All icon exports |
| `utils.ts` | Helper functions |
| `constants.ts` | Shared constants |

---

## ⚙️ Backend (NestJS)

### `backend/src/` - API Structure
```
backend/src/
├── auth/           # Login, JWT, guards
├── users/          # User management
├── products/       # Products & inventory
├── orders/         # Order processing
├── payments/       # Payment handling
├── coupons/        # Discount codes
├── reports/        # Analytics & reports
├── database/       # DB connection & seeds
└── main.ts         # App entry point
```

### Key Backend Files
| File | Purpose |
|------|---------|
| `*.controller.ts` | API endpoints (routes) |
| `*.service.ts` | Business logic |
| `*.module.ts` | Feature module |
| `*.entity.ts` | Database models |
| `*.dto.ts` | Request/response shapes |

---

## 🔧 Configuration Files

| File | Purpose | Intern Notes |
|------|---------|--------------|
| `.env.local` | Frontend secrets | Never commit real values |
| `backend/.env` | Backend secrets | Never commit real values |
| `next.config.ts` | Next.js settings | Don't change without asking |
| `docker-compose.yml` | Local database | Use for local dev only |
| `package.json` | Dependencies | Run `npm install` after pulling |

---

## 🚀 Common Tasks for Interns

### Add a New Page
1. Create folder in `app/your-page/`
2. Add `page.tsx` with default export
3. Add to `components/layout/Navbar.tsx` if needed

### Add a New API Endpoint
1. Find or create module in `backend/src/`
2. Add endpoint to `*.controller.ts`
3. Add logic to `*.service.ts`
4. Test with Postman or frontend

### Add a New Component
1. Create file in `components/ui/` or appropriate folder
2. Export component as default
3. Import where needed

### Styling Guidelines
- Use Tailwind classes (e.g., `className="bg-teal-500 p-4"`)
- Dark theme colors: `bg-[#030712]`, `text-white`
- Brand color: `teal-400`, `teal-500`, `emerald-500`

---

## ❌ Things NOT to Touch

| File/Folder | Why |
|-------------|-----|
| `node_modules/` | Auto-generated, huge |
| `.next/` | Build output |
| `package-lock.json` | Auto-generated |
| `tsconfig.json` | Build config |
| `.git/` | Git history |

---

## 🆘 Getting Help

1. Check this file first
2. Look at existing code for patterns
3. Ask in team chat with:
   - What you're trying to do
   - What you tried
   - Error message (if any)

---

## 📖 Additional Docs

- `README.md` - Project overview
- `CONTRIBUTING.md` - How to contribute
- `docs/openapi.yaml` - API documentation
