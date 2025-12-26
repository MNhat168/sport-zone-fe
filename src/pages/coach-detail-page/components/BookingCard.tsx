import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface BookingCardProps {
  coachData: any;
  onBookNow: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  coachData,
  onBookNow,
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="space-y-4 pb-6">
        <CardTitle className="text-2xl font-bold text-left">Đặt huấn luyện viên</CardTitle>
        <hr className="my-2 border-gray-200" />

        <p className="text-base text-muted-foreground text-left">
          <span className="font-semibold text-foreground">
            {coachData?.name ?? "-"}
          </span>{" "}
          đang sẵn sàng
        </p>

        <div className="text-center py-6 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Giá từ</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-green-600">
              {coachData?.price 
                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coachData.price)
                : "-"}
            </span>
            <span className="text-lg text-muted-foreground">/giờ</span>
          </div>
        </div>

        <Button 
          className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          onClick={onBookNow}
        >
          <Calendar className="mr-2 h-5 w-5" />
          Đặt ngay
        </Button>
      </CardHeader>
    </Card>
  );
};

