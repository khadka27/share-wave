// /app/api/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/app/lib/dataStore";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const url = new URL(request.url);
  const roomId = url.searchParams.get("roomId") || undefined;
  
  const items = dataStore.getItems(ip, roomId);
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const contentType = request.headers.get("content-type") || "";

    let itemData: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      itemData.content = formData.get("content")?.toString() || "";
      itemData.contentType = formData.get("contentType")?.toString() || "text";
      itemData.language = formData.get("language")?.toString();
      itemData.roomId = formData.get("roomId")?.toString();
      itemData.isBurnAfterReading = formData.get("isBurnAfterReading") === "true";
      
      const expiresIn = formData.get("expiresIn")?.toString();
      if (expiresIn) {
        itemData.expiresAt = parseInt(expiresIn.replace("h", ""));
      }

      // Handle file upload
      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        // limit size to 50MB
        if (file.size > 50 * 1024 * 1024) {
          return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Ensure upload dir exists
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const filePath = path.join(uploadDir, safeFilename);
        
        await writeFile(filePath, buffer);
        
        itemData.fileName = file.name;
        itemData.fileSize = file.size;
        itemData.mimeType = file.type;
        itemData.fileUrl = `/uploads/${safeFilename}`;
        itemData.contentType = "file";
      }
    } else {
      // JSON fallback
      itemData = await request.json();
      if (itemData.expiresIn) {
        itemData.expiresAt = parseInt(itemData.expiresIn.replace("h", ""));
      }
    }

    if (!itemData.content && !itemData.fileUrl) {
      return NextResponse.json(
        { error: "Content or file is required" },
        { status: 400 }
      );
    }

    itemData.ip = ip;
    const newItem = dataStore.addItem(itemData);
    
    return NextResponse.json({ item: newItem });
  } catch (error) {
    console.error("Error creating item:", error);
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
