import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Users } from "lucide-react";

interface LessonType {
  id: string;
  type: "single" | "pair" | "group";
  name: string;
  description: string;
  icon: typeof User;
  iconBg: string;
  iconColor: string;
  badge: string;
}

interface LessonsSectionProps {
  lessonTypes: LessonType[];
  onLessonSelect: (lesson: LessonType) => void;
}

export function LessonsSection({
  lessonTypes,
  onLessonSelect,
}: LessonsSectionProps) {
  return (
    <Card
      id="lessons"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <CardTitle className="text-xl text-left">Buổi học cùng tôi</CardTitle>
        <hr className="my-2 border-gray-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed text-left">
          Huấn luyện cá nhân hóa theo nhu cầu của bạn. Chọn buổi 1 kèm 1
          hoặc học nhóm để có môi trường hợp tác và hỗ trợ.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {lessonTypes.map((lesson) => {
            const IconComponent = lesson.icon;
            return (
              <div key={lesson.id} className="group">
                <Button
                  variant="outline"
                  onClick={() => onLessonSelect(lesson)}
                  className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:border-green-500 hover:bg-green-50 transition-all duration-300 hover:scale-[1.02] bg-transparent"
                >
                  <div
                    className={`${lesson.iconBg} p-3 rounded-full group-hover:opacity-80 transition-opacity`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${lesson.iconColor}`}
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-base">
                      {lesson.name}
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {lesson.badge}
                    </Badge>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

