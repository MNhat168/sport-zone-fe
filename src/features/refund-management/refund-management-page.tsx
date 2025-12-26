import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RefundManagementPage() {
    const [isShowFormExcel, setIsShowFormExcel] = useState(false)

    const handleShowFormExcel = () => {
        setIsShowFormExcel(true)
    }

    const handleCloseFormExcel = () => {
        setIsShowFormExcel(false)
    }

    return (
        <div className='container mx-auto p-6'>
            <div className='mb-6'>
                <h1 className='text-3xl font-bold tracking-tight'>Refund Management</h1>
                <p className='text-muted-foreground mt-2'>
                    Quản lý danh sách hoàn tiền thông qua Google Sheets
                </p>
            </div>

            <div className='mb-4'>
                <Button
                    className='bg-yellow-500 hover:bg-yellow-600 text-white'
                    onClick={handleShowFormExcel}
                >
                    Mở Excel Online
                </Button>
            </div>

            {isShowFormExcel && (
                <Card className='mb-6'>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                        <CardTitle className='text-lg font-semibold'>
                            Excel Online - Refund Management
                        </CardTitle>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleCloseFormExcel}
                        >
                            Đóng Excel
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <iframe
                            src='https://docs.google.com/spreadsheets/d/1BznUxAzDbWNVmPnea_rzyooBgbN7ZgGKrmfNGA7fRsY/edit?usp=sharing'
                            width='100%'
                            height='600'
                            style={{ border: 0, borderRadius: '4px' }}
                            title='Google Sheet nhập dữ liệu hoàn tiền'
                            allowFullScreen
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
