# Jewelry Ecommerce Platform Scaffold

Production-friendly architecture scaffold for a jewelry ecommerce platform using:
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL
- API route placeholders for cart, checkout, payment, shipping, product, and order flows
- JWT auth + OTP (demo) flow for customer dashboard

All content is placeholder-only and ready to replace.

## Quick Setup

1. Install dependencies
```bash
npm install
```

2. Configure environment variables
```bash
cp .env.example .env
```
Update values in `.env`.

3. Generate Prisma client
```bash
npm run db:generate
```

4. Run migrations
```bash
npm run db:migrate -- --name init
```

5. Seed sample jewelry data
```bash
npm run db:seed
```

6. Run development server
```bash
npm run dev
```

Note:
- `npm run dev` uses a stable launcher that clears stale Next.js dev cache and frees port `3000` automatically to prevent recurring "Internal Server Error" after UI edits.
- If needed, you can still run plain webpack mode with:
```bash
npm run dev:webpack
```

## Folder Structure

```text
app/
  (store)/                # Public storefront + account pages
  admin/                  # Admin routes
  api/                    # API route handlers
components/               # Reusable UI building blocks
lib/                      # Shared types, mock data, helpers, prisma client
public/
  uploads/
    products/             # Admin-uploaded product images
prisma/
  schema.prisma
  seed.ts
```

## Environment Variables

Required keys:
- `DATABASE_URL`
- `BACKEND_API_ORIGIN` (optional, used when frontend is deployed separately and should proxy `/api/*` to remote backend)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SHIPPING_API_KEY`
- `SHIPPING_API_SECRET`
- `JWT_SECRET`
- `DUMMY_OTP`

## Vercel Frontend + Hostinger Backend Setup

If frontend is on Vercel and backend is on Hostinger, configure this in Vercel:

1. Set environment variable:
   - `BACKEND_API_ORIGIN=https://api.yourdomain.com`
2. Redeploy frontend on Vercel.

What happens:
- Frontend keeps calling relative paths like `/api/...`.
- Next.js rewrite in `next.config.js` proxies those calls to:
  - `https://api.yourdomain.com/api/...`
- No frontend code changes needed for API URLs.

Notes:
- Leave `BACKEND_API_ORIGIN` empty for local monorepo mode.
- Keep HTTPS enabled on Hostinger backend domain.
- If backend sets auth cookies, use secure cookie settings compatible with production HTTPS.

## Routes Implemented

Public storefront and policies:
- `/collections`
- `/collections/[slug]`
- `/products/[slug]`
- `/cart`
- `/checkout`
- `/order-confirmation/[orderId]`
- `/track-order`
- `/track-order/[orderId]`
- `/wishlist`
- `/login`
- `/signup`
- `/about-us`
- `/contact-us`
- `/terms-and-conditions`
- `/privacy-policy`
- `/refund-cancellation-policy`
- `/shipping-delivery-policy`

Account area:
- `/account/profile`
- `/account/addresses`
- `/account/orders`
- `/account/orders/[orderId]`

Admin area:
- `/admin`
- `/admin/products`
- `/admin/orders`
- `/admin/shipments`
- `/admin/payments`
- `/admin/customers`

## API Placeholder Endpoints

- `POST /api/cart/add`
- `POST /api/cart/update`
- `POST /api/cart/remove`
- `POST /api/checkout/create-order`
- `POST /api/payment/razorpay/create-order`
- `POST /api/payment/razorpay/verify`
- `POST /api/shipping/check-pincode`
- `POST /api/shipping/create-shipment`
- `GET /api/shipping/track/[orderId]`
- `GET /api/products`
- `GET /api/products/[slug]`
- `GET /api/orders`
- `GET /api/orders/[orderId]`
- `GET /api/admin/product-images?productSlug=<slug>`
- `POST /api/admin/product-images` (form-data: `productSlug`, `file`, optional `fileName`)
- `DELETE /api/admin/product-images?productSlug=<slug>&fileName=<name>`

Auth and account endpoints:
- `POST /api/auth/register/initiate`
- `POST /api/auth/register/verify`
- `POST /api/auth/login/initiate`
- `POST /api/auth/login/verify`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/account/profile`
- `PUT /api/account/profile`
- `GET /api/account/addresses`
- `POST /api/account/addresses`
- `PUT /api/account/addresses/[addressId]`
- `DELETE /api/account/addresses/[addressId]`
- `GET /api/account/orders`
- `GET /api/account/orders/[orderId]`
- `GET /api/account/wishlist`
- `POST /api/account/wishlist/items`
- `DELETE /api/account/wishlist/items/[itemId]`

## Reusable Components

- `Header`
- `Footer`
- `ProductCard`
- `ProductGrid`
- `CollectionCard`
- `CartItem`
- `OrderSummary`
- `AddressForm`
- `CheckoutForm`
- `PolicyPageLayout`
- `AccountSidebar`
- `AdminSidebar`
- `StatusBadge`
- `TrackingTimeline`
- `EmptyState`
- `LoadingState`

## Prisma Models

Included schema models:
- `User`
- `Address`
- `Category`
- `Product`
- `ProductImage`
- `ProductVariant`
- `Cart`
- `CartItem`
- `Wishlist`
- `WishlistItem`
- `Order`
- `OrderItem`
- `Payment`
- `Shipment`
- `Coupon`
- `Review`
- `AdminUser`

## Suggested Next Steps

- Plug real authentication (NextAuth or custom credential flow)
- Add form validation and server actions
- Replace mock data with Prisma-backed queries
- Add Razorpay signature verification and webhook handling
- Connect shipping partner APIs (Shiprocket/Delhivery)
- Add automated tests (unit + integration + e2e)
