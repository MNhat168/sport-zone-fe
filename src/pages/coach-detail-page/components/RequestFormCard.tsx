import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestFormCardProps {
  showForm: boolean;
  onToggleForm: () => void;
}

export const RequestFormCard: React.FC<RequestFormCardProps> = ({
  showForm,
  onToggleForm,
}) => {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg text-left">Yêu cầu lịch trống</CardTitle>
        <hr className="my-2 border-gray-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        {!showForm ? (
          <Button
            variant="outline"
            className="w-full hover:bg-green-50 hover:border-green-500 transition-all duration-300 bg-transparent"
            onClick={onToggleForm}
          >
            Mở biểu mẫu yêu cầu
          </Button>
        ) : (
          <form className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" placeholder="Nhập họ và tên" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Chọn thành phố</Label>
              <Select>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="la">Los Angeles</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Chi tiết</Label>
              <Textarea
                id="details"
                placeholder="Nhập nội dung"
                rows={3}
              />
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1" />
              <Label
                htmlFor="terms"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Bằng việc nhấn "Gửi yêu cầu" tôi đồng ý với Điều khoản dịch vụ của Dreamcoach
              </Label>
            </div>
            <Button className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white h-11 font-semibold hover:scale-[1.02] transition-transform duration-300">
              Gửi yêu cầu
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

