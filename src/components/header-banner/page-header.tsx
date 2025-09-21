import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    className?: string;
    gradientColors?: string;
}

export default function PageHeader({ 
    title, 
    breadcrumbs = [], 
    className = "",
    gradientColors = "from-teal-800 via-blue-800 to-purple-800"
}: PageHeaderProps) {
    return (
        <div className={`bg-gradient-to-r ${gradientColors} text-white ${className}`}>
            <div className="max-w-[1320px] mx-auto px-12 py-12">
                <h1 className="text-4xl font-bold text-start mb-4">{title}</h1>
                {breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-2 text-sm opacity-90">
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
