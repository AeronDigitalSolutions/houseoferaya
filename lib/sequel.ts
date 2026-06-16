import { Prisma, ShippingStatus } from "@prisma/client";
import type { TimelineEvent } from "@/lib/types";

type SequelTrackingEvent = {
  description?: string | null;
  location?: string | null;
  date_time?: string | null;
  code?: string | null;
};

type SequelTrackingData = {
  docket_no?: string;
  docket_number?: string;
  docketNumber?: string;
  requestID?: string;
  estimated_delivery?: string;
  estiimated_delivery?: string;
  tracking_link?: string;
  shipment_status?: string | null;
  tracking?: SequelTrackingEvent[];
  sender_store_code?: string;
  receiver_store_code?: string;
  [key: string]: unknown;
};

type SequelApiResponse<T = Record<string, unknown>> = {
  status: string | boolean;
  message?: string;
  errorInfo?: unknown;
  data?: T;
};

type SequelConfig = {
  baseUrl: string;
  token: string;
  fromStoreCode: string;
  location: string;
  shipmentType: string;
  serviceTypeGold: string;
  serviceTypeSilver: string;
};

type CreateShipmentInput = {
  consigneeName: string;
  addressLine1: string;
  addressLine2?: string | null;
  pinCode: string;
  receiverName: string;
  receiverPhone: string;
  netWeight: number;
  grossWeight?: number | null;
  netValue: number;
  invoiceNumbers?: string[];
  remark?: string | null;
  pickUpDate?: string | null;
  pickUpTime?: string | null;
  codValue?: number | null;
  isSilverShipment?: boolean;
};

function cleanBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function parseMaybeNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getFirstNonEmptyEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

export function getSequelConfig(): SequelConfig | null {
  const baseUrl = getFirstNonEmptyEnv(["SEQUEL_API_BASE_URL", "SEQUEL_ENDPOINT", "END_POINT"]);
  const token = getFirstNonEmptyEnv(["SEQUEL_API_TOKEN", "SEQUEL_TOKEN", "API_TOKEN"]);
  const fromStoreCode = getFirstNonEmptyEnv(["SEQUEL_FROM_STORE_CODE", "SEQUEL_STORE_CODE", "STORE_CODE", "ADDRESS_CODE"]);

  if (!baseUrl || !token || !fromStoreCode) {
    return null;
  }

  return {
    baseUrl: cleanBaseUrl(baseUrl),
    token,
    fromStoreCode,
    location: process.env.SEQUEL_LOCATION?.trim() || "domestic",
    shipmentType: process.env.SEQUEL_SHIPMENT_TYPE?.trim() || "D&J",
    serviceTypeGold: process.env.SEQUEL_SERVICE_TYPE_GOLD?.trim() || "valuable",
    serviceTypeSilver: process.env.SEQUEL_SERVICE_TYPE_SILVER?.trim() || "vulnerable"
  };
}

export function isSequelConfigured() {
  return Boolean(getSequelConfig());
}

class SequelApiError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "SequelApiError";
    this.details = details;
  }
}

async function sequelPost<T = Record<string, unknown>>(path: string, payload: Record<string, unknown>) {
  const config = getSequelConfig();
  if (!config) {
    throw new SequelApiError("Sequel shipping API is not configured.");
  }

  const response = await fetch(`${config.baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify({ token: config.token, ...payload })
  });

  const text = await response.text();
  let data: SequelApiResponse<T> | null = null;

  try {
    data = text ? (JSON.parse(text) as SequelApiResponse<T>) : null;
  } catch {
    throw new SequelApiError(`Sequel returned a non-JSON response for ${path}.`, text);
  }

  if (!response.ok) {
    throw new SequelApiError(data?.message || `Sequel request failed for ${path}.`, data);
  }

  if (!data || data.status === false || data.status === "false") {
    throw new SequelApiError(data?.message || `Sequel request failed for ${path}.`, data?.errorInfo || data);
  }

  return data;
}

export async function checkSequelServiceability(pinCode: string) {
  return sequelPost<{
    city?: string;
    hub?: string;
    state?: string;
    region?: string;
    Tier_Classification?: string;
    First_Call_Time?: string;
    Last_Call_Time?: string;
    Last_Pickup_Time?: string;
    Pickup_Availability?: string;
    Delivery_Availability?: string;
    is_ecom_cod_allowed?: string;
    is_ecom_rto_allowed?: string;
  }>("/api/checkServiceability", {
    pin_code: pinCode
  });
}

export async function calculateSequelEdd(originPincode: string, destinationPincode: string, pickupDate: string) {
  return sequelPost<{ estimated_delivery?: string; estimated_day?: string }>("/api/shipment/calculateEDD", {
    origin_pincode: originPincode,
    destination_pincode: destinationPincode,
    pickup_date: pickupDate
  });
}

export async function createSequelShipment(input: CreateShipmentInput) {
  const config = getSequelConfig();
  if (!config) {
    throw new SequelApiError("Sequel shipping API is not configured.");
  }

  const payload: Record<string, unknown> = {
    location: config.location,
    shipmentType: config.shipmentType,
    serviceType: input.isSilverShipment ? config.serviceTypeSilver : config.serviceTypeGold,
    fromStoreCode: config.fromStoreCode,
    toAddress: {
      consignee_name: input.consigneeName,
      address_line1: input.addressLine1,
      address_line2: input.addressLine2 || "-",
      pinCode: input.pinCode,
      auth_receiver_name: input.receiverName,
      auth_receiver_phone: input.receiverPhone
    },
    net_weight: String(input.netWeight),
    gross_weight: String(input.grossWeight ?? input.netWeight),
    net_value: String(input.netValue),
    no_of_packages: "1"
  };

  if (input.codValue && input.codValue > 0) {
    payload.codValue = String(input.codValue);
  }

  if (input.pickUpDate) {
    payload.pickUpDate = input.pickUpDate;
  }

  if (input.pickUpTime) {
    payload.pickUpTime = input.pickUpTime;
  }

  if (input.invoiceNumbers?.length) {
    payload.invoice = input.invoiceNumbers;
  }

  if (input.remark) {
    payload.remark = input.remark;
  }

  return sequelPost<SequelTrackingData>("/api/shipment/create", payload);
}

export async function trackSequelShipment(docket: string) {
  return sequelPost<SequelTrackingData>("/api/track", {
    docket
  });
}

export function mapSequelShipmentStatus(statusCode?: string | null): ShippingStatus {
  switch ((statusCode || "").toUpperCase()) {
    case "SDELVD":
      return "DELIVERED";
    case "SCANCELLED":
      return "RETURNED";
    case "SPU":
    case "SCHECKIN":
    case "SLINREC":
    case "SLINORIN":
    case "SLINDEST":
    case "SDELASN":
      return "IN_TRANSIT";
    case "SCREATED":
      return "READY_TO_SHIP";
    default:
      return "READY_TO_SHIP";
  }
}

export function parseSequelDate(value?: string | null): Date | null {
  if (!value) return null;

  const isoLike = new Date(value);
  if (!Number.isNaN(isoLike.getTime())) {
    return isoLike;
  }

  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) {
    return null;
  }

  const [, day, month, year, hour = "00", minute = "00", second = "00"] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimelineTimestamp(value?: string | null) {
  if (!value) return "Pending";
  const parsed = parseSequelDate(value);
  if (!parsed) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

export function buildSequelTimeline(tracking: SequelTrackingEvent[] = []): TimelineEvent[] {
  return tracking.map((event, index) => ({
    id: `${event.code || "event"}-${index}`,
    title: event.description || event.code || "Shipment Update",
    description: event.location ? `Location: ${event.location}` : "Shipment status updated.",
    timestamp: formatTimelineTimestamp(event.date_time),
    isCompleted: true
  }));
}

export function getTrackingDataFromRawPayload(rawPayload: unknown): SequelTrackingData | null {
  if (!rawPayload || typeof rawPayload !== "object") {
    return null;
  }

  const candidate = rawPayload as { data?: SequelTrackingData } & SequelTrackingData;
  if (candidate.data && typeof candidate.data === "object") {
    return candidate.data;
  }

  return candidate;
}

export function extractDocketNumber(data: SequelTrackingData | null | undefined) {
  return data?.docket_no || data?.docket_number || data?.docketNumber || null;
}

export function extractTrackingUrl(data: SequelTrackingData | null | undefined) {
  const docket = extractDocketNumber(data);
  const explicitUrl = typeof data?.tracking_link === "string" ? data.tracking_link : null;

  if (explicitUrl) return explicitUrl;
  if (!docket) return null;

  const config = getSequelConfig();
  if (!config) return null;
  return `${config.baseUrl}/track/${encodeURIComponent(docket)}`;
}

export function extractEstimatedDeliveryDate(data: SequelTrackingData | null | undefined) {
  return parseSequelDate(data?.estimated_delivery || data?.estiimated_delivery || null);
}

export function getShipmentNumericValue(data: SequelTrackingData | null | undefined, key: keyof SequelTrackingData) {
  return parseMaybeNumber(data?.[key]);
}

export function toSequelRawPayload(value: unknown): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
