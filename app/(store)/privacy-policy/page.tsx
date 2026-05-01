import { PolicyPageLayout } from "@/components/PolicyPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageLayout
      title="Privacy Policy for House of Eraya"
      effectiveDate="[Insert Date]"
      sections={[
        {
          heading: "Introduction",
          body: "At House of Eraya, protecting your privacy is a priority. This policy explains how we collect, use, store, and safeguard personal information when you browse or purchase from our website."
        },
        {
          heading: "1. Information We Collect",
          body: "We collect personal identification data (name, email, phone, shipping/billing address), transaction data (purchase details and preferences), technical data (IP, browser, device, site interaction), and cookies for personalization and performance."
        },
        {
          heading: "2. How We Use Your Information",
          body: "Your data is used for order fulfillment, customer communication, marketing and personalization (with consent), and security/fraud prevention."
        },
        {
          heading: "3. Data Sharing and Disclosure",
          body: "We do not sell personal data. We share data only with trusted service providers such as logistics, payment processors, hosting/IT providers, and when required by law or valid legal requests."
        },
        {
          heading: "4. Security Measures",
          body: "We use SSL encryption, access controls, and secure payment gateway practices. Sensitive payment information is not stored insecurely on our servers."
        },
        {
          heading: "5. Your User Rights",
          body: "You may request access/correction of your data, deletion (subject to legal retention), and opt out of marketing at any time via unsubscribe links or direct contact."
        },
        {
          heading: "6. Children's Privacy",
          body: "Our services are not directed to children under 18. We do not knowingly collect data from minors. Contact us if you believe such data was collected, so we can remove it."
        },
        {
          heading: "7. Changes to This Policy",
          body: "We may update this Privacy Policy from time to time. Significant updates will be posted on this page with revised effective date."
        },
        {
          heading: "8. Contact Us",
          body: "Email: official.houseoferayya@gmail.com, Phone: +91-7889072256, Address: Plot no-252, Varanasi Enclave Colony, P.O.- Bhullanpur, Marhauli, Varanasi (U.P) 221108"
        }
      ]}
    />
  );
}
