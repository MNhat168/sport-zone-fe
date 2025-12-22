"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, Clock, Users, Settings } from "lucide-react";
const Link = ({ href, children, ...props }: any) => (
  // eslint-disable-next-line jsx-a11y/anchor-is-valid
  <a href={href} {...props}>
    {children}
  </a>
);
import { NavbarComponent } from "@/components/header/navbar-component";
import { FooterComponent } from "@/components/footer/footer-component";

export default function LandingPage() {
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedWeekday, setSelectedWeekday] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const slideImages = [
    "https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757854021/banner-tennis_koajhu.jpg",
    "https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757855604/badminton-banner-with-rackets-shuttlecock-blue-background-with-copy-space_l9libr.jpg",
    "https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757855542/93333608_10047006_jgl1tk.jpg",
  ];

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => {
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    });
  }, []);

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slideImages.length]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedLocation) params.set("name", selectedLocation);
    if (selectedSport && selectedSport !== "all")
      params.set("type", selectedSport);
    if (selectedWeekday && selectedWeekday !== "any")
      params.set("weekday", selectedWeekday);
    const qp = params.toString();
    window.location.href = `/fields${qp ? `?${qp}` : ""}`;
  };

  return (
    <>
      <NavbarComponent />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Slide Images */}
        <div className="absolute inset-0">
          {slideImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ${
                index === currentSlide
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-110"
              }`}
              style={{
                backgroundImage: `url(${image})`,
              }}
            >
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-center text-white">
          <div className="inline-block mb-6 animate-scale-in animation-delay-200">
            <Badge
              className="text-white px-6 py-2 text-lg font-semibold hover:scale-110 transition-transform"
              style={{ backgroundColor: "#00775C" }}
            >
              HỖ TRỢ THỂ THAO
            </Badge>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-fade-in-up animation-delay-400">
            SportZone
          </h1>
          <div className="inline-block animate-scale-in animation-delay-600">
            <Badge
              className="text-black px-6 py-2 text-lg font-semibold hover:scale-110 transition-transform"
              style={{ backgroundColor: "#F2A922" }}
            >
              100% CHUYÊN NGHIỆP
            </Badge>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "bg-white scale-125 w-8"
                  : "bg-white/50 hover:bg-white/75 hover:scale-110"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="search-header"
            data-animate
            className={`text-center mb-6 transition-all duration-700 ${
              isVisible["search-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-text-shimmer">
              Tìm Sân Của Bạn
            </h2>
            <p className="text-gray-600">
              Tìm theo tên sân, loại thể thao, ngày/giờ và địa điểm
            </p>
          </div>

          <div
            id="search-card"
            data-animate
            className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-2xl transition-all duration-500 ${
              isVisible["search-card"]
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="flex flex-col items-center md:col-span-1 transform hover:scale-105 transition-transform">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Tên Sân
                </label>
                <Input
                  className="w-full text-left transition-all focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập tên sân (tùy chọn)"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Thể Loại
                </label>
                <div className="w-full">
                  <Select
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                  >
                    <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-green-500">
                      <SelectValue placeholder="Chọn môn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="football">Bóng đá</SelectItem>
                      <SelectItem value="tennis">Quần vợt</SelectItem>
                      <SelectItem value="badminton">Cầu lông</SelectItem>
                      <SelectItem value="basketball">Bóng rổ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col items-center transform hover:scale-105 transition-transform">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Ngày trong tuần
                </label>
                <div className="w-full">
                  <Select
                    value={selectedWeekday}
                    onValueChange={setSelectedWeekday}
                  >
                    <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-green-500">
                      <SelectValue placeholder="Chọn ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Bất kỳ</SelectItem>
                      <SelectItem value="mon">Thứ 2</SelectItem>
                      <SelectItem value="tue">Thứ 3</SelectItem>
                      <SelectItem value="wed">Thứ 4</SelectItem>
                      <SelectItem value="thu">Thứ 5</SelectItem>
                      <SelectItem value="fri">Thứ 6</SelectItem>
                      <SelectItem value="sat">Thứ 7</SelectItem>
                      <SelectItem value="sun">Chủ nhật</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end md:col-span-1">
                <Button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-green-600 text-white hover:bg-green-700 hover:scale-105 hover:shadow-lg transition-all duration-300"
                >
                  <Search className="mr-2 h-4 w-4" /> Tìm Sân
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="tournament-header"
            data-animate
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible["tournament-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tổ Chức Giải Đấu Của Riêng Bạn
            </h2>
            <p className="text-gray-600 text-lg">
              Dễ dàng tạo và quản lý giải đấu thể thao với SportZone
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              id="tournament-left"
              data-animate
              className={`transition-all duration-700 ${
                isVisible["tournament-left"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Tạo Giải Đấu Chuyên Nghiệp
              </h3>
              <ul className="space-y-4 text-gray-700 mb-8">
                {[
                  "Thiết lập thông tin giải đấu nhanh chóng",
                  "Chọn sân thi đấu phù hợp",
                  "Quản lý người tham gia dễ dàng",
                  "Tính toán chi phí tự động",
                ].map((text, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 transform hover:translate-x-2 transition-transform duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center animate-pulse-subtle">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>

              <Link href="/tournaments/create">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transform group-hover:scale-110 transition-all duration-500 shadow-2xl">
                  <Trophy className="mr-2 h-5 w-5 animate-bounce-subtle" />
                  Tạo Giải Đấu Ngay
                </Button>
              </Link>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full animate-pulse-subtle"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 border-4 border-white/20 rounded-full animate-pulse-subtle animation-delay-400"></div>
            </div>

            <div
              id="tournament-right"
              data-animate
              className={`relative transition-all duration-700 ${
                isVisible["tournament-right"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <Card className="p-6 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4 animate-float" />
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Bắt Đầu Tổ Chức
                    </h4>
                    <p className="text-gray-600">
                      Tạo giải đấu đầu tiên của bạn trong vài phút
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { num: 1, text: "Điền thông tin cơ bản" },
                      { num: 2, text: "Chọn sân thi đấu" },
                      { num: 3, text: "Xác nhận và công bố" },
                    ].map((step, index) => (
                      <div
                        key={step.num}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-all duration-300 transform hover:scale-105"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center animate-pulse-subtle">
                          <span className="text-green-600 font-bold">
                            {step.num}
                          </span>
                        </div>
                        <span className="text-sm">{step.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Link href="/tournaments">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent hover:bg-green-50 hover:border-green-500 transition-all duration-300"
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Khám Phá Giải Đấu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 overflow-hidden">
        <div className="max-w-full">
          <div className="grid grid-cols-5 h-64">
            {[...Array(5)].map((_, i) => (
              <div
                key={`top-${i}`}
                className={`${
                  i % 2 === 0
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-400 text-white"
                } 
                  flex items-center justify-center font-semibold hover:scale-105 transition-transform duration-500
                  hover:z-10 cursor-pointer relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <span className="relative z-10">
                  {i % 2 === 0
                    ? "Sân Bóng Đá Cao Cấp"
                    : "Hình Ảnh Sân Cầu Lông"}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 h-64">
            {[...Array(5)].map((_, i) => (
              <div
                key={`bottom-${i}`}
                className={`${
                  i % 2 === 1
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-400 text-white"
                } 
                  flex items-center justify-center font-semibold hover:scale-105 transition-transform duration-500
                  hover:z-10 cursor-pointer relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <span className="relative z-10">
                  {i % 2 === 1
                    ? "Sân Bóng Đá Cao Cấp"
                    : "Hình Ảnh Sân Cầu Lông"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[600px]">
          {/* Become a Coach Section */}
          <div className="relative group overflow-hidden cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/Coach.png')" }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700"></div>

              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-blue-400/30 blur-3xl"></div>
              </div>
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-white">
              <div className="transform group-hover:scale-110 transition-transform duration-700">
                <Users className="h-20 w-20 mb-6 mx-auto animate-float" />
              </div>

              <h2 className="text-5xl font-bold mb-4 text-center group-hover:text-blue-200 transition-colors duration-500">
                Trở Thành Huấn Luyện Viên
              </h2>

              <p className="text-xl text-center mb-8 max-w-md opacity-90 group-hover:opacity-100 transition-opacity">
                Chia sẻ kinh nghiệm và đam mê thể thao của bạn. Hướng dẫn và
                truyền cảm hứng cho thế hệ vận động viên tiếp theo.
              </p>

              <Link href="/become-coach">
                <Button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transform group-hover:scale-110 transition-all duration-500 shadow-2xl">
                  Đăng Ký Ngay
                </Button>
              </Link>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full animate-pulse-subtle"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 border-4 border-white/20 rounded-full animate-pulse-subtle animation-delay-400"></div>
            </div>
          </div>

          {/* Become a Field Owner Section */}
          <div className="relative group overflow-hidden cursor-pointer">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 group-hover:scale-105"
              style={{ backgroundImage: "url('/FieldOwner.png')" }}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700"></div>

              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-green-400/30 blur-3xl"></div>
              </div>
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-white">
              <div className="transform group-hover:scale-110 transition-transform duration-700">
                <Trophy className="h-20 w-20 mb-6 mx-auto animate-float animation-delay-200" />
              </div>

              <h2 className="text-5xl font-bold mb-4 text-center group-hover:text-green-200 transition-colors duration-500">
                Trở Thành Chủ Sở Hữu Sân
              </h2>

              <p className="text-xl text-center mb-8 max-w-md opacity-90 group-hover:opacity-100 transition-opacity">
                Đưa sân thể thao của bạn lên nền tảng SportZone. Tăng doanh thu
                và tiếp cận hàng nghìn khách hàng tiềm năng.
              </p>

              <Link href="/become-field-owner">
                <Button className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold transform group-hover:scale-110 transition-all duration-500 shadow-2xl">
                  Đăng Ký Ngay
                </Button>
              </Link>

              {/* Decorative elements */}
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white/20 rounded-full animate-pulse-subtle animation-delay-200"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 border-4 border-white/20 rounded-full animate-pulse-subtle animation-delay-600"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="why-choose-header"
            data-animate
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible["why-choose-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Chọn SportZone?
            </h2>
            <p className="text-gray-600 text-lg">
              Mọi thứ bạn cần cho trận đấu hoàn hảo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Clock,
                title: "Đặt Sân Tức Thì",
                description:
                  "Đặt sân trong vài giây với tính khả dụng thời gian thực",
                color: "text-blue-600",
              },
              {
                icon: Users,
                title: "Huấn Luyện Viên Chuyên Nghiệp",
                description:
                  "Tiếp cận các huấn luyện viên được chứng nhận để tập luyện và cải thiện",
                color: "text-green-600",
              },
              {
                icon: Settings,
                title: "Hỗ Trợ Đa Môn Thể Thao",
                description:
                  "Tìm sân cho bóng đá, quần vợt, cầu lông và nhiều hơn nữa",
                color: "text-purple-600",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  id={`feature-${index}`}
                  data-animate
                  className={`text-center group transition-all duration-700 ${
                    isVisible[`feature-${index}`]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 
                    group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 bg-gray-100`}
                  >
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div
              id="courses-left"
              data-animate
              className={`transition-all duration-700 ${
                isVisible["courses-left"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Khóa Học Cho Mọi Lứa Tuổi!
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Chúng tôi cung cấp các khóa học thể thao chất lượng cao cho mọi
                lứa tuổi. Từ trẻ em đến người lớn, từ người mới bắt đầu đến vận
                động viên chuyên nghiệp, chúng tôi có chương trình phù hợp với
                nhu cầu và khả năng của bạn.
              </p>
            </div>

            <div
              id="courses-right"
              data-animate
              className={`relative transition-all duration-700 ${
                isVisible["courses-right"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative bg-gray-400 rounded-lg h-80 flex items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="text-white text-lg font-semibold relative z-10">
                  Hình Ảnh Sân Cầu Lông
                </span>

                <div className="absolute right-4 top-8 space-y-4 ">
                  {[
                    {
                      label: "Nhóm Hỗn Hợp",
                      level: "TRÌNH ĐỘ CƠ BẢN",
                      price: "$",
                    },
                    {
                      label: "Tối đa 6 người",
                      level: "TRÌNH ĐỘ TRUNG CẤP",
                      price: "$$",
                    },
                    { label: "Huấn luyện 1-1", level: "CÁ NHÂN", price: "$$$" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3 
                        hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-slide-in-right"
                      style={{ animationDelay: `${index * 200}ms` }}
                    >
                      <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold">Hình</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          {item.label}
                        </div>
                        <div className="font-semibold text-xs">
                          {item.level}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </>
  );
}
