import { useParams } from "react-router-dom";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Search,
  //   ChevronUp,
} from "lucide-react";
import { getCoachIdByUserId, clearCurrentCoach } from "@/features/coach";
import { CustomSuccessToast } from "@/components/toast/notificiation-toast";
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

// Constants for map
const DEFAULT_CENTER: [number, number] = [10.776889, 106.700806]; // Ho Chi Minh City
const MAP_CONFIG = {
  zoom: 13,
  maxZoom: 19,
  flyToZoom: 14,
  flyToDuration: 1.2,
  flyToEaseLinearity: 0.25
};

const TILE_LAYER_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// Utility functions for geocoding
interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

const parseLatLngFromString = (input: string): [number, number] | null => {
  const latLngMatch = input.match(/(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (!latLngMatch) return null;
  
  const lat = parseFloat(latLngMatch[1]);
  const lng = parseFloat(latLngMatch[2]);
  
  return (!Number.isNaN(lat) && !Number.isNaN(lng)) ? [lat, lng] : null;
};

const buildSearchCandidates = (input: string): string[] => {
  const postalRegex = /\b\d{5,6}\b/g;
  const withoutPostal = input.replace(postalRegex, '').trim();
  
  const baseVariants = [input, withoutPostal].filter(Boolean);
  const withCountry = baseVariants.flatMap(v => [v, `${v}, Việt Nam`, `${v}, Vietnam`]);
  
  return Array.from(new Set(withCountry));
};

const searchLocation = async (query: string): Promise<GeocodingResult | null> => {
  const candidates = buildSearchCandidates(query);
  
  for (const candidate of candidates) {
    try {
      const url = `${NOMINATIM_BASE_URL}?format=jsonv2&limit=5&addressdetails=1&countrycodes=vn&q=${encodeURIComponent(candidate)}`;
      const response = await fetch(url, { 
        headers: { 'Accept': 'application/json' } 
      });
      
      if (!response.ok) continue;
      
      const data: Array<{ lat: string; lon: string; display_name: string; importance?: number }> = 
        await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const best = data.slice().sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
        const lat = parseFloat(best.lat);
        const lon = parseFloat(best.lon);
        
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          return { lat, lon, display_name: best.display_name };
        }
      }
    } catch (error) {
      console.warn(`Failed to search for: ${candidate}`, error);
      continue;
    }
  }
  
  return null;
};

const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name ?? null;
  } catch {
    return null;
  }
};

export default function CoachSelfDetailPage() {
  const params = useParams();
  const initialCoachId = params.id ?? null;
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentCoach, detailLoading, detailError,
    resolveCoachIdLoading, resolveCoachIdError,
    resolvedCoachRaw,
  } = useSelector((state: RootState) => state.coach);
  const [activeTab, setActiveTab] = useState("bio");
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);

  // Edit mode and editable fields (UI only)
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCoachActive, setIsCoachActive] = useState(true);
  const [editablePrice, setEditablePrice] = useState<number | "-">("-");
  const [editableSummary, setEditableSummary] = useState<string>("");
  const [editableCoachingSummary, setEditableCoachingSummary] = useState<string>("");
  const [editableLocation, setEditableLocation] = useState<string>("");
  const [locationCoordinates, setLocationCoordinates] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

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

  // Resolve coachId: prefer param, else thunk resolve by userId
  useEffect(() => {
    if (initialCoachId) return;
    // lấy userId từ cookie/session
    let userId: string | null = null;
    try {
      const cookieUserStr = document.cookie.match(/user=([^;]+)/)?.[1];
      const storageUserStr = sessionStorage.getItem("user");
      const raw = cookieUserStr ? decodeURIComponent(cookieUserStr) : storageUserStr;
      if (raw) {
        const user = JSON.parse(raw);
        if (typeof user?._id === "string") userId = user._id;
        else if (user?._id?.buffer) {
          const arr = Object.values(user._id.buffer) as number[];
          userId = arr.map((b) => b.toString(16).padStart(2, "0")).join("");
        } else if (user?.id) userId = String(user.id);
      }
    } catch {
      // ignore parse errors
    }
    if (userId) {
      dispatch(getCoachIdByUserId(userId));
    }
  }, [initialCoachId, dispatch]);




  // Cleanup coach data when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearCurrentCoach());
    };
  }, [dispatch]);

  // Initialize UI-only fields when data changes (must be before any early returns)
  useEffect(() => {
    const priceNum = typeof currentCoach?.price === "number"
      ? currentCoach.price
      : typeof resolvedCoachRaw?.hourlyRate === "number"
        ? resolvedCoachRaw.hourlyRate
        : undefined;
    setIsCoachActive(true);
    setEditablePrice(typeof priceNum === "number" ? priceNum : "-");
    // Initialize editable short bio summary
    const summary = (currentCoach?.description || resolvedCoachRaw?.bio || "").trim();
    setEditableSummary(summary);
    // Initialize editable location
    const location = (currentCoach?.location || resolvedCoachRaw?.location || "").trim();
    setEditableLocation(location);
  }, [currentCoach, resolvedCoachRaw]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "bio",
        "lessons",
        "coaching",
        "gallery",
        "location",
      ];
      // If near the very top, force 'bio'
      if (window.scrollY < 50) {
        setActiveTab("bio");
        return;
      }
      const scrollPosition = window.scrollY + 120;

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

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Small delay to ensure container is properly rendered
    const initTimeout = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: MAP_CONFIG.zoom,
      });

      L.tileLayer(TILE_LAYER_URL, {
        attribution: '© OpenStreetMap contributors',
        maxZoom: MAP_CONFIG.maxZoom,
      }).addTo(map);

      const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map);

      markerRef.current = marker;
      mapRef.current = map;

      // Invalidate size to ensure map renders correctly
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, 100);

    return () => {
      clearTimeout(initTimeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Invalidate map size when edit mode changes or component mounts
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 100);
    }
  }, [isEditMode]);

  // Update marker and map interactions based on edit mode
  useEffect(() => {
    if (!markerRef.current || !mapRef.current) return;

    if (isEditMode) {
      // Enable drag for edit mode
      if (markerRef.current.dragging) {
        markerRef.current.dragging.enable();
      }
      
      const handleDragEnd = () => {
        const pos = markerRef.current!.getLatLng();
        setLocationCoordinates([pos.lat, pos.lng]);
        (async () => {
          const addr = await reverseGeocode(pos.lat, pos.lng);
          if (addr) {
            setEditableLocation(addr);
          }
        })();
      };

      markerRef.current.on('dragend', handleDragEnd);

      // Enable click to set location in edit mode
      const handleMapClick = async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (!markerRef.current) return;

        markerRef.current.setLatLng([lat, lng]);
        setLocationCoordinates([lat, lng]);
        const addr = await reverseGeocode(lat, lng);
        if (addr) {
          setEditableLocation(addr);
        }
      };

      mapRef.current.on('click', handleMapClick);
      
      return () => {
        markerRef.current?.off('dragend', handleDragEnd);
        mapRef.current?.off('click', handleMapClick);
        markerRef.current?.dragging?.disable();
      };
    } else {
      // Disable interactions in view mode
      if (markerRef.current.dragging) {
        markerRef.current.dragging.disable();
      }
      mapRef.current.off('click');
    }
  }, [isEditMode]);

  // Auto-search location when editableLocation is set from coachData but no coordinates
  useEffect(() => {
    // Only search if we have location text but no coordinates, and map is initialized
    if (!editableLocation.trim() || locationCoordinates || !mapRef.current || !markerRef.current) return;
    
    // Small delay to avoid too many requests
    const timeoutId = setTimeout(async () => {
      try {
        const result = await searchLocation(editableLocation);
        if (result && mapRef.current && markerRef.current) {
          setLocationCoordinates([result.lat, result.lon]);
          markerRef.current.setLatLng([result.lat, result.lon]);
          mapRef.current.flyTo([result.lat, result.lon], MAP_CONFIG.flyToZoom, {
            duration: MAP_CONFIG.flyToDuration,
            easeLinearity: MAP_CONFIG.flyToEaseLinearity,
          });
        }
      } catch (error) {
        console.warn('Auto-search location failed:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableLocation]);

  // Update map position helper
  const updateMapPosition = useCallback((lat: number, lng: number, address: string) => {
    if (!mapRef.current || !markerRef.current) return;

    setLocationCoordinates([lat, lng]);
    setEditableLocation(address);
    markerRef.current.setLatLng([lat, lng]);
    // Update draggable state based on edit mode
    if (markerRef.current.dragging) {
      if (isEditMode) {
        markerRef.current.dragging.enable();
      } else {
        markerRef.current.dragging.disable();
      }
    }
    mapRef.current.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), MAP_CONFIG.flyToZoom), {
      duration: MAP_CONFIG.flyToDuration,
      easeLinearity: MAP_CONFIG.flyToEaseLinearity,
    });
  }, [isEditMode]);

  // Handle search location
  const handleSearchLocation = useCallback(async () => {
    const query = editableLocation.trim();
    if (!query || !mapRef.current || !markerRef.current) return;

    setIsSearching(true);
    
    try {
      // Check if input is direct lat,lng coordinates
      const coordinates = parseLatLngFromString(query);
      if (coordinates) {
        const [lat, lng] = coordinates;
        updateMapPosition(lat, lng, query);
        setIsSearching(false);
        return;
      }

      // Search using geocoding service
      const result = await searchLocation(query);
      
      if (result) {
        updateMapPosition(result.lat, result.lon, result.display_name);
      } else {
        CustomSuccessToast("Không tìm thấy địa điểm phù hợp");
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      CustomSuccessToast("Có lỗi xảy ra khi tìm kiếm địa điểm");
    } finally {
      setIsSearching(false);
    }
  }, [editableLocation, updateMapPosition]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Update active tab immediately to reflect the user's choice
      setActiveTab(sectionId);
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;
      const startY = window.pageYOffset;
      const distance = offsetPosition - startY;
      const duration = 900; // ms
      let startTime: number | null = null;

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + distance * eased);
        if (elapsed < duration) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
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

  //   const reviews = [ (removed)
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

  // Removed similar coaches data (section deprecated)

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
            onClick={() => {
              let uid = "";
              try {
                const cookieUserStr = document.cookie.match(/user=([^;]+)/)?.[1];
                const storageUserStr = sessionStorage.getItem("user");
                const raw = cookieUserStr ? decodeURIComponent(cookieUserStr) : storageUserStr;
                if (raw) {
                  const user = JSON.parse(raw);
                  if (typeof user?._id === "string") uid = user._id;
                  else if (user?._id?.buffer) {
                    const arr = Object.values(user._id.buffer) as number[];
                    uid = arr.map((b) => b.toString(16).padStart(2, "0")).join("");
                  } else if (user?.id) uid = String(user.id);
                }
              } catch {
                // ignore parse errors
              }
              if (uid) dispatch(getCoachIdByUserId(uid));
            }}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Hiển thị đang lấy coachId
  if (resolveCoachIdLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          Đang tìm mã HLV của bạn...
        </div>
      </div>
    );
  }

  // Hiển thị lỗi khi resolve coachId fail
  if (resolveCoachIdError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Không tìm thấy thông tin huấn luyện viên: {resolveCoachIdError.message}
          </p>
        </div>
      </div>
    );
  }

  // Ưu tiên dữ liệu CoachDetail nếu đã có; nếu không, map từ resolvedCoachRaw (CoachProfile)
  const coachData = currentCoach || (resolvedCoachRaw ? {
    id: resolvedCoachRaw._id || "",
    name: resolvedCoachRaw.user?.fullName || "",
    profileImage: "",
    avatar: resolvedCoachRaw.user?.avatarUrl || "",
    description: resolvedCoachRaw.bio || "",
    rating: Number(resolvedCoachRaw.rating ?? 0),
    reviewCount: Number(resolvedCoachRaw.totalReviews ?? 0),
    location: resolvedCoachRaw.location || "",
    level: resolvedCoachRaw.rank || "",
    completedSessions: Number(resolvedCoachRaw.completedSessions ?? 0),
    createdAt: resolvedCoachRaw.createdAt || "",
    memberSince: resolvedCoachRaw.createdAt || "",
    availableSlots: [],
    lessonTypes: [],
    price: Number(resolvedCoachRaw.hourlyRate ?? 0),
    coachingDetails: {
      experience: resolvedCoachRaw.experience || "",
      certification: resolvedCoachRaw.certification || "",
    },
  } : null);


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
                      {isCoachActive && (
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
                      )}
                      <Avatar className="relative h-24 w-24 border-4 border-white shadow-lg">
                        <AvatarImage
                          src={coachData.avatar || coachData.profileImage || "/professional-coach-portrait.png"}
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
                          <div className="ml-auto flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground">Chế độ chỉnh sửa</Label>
                            <Switch
                              checked={isEditMode}
                              onCheckedChange={setIsEditMode}
                              className="ring-2 ring-offset-2 ring-green-500 border border-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded-full data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-green-600"
                            />
                            {isEditMode && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  console.log("Saving changes:", {
                                    summary: editableSummary,
                                    coachingSummary: editableCoachingSummary,
                                    location: editableLocation,
                                    coordinates: locationCoordinates,
                                    price: editablePrice,
                                    isActive: isCoachActive,
                                  });
                                  CustomSuccessToast("Đã lưu thay đổi (UI) — sẽ gọi API sau");
                                }}
                              >
                                Lưu
                              </Button>
                            )}
                          </div>
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
              <div className="flex flex-wrap gap-2 items-center">
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
                id="summary"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Giới thiệu ngắn</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className=" text-muted-foreground leading-relaxed">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <Textarea rows={5} value={editableSummary} onChange={(e) => setEditableSummary(e.target.value)} />
                      </div>
                    ) : (
                      <p className="text-left">{editableSummary || coachData?.description || "-"}</p>
                    )}
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

              {/* Phần: Coaching summary */}
              <Card
                id="coaching"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-xl text-left">Coaching summary</CardTitle>
                  <hr className="my-2 border-gray-200" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className=" text-muted-foreground leading-relaxed">
                    {isEditMode ? (
                      <div className="space-y-1">
                        <Textarea rows={5} value={editableCoachingSummary} onChange={(e) => setEditableCoachingSummary(e.target.value)} />
                      </div>
                    ) : (
                      <p className="text-left">{editableCoachingSummary || "-"}</p>
                    )}
                  </div>
                  <Button
                    variant="link"
                    className="text-green-600 hover:text-green-700 p-0 h-auto"
                  >
                    Xem thêm
                  </Button>
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

              {/* Phần: Vị trí */}
              <Card
                id="location"
                className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
              >
                <CardHeader>
                  <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl">Vị trí</CardTitle>
                    {!isEditMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-green-50 hover:border-green-500 bg-transparent"
                        onClick={() => {
                          if (locationCoordinates) {
                            window.open(`https://www.google.com/maps?q=${locationCoordinates[0]},${locationCoordinates[1]}`, '_blank');
                          } else if (editableLocation) {
                            window.open(`https://www.google.com/maps/search/${encodeURIComponent(editableLocation)}`, '_blank');
                          }
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Chỉ đường
                      </Button>
                    )}
                  </div>
                  <hr className="my-2 border-gray-200 w-full" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditMode && (
                    <div className="space-y-2">
                      <Label>Địa chỉ <span className="text-red-600">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập địa chỉ đầy đủ"
                          value={editableLocation}
                          onChange={(e) => setEditableLocation(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchLocation();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSearchLocation}
                          disabled={!editableLocation.trim() || isSearching}
                          className="px-4"
                        >
                          {isSearching ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {locationCoordinates && (
                        <p className="text-xs text-muted-foreground">
                          Tọa độ: {locationCoordinates[0].toFixed(6)}, {locationCoordinates[1].toFixed(6)}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="h-96 rounded-lg relative overflow-hidden border border-gray-200">
                    <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Cột phải - Đặt lịch và thanh bên */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6 animate-slide-in-right">
              {/*y*/}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="space-y-4 pb-6">
                  <CardTitle className="text-2xl font-bold text-left">Đặt huấn luyện viên</CardTitle>
                  <hr className="my-2 border-gray-200" />

                  {/* Active switch and price editor (UI only) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="text-left">
                          <div className="text-md font-semibold text-foreground">
                          <span className="font-semibold">{coachData?.name ?? "-"}</span>{" "}
                          <span className={isCoachActive ? "text-green-600" : "text-red-600"}>
                            {isCoachActive ? "đang hoạt động" : "tạm ngưng"}
                          </span>
                        </div>
                      </div>
                      <Switch
                        disabled={!isEditMode}
                        checked={isCoachActive}
                        onCheckedChange={setIsCoachActive}
                        className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-green-600"
                      />
                    </div>

                    <div className="bg-muted/30 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Giá từ (VND/giờ)</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xl font-bold text-green-600">₫</span>
                        {isEditMode ? (
                          <Input
                            value={editablePrice === "-" ? "" : (editablePrice as number).toLocaleString("vi-VN")}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, "");
                              setEditablePrice(v === "" ? "-" : Number(v));
                            }}
                            placeholder="0"
                            inputMode="numeric"
                            className="h-10"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-green-600">{editablePrice === "-" ? "-" : (editablePrice as number).toLocaleString("vi-VN")}</span>
                        )}
                        <span className="text-lg text-muted-foreground">/giờ</span>
                      </div>
                    </div>
                  </div>
                  
                </CardHeader>
              </Card>

              {/* Lịch trống tiếp theo */}
              <Card id="next-availability" className="shadow-md hover:shadow-lg transition-shadow duration-300">
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

      {/* Footer chung */}
      <div className="bg-[#1a2332] text-white mt-16">
        <div className="container mx-auto px-4 lg:px-8 py-10 grid gap-6 md:grid-cols-3">
          <div>
            <h4 className="font-semibold mb-2">Dreamcoach</h4>
            <p className="text-sm text-white/70">Kết nối người chơi với huấn luyện viên chất lượng.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Hỗ trợ</h4>
            <p className="text-sm text-white/70">Email: support@dreamcoach.app</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Điều khoản</h4>
            <p className="text-sm text-white/70">Điều khoản dịch vụ · Chính sách bảo mật</p>
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
              <Button className="flex-1 bg-[#1a2332] hover:bg-[#1a2332]/90 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Đặt buổi học này
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </PageWrapper>
    </>
  );
}
