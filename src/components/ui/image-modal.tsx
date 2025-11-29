import { useEffect, useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-react';

type Orientation = 'landscape' | 'portrait';

interface ImageModalProps {
    /** Array of image URLs to display */
    images: string[];
    /** Current selected image index */
    currentIndex: number;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal open state changes */
    onOpenChange: (open: boolean) => void;
    /** Title for the modal */
    title?: string;
    /** Alt text prefix for images (e.g., "Ảnh sân") */
    altTextPrefix?: string;
    /** Whether to show navigation controls (only shown if images.length > 1) */
    showNavigation?: boolean;
    /** Whether to show thumbnail navigation (only shown if images.length > 1) */
    showThumbnails?: boolean;
}

/**
 * Reusable Image Modal Component
 * 
 * Displays images in a full-screen modal with navigation support.
 * Supports both single images and image galleries with navigation.
 * 
 * @example
 * ```tsx
 * <ImageModal
 *   images={['url1.jpg', 'url2.jpg']}
 *   currentIndex={0}
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Field Images"
 *   altTextPrefix="Ảnh sân"
 * />
 * ```
 */
export function ImageModal({
    images,
    currentIndex: initialIndex,
    isOpen,
    onOpenChange,
    title,
    altTextPrefix = 'Image',
    showNavigation = true,
    showThumbnails = true,
}: ImageModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [imageError, setImageError] = useState<{ [key: number]: boolean }>({});
    const [zoom, setZoom] = useState(100);
    const [orientation, setOrientation] = useState<Orientation>('landscape');
    const [isPanning, setIsPanning] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Update current index when initialIndex changes
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [initialIndex, isOpen]);

    // Reset errors and zoom when modal opens
    useEffect(() => {
        if (isOpen) {
            setImageError({});
            setZoom(100);
        }
    }, [isOpen]);

    // Reset zoom when image changes
    useEffect(() => {
        setZoom(100);
        setPanOffset({ x: 0, y: 0 });
    }, [currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen || images.length <= 1) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentIndex(
                    currentIndex > 0 ? currentIndex - 1 : images.length - 1
                );
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentIndex(
                    currentIndex < images.length - 1 ? currentIndex + 1 : 0
                );
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onOpenChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex, images.length, onOpenChange]);

    if (!isOpen || images.length === 0) return null;

    const currentImage = images[currentIndex];
    const hasMultipleImages = images.length > 1;
    const showNavControls = hasMultipleImages && showNavigation;
    const showThumbnailNav = hasMultipleImages && showThumbnails;

    const handlePrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
    };

    const handleThumbnailClick = (index: number) => {
        setCurrentIndex(index);
    };

    const handleImageError = () => {
        setImageError((prev) => ({ ...prev, [currentIndex]: true }));
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 25, 300));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 25, 50));
    };

    const handleResetZoom = () => {
        setZoom(100);
        setPanOffset({ x: 0, y: 0 });
    };

    const toggleOrientation = () => {
        setOrientation(prev => prev === 'landscape' ? 'portrait' : 'landscape');
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 100) {
            setIsPanning(true);
            setStartPan({
                x: e.clientX - panOffset.x,
                y: e.clientY - panOffset.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning && zoom > 100) {
            const newX = e.clientX - startPan.x;
            const newY = e.clientY - startPan.y;
            
            // Giới hạn pan trong phạm vi hợp lý dựa trên zoom level
            const maxPan = (zoom - 100) * 3; // Tăng giới hạn theo zoom level
            
            setPanOffset({
                x: Math.max(Math.min(newX, maxPan), -maxPan),
                y: Math.max(Math.min(newY, maxPan), -maxPan)
            });
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleMouseLeave = () => {
        setIsPanning(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className={`${orientation === 'landscape' ? 'max-w-[calc(100%-2rem)] sm:max-w-5xl' : 'max-w-[calc(100%-2rem)] sm:max-w-2xl'} w-full p-0 max-h-[90vh]`}>
                <DialogHeader className="px-6 pt-6 pb-4 pr-14">
                    <div className="flex items-center justify-between gap-4">
                        <DialogTitle className="flex-shrink min-w-0">
                            {title || (
                                hasMultipleImages
                                    ? `${altTextPrefix} ${currentIndex + 1} / ${images.length}`
                                    : title || altTextPrefix
                            )}
                        </DialogTitle>
                        {/* Zoom Controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleOrientation}
                                title={orientation === 'landscape' ? 'Chuyển sang Portrait' : 'Chuyển sang Landscape'}
                            >
                                {orientation === 'landscape' ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </Button>
                            <div className="w-px h-6 bg-gray-300" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleZoomOut}
                                disabled={zoom <= 50}
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium min-w-[60px] text-center">
                                {zoom}%
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleZoomIn}
                                disabled={zoom >= 300}
                                title="Zoom In"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetZoom}
                                disabled={zoom === 100}
                                title="Reset Zoom"
                            >
                                <RotateCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div className="relative px-6 pb-6">
                    {/* Image Display */}
                    <div 
                        ref={imageContainerRef}
                        className={`relative w-full bg-gray-100 rounded-lg mb-4 overflow-hidden ${
                            orientation === 'landscape' 
                                ? 'min-h-[60vh] max-h-[80vh]' 
                                : 'h-[70vh]'
                        }`}
                        style={{
                            cursor: zoom > 100 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                        }}
                    >
                        <div
                            className="w-full h-full flex items-center justify-center"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseLeave}
                        >
                            {!imageError[currentIndex] && currentImage ? (
                                <img
                                    src={currentImage}
                                    alt={`${altTextPrefix} ${currentIndex + 1}`}
                                    className="select-none transition-transform duration-200"
                                    style={{
                                        transform: `scale(${zoom / 100}) translate(${panOffset.x / (zoom / 100)}px, ${panOffset.y / (zoom / 100)}px)`,
                                        transformOrigin: 'center center',
                                        maxWidth: '100%',
                                        maxHeight: orientation === 'landscape' ? '80vh' : '70vh',
                                        objectFit: 'contain',
                                    }}
                                    onError={handleImageError}
                                    draggable={false}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <ImageIcon className="w-16 h-16 mb-4" />
                                    <p>Không thể tải hình ảnh</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    {showNavControls && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg z-10"
                                onClick={handleNext}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </>
                    )}

                    {/* Thumbnail Navigation */}
                    {showThumbnailNav && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((imageUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`shrink-0 border-2 rounded-md overflow-hidden transition-all ${
                                        currentIndex === index
                                            ? 'border-primary ring-2 ring-primary'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-16 h-16 object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}