/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useState, useRef } from "react";
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
import {
  Send,
  Link,
  Image,
  FileText,
  Clock,
  Mic,
  MicOff,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TypeScript declarations for the Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: typeof window.SpeechRecognition;
  }
}

export default function ShareForm({ onShare }: { onShare: () => void }) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState("text");
  const [expiresIn, setExpiresIn] = useState("24h");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<Window["SpeechRecognition"] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setContent(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const characterCount = content.length;
  const maxCharacters = 50000000;
  const characterPercentage = (characterCount / maxCharacters) * 100;
  const isNearLimit = characterPercentage > 80;
  const isAtLimit = characterCount >= maxCharacters;

  const getCharacterLimitColor = () => {
    if (isAtLimit) return "text-red-500";
    if (isNearLimit) return "text-amber-500";
    return "text-green-500";
  };

  const toggleVoiceInput = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: {
      results: Iterable<unknown> | ArrayLike<unknown>;
    }) => {
      const transcript = Array.from(event.results)
        .map((result) => (result as SpeechRecognitionResult)[0])
        .map((result) => result.transcript)
        .join("");

      setContent((prev) => {
        // Make sure we don't exceed the character limit
        if ((prev + transcript).length <= maxCharacters) {
          return prev + transcript;
        }
        return prev;
      });
    };

    recognition.onerror = (event: { error: any }) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "network") {
        toast.error(
          "Voice input failed: Network error. Please check your internet connection."
        );
      } else if (
        event.error === "not-allowed" ||
        event.error === "permission-denied"
      ) {
        toast.error("Voice input failed: Microphone access denied.");
      } else if (event.error === "no-speech") {
        // Just stop listening without error
        setIsListening(false);
        return;
      } else {
        toast.error(`Voice input error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.success("Voice input activated. Speak now...");
  };

  return (
    <Card className="border-border shadow-md">
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
            onValueChange={(val) => {
              setContentType(val);
              // Clear content when switching tabs to avoid confusion
              // But strictly speaking we might want to keep it.
              // For image tab specifically, we might want to clear if it was text.
              if (
                val === "image" &&
                !content.startsWith("data:image") &&
                !content.startsWith("http")
              ) {
                setContent("");
              }
            }}
            className="mb-4"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger
                value="text"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Text</span>
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2"
              >
                <Link className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Link</span>
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2"
              >
                <Image className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Image</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                className="min-h-[120px] resize-none bg-secondary focus-visible:ring-primary/50"
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
                className="min-h-[120px] resize-none bg-secondary focus-visible:ring-primary/50"
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
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center transition-colors hover:bg-muted/50 relative">
                {content.startsWith("data:image") ? (
                  <div className="relative inline-block">
                    <img
                      src={content}
                      alt="Preview"
                      className="max-h-48 rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-medium">Click to upload an image</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, GIF up to 2MB
                      </p>
                    </label>
                    <div className="mt-4 flex items-center gap-2 justify-center">
                      <div className="h-px bg-border flex-1"></div>
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="h-px bg-border flex-1"></div>
                    </div>
                    <input
                      type="text"
                      className="w-full mt-2 p-2 rounded-md border border-input bg-background/50 text-sm"
                      placeholder="Paste image URL here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex sm:hidden justify-end items-center mt-2">
            <div
              className="h-1 w-16 bg-border/50 rounded-full overflow-hidden"
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
              {characterCount}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`h-9 w-9 ${
                isListening
                  ? "bg-red-100 dark:bg-red-900/30 border-red-400"
                  : ""
              }`}
              onClick={toggleVoiceInput}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isListening ? "Stop voice input" : "Start voice input"}
              </span>
            </Button>
            <div className="hidden sm:flex items-center">
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
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="gap-2 bg-linear-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 transition-all duration-300"
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
