import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Loading } from "@/components/ui/loading";
import { Star } from "lucide-react";

interface ReviewsSectionProps {
  coachData: any;
  coachStats?: { totalReviews: number; averageRating: number } | null;
  coachReviews: any[];
  filteredReviews: any[];
  reviewsLoading: boolean;
  reviewsPage: number;
  reviewsTotalPages: number;
  selectedRatingFilter: number | null;
  onFilterChange: (rating: number | null) => void;
  onLoadMore: (page: number) => void;
  onWriteReview: () => void;
  /**
   * Whether to show the "Viết đánh giá" button. Defaults to true.
   * Set to false when the parent page should hide the write-review CTA.
   */
  showWriteReview?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  coachData,
  coachStats = null,
  coachReviews,
  filteredReviews,
  reviewsLoading,
  reviewsPage,
  reviewsTotalPages,
  selectedRatingFilter,
  onFilterChange,
  onLoadMore,
  onWriteReview,
  showWriteReview = true,
}) => {
  const reviewsRef = useRef<HTMLDivElement | null>(null);
  // Note: do not auto-scroll when page changes; keep user position stable
  const avgRating = coachStats?.averageRating ?? (coachData?.rating ? Number(coachData.rating) : 0);
  const totalReviews = coachStats?.totalReviews ?? (coachData as any)?.numberOfReviews ?? coachReviews.length ?? 0;
  return (
    <Card
      id="reviews"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
      ref={reviewsRef}
    >
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Đánh giá</CardTitle>
          {showWriteReview && (
            <Button
              onClick={onWriteReview}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Viết đánh giá
            </Button>
          )}
        </div>
        <hr className="my-2 border-gray-200 w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Only show rating summary if there are reviews */}
        {Array.isArray(coachReviews) && coachReviews.length > 0 && (
          <div className="p-6 bg-amber-50 rounded-lg border border-amber-100">
            <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
              {/* Bên trái - Điểm trung bình */}
              <div className="flex flex-col items-center justify-center space-y-2 min-w-[180px]">
                <div className="text-6xl font-bold text-foreground">
                  {avgRating ? Number(avgRating).toFixed(1) : '0.0'}
                </div>
                <div className="text-sm text-muted-foreground">
                  trên 5.0
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const rating = avgRating;
                    return (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalReviews} đánh giá
                </div>
              </div>

              {/* Bên phải - Chỉ số chất lượng */}
              <div className="space-y-1">
                {coachReviews.length > 0 && (
                  <>
                    <p className="text-sm font-semibold mb-3 text-left">
                      Được {Math.round((coachReviews.filter((r: any) => (r.rating || 0) >= 4).length / coachReviews.length) * 100)}% người chơi khuyến nghị
                    </p>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                      {[{ label: "Chất lượng dịch vụ", value: avgRating * 20 }].map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {metric.label}
                            </span>
                            <span className="font-semibold">
                              {avgRating ? Number(avgRating).toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <Progress
                            value={metric.value}
                            className="h-1.5 bg-amber-200 [&>div]:bg-orange-500"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Filter toolbar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Bộ lọc:</span>
            {[null, 5, 4, 3, 2, 1].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => onFilterChange(val as number | null)}
                className={`text-sm px-3 py-1 rounded-full border transition focus:outline-none ${
                  (selectedRatingFilter === val || (val === null && selectedRatingFilter === null))
                    ? 'bg-amber-300 border-amber-400'
                    : 'bg-transparent border-muted hover:bg-muted/30'
                }`}
              >
                {val === null ? 'Tất cả' : `${val}★`}
              </button>
            ))}
          </div>

          {reviewsLoading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Loading size={24} className="text-green-600" />
              <div className="text-gray-500 text-xs">Đang tải đánh giá...</div>
            </div>
          ) : Array.isArray(coachReviews) && coachReviews.length > 0 ? (
            filteredReviews && filteredReviews.length > 0 ? (
              filteredReviews.map((r: any, idx: number) => {
                const author = r.user?.fullName || 'Anonymous';
                const rating = r.rating || 0;
                const comment = r.comment || '';
                const dateStr = r.createdAt || r.booking?.createdAt;
                const date = dateStr ? new Date(dateStr).toLocaleDateString() : '';
                return (
                  <Card key={idx} className="shadow-md hover:shadow-lg transition-all duration-300 border border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src="/placeholder.svg?height=48&width=48" />
                          <AvatarFallback className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
                            {author
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-left">{author}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, s) => (
                                    <Star
                                      key={s}
                                      className={`h-4 w-4 ${s < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="flex items-start">
                                <Badge className="bg-green-600 text-white font-medium">
                                  Coach Review
                                </Badge>
                            </div>
                          </div>

                          {/* badge moved to header */}

                          <div>
                            {/* <h5 className="font-bold text-base mb-2 text-left">{comment.slice(0, 120)}</h5> */}
                            <p className="text-muted-foreground leading-relaxed text-left">{comment}</p>
                          </div>

                          <div className="text-xs text-muted-foreground text-left">{date}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-muted-foreground">Không có đánh giá phù hợp.</div>
            )
          ) : (
            <div className="text-muted-foreground">Chưa có đánh giá.</div>
          )}
        </div>

        {/* Pagination Controls */}
        {coachReviews.length > 0 && reviewsTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (reviewsLoading || reviewsPage <= 1) return;
                onLoadMore(reviewsPage - 1);
              }}
              disabled={reviewsLoading || reviewsPage <= 1}
            >
              <span className="sr-only">Trang trước</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </Button>

            {reviewsLoading ? (
              <div className="px-3">
                <Loading size={16} className="text-green-600" />
              </div>
            ) : (
              Array.from({ length: reviewsTotalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === reviewsPage ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${page === reviewsPage ? "bg-green-600 text-white hover:bg-green-700" : "hover:bg-gray-50"}`}
                  onClick={() => {
                    if (reviewsLoading || page === reviewsPage) return;
                    onLoadMore(page);
                  }}
                  disabled={reviewsLoading}
                >
                  {page}
                </Button>
              ))
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                if (reviewsLoading || reviewsPage >= reviewsTotalPages) return;
                onLoadMore(reviewsPage + 1);
              }}
              disabled={reviewsLoading || reviewsPage >= reviewsTotalPages}
            >
              <span className="sr-only">Trang sau</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

