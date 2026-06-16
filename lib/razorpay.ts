import crypto from "node:crypto";
import Razorpay from "razorpay";

let razorpayClient: Razorpay | null = null;

function getFirstNonEmptyEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

type RazorpayConfig = {
  keyId: string;
  keySecret: string;
};

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = getFirstNonEmptyEnv([
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEYID",
    "RAZORPAY_API_KEY",
    "NEXT_PUBLIC_RAZORPAY_KEY_ID"
  ]);
  const keySecret = getFirstNonEmptyEnv(["RAZORPAY_KEY_SECRET", "RAZORPAY_SECRET", "RAZORPAY_API_SECRET"]);

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId, keySecret };
}

export function isRazorpayConfigured() {
  return Boolean(getRazorpayConfig());
}

export function getRazorpayPublicKeyId() {
  return (
    getFirstNonEmptyEnv(["RAZORPAY_KEY_ID", "RAZORPAY_KEYID", "RAZORPAY_API_KEY", "NEXT_PUBLIC_RAZORPAY_KEY_ID"]) ||
    null
  );
}

export function getRazorpayClient() {
  const config = getRazorpayConfig();

  if (!config) {
    throw new Error("Razorpay credentials are missing.");
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret
    });
  }

  return razorpayClient;
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const config = getRazorpayConfig();
  if (!config) {
    throw new Error("Razorpay secret is missing.");
  }

  const generated = crypto
    .createHmac("sha256", config.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generated === signature;
}
