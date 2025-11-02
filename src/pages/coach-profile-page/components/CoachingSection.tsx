import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CoachingSectionProps {
  coachingSummary: string;
  isEditMode: boolean;
  onCoachingSummaryChange: (value: string) => void;
}

export function CoachingSection({
  coachingSummary,
  isEditMode,
  onCoachingSummaryChange,
}: CoachingSectionProps) {
  return (
    <Card
      id="coaching"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <CardTitle className="text-xl text-left">Coaching summary</CardTitle>
        <hr className="my-2 border-gray-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground leading-relaxed">
          {isEditMode ? (
            <div className="space-y-1">
              <Textarea
                rows={5}
                value={coachingSummary}
                onChange={(e) => onCoachingSummaryChange(e.target.value)}
              />
            </div>
          ) : (
            <p className="text-left">{coachingSummary || "-"}</p>
          )}
        </div>
        <Button
          variant="link"
          className="text-green-600 hover:text-green-700 p-0 h-auto"
        >
          Xem thêm
        </Button>
      </CardContent>
    </Card>
  );
}

