import { useState, useEffect } from 'react'
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DocumentViewerProps {
  images: string[]
  title?: string
  isOpen: boolean
  onClose: () => void
  currentIndex?: number
}

export function DocumentViewer({
  images,
  title = 'Document Viewer',
  isOpen,
  onClose,
  currentIndex = 0,
}: DocumentViewerProps) {
  const [selectedIndex, setSelectedIndex] = useState(currentIndex)
  const [zoom, setZoom] = useState(100)

  // Update selected index when currentIndex prop changes
  useEffect(() => {
    if (isOpen && currentIndex >= 0 && currentIndex < images.length) {
      setSelectedIndex(currentIndex)
    }
  }, [isOpen, currentIndex, images.length])

  const currentImage = images[selectedIndex]

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a')
      link.href = currentImage
      link.download = `document-${selectedIndex + 1}.jpg`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleResetZoom = () => {
    setZoom(100)
  }

  if (!isOpen || images.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
        <DialogHeader className='px-6 pt-6'>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col h-full'>
          {/* Toolbar */}
          <div className='flex items-center justify-between px-6 py-3 border-b'>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className='h-4 w-4' />
              </Button>
              <span className='text-sm font-medium min-w-[60px] text-center'>
                {zoom}%
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={handleZoomIn}
                disabled={zoom >= 200}
              >
                <ZoomIn className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={handleResetZoom}>
                Reset
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleDownload}>
                <Download className='h-4 w-4 mr-2' />
                Download
              </Button>
              <Button variant='ghost' size='sm' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Image Display */}
          <ScrollArea className='flex-1 px-6 py-4'>
            <div className='flex justify-center items-center min-h-[400px]'>
              <img
                src={currentImage}
                alt={`Document ${selectedIndex + 1}`}
                className='max-w-full max-h-[70vh] object-contain transition-transform'
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          </ScrollArea>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className='border-t px-6 py-4'>
              <div className='flex gap-2 overflow-x-auto'>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedIndex(index)
                      setZoom(100)
                    }}
                    className={`flex-shrink-0 border-2 rounded-md overflow-hidden transition-all ${
                      selectedIndex === index
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className='w-20 h-20 object-cover'
                    />
                  </button>
                ))}
              </div>
              <div className='text-sm text-muted-foreground mt-2 text-center'>
                {selectedIndex + 1} of {images.length}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

