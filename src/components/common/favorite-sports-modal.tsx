"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/store/hook";
import { removeAllFavouriteSports, getUserProfile } from "@/features/user/userThunk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// (removed lucide-react imports for clarity) using emoji icons below

// Simple emoji-based icon factory to guarantee icons match sports
// and avoid depending on specific named exports from the icon lib.
const makeEmojiIcon = (emoji: string) => ({ className }: { className?: string }) => (
  <span className={`${className ?? ""} inline-block`} aria-hidden>
    {emoji}
  </span>
);

const FootballIcon = makeEmojiIcon("⚽");
const TennisIcon = makeEmojiIcon("🎾");
const BadmintonIcon = makeEmojiIcon("🏸");
const BasketballIcon = makeEmojiIcon("🏀");
const VolleyballIcon = makeEmojiIcon("🏐");
const PickleballIcon = makeEmojiIcon("🏓");
const SwimmingIcon = makeEmojiIcon("🏊");
const GymIcon = makeEmojiIcon("🏋️");

interface FavoriteSportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (selectedSports: string[]) => void;
  initialSelected?: string[];
}

const SPORTS_OPTIONS = [
  {
    id: "football",
    label: "Football",
    icon: FootballIcon,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "tennis",
    label: "Tennis",
    icon: TennisIcon,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "badminton",
    label: "Badminton",
    icon: BadmintonIcon,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "pickleball",
    label: "Pickleball",
    icon: PickleballIcon,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "basketball",
    label: "Basketball",
    icon: BasketballIcon,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "volleyball",
    label: "Volleyball",
    icon: VolleyballIcon,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "swimming",
    label: "Swimming",
    icon: SwimmingIcon,
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "gym",
    label: "Gym",
    icon: GymIcon,
    color: "from-slate-600 to-slate-800",
  },
];

export function FavoriteSportsModal({
  isOpen,
  onClose,
  onAccept,
  initialSelected = [],
}: FavoriteSportsModalProps) {
  const [selectedSports, setSelectedSports] = useState<string[]>(() => initialSelected ?? []);
  const dispatch = useAppDispatch();
  const [clearing, setClearing] = useState(false);

  // When opened, initialize selection from initialSelected
  useEffect(() => {
    if (isOpen) setSelectedSports(initialSelected ?? []);
  }, [isOpen, initialSelected]);

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

  const handleClear = () => {
    // Clear local selection first for immediate feedback
    setSelectedSports([]);

    // Also clear server-side favourites and refresh profile
    (async () => {
      try {
        setClearing(true);
        await dispatch(removeAllFavouriteSports() as any).unwrap();
        // Refresh profile to update global auth user
        await dispatch(getUserProfile() as any).unwrap();
        toast.success("Favourite sports cleared");
      } catch (e: any) {
        console.error("Failed to clear favourite sports on server", e);
        const message = e?.message || e?.response?.data?.message || "Failed to clear favourite sports";
        toast.error(message);
      } finally {
        setClearing(false);
      }
    })();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-primary p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-foreground mb-1">
              Favorite Sports?
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/90 text-sm">
              Pick your sports
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {SPORTS_OPTIONS.map((sport) => {
              const Icon = sport.icon;
              const isSelected = selectedSports.includes(sport.id);

              return (
                <button
                  key={sport.id}
                  onClick={() => handleToggleSport(sport.id)}
                  className={`
                    group relative overflow-hidden rounded-lg p-3
                    transition-all duration-300 ease-out
                    border-2 
                    ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md scale-105"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-sm hover:scale-102"
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`
                      p-2 rounded-full transition-all duration-300
                      ${
                        isSelected
                          ? `bg-gradient-to-br ${sport.color}`
                          : "bg-muted group-hover:bg-gradient-to-br group-hover:" +
                            sport.color
                      }
                    `}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300 ${
                          isSelected
                            ? "text-white"
                            : "text-muted-foreground group-hover:text-white"
                        }`}
                      />
                    </div>
                    <span
                      className={`
                      font-semibold text-xs uppercase tracking-wide transition-colors duration-300 line-clamp-2
                      ${isSelected ? "text-primary" : "text-foreground"}
                    `}
                    >
                      {sport.label}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/5 animate-in fade-in duration-300" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-4 font-semibold bg-transparent text-sm"
              size="sm"
            >
              Cancel
            </Button>

            <Button
              variant="ghost"
              onClick={handleClear}
              className="px-4 font-semibold text-sm"
              size="sm"
              disabled={selectedSports.length === 0}
            >
              Clear
            </Button>

            <Button
              onClick={handleAccept}
              className="px-6 font-semibold bg-primary hover:bg-primary/90 transition-colors shadow-lg text-sm"
              disabled={selectedSports.length === 0}
              size="sm"
            >
              Accept {selectedSports.length > 0 && `(${selectedSports.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
