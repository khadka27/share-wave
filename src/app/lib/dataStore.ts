// /app/lib/dataStore.ts
interface SharedItem {
  id: string;
  content: string;
  timestamp: number;
  ip: string;
}

// In-memory store (in a real app, you'd use a database)
let sharedItems: SharedItem[] = [];

export const dataStore = {
  // Get all items shared by a specific IP
  getItemsByIp: (ip: string) => {
    return sharedItems.filter((item) => item.ip === ip);
  },

  // Add a new shared item
  addItem: (content: string, ip: string) => {
    const newItem: SharedItem = {
      id: Math.random().toString(36).substring(2, 9),
      content,
      timestamp: Date.now(),
      ip,
    };
    sharedItems = [newItem, ...sharedItems];
    return newItem;
  },

  // Delete an item (only if it belongs to the same IP)
  deleteItem: (id: string, ip: string) => {
    const initialLength = sharedItems.length;
    sharedItems = sharedItems.filter(
      (item) => !(item.id === id && item.ip === ip)
    );
    return sharedItems.length !== initialLength;
  },
};
