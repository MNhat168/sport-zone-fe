"use client";
import { useParams } from "react-router-dom";

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Star,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Heart,
  Eye,
  //   ChevronUp,
} from "lucide-react";
import { getCoachById, clearCurrentCoach } from "@/features/coach";
import { createCoachReviewThunk } from "@/features/reviews/reviewThunk";
import { getReviewsForCoachAPI } from "@/features/reviews/reviewAPI";
import {
  CustomFailedToast,
  CustomSuccessToast,
} from "@/components/toast/notificiation-toast";
import type { RootState, AppDispatch } from "@/store/store";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { PageWrapper } from "@/components/layouts/page-wrapper";

interface LessonType {
  id: string;
  type: "single" | "pair" | "group";
  name: string;
  description: string;
  icon: typeof User;
  iconBg: string;
  iconColor: string;
  badge: string;
}

// Mock lesson types - sẽ được thay thế bằng dữ liệu thật từ API khi có
const mockLessonTypes: LessonType[] = [
  {
    id: "1",
    type: "single",
    name: "Buổi học kèm 1-1",
    description:
      "Buổi huấn luyện cá nhân hóa theo nhu cầu và trình độ của bạn. Nhận sự hướng dẫn tập trung từ HLV để cải thiện kỹ thuật, chiến thuật và nâng cao kỹ năng nhanh chóng.",
    icon: User,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "1 kèm 1",
  },
  {
    id: "2",
    type: "group",
    name: "Buổi học nhóm nhỏ",
    description:
      "Luyện tập cùng 2-4 người trong môi trường hợp tác và hỗ trợ. Học hỏi từ HLV và bạn tập, phát triển kỹ năng phối hợp và thi đấu.",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "2-4 người",
  },
];

interface CoachDetailPageProps {
  coachId?: string;
}

export default function CoachDetailPage({ coachId }: CoachDetailPageProps) {
  const params = useParams();
  const effectiveCoachId = coachId ?? params.id;
  const dispatch = useDispatch<AppDispatch>();
  const { currentCoach, detailLoading, detailError } = useSelector(
    (state: RootState) => state.coach
  );

  const [activeTab, setActiveTab] = useState("bio");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [coachReviews, setCoachReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);
  const REVIEW_PAGE_LIMIT = 5;

  // Get lesson types from real coach data or fallback to mock data
  const getLessonTypes = (): LessonType[] => {
    if (currentCoach?.lessonTypes?.length) {
      return currentCoach.lessonTypes.map((lesson) => ({
        id: lesson._id,
        type: lesson.type as "single" | "pair" | "group",
        name: lesson.name,
        description: lesson.description,
        icon: lesson.type === "single" ? User : Users,
        iconBg: lesson.type === "single" ? "bg-green-100" : "bg-blue-100",
        iconColor:
          lesson.type === "single" ? "text-green-600" : "text-blue-600",
        badge: lesson.type === "single" ? "1-on-1" : "2-4 people",
      }));
    }
    return mockLessonTypes;
  };

  const lessonTypes = getLessonTypes();

  // Fetch coach data when component mounts or coachId changes
  useEffect(() => {
    if (effectiveCoachId) {
      dispatch(getCoachById(effectiveCoachId));
    }
  }, [dispatch, effectiveCoachId]);

  // Fetch reviews for this coach (paginated) and set up auto-refresh (polling)
  const fetchReviews = useCallback(
    async (page = 1, append = false) => {
      if (!effectiveCoachId) return;
      try {
        setReviewsLoading(true);
        const resp = await getReviewsForCoachAPI(effectiveCoachId, page, REVIEW_PAGE_LIMIT);
        const items = Array.isArray(resp?.data) ? resp.data : resp?.data ?? [];
        if (append) setCoachReviews((prev) => [...prev, ...items]);
        else setCoachReviews(items);
        setReviewsPage(resp?.pagination?.page ?? page);
        setReviewsTotalPages(resp?.pagination?.totalPages ?? 1);
      } catch (err) {
        console.error('Failed to load coach reviews', err);
      } finally {
        setReviewsLoading(false);
      }
    },
    [effectiveCoachId],
  );

  useEffect(() => {
    if (!effectiveCoachId) return;
    // initial fetch page 1
    fetchReviews(1, false);
    // poll every 20 seconds to refresh first page
    const timer = setInterval(() => {
      fetchReviews(1, false);
    }, 20000);
    return () => clearInterval(timer);
  }, [effectiveCoachId, fetchReviews]);

  // Cleanup coach data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentCoach());
    };
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "bio",
        "lessons",
        "coaching",
        "gallery",
        "reviews",
        "location",
      ];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveTab(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const nextGallerySlide = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % (galleryImages.length - 2));
  };

  const prevGallerySlide = () => {
    setCurrentGalleryIndex(
      (prev) =>
        (prev - 1 + (galleryImages.length - 2)) % (galleryImages.length - 2)
    );
  };

  const tabs = [
    { id: "bio", label: "Giới thiệu" },
    { id: "lessons", label: "Buổi học cùng tôi" },
    { id: "coaching", label: "Huấn luyện" },
    { id: "gallery", label: "Thư viện ảnh" },
    { id: "reviews", label: "Đánh giá" },
    { id: "location", label: "Vị trí" },
  ];

  const galleryImages = [
    {
      url: "/badminton-player-training-on-green-court.jpg",
      alt: "Training session 1",
    },
    { url: "/badminton-player-hitting-shuttlecock.jpg", alt: "Court practice" },
    {
      url: "/badminton-court-with-net-and-lights.jpg",
      alt: "Coaching session",
    },
    { url: "/badminton-doubles-match.jpg", alt: "Group training" },
    { url: "/badminton-player-serving.jpg", alt: "Serving practice" },
    { url: "/badminton-indoor-court.jpg", alt: "Indoor facility" },
  ];

  //   const reviews = [
  //     {
  //       name: "Amanda Rosales",
  //       date: "09/26/2023",
  //       rating: 5,
  //       title: "Absolutely Perfect!",
  //       content:
  //         "Amazing facility. It is a perfect place for friendly match with your friends or a competitive match. It is the best place.",
  //       images: [
  //         "/badminton-court-1.jpg",
  //         "/badminton-court-2.jpg",
  //         "/badminton-court-3.jpg",
  //         "/badminton-court-4.jpg",
  //         "/badminton-court-5.jpg",
  //       ],
  //       helpful: 12,
  //     },
  //     {
  //       name: "Michael Chen",
  //       date: "09/18/2023",
  //       rating: 5,
  //       title: "Awesome. Its very convenient to play.",
  //       content:
  //         "Amazing facility. It is a perfect place for friendly match with your friends or a competitive match. Excellent coaching and atmosphere. Highly recommended for an exceptional playing experience.",
  //       helpful: 8,
  //     },
  //   ];

  const similarCoaches = [
    {
      name: "Kevin Anderson",
      sport: "Tennis Coach",
      location: "Los Angeles, CA",
      rating: 4.9,
      reviews: 89,
      sessions: 156,
      availability: "Fri, Sept 2023",
      price: 180,
      image: "/male-tennis-coach.png",
      featured: true,
      color: "bg-pink-100",
    },
    {
      name: "Angela Rodriguez",
      sport: "Basketball Coach",
      location: "Chicago, IL",
      rating: 4.8,
      reviews: 124,
      sessions: 203,
      availability: "Fri, Sept 2023",
      price: 220,
      image: "/female-basketball-coach.png",
      featured: false,
      color: "bg-orange-100",
    },
    {
      name: "Evan Roddick",
      sport: "Soccer Coach",
      location: "Miami, FL",
      rating: 4.7,
      reviews: 67,
      sessions: 134,
      availability: "Sat, Sept 2023",
      price: 195,
      image: "/male-soccer-coach.png",
      featured: true,
      color: "bg-blue-100",
    },
  ];

  // Trạng thái tải dữ liệu HLV
  if (detailLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin huấn luyện viên...</p>
        </div>
      </div>
    );
  }

  // Trạng thái lỗi khi tải dữ liệu HLV
  if (detailError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lỗi tải dữ liệu huấn luyện viên: {detailError.message}</p>
          <Button
            onClick={() => dispatch(getCoachById(effectiveCoachId ?? ""))}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Use real coach data from API only
  const coachData = currentCoach;

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper className="bg-background">
      {/* Hero Background Section */}
      <div className="relative bg-[#1a2332] overflow-hidden h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/badminton-player-action-shot-dark.jpg"
            alt="Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/60 to-[#1a2332]/90" />
        </div>
      </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 -mt-48 relative z-20 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Coach Info Card and Content Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coach Information Card - Standalone */}
            <Card className="shadow-2xl border-0 animate-fade-in-up bg-white">
              <CardContent className="p-6">
                {coachData ? (
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Coach Avatar */}
                    <div className="relative group flex-shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
                      <Avatar className="relative h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage
                          src={
                            coachData.avatar ||
                            coachData.profileImage ||
                            "/professional-coach-portrait.png"
                          }
                          alt={coachData.name}
                        />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                          {coachData.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Coach Info */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="text-3xl font-bold text-balance">
                            {coachData.name}
                          </h1>
                          <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          </Badge>
                          <Button
                            size="sm"
                            className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white border-0 flex items-center gap-2"
                          >
                            <Heart className="h-4 w-4" />
                            Yêu thích
                          </Button>
                        </div>
                        <p className="text-base text-muted-foreground text-left">
                          {coachData.description}
                        </p>
                      </div>

                      {/* Stats Row */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="bg-yellow-100 p-1.5 rounded">
                            <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                          </div>
                          <span className="font-semibold">
                            {coachData.rating}
                          </span>
                          <span className="text-muted-foreground">
                            {coachData.reviewCount} đánh giá
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{coachData.location}</span>
                        </div>
                      </div>

                      {/* Additional Stats */}
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>Hạng: {coachData.level}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Buổi đã hoàn thành: {coachData.completedSessions}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Tham gia Dreamsports từ: {coachData.memberSince
                              ? new Date(
                                  coachData.memberSince
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Coach data not found.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Thanh tab điều hướng */}
            <div className="bg-white rounded-lg shadow-md p-3 sticky top-4 z-30 animate-fade-in">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    onClick={() => scrollToSection(tab.id)}
                    className={`transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-[#1a2332] text-white hover:bg-[#1a2332]/90"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Các phần nội dung */}
            <div className="space-y-6">
              {/* Short Bio Section */}
              <Card
                id="bio"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Giới thiệu ngắn</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground text-left">
                      Họ và tên: {coachData?.name ?? "-"}
                    </p>
                    <p className="text-left">
                      Kinh nghiệm: {coachData?.coachingDetails?.experience ?? "-"}
                    </p>
                    <p className="text-left">
                      Chứng chỉ: {coachData?.coachingDetails?.certification ?? "-"}
                    </p>
                  </div>
                  <Button
                    variant="link"
                    className="text-green-600 hover:text-green-700 p-0 h-auto"
                  >
                    Xem thêm
                  </Button>
                </CardContent>
              </Card>

              {/* Phần: Buổi học cùng tôi */}
              <Card
                id="lessons"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Buổi học cùng tôi</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed text-left">
                    Huấn luyện cá nhân hóa theo nhu cầu của bạn. Chọn buổi 1 kèm 1
                    hoặc học nhóm để có môi trường hợp tác và hỗ trợ.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {lessonTypes.map((lesson) => {
                      const IconComponent = lesson.icon;
                      return (
                        <div key={lesson.id} className="group">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedLesson(lesson)}
                            className="w-full h-auto py-6 flex flex-col items-center gap-3 hover:border-green-500 hover:bg-green-50 transition-all duration-300 hover:scale-[1.02] bg-transparent"
                          >
                            <div
                              className={`${lesson.iconBg} p-3 rounded-full group-hover:opacity-80 transition-opacity`}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${lesson.iconColor}`}
                              />
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-base">
                                {lesson.name}
                              </div>
                              <Badge variant="secondary" className="mt-2">
                                {lesson.badge}
                              </Badge>
                            </div>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Phần: Huấn luyện */}
              <Card
                id="coaching"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Huấn luyện</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed text-left">
                    Trải nghiệm huấn luyện cá nhân hóa phù hợp với nhu cầu của bạn.
                    Dù là 1 kèm 1 hay nhóm nhỏ, hãy phát huy tối đa tiềm năng của bạn.
                  </p>
                  {/* <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300">
                      <h4 className="font-semibold mb-2 text-left">Phát triển kỹ năng kỹ thuật</h4>
                      <p className="text-sm text-muted-foreground text-left">Nắm vững kỹ thuật cơ bản như di chuyển, vung vợt và di chuyển vị trí.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300">
                      <h4 className="font-semibold mb-2 text-left">Huấn luyện chiến thuật</h4>
                      <p className="text-sm text-muted-foreground text-left">Học chiến lược thi đấu, chọn cú đánh và cách đọc đối thủ.</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300">
                      <h4 className="font-semibold mb-2 text-left">Rèn luyện tâm lý thi đấu</h4>
                      <p className="text-sm text-muted-foreground text-left">Xây dựng sự tự tin, tập trung và bản lĩnh để thi đấu dưới áp lực.</p>
                    </div>
                  </div> */}
                </CardContent>
              </Card>

              {/* Phần: Thư viện ảnh */}
              <Card
                id="gallery"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Thư viện ảnh</CardTitle>
                    {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    </Button> */}
                  </div>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="relative px-12">
                    {/* Mũi tên trái */}
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={prevGallerySlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {/* Vùng ảnh */}
                    <div className="overflow-hidden">
                      <div
                        className="flex gap-4 transition-transform duration-500 ease-in-out"
                        style={{
                          transform: `translateX(-${
                            currentGalleryIndex * (100 / 3 + 1.33)
                          }%)`,
                        }}
                      >
                        {galleryImages.map((image, index) => (
                          <div
                            key={index}
                            className="flex-shrink-0 w-[calc(33.333%-0.67rem)] aspect-[3/4] rounded-lg overflow-hidden"
                          >
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.alt}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mũi tên phải */}
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={nextGallerySlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Phần: Đánh giá */}
              <Card
                id="reviews"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Đánh giá</CardTitle>
                    <Button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Viết đánh giá
                    </Button>
                  </div>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
                      {/* Bên trái - Điểm trung bình */}
                      <div className="flex flex-col items-center justify-center space-y-2 min-w-[180px]">
                        <div className="text-6xl font-bold text-foreground">
                          4.8
                        </div>
                        <div className="text-sm text-muted-foreground">
                          trên 5.0
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-5 w-5 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Bên phải - Chỉ số chất lượng */}
                      <div className="space-y-1">
                        <p className="text-sm font-semibold mb-3 text-left">Được 97% người chơi khuyến nghị</p>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                          {[
                            { label: "Chất lượng dịch vụ", value: 100 },
                            { label: "Chất lượng dịch vụ", value: 100 },
                            { label: "Chất lượng dịch vụ", value: 100 },
                            { label: "Chất lượng dịch vụ", value: 100 },
                          ].map((metric, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {metric.label}
                                </span>
                                <span className="font-semibold">5.0</span>
                              </div>
                              <Progress
                                value={metric.value}
                                className="h-1.5 bg-amber-200 [&>div]:bg-orange-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {reviewsLoading ? (
                      <div className="text-center text-muted-foreground">Loading reviews...</div>
                    ) : coachReviews && coachReviews.length > 0 ? (
                      coachReviews.map((r: any, idx: number) => {
                        const author = r.user?.fullName || 'Anonymous';
                        const rating = r.rating || 0;
                        const comment = r.comment || '';
                        const dateStr = r.createdAt || r.booking?.createdAt;
                        const date = dateStr ? new Date(dateStr).toLocaleDateString() : '';
                        return (
                          <Card key={idx} className="shadow-md hover:shadow-lg transition-all duration-300 border border-border">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 flex-shrink-0">
                                  <AvatarImage src="/placeholder.svg?height=48&width=48" />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                    {author
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h4 className="font-semibold">{author}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex gap-0.5">
                                          {Array.from({ length: 5 }).map((_, s) => (
                                            <Star
                                              key={s}
                                              className={`h-4 w-4 ${s < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm">
                                    <Badge className={` ${r.rating >= 4 ? 'bg-green-600' : 'bg-red-600'} text-white font-medium`}>
                                      Review Type
                                    </Badge>
                                  </div>

                                  <div>
                                    <h5 className="font-bold text-base mb-2 text-left">{comment.slice(0, 120)}</h5>
                                    <p className="text-muted-foreground leading-relaxed text-left">{comment}</p>
                                  </div>

                                  <div className="text-xs text-muted-foreground text-left">{date}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="text-muted-foreground">Chưa có đánh giá.</div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full hover:bg-muted bg-transparent"
                    onClick={async () => {
                      if (reviewsLoading) return;
                      if (reviewsPage >= reviewsTotalPages) return;
                      await fetchReviews(reviewsPage + 1, true);
                    }}
                    disabled={reviewsLoading || reviewsPage >= reviewsTotalPages}
                  >
                    {reviewsPage >= reviewsTotalPages ? 'Không còn đánh giá' : 'Tải thêm'}
                  </Button>
                </CardContent>
              </Card>

              {/* Phần: Vị trí */}
              <Card
                id="location"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Vị trí</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-green-50 hover:border-green-500 bg-transparent"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Chỉ đường
                    </Button>
                  </div>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 text-left">Địa điểm của chúng tôi</h4>
                      <p className="text-sm text-green-700 mt-1">123 Premier Street, New York, NY 10012</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cột phải - Đặt lịch và thanh bên */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 animate-slide-in-right">
              {/* Thẻ: Đặt huấn luyện viên */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="space-y-4 pb-6">
                  <CardTitle className="text-2xl font-bold text-left">Đặt huấn luyện viên</CardTitle>
                  <hr className="my-2 border-gray-200" />

                  <p className="text-base text-muted-foreground text-left">
                    <span className="font-semibold text-foreground">
                      {coachData?.name ?? "-"}
                    </span>{" "}
                    đang sẵn sàng
                  </p>

                  <div className="text-center py-6 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Giá từ</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-green-600">
                        ${coachData?.price ?? "-"}
                      </span>
                      <span className="text-lg text-muted-foreground">/giờ</span>
                    </div>
                  </div>

                  {/* <Button className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                    <Calendar className="mr-2 h-5 w-5" />
                    Đặt ngay
                  </Button> */}
                </CardHeader>
              </Card>

              {/* Lịch trống tiếp theo */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                    Lịch trống tiếp theo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {(coachData?.availableSlots?.length
                      ? coachData.availableSlots
                          .slice(0, 4)
                          .map((slot, index) => ({
                            day: new Date(
                              Date.now() + index * 24 * 60 * 60 * 1000
                            ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }),
                            time: slot.startTime,
                          }))
                      : [
                          { day: "Th 5, 24 Thg 9", time: "3 PM" },
                          { day: "Th 6, 25 Thg 9", time: "4 PM" },
                          { day: "Th 7, 26 Thg 9", time: "2 PM" },
                          { day: "CN, 27 Thg 9", time: "11 AM" },
                        ]
                    ).map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto py-3 px-2 flex flex-col items-start hover:border-green-500 hover:bg-green-50 transition-all duration-300 group bg-transparent"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="text-xs text-muted-foreground group-hover:text-green-700">
                          {slot.day}
                        </span>
                        <span className="font-semibold text-sm group-hover:text-green-600">
                          {slot.time}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Yêu cầu lịch trống */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-left">Yêu cầu lịch trống</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showRequestForm ? (
                    <Button
                      variant="outline"
                      className="w-full hover:bg-green-50 hover:border-green-500 transition-all duration-300 bg-transparent"
                      onClick={() => setShowRequestForm(true)}
                    >
                      Mở biểu mẫu yêu cầu
                    </Button>
                  ) : (
                    <form className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input id="name" placeholder="Nhập họ và tên" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Nhập địa chỉ email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Chọn thành phố</Label>
                        <Select>
                          <SelectTrigger id="city">
                            <SelectValue placeholder="Chọn thành phố" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ny">New York</SelectItem>
                            <SelectItem value="la">Los Angeles</SelectItem>
                            <SelectItem value="chicago">Chicago</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details">Chi tiết</Label>
                        <Textarea
                          id="details"
                          placeholder="Nhập nội dung"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" className="mt-1" />
                        <Label
                          htmlFor="terms"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          Bằng việc nhấn "Gửi yêu cầu" tôi đồng ý với Điều khoản dịch vụ của Dreamcoach
                        </Label>
                      </div>
                      <Button className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white h-11 font-semibold hover:scale-[1.02] transition-transform duration-300">
                        Gửi yêu cầu
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Danh sách bởi chủ sở hữu */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-left">Danh sách bởi chủ sở hữu</CardTitle>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300 cursor-pointer group">
                    <img
                      src="/sports-academy-building.jpg"
                      alt="Manchester Academy"
                      className="w-20 h-20 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold group-hover:text-green-600 transition-colors">
                        Manchester Academy
                      </h4>
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span>New York, NY 10012</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

        {/* HLV tương tự */}
        <div className="bg-muted/30 py-16 mt-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Huấn luyện viên tương tự</h2>
            <Button variant="outline" className="hover:bg-white bg-transparent">
              Xem tất cả HLV
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarCoaches.map((coach, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 animate-fade-in-up bg-white"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Coach Image with Overlays */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={
                      coach.image ||
                      "/placeholder.svg?height=400&width=320&query=professional coach portrait"
                    }
                    alt={coach.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                    <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white border-0 font-semibold">
                      {coach.featured ? "Professional" : "Rookie"}
                    </Badge>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white/90 hover:bg-white hover:text-red-500 transition-colors h-9 w-9"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Nhãn giá ở dưới */}
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-[#1a2332] hover:bg-[#1a2332]/90 text-white border-0 px-3 py-1.5 text-sm font-semibold">
                      Từ ${coach.price}/giờ
                    </Badge>
                  </div>
                </div>

                {/* Card Content */}
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-green-600 transition-colors mb-1">
                      {coach.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{coach.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Certified badminton coach with a deep understanding of the
                    sport's and strategies game.
                  </p>

                  {/* Nút hành động */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 font-semibold"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Xem hồ sơ
                    </Button>
                    <Button className="flex-1 bg-[#1a2332] hover:bg-[#1a2332]/90 text-white font-semibold">
                      <Calendar className="h-4 w-4 mr-2" />
                      Đặt ngay
                    </Button>
                  </div>
                </CardContent>

                {/* Chân thẻ */}
                <CardFooter className="flex items-center justify-between border-t pt-4 pb-4 px-6 bg-muted/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Lịch sắp tới
                      </div>
                      <div className="text-xs font-semibold">
                        {coach.availability}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="bg-yellow-500 p-1.5 rounded">
                      <Star className="h-3.5 w-3.5 text-white fill-white" />
                    </div>
                    <span className="font-semibold">
                      {coach.reviews} đánh giá
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal chi tiết buổi học */}
        <Dialog
        open={!!selectedLesson}
        onOpenChange={() => setSelectedLesson(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedLesson?.name}</DialogTitle>
            <DialogDescription className="sr-only">Chi tiết và thông tin buổi học</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Loại buổi học */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Loại buổi học</Label>
              <div className="flex items-center gap-3">
                {selectedLesson && (
                  <>
                    <div
                      className={`${selectedLesson.iconBg} p-2.5 rounded-lg`}
                    >
                      <selectedLesson.icon
                        className={`h-5 w-5 ${selectedLesson.iconColor}`}
                      />
                    </div>
                    <div>
                      <Badge variant="secondary" className="font-semibold">
                        {selectedLesson.badge}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">Phiên {selectedLesson.type}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tên buổi học */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tên</Label>
              <p className="text-lg font-semibold">{selectedLesson?.name}</p>
            </div>

            {/* Mô tả */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Mô tả</Label>
              <p className="text-muted-foreground leading-relaxed">
                {selectedLesson?.description}
              </p>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedLesson(null)}
                className="flex-1 hover:bg-muted bg-transparent"
              >Đóng</Button>
              {/* <Button className="flex-1 bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Đặt buổi học này
              </Button> */}
            </div>
          </div>
        </DialogContent>
      </Dialog>

        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Viết đánh giá</DialogTitle>
            <DialogDescription>Chia sẻ trải nghiệm của bạn với {coachData?.name ?? "HLV này"}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-6 py-4"
            onSubmit={async (e) => {
              e.preventDefault();
              // Simple client-side validation
              if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
                return CustomFailedToast("Vui lòng chọn điểm đánh giá từ 1 đến 5");
              }
              if (!reviewComment || reviewComment.trim().length < 10) {
                return CustomFailedToast("Vui lòng nhập bình luận (tối thiểu 10 ký tự)");
              }

              setIsSubmittingReview(true);
              try {
                const payload = {
                  type: "coach" as const,
                  rating: reviewRating,
                  comment: reviewComment.trim(),
                  coachId: effectiveCoachId ?? "",
                  bookingId: "",
                };

                const action: any = await dispatch(
                  createCoachReviewThunk(payload as any)
                );

                  if (action?.meta?.requestStatus === "fulfilled") {
                  // reset and close
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setHoveredRating(0);
                  setReviewComment("");
                  
                  CustomSuccessToast("Cảm ơn bạn — đánh giá đã được gửi.");
                  // Refresh reviews immediately after successful submission
                  try {
                    await fetchReviews();
                  } catch (err) {
                    console.error('Failed to refresh reviews after submit', err);
                  }
                } else {
                  const message = action?.payload || "Gửi đánh giá thất bại";
                  CustomFailedToast(String(message));
                }
              } catch (err: any) {
                CustomFailedToast(err?.message || "Gửi đánh giá thất bại");
              } finally {
                setIsSubmittingReview(false);
              }
            }}
          >
            {/* Loại đánh giá (cố định là HLV) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Loại đánh giá</Label>
              <Badge className="bg-green-600 text-white">Huấn luyện viên</Badge>
            </div>

            {/* Điểm đánh giá */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Điểm đánh giá</Label>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoveredRating || reviewRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <span className="text-sm font-semibold text-muted-foreground ml-2">
                    {reviewRating}.0
                  </span>
                )}
              </div>
            </div>

            {/* Bình luận */}
            <div className="space-y-2">
              <Label htmlFor="review-comment" className="text-sm font-semibold">
                Bình luận
              </Label>
              <Textarea
                id="review-comment"
                placeholder="Chia sẻ trải nghiệm của bạn với HLV này..."
                rows={6}
                className="resize-none"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>

            {/* Removed: Would you book this coach again? section */}

            {/* Nút hành động */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewRating(0);
                  setHoveredRating(0);
                }}
                className="flex-1 hover:bg-muted bg-transparent"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      </PageWrapper>
    </>
  );
}
