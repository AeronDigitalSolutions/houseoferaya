import { NextResponse } from "next/server";
import { fetchLiveMetalRates } from "@/lib/live-metal-rates";

export async function GET() {
  try {
    const livePayload = await fetchLiveMetalRates();

    return NextResponse.json({
      success: true,
      source: livePayload.source,
      currency: livePayload.currency,
      rates: livePayload.rates
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch live metal rates."
      },
      { status: 502 }
    );
  }
}
