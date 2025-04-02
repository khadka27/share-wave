"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ShareForm({ onShare }: { onShare: () => void }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent("");
        onShare();
        toast.success("Your content has been shared successfully");
      } else {
        const data = await response.json();
        console.error("Error sharing content:", data.error);
        toast.error(data.error || "Failed to share content");
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      toast.error("Failed to share content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Something</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            className="min-h-[120px] resize-none"
            placeholder="Share something with others on your network..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Share</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
