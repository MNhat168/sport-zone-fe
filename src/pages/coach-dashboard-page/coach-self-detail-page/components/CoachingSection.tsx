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
  certification?: string;
  experienceText?: string;
}

export function CoachingSection({
  coachingSummary,
  isEditMode,
  onCoachingSummaryChange,
  certification,
  experienceText,
}: CoachingSectionProps) {
  return (
    <Card
      id="coaching"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <CardTitle className="text-xl text-left">
          Tóm tắt về huấn luyện viên
        </CardTitle>
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
          ) : coachingSummary ? (
            <p className="text-left">{coachingSummary}</p>
          ) : null}
        </div>
        <div className="mt-4 space-y-2 text-left">
          <p className="text-sm text-left">
            <span className="font-bold">Certification:</span>
            <span className="ml-2">{certification ?? "Không có"}</span>
          </p>
          <p className="text-sm text-left">
            <span className="font-bold">Experience:</span>
            <span className="ml-2">{experienceText ?? "Chưa cập nhật"}</span>
          </p>
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

