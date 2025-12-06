import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BioSectionProps {
  coachData: any;
}

export const BioSection: React.FC<BioSectionProps> = ({ coachData }) => {
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
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground text-left">
            Họ và tên: {coachData?.name ?? "-"}
          </p>
          <p className="text-left">
            Kinh nghiệm: {coachData?.coachingDetails?.experience ?? "-"}
          </p>
          <p className="text-left">
            Chứng chỉ: {coachData?.coachingDetails?.certification ?? "-"}
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
};

