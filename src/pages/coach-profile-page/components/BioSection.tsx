import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BioSectionProps {
  summary: string;
  coachDescription?: string;
  isEditMode: boolean;
  onSummaryChange: (value: string) => void;
}

export function BioSection({
  summary,
  coachDescription,
  isEditMode,
  onSummaryChange,
}: BioSectionProps) {
  return (
    <Card
      id="bio"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <CardTitle className="text-xl text-left">Giới thiệu ngắn</CardTitle>
        <hr className="my-2 border-gray-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-muted-foreground leading-relaxed">
          {isEditMode ? (
            <div className="space-y-1">
              <Textarea
                rows={5}
                value={summary}
                onChange={(e) => onSummaryChange(e.target.value)}
              />
            </div>
          ) : (
            <p className="text-left">{summary || coachDescription || "-"}</p>
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

