"use client";

import { useState, useEffect } from "react";
import ShareForm from "@/components/ShareForm";
import SharedItems from "@/components/SharedItems";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Share2, Users, Info, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  // Use a counter to trigger refreshes of the shared items list
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleShare = () => {
    setRefreshCounter((prev) => prev + 1);
    setShowIntro(false);
  };

  const handleRefresh = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  // Simulate fetching user count (replace with actual API call)
  useEffect(() => {
    const fetchUserCount = async () => {
      // This would be replaced with your actual API call
      const randomCount = Math.floor(Math.random() * 5) + 1;
      setUserCount(randomCount);
    };

    fetchUserCount();
    const interval = setInterval(fetchUserCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show scroll-to-top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/90">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/10 py-3">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-3"
          >
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-transparent bg-clip-text flex items-center gap-2">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              ShareWave
            </h1>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {userCount} online
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Users on your network</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ThemeToggle />
            </div>
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <AnimatePresence>
          {showIntro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4 sm:p-6 rounded-xl border border-purple-500/20"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-full shrink-0">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Welcome to ShareWave!
                  </h2>
                  <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                    Share anything with people on the same network. Whatever you
                    share will only be visible to users with the same IP
                    address, making it perfect for:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {[
                      "Quick file sharing during presentations",
                      "Sharing meeting notes with colleagues",
                      "Collaborative brainstorming sessions",
                      "Sharing links during conferences",
                    ].map((use, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0"></div>
                        <span className="text-sm sm:text-base">{use}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                      All shared content automatically expires after 24 hours
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowIntro(false)}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ShareForm onShare={handleShare} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SharedItems refresh={refreshCounter} onRefresh={handleRefresh} />
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-border/40 mt-12 py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              ShareWave — Local network sharing made simple
            </p>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs sm:text-sm"
              >
                Privacy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs sm:text-sm"
              >
                Terms
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs sm:text-sm"
              >
                Help
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="rounded-full shadow-lg bg-primary hover:bg-primary/90"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp className="h-5 w-5" />
              <span className="sr-only">Scroll to top</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
