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
import { useAppDispatch } from "@/store/hook";
import { getLessonType } from "@/features/lesson-types";
import { useNavigate } from "react-router-dom";

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!lesson) return null;

  const IconComponent = lesson.icon;

  const handleViewFields = async () => {
    // Try to resolve a direct field id from the lesson object first
    const explicitFieldId = (() => {
      try {
        if ((lesson as any).fieldId && typeof (lesson as any).fieldId === 'string') return (lesson as any).fieldId;
        if ((lesson as any).field && typeof (lesson as any).field === 'string') return (lesson as any).field;
        const f = (lesson as any).field;
        if (f && typeof f === 'object') {
          if (typeof f.id === 'string' && f.id) return f.id;
          if (typeof f._id === 'string' && f._id) return f._id;
          if (typeof f.toString === 'function') {
            const s = f.toString();
            if (s && s !== '[object Object]') return s;
          }
        }
      } catch (e) {
        // ignore
      }
      return null;
    })();

    if (explicitFieldId) {
      onClose();
      navigate(`/fields/${encodeURIComponent(String(explicitFieldId))}`);
      return;
    }

    // If we don't have a direct field id, try to fetch the lesson-type via thunk
    const lessonId = (lesson as any).id || (lesson as any)._id || null;
    if (lessonId) {
      try {
        const result = await dispatch(getLessonType({ id: String(lessonId) })).unwrap();
        const fieldRef = (result as any)?.field || (result as any)?.fieldId || null;
        if (fieldRef) {
          const fid = typeof fieldRef === 'string' ? fieldRef : (fieldRef.id || fieldRef._id || String(fieldRef));
          onClose();
          navigate(`/fields/${encodeURIComponent(String(fid))}`);
          return;
        }
      } catch (e) {
        // failure - fall through to fallback
      }
    }

    // Fallback behavior: navigate to list filtered by lesson name
    const sportParam = encodeURIComponent(String(lesson.name || '').toLowerCase());
    onClose();
    navigate(`/fields?type=${sportParam}`);
  };

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
              onClick={handleViewFields}
              className="flex-1 hover:bg-muted bg-transparent"
            >
              Xem sân
            </Button>
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

