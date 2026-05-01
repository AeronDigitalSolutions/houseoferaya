import { PolicyPageLayout } from "@/components/PolicyPageLayout";

export default function ShippingDeliveryPolicyPage() {
  return (
    <PolicyPageLayout
      title="Shipping Policy for House of Eraya"
      effectiveDate="[Insert Date]"
      sections={[
        {
          heading: "Overview",
          body: "At House of Eraya, we are committed to ensuring your jewelry reaches you safely, securely, and in pristine condition."
        },
        {
          heading: "1. Processing Time",
          body: "Ready-to-Ship items are typically processed and dispatched within [e.g., 24-48 hours] after payment confirmation. Custom/Made-to-Order items may require [e.g., 7-15 working days] for production before dispatch."
        },
        {
          heading: "2. Shipping Charges",
          body: "Domestic shipping within India is [Free Standard Shipping / Flat Rate Shipping of ₹XXX]. We partner with reliable premium courier services for secure handling."
        },
        {
          heading: "3. Delivery Timeline",
          body: "After dispatch, estimated delivery is usually [3-5] working days for metros and [5-8] working days for non-metros/remote locations. Timelines may vary due to weather, holidays, or other external factors."
        },
        {
          heading: "4. Secure Packaging and Insurance",
          body: "All orders are packed in tamper-proof discreet packaging. Every shipped item is fully insured against theft, loss, or transit damage until delivery at your provided address."
        },
        {
          heading: "5. Tracking Your Order",
          body: "Once shipped, tracking details are shared via email and/or SMS with tracking number and tracking link."
        },
        {
          heading: "6. Delivery Protocol",
          body: "A delivery signature/proof of delivery may be required for security. If unavailable at delivery time, courier partners may attempt delivery multiple times."
        },
        {
          heading: "7. Address Changes",
          body: "For address updates, contact support at official.houseoferayya@gmail.com as early as possible. Address changes can be accommodated only if the order is not yet dispatched."
        },
        {
          heading: "8. Damaged on Arrival",
          body: "If a package appears tampered or damaged, do not accept delivery and contact support immediately. If already accepted, keep original packaging, take photos, and email official.houseoferayya@gmail.com within 24 hours."
        },
        {
          heading: "Contact Our Shipping Team",
          body: "Email: official.houseoferayya@gmail.com, Phone: +91-7889072256, Operating Hours: [Insert Timings]."
        }
      ]}
    />
  );
}
