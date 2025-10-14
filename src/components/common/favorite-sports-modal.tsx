"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dumbbell, Waves, Trophy, Target, Zap, Activity } from "lucide-react";

interface FavoriteSportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (selectedSports: string[]) => void;
}

const SPORTS_OPTIONS = [
  {
    id: "football",
    label: "Football",
    icon: Trophy,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: Target,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "badminton",
    label: "Badminton",
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pickleball",
    label: "Pickleball",
    icon: Activity,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "basketball",
    label: "Basketball",
    icon: Trophy,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "volleyball",
    label: "Volleyball",
    icon: Target,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "swimming",
    label: "Swimming",
    icon: Waves,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "gym",
    label: "Gym",
    icon: Dumbbell,
    color: "from-slate-600 to-slate-800",
  },
];

export function FavoriteSportsModal({
  isOpen,
  onClose,
  onAccept,
}: FavoriteSportsModalProps) {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const handleToggleSport = (sportId: string) => {
    setSelectedSports((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId]
    );
  };

  const handleAccept = () => {
    onAccept(selectedSports);
    setSelectedSports([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedSports([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-primary via-primary to-accent p-8 text-center">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-primary-foreground mb-2 text-balance">
              What's Your Favorite Sport?
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/90 text-base">
              Select one or more sports that get you moving
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {SPORTS_OPTIONS.map((sport) => {
              const Icon = sport.icon;
              const isSelected = selectedSports.includes(sport.id);

              return (
                <button
                  key={sport.id}
                  onClick={() => handleToggleSport(sport.id)}
                  className={`
                    group relative overflow-hidden rounded-xl p-6 
                    transition-all duration-300 ease-out
                    border-2 
                    ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md hover:scale-[1.01]"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-3 relative z-10">
                    <div
                      className={`
                      p-3 rounded-full transition-all duration-300
                      ${
                        isSelected
                          ? `bg-gradient-to-br ${sport.color}`
                          : "bg-muted group-hover:bg-gradient-to-br group-hover:" +
                            sport.color
                      }
                    `}
                    >
                      <Icon
                        className={`w-6 h-6 transition-colors duration-300 ${
                          isSelected
                            ? "text-white"
                            : "text-muted-foreground group-hover:text-white"
                        }`}
                      />
                    </div>
                    <span
                      className={`
                      font-semibold text-sm uppercase tracking-wide transition-colors duration-300
                      ${isSelected ? "text-primary" : "text-foreground"}
                    `}
                    >
                      {sport.label}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 animate-in fade-in duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-8 font-semibold bg-transparent"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              className="px-8 font-semibold bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
              disabled={selectedSports.length === 0}
              size="lg"
            >
              Accept {selectedSports.length > 0 && `(${selectedSports.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
