"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  RefreshCw,
  Trash2,
  Link,
  FileText,
  Image as ImageIcon,
  Clock,
  QrCode,
  X,
  Maximize2,
  Code,
  File as FileIcon,
  Download,
  Flame,
  MessageSquare,
  SmilePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Import some common languages for prism
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";

export interface Comment {
  id: string;
  text: string;
  ip: string;
  timestamp: number;
}

export interface SharedItem {
  id: string;
  content: string;
  contentType: string;
  timestamp: number;
  ip: string;
  
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  
  language?: string;
  roomId?: string;
  
  reactions: Record<string, number>;
  comments: Comment[];
  
  isBurnAfterReading: boolean;
  expiresAt: number;
}

export default function SharedItems({
  refresh,
  onRefresh,
  roomId,
}: {
  refresh: number;
  onRefresh: () => void;
  roomId: string;
}) {
  const [items, setItems] = useState<SharedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [qrItem, setQrItem] = useState<{ content: string; type: string; } | null>(null);
  const [maxImage, setMaxImage] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [burnedRevealed, setBurnedRevealed] = useState<Record<string, SharedItem>>({});

  const fetchItems = async () => {
    try {
      const url = roomId ? `/api/share?roomId=${roomId}` : "/api/share";
      const response = await fetch(url);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching shared items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refresh, roomId]);

  useEffect(() => {
    Prism.highlightAll();
  }, [items, burnedRevealed]);

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch("/api/share", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        toast.success("Item has been removed");
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleReveal = async (id: string) => {
    try {
      const response = await fetch(`/api/share/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBurnedRevealed(prev => ({ ...prev, [id]: data.item }));
        toast.success("Message revealed and burned from server");
      } else {
        toast.error("Message has already been burned by someone else");
        fetchItems(); // refresh to remove it from list
      }
    } catch (error) {
      toast.error("Failed to reveal message");
    }
  }

  const addReaction = async (id: string, emoji: string) => {
    try {
      await fetch("/api/share/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, emoji }),
      });
    } catch (e) {
      toast.error("Failed to add reaction");
    }
  }

  const addComment = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!commentText[id]?.trim()) return;
    
    try {
      await fetch("/api/share/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text: commentText[id] }),
      });
      setCommentText(prev => ({ ...prev, [id]: "" }));
    } catch (e) {
      toast.error("Failed to add comment");
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const filteredItems = filter === "all" ? items : items.filter((item) => item.contentType === filter);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getInitials = (ip: string) => `U${ip.split(".").pop()}`;
  const getAvatarColor = (ip: string) => `hsl(${Number.parseInt(ip.replace(/\./g, "")) % 360}, 70%, 60%)`;

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "link": return <Link className="h-4 w-4" />;
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "file": return <FileIcon className="h-4 w-4" />;
      case "code": return <Code className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const renderContent = (item: SharedItem) => {
    // Check if it's burn after reading and not revealed yet
    if (item.isBurnAfterReading && !burnedRevealed[item.id]) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-secondary/30 border border-dashed border-red-500/30 rounded-xl">
          <Flame className="h-12 w-12 text-red-500 mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg text-red-500">Burn After Reading</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">This message will be permanently deleted once you reveal it.</p>
          <Button onClick={() => handleReveal(item.id)} variant="destructive">Reveal Message</Button>
        </div>
      );
    }

    // If it was burned, use the revealed data
    const activeItem = item.isBurnAfterReading ? burnedRevealed[item.id] : item;
    if (!activeItem) return null;

    if (activeItem.contentType === "link") {
      const urlMatch = activeItem.content.match(/(https?:\/\/[^\s]+)/);
      const url = urlMatch ? urlMatch[0] : "";
      const description = urlMatch ? activeItem.content.replace(url, "").trim() : activeItem.content;
      return (
        <div className="select-text">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">{url}</a>
          {description && <p className="mt-2">{description}</p>}
        </div>
      );
    }

    if (activeItem.contentType === "image") {
      return (
        <div className="relative group mt-2">
          <img src={activeItem.content} alt="Shared image" className="max-w-full h-auto object-contain max-h-[300px] rounded-md border border-border" loading="lazy" />
          <Button size="icon" variant="secondary" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setMaxImage(activeItem.content); }}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (activeItem.contentType === "file" && activeItem.fileUrl) {
      return (
        <div className="flex items-center gap-4 bg-secondary/40 p-4 rounded-xl border border-border mt-2">
          <FileIcon className="h-10 w-10 text-primary" />
          <div className="flex-1">
            <p className="font-semibold">{activeItem.fileName}</p>
            <p className="text-xs text-muted-foreground">{((activeItem.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={activeItem.fileUrl} download={activeItem.fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" /> Download
            </a>
          </Button>
        </div>
      );
    }

    if (activeItem.contentType === "code") {
      return (
        <div className="relative mt-2 rounded-xl overflow-hidden text-sm">
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            <span className="text-xs text-muted-foreground bg-background/80 px-2 py-0.5 rounded-md">{activeItem.language}</span>
          </div>
          <pre className={`language-${activeItem.language || "javascript"} p-4 m-0 overflow-x-auto`}>
            <code>{activeItem.content}</code>
          </pre>
        </div>
      );
    }

    return <p className="whitespace-pre-wrap break-words select-text">{activeItem.content}</p>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Shared on This Network</h2>
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} available
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex flex-wrap bg-muted rounded-md p-1 text-xs font-medium mr-2 flex-1 sm:flex-initial">
            <button onClick={() => setFilter("all")} className={`px-2 sm:px-3 py-1 rounded ${filter === "all" ? "bg-background shadow-xs font-semibold" : ""}`}>All</button>
            <button onClick={() => setFilter("text")} className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${filter === "text" ? "bg-background shadow-xs font-semibold" : ""}`}><FileText className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Text</span></button>
            <button onClick={() => setFilter("link")} className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${filter === "link" ? "bg-background shadow-xs font-semibold" : ""}`}><Link className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Links</span></button>
            <button onClick={() => setFilter("image")} className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${filter === "image" ? "bg-background shadow-xs font-semibold" : ""}`}><ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Images</span></button>
            <button onClick={() => setFilter("file")} className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${filter === "file" ? "bg-background shadow-xs font-semibold" : ""}`}><FileIcon className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Files</span></button>
            <button onClick={() => setFilter("code")} className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${filter === "code" ? "bg-background shadow-xs font-semibold" : ""}`}><Code className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Code</span></button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><RefreshCw className="h-8 w-8 animate-spin text-primary/20" /></div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed bg-card/50 shadow-sm rounded-2xl p-10 text-center text-muted-foreground">
          No items found in {filter === "all" ? "this feed" : filter}.
        </Card>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4">
            {filteredItems.map((item, index) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                <Card className="shadow-md hover:shadow-xl bg-card/80 backdrop-blur-xl rounded-2xl overflow-hidden border-border/40 hover:border-primary/50 transition-all group">
                  <CardHeader className="p-3 sm:p-4 pb-2 flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback style={{ backgroundColor: getAvatarColor(item.ip) }} className="text-slate-950 font-semibold text-xs">
                          {getInitials(item.ip)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Anonymous</span>
                          <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                            {getContentTypeIcon(item.contentType)}
                            <span className="capitalize">{item.contentType}</span>
                          </span>
                          {item.isBurnAfterReading && (
                            <span className="text-xs bg-red-500/10 text-red-500 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                              <Flame className="h-3 w-3" /> Burn
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex gap-1 mt-0.5">
                          <span>{getTimeAgo(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(item.content)}><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => deleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    {renderContent(item)}
                  </CardContent>
                  <CardFooter className="p-3 sm:p-4 border-t border-border/30 bg-secondary/10 flex flex-col gap-3">
                    <div className="flex gap-2 w-full flex-wrap">
                      {["👍", "❤️", "😂", "🚀", "👀"].map(emoji => (
                        <button key={emoji} onClick={() => addReaction(item.id, emoji)} className="text-xs flex items-center gap-1 bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-full transition-colors">
                          <span>{emoji}</span>
                          <span className="text-muted-foreground font-medium">{item.reactions?.[emoji] || 0}</span>
                        </button>
                      ))}
                    </div>
                    
                    <div className="w-full space-y-2">
                      {item.comments?.map(comment => (
                        <div key={comment.id} className="text-xs flex gap-2">
                          <span className="font-semibold">{getInitials(comment.ip)}:</span>
                          <span className="text-muted-foreground break-words flex-1">{comment.text}</span>
                        </div>
                      ))}
                      <form onSubmit={(e) => addComment(e, item.id)} className="flex items-center gap-2 mt-2">
                        <Input 
                          placeholder="Add a comment..." 
                          className="h-7 text-xs bg-background" 
                          value={commentText[item.id] || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        />
                        <Button type="submit" size="sm" className="h-7 text-xs px-2" disabled={!commentText[item.id]}>Reply</Button>
                      </form>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {maxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setMaxImage(null)}>
          <img src={maxImage} className="max-w-full max-h-[90vh] object-contain" alt="Preview" />
          <Button variant="ghost" className="absolute top-4 right-4 text-white" onClick={() => setMaxImage(null)}><X className="h-8 w-8" /></Button>
        </div>
      )}
    </div>
  );
}
