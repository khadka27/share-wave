"use client";

import { useState } from "react";
import { Lock, Unlock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RoomSelectorProps {
  currentRoom: string;
  onRoomChange: (roomId: string) => void;
}

export default function RoomSelector({ currentRoom, onRoomChange }: RoomSelectorProps) {
  const [pin, setPin] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onRoomChange(pin.trim());
      setPin("");
      setIsJoining(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      {currentRoom ? (
        <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-xl">
          <Lock className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Room: {currentRoom}</span>
          <Button variant="ghost" size="sm" onClick={() => onRoomChange("")} className="h-7 text-xs ml-2 text-muted-foreground hover:text-foreground">
            Leave Room
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-xl">
            <Users className="h-5 w-5" />
            <span>Public Feed</span>
          </div>
          
          {isJoining ? (
            <form onSubmit={handleJoin} className="flex items-center gap-2 bg-secondary/30 px-2 py-1 rounded-xl">
              <Lock className="h-4 w-4 text-muted-foreground ml-2" />
              <Input
                autoFocus
                placeholder="Enter PIN"
                value={pin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPin(e.target.value)}
                className="w-24 h-8 text-sm bg-background border-border"
              />
              <Button type="submit" size="sm" className="h-8">Join</Button>
              <Button type="button" variant="ghost" size="sm" className="h-8" onClick={() => setIsJoining(false)}>Cancel</Button>
            </form>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsJoining(true)} className="h-10 rounded-xl gap-2">
              <Lock className="h-4 w-4" />
              Join Private Room
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
