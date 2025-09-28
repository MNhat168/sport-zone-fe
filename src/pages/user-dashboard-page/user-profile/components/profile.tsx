import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
export default function Profile() {
    return (

        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-10">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col gap-5">
                        <div className="relative w-44 h-40 p-5 bg-white rounded-[10px] border border-gray-300 flex flex-col justify-center items-center gap-2">
                            <div className="w-10 h-10 flex justify-center items-center">
                                <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <Label className="text-sm font-normal  text-[#6B7385] cursor-pointer">
                                Upload Photo
                            </Label>
                            <Button
                                size="sm"
                                className="absolute top-3 right-3 w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full p-0 text-white"
                            >
                                +
                            </Button>
                        </div>
                        <p className="text-sm font-normal  text-[#6B7385]">
                            Upload a logo with a minimum size of 150 * 150 pixels (JPG, PNG, SVG).
                        </p>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Name
                            </Label>
                            <Input
                                placeholder="Enter Name"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Email
                            </Label>
                            <Input
                                type="email"
                                placeholder="Enter Email Address"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Phone Number
                            </Label>
                            <Input
                                type="tel"
                                placeholder="Enter Phone Number"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-5 pb-5 border-b border-gray-200">
                        <Label className="text-base font-normal  text-start">
                            Information about You
                        </Label>
                        <Textarea
                            placeholder="About"
                            className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                        />
                    </div>

                    {/* Address Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold  text-start">
                            Address
                        </h3>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Address
                            </Label>
                            <Input
                                placeholder="Enter Address"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    State
                                </Label>
                                <Input
                                    placeholder="Enter State"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    City
                                </Label>
                                <Input
                                    placeholder="Enter City"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal  text-start">
                                    Country
                                </Label>
                                <Select>
                                    <SelectTrigger className="h-14 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385]">
                                        <SelectValue placeholder="Country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="us">United States</SelectItem>
                                        <SelectItem value="vn">Vietnam</SelectItem>
                                        <SelectItem value="uk">United Kingdom</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-full md:w-96 space-y-2.5">
                            <Label className="text-base font-normal  text-start">
                                Zipcode
                            </Label>
                            <Input
                                placeholder="Enter Zipcode"
                                className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal  text-[#6B7385] placeholder:text-[#6B7385]"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
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