import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axiosPrivate from '@/utils/axios/axiosPrivate'
import axiosUpload from '@/utils/axios/axiosUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ReportDTO {
  _id: string
  category: string
  status: 'open'|'in_review'|'resolved'|'closed'
  field?: { _id: string; name?: string } | string
  createdAt: string
  lastActivityAt: string
}

interface ReportMessageDTO {
  _id: string
  sender?: string
  senderRole: 'user'|'admin'
  content?: string
  attachments: string[]
  createdAt: string
}

type MessagesResponse = {
  data: ReportMessageDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
}

export default function ReportThreadPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [report, setReport] = useState<ReportDTO | null>(null)
  const [messages, setMessages] = useState<ReportMessageDTO[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await axiosPrivate.get(`/reports/${id}`)
        const data = res.data?.data || res.data
        if (mounted) setReport(data)
      } catch (e: any) {
        toast.error(e?.response?.data?.message || 'Không thể tải báo cáo')
      }
    })()
    return () => { mounted = false }
  }, [id])

  const loadMessages = async (nextPage: number) => {
    setLoading(true)
    try {
      const res = await axiosPrivate.get<MessagesResponse>(`/reports/${id}/messages`, {
        params: { page: nextPage, limit: 20 },
      })
      const raw = (res.data as any)?.data ? (res.data as any) : res.data
      const incoming = Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : Array.isArray(raw)
          ? raw
          : []
      setMessages((prev) => [...prev, ...incoming])
      setPage(nextPage)
      if (nextPage === 1) setTimeout(scrollToBottom, 100)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không thể tải tin nhắn')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMessages(1) }, [id])

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const remaining = Math.max(0, 3 - files.length)
    const take = selected.slice(0, remaining)
    setFiles((prev) => [...prev, ...take])
    e.currentTarget.value = ''
  }

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const send = async () => {
    if (!content.trim() && files.length === 0) {
      toast.error('Nhập nội dung hoặc đính kèm ít nhất 1 tệp')
      return
    }
    try {
      setSending(true)
      const form = new FormData()
      if (content.trim()) form.append('content', content.trim())
      files.forEach((f) => form.append('files', f))
      const res = await axiosUpload.post(`/reports/${id}/messages`, form)
      const msg = res.data?.data || res.data
      setMessages((prev) => [...prev, msg])
      setContent('')
      setFiles([])
      setTimeout(scrollToBottom, 100)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Gửi tin nhắn thất bại')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Trao đổi với quản trị viên</h1>
        {report && (
          <p className="text-sm text-muted-foreground">
            Loại: <span className="font-medium">{report.category}</span> · Trạng thái: <span className="font-medium">{report.status}</span>
          </p>
        )}
      </div>

      <div className="border rounded-md p-3 h-[60vh] overflow-auto bg-white">
        {messages.map((m) => (
          <div key={m._id} className={`mb-3 ${m.senderRole === 'user' ? 'text-right' : 'text-left'}`}>
            {m.content && (
              <div className={`inline-block px-3 py-2 rounded-md ${m.senderRole === 'user' ? 'bg-green-100' : 'bg-gray-100'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            )}
            {m.attachments?.length > 0 && (
              <ul className="mt-1 space-y-1">
                {m.attachments.map((url, i) => (
                  <li key={i}>
                    <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                      Tệp đính kèm {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button variant="secondaryOutline" disabled={loading} onClick={() => loadMessages(page + 1)}>Tải thêm</Button>
        <span className="text-xs text-muted-foreground">Tối đa 3 tệp đính kèm mỗi lần gửi</span>
      </div>

      <div className="mt-4 space-y-2">
        <Label>Nội dung</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập tin nhắn..." />
        <div className="flex items-center gap-2">
          <Input type="file" multiple onChange={onPickFiles} />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                  {f.name}
                  <button className="ml-1 text-red-600" onClick={() => removeFile(i)}>x</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={send} disabled={sending}>{sending ? 'Đang gửi...' : 'Gửi'}</Button>
        </div>
      </div>
    </div>
  )
}