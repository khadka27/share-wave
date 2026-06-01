import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/app/lib/dataStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const item = dataStore.revealItem(id);

    if (item) {
      return NextResponse.json({ item });
    } else {
      return NextResponse.json(
        { error: "Item not found or already burned" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
