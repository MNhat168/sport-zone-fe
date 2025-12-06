import React, { useEffect, useState } from 'react'
import axiosPrivate from '@/utils/axios/axiosPrivate'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ReportItem {
  _id: string
  category: string
  status: 'open'|'in_review'|'resolved'|'closed'
  lastActivityAt: string
  createdAt: string
}

interface ListResponse {
  data: ReportItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

export default function MyReportsPage() {
  const [items, setItems] = useState<ReportItem[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = async (nextPage: number, q?: string) => {
    setLoading(true)
    try {
      const res = await axiosPrivate.get<ListResponse>('/reports', {
        params: { page: nextPage, limit: 10, search: q || undefined },
      })
      const payload = (res.data as any)?.data ? res.data : (res.data as any)
      if (nextPage === 1) setItems(payload.data)
      else setItems((prev) => [...prev, ...payload.data])
      setPage(nextPage)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể tải danh sách báo cáo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(1, search.trim() || undefined)
  }

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <h1 className='text-xl font-semibold mb-3'>Báo cáo của tôi</h1>

      <form onSubmit={onSearch} className='flex items-center gap-2 mb-3'>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Tìm theo nội dung...' />
        <Button type='submit' disabled={loading}>Tìm</Button>
      </form>

      <div className='rounded-md border bg-white'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='text-left p-3'>Loại</th>
              <th className='text-left p-3'>Trạng thái</th>
              <th className='text-left p-3'>Hoạt động gần nhất</th>
              <th className='text-left p-3'>Thời gian tạo</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id} className='border-t'>
                <td className='p-3'>{r.category}</td>
                <td className='p-3'>{r.status}</td>
                <td className='p-3'>{new Date(r.lastActivityAt).toLocaleString()}</td>
                <td className='p-3'>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className='p-3 text-muted-foreground' colSpan={4}>Chưa có báo cáo nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className='mt-3 flex justify-end'>
        <Button variant='secondaryOutline' disabled={loading} onClick={() => load(page + 1)}>Tải thêm</Button>
      </div>
    </div>
  )
}