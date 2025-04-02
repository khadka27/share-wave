"use client";

import { useState } from "react";
import ShareForm from "@/components/ShareForm";
import SharedItems from "@/components/SharedItems";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  // Use a counter to trigger refreshes of the shared items list
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleShare = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 text-transparent bg-clip-text">
          ShareWave
        </h1>
        <ThemeToggle />
      </div>

      <p className="mb-8 text-muted-foreground">
        Share anything with people on the same network. Whatever you share will
        only be visible to users with the same IP address.
      </p>

      <div className="space-y-8">
        <ShareForm onShare={handleShare} />
        <SharedItems refresh={refreshCounter} onRefresh={handleRefresh} />
      </div>
    </main>
  );
}
