/* eslint-disable @typescript-eslint/no-unused-vars */
// /app/api/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/app/lib/dataStore";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const items = dataStore.getItemsByIp(ip);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const newItem = dataStore.addItem(content, ip);
    return NextResponse.json({ item: newItem });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const success = dataStore.deleteItem(id, ip);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Item not found or not authorized" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
