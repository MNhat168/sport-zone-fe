import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  url: string;
  alt: string;
}

interface GallerySectionProps {
  images: GalleryImage[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  images,
  currentIndex,
  onNext,
  onPrev,
}) => {
  return (
    <Card
      id="gallery"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Thư viện ảnh</CardTitle>
        </div>
        <hr className="my-2 border-gray-200 w-full" />
      </CardHeader>
      <CardContent>
        <div className="relative px-12">
          {/* Mũi tên trái */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Vùng ảnh */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / 3 + 1.33)
                }%)`,
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="shrink-0 w-[calc(33.333%-0.67rem)] aspect-3/4 rounded-lg overflow-hidden"
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mũi tên phải */}
          <Button
            variant="secondary"
            size="icon"
            onClick={onNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

