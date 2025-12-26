"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Users,
  Trophy,
  Target,
  Heart,
  MapPin,
  Clock,
  Star,
  Award,
} from "lucide-react";
import { NavbarComponent } from "@/components/header/navbar-component";
import { FooterComponent } from "@/components/footer/footer-component";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <NavbarComponent />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/placeholder.svg?height=800&width=1600&query=sports+field+aerial+view)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 to-green-600/80"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <div className="inline-block mb-6 animate-scale-in">
            <Badge
              className="text-white px-6 py-2 text-lg font-semibold"
              style={{ backgroundColor: "#00775C" }}
            >
              VỀ CHÚNG TÔI
            </Badge>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up animation-delay-200">
            Về SportZone
          </h1>
          <p className="text-2xl md:text-3xl mb-8 animate-fade-in-up animation-delay-400 opacity-90">
            Nền tảng kết nối thể thao hàng đầu Việt Nam
          </p>
          <div className="inline-block animate-scale-in animation-delay-600">
            <Badge
              className="text-black px-6 py-2 text-lg font-semibold"
              style={{ backgroundColor: "#F2A922" }}
            >
              KHỞI NGUỒN NĂM 2025
            </Badge>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div
              id="mission-text"
              data-animate
              className={`transition-all duration-700 ${
                isVisible["mission-text"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <h2 className="text-5xl font-bold mb-6 text-gray-900">
                Sứ Mệnh Của Chúng Tôi
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                SportZone được sinh ra với sứ mệnh kết nối cộng đồng thể thao
                Việt Nam, tạo ra một nền tảng toàn diện giúp mọi người dễ dàng
                tiếp cận các dịch vụ thể thao chất lượng cao.
              </p>
              <p className="text-xl text-gray-600 leading-relaxed">
                Chúng tôi tin rằng thể thao không chỉ là hoạt động giải trí mà
                còn là cách để xây dựng cộng đồng khỏe mạnh, năng động và gắn
                kết.
              </p>
            </div>
            <div
              id="mission-image"
              data-animate
              className={`transition-all duration-700 ${
                isVisible["mission-image"]
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src="/TeamPlayingSport.png"
                  alt="Team playing sports"
                  className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 to-transparent group-hover:from-blue-600/70 transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="values-header"
            data-animate
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible["values-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl font-bold mb-4 text-gray-900">
              Giá Trị Cốt Lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những giá trị định hướng mọi hoạt động của SportZone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Heart,
                title: "Đam Mê",
                description:
                  "Chúng tôi yêu thể thao và mang đến trải nghiệm tốt nhất cho cộng đồng",
                color: "from-red-500 to-pink-500",
                delay: "0ms",
              },
              {
                icon: Users,
                title: "Cộng Đồng",
                description:
                  "Xây dựng mạng lưới kết nối vững mạnh giữa người chơi và nhà cung cấp",
                color: "from-blue-500 to-cyan-500",
                delay: "100ms",
              },
              {
                icon: Trophy,
                title: "Chất Lượng",
                description:
                  "Cam kết mang đến dịch vụ và trải nghiệm chất lượng cao nhất",
                color: "from-yellow-500 to-orange-500",
                delay: "200ms",
              },
              {
                icon: Target,
                title: "Đổi Mới",
                description:
                  "Không ngừng cải tiến công nghệ để phục vụ khách hàng tốt hơn",
                color: "from-green-500 to-emerald-500",
                delay: "300ms",
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  id={`value-${index}`}
                  data-animate
                  className={`transition-all duration-700 ${
                    isVisible[`value-${index}`]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: value.delay }}
                >
                  <Card className="p-8 h-full hover:shadow-2xl transition-all duration-500 group cursor-pointer border-2 hover:border-transparent relative overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    ></div>
                    <div className="relative">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-gradient-to-br ${value.color} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-600 transition-all duration-500">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-subtle"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-subtle animation-delay-400"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div
            id="stats-header"
            data-animate
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible["stats-header"]
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <h2 className="text-5xl font-bold mb-4 text-white">
              Thành Tựu Của Chúng Tôi
            </h2>
            <p className="text-xl text-white/90">
              Những con số từ SportZone
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                number: "50,000+",
                label: "Người Dùng",
                icon: Users,
                delay: "0ms",
              },
              {
                number: "1,000+",
                label: "Sân Thể Thao",
                icon: MapPin,
                delay: "100ms",
              },
              {
                number: "500+",
                label: "Huấn Luyện Viên",
                icon: Award,
                delay: "200ms",
              },
              {
                number: "100,000+",
                label: "Giờ Đặt Sân",
                icon: Clock,
                delay: "300ms",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  id={`stat-${index}`}
                  data-animate
                  className={`text-center group transition-all duration-700 ${
                    isVisible[`stat-${index}`]
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: stat.delay }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 hover:scale-105 transition-all duration-500 border border-white/20">
                    <Icon className="h-12 w-12 text-white mx-auto mb-4 animate-float" />
                    <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                      {stat.number}
                    </div>
                    <div className="text-xl text-white/90">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            id="team-header"
            data-animate
            className={`text-center mb-16 transition-all duration-700 ${
              isVisible["team-header"]
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-5xl font-bold mb-4 text-gray-900">
              Đội Ngũ Của Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những người đứng sau SportZone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Nguyễn Huy Long",
                role: "Trưởng Nhóm",
                image: "/professional-man-portrait.png",
                delay: "0ms",
              },
              {
                name: "Phan Đình Trác",
                role: "Thành Viên",
                image: "/professional-woman-portrait.png",
                delay: "100ms",
              },
              {
                name: "Nguyễn Minh Nhật",
                role: "Thành Viên",
                image: "/professional-person-portrait.png",
                delay: "200ms",
              },
              {
                name: "Đỗ Mạnh Hùng",
                role: "Member",
                image: "/professional-asian-man-portrait.png",
                delay: "300ms",
              },
              {
                name: "Võ Quý Hoàng Long",
                role: "Thành Viên",
                image: "/professional-asian-woman-portrait.png",
                delay: "400ms",
              },
            ].map((member, index) => (
              <div
                key={index}
                id={`team-${index}`}
                data-animate
                className={`transition-all duration-700 ${
                  isVisible[`team-${index}`]
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: member.delay }}
              >
                <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500">
                  <div className="relative overflow-hidden">
                    <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
                      <Users className="h-20 w-20 text-gray-400" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{member.role}</p>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform duration-300"
                          style={{ transitionDelay: `${star * 50}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div
            id="cta-content"
            data-animate
            className={`transition-all duration-700 ${
              isVisible["cta-content"]
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white animate-fade-in-up">
              Sẵn Sàng Tham Gia SportZone?
            </h2>
            <p className="text-2xl text-white/90 mb-8 animate-fade-in-up animation-delay-200">
              Trở thành một phần của cộng đồng thể thao lớn nhất Việt Nam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <a
                href="/"
                className="inline-block bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-110 hover:shadow-2xl"
              >
                Khám Phá Ngay
              </a>
              {/* <a
                href="/"
                className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-110 hover:shadow-2xl"
              >
                Liên Hệ Chúng Tôi
              </a> */}
            </div>
          </div>
        </div>
      </section>

      <FooterComponent />
    </>
  );
}
