# Jewelry Ecommerce Platform Scaffold

Production-friendly architecture scaffold for a jewelry ecommerce platform using:
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM + MySQL
- API route placeholders for cart, checkout, payment, shipping, product, and order flows

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

## Folder Structure

```text
app/
  (store)/                # Public storefront + account pages
  admin/                  # Admin routes
  api/                    # API route handlers
components/               # Reusable UI building blocks
lib/                      # Shared types, mock data, helpers, prisma client
prisma/
  schema.prisma
  seed.ts
```

## Environment Variables

Required keys:
- `DATABASE_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SHIPPING_API_KEY`
- `SHIPPING_API_SECRET`

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
