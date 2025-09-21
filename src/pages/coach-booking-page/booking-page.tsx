"use client"

import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import PageHeader from "../../components/header-banner/page-header"
import CoachCard from "./card-list/coach-card-props"
import { useRef } from "react"
import { FooterComponent } from "../../components/footer/footer-component"

const BookingPage = () => {
    const coachesListRef = useRef<HTMLDivElement>(null)
    

    const breadcrumbs = [{ label: "Trang chủ", href: "/" }, { label: "Đặt huấn luyện viên" }]

    // Mock data cho coaches
    const coachesData = [
        {
            name: "Nguyễn Văn A",
            location: "Hà Nội",
            description: "Huấn luyện viên bóng đá chuyên nghiệp với 10 năm kinh nghiệm",
            rating: 4.8,
            reviews: 156,
            price: "500k/h",
            nextAvailability: "Hôm nay",
        },
        {
            name: "Trần Thị B",
            location: "TP.HCM",
            description: "Chuyên gia fitness và yoga, giúp bạn có sức khỏe tốt nhất",
            rating: 4.9,
            reviews: 203,
            price: "400k/h",
            nextAvailability: "Ngày mai",
        },
        {
            name: "Lê Minh C",
            location: "Đà Nẵng",
            description: "Huấn luyện viên tennis, từng là vận động viên quốc gia",
            rating: 4.7,
            reviews: 89,
            price: "600k/h",
            nextAvailability: "Cuối tuần",
        },
        {
            name: "Phạm Thị D",
            location: "Hải Phòng",
            description: "Chuyên gia bơi lội và cứu hộ, an toàn tuyệt đối",
            rating: 4.6,
            reviews: 134,
            price: "350k/h",
            nextAvailability: "Hôm nay",
        },
        {
            name: "Hoàng Văn E",
            location: "Cần Thơ",
            description: "Huấn luyện viên bóng rổ, phát triển kỹ năng toàn diện",
            rating: 4.8,
            reviews: 98,
            price: "450k/h",
            nextAvailability: "Ngày mai",
        },
        {
            name: "Vũ Thị F",
            location: "Nha Trang",
            description: "Chuyên gia thể hình và dinh dưỡng thể thao",
            rating: 4.9,
            reviews: 167,
            price: "550k/h",
            nextAvailability: "Cuối tuần",
        },
        {
            name: "Nguyễn Văn G",
            location: "Huế",
            description: "Huấn luyện viên cầu lông chuyên nghiệp",
            rating: 4.7,
            reviews: 98,
            price: "400k/h",
            nextAvailability: "Hôm nay",
        },
        {
            name: "Trần Thị H",
            location: "Vũng Tàu",
            description: "Chuyên gia bóng chuyền và thể thao bãi biển",
            rating: 4.8,
            reviews: 145,
            price: "450k/h",
            nextAvailability: "Ngày mai",
        },
        {
            name: "Lê Văn I",
            location: "Quảng Ninh",
            description: "Huấn luyện viên bóng đá và futsal",
            rating: 4.6,
            reviews: 112,
            price: "380k/h",
            nextAvailability: "Cuối tuần",
        },
        {
            name: "Phạm Thị K",
            location: "Bình Dương",
            description: "Chuyên gia yoga và pilates",
            rating: 4.9,
            reviews: 189,
            price: "520k/h",
            nextAvailability: "Hôm nay",
        },
        {
            name: "Hoàng Văn L",
            location: "Đồng Nai",
            description: "Huấn luyện viên bóng rổ và thể hình",
            rating: 4.7,
            reviews: 134,
            price: "480k/h",
            nextAvailability: "Ngày mai",
        },
        {
            name: "Vũ Thị M",
            location: "Long An",
            description: "Chuyên gia bơi lội và cứu hộ",
            rating: 4.8,
            reviews: 156,
            price: "420k/h",
            nextAvailability: "Cuối tuần",
        },
        {
            name: "Nguyễn Văn N",
            location: "Tiền Giang",
            description: "Huấn luyện viên tennis và badminton",
            rating: 4.6,
            reviews: 98,
            price: "460k/h",
            nextAvailability: "Hôm nay",
        },
    ]

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
                                {coachesData.map((coach, index) => (
                                    <div key={index} className="scroll-snap-start">
                                        <CoachCard
                                            name={coach.name}
                                            location={coach.location}
                                            description={coach.description}
                                            rating={coach.rating}
                                            reviews={coach.reviews}
                                            price={coach.price}
                                            nextAvailability={coach.nextAvailability}
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