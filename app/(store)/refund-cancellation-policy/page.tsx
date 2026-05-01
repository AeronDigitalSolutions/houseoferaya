import { PolicyPageLayout } from "@/components/PolicyPageLayout";

export default function RefundCancellationPolicyPage() {
  return (
    <PolicyPageLayout
      title="Return and Refund Policy"
      effectiveDate="[Insert Date]"
      sections={[
        {
          heading: "Overview",
          body: "At House of Eraya, we strive to ensure every purchase brings joy. This policy is designed to be transparent and straightforward for a seamless customer experience."
        },
        {
          heading: "1. Return Window",
          body: "We offer a [Insert, e.g., 10-Day] Return Policy. Return requests must be initiated within [Insert Number] days from delivery date. Requests beyond this period are not eligible."
        },
        {
          heading: "2. Conditions for Return",
          body: "Eligible returns must be unworn and in original condition, with original packaging, tags, labels, and authenticity certificates intact. Security tags must remain untampered. Order number or invoice is required as proof of purchase."
        },
        {
          heading: "3. Non-Returnable Items",
          body: "Personalized jewelry, custom-sized items, and earrings are generally non-returnable unless defective or damaged on arrival."
        },
        {
          heading: "4. Return Process",
          body: "Email support at official.houseoferayya@gmail.com with order number, item details, and reason. After approval, follow return instructions and shipping label guidance. Items are quality-inspected on receipt before refund/exchange resolution."
        },
        {
          heading: "5. Refund Policy",
          body: "Refunds are credited to the original payment method. After approval, allow [Insert, e.g., 7-10] business days for reflection, depending on your financial institution. Shipping fee policy: [Return shipping covered by House of Eraya OR deduction of flat shipping fee]."
        },
        {
          heading: "6. Damaged or Incorrect Items",
          body: "If received item is damaged, defective, or incorrect, notify us within 48 hours of delivery with clear item and packaging photos. We will prioritize replacement or full refund at no additional cost."
        },
        {
          heading: "7. Cancellations",
          body: "Orders may be canceled only before shipment. Once dispatched, cancellation is not possible and must follow return process after delivery."
        },
        {
          heading: "Contact Us",
          body: "Customer Support Email: official.houseoferayya@gmail.com, Customer Support Phone: +91-7889072256, Support Hours: [Insert Operating Hours]."
        }
      ]}
    />
  );
}
