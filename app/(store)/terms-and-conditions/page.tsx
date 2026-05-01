import { PolicyPageLayout } from "@/components/PolicyPageLayout";

export default function TermsAndConditionsPage() {
  return (
    <PolicyPageLayout
      title="Terms and Conditions for House of Eraya"
      effectiveDate="[Insert Date]"
      sections={[
        {
          heading: "Welcome",
          body: "Welcome to the House of Eraya website. By accessing or shopping at our website, you agree to be bound by these terms and conditions. Please read them carefully."
        },
        {
          heading: "1. Acceptance of Terms",
          body: "By using this website, you confirm that you are at least 18 years of age or accessing this site under the supervision of a parent or guardian. You agree to use this site strictly for personal and non-commercial purposes."
        },
        {
          heading: "2. Product Descriptions and Representations",
          body: "House of Eraya is committed to providing high-quality jewelry. Our 18k/9k Gold and Diamond products are hallmarked and/or certified by reputable laboratories. We make every effort to display products accurately, but actual color, texture, and size may vary slightly due to screens and lighting. In case of typographical errors in pricing or product information, we reserve the right to refuse or cancel affected orders."
        },
        {
          heading: "3. Pricing and Market Fluctuations",
          body: "Gold and diamond jewelry prices may change with market fluctuations. We reserve the right to update prices without prior notice based on daily gold rate changes. The final amount payable is the price shown at the time of order confirmation."
        },
        {
          heading: "4. Orders and Payments",
          body: "Your order is an offer to buy. An order confirmation email does not imply final acceptance. We may accept or decline orders due to stock, payment authorization, or other operational reasons. Payments are processed through secure encrypted gateways, and financial data is not stored on our servers."
        },
        {
          heading: "5. Shipping and Delivery",
          body: "All shipments of gold and diamond jewelry are fully insured by House of Eraya until delivered to your address. We aim to dispatch within [Insert Timeframe, e.g., 3-5 business days], but delays by third-party logistics providers may occur. A valid delivery signature may be required for high-value shipments."
        },
        {
          heading: "6. Return and Exchange Policy",
          body: "Returns or exchanges must be initiated within [Insert Number, e.g., 7-15] days of delivery, with item unworn, in original condition, and with all tags/certificates intact. Personalized/customized items are generally non-returnable unless defective or damaged. All returns are subject to quality inspection before refund or exchange processing."
        },
        {
          heading: "7. Intellectual Property",
          body: "All content on this website, including jewelry designs, photography, text, logos, and graphics, is the property of House of Eraya and cannot be reproduced or used without express written permission."
        },
        {
          heading: "8. Limitation of Liability",
          body: "To the fullest extent permitted by law, House of Eraya is not liable for indirect, incidental, or consequential damages arising from website or product use. Total liability will not exceed the price paid for the product in question."
        },
        {
          heading: "9. User Account Responsibilities",
          body: "If you create an account, you are responsible for maintaining the confidentiality of your password and all activities under your account."
        },
        {
          heading: "10. Governing Law",
          body: "These terms are governed by the laws of [Your Country/State, e.g., India]. Disputes shall be subject to exclusive jurisdiction of the courts in [Your City]."
        },
        {
          heading: "11. Changes to Terms",
          body: "We may update these Terms and Conditions at any time. Changes become effective immediately upon posting. Continued website use indicates acceptance of updated terms."
        },
        {
          heading: "12. Contact Us",
          body: "For any questions regarding these terms, contact us at Customer Support Email: official.houseoferayya@gmail.com, Customer Support Phone: +91-7889072256, Operating Hours: [Insert Timings]."
        }
      ]}
    />
  );
}
