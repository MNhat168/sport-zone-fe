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
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

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
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Viết đánh giá</DialogTitle>
          <DialogDescription>Chia sẻ trải nghiệm của bạn với {coachName || "HLV này"}</DialogDescription>
        </DialogHeader>
        <form className="space-y-6 py-4" onSubmit={onSubmit}>
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
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || reviewRating)
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
              Bình luận
            </Label>
            <Textarea
              id="review-comment"
              placeholder="Chia sẻ trải nghiệm của bạn với HLV này..."
              rows={6}
              className="resize-none"
              value={reviewComment}
              onChange={(e) => onCommentChange(e.target.value)}
            />
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
  );
};

