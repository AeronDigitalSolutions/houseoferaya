import { NextRequest, NextResponse } from "next/server";
import { checkSequelServiceability } from "@/lib/sequel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pincode = String(body?.pincode || body?.pin_code || "").trim();

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ success: false, message: "Please enter a valid 6 digit pincode." }, { status: 400 });
    }

    const response = await checkSequelServiceability(pincode);

    return NextResponse.json({
      success: true,
      message: response.message || "Pincode checked successfully.",
      isServiceable: true,
      data: response.data || null
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to verify pincode serviceability."
      },
      { status: 500 }
    );
  }
}
