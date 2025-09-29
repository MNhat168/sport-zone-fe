import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ChangePassword() {
    return (
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal  text-start">
                            Old Password
                        </Label>
                        <Input
                            type="password"
                            placeholder="Enter Old Password"
                            className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal  text-start">
                            New Password
                        </Label>
                        <Input
                            type="password"
                            placeholder="Enter New Password"
                            className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <Label className="text-base font-normal  text-start">
                            Confirm Password
                        </Label>
                        <Input
                            type="password"
                            placeholder="Enter Confirm Password"
                            className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                        />
                    </div>
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            variant="outline"
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium "
                        >
                            Reset
                        </Button>
                        <Button
                            className="min-w-36 px-6 py-3.5 bg-gray-800 hover:bg-gray-900 text-white rounded-[10px] text-base font-medium "
                        >
                            Save Change
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}