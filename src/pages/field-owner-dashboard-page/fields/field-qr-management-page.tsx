"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fieldQrAPI, type FieldQRCodeResponse } from '@/features/field-owner/fieldQrAPI'
import { toast } from 'sonner'
import { FieldOwnerDashboardLayout } from '@/components/layouts/field-owner-dashboard-layout'
import { QrCode as QrCodeIcon, Download, RefreshCw, AlertCircle, CheckCircle2, Loader2, Printer } from 'lucide-react'
import logger from '@/utils/logger'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import axiosPrivate from '@/utils/axios/axiosPrivate'
import { BASE_URL } from '@/utils/constant-value/constant'

interface Field {
    _id: string
    name: string
    address: string
}

export default function FieldQRManagementPage() {
    const [fields, setFields] = useState<Field[]>([])
    const [fieldQRs, setFieldQRs] = useState<Map<string, FieldQRCodeResponse>>(new Map())
    const [loadingFields, setLoadingFields] = useState(true)
    const [generatingQR, setGeneratingQR] = useState<string | null>(null)
    const [selectedQR, setSelectedQR] = useState<FieldQRCodeResponse | null>(null)
    const [showQRDialog, setShowQRDialog] = useState(false)
    const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
    const [regeneratingField, setRegeneratingField] = useState<string | null>(null)

    useEffect(() => {
        fetchFields()
    }, [])

    const fetchFields = async () => {
        try {
            setLoadingFields(true)
            const response = await axiosPrivate.get(`${BASE_URL}/field-owner/fields/my-fields`)
            setFields(response.data || [])

            // Fetch QR codes for all fields
            for (const field of response.data || []) {
                try {
                    const qrData = await fieldQrAPI.getFieldQR(field._id)
                    if (qrData) {
                        setFieldQRs(prev => new Map(prev).set(field._id, qrData))
                    }
                } catch (error) {
                    // Field doesn't have QR yet, ignore
                }
            }
        } catch (error: any) {
            logger.error('Failed to fetch fields:', error)
            toast.error('Không thể tải danh sách sân')
        } finally {
            setLoadingFields(false)
        }
    }

    const handleGenerateQR = async (fieldId: string) => {
        try {
            setGeneratingQR(fieldId)
            const qrData = await fieldQrAPI.generateFieldQR(fieldId)
            setFieldQRs(prev => new Map(prev).set(fieldId, qrData))
            toast.success('Đã tạo mã QR thành công!')
        } catch (error: any) {
            logger.error('Failed to generate QR:', error)
            toast.error(error.response?.data?.message || 'Không thể tạo mã QR')
        } finally {
            setGeneratingQR(null)
        }
    }

    const handleRegenerateQR = async () => {
        if (!regeneratingField) return

        try {
            const qrData = await fieldQrAPI.regenerateFieldQR(regeneratingField)
            setFieldQRs(prev => new Map(prev).set(regeneratingField, qrData))
            toast.success('Đã tạo mã QR mới!')
            setShowRegenerateDialog(false)
            setRegeneratingField(null)
        } catch (error: any) {
            logger.error('Failed to regenerate QR:', error)
            toast.error(error.response?.data?.message || 'Không thể tạo lại mã QR')
        }
    }

    const handleViewQR = (fieldId: string) => {
        const qrData = fieldQRs.get(fieldId)
        if (qrData) {
            setSelectedQR(qrData)
            setShowQRDialog(true)
        }
    }

    const handleDownloadQR = async () => {
        if (!selectedQR) return

        try {
            // Use qrcode library or convert the QR URL to downloadable image
            const qrImage = document.querySelector('#qr-code-display') as HTMLCanvasElement
            if (qrImage) {
                const link = document.createElement('a')
                link.download = `QR-${selectedQR.fieldName.replace(/\s+/g, '-')}.png`
                link.href = qrImage.toDataURL()
                link.click()
                toast.success('Đã tải mã QR!')
            }
        } catch (error) {
            logger.error('Failed to download QR:', error)
            toast.error('Không thể tải xuống mã QR')
        }
    }

    const handlePrintQR = () => {
        window.print()
    }

    return (
        <FieldOwnerDashboardLayout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        🎫 Quản lý QR Code Sân
                    </h1>
                    <p className="text-gray-600">
                        Tạo và quản lý mã QR check-in cho các sân của bạn
                    </p>
                </div>

                {/* Info Card */}
                <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800 mb-1">
                                    Hướng dẫn sử dụng
                                </p>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Mỗi sân có một mã QR cố định, khách hàng quét để check-in</li>
                                    <li>In mã QR và đặt tại vị trí dễ thấy ở sân</li>
                                    <li>Mã QR có hiệu lực 1 năm, có thể tạo lại bất kỳ lúc nào</li>
                                    <li>Khi tạo lại, mã QR cũ sẽ không còn hiệu lực</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Fields Grid */}
                {loadingFields ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : fields.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <QrCodeIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Chưa có sân nào
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Vui lòng tạo sân trước khi quản lý mã QR
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fields.map((field) => {
                            const qrData = fieldQRs.get(field._id)
                            const hasQR = !!qrData

                            return (
                                <Card key={field._id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg line-clamp-1">
                                            {field.name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 line-clamp-1">
                                            {field.address}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {hasQR ? (
                                            <>
                                                {/* QR Status */}
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    <span className="text-sm text-green-600 font-medium">
                                                        Đã có mã QR
                                                    </span>
                                                </div>

                                                <div className="text-xs text-gray-600">
                                                    <p>Ngày tạo: {new Date(qrData.generatedAt).toLocaleDateString('vi-VN')}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        onClick={() => handleViewQR(field._id)}
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <QrCodeIcon className="w-4 h-4 mr-2" />
                                                        Xem mã QR
                                                    </Button>
                                                    <Button
                                                        onClick={() => {
                                                            setRegeneratingField(field._id)
                                                            setShowRegenerateDialog(true)
                                                        }}
                                                        variant="outline"
                                                        className="w-full"
                                                    >
                                                        <RefreshCw className="w-4 h-4 mr-2" />
                                                        Tạo lại mã QR
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* No QR Status */}
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-gray-400" />
                                                    <span className="text-sm text-gray-600">
                                                        Chưa có mã QR
                                                    </span>
                                                </div>

                                                {/* Generate Button */}
                                                <Button
                                                    onClick={() => handleGenerateQR(field._id)}
                                                    disabled={generatingQR === field._id}
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                >
                                                    {generatingQR === field._id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Đang tạo...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <QrCodeIcon className="w-4 h-4 mr-2" />
                                                            Tạo mã QR
                                                        </>
                                                    )}
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* QR Display Dialog */}
            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {selectedQR?.fieldName}
                        </DialogTitle>
                        <DialogDescription>
                            Mã QR check-in cho sân
                        </DialogDescription>
                    </DialogHeader>

                    {selectedQR && (
                        <div className="space-y-6">
                            {/* QR Code Display */}
                            <div className="bg-white p-8 rounded-lg border-2 border-gray-200 flex flex-col items-center">
                                <div className="bg-gray-100 p-6 rounded-lg mb-4">
                                    {/* Using iframe to display QR from external service or we would need qrcode.react */}
                                    <img
                                        id="qr-code-display"
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedQR.qrCodeUrl)}`}
                                        alt="QR Code"
                                        className="w-72 h-72"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-900 mb-1">
                                        {selectedQR.fieldName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Quét mã để check-in
                                    </p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-yellow-800 mb-2">
                                    💡 Lưu ý khi in mã QR
                                </p>
                                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                                    <li>Đặt mã QR ở vị trí dễ thấy, có đủ ánh sáng</li>
                                    <li>Kích thước in tối thiểu 10x10cm để dễ quét</li>
                                    <li>Tránh làm nhăn, rách hoặc bẩn mã QR</li>
                                    <li>Có thể in nhiều bản và đặt ở nhiều vị trí</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2">
                        <Button
                            onClick={handleDownloadQR}
                            variant="outline"
                            className="flex-1"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Tải xuống
                        </Button>
                        <Button
                            onClick={handlePrintQR}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            In mã QR
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Regenerate Confirmation Dialog */}
            <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận tạo lại mã QR</DialogTitle>
                        <DialogDescription>
                            Mã QR cũ sẽ không còn hiệu lực sau khi tạo mã mới. Bạn có chắc chắn muốn tiếp tục?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setShowRegenerateDialog(false)
                                setRegeneratingField(null)
                            }}
                            variant="outline"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleRegenerateQR}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tạo lại
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </FieldOwnerDashboardLayout>
    )
}
