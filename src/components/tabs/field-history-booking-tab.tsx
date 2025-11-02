import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookingHistoryTabsProps {
    initialTab?: "upcoming" | "completed" | "ongoing" | "cancelled";
}

export function BookingHistoryTabs({
    initialTab = "upcoming"
}: BookingHistoryTabsProps) {
    return (
        <div className="w-full bg-gray-50 rounded-md p-5">
            <div className="max-w-[746px] px-3">
                <Tabs defaultValue={initialTab} className="w-full">
                    <TabsList className="w-full justify-start gap-5 bg-transparent p-0 h-auto">
                        <TabsTrigger
                            value="upcoming"
                            className="px-7 py-3 data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 rounded-md"
                        >
                            Sắp Diễn Ra
                        </TabsTrigger>
                        <TabsTrigger
                            value="completed"
                            className="px-7 py-3 data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 rounded-md"
                        >
                            Hoàn Thành
                        </TabsTrigger>
                        <TabsTrigger
                            value="ongoing"
                            className="px-7 py-3 data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 rounded-md"
                        >
                            Đang Diễn Ra
                        </TabsTrigger>
                        <TabsTrigger
                            value="cancelled"
                            className="px-7 py-3 data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600 rounded-md"
                        >
                            Đã Hủy
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}