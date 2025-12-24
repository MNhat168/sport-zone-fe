"use client";
import { useParams, useNavigate } from "react-router-dom";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { User, Users } from "lucide-react";
import L from "leaflet";
import { getCoachById, clearCurrentCoach } from "@/features/coach";
import { setFavouriteCoaches, removeFavouriteCoaches, getUserProfile } from "@/features/user";
import { createCoachReviewThunk } from "@/features/reviews/reviewThunk";
import { getReviewsForCoachAPI } from "@/features/reviews/reviewAPI";
import {
  CustomFailedToast,
  CustomSuccessToast,
} from "@/components/toast/notificiation-toast";
import type { RootState, AppDispatch } from "@/store/store";
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component";
import { PageWrapper } from "@/components/layouts/page-wrapper";

// Import components
import { CoachInfoCard } from "./components/CoachInfoCard";
import { CoachTabs } from "./components/CoachTabs";
import { BioSection } from "./components/BioSection";
import { LessonsSection } from "./components/LessonsSection";
import { CoachingSection } from "./components/CoachingSection";
import { GallerySection } from "./components/GallerySection";
import { ReviewsSection } from "./components/ReviewsSection";
import { LocationSection } from "./components/LocationSection";
import { BookingCard } from "./components/BookingCard";
import { RequestFormCard } from "./components/RequestFormCard";
import { SimilarCoachesSection } from "./components/SimilarCoachesSection";
import { LessonDetailModal } from "./components/LessonDetailModal";
import { ReviewModal } from "./components/ReviewModal";

interface LessonType {
  id: string;
  type: "single" | "pair" | "group";
  name: string;
  description: string;
  icon: typeof User;
  iconBg: string;
  iconColor: string;
  badge: string;
  lessonPrice?: number | string;
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
    lessonPrice: 200000,
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
    lessonPrice: 120000,
  },
];

interface CoachDetailPageProps {
  coachId?: string;
}

export default function CoachDetailPage({ coachId }: CoachDetailPageProps) {
  const params = useParams();
  const navigate = useNavigate();
  const effectiveCoachId = coachId ?? params.id;
  const dispatch = useDispatch<AppDispatch>();
  const { currentCoach, detailLoading, detailError } = useSelector(
    (state: RootState) => state.coach
  );
  const authUser = useSelector((state: RootState) => state.auth.user);

  const [favLoading, setFavLoading] = useState(false);

  const favouriteCoachIds: string[] = Array.isArray(authUser?.favouriteCoaches)
    ? authUser!.favouriteCoaches.map((c: any) => (typeof c === 'string' ? c : (c._id || c.id || String(c))))
    : [];

  const isFavourite = Boolean(effectiveCoachId && favouriteCoachIds.includes(effectiveCoachId as string));

  const toggleFavourite = async () => {
    if (!authUser) {
      return CustomFailedToast("Vui lòng đăng nhập để thêm huấn luyện viên vào yêu thích");
    }
    if (!effectiveCoachId) return;

    try {
      setFavLoading(true);
      if (isFavourite) {
        const payload = { favouriteCoaches: [effectiveCoachId as string] };
        console.log('Removing favourite coaches payload:', payload);
        const action: any = await dispatch(removeFavouriteCoaches(payload));
        console.log('removeFavouriteCoaches action:', action);
        if (action?.meta?.requestStatus === "fulfilled") {
          CustomSuccessToast("Đã bỏ yêu thích");
        } else {
          const pl = action?.payload;
          const message = typeof pl === 'string' ? pl : pl?.message ?? (pl ? JSON.stringify(pl) : "Bỏ yêu thích thất bại");
          console.error('Remove favourite failed:', pl || action?.error);
          CustomFailedToast(message);
        }
      } else {
        const payload = { favouriteCoaches: [effectiveCoachId as string] };
        console.log('Setting favourite coaches payload:', payload);
        const action: any = await dispatch(setFavouriteCoaches(payload));
        console.log('setFavouriteCoaches action:', action);
        if (action?.meta?.requestStatus === "fulfilled") {
          CustomSuccessToast("Đã thêm vào yêu thích");
        } else {
          const pl = action?.payload;
          const message = typeof pl === 'string' ? pl : pl?.message ?? (pl ? JSON.stringify(pl) : "Thêm yêu thích thất bại");
          console.error('Set favourite failed:', pl || action?.error);
          CustomFailedToast(message);
        }
      }
    } catch (err: any) {
      CustomFailedToast(err?.message || "Thao tác thất bại");
    } finally {
      setFavLoading(false);
        try {
          // refresh profile to sync favouriteCoaches state with server
          dispatch(getUserProfile());
        } catch (e) {
          // ignore
        }
    }
  };

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
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  // Leaflet map refs for location section
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const currentCoachRef = useRef(currentCoach);

  // Keep ref in sync with currentCoach
  useEffect(() => {
    currentCoachRef.current = currentCoach;
  }, [currentCoach]);

  const filteredReviews = useMemo(() => {
    const base = Array.isArray(coachReviews) ? coachReviews : [];
    if (!selectedRatingFilter) return base;
    return base.filter((rv) => Math.round(Number(rv.rating || 0)) === selectedRatingFilter);
  }, [coachReviews, selectedRatingFilter]);

  // Booking states (removed - no longer needed)

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
        lessonPrice: (lesson as any).lessonPrice ?? (lesson as any).price ?? undefined,
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

  // Ensure auth profile (favouriteCoaches) is fresh on page load so the favorite
  // button correctly reflects server state. Only refresh when favourites are
  // missing or don't include the current coach id.
  useEffect(() => {
    if (!effectiveCoachId) return;
    const needRefresh = !currentUser || !Array.isArray(currentUser.favouriteCoaches) || !currentUser.favouriteCoaches.includes(effectiveCoachId as string);
    if (needRefresh) {
      dispatch(getUserProfile());
    }
  }, [dispatch, effectiveCoachId, authUser]);

  const handleBookNow = () => {
    if (!effectiveCoachId) {
      CustomFailedToast('Không tìm thấy thông tin huấn luyện viên');
      return;
    }
    // Navigate to booking flow
    navigate(`/coaches/${effectiveCoachId}/booking`);
  };

  // Fetch reviews for this coach (paginated) and set up auto-refresh (polling)
  const fetchReviews = useCallback(
    async (page = 1, append = false) => {
      if (!effectiveCoachId) return;
      try {
        setReviewsLoading(true);
        console.log('fetchReviews called', { effectiveCoachId, page, limit: REVIEW_PAGE_LIMIT });
        const resp = await getReviewsForCoachAPI(effectiveCoachId, page, REVIEW_PAGE_LIMIT);
        console.log('fetchReviews response', { effectiveCoachId, page, resp });

        // Normalize possible API shapes:
        // 1) { data: [...], pagination: { ... } }
        // 2) { success: true, data: { data: [...], pagination: { ... } } }
        // 3) direct array (unlikely)
        let body: any = resp;
        if (resp && typeof resp === 'object' && 'success' in resp && 'data' in resp) {
          body = resp.data;
        }

        const items = Array.isArray(body?.data)
          ? body.data
          : Array.isArray(body)
          ? body
          : [];

        const pageFromResp = body?.pagination?.page ?? resp?.pagination?.page ?? page;
        const totalPagesFromResp = body?.pagination?.totalPages ?? resp?.pagination?.totalPages ?? 1;

        console.log('fetchReviews normalized', { itemsLength: items.length, pageFromResp, totalPagesFromResp });

        if (append) setCoachReviews((prev) => [...prev, ...items]);
        else setCoachReviews(items);

        setReviewsPage(pageFromResp ?? page);
        setReviewsTotalPages(totalPagesFromResp ?? 1);
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
      // Cleanup map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [dispatch]);

  // Map initialization and updates are now handled in LocationSection component

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
            {/* Overlay solid thay vì gradient để giảm rối mắt */}
            <div className="absolute inset-0 bg-[#0b1020]/80" />
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 lg:px-8 -mt-48 relative z-20 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Coach Info Card and Content Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Coach Information Card */}
              <CoachInfoCard
                coachData={coachData}
                coachReviews={coachReviews}
                isFavourite={isFavourite}
                favLoading={favLoading}
                onToggleFavourite={toggleFavourite}
              />

              {/* Navigation Tabs */}
              <CoachTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabClick={scrollToSection}
              />

              {/* Content Sections */}
              <div className="space-y-6">
                <BioSection coachData={coachData} />

                <LessonsSection
                  lessonTypes={lessonTypes}
                  onLessonClick={setSelectedLesson}
                />

                {/* <CoachingSection /> */}

                <GallerySection
                  images={galleryImages}
                  currentIndex={currentGalleryIndex}
                  onNext={nextGallerySlide}
                  onPrev={prevGallerySlide}
                />

                <ReviewsSection
                  coachData={coachData}
                  coachReviews={coachReviews}
                  filteredReviews={filteredReviews}
                  reviewsLoading={reviewsLoading}
                  reviewsPage={reviewsPage}
                  reviewsTotalPages={reviewsTotalPages}
                  selectedRatingFilter={selectedRatingFilter}
                  onFilterChange={setSelectedRatingFilter}
                  onLoadMore={async () => {
                    if (reviewsLoading) return;
                    if (reviewsPage >= reviewsTotalPages) return;
                    await fetchReviews(reviewsPage + 1, true);
                  }}
                  onWriteReview={() => setShowReviewModal(true)}
                />

                <LocationSection
                  coachData={coachData}
                  currentCoach={currentCoach}
                  mapContainerRef={mapContainerRef}
                  mapRef={mapRef}
                  markerRef={markerRef}
                />
              </div>
            </div>

            {/* Right Column - Booking and Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6 animate-slide-in-right">
                <BookingCard
                  coachData={coachData}
                  onBookNow={handleBookNow}
                />

                <RequestFormCard
                  showForm={showRequestForm}
                  onToggleForm={() => setShowRequestForm(!showRequestForm)}
                />
              </div>
            </div>
          </div>
        </div>

        <SimilarCoachesSection coaches={similarCoaches} />

        {/* Modals */}
        <LessonDetailModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />

        <ReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          coachName={coachData?.name || "HLV này"}
          reviewRating={reviewRating}
          hoveredRating={hoveredRating}
          reviewComment={reviewComment}
          isSubmitting={isSubmittingReview}
          onRatingChange={setReviewRating}
          onHoveredRatingChange={setHoveredRating}
          onCommentChange={setReviewComment}
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
          onCancel={() => {
            setShowReviewModal(false);
            setReviewRating(0);
            setHoveredRating(0);
          }}
        />
      </PageWrapper>
    </>
  );
}
