"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Link, Image, FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ShareForm({ onShare }: { onShare: () => void }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("text");
  const [expiresIn, setExpiresIn] = useState("24h");

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
        body: JSON.stringify({
          content,
          contentType,
          expiresIn,
        }),
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

  const characterCount = content.length;
  const maxCharacters = 500;
  const characterPercentage = (characterCount / maxCharacters) * 100;
  const isNearLimit = characterPercentage > 80;
  const isAtLimit = characterCount >= maxCharacters;

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Share Something</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Expires in:</span>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(e.target.value)}
              className="bg-transparent text-xs border-none outline-none p-0 pl-1"
            >
              <option value="1h">1 hour</option>
              <option value="6h">6 hours</option>
              <option value="24h">24 hours</option>
              <option value="48h">48 hours</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-2">
          <Tabs
            value={contentType}
            onValueChange={setContentType}
            className="mb-4"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-1/2">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Text</span>
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                <span>Link</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>Image</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                className="min-h-[120px] resize-none bg-background/50 focus-visible:ring-primary/50"
                placeholder="Share a message, code snippet, or anything text-based..."
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= maxCharacters) {
                    setContent(e.target.value);
                  }
                }}
                maxLength={maxCharacters}
              />
            </TabsContent>

            <TabsContent value="link" className="mt-4">
              <Textarea
                className="min-h-[120px] resize-none bg-background/50 focus-visible:ring-primary/50"
                placeholder="Share a URL with a description (optional)..."
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= maxCharacters) {
                    setContent(e.target.value);
                  }
                }}
                maxLength={maxCharacters}
              />
            </TabsContent>

            <TabsContent value="image" className="mt-4">
              <div className="border-2 border-dashed border-border rounded-md p-4 text-center">
                <p className="text-muted-foreground mb-2">Enter an image URL</p>
                <input
                  type="text"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  placeholder="https://example.com/image.jpg"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end items-center mt-2">
            <div
              className="h-1 w-24 bg-border/50 rounded-full overflow-hidden"
              title={`${characterCount}/${maxCharacters} characters`}
            >
              <div
                className={`h-full ${
                  isNearLimit
                    ? isAtLimit
                      ? "bg-red-500"
                      : "bg-amber-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${characterPercentage}%` }}
              ></div>
            </div>
            <span
              className={`text-xs ml-2 ${
                isNearLimit
                  ? isAtLimit
                    ? "text-red-500"
                    : "text-amber-500"
                  : "text-muted-foreground"
              }`}
            >
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 transition-all duration-300"
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
          </motion.div>
        </CardFooter>
      </form>
    </Card>
  );
}
