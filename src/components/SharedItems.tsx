"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";

interface SharedItem {
  id: string;
  content: string;
  timestamp: number;
  ip: string;
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shared on This Network</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No items have been shared yet on this network.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                <span className="text-sm text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(item.content)}
                  >
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="whitespace-pre-wrap break-words">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
