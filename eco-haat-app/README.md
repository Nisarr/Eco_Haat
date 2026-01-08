# 🌿 Eco Haat - Next.js PWA

An eco-friendly multi-vendor marketplace built with Next.js 14+, Tailwind CSS, Framer Motion, and Supabase.

## Features

### 👥 Role-Based Access
- **Buyers** - Browse, cart, and checkout eco-friendly products
- **Sellers** - Add products, track approval status, view orders
- **Admins** - Approve/reject products with eco-rating (0-100%)

### 🛍️ Marketplace
- Beautiful green/eco theme with premium animations
- Product filtering by material type
- Eco-friendliness rating display on all products
- Shopping cart and checkout flow

### 🎨 Design
- Framer Motion animations throughout
- Mobile-first responsive design
- PWA support

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database/Auth**: Supabase
- **Icons**: Lucide React

## Getting Started

### 1. Install Dependencies
```bash
cd eco-haat-app
npm install
```

### 2. Configure Supabase
Copy `env.example` to `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Database
Run the SQL in `../database/schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
app/
├── (auth)/          # Login, Register pages
├── (shop)/          # Products, Cart, Checkout
├── admin/           # Admin dashboard & moderation
├── seller/          # Seller dashboard & products
├── layout.tsx       # Root layout with Navbar/Footer
└── page.tsx         # Homepage

components/
├── ui/              # Button, Card, Input, Badge
├── layout/          # Navbar, Footer
└── products/        # Product cards

lib/
└── supabase/        # Client, Server, Middleware
```

## Deployment

### Vercel
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

---
Made with 💚 for a greener planet
