import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/app/lib/dataStore";

export async function POST(request: NextRequest) {
  try {
    const { id, emoji } = await request.json();

    if (!id || !emoji) {
      return NextResponse.json(
        { error: "Item ID and emoji are required" },
        { status: 400 }
      );
    }

    const success = dataStore.addReaction(id, emoji);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
