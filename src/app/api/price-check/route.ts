import { NextRequest, NextResponse } from "next/server";
import { analyzePrice, CATEGORIES } from "@/lib/price-check";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, price } = body;

    if (!category || typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Valid category and price are required" },
        { status: 400 }
      );
    }

    if (!CATEGORIES[category]) {
      return NextResponse.json(
        { error: "Unknown category" },
        { status: 400 }
      );
    }

    const result = analyzePrice(category, price);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Price check failed" },
      { status: 500 }
    );
  }
}
