import { Button } from "@/components/ui/button";

interface Tab {
  id: string;
  label: string;
}

interface CoachTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabClick: (sectionId: string) => void;
}

export const CoachTabs: React.FC<CoachTabsProps> = ({
  tabs,
  activeTab,
  onTabClick,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sticky top-4 z-30 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => onTabClick(tab.id)}
            className={`transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-[#1a2332] text-white hover:bg-[#1a2332]/90"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

