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
  Image,
  Clock,
  QrCode,
  X,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";

interface SharedItem {
  id: string;
  content: string;
  timestamp: number;
  ip: string;
  contentType?: string;
  expiresIn?: string;
}

export default function SharedItems({
  refresh,
  onRefresh,
}: {
  refresh: number;
  onRefresh: () => void;
}) {
  const [items, setItems] = useState<SharedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [qrItem, setQrItem] = useState<{
    content: string;
    type: string;
  } | null>(null);
  const [maxImage, setMaxImage] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/share");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching shared items:", error);
      toast.error("Failed to load shared items");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const response = await fetch("/api/share", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setItems(items.filter((item) => item.id !== id));
        toast.success("Item has been removed");
      } else {
        const data = await response.json();
        console.error("Error deleting item:", data.error);
        toast.error(data.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchItems();
      onRefresh();
      toast.success("Content refreshed");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refresh]);

  // For demonstration, assign content types to items
  const enhancedItems = items.map((item) => {
    // This is just for demo - in a real app, these would come from the API
    const contentType =
      item.contentType ||
      (item.content.startsWith("http")
        ? "link"
        : item.content.startsWith("data:image") ||
          item.content.includes("<img") ||
          item.content.match(/\.(jpg|jpeg|png|gif|webp)$/)
        ? "image"
        : "text");

    return {
      ...item,
      contentType,
      expiresIn: item.expiresIn || "24h",
    };
  });

  const filteredItems =
    filter === "all"
      ? enhancedItems
      : enhancedItems.filter((item) => item.contentType === filter);

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const getInitials = (ip: string) => {
    // Get last octet of IP
    const lastOctet = ip.split(".").pop();
    return `U${lastOctet}`;
  };

  const getAvatarColor = (ip: string) => {
    // Generate a consistent color based on IP
    const num = Number.parseInt(ip.replace(/\./g, ""));
    const hue = num % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "link":
        return <Link className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const currentItemId = useRef<string | null>(null);
  const swipeThreshold = 100;

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    currentItemId.current = id;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (
      currentItemId.current &&
      touchStartX.current - touchEndX.current > swipeThreshold
    ) {
      // Swiped left - delete the item
      deleteItem(currentItemId.current);
      toast.success("Item deleted");
    }
    // Reset values
    touchStartX.current = 0;
    touchEndX.current = 0;
    currentItemId.current = null;
  };

  const lastTap = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDoubleTap = (content: string) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
      }
      copyToClipboard(content);
    } else {
      // First tap
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
      }
      tapTimeout.current = setTimeout(() => {
        tapTimeout.current = null;
      }, DOUBLE_TAP_DELAY);
    }

    lastTap.current = now;
  };

  const handleCopyClick = (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    copyToClipboard(content);
  };

  const renderContent = (item: SharedItem & { contentType: string }) => {
    if (item.contentType === "link") {
      const urlMatch = item.content.match(/(https?:\/\/[^\s]+)/);
      const url = urlMatch ? urlMatch[0] : "";
      const description = urlMatch
        ? item.content.replace(url, "").trim()
        : item.content;

      return (
        <div className="select-text">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 transition-colors break-all"
          >
            {url}
          </a>
          {description && <p className="mt-2">{description}</p>}
        </div>
      );
    }

    if (item.contentType === "image") {
      return (
        <div className="relative group">
          <div className="rounded-md overflow-hidden mt-2 border border-border bg-black/5">
            <img
              src={
                item.content.startsWith("http") ||
                item.content.startsWith("data:image")
                  ? item.content
                  : "/api/placeholder/400/300"
              }
              alt="Shared image"
              className="max-w-full h-auto object-contain max-h-[300px] w-full"
              loading="lazy"
            />
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setMaxImage(item.content);
            }}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <p className="whitespace-pre-wrap break-words select-text">
        {item.content}
      </p>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Shared on This Network</h2>
          <p className="text-sm text-muted-foreground">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"} available
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex flex-wrap bg-muted rounded-md p-1 text-xs font-medium mr-2 flex-1 sm:flex-initial">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 sm:px-3 py-1 rounded ${
                filter === "all"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("text")}
              className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${
                filter === "text"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <FileText className="h-3 w-3" />{" "}
              <span className="hidden xs:inline">Text</span>
            </button>
            <button
              onClick={() => setFilter("link")}
              className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${
                filter === "link"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Link className="h-3 w-3" />{" "}
              <span className="hidden xs:inline">Links</span>
            </button>
            <button
              onClick={() => setFilter("image")}
              className={`px-2 sm:px-3 py-1 rounded flex items-center gap-1 ${
                filter === "image"
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Image className="h-3 w-3" />{" "}
              <span className="hidden xs:inline">Images</span>
            </button>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-8 w-8"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="sr-only">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-primary/20" />
            </div>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center">
            <div className="bg-secondary p-3 rounded-full mb-4">
              {filter === "all" ? (
                <RefreshCw className="h-6 w-6 text-primary/60" />
              ) : (
                getContentTypeIcon(filter)
              )}
            </div>
            <p className="text-lg font-medium">
              No {filter !== "all" ? filter : ""} items shared yet
            </p>
            <p className="text-muted-foreground max-w-sm mt-1">
              {filter === "all"
                ? "Be the first to share something with people on this network."
                : `No ${filter} items have been shared yet. You can switch to "All" to see other types of content or share something new.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="grid gap-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="border-border hover:border-primary transition-colors w-full relative group"
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:hidden touch-none pointer-events-none">
                    <div className="flex flex-col items-center">
                      <Trash2 className="h-4 w-4 text-red-500/70" />
                      <span>Swipe to delete</span>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-8 w-8"
                        style={{ backgroundColor: getAvatarColor(item.ip) }}
                      >
                        <AvatarFallback>{getInitials(item.ip)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Anonymous</span>
                          <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                            {getContentTypeIcon(item.contentType)}
                            <span>{item.contentType}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{getTimeAgo(item.timestamp)}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>Expires in {item.expiresIn}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                              onClick={() =>
                                setQrItem({
                                  content: item.content,
                                  type: item.contentType || "text",
                                })
                              }
                            >
                              <QrCode className="h-4 w-4" />
                              <span className="sr-only">QR Code</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Show QR Code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary"
                              onClick={(e) => handleCopyClick(e, item.content)}
                            >
                              <Copy className="h-4 w-4" />
                              <span className="sr-only">Copy</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500/70 hover:text-red-500 hover:bg-secondary"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent
                    className="p-4 pt-2 select-none"
                    onTouchEnd={() => handleDoubleTap(item.content)}
                  >
                    <div className="select-text">
                      {renderContent(
                        item as SharedItem & { contentType: string }
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 sm:hidden">
                      Double-tap to copy
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* QR Code Modal / Overlay */}
      <AnimatePresence>
        {qrItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setQrItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl shadow-lg p-6 max-w-sm w-full mx-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setQrItem(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Scan QR Code</h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  {qrItem.content.length > 2000 ? (
                    <div className="w-[200px] h-[200px] flex items-center justify-center bg-secondary text-muted-foreground rounded-md p-4 text-center text-sm border-dashed border-2">
                      Content too large to generate QR Code
                    </div>
                  ) : (
                    <QRCode
                      value={qrItem.content}
                      size={200}
                      className="h-auto w-full max-w-full"
                      fgColor="#000000"
                      bgColor="#FFFFFF"
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground break-all px-2">
                  {qrItem.type === "link"
                    ? qrItem.content
                    : "Scan to copy content"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <AnimatePresence>
        {maxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setMaxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMaxImage(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={maxImage}
                alt="Full preview"
                className="max-w-full max-h-[85vh] object-contain rounded-md"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
