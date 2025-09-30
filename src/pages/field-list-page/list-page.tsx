"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import PageHeader from "../../components/header-banner/page-header"
import FieldCard from "./card-list/field-card-props"
import { useRef, useEffect, useState } from "react"
import { FooterComponent } from "../../components/footer/footer-component"
import { useAppDispatch, useAppSelector } from "../../store/hook"
import { getAllFields } from "../../features/field/fieldThunk"

const FieldBookingPage = () => {
    const fieldsListRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()
    
    // Redux state
    const { fields, loading, error, pagination } = useAppSelector((state) => state.field)
    
    // Filter states
    const [filters, setFilters] = useState({
        location: "",
        type: "",
        page: 1,
        limit: 10
    })

    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Đặt sân thể thao" }]

    // Debounced search effect for location
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            dispatch(getAllFields(filters))
        }, 500) // 500ms delay for debouncing

        return () => clearTimeout(timeoutId)
    }, [dispatch, filters])

    // Transform field data to match FieldCard props
    const transformedFields = fields.map((field) => ({
        id: field.id,
        name: field.name,
        location: field.location,
        description: field.description,
        rating: 4.5, // Default rating since it's not in our API yet
        reviews: field.totalBookings || 0, // Use totalBookings as reviews if available
        price: `${field.pricePerHour}k/h`,
        nextAvailability: field.availability ? "Có sẵn" : "Không có sẵn",
        sportType: field.type,
        imageUrl: field.images?.[0] || "/placeholder-field.jpg"
    }))

    return (
        <div className="min-h-screen">
            <style>{`
                /* Custom scrollbar styles */
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }

                /* Smooth scroll snap behavior */
                .scroll-snap-start {
                    scroll-snap-align: start;
                }

                /* Custom scroll container */
                .custom-scroll-container {
                    scroll-behavior: smooth;
                    overflow-y: auto;
                }

                /* Map container specific styles */
                .map-container {
                    position: sticky;
                    top: 0;
                    height: 1078px;
                    overflow: hidden;
                }
            `}</style>
            <NavbarDarkComponent />
            <div className="pt-16">
                <PageHeader title="Đặt sân thể thao" breadcrumbs={breadcrumbs} />
            </div>

            {/* Main container with flexbox layout */}
            <div className="px-4 min-h-screen">
                <div className="flex gap-6 items-start">
                    {/* Left Panel - Fields List */}
                    <div className="flex-[6] bg-white flex flex-col h-screen">
                        {/* Filters */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex-1 min-w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa điểm
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Tìm theo địa điểm..."
                                        value={filters.location}
                                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value, page: 1 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="flex-1 min-w-48">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Loại sân
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Tất cả loại sân</option>
                                        <option value="football">Bóng đá</option>
                                        <option value="basketball">Bóng rổ</option>
                                        <option value="tennis">Tennis</option>
                                        <option value="badminton">Cầu lông</option>
                                        <option value="volleyball">Bóng chuyền</option>
                                        <option value="swimming">Bơi lội</option>
                                        <option value="gym">Gym</option>
                                        <option value="yoga">Yoga</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setFilters({ location: "", type: "", page: 1, limit: 10 })}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div
                            ref={fieldsListRef}
                            className="flex-1 overflow-y-auto scrollbar-hide"
                            style={{
                                scrollBehavior: "smooth",
                                scrollSnapType: "y mandatory"
                            }}
                        >
                            {loading && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="animate-pulse">
                                            <div className="flex bg-white rounded-lg shadow p-4">
                                                <div className="w-32 h-32 bg-gray-300 rounded-lg"></div>
                                                <div className="ml-4 flex-1">
                                                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    <strong className="font-bold">Error!</strong>
                                    <span className="block sm:inline"> {error.message}</span>
                                </div>
                            )}

                            {!loading && !error && transformedFields.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">Không tìm thấy sân thể thao nào.</p>
                                </div>
                            )}

                            {!loading && !error && transformedFields.length > 0 && (
                                <div className="space-y-4">
                                    {transformedFields.map((field, index) => (
                                        <div key={field.id || index} className="scroll-snap-start">
                                            <FieldCard
                                                id={field.id}
                                                name={field.name}
                                                location={field.location}
                                                description={field.description}
                                                rating={field.rating}
                                                reviews={field.reviews}
                                                price={field.price}
                                                nextAvailability={field.nextAvailability}
                                                sportType={field.sportType}
                                                imageUrl={field.imageUrl}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!loading && pagination && pagination.total > filters.limit && (
                                <div className="flex justify-center mt-6 space-x-2">
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700"
                                    >
                                        Trang trước
                                    </button>
                                    <span className="px-4 py-2 bg-gray-100 rounded">
                                        Trang {filters.page} / {Math.ceil(pagination.total / filters.limit)}
                                    </span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={filters.page >= Math.ceil(pagination.total / filters.limit)}
                                        className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300 hover:bg-green-700"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Map (4/10 columns) */}
                    <div className="flex-[4] relative">
                        <div className="sticky top-16 h-[calc(100vh-4rem)] w-full">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.004365675287!2d105.85242641540224!3d21.0285118859989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab98b8d36d05%3A0xe9e26b6de6d6f2d2!2zSOG7jWMgSOG7jWMgTmjDoCBUcsawbmcgVMOibg!5e0!3m2!1svi!2s!4v1632993871239!5m2!1svi!2s"
                                className="absolute h-full w-full p-0 border-0 m-0 left-0 top-0 pointer-events-auto"
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer để đảm bảo có thể scroll */}
            <FooterComponent />
        </div>
    )
}

export default FieldBookingPage