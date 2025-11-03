import React, { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFieldById } from "@/features/field/fieldThunk";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
// Removed PageHeader to control layout and left-align back button/title
import { FooterComponent } from "@/components/footer/footer-component";

// Trang chi tiết sân – tạm thời chỉ hiển thị các thông tin cơ bản
const FieldDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { currentField, loading, error } = useAppSelector((s) => s.field);

    // Nếu chưa có dữ liệu hoặc id khác, gọi API lấy chi tiết
    useEffect(() => {
        if (id && (!currentField || currentField.id !== id)) {
            dispatch(getFieldById(id));
        }
    }, [id, currentField?.id, dispatch]);

    // breadcrumbs removed

    // refs for smooth-scrolling to sections
    const overviewRef = useRef<HTMLDivElement | null>(null);
    const rulesRef = useRef<HTMLDivElement | null>(null);
    const amenitiesRef = useRef<HTMLDivElement | null>(null);
    const galleryRef = useRef<HTMLDivElement | null>(null);
    const ratingRef = useRef<HTMLDivElement | null>(null);
    const locationRef = useRef<HTMLDivElement | null>(null);

    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const locationText = useMemo(() => {
        const loc: any = (currentField as any)?.location;
        if (typeof loc === "string") return loc;
        if (loc && typeof loc === "object") {
            const parts = [loc.address, loc.ward, loc.district, loc.city, loc.province].filter(Boolean);
            return parts.length ? parts.join(", ") : "Địa chỉ đang cập nhật";
        }
        return "Địa chỉ đang cập nhật";
    }, [currentField]);


    type Amenity = { amenityId?: string | number; name?: string; price?: number } | string;

    const amenitiesRaw: Amenity[] = useMemo(() => {
        const raw = (currentField as any)?.amenities as Amenity[] | undefined;
        return Array.isArray(raw) ? raw : [];
    }, [currentField]);

    const amenitiesDisplay = useMemo(() => {
        return amenitiesRaw.map((a, idx) => {
            if (typeof a === "string") {
                return { key: `amenity-${idx}`, label: a };
            }
            const key = String((a as any)?.amenityId ?? `amenity-${idx}`);
            const name = (a as any)?.name ?? "Tiện ích";
            const price = (a as any)?.price;
            const label = price != null && price !== ""
                ? `${name} - ${Number(price).toLocaleString()}đ`
                : String(name);
            return { key, label };
        });
    }, [amenitiesRaw]);

    const rules: string[] = useMemo(() => {
        const raw = (currentField as any)?.rules as string[] | undefined;
        return Array.isArray(raw) ? raw : [];
    }, [currentField]);

    const ratingValue: number = useMemo(() => {
        const r = (currentField as any)?.rating ?? (currentField as any)?.averageRating;
        const n = Number(r);
        return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : 0;
    }, [currentField]);

    // simple accordion component
    type SectionProps = React.PropsWithChildren<{
        id: string;
        title: string;
        refObj: React.RefObject<HTMLDivElement | null>;
        defaultOpen?: boolean;
    }>;

    const Section: React.FC<SectionProps> = ({ id, title, refObj, children }) => {
        const open = true;
        return (
            <div id={id} ref={refObj} className="bg-white rounded-lg border shadow-sm">
                <div className="w-full px-4 py-3 flex items-center justify-between text-left">
                    <span className="text-base md:text-lg font-semibold text-gray-900">{title}</span>
                    <span className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}>⌃</span>
                </div>
                <div className="px-4 pb-4">{children}</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white">
            <NavbarDarkComponent />
            <div className="pt-16" />

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="text-left">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition"
                    >
                        <span className="text-lg">←</span>
                        <span className="font-medium">Quay lại</span>
                    </button>
                </div>

                {loading && (
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 w-1/3 bg-gray-200 rounded" />
                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                        <div className="h-64 w-full bg-gray-200 rounded" />
                    </div>
                )}

                {error && !loading && (
                    <div className="p-4 bg-red-50 text-red-700 rounded">
                        Không thể tải chi tiết sân: {error.message}
                    </div>
                )}

                {!loading && currentField && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4 text-left">
                            {/* Title + address */}
                            <h1 className="text-2xl font-bold text-left">{currentField.name}</h1>
                            <div className="text-gray-600 text-left">{locationText}</div>

                            {/* Sport type chip + price chip */}
                            <div className="flex flex-wrap gap-2 text-sm items-center">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/10 to-green-500/10 text-gray-700 border">
                                    <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-green-500" />
                                    <span className="text-gray-500">Loại thể thao</span>
                                    <span className="font-medium text-gray-900">{String(currentField.sportType || "Đang cập nhật")}</span>
                                </span>
                                {/* Price chip removed per request */}
                            </div>

                            {/* Quick Nav Pills */}
                            <div className="sticky top-16 z-10 bg-white py-2 overflow-x-auto">
                                <div className="flex gap-2 justify-start">
                                    {[
                                        { k: "overview", label: "Overview", ref: overviewRef },
                                        { k: "rules", label: "Rules", ref: rulesRef },
                                        { k: "amenities", label: "Amenities", ref: amenitiesRef },
                                        { k: "gallery", label: "Gallery", ref: galleryRef },
                                        { k: "rating", label: "Rating", ref: ratingRef },
                                        { k: "location", label: "Locations", ref: locationRef },
                                    ].map((i) => (
                                        <button
                                            key={i.k}
                                            onClick={() => scrollTo(i.ref)}
                                            className="px-3 py-1 rounded-md border text-sm hover:bg-gray-50"
                                        >
                                            {i.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hero images (click to jump gallery) */}
                            {currentField.images?.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {currentField.images.slice(0, 4).map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            className="w-full h-40 object-cover rounded cursor-pointer"
                                            title="Xem thư viện ảnh"
                                            alt={`Hình ảnh ${idx + 1}`}
                                            onClick={() => scrollTo(galleryRef)}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder-field.jpg";
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <img
                                    src="/placeholder-field.jpg"
                                    className="w-full h-64 object-cover rounded cursor-pointer"
                                    onClick={() => scrollTo(galleryRef)}
                                    alt="Ảnh sân"
                                />
                            )}

                            {/* Sections */}
                            <Section id="overview" title="Overview" refObj={overviewRef}>
                                <p className="text-gray-700 whitespace-pre-line">
                                    {currentField.description || "Chưa có mô tả cho sân này."}
                                </p>
                            </Section>

                            <Section id="rules" title="Rules" refObj={rulesRef} defaultOpen={false}>
                                {rules.length ? (
                                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                                        {rules.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-500">Chưa cập nhật nội quy.</div>
                                )}
                            </Section>

                            <Section id="amenities" title="Amenities" refObj={amenitiesRef} defaultOpen={false}>
                                {amenitiesDisplay.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {amenitiesDisplay.map((a) => (
                                            <span key={a.key} className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 border">
                                                {a.label}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500">Chưa cập nhật tiện ích.</div>
                                )}
                            </Section>

                            <Section id="gallery" title="Gallery" refObj={galleryRef} defaultOpen={false}>
                                {currentField.images?.length ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {currentField.images.map((img: string, idx: number) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                className="w-full h-36 object-cover rounded"
                                                alt={`Ảnh ${idx + 1}`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = "/placeholder-field.jpg";
                                                }}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-500">Chưa có ảnh.</div>
                                )}
                            </Section>

                            <Section id="rating" title="Rating" refObj={ratingRef} defaultOpen={false}>
                                <div className="flex items-end gap-3">
                                    <div className="text-3xl font-bold text-gray-900">{ratingValue.toFixed(1)}</div>
                                    <div className="flex items-center text-yellow-500">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i}>{i < Math.round(ratingValue) ? "★" : "☆"}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-gray-500 mt-1">
                                    {((currentField as any)?.reviewCount ?? 0) as number} lượt đánh giá
                                </div>
                            </Section>

                            <Section id="location" title="Locations" refObj={locationRef} defaultOpen={false}>
                                <div className="text-gray-700">{String(currentField.location || "Đang cập nhật địa chỉ")}</div>
                                {/* TODO: map embed can be placed here later */}
                            </Section>
                        </div>

                        <aside className="md:col-span-1 space-y-4">
                            <div className="p-4 border rounded">
                                <div className="text-sm text-gray-500 mb-1">Giá cơ bản</div>
                                <div className="text-2xl font-semibold text-green-700">
                                    {currentField.price ||
                                        (currentField.basePrice ? `${currentField.basePrice.toLocaleString()}đ/giờ` : "N/A")}
                                </div>
                                <button
                                    onClick={() => navigate("/field-booking", { state: { fieldId: currentField.id } })}
                                    className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                                >
                                    Đặt sân ngay
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            <FooterComponent />
        </div>
    );
};

export default FieldDetailPage;
