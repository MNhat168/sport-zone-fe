import { NavbarDarkComponent } from "../../components/header/navbar-dark-component"
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Input } from "@/components/ui/input"
import { PageWrapper } from "../../components/layouts/page-wrapper"
import { useState } from "react"
import { Calendar, ChevronDown, ChevronUp, User, UserPlus, Users } from "lucide-react"


export default function CoachDetailPage() {
    const trainerData = {
        name: "Kevin Anderson",
        description:
            "Huấn luyện viên Kevin cung cấp các bài học cầu lông tại Santa Monica ở Penmar Park",
        rating: "4,5",
        reviewCount: "300 Đánh giá",
        location: "Santamanica, Hoa Kỳ",
        level: "Chuyên gia",
        completedSessions: "25",
        memberSince: "Với Dreamsports kể từ ngày 5 tháng 4 năm 2023",
        profileImage: "https://c.animaapp.com/PIKJaZmQ/img/ng--i-d-ng@2x.png",
        locationIcon: "https://c.animaapp.com/PIKJaZmQ/img/bi-u-t--ng@2x.png",
    };

    const stats = [
        {
            icon: "https://c.animaapp.com/PIKJaZmQ/img/vector.svg",
            label: "Cấp bậc: Chuyên gia",
            alt: "Level icon",
        },
        {
            icon: "https://c.animaapp.com/PIKJaZmQ/img/vector-1.svg",
            label: "Phiên đã hoàn thành: 25",
            alt: "Sessions icon",
        },
        {
            icon: "https://c.animaapp.com/PIKJaZmQ/img/vector-2.svg",
            label: "Với Dreamsports kể từ ngày 5 tháng 4 năm 2023",
            alt: "Member since icon",
        },
    ];
    const [activeTab, setActiveTab] = useState(0);

    const tabItems = [
        { id: 0, label: "Tiểu sử ngắn" },
        { id: 1, label: "Bài học cùng tôi" },
        { id: 2, label: "Huấn luyện" },
        { id: 3, label: "Phòng trưng bày" },
        { id: 4, label: "Đánh giá" },
        { id: 5, label: "Địa điểm" },
    ];

    const profileData = {
        name: "Kevin Anderson",
        experience:
            "10 năm kinh nghiệm huấn luyện cầu lông ở nhiều trình độ khác nhau.",
        certification:
            "Huấn luyện viên cầu lông được chứng nhận, am hiểu sâu sắc về kỹ thuật và chiến thuật của môn thể thao",
    };

    const [bioExpanded, setBioExpanded] = useState(true);
    const toggleBioExpanded = () => {
        setBioExpanded(!bioExpanded);
    };

    const availabilityData = [
        "Thứ Năm, ngày 24 tháng 9 lúc 3 giờ chiều",
        "Thứ sáu, ngày 25 tháng 9 lúc 3 giờ chiều",
        "Thứ Bảy, ngày 26 tháng 9 lúc 3 giờ chiều",
        "Chủ Nhật, ngày 27 tháng 9 lúc 3 giờ chiều",
    ];

    const handleTimeSlotSelect = (timeSlot: string, index: number) => {
        // Handle selection logic here
        console.log(`Selected: ${timeSlot} at index ${index}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent, timeSlot: string, index: number) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleTimeSlotSelect(timeSlot, index);
        }
    };

    const lessonTypes = [
        {
            id: "single",
            name: "Bài học đơn lẻ",
            icon: User,
            description: "Học 1-on-1 với huấn luyện viên"
        },
        {
            id: "pair",
            name: "Bài học 2 người chơi",
            icon: UserPlus,
            description: "Học cùng với 1 người bạn"
        },
        {
            id: "group",
            name: "Bài học nhóm nhỏ",
            icon: Users,
            description: "Học trong nhóm 3-4 người"
        }
    ];

    type LessonTypeOption = typeof lessonTypes[0];
    const [selectedLesson, setSelectedLesson] = useState<LessonTypeOption | null>(null);
    const [lessonsExpanded, setLessonsExpanded] = useState(true);
    const [coachingExpanded, setCoachingExpanded] = useState(true);

    const handleLessonSelect = (lessonType: LessonTypeOption) => {
        setSelectedLesson(lessonType);
        console.log(`Selected lesson type: ${lessonType.name}`);
    };

    const handleLessonsToggle = () => {
        setLessonsExpanded(!lessonsExpanded);
    };

    const handleCoachingToggle = () => {
        setCoachingExpanded(!coachingExpanded);
    };
    return (
        <>
            <NavbarDarkComponent />
            <PageWrapper className="sticky-navbar-offset">
                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-full h-[246px] relative">
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <div className="container mx-auto max-w-7xl">
                    {/* Coach profile and book */}
                    <div className="grid grid-cols-12 gap-4 pb-4 -mt-16 relative z-10">
                        {/* left */}
                        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                            <Card className="text-card-foreground flex flex-col gap-6 border bg-[#f9f9f6] rounded-[10px] shadow-none border-none col-span-4 py-0">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Profile Image */}
                                        <div className="flex-shrink-0">
                                            <div
                                                className="w-[116px] h-[134px] rounded-[10px] bg-cover bg-center"
                                                style={{ backgroundImage: `url(${trainerData.profileImage})` }}
                                                role="img"
                                                aria-label={`Profile photo of ${trainerData.name}`}
                                            />
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="space-y-2.5">
                                                {/* Header with Name and Favorite Button */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2.5">
                                                        <h3 className="text-left text-2xl font-semibold text-[#192335] leading-7 font-['Outfit',sans-serif]">
                                                            {trainerData.name}
                                                        </h3>

                                                        {/* Status Badge */}
                                                        <div className="bg-[#23b33a] rounded-[20px] px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium">"</span>
                                                        </div>
                                                    </div>

                                                    <button className="bg-[#ffaa00] hover:bg-[#e69900] transition-colors rounded-[5px] px-4 py-2 h-[34px] flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">Yêu thích</span>
                                                    </button>
                                                </div>

                                                {/* Description */}
                                                <p className="text-left text-[#7c7c7c] text-base leading-relaxed">
                                                    {trainerData.description}
                                                </p>

                                                {/* Rating and Location */}
                                                <div className="flex items-center gap-4 pb-2">
                                                    {/* Rating */}
                                                    <div className="flex items-center bg-white rounded-[5px] p-1">
                                                        <div className="bg-[#ffaa00] rounded-[5px] px-2 py-1 mr-2">
                                                            <span className="text-white text-sm font-medium">
                                                                {trainerData.rating}
                                                            </span>
                                                        </div>
                                                        <span className="text-[#7c7c7c] text-sm">
                                                            {trainerData.reviewCount}
                                                        </span>
                                                    </div>

                                                    {/* Location */}
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={trainerData.locationIcon}
                                                            alt="Location"
                                                            className="w-5 h-4"
                                                        />
                                                        <span className="text-[#7c7c7c] text-sm">
                                                            {trainerData.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Divider */}
                                                {/* <hr className="border-t border-[#eaedf0]" /> */}

                                                {/* Stats */}
                                                <div className="flex items-start gap-4 pt-2">
                                                    {stats.map((stat, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div className="flex-shrink-0 flex items-center justify-center">
                                                                <img
                                                                    src={stat.icon}
                                                                    alt={stat.alt}
                                                                    className="w-4 h-4"
                                                                />
                                                            </div>
                                                            <span className="text-[#7c7c7c] text-sm leading-relaxed">
                                                                {stat.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* fast click navigate button */}
                            <Card className="text-card-foreground flex flex-col gap-6 border rounded-[10px] shadow-md border-none col-span-4 py-0">
                                <CardContent className="p-4 ">
                                    <nav className="flex items-start gap-1.5 flex-wrap" role="tablist">
                                        {tabItems.map((tab) => (
                                            <button
                                                key={tab.id}
                                                className={`
                                                        px-4 py-3 rounded-[10px] border border-solid transition-all duration-200 
                                                        text-sm font-medium whitespace-nowrap flex-shrink-0
                                                            ${activeTab === tab.id
                                                        ? "bg-[#192335] border-[#192335] text-white"
                                                        : "border-[#eaedf0] text-[#192335] hover:border-[#192335] hover:bg-[#f8f9fa]"
                                                    }
                                                        `}
                                                onClick={() => setActiveTab(tab.id)}
                                                role="tab"
                                                aria-selected={activeTab === tab.id}
                                                aria-controls={`tabpanel-${tab.id}`}
                                                id={`tab-${tab.id}`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* right */}
                        <Card className="text-card-foreground flex flex-col gap-6 border rounded-[10px] shadow-md border-none col-span-4 py-0">
                            <CardHeader className="pt-5">
                                <div className="border-b border-[#dee2e6]">
                                    <h4 className="text-left text-lg font-semibold text-[#192335] font-['Outfit',sans-serif]">
                                        Đặt Coach
                                    </h4>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-6 pb-0">
                                {/* Availability Status */}
                                <div>
                                    <p className="text-left text-base text-[#6b7385] leading-6 font-['Outfit',sans-serif]">
                                        <span className="font-bold">Kevin Anderson</span>
                                        <span className="font-medium"> hiện có sẵn</span>
                                    </p>
                                </div>

                                {/* Pricing Section */}
                                <section
                                    className="bg-[#f9f9f6] p-5 flex flex-col items-center justify-center space-y-1"
                                    aria-label="Pricing information"
                                >
                                    <div className="text-[#192335] text-center font-['Outfit',sans-serif]">
                                        Bắt đầu từ
                                    </div>

                                    <div className="flex items-baseline justify-center">
                                        <span className="text-xl font-semibold text-[#097e52] font-['Outfit',sans-serif]">
                                            250 đô la
                                        </span>
                                        <span className="text-[#6b7385] ml-1 font-['Outfit',sans-serif]">
                                            /giờ
                                        </span>
                                    </div>
                                </section>


                            </CardContent>
                            {/* Book Now Button */}
                            <CardFooter className="pt-3 pb-0">
                                <Button className="w-full bg-[#192335] hover:bg-[#2a3441] text-white font-medium py-3 px-5 rounded-[10px]
                                    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#192335]
                                    focus:ring-offset-2 font-['Outfit',sans-serif] h-auto"
                                    aria-label="Book now"
                                    type="button">Đặt ngay</Button>
                            </CardFooter>
                        </Card>
                    </div>
                    {/* Bio and avaiblity */}
                    <div className="grid grid-cols-12 gap-4 pb-4">
                        {/* left */}
                        <Card className="col-span-8 flex flex-col bg-white rounded-[10px] shadow-md border-none">
                            <CardHeader className="px-5 pt-5 pb-0">
                                <div className="flex items-center justify-between w-full border-b border-[#eaedf0] pb-5">
                                    <h4 className="text-left text-base font-medium text-[#192335] font-['Outfit',sans-serif]">
                                        Tiểu sử ngắn
                                    </h4>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-2 h-auto hover:bg-gray-100"
                                        onClick={toggleBioExpanded}
                                        aria-label={bioExpanded ? "Thu gọn tiểu sử" : "Mở rộng tiểu sử"}
                                    >
                                        {bioExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-[#192335]" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-[#192335]" />
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-5">
                                <div className={`space-y-6 transition-all duration-300 ${bioExpanded ? 'max-h-none' : 'max-h-[75px] overflow-hidden'
                                    }`}>
                                    <div className="space-y-4">
                                        <p className="text-left text-base text-[#6b7385] leading-relaxed font-['Outfit',sans-serif]">
                                            <span className="font-medium">Tên:</span> {profileData.name}
                                        </p>

                                        <p className="text-left text-base text-[#6b7385] leading-relaxed font-['Outfit',sans-serif]">
                                            <span className="font-medium">Kinh nghiệm:</span> {profileData.experience}
                                        </p>

                                        <p className="text-left text-base text-[#6b7385] leading-relaxed font-['Outfit',sans-serif]">
                                            <span className="font-medium">Chứng chỉ:</span> {profileData.certification}
                                        </p>
                                    </div>
                                </div>

                                {!bioExpanded && (
                                    <div className="mt-3">
                                        <Button
                                            variant="link"
                                            className="text-[#097e52] hover:text-[#097e52] hover:underline p-0 h-auto text-sm font-['Outfit',sans-serif]"
                                            onClick={toggleBioExpanded}
                                        >
                                            Hiển thị thêm
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* right */}
                        <Card className="col-span-4 flex flex-col bg-white rounded-[10px] shadow-md border-none">
                            <CardHeader className="pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#f9f9f6] rounded-full flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-[#6b7385]" />
                                    </div>
                                    <h4 className="text-left text-lg font-semibold text-[#192335] font-['Outfit',sans-serif]">
                                        Khả năng tiếp theo
                                    </h4>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="space-y-4" role="list" aria-label="Available time slots">
                                    {availabilityData.map((timeSlot, index) => (
                                        <div
                                            key={index}
                                            className="w-full max-w-sm p-3 rounded-[10px] border border-[#eaedf0] 
                     hover:border-[#d1d5db] hover:bg-gray-50 transition-all duration-200 
                     cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:ring-opacity-50"
                                            role="listitem"
                                            tabIndex={0}
                                            onClick={() => handleTimeSlotSelect(timeSlot, index)}
                                            onKeyDown={(e) => handleKeyDown(e, timeSlot, index)}
                                        >
                                            <p className="text-left text-base text-[#6b7385] leading-relaxed font-['Outfit',sans-serif]">
                                                {timeSlot}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {/* lesson, chat, request, galery */}
                    <div className="grid grid-cols-12 gap-4 pb-4">
                        {/* left */}
                        <div className="col-span-8 flex flex-col gap-4">
                            {/* lesson with me */}
                            <Card className="bg-white rounded-[10px] shadow-md border-none">
                                <CardHeader className="px-5 py-5 border-b border-gray-200">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col items-start">
                                            <h4 className="text-left text-xl font-semibold text-blue-600 font-['Outfit'] leading-normal">
                                                Bài học cùng tôi
                                            </h4>
                                        </div>
                                        <button
                                            onClick={handleLessonsToggle}
                                            className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                                            aria-label={lessonsExpanded ? "Thu gọn" : "Mở rộng"}
                                        >
                                            <ChevronUp
                                                className={`w-5 h-5 transition-transform duration-200 ${lessonsExpanded ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </CardHeader>

                                {lessonsExpanded && (
                                    <CardContent className="px-5 pt-5 pb-2">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col">
                                                <p className="text-left text-base font-normal text-slate-600 font-['Outfit'] leading-normal">
                                                    Hãy tham gia cùng tôi để được học những bài học cá nhân hóa phù hợp với nhu cầu của bạn.
                                                    Chọn lớp học cá nhân, 2 người hoặc nhóm để có trải nghiệm cầu lông được cá nhân hóa.
                                                    Nâng cao kỹ năng và tận hưởng quá trình cải thiện.
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3.5 pb-3.5">
                                                {lessonTypes.map((lesson) => {
                                                    const IconComponent = lesson.icon;
                                                    const isSelected = selectedLesson?.id === lesson.id;

                                                    return (
                                                        <button
                                                            key={lesson.id}
                                                            onClick={() => handleLessonSelect(lesson)}
                                                            className={`p-2.5 bg-gray-100 hover:bg-gray-200 rounded-[10px] flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                                                                }`}
                                                            title={lesson.description}
                                                        >
                                                            <IconComponent className="w-4 h-4 text-gray-500" />
                                                            <span className="text-base font-normal text-blue-600 font-['Outfit'] whitespace-nowrap">
                                                                {lesson.name}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {selectedLesson && (
                                                <div className="mt-4 p-4 bg-blue-50 rounded-[10px] border border-blue-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <selectedLesson.icon className="w-5 h-5 text-blue-600" />
                                                        <h3 className="text-left font-semibold text-blue-800 font-['Outfit']">
                                                            {selectedLesson.name}
                                                        </h3>
                                                    </div>
                                                    <p className="text-left text-base text-blue-700 font-['Outfit']">
                                                        {selectedLesson.description}
                                                    </p>
                                                    <div className="mt-3">
                                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[10px] transition-colors duration-200 font-['Outfit'] text-sm font-medium">
                                                            Đặt lịch ngay
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                            {/* coaching */}
                            <Card className="bg-white rounded-[10px] shadow-md border-none">
                                <CardHeader className="px-5 py-5 border-b border-gray-200">
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col items-start">
                                            <h4 className="text-left text-xl font-semibold text-blue-600 font-['Outfit'] leading-normal">
                                                Huấn luyện
                                            </h4>
                                        </div>
                                        <button
                                            onClick={handleCoachingToggle}
                                            className="w-5 h-5 text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                                            aria-label={coachingExpanded ? "Thu gọn" : "Mở rộng"}
                                        >
                                            <ChevronUp
                                                className={`w-5 h-5 transition-transform duration-200 ${coachingExpanded ? "rotate-180" : ""
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </CardHeader>

                                {coachingExpanded && (
                                    <CardContent className="px-5 pb-5">
                                        <div className="flex flex-col">
                                            <p className="text-base font-normal text-slate-600 font-['Outfit'] leading-normal">
                                                Trải nghiệm dịch vụ huấn luyện chuyển đổi được thiết kế riêng theo nhu cầu của bạn.
                                                Dù là buổi học cá nhân, theo cặp hay nhóm nhỏ, hãy khai phá tiềm năng của bạn với
                                                hướng dẫn cá nhân hóa để thành công.
                                            </p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                            {/* reviews */}
                            <Card className="bg-white rounded-[10px] shadow-md border-none">
                                <CardHeader className="px-5 py-5 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-left text-xl font-semibold text-[#192335] font-['Outfit']">Đánh giá</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-[#097e52] text-[#097e52] hover:bg-[#097e52] hover:text-white"
                                        >
                                            Viết đánh giá
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 py-5">
                                    <p className="text-left text-base text-[#6b7385] leading-relaxed font-['Outfit']">
                                        Kevin Anderson là một huấn luyện viên tennis xuất sắc với phong cách dạy rất chuyên nghiệp.
                                        Học viên đánh giá cao phương pháp giảng dạy của anh và sự cải thiện kỹ năng rõ rệt.
                                    </p>
                                </CardContent>
                                <CardFooter className="px-5 pb-5">
                                    <Button className="w-full bg-[#097e52] hover:bg-[#097e52]/90 text-white">
                                        Xem tất cả đánh giá
                                    </Button>
                                </CardFooter>
                            </Card>
                            {/* location */}
                            <Card className="bg-white rounded-[10px] shadow-md border-none">
                                <CardHeader className="px-5 py-5 border-b border-gray-200">
                                    <h4 className="text-left text-xl font-semibold text-[#192335] font-['Outfit']">Địa điểm</h4>
                                </CardHeader>
                                <CardContent className="px-5 py-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={trainerData.locationIcon}
                                                alt="Location"
                                                className="w-5 h-4"
                                            />
                                            <span className="text-sm text-[#6b7385] font-['Outfit']">
                                                {trainerData.location}
                                            </span>
                                        </div>
                                        <div className="w-full h-48 bg-gray-200 rounded-[10px] flex items-center justify-center">
                                            <span className="text-gray-500">Bản đồ sẽ được hiển thị ở đây</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* right */}
                        <div className="col-span-4 flex flex-col gap-4">
                            {/* request for availability */}
                            <Card className="bg-white rounded-[10px] shadow-md border-none">
                                <CardHeader className="px-5 py-5 border-b border-gray-200">
                                    <h4 className="text-left text-lg font-semibold text-[#192335] font-['Outfit']">
                                        Yêu cầu lịch trống
                                    </h4>
                                </CardHeader>
                                <CardContent className="px-5 py-5">
                                    <form>
                                        <div className="flex flex-col gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name" className="text-left text-sm font-medium text-[#192335]">
                                                    Họ và tên
                                                </Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    placeholder="Nhập họ và tên"
                                                    required
                                                    className="border-gray-200 focus:border-[#097e52]"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="email" className="text-left text-sm font-medium text-[#192335]">
                                                    Email
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="example@email.com"
                                                    required
                                                    className="border-gray-200 focus:border-[#097e52]"
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="phone" className="text-left text-sm font-medium text-[#192335]">
                                                    Số điện thoại
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="Nhập số điện thoại"
                                                    required
                                                    className="border-gray-200 focus:border-[#097e52]"
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="px-5 pb-5">
                                    <Button className="w-full bg-[#192335] hover:bg-[#2a3441] text-white">
                                        Gửi yêu cầu
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card className="bg-white rounded-[10px] shadow-md border-none">
                                <CardHeader className="px-5 py-5 border-b border-gray-200">
                                    <h4 className="text-left text-lg font-semibold text-[#192335] font-['Outfit']">
                                        Thông tin chủ sở hữu
                                    </h4>
                                </CardHeader>
                                <CardContent className="px-5 py-5">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-full bg-cover bg-center"
                                                style={{ backgroundImage: `url(${trainerData.profileImage})` }}
                                            />
                                            <div>
                                                <h5 className="text-left font-semibold text-[#192335] font-['Outfit']">
                                                    {trainerData.name}
                                                </h5>
                                                <p className="text-left text-base text-[#6b7385] font-['Outfit']">
                                                    Huấn luyện viên chuyên nghiệp
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-left text-base text-[#6b7385] leading-relaxed font-['Outfit']">
                                            Kevin Anderson là một huấn luyện viên tennis có kinh nghiệm lâu năm.
                                            Anh ấy đã huấn luyện các vận động viên ở tất cả các cấp độ khác nhau.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="w-full border-[#097e52] text-[#097e52] hover:bg-[#097e52] hover:text-white"
                                        >
                                            Liên hệ chủ sở hữu
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </>
    )
}
