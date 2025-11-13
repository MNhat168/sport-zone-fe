"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getUserProfile, setFavouriteSports } from "@/features/user/userThunk";
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
import { MapPin, Users, Search, Award, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavbarComponent } from "@/components/header/navbar-component";
import { FooterComponent } from "@/components/footer/footer-component";

export default function LandingPage() {
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  // selectedWeekday values: '' | 'any' | 'mon'..'sun'
  const [selectedWeekday, setSelectedWeekday] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFavoriteSportsModal, setShowFavoriteSportsModal] = useState(false);
  const [modalShownOnce, setModalShownOnce] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const isLoggedIn = !!user;
  const navigate = useNavigate();

  const slideImages = [
    "https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757854021/banner-tennis_koajhu.jpg",
    "https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757855604/badminton-banner-with-rackets-shuttlecock-blue-background-with-copy-space_l9libr.jpg",
    "https://res.cloudinary.com/dvcpy4kmm/image/upload/v1757855542/93333608_10047006_jgl1tk.jpg"
  ];

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slideImages.length]);
  // Fetch user profile on mount (simulate login success)
  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  return (
    <>
      
      {/* Navbar */}
      <NavbarComponent />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Slide Images */}
          <div className="absolute inset-0">
            {slideImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                style={{
                  backgroundImage: `url(${image})`,
                }}
              >
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center text-white animate-fade-in-up">
            <div className="inline-block mb-6 animate-bounce-in">
              <Badge
                className="text-white px-6 py-2 text-lg font-semibold"
                style={{ backgroundColor: "#00775C" }}
              >
                HỖ TRỢ THỂ THAO
              </Badge>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-slide-in-left">
              SportZone
            </h1>
            <div className="inline-block animate-slide-in-right">
              <Badge
                className="text-black px-6 py-2 text-lg font-semibold"
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
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
                  }`}
              />
            ))}
          </div>
        </section>

        {/* Search Section (name, sport, date, time, location) */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tìm Sân Của Bạn</h2>
              <p className="text-gray-600">Tìm theo tên sân, loại thể thao, ngày/giờ và địa điểm</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="flex flex-col items-center md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Tên Sân</label>
                  <Input
                    className="w-full text-left"
                    placeholder="Nhập tên sân (tùy chọn)"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </div>

                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Thể Loại</label>
                  <div className="w-full">
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger className="w-full">
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

                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Ngày trong tuần</label>
                  <div className="w-full">
                    <Select value={selectedWeekday} onValueChange={setSelectedWeekday}>
                      <SelectTrigger className="w-full">
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
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (selectedLocation) params.set("name", selectedLocation);
                      // don't send 'all' value
                      if (selectedSport && selectedSport !== 'all') params.set("type", selectedSport);
                      // send weekday instead of raw date (align with field filters)
                      if (selectedWeekday && selectedWeekday !== 'any') params.set("weekday", selectedWeekday);
                      const qp = params.toString()
                      navigate(`/fields${qp ? `?${qp}` : ''}`);
                    }}
                    className="px-6 py-3 bg-green-600 text-white hover:bg-green-700"
                  >
                    <Search className="mr-2 h-4 w-4" /> Tìm Sân
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tournament Creation Section */}
        <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Tổ Chức Giải Đấu Của Riêng Bạn
              </h2>
              <p className="text-gray-600 text-lg">
                Dễ dàng tạo và quản lý giải đấu thể thao với SportZone
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-in-left">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Tạo Giải Đấu Chuyên Nghiệp
                </h3>
                <ul className="space-y-4 text-gray-700 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Thiết lập thông tin giải đấu nhanh chóng</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Chọn sân thi đấu phù hợp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Quản lý người tham gia dễ dàng</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span>Tính toán chi phí tự động</span>
                  </li>
                </ul>
                
                <Button
                  onClick={() => navigate('/tournaments/create')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
                >
                  <Trophy className="mr-2 h-5 w-5" />
                  Tạo Giải Đấu Ngay
                </Button>
              </div>

              <div className="animate-slide-in-right">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        Bắt Đầu Tổ Chức
                      </h4>
                      <p className="text-gray-600">
                        Tạo giải đấu đầu tiên của bạn trong vài phút
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">1</span>
                        </div>
                        <span className="text-sm">Điền thông tin cơ bản</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">2</span>
                        </div>
                        <span className="text-sm">Chọn sân thi đấu</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">3</span>
                        </div>
                        <span className="text-sm">Xác nhận và công bố</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <Button
                        onClick={() => navigate('/tournaments')}
                        variant="outline"
                        className="w-full"
                      >
                        <Trophy className="mr-2 h-4 w-4" />
                        Khám Phá Giải Đấu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Alternating Fields Grid */}
        <section className="py-0">
          <div className="max-w-full">
            <div className="grid grid-cols-5 h-64">
              {/* Top row */}
              <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                Sân Bóng Đá Cao Cấp
              </div>
              <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
                Hình Ảnh Sân Cầu Lông
              </div>
              <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                Sân Bóng Đá Cao Cấp
              </div>
              <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
                Hình Ảnh Sân Cầu Lông
              </div>
              <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                Sân Bóng Đá Cao Cấp
              </div>
            </div>
            <div className="grid grid-cols-5 h-64">
              {/* Bottom row */}
              <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
                Hình Ảnh Sân Cầu Lông
              </div>
              <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                Sân Bóng Đá Cao Cấp
              </div>
              <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
                Hình Ảnh Sân Cầu Lông
              </div>
              <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                Sân Bóng Đá Cao Cấp
              </div>
              <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
                Hình Ảnh Sân Cầu Lông
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose SportZone */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
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
                  icon: "⏰",
                  title: "Đặt Sân Tức Thì",
                  description:
                    "Đặt sân trong vài giây với tính khả dụng thời gian thực",
                },
                {
                  icon: "👥",
                  title: "Huấn Luyện Viên Chuyên Nghiệp",
                  description:
                    "Tiếp cận các huấn luyện viên được chứng nhận để tập luyện và cải thiện",
                },
                {
                  icon: "⚙️",
                  title: "Hỗ Trợ Đa Môn Thể Thao",
                  description:
                    "Tìm sân cho bóng đá, quần vợt, cầu lông và nhiều hơn nữa",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="text-center animate-slide-in-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform bg-gray-100">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="animate-slide-in-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Khóa Học Cho Mọi Lứa Tuổi!
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Chúng tôi cung cấp các khóa học thể thao chất lượng cao cho
                  mọi lứa tuổi. Từ trẻ em đến người lớn, từ người mới bắt đầu
                  đến vận động viên chuyên nghiệp, chúng tôi có chương trình phù
                  hợp với nhu cầu và khả năng của bạn.
                </p>
              </div>

              <div className="animate-slide-in-right relative">
                <div className="relative bg-gray-400 rounded-lg h-80 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    Hình Ảnh Sân Cầu Lông
                  </span>

                  {/* Skill level indicators */}
                  <div className="absolute right-4 top-8 space-y-4">
                    <div className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold">Hình</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Nhóm Hỗn Hợp
                        </div>
                        <div className="font-semibold">TRÌNH ĐỘ CƠ BẢN</div>
                      </div>
                      <div className="text-lg font-bold">$</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold">Hình</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Tối đa 6 người
                        </div>
                        <div className="font-semibold">TRUNG BÌNH</div>
                      </div>
                      <div className="text-lg font-bold">$</div>
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs font-semibold">Hình</span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          Bài Học Riêng
                        </div>
                        <div className="font-semibold">KỸ NĂNG NÂNG CAO</div>
                      </div>
                      <div className="text-lg font-bold">$</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">👥</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Giải Đấu Nam
                    </h3>
                    <p className="text-gray-600">
                      Tiếp cận các huấn luyện viên được chứng nhận để tập luyện
                      và cải thiện
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">👥</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Giải Đấu Nữ
                    </h3>
                    <p className="text-gray-600">
                      Tiếp cận các huấn luyện viên được chứng nhận để tập luyện
                      và cải thiện
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Sign Up Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Muốn Đăng Ký!
              </h2>
              <p className="text-gray-600 text-lg">
                Mọi thứ bạn cần cho trận đấu hoàn hảo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Đăng Ký Làm Người Dùng",
                  description:
                    "Đặt sân thể thao yêu thích của bạn và tận hưởng chơi cùng bạn bè hoặc hệ thống đặt sân.",
                },
                {
                  icon: Award,
                  title: "Đăng Ký Làm Huấn Luyện Viên",
                  description:
                    "Tiếp cận huấn luyện chuyên nghiệp cho mọi trình độ kỹ năng và môn thể thao.",
                },
                {
                  icon: MapPin,
                  title: "Đăng Ký Làm Chủ Sân",
                  description:
                    "Liệt kê sân thể thao của bạn, quản lý đặt sân và phát triển kinh doanh với nền tảng của chúng tôi.",
                },
              ].map((signup, index) => (
                <Card
                  key={index}
                  className="text-center p-8 hover:shadow-lg transition-all duration-300 animate-scale-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "#00775C" }}
                  >
                    <signup.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {signup.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{signup.description}</p>
                  <Button
                    className="text-white hover:scale-105 transition-transform"
                    style={{ backgroundColor: "#00775C" }}
                  >
                    Đăng Ký Ngay
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
      {/* Footer */}
      <FooterComponent />
    </>
  );
}