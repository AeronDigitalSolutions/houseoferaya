const OUNCE_TO_GRAM = 31.1034768;
const USD_INR = 83;

type GoldApiResponse = {
  price?: number;
  currency?: string;
  timestamp?: number;
  updatedAt?: string;
};

export type LiveMetalRate = {
  symbol: "XAU" | "XAG";
  metal: "Gold" | "Silver";
  liveRatePerGram: number;
  unit: "gram";
  updatedAt: string;
};

export type LiveRatesPayload = {
  source: string;
  currency: "INR";
  rates: {
    gold: LiveMetalRate;
    silver: LiveMetalRate;
  };
};

async function fetchGoldApiRaw(symbol: "XAU" | "XAG"): Promise<GoldApiResponse> {
  const candidateUrls = [
    `https://api.gold-api.com/price/${symbol}/INR`,
    `https://api.gold-api.com/price/${symbol}`
  ];

  let lastError: unknown;
  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        lastError = new Error(`gold-api response ${response.status} for ${url}`);
        continue;
      }
      return (await response.json()) as GoldApiResponse;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Unable to fetch ${symbol} from gold-api.com`);
}

function parseLiveRate(symbol: "XAU" | "XAG", payload: GoldApiResponse): LiveMetalRate {
  if (typeof payload.price !== "number" || !Number.isFinite(payload.price) || payload.price <= 0) {
    throw new Error(`Invalid ${symbol} price from gold-api.com`);
  }

  const currency = String(payload.currency || "USD").toUpperCase();
  const pricePerOunceInInr = currency === "INR" ? payload.price : payload.price * USD_INR;
  const liveRatePerGram = Number((pricePerOunceInInr / OUNCE_TO_GRAM).toFixed(2));

  return {
    symbol,
    metal: symbol === "XAU" ? "Gold" : "Silver",
    liveRatePerGram,
    unit: "gram",
    updatedAt:
      payload.updatedAt ||
      (payload.timestamp ? new Date(payload.timestamp * 1000).toISOString() : new Date().toISOString())
  };
}

export async function fetchLiveMetalRates(): Promise<LiveRatesPayload> {
  const [goldRaw, silverRaw] = await Promise.all([fetchGoldApiRaw("XAU"), fetchGoldApiRaw("XAG")]);
  const gold = parseLiveRate("XAU", goldRaw);
  const silver = parseLiveRate("XAG", silverRaw);

  return {
    source: "gold-api.com",
    currency: "INR",
    rates: { gold, silver }
  };
}

