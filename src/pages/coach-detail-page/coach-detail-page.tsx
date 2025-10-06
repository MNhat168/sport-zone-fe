"use client";

import { useState, useEffect } from "react";
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
  ChevronUp,
} from "lucide-react";

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

const lessonTypes: LessonType[] = [
  {
    id: "1",
    type: "single",
    name: "English Lesson",
    description:
      "One-on-one personalized coaching session tailored to your specific needs and skill level. Get undivided attention from the coach to work on technique, strategy, and game improvement. Perfect for players who want intensive, focused training to rapidly improve their skills.",
    icon: User,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "1-on-1",
  },
  {
    id: "2",
    type: "group",
    name: "Small Group Lesson",
    description:
      "Train with 2-4 players in a collaborative and supportive environment. Learn from both the coach and your peers while developing teamwork and competitive skills. Ideal for players who enjoy social learning and want to practice match scenarios with others at similar skill levels.",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "2-4 people",
  },
];

export default function CoachDetailPage() {
  const [activeTab, setActiveTab] = useState("bio");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

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
    { id: "bio", label: "Short Bio" },
    { id: "lessons", label: "Lesson With Me" },
    { id: "coaching", label: "Coaching" },
    { id: "gallery", label: "Gallery" },
    { id: "reviews", label: "Reviews" },
    { id: "location", label: "Location" },
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

  const reviews = [
    {
      name: "Amanda Rosales",
      date: "09/26/2023",
      rating: 5,
      title: "Absolutely Perfect!",
      content:
        "Amazing facility. It is a perfect place for friendly match with your friends or a competitive match. It is the best place.",
      images: [
        "/badminton-court-1.jpg",
        "/badminton-court-2.jpg",
        "/badminton-court-3.jpg",
        "/badminton-court-4.jpg",
        "/badminton-court-5.jpg",
      ],
      helpful: 12,
    },
    {
      name: "Michael Chen",
      date: "09/18/2023",
      rating: 5,
      title: "Awesome. Its very convenient to play.",
      content:
        "Amazing facility. It is a perfect place for friendly match with your friends or a competitive match. Excellent coaching and atmosphere. Highly recommended for an exceptional playing experience.",
      helpful: 8,
    },
  ];

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

  return (
    <div className="min-h-screen bg-background">
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
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Coach Avatar */}
                  <div className="relative group flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
                    <Avatar className="relative h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src="/professional-coach-portrait.png"
                        alt="Kevin Anderson"
                      />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                        KA
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Coach Info */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold text-balance">
                          Kevin Anderson
                        </h1>
                        <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        </Badge>
                        <Button
                          size="sm"
                          className="ml-auto bg-yellow-500 hover:bg-yellow-600 text-white border-0 flex items-center gap-2"
                        >
                          <Heart className="h-4 w-4" />
                          Favourite
                        </Button>
                      </div>
                      <p className="text-base text-muted-foreground text-left">
                        Coach Kevin provides Badminton lessons in Santa Monica
                        at Penmar Park
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 p-1.5 rounded">
                          <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        </div>
                        <span className="font-semibold">4.8</span>
                        <span className="text-muted-foreground">
                          300 Reviews
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Santamonica, United States</span>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Rank : Expert</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Sessions Completed : 25</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>With Dreamsports Since Apr 5, 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Tabs Bar - Separate Component */}
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

            {/* Content Sections */}
            <div className="space-y-6">
              {/* Short Bio Section */}
              <Card
                id="bio"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Short Bio</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground text-left">
                      Name: Kevin Anderson
                    </p>
                    <p className="text-left">
                      Experience: 10 years of experience coaching badminton at
                      various skill levels.
                    </p>
                  </div>
                  <Button
                    variant="link"
                    className="text-green-600 hover:text-green-700 p-0 h-auto"
                  >
                    Show More
                  </Button>
                </CardContent>
              </Card>

              {/* Lesson With Me Section */}
              <Card
                id="lessons"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">
                    Lesson With Me
                  </CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed text-left">
                    Get the most personalized coaching tailored to your needs.
                    Choose from individual 1-on-1 or group lessons for a more
                    collaborative and supportive atmosphere. Brighten your
                    skills and unleash the process of getting better.
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

              {/* Coaching Section */}
              <Card
                id="coaching"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Coaching</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed text-left">
                    Experience personalized coaching tailored to your needs.
                    Whether individual 1-on-1 or small group sessions, unlock
                    your potential with personalized instruction for success.
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300">
                      <h4 className="font-semibold mb-2 text-left">
                        Technical Skills Development
                      </h4>
                      <p className="text-sm text-muted-foreground text-left">
                        Master fundamental techniques including footwork, stroke
                        mechanics, and court positioning.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300">
                      <h4 className="font-semibold mb-2 text-left">
                        Tactical Training
                      </h4>
                      <p className="text-sm text-muted-foreground text-left">
                        Learn game strategies, shot selection, and how to read
                        opponents to gain competitive advantage.
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors duration-300">
                      <h4 className="font-semibold mb-2 text-left">
                        Mental Conditioning
                      </h4>
                      <p className="text-sm text-muted-foreground text-left">
                        Build confidence, focus, and resilience to perform under
                        pressure and overcome challenges.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery Section */}
              <Card
                id="gallery"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Gallery</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="relative px-12">
                    {/* Left Arrow */}
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={prevGallerySlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white hover:bg-gray-100 shadow-lg h-10 w-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    {/* Images Container */}
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

                    {/* Right Arrow */}
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

              {/* Reviews Section */}
              <Card
                id="reviews"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Reviews</CardTitle>
                    <Button
                      onClick={() => setShowReviewModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Write a review
                    </Button>
                  </div>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="grid md:grid-cols-[auto_1fr] gap-8 items-center">
                      {/* Left side - Overall Rating */}
                      <div className="flex flex-col items-center justify-center space-y-2 min-w-[180px]">
                        <div className="text-6xl font-bold text-foreground">
                          4.8
                        </div>
                        <div className="text-sm text-muted-foreground">
                          out of 5.0
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

                      {/* Right side - Quality Metrics */}
                      <div className="space-y-1">
                        <p className="text-sm font-semibold mb-3 text-left">
                          Recommended by 97% of Players
                        </p>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                          {[
                            { label: "Quality of service", value: 100 },
                            { label: "Quality of service", value: 100 },
                            { label: "Quality of service", value: 100 },
                            { label: "Quality of service", value: 100 },
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
                    {/* Review 1 - Positive */}
                    <Card className="shadow-md hover:shadow-lg transition-all duration-300 border border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              AR
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold">
                                  Amanda Booked on 06/04/2023
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-semibold">
                                    5.0
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Booking indicator */}
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">
                                Yes, I would book again.
                              </span>
                            </div>

                            <div>
                              <h5 className="font-bold text-base mb-2 text-left">
                                Absolutely Perfect!
                              </h5>
                              <p className="text-muted-foreground leading-relaxed text-left">
                                If you are looking for a perfect place for
                                friendly matches with your friends or a
                                competitive match, it is the best place.
                              </p>
                            </div>

                            {/* Quote/testimonial box */}
                            <div className="bg-muted/50 border-l-4 border-muted-foreground/30 p-4 rounded-r-lg">
                              <p className="text-sm text-muted-foreground italic leading-relaxed text-left">
                                Experience badminton excellence at Badminton
                                Academy. Top-notch facilities, well-maintained
                                courts, and a friendly atmosphere. Highly
                                recommended for an exceptional playing
                                experience.
                              </p>
                            </div>

                            <div className="text-xs text-muted-foreground text-left">
                              Sent on 11/05/2023
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Review 2 - Negative */}
                    <Card className="shadow-md hover:shadow-lg transition-all duration-300 border border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                              AR
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold">
                                  Amanda Booked on 06/04/2023
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm font-semibold">
                                    5.0
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Booking indicator - Negative */}
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-red-600 font-bold text-lg">
                                ✕
                              </span>
                              <span className="text-red-600 font-medium">
                                No, I don't want to book again.
                              </span>
                            </div>

                            <div>
                              <h5 className="font-bold text-base mb-2 text-left">
                                Awesome. Its very convenient to play.
                              </h5>
                              <p className="text-muted-foreground leading-relaxed text-left">
                                If you are looking for a perfect place for
                                friendly matches with your friends or a
                                competitive match, it is the best place.
                              </p>
                            </div>

                            {/* Quote/testimonial box */}
                            <div className="bg-muted/50 border-l-4 border-muted-foreground/30 p-4 rounded-r-lg">
                              <p className="text-sm text-muted-foreground italic leading-relaxed text-left">
                                Experience badminton excellence at Badminton
                                Academy. Top-notch facilities, well-maintained
                                courts, and a friendly atmosphere. Highly
                                recommended for an exceptional playing
                                experience.
                              </p>
                            </div>

                            <div className="text-xs text-muted-foreground text-left">
                              Sent on 09/18/2023
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full hover:bg-muted bg-transparent"
                  >
                    Load More
                  </Button>
                </CardContent>
              </Card>

              {/* Location Section */}
              <Card
                id="location"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Location</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-green-50 hover:border-green-500 bg-transparent"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
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
                      <h4 className="font-semibold text-green-900 text-left">
                        Our Tennis Location
                      </h4>
                      <p className="text-sm text-green-700 mt-1">
                        123 Premier Street, New York, NY 10012
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Booking Card and Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 animate-slide-in-right">
              {/* Book A Coach Card */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="space-y-4 pb-6">
                  <CardTitle className="text-2xl font-bold text-left">
                    Book A Coach
                  </CardTitle>
                  <hr className="my-2 border-gray-200" />

                  <p className="text-base text-muted-foreground text-left">
                    <span className="font-semibold text-foreground">
                      Kevin Anderson
                    </span>{" "}
                    Available Now
                  </p>

                  <div className="text-center py-6 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Start's From
                    </p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-green-600">
                        $250
                      </span>
                      <span className="text-lg text-muted-foreground">/hr</span>
                    </div>
                  </div>

                  <Button className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white h-14 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Now
                  </Button>
                </CardHeader>
              </Card>

              {/* Next Availability */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                    Next Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { day: "Thu, Sept 24", time: "3 PM" },
                      { day: "Fri, Sept 25", time: "4 PM" },
                      { day: "Sat, Sept 26", time: "2 PM" },
                      { day: "Sun, Sept 27", time: "11 AM" },
                    ].map((slot, index) => (
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

              {/* Request Availability */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-left">
                    Request for Availability
                  </CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showRequestForm ? (
                    <Button
                      variant="outline"
                      className="w-full hover:bg-green-50 hover:border-green-500 transition-all duration-300 bg-transparent"
                      onClick={() => setShowRequestForm(true)}
                    >
                      Show Request Form
                    </Button>
                  ) : (
                    <form className="space-y-4 animate-fade-in">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Enter Name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter Email Address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter Phone Number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Select City</Label>
                        <Select>
                          <SelectTrigger id="city">
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ny">New York</SelectItem>
                            <SelectItem value="la">Los Angeles</SelectItem>
                            <SelectItem value="chicago">Chicago</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="details">Details</Label>
                        <Textarea
                          id="details"
                          placeholder="Enter Comments"
                          rows={3}
                        />
                      </div>
                      <div className="flex items-start gap-2">
                        <input type="checkbox" id="terms" className="mt-1" />
                        <Label
                          htmlFor="terms"
                          className="text-xs text-muted-foreground cursor-pointer"
                        >
                          By clicking "Send Request" I agree to Dreamcoach's
                          Terms of Service
                        </Label>
                      </div>
                      <Button className="w-full bg-[#1a2332] hover:bg-[#1a2332]/90 text-white h-11 font-semibold hover:scale-[1.02] transition-transform duration-300">
                        Send Request
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Listing By Owner */}
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-left">
                    Listing By Owner
                  </CardTitle>
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

      {/* Similar Coaches Section */}
      <div className="bg-muted/30 py-16 mt-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Similar Coaches</h2>
            <Button variant="outline" className="hover:bg-white bg-transparent">
              View All Coaches
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

                  {/* Price badge at bottom */}
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-[#1a2332] hover:bg-[#1a2332]/90 text-white border-0 px-3 py-1.5 text-sm font-semibold">
                      From ${coach.price}/hr
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

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 font-semibold"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button className="flex-1 bg-[#1a2332] hover:bg-[#1a2332]/90 text-white font-semibold">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </CardContent>

                {/* Card Footer */}
                <CardFooter className="flex items-center justify-between border-t pt-4 pb-4 px-6 bg-muted/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Next Availabilty
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
                      {coach.reviews} Reviews
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Details Modal */}
      <Dialog
        open={!!selectedLesson}
        onOpenChange={() => setSelectedLesson(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedLesson?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Lesson details and information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Lesson Type */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Lesson Type
              </Label>
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
                      <p className="text-sm text-muted-foreground mt-1 capitalize">
                        {selectedLesson.type} Session
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Lesson Name */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Name
              </Label>
              <p className="text-lg font-semibold">{selectedLesson?.name}</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Description
              </Label>
              <p className="text-muted-foreground leading-relaxed">
                {selectedLesson?.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setSelectedLesson(null)}
                className="flex-1 hover:bg-muted bg-transparent"
              >
                Close
              </Button>
              <Button className="flex-1 bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Book This Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Write a Review
            </DialogTitle>
            <DialogDescription>
              Share your experience with Kevin Anderson
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6 py-4">
            {/* Review Type */}
            <div className="space-y-2">
              <Label htmlFor="review-type" className="text-sm font-semibold">
                Review Type
              </Label>
              <Select>
                <SelectTrigger id="review-type">
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson-quality">Lesson Quality</SelectItem>
                  <SelectItem value="coaching-style">Coaching Style</SelectItem>
                  <SelectItem value="facility">Facility & Equipment</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="value">Value for Money</SelectItem>
                  <SelectItem value="overall">Overall Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Rating</Label>
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

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="review-comment" className="text-sm font-semibold">
                Comment
              </Label>
              <Textarea
                id="review-comment"
                placeholder="Share your experience with this coach..."
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Would you book again? */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Would you book this coach again?
              </Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 hover:bg-green-50 hover:border-green-500 bg-transparent"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  Yes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 hover:bg-red-50 hover:border-red-500 bg-transparent"
                >
                  <span className="text-red-600 font-bold mr-2">✕</span>
                  No
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
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
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
