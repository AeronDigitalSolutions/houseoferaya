type TwilioBalanceResponse = {
  balance?: string;
  currency?: string;
  account_sid?: string;
};

type TwilioAccountResponse = {
  sid?: string;
  friendly_name?: string;
  status?: string;
  type?: string;
};

function getTwilioAccountConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken) {
    throw new Error("Twilio account credentials are missing.");
  }

  return {
    accountSid,
    authToken,
    verifyServiceSid: verifyServiceSid || null
  };
}

async function twilioGet<T>(path: string): Promise<T> {
  const { accountSid, authToken } = getTwilioAccountConfig();
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`
    },
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) || "Unable to fetch Twilio account data.";
    throw new Error(message);
  }

  return data as T;
}

export async function fetchTwilioAdminSummary() {
  const { accountSid, verifyServiceSid } = getTwilioAccountConfig();

  const [balance, account] = await Promise.all([
    twilioGet<TwilioBalanceResponse>("/Balance.json"),
    twilioGet<TwilioAccountResponse>(".json")
  ]);

  return {
    accountSid,
    verifyServiceSid,
    balance: Number(balance.balance || 0),
    currency: String(balance.currency || "USD"),
    friendlyName: account.friendly_name || "Twilio Account",
    status: account.status || "unknown",
    type: account.type || "unknown"
  };
}
