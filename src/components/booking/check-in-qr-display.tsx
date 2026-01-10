import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { CheckInCountdown } from './check-in-countdown'

interface CheckInQRDisplayProps {
    bookingId: string
    startTime: Date
    onGenerateQR: () => Promise<{ token: string; expiresAt: string }>
    className?: string
}

export function CheckInQRDisplay({
    startTime,
    onGenerateQR,
    className = ''
}: CheckInQRDisplayProps) {
    const [qrToken, setQrToken] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<Date | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [canGenerate, setCanGenerate] = useState(false)
    const [windowStartTime, setWindowStartTime] = useState<Date | null>(null)
    const [lateWindowEndTime, setLateWindowEndTime] = useState<Date | null>(null)

    // Calculate window start time (15 minutes before match) and late window (60 minutes after)
    useEffect(() => {
        try {
            const matchTime = new Date(startTime)
            
            // Validate matchTime
            if (isNaN(matchTime.getTime())) {
                console.error('Invalid startTime in CheckInQRDisplay:', startTime)
                setWindowStartTime(null)
                setLateWindowEndTime(null)
                setCanGenerate(false)
                return
            }
            
            const windowStart = new Date(matchTime.getTime() - 15 * 60 * 1000)
            const lateWindowEnd = new Date(matchTime.getTime() + 60 * 60 * 1000) // 60 minutes after start
            setWindowStartTime(windowStart)
            setLateWindowEndTime(lateWindowEnd)

            // Check if we're within the allowed window (15 min before -> 60 min after start)
            const now = new Date()
            if (now >= windowStart && now <= lateWindowEnd) {
                setCanGenerate(true)
            } else {
                setCanGenerate(false)
            }
        } catch (error) {
            console.error('Error calculating check-in window:', error, { startTime })
            setWindowStartTime(null)
            setLateWindowEndTime(null)
            setCanGenerate(false)
        }
    }, [startTime])

    const handleGenerateQR = async () => {
        try {
            setIsGenerating(true)
            setError(null)

            const result = await onGenerateQR()
            
            if (!result || !result.token) {
                console.error('Invalid QR result:', result)
                throw new Error('Không nhận được mã QR từ server')
            }
            
            console.log('QR generated successfully:', { token: result.token.substring(0, 20) + '...', expiresAt: result.expiresAt })
            
            setQrToken(result.token)
            setExpiresAt(new Date(result.expiresAt))
        } catch (err: any) {
            console.error('Error in handleGenerateQR:', err)
            setError(err.message || 'Không thể tạo mã QR')
            setQrToken(null)
            setExpiresAt(null)
        } finally {
            setIsGenerating(false)
        }
    }

    const isExpired = () => {
        if (!expiresAt) return false
        return new Date() > expiresAt
    }

    // QR generated and displayed - show this first if QR exists
    if (qrToken && expiresAt) {
        const expired = isExpired()

        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        {/* Status Badge */}
                        <Badge
                            className={`${expired
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                                } px-4 py-1 text-sm font-medium`}
                        >
                            {expired ? '❌ Mã đã hết hạn' : '✅ Mã hợp lệ'}
                        </Badge>

                        {/* QR Code */}
                        <div
                            className={`p-6 bg-white rounded-xl border-4 ${expired ? 'border-red-300 opacity-50' : 'border-green-500'
                                } shadow-lg transition-all`}
                        >
                            <QRCodeSVG
                                value={qrToken}
                                size={240}
                                level="H"
                                includeMargin={false}
                            />
                        </div>

                        {/* Instructions */}
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold text-lg">
                                {expired ? 'Mã QR đã hết hạn' : 'Hiển thị mã cho nhân viên'}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {expired
                                    ? 'Vui lòng tạo mã mới để check-in'
                                    : 'Nhân viên sẽ quét mã này để xác nhận check-in của bạn'}
                            </p>
                        </div>

                        {/* Expiry Timer */}
                        {!expired && (
                            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Mã hết hạn lúc:</span>
                                    <span className="font-semibold text-blue-700">
                                        {expiresAt.toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Refresh Button */}
                        <Button
                            onClick={handleGenerateQR}
                            disabled={isGenerating}
                            variant={expired ? 'default' : 'outline'}
                            className={`w-full ${expired
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {expired ? 'Tạo mã mới' : 'Làm mới mã'}
                                </>
                            )}
                        </Button>

                        {/* Security Note */}
                        <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs text-yellow-800">
                                ⚠️ <strong>Lưu ý:</strong> Không chia sẻ mã QR này với người khác. Mã chỉ được sử dụng một lần và hết hạn sau 10 phút.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Before window opens
    if (!canGenerate && windowStartTime) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                            <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Chưa đến giờ nhận sân</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Bạn có thể tạo mã QR check-in từ 15 phút trước giờ đá
                            </p>
                        </div>
                        <CheckInCountdown
                            targetTime={windowStartTime}
                            onCountdownComplete={() => setCanGenerate(true)}
                            className="w-full"
                        />
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Too late - after late window
    if (!canGenerate && lateWindowEndTime && new Date() > lateWindowEndTime) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Đã quá thời gian check-in</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Thời gian check-in đã kết thúc. Vui lòng liên hệ với chủ sân nếu cần hỗ trợ.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // In window but no QR generated yet
    if (canGenerate && !qrToken) {
        return (
            <Card className={className}>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-semibold text-lg mb-2">Đã đến giờ nhận sân!</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Nhấn nút bên dưới để tạo mã QR check-in
                            </p>
                        </div>
                        {error && (
                            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                        <Button
                            onClick={handleGenerateQR}
                            disabled={isGenerating}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    Đang tạo mã...
                                </>
                            ) : (
                                '🎫 Tạo mã nhận sân'
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return null
}
