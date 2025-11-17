"use client"

import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { List, Info } from "lucide-react"

export function FieldSelectionPlaceholder() {
    const navigate = useNavigate()

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <Info className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Chưa chọn sân</CardTitle>
                    <CardDescription className="mt-2">
                        Vui lòng chọn một sân từ danh sách để xem chi tiết hoặc chỉnh sửa
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={() => navigate('/field-owner/fields')}
                        className="w-full"
                        size="lg"
                    >
                        <List className="h-4 w-4 mr-2" />
                        Xem danh sách sân
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

