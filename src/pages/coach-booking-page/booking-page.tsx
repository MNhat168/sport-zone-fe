"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import PageHeader from "../../components/header-banner/page-header"
import CoachCard from "./card-list/coach-card-props"
import { useRef, useEffect, useState } from "react"
import axios from "axios"
import { FooterComponent } from "../../components/footer/footer-component"

const BookingPage = () => {
    const coachesListRef = useRef<HTMLDivElement>(null)
    

    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Đặt huấn luyện viên" }]

    // State for API data
    const [coaches, setCoaches] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoaches = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/coaches/all`
                );
                setCoaches(
                  Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || []
                );
            } catch (err: any) {
                setError(err?.message || 'Lỗi khi lấy danh sách huấn luyện viên');
            } finally {
                setLoading(false);
            }
        };
        fetchCoaches();
    }, []);

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
                <PageHeader title="Đặt huấn luyện viên" breadcrumbs={breadcrumbs} />
            </div>

            {/* Main container with flexbox layout */}
            <div className="px-4 min-h-screen">
                <div className="flex gap-6 items-start">
                    {/* Left Panel - Coaches List */}
                    <div className="flex-[6] bg-white flex flex-col h-screen">
                        <div
                            ref={coachesListRef}
                            className="flex-1 overflow-y-auto scrollbar-hide"
                            style={{
                                scrollBehavior: "smooth",
                                scrollSnapType: "y mandatory"
                            }}
                        >
                            <div className="space-y-4">
                                {loading && <div>Đang tải danh sách huấn luyện viên...</div>}
                                {error && <div className="text-red-500">{error}</div>}
                                {!loading && !error && coaches.length === 0 && (
                                    <div>Không có huấn luyện viên nào.</div>
                                )}
                                {!loading && !error && coaches.map((coach, index) => (
                                    <div key={coach.id || index} className="scroll-snap-start">
                                        <CoachCard
                                            id={coach.id}
                                            name={coach.name}
                                            location={coach.location}
                                            description={coach.description}
                                            rating={coach.rating}
                                            reviews={coach.totalReviews}
                                            price={coach.price}
                                            nextAvailability={coach.nextAvailability ?? ''}
                                        />
                                    </div>
                                ))}
                            </div>
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

export default BookingPage