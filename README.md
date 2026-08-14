# ML Studio — E-Commerce Bag Store

A React + Vite e-commerce web application for ML Studio, a premium bag store. Built with Supabase for authentication, order persistence, and contact form storage.

## Tech Stack

- **Frontend:** React 19, React Router, Bootstrap 5
- **Build Tool:** Vite
- **Backend/Auth:** Supabase (PostgreSQL + Auth + RLS)
- **Linting:** Oxlint

## Features

- Product catalog with category filtering
- Product detail pages with related products
- Shopping cart with localStorage + Supabase sync for logged-in users
- Checkout flow with shipping form and order summary
- Order persistence to Supabase (with order history for logged-in users)
- Contact form that stores messages in Supabase
- User authentication (sign up / sign in / sign out)
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase project (free tier works fine)

### Installation

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Run the Supabase schema setup:
   - Open `supabase-schema.sql` in your Supabase SQL Editor
   - Run the script to create the `orders`, `contact_messages`, and `user_carts` tables with RLS policies

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
  components/     # Navbar, Footer, Layout, CartOffcanvas, LoginModal, ScrollToTop
  context/        # AuthContext, CartContext
  data/           # Shared products data (products.js)
  lib/            # Supabase client
  pages/          # Home, Products, ProductDetails, About, Contact, Checkout, Orders
  assets/         # Images, CSS
public/           # Static assets (product images, logos, vendor files)
```

## Available Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run lint`  | Run Oxlint               |
| `npm run preview` | Preview production build |

## Database Schema

The app uses three Supabase tables:

- **`orders`** — Stores placed orders (items, total, shipping info, status)
- **`contact_messages`** — Stores contact form submissions
- **`user_carts`** — Syncs cart state for logged-in users across devices

All tables use Row Level Security (RLS) for data protection.

## Notes

- This is a school project — payment integration (e.g., Stripe) is not implemented. Orders are recorded as "pending" in the database.
- Product images are stored in `public/images/products/`.
- Guest users can place orders and use the contact form without signing in.
