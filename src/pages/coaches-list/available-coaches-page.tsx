"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Users,
  Award,
  Target,
  TrendingUp,
} from "lucide-react";

const featuredCoaches = [
  {
    name: "Coach Sarah Johnson",
    sport: "Tennis Professional",
    image: "/female-tennis-coach.png",
  },
  {
    name: "Coach Mike Chen",
    sport: "Badminton Expert",
    image: "/male-badminton-coach.jpg",
  },
  {
    name: "Coach Emma Davis",
    sport: "Soccer Specialist",
    image: "/female-soccer-coach.png",
  },
  {
    name: "Coach Alex Rodriguez",
    sport: "Multi-Sport Trainer",
    image: "/male-sports-coach.jpg",
  },
];

const availableCoaches = [
  {
    name: "John Smith",
    sport: "Tennis Coach",
    rating: 4.9,
    reviews: 127,
    price: "$45/hr",
    image: "/male-tennis-coach.png",
    specialties: ["Beginner Friendly", "Tournament Prep"],
  },
  {
    name: "Maria Garcia",
    sport: "Badminton Coach",
    rating: 4.8,
    reviews: 89,
    price: "$40/hr",
    image: "/female-badminton-coach.jpg",
    specialties: ["Advanced Techniques", "Youth Training"],
  },
  {
    name: "Emma Davis",
    sport: "Soccer Coach",
    rating: 4.9,
    reviews: 156,
    price: "$50/hr",
    image: "/female-soccer-coach.png",
    specialties: ["Team Strategy", "Individual Skills"],
  },
  {
    name: "Alex Rodriguez",
    sport: "Multi-Sport Coach",
    rating: 4.7,
    reviews: 203,
    price: "$55/hr",
    image: "/male-sports-coach.jpg",
    specialties: ["Cross Training", "Fitness"],
  },
  {
    name: "Lisa Wong",
    sport: "Tennis Coach",
    rating: 4.8,
    reviews: 94,
    price: "$42/hr",
    image: "/female-tennis-coach-asian.jpg",
    specialties: ["Junior Development", "Technique"],
  },
  {
    name: "David Kim",
    sport: "Badminton Coach",
    rating: 4.9,
    reviews: 112,
    price: "$48/hr",
    image: "/male-badminton-coach-asian.jpg",
    specialties: ["Competition Prep", "Strategy"],
  },
];

const testimonials = [
  {
    name: "Jennifer Davis",
    sport: "Tennis Player",
    quote:
      "Training sessions with Coach Sarah. My forehand improved dramatically in just 3 months.",
    image: "/female-tennis-player.png",
  },
  {
    name: "Mark Johnson",
    sport: "Badminton Player",
    quote:
      "Mike's coaching style is perfect for beginners. Highly recommend for anyone starting badminton.",
    image: "/male-badminton-player.jpg",
  },
  {
    name: "Sarah Chen",
    sport: "Soccer Player",
    quote:
      "Emma's competitive training approach helped me get into my high school tournament team.",
    image: "/female-soccer-player.png",
  },
];

const benefits = [
  {
    icon: <Award className="w-8 h-8" />,
    title: "All coaches are certified and background checked",
    description: "Professional certification",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Best coaches near to your schedule",
    description: "Flexible scheduling",
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Fast track with our expert team",
    description: "Accelerated learning",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Highly rated coaches with proven results",
    description: "Proven track record",
  },
];

export default function AvaibleCoachesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredCoaches.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredCoaches.length) % featuredCoaches.length
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Featured Coaches Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mx-12">
                {featuredCoaches.map((coach, index) => (
                  <div
                    key={index}
                    className={`transform transition-all duration-500 ${
                      index === currentSlide
                        ? "scale-105 opacity-100"
                        : "scale-95 opacity-70"
                    }`}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-gray-200 flex items-center justify-center">
                          <img
                            src={coach.image || "/placeholder.svg"}
                            alt={coach.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 text-center">
                          <h3 className="font-semibold text-lg mb-1">
                            {coach.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{coach.sport}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="soccer">Soccer</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="downtown">Downtown</SelectItem>
                <SelectItem value="north">North Side</SelectItem>
                <SelectItem value="south">South Side</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">$30-40/hr</SelectItem>
                <SelectItem value="mid">$40-50/hr</SelectItem>
                <SelectItem value="high">$50+/hr</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Available Coaches */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Available Coaches
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableCoaches.map((coach, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <img
                      src={coach.image || "/placeholder.svg"}
                      alt={coach.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2">{coach.name}</h3>
                    <p className="text-gray-600 mb-3">{coach.sport}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(coach.rating)
                                ? "fill-[#F2A922] text-[#F2A922]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {coach.rating}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({coach.reviews})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {coach.specialties.map((specialty, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#00775C]">
                        {coach.price}
                      </span>
                      <Button className="bg-[#00775C] hover:bg-[#005a45] text-white px-6">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Our Athletes Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.sport}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose PickerBall Coach */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose PickerBall Coach?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center animate-fade-in hover:transform hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 bg-[#00775C] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Customer Special */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">New Customer Special!</h2>
          <p className="text-xl mb-8 text-gray-300">
            Get 20% off your first coaching session. Use code: WELCOME20
          </p>
          <Button
            size="lg"
            className="bg-[#F2A922] hover:bg-[#e09612] text-black font-semibold px-8 py-3"
          >
            Book Now
          </Button>

          <div className="flex justify-center items-center gap-2 mt-8">
            {[1, 2, 3, 4, 5].map((dot) => (
              <div
                key={dot}
                className={`w-2 h-2 rounded-full ${
                  dot === 1 ? "bg-[#F2A922]" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <style >{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
