import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { useRef } from "react";

interface GalleryImage {
  url: string;
  alt: string;
}

interface GallerySectionProps {
  images: GalleryImage[];
  currentIndex: number;
  isEditMode?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onUpload?: (files: FileList) => void;
  onDelete?: (index: number) => void;
}

export function GallerySection({
  images,
  currentIndex,
  isEditMode = false,
  onNext,
  onPrev,
  onUpload,
  onDelete,
}: GallerySectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload?.(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <Card
      id="gallery"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Thư viện ảnh</CardTitle>
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-green-50 hover:border-green-500"
            >
              <Upload className="h-4 w-4 mr-2" />
              Tải ảnh lên
            </Button>
          )}
        </div>
        <hr className="my-2 border-gray-200 w-full" />
      </CardHeader>
      <CardContent>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {images.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có ảnh nào</p>
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Tải ảnh đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div className="relative px-12">
            {/* Mũi tên trái */}
            <Button
              variant="secondary"
              size="icon"
              onClick={onPrev}
              disabled={images.length <= 3}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Vùng ảnh */}
            <div className="overflow-hidden">
              <div
                className="flex gap-4 transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / 3 + 1.33)
                    }%)`,
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-[calc(33.333%-0.67rem)] aspect-[3/4] rounded-lg overflow-hidden relative group"
                  >
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {isEditMode && onDelete && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => onDelete(index)}
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mũi tên phải */}
            <Button
              variant="secondary"
              size="icon"
              onClick={onNext}
              disabled={images.length <= 3}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

