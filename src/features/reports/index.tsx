import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useUpdateReportStatusMutation,
  type Report,
} from '@/store/services/reportsApi'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DocumentViewer } from '@/features/field-owners/components/document-viewer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  formatDateTime,
  getReportCategoryLabel,
  getReportStatusMeta,
  formatReporter,
} from './data/data'
import { ReportsTable } from './components/reports-table'

const route = getRouteApi('/_authenticated/reports/')

export function Reports() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [viewerState, setViewerState] = useState({
    open: false,
    images: [] as string[],
    title: '',
  })
  const [noImageDialogOpen, setNoImageDialogOpen] = useState(false)

  const { data: selectedReport } = useGetReportByIdQuery(selectedId!, {
    skip: !selectedId,
  })
  const [updateStatus] = useUpdateReportStatusMutation()

  const statusFilter =
    search.status && search.status.length > 0 ? search.status : undefined
  const categoryFilter =
    search.category && search.category.length > 0
      ? search.category
      : undefined

  const { data, isFetching, refetch } = useGetReportsQuery({
    page: search.page || 1,
    limit: search.limit || 20,
    search: search.search || undefined,
    status: statusFilter,
    category: categoryFilter,
  })

  const tableData = data?.data ?? []
  const meta = {
    total: data?.total ?? 0,
    limit: data?.limit ?? (search.limit ?? 20),
  }

  const handleViewReport = (report: Report) => {
    setSelectedId(report._id)
    setDetailOpen(true)
  }

  const handleCloseDetail = (open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      setSelectedId(null)
      setViewerState({ open: false, images: [], title: '' })
    }
  }

  const handleStatusChange = async (status: Report['status'], reportId: string) => {
    await updateStatus({ id: reportId, status })
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
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Reports</h2>
            <p className='text-muted-foreground'>
              Theo dõi và xử lý báo cáo do người dùng gửi lên hệ thống.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => refetch()} disabled={isFetching}>
              Làm mới
            </Button>
          </div>
        </div>

        <ReportsTable
          data={tableData}
          total={meta.total}
          limit={meta.limit}
          isLoading={isFetching}
          search={search}
          navigate={navigate}
          onViewReport={handleViewReport}
        />

        <Dialog open={detailOpen} onOpenChange={handleCloseDetail}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>Chi tiết báo cáo</DialogTitle>
              {selectedReport && (
                <DialogDescription>
                  ID: {selectedReport._id} · Cập nhật:{' '}
                  {formatDateTime(selectedReport.lastActivityAt)}
                </DialogDescription>
              )}
            </DialogHeader>

            {selectedReport ? (
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>
                    Loại báo cáo
                  </Label>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>
                      {getReportCategoryLabel(selectedReport.category)}
                    </span>
                    <Badge variant={getReportStatusMeta(selectedReport.status).variant}>
                      {getReportStatusMeta(selectedReport.status).label}
                    </Badge>
                  </div>
                </div>

                {selectedReport.description && (
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>
                      Mô tả
                    </Label>
                    <p className='text-sm whitespace-pre-wrap border rounded-md p-2 bg-muted/40'>
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>
                      Người báo cáo
                    </Label>
                    <p className='text-sm'>
                      {formatReporter(selectedReport.reporter)}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <Label className='text-xs text-muted-foreground'>
                      Sân
                    </Label>
                    <p className='text-sm'>
                      {typeof selectedReport.field === 'string'
                        ? selectedReport.field
                        : (selectedReport.field?.name ?? '—')}
                    </p>
                  </div>
                </div>

                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      openImages(
                        selectedReport.initialAttachments,
                        'Ảnh báo cáo ban đầu'
                      )
                    }
                  >
                    Xem ảnh báo cáo (
                      {selectedReport.initialAttachments?.length ?? 0}
                    )
                  </Button>
                  <div className='flex items-center gap-2'>
                    <Label className='text-xs'>Trạng thái</Label>
                    <Select
                      defaultValue={selectedReport.status}
                      onValueChange={(value) =>
                        handleStatusChange(value as Report['status'], selectedReport._id)
                      }
                    >
                      <SelectTrigger className='h-8 w-[160px] text-xs'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='open'>open</SelectItem>
                        <SelectItem value='in_review'>in_review</SelectItem>
                        <SelectItem value='resolved'>resolved</SelectItem>
                        <SelectItem value='closed'>closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground'>Đang tải dữ liệu...</p>
            )}
          </DialogContent>
        </Dialog>

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
                Bản ghi này chưa có ảnh kèm theo. Vui lòng kiểm tra các báo cáo khác để
                tham khảo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setNoImageDialogOpen(false)}>
                Đã hiểu
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Main>
    </>
  )
}