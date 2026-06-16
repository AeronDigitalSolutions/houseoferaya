"use server";

function getTwilioVerifyConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    throw new Error("Twilio Verify credentials are missing.");
  }

  return {
    accountSid,
    authToken,
    verifyServiceSid
  };
}

function toTwilioPhone(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("+")) return trimmed;

  const digitsOnly = trimmed.replace(/\D+/g, "");
  if (digitsOnly.length === 10) return `+91${digitsOnly}`;
  if (digitsOnly.length >= 11 && digitsOnly.length <= 15) return `+${digitsOnly}`;
  return trimmed;
}

async function callTwilioVerify(endpoint: string, payload: URLSearchParams) {
  const { accountSid, authToken } = getTwilioVerifyConfig();
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(`https://verify.twilio.com/v2${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload.toString(),
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      (data && typeof data.detail === "string" && data.detail) ||
      "Twilio verification request failed.";
    const error = new Error(message) as Error & { status?: number; code?: number };
    error.status = response.status;
    error.code = typeof data?.code === "number" ? data.code : undefined;
    throw error;
  }

  return data as Record<string, unknown>;
}

export async function sendPhoneOtpViaTwilio(phone: string) {
  const { verifyServiceSid } = getTwilioVerifyConfig();
  const payload = new URLSearchParams({
    To: toTwilioPhone(phone),
    Channel: "sms"
  });

  return callTwilioVerify(`/Services/${verifyServiceSid}/Verifications`, payload);
}

export async function verifyPhoneOtpViaTwilio(phone: string, code: string) {
  const { verifyServiceSid } = getTwilioVerifyConfig();
  const payload = new URLSearchParams({
    To: toTwilioPhone(phone),
    Code: code
  });

  const result = await callTwilioVerify(`/Services/${verifyServiceSid}/VerificationCheck`, payload);
  return String(result.status || "").toLowerCase() === "approved";
}
