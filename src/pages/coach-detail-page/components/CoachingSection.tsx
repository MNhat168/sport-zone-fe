import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CoachingSection: React.FC = () => {
  return (
    <Card
      id="coaching"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <CardTitle className="text-xl text-left">Huấn luyện</CardTitle>
        <hr className="my-2 border-gray-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed text-left">
          Trải nghiệm huấn luyện cá nhân hóa phù hợp với nhu cầu của bạn.
          Dù là 1 kèm 1 hay nhóm nhỏ, hãy phát huy tối đa tiềm năng của bạn.
        </p>
      </CardContent>
    </Card>
  );
};

