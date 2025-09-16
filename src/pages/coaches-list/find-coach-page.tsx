"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Calendar, Filter } from "lucide-react";

interface Coach {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  nextAvailable: string;
  hourlyRate: number;
  image: string;
  badge?: string;
  specialties: string[];
}

const coaches: Coach[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Downtown Sports Center",
    rating: 5,
    reviews: 47,
    description:
      "Certified basketball instructor with 8+ years experience. Specializes in beginner to intermediate training.",
    nextAvailable: "Jan 15, 2025",
    hourlyRate: 45,
    image: "/female-basketball-coach.png",
    badge: "Professional",
    specialties: ["Basketball", "Youth Training"],
  },
  {
    id: 2,
    name: "Mike Chen",
    location: "Westside Recreation Center",
    rating: 4,
    reviews: 32,
    description:
      "Enthusiastic new coach focused on fun, engaging lessons for all skill levels. Great with kids and beginners.",
    nextAvailable: "Jan 14, 2025",
    hourlyRate: 25,
    image: "/male-tennis-coach.png",
    badge: "New",
    specialties: ["Tennis", "Kids Programs"],
  },
  {
    id: 3,
    name: "Lisa Rodriguez",
    location: "Elite Sports Academy",
    rating: 5,
    reviews: 89,
    description:
      "Former professional player turned coach. Specializes in advanced techniques and competition day preparation.",
    nextAvailable: "Jan 16, 2025",
    hourlyRate: 65,
    image: "/female-soccer-coach.png",
    badge: "Professional",
    specialties: ["Soccer", "Competition Prep"],
  },
  {
    id: 4,
    name: "Sarah Johnson",
    location: "Downtown Sports Center",
    rating: 5,
    reviews: 47,
    description:
      "Certified basketball instructor with 8+ years experience. Specializes in beginner to intermediate training.",
    nextAvailable: "Jan 15, 2025",
    hourlyRate: 45,
    image: "/female-basketball-coach-professional.jpg",
    badge: "Professional",
    specialties: ["Basketball", "Advanced Training"],
  },
  {
    id: 5,
    name: "Mike Chen",
    location: "Westside Recreation Center",
    rating: 4,
    reviews: 32,
    description:
      "Enthusiastic new coach focused on fun, engaging lessons for all skill levels. Great with kids and beginners.",
    nextAvailable: "Jan 14, 2025",
    hourlyRate: 25,
    image: "/male-sports-coach.jpg",
    badge: "Sports",
    specialties: ["Multi-Sport", "Youth Development"],
  },
];

export default function FindCoachPage() {
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("any");
  const [selectedRating, setSelectedRating] = useState("any");
  const [sortBy, setSortBy] = useState("relevance");

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-[#F2A922] text-[#F2A922]"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Professional":
        return "bg-[#00775C] text-white";
      case "New":
        return "bg-[#F2A922] text-white";
      case "Sports":
        return "bg-gray-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Your Perfect Coach
            </h1>
            <p className="text-gray-600">
              Browse coaches on the map or list view
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by:
                </span>
              </div>

              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="w-32 animate-slide-in-left">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger className="w-32 animate-slide-in-left delay-100">
                  <SelectValue placeholder="Any Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  <SelectItem value="low">$20-40/hr</SelectItem>
                  <SelectItem value="mid">$40-60/hr</SelectItem>
                  <SelectItem value="high">$60+/hr</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="w-32 animate-slide-in-left delay-200">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 animate-slide-in-right">
                  <SelectValue placeholder="Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coach List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 animate-fade-in">
              Available Coaches ({coaches.length})
            </h2>

            <div className="space-y-4">
              {coaches.map((coach, index) => (
                <Card
                  key={coach.id}
                  className="hover:shadow-lg transition-all duration-300 animate-slide-in-up border-l-4 border-l-[#00775C] hover:border-l-[#F2A922] hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-[#00775C]/20">
                        <AvatarImage
                          src={coach.image || "/placeholder.svg"}
                          alt={coach.name}
                        />
                        <AvatarFallback className="bg-[#00775C] text-white">
                          {coach.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {coach.name}
                          </h3>
                          {coach.badge && (
                            <Badge
                              className={`text-xs ${getBadgeColor(
                                coach.badge
                              )} animate-pulse`}
                            >
                              {coach.badge}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {coach.location}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {renderStars(coach.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({coach.reviews} reviews)
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {coach.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Next: {coach.nextAvailable}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-[#00775C]">
                              ${coach.hourlyRate}/hr
                            </span>
                            <Button className="bg-[#00775C] hover:bg-[#005a45] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Map View */}
          <div className="lg:sticky lg:top-6">
            <Card className="h-[600px] animate-fade-in-right">
              <CardContent className="p-0 h-full">
                <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
                  {/* Map placeholder with pins */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                    {/* Simulated map pins */}
                    <div className="absolute top-1/4 left-1/3 animate-bounce">
                      <div className="w-6 h-6 bg-[#00775C] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute top-1/2 right-1/3 animate-bounce delay-300">
                      <div className="w-6 h-6 bg-[#F2A922] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-1/3 left-1/2 animate-bounce delay-500">
                      <div className="w-6 h-6 bg-[#00775C] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute top-2/3 right-1/4 animate-bounce delay-700">
                      <div className="w-6 h-6 bg-[#F2A922] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-1/4 right-1/2 animate-bounce delay-1000">
                      <div className="w-6 h-6 bg-[#00775C] rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Map overlay info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Card className="bg-white/95 backdrop-blur-sm animate-slide-in-up">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Interactive Map View
                        </h3>
                        <p className="text-sm text-gray-600">
                          Click on pins to view coach details
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
