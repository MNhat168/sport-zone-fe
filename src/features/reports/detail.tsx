import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DocumentViewer } from '@/features/field-owners/components/document-viewer'
import {
  useGetReportByIdQuery,
  useUpdateReportStatusMutation,
  type Report,
} from '@/store/services/reportsApi'

export function ReportDetail() {
  const route = getRouteApi('/_authenticated/reports/$reportId')
  const { reportId } = route.useParams()

  const { data: report } = useGetReportByIdQuery(reportId)
  const [updateStatus] = useUpdateReportStatusMutation()
  const [viewerState, setViewerState] = useState({
    open: false,
    images: [] as string[],
    title: '',
  })
  const [noImageDialogOpen, setNoImageDialogOpen] = useState(false)

  const onStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await updateStatus({ id: reportId, status: e.target.value as Report['status'] })
  }

  const openImages = (images: string[] | undefined | null, title: string) => {
    if (!images || images.length === 0) {
      setViewerState({ open: false, images: [], title })
      setNoImageDialogOpen(true)
      return
    }
    setViewerState({ open: true, images, title })
  }

  const closeViewer = () => {
    setViewerState((prev) => ({ ...prev, open: false }))
  }

  const initialAttachmentCount = report?.initialAttachments?.length ?? 0

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Report detail</h2>
            <p className='text-muted-foreground'>ID: {reportId}</p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => openImages(report?.initialAttachments, 'Ảnh báo cáo ban đầu')}
            >
              Xem ảnh báo cáo ({initialAttachmentCount})
            </Button>
            <div className='flex items-center gap-2'>
              <Label className='text-xs'>Status</Label>
              <select
                defaultValue={report?.status}
                onChange={onStatus}
                className='border rounded-md px-2 py-1 text-sm'
              >
                <option value='open'>open</option>
                <option value='in_review'>in_review</option>
                <option value='resolved'>resolved</option>
                <option value='closed'>closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Không còn UI chat/report thread ở admin */}
      </Main>
      <DocumentViewer
        images={viewerState.images}
        title={viewerState.title}
        isOpen={viewerState.open && viewerState.images.length > 0}
        onClose={closeViewer}
      />
      <AlertDialog open={noImageDialogOpen} onOpenChange={setNoImageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Không có ảnh đính kèm</AlertDialogTitle>
            <AlertDialogDescription>
              Bản ghi này chưa có ảnh kèm theo. Vui lòng kiểm tra các báo cáo khác để tham khảo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setNoImageDialogOpen(false)}>Đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}