'use client'

import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '@/store/hook'
import { getVerificationStatus, getMyBankAccounts } from '@/features/bank-account'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react'
import { Loading } from '@/components/ui/loading'
import { CustomSuccessToast, CustomFailedToast } from '@/components/toast/notificiation-toast'

// QR Code Display component
const QRCodeDisplay = ({ data }: { data: string }) => {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`

  return (
    <img
      src={qrImageUrl}
      alt="QR Code"
      className="w-[300px] h-[300px] object-contain mx-auto"
      onError={(e) => {
        // Fallback to Google Charts API
        (e.target as HTMLImageElement).src = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(data)}`
      }}
    />
  )
}

interface BankAccountVerificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  verificationUrl?: string
  qrCodeUrl?: string
}

export function BankAccountVerificationModal({
  open,
  onOpenChange,
  accountId,
  verificationUrl,
  qrCodeUrl,
}: BankAccountVerificationModalProps) {
  const dispatch = useAppDispatch()
  const [status, setStatus] = useState<'pending' | 'verified' | 'failed'>('pending')
  const [polling, setPolling] = useState(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const maxPollingAttempts = 100 // 5 minutes (100 * 3 seconds)

  const [currentQrCodeUrl, setCurrentQrCodeUrl] = useState(qrCodeUrl)
  const [currentVerificationUrl, setCurrentVerificationUrl] = useState(verificationUrl)

  // Reset state when props change
  useEffect(() => {
    setCurrentQrCodeUrl(qrCodeUrl)
    setCurrentVerificationUrl(verificationUrl)
  }, [qrCodeUrl, verificationUrl])

  // Start polling when modal opens
  useEffect(() => {
    if (open && accountId) {
      setPolling(true)
      setPollingAttempts(0)
      startPolling()
    }

    return () => {
      stopPolling()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accountId])

  const startPolling = () => {
    stopPolling() // Clear any existing interval
    let attempts = 0

    pollingIntervalRef.current = setInterval(async () => {
      try {
        attempts++
        const result = await dispatch(getVerificationStatus(accountId)).unwrap()

        setPollingAttempts(attempts)
        setStatus(result.status)

        if (result.qrCodeUrl) setCurrentQrCodeUrl(result.qrCodeUrl)
        if (result.verificationUrl) setCurrentVerificationUrl(result.verificationUrl)

        const noLongerNeedsVerification = result.needsVerification === false

        if (result.status === 'verified' || noLongerNeedsVerification || result.status === 'failed' || attempts >= maxPollingAttempts) {
          stopPolling()
          if (result.status === 'verified' || noLongerNeedsVerification) {
            CustomSuccessToast('Tài khoản đã được xác thực thành công!')
            // Refresh account list
            dispatch(getMyBankAccounts())
            // Close modal after 2 seconds
            setTimeout(() => {
              onOpenChange(false)
            }, 2000)
          } else if (result.status === 'failed') {
            CustomFailedToast('Xác thực thất bại. Vui lòng thử lại.')
          } else if (attempts >= maxPollingAttempts) {
            CustomFailedToast('Hết thời gian chờ. Vui lòng kiểm tra lại sau.')
          }
        }
      } catch (error: any) {
        console.error('Error polling verification status:', error)
        if (attempts >= maxPollingAttempts) {
          stopPolling()
        }
      }
    }, 3000) // Poll every 3 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setPolling(false)
  }

  const handleRetry = () => {
    setPollingAttempts(0)
    startPolling()
  }

  const handleOpenPaymentUrl = () => {
    if (currentVerificationUrl) {
      window.open(currentVerificationUrl, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xác thực tài khoản ngân hàng</DialogTitle>
          <DialogDescription>
            Vui lòng thanh toán 10,000 VND để xác thực tài khoản của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            {status === 'pending' && (
              <Badge className="bg-yellow-500">
                <Loading size={12} className="mr-1" />
                Đang chờ thanh toán
              </Badge>
            )}
            {status === 'verified' && (
              <Badge className="bg-green-500">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Đã xác thực
              </Badge>
            )}
            {status === 'failed' && (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Xác thực thất bại
              </Badge>
            )}
          </div>

          {/* QR Code */}
          {status === 'pending' && (currentQrCodeUrl || currentVerificationUrl) && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg border-4 border-green-500 shadow-xl">
                {currentQrCodeUrl ? (
                  <img
                    src={currentQrCodeUrl}
                    alt="QR Code"
                    className="w-[300px] h-[300px] object-contain"
                  />
                ) : (
                  <QRCodeDisplay data={currentVerificationUrl || ''} />
                )}
              </div>
            </div>
          )}

          {/* Success Icon */}
          {status === 'verified' && (
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
            </div>
          )}

          {/* Instructions */}
          {status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Hướng dẫn thanh toán:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Mở ứng dụng Banking trên điện thoại</li>
                <li>Chọn chức năng "Quét mã QR" hoặc "Chuyển khoản"</li>
                <li>Quét mã QR bên trên hoặc nhập số tài khoản</li>
                <li>Chuyển 10,000 VND để xác thực</li>
                <li>Hệ thống sẽ tự động xác thực sau khi nhận được thanh toán</li>
              </ol>
            </div>
          )}

          {/* Payment URL Link */}
          {status === 'pending' && currentVerificationUrl && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleOpenPaymentUrl}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Mở link thanh toán
              </Button>
            </div>
          )}

          {/* Polling Status */}
          {polling && status === 'pending' && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Đang kiểm tra trạng thái thanh toán...</p>
              <p className="text-xs mt-1">
                ({pollingAttempts}/{maxPollingAttempts} lần kiểm tra)
              </p>
            </div>
          )}

          {/* Retry Button */}
          {status === 'failed' && (
            <div className="flex justify-center">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

