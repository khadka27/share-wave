import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/app/lib/dataStore";

export async function POST(request: NextRequest) {
  try {
    const { id, text } = await request.json();
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    if (!id || !text || text.trim() === "") {
      return NextResponse.json(
        { error: "Item ID and comment text are required" },
        { status: 400 }
      );
    }

    const comment = dataStore.addComment(id, text, ip);

    if (comment) {
      return NextResponse.json({ comment });
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
