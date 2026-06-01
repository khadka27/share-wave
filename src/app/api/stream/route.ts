import { NextRequest } from "next/server";
import { dataStore } from "@/app/lib/dataStore";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send an initial event to confirm connection
      controller.enqueue(encoder.encode("data: connected\n\n"));

      // Subscribe to dataStore updates
      const unsubscribe = dataStore.subscribe(() => {
        try {
          // Send an update event when data changes
          controller.enqueue(encoder.encode("data: update\n\n"));
        } catch (err) {
          console.error("Error sending SSE update", err);
        }
      });

      // Handle connection close
      request.signal.addEventListener("abort", () => {
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
