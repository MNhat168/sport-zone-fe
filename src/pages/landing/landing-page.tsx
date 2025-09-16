"use client";

import { useState, useEffect } from "react";
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
import {
  MapPin,
  Users,
  Search,
  Award,
} from "lucide-react";
import { NavbarComponent } from "@/components/header/navbar-component";
import { FooterComponent } from "@/components/footer/footer-component";

export default function LandingPage() {
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavbarComponent />
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Slide Images */}
        <div className="absolute inset-0">
          {slideImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Find Your Field Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
Tìm Sân Của Bạn
            </h2>
            <p className="text-gray-600 text-lg">
Đặt sân thể thao hoàn hảo của bạn
            </p>
          </div>

          <Card className="max-w-4xl mx-auto animate-scale-in">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Loại Thể Thao
                  </label>
                  <Select
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn môn thể thao" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tennis">Quần vợt</SelectItem>
                      <SelectItem value="badminton">Cầu lông</SelectItem>
                      <SelectItem value="squash">Squash</SelectItem>
                      <SelectItem value="padel">Padel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Địa Điểm
                  </label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vị trí của bạn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="downtown">Trung tâm thành phố</SelectItem>
                      <SelectItem value="north">Quận Bắc</SelectItem>
                      <SelectItem value="south">Quận Nam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Ngày
                  </label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    placeholder="mm/dd/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Thời Gian
                  </label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Sáng</SelectItem>
                      <SelectItem value="afternoon">Chiều</SelectItem>
                      <SelectItem value="evening">Tối</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="px-8 py-3 text-white font-semibold hover:scale-105 transition-transform"
                  style={{ backgroundColor: "#00775C" }}
                >
                  <Search className="mr-2 h-5 w-5" />
Tìm Sân
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Fields */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
Sân Nổi Bật
            </h2>
            <p className="text-gray-600 text-lg">
Các địa điểm phổ biến với ưu đãi tuyệt vời
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sân Bóng Đá Cao Cấp",
                subtitle: "Câu Lạc Bộ Thể Thao Trung Tâm",
                price: "1.200.000đ/giờ",
                rating: "MỚI",
                image: "/soccer-field.png",
              },
              {
                title: "Sân Quần Vợt Chuyên Nghiệp",
                subtitle: "Câu Lạc Bộ Quần Vợt Elite",
                price: "900.000đ/giờ",
                rating: "HOT",
                image: "/outdoor-tennis-court.png",
              },
              {
                title: "Sân Cầu Lông Trong Nhà",
                subtitle: "Trung Tâm Thể Thao Thành Phố",
                price: "650.000đ/giờ",
                rating: "PHỔ BIẾN",
                image: "/badminton-court.png",
              },
            ].map((field, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-in-up group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  <img
                    src={field.image || "/placeholder.svg"}
                    alt={field.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className="absolute top-4 left-4 text-white font-semibold"
                    style={{ backgroundColor: "#F2A922" }}
                  >
                    {field.rating}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {field.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{field.subtitle}</p>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "#00775C" }}
                    >
                      {field.price}
                    </span>
                    <Button
                      className="text-white hover:scale-105 transition-transform"
                      style={{ backgroundColor: "#00775C" }}
                    >
Đặt Ngay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Why Choose Pickerball */}
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
                Chúng tôi cung cấp các khóa học thể thao chất lượng cao cho mọi lứa tuổi.
                Từ trẻ em đến người lớn, từ người mới bắt đầu đến vận động viên chuyên nghiệp,
                chúng tôi có chương trình phù hợp với nhu cầu và khả năng của bạn.
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
                      <div className="text-xs text-gray-500">Nhóm Hỗn Hợp</div>
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
Tiếp cận các huấn luyện viên được chứng nhận để tập luyện và cải thiện
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
Tiếp cận các huấn luyện viên được chứng nhận để tập luyện và cải thiện
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

      {/* Footer */}
      <FooterComponent />
    </div>
  );
}
