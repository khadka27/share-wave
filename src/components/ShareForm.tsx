/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Send,
  Link,
  Image as ImageIcon,
  FileText,
  Clock,
  Mic,
  MicOff,
  Upload,
  X,
  Code,
  File as FileIcon,
  Lock,
  Flame,
} from "lucide-react";
import toast from "react-hot-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  
  // New State variables
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [roomId, setRoomId] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isBurnAfterReading, setIsBurnAfterReading] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<Window["SpeechRecognition"] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("contentType", contentType);
      formData.append("expiresIn", expiresIn);
      
      if (roomId) formData.append("roomId", roomId);
      if (isBurnAfterReading) formData.append("isBurnAfterReading", "true");
      if (contentType === "code") formData.append("language", language);
      if (file) formData.append("file", file);

      const response = await fetch("/api/share", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setContent("");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsPrivate(false);
        setRoomId("");
        onShare();
        toast.success("Content shared successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to share content");
      }
    } catch (error) {
      toast.error("Failed to share content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
    };
    reader.readAsDataURL(uploadedFile);
  };

  const handleGenericFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB");
      return;
    }
    setFile(uploadedFile);
    setContent(uploadedFile.name);
  };

  const clearImage = () => {
    setContent("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const clearFile = () => {
    setFile(null);
    setContent("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const characterCount = content.length;
  const maxCharacters = 50000;
  const characterPercentage = (characterCount / maxCharacters) * 100;
  const isNearLimit = characterPercentage > 80;
  const isAtLimit = characterCount >= maxCharacters;

  const toggleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setContent(prev => (prev + transcript).length <= maxCharacters ? prev + transcript : prev);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    toast.success("Voice input activated. Speak now...");
  };

  return (
    <Card className="border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.1)] bg-card/90 backdrop-blur-xl rounded-2xl overflow-hidden relative">
      <CardHeader className="pb-3 border-b border-border/30 relative z-10">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <span>Share Something</span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            
            <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setIsPrivate(false);
                  setRoomId("");
                }}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${!isPrivate ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isPrivate) {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setRoomId(code);
                    setIsPrivate(true);
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md font-medium transition-colors ${isPrivate ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Lock className="h-3 w-3" />
                Private {isPrivate && <span className="ml-1 font-mono bg-primary/20 px-1.5 py-0.5 rounded tracking-widest">{roomId}</span>}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <select
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="bg-transparent text-xs border-none outline-none p-0 pl-1 text-primary dark:text-blue-400 font-medium cursor-pointer"
              >
                <option value="1h" className="bg-card text-foreground">1 hour</option>
                <option value="6h" className="bg-card text-foreground">6 hours</option>
                <option value="24h" className="bg-card text-foreground">24 hours</option>
              </select>
            </div>
            
            <button 
              type="button"
              onClick={() => setIsBurnAfterReading(!isBurnAfterReading)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${isBurnAfterReading ? 'bg-red-500/20 text-red-500' : 'hover:bg-secondary'}`}
              title="Burn after reading"
            >
              <Flame className="h-3 w-3" />
              <span>Burn</span>
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-2">
          <Tabs
            value={contentType}
            onValueChange={(val) => {
              setContentType(val);
              setContent("");
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="mb-4"
          >
            <TabsList className="flex flex-wrap w-full h-auto">
              <TabsTrigger value="text" className="flex items-center gap-1 flex-1 py-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Text</span>
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-1 flex-1 py-2">
                <Link className="h-4 w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Link</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1 flex-1 py-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Image</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-1 flex-1 py-2">
                <FileIcon className="h-4 w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">File</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-1 flex-1 py-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Code</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-5">
              <Textarea
                className="min-h-[140px] resize-none bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all duration-300 rounded-xl"
                placeholder="Share a message or note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={maxCharacters}
              />
            </TabsContent>

            <TabsContent value="link" className="mt-5">
              <Textarea
                className="min-h-[140px] resize-none bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all duration-300 rounded-xl"
                placeholder="Share a URL..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={maxCharacters}
              />
            </TabsContent>

            <TabsContent value="image" className="mt-5">
              <div className="border-2 border-dashed border-border/60 rounded-2xl p-8 text-center transition-all hover:bg-secondary/40 relative bg-background/30 backdrop-blur-sm">
                {content.startsWith("data:image") ? (
                  <div className="relative inline-block">
                    <img src={content} alt="Preview" className="max-h-48 rounded-md shadow-sm" />
                    <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="bg-primary/10 p-3 rounded-full"><Upload className="h-6 w-6 text-primary" /></div>
                      <p className="font-medium">Click to upload an image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-5">
              <div className="border-2 border-dashed border-border/60 rounded-2xl p-8 text-center transition-all hover:bg-secondary/40 relative bg-background/30 backdrop-blur-sm">
                {file ? (
                  <div className="flex items-center justify-center gap-3 bg-secondary/50 p-4 rounded-lg">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button type="button" onClick={clearFile} className="ml-4 text-destructive"><X className="h-5 w-5" /></button>
                  </div>
                ) : (
                  <>
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleGenericFileUpload} id="file-upload" />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="bg-primary/10 p-3 rounded-full"><Upload className="h-6 w-6 text-primary" /></div>
                      <p className="font-medium">Click to upload any file</p>
                      <p className="text-xs text-muted-foreground">PDFs, ZIPs, Videos up to 50MB</p>
                    </label>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-5">
              <div className="mb-2 flex justify-end">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-secondary text-xs rounded-md px-2 py-1 border border-border"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="json">JSON</option>
                  <option value="bash">Bash</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <Textarea
                className="min-h-[140px] font-mono text-sm resize-none bg-background/50 backdrop-blur-sm border-border/50 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all duration-300 rounded-xl"
                placeholder="Paste your code snippet here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-wrap sm:flex-nowrap justify-between items-center pt-4 pb-5 border-t border-border/30 bg-secondary/20 backdrop-blur-md relative z-10 gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start order-2 sm:order-1">
            {contentType === 'text' && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={`h-9 w-9 ${isListening ? "bg-red-100 dark:bg-red-900/30 border-red-400" : ""}`}
                onClick={toggleVoiceInput}
              >
                {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto order-1 sm:order-2">
            <Button
              type="submit"
              disabled={isLoading || (!content.trim() && !file)}
              className="gap-2 bg-primary hover:bg-primary-hover transition-all duration-300 w-full sm:w-auto"
            >
              {isLoading ? (
                <><div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /><span>Sharing...</span></>
              ) : (
                <><Send className="h-4 w-4" /><span>Share</span></>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </form>
    </Card>
  );
}
