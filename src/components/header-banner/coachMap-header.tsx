import { ChevronRight } from "lucide-react";

export default function CoachmapHeader() {
    return (
        <div className="bg-gradient-to-r from-teal-800 via-blue-800 to-purple-800 text-white">
            <div className="max-w-[1320px] mx-auto px-12 py-12">
                <h1 className="text-4xl font-bold text-start mb-4">Coach Map</h1>
                <div className="flex items-center gap-2 text-sm opacity-90">
                    {["Home", "Coach Map"].map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span>{item}</span>
                            {index < ["Home", "Coach Map"].length - 1 && (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}