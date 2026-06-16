import crypto from "node:crypto";

type EmailOtpPurpose = "login" | "register" | "profile_contact_update";

const OTP_LENGTH = 6;

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || process.env.RESEND_EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    throw new Error("Resend email OTP configuration is missing.");
  }

  return { apiKey, from };
}

function getOtpHashSecret() {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev_jwt_secret_change_me";
}

export function generateEmailOtp() {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

export function hashEmailOtp(email: string, otp: string) {
  return crypto.createHash("sha256").update(`${getOtpHashSecret()}::${email.toLowerCase()}::${otp}`).digest("hex");
}

function getSubject(purpose: EmailOtpPurpose) {
  if (purpose === "register") return "Your House of Eraya signup OTP";
  if (purpose === "profile_contact_update") return "Verify your House of Eraya email update";
  return "Your House of Eraya login OTP";
}

function getHeading(purpose: EmailOtpPurpose) {
  if (purpose === "register") return "Complete your House of Eraya signup";
  if (purpose === "profile_contact_update") return "Verify your updated email";
  return "Login to House of Eraya";
}

function getSupportEmail() {
  return "official.houseoferaya@gmail.com";
}

function buildHtmlEmail({
  otp,
  purpose
}: {
  otp: string;
  purpose: EmailOtpPurpose;
}) {
  const heading = getHeading(purpose);

  return `
    <div style="margin:0;padding:24px;background:#f7f3ee;font-family:Georgia,'Times New Roman',serif;color:#1f2647;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eadcc8;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(31,38,71,0.08);">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#16255f 0%,#1f327c 100%);color:#f6ead4;">
          <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;opacity:0.82;">House of Eraya</div>
          <h1 style="margin:14px 0 0;font-size:34px;line-height:1.1;font-weight:500;">${heading}</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 18px;font:16px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#4b556d;">
            Use the OTP below to continue. It is valid for the next 10 minutes.
          </p>
          <div style="margin:24px 0;padding:18px 20px;border-radius:18px;background:#f7f3ee;border:1px solid #eadcc8;text-align:center;">
            <div style="font:12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.26em;text-transform:uppercase;color:#8a6538;">One Time Password</div>
            <div style="margin-top:10px;font:600 36px/1.1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:0.32em;color:#16255f;">${otp}</div>
          </div>
          <p style="margin:0;font:14px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#6b7280;">
            If you did not request this, you can safely ignore this email.
          </p>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #f0e6d8;background:#fcfaf7;font:13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#8a6538;">
          Need help? Reach us at <a href="mailto:${getSupportEmail()}" style="color:#1f327c;text-decoration:none;">${getSupportEmail()}</a>.
        </div>
      </div>
    </div>
  `;
}

export async function sendEmailOtpViaResend(email: string, otp: string, purpose: EmailOtpPurpose) {
  const { apiKey, from } = getResendConfig();
  const subject = getSubject(purpose);
  const html = buildHtmlEmail({ otp, purpose });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html
    }),
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      (data && data.error && typeof data.error.message === "string" && data.error.message) ||
      "Failed to send OTP email.";
    throw new Error(message);
  }

  return data as Record<string, unknown>;
}
