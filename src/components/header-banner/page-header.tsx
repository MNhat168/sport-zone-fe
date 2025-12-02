import { ChevronRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getBreadcrumbBanner } from "./banner-images";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
}

export default function PageHeader({ 
    title, 
    breadcrumbs = [], 
    className = ""
}: PageHeaderProps) {
    const location = useLocation();
    const bannerUrl = getBreadcrumbBanner(location.pathname);

    return (
        <div
            className={`relative text-white ${className}`}
            style={{
                backgroundImage: `url('${bannerUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Overlay để đảm bảo độ tương phản cho text */}
            <div className="absolute inset-0 bg-black/70" />
            <div className="relative max-w-[1320px] mx-auto px-6 md:px-12 py-10 md:py-12">
                <h1 className="text-3xl md:text-4xl font-bold text-start mb-3 md:mb-4 drop-shadow-md">
                    {title}
                </h1>
                {breadcrumbs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-white/90 drop-shadow-sm">
                        {breadcrumbs.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {item.href ? (
                                    <a 
                                        href={item.href} 
                                        className="hover:underline cursor-pointer"
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <span>{item.label}</span>
                                )}
                                {index < breadcrumbs.length - 1 && (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
