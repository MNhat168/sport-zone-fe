import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

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

interface LessonDetailModalProps {
  lesson: LessonType | null;
  onClose: () => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  onClose,
}) => {
  if (!lesson) return null;

  const IconComponent = lesson.icon;

  return (
    <Dialog open={!!lesson} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{lesson.name}</DialogTitle>
          <DialogDescription className="sr-only">Chi tiết và thông tin buổi học</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Loại buổi học */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Loại buổi học</Label>
            <div className="flex items-center gap-3">
              <div className={`${lesson.iconBg} p-2.5 rounded-lg`}>
                <IconComponent className={`h-5 w-5 ${lesson.iconColor}`} />
              </div>
              <div>
                <Badge variant="secondary" className="font-semibold">
                  {lesson.badge}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1 capitalize">Phiên {lesson.type}</p>
              </div>
            </div>
          </div>

          {/* Tên buổi học */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tên</Label>
            <p className="text-lg font-semibold">{lesson.name}</p>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Mô tả</Label>
            <p className="text-muted-foreground leading-relaxed">
              {lesson.description}
            </p>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 hover:bg-muted bg-transparent"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

