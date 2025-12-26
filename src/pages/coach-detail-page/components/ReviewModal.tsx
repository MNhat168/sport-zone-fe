import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, AlertCircle } from "lucide-react";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachName: string;
  reviewRating: number;
  hoveredRating: number;
  reviewComment: string;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onHoveredRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  errorMessage?: string | null;
  showProfanityAlert?: boolean;
  onProfanityAlertChange?: (open: boolean) => void;
  flaggedWords?: string[];
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  onOpenChange,
  coachName,
  reviewRating,
  hoveredRating,
  reviewComment,
  isSubmitting,
  onRatingChange,
  onHoveredRatingChange,
  onCommentChange,
  onSubmit,
  onCancel,
  errorMessage,
  showProfanityAlert = false,
  onProfanityAlertChange,
  flaggedWords = [],
}) => {
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Viết đánh giá</DialogTitle>
          <DialogDescription>Chia sẻ trải nghiệm của bạn với {coachName || "HLV này"}</DialogDescription>
        </DialogHeader>
        <form className="space-y-6 py-4" onSubmit={onSubmit}>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {/* Loại đánh giá (cố định là HLV) */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Loại đánh giá</Label>
            <Badge className="bg-green-600 text-white">Huấn luyện viên</Badge>
          </div>

          {/* Điểm đánh giá */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Điểm đánh giá</Label>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => onHoveredRatingChange(star)}
                    onMouseLeave={() => onHoveredRatingChange(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${star <= (hoveredRating || reviewRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <span className="text-sm font-semibold text-muted-foreground ml-2">
                  {reviewRating}.0
                </span>
              )}
            </div>
          </div>

          {/* Bình luận */}
          <div className="space-y-2">
            <Label htmlFor="review-comment" className="text-sm font-semibold">
              Nhận xét
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Nhập nội dung đánh giá của bạn (Vui lòng không sử dụng từ ngữ thô tục)..."
              value={reviewComment}
              onChange={(e) => onCommentChange(e.target.value)}
              className="resize-none min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground italic">
              * Vui lòng sử dụng ngôn từ lịch sự. Các đánh giá chứa từ ngữ thô tục sẽ bị hệ thống từ chối.
            </p>
          </div>

          {/* Nút hành động */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 hover:bg-muted bg-transparent"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>

      {/* Profanity Warning Alert Dialog */}
      <AlertDialog open={showProfanityAlert} onOpenChange={onProfanityAlertChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Phát hiện từ ngữ không phù hợp
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Hệ thống phát hiện nội dung đánh giá của bạn có chứa các từ ngữ chưa phù hợp với tiêu chuẩn cộng đồng.
              </p>
              {flaggedWords.length > 0 && (
                <div className="bg-red-50 p-3 rounded-md border border-red-100">
                  <span className="font-semibold text-red-700 text-sm">Các từ bị đánh dấu: </span>
                  <span className="text-red-600 text-sm italic">{flaggedWords.join(', ')}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Vui lòng điều chỉnh lại câu từ lịch sự để tiếp tục gửi đánh giá.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => onProfanityAlertChange?.(false)} 
              className="bg-red-600 hover:bg-red-700"
            >
              Đã hiểu, tôi sẽ chỉnh sửa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
