// /app/lib/dataStore.ts
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";

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

const DATA_FILE = path.join(process.cwd(), "data.json");
const eventEmitter = new EventEmitter();

// Load data from file
const loadData = (): SharedItem[] => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading data from JSON:", error);
  }
  return [];
};

// Save data to file
const saveData = (items: SharedItem[]) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving data to JSON:", error);
  }
};

let sharedItems: SharedItem[] = loadData();

export const dataStore = {
  subscribe: (listener: () => void) => {
    eventEmitter.on("update", listener);
    return () => eventEmitter.off("update", listener);
  },

  notify: () => {
    eventEmitter.emit("update");
  },

  getItems: (ip: string, roomId?: string) => {
    const now = Date.now();
    let updated = false;
    
    // Filter out expired items
    const validItems = sharedItems.filter(item => {
      if (item.expiresAt <= now) {
        updated = true;
        return false;
      }
      return true;
    });

    if (updated) {
      sharedItems = validItems;
      saveData(sharedItems);
    }
    
    return validItems.filter((item) => {
      if (roomId) {
        return item.roomId === roomId;
      }
      return !item.roomId;
    });
  },

  addItem: (itemData: Partial<SharedItem>) => {
    const expiresInHours = itemData.expiresAt || 24;
    const newItem: SharedItem = {
      id: Math.random().toString(36).substring(2, 9),
      content: itemData.content || "",
      contentType: itemData.contentType || "text",
      timestamp: Date.now(),
      ip: itemData.ip || "unknown",
      
      fileName: itemData.fileName,
      fileUrl: itemData.fileUrl,
      fileSize: itemData.fileSize,
      mimeType: itemData.mimeType,
      
      language: itemData.language,
      roomId: itemData.roomId,
      
      reactions: {},
      comments: [],
      
      isBurnAfterReading: !!itemData.isBurnAfterReading,
      expiresAt: Date.now() + (expiresInHours * 60 * 60 * 1000),
    };
    sharedItems = [newItem, ...sharedItems];
    saveData(sharedItems);
    dataStore.notify();
    return newItem;
  },

  revealItem: (id: string) => {
    const item = sharedItems.find(i => i.id === id);
    if (!item) return null;
    
    if (item.isBurnAfterReading) {
      sharedItems = sharedItems.filter(i => i.id !== id);
      saveData(sharedItems);
      dataStore.notify();
    }
    return item;
  },

  addReaction: (id: string, emoji: string) => {
    const item = sharedItems.find(i => i.id === id);
    if (item) {
      item.reactions[emoji] = (item.reactions[emoji] || 0) + 1;
      saveData(sharedItems);
      dataStore.notify();
      return true;
    }
    return false;
  },

  addComment: (id: string, text: string, ip: string) => {
    const item = sharedItems.find(i => i.id === id);
    if (item) {
      const newComment: Comment = {
        id: Math.random().toString(36).substring(2, 9),
        text,
        ip,
        timestamp: Date.now()
      };
      item.comments.push(newComment);
      saveData(sharedItems);
      dataStore.notify();
      return newComment;
    }
    return null;
  },

  deleteItem: (id: string, ip: string) => {
    const initialLength = sharedItems.length;
    sharedItems = sharedItems.filter(
      (item) => !(item.id === id && item.ip === ip)
    );
    if (sharedItems.length !== initialLength) {
      saveData(sharedItems);
      dataStore.notify();
      return true;
    }
    return false;
  },
};


