"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Heart,
  Star,
  Share2,
  Twitter,
  Instagram,
  Link,
} from "lucide-react";
import Image from "next/image";

export default function CoachBioPage() {
  const [activeTab, setActiveTab] = useState("Short Bio");
  const [isFavorite, setIsFavorite] = useState(false);

  const tabs = [
    "Short Bio",
    "Lesson With Me",
    "Coaching",
    "Gallery",
    "Reviews",
    "Locations",
  ];

  const coach = {
    name: "Sarah Johnson",
    title: "Professional Pickleball Coach with 8+ years experience",
    rating: 4.9,
    reviews: 127,
    location: "Austin, TX",
    hourlyRate: 75,
    image: "/female-tennis-coach.png",
  };

  const availability = [
    { day: "Today", time: "2:00 PM - 4:00 PM" },
    { day: "Tomorrow", time: "9:00 AM - 12:00 PM" },
    { day: "Jan 15", time: "1:00 PM - 5:00 PM" },
  ];

  const venues = [
    { name: "Austin Tennis Center", location: "Downtown Austin", rating: 4.8 },
    { name: "Zilker Park Courts", location: "South Austin", rating: 4.6 },
  ];

  const reviews = [
    {
      name: "Mike Chen",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Excellent coach! Sarah helped me improve my serve and court positioning significantly.",
      avatar: "/male-badminton-coach.jpg",
    },
    {
      name: "Lisa Rodriguez",
      rating: 5,
      date: "1 month ago",
      comment:
        "Great experience! Very patient and knowledgeable. Highly recommend.",
      avatar: "/female-badminton-coach.jpg",
    },
  ];

  const galleryImages = [
    { title: "Training Session", image: "/tennis-players-group.jpg" },
    { title: "Court Setup", image: "/outdoor-tennis-court.png" },
    { title: "Group Lesson", image: "/tennis-court-players.png" },
    { title: "Tournament", image: "/badminton-court.png" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Short Bio":
        return (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <div>
              <h3 className="text-lg font-semibold mb-3 animate-in fade-in duration-700 delay-100">
                About Sarah
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4 animate-in fade-in duration-700 delay-200">
                Professional pickleball coach with over 8 years of experience.
                Former tennis player turned pickleball enthusiast. Certified by
                USA Pickleball Association.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm animate-in slide-in-from-bottom-4 duration-500 delay-300">
                <div>
                  <span className="font-medium">Experience:</span>
                  <span className="ml-2 text-gray-600">8+ Years</span>
                </div>
                <div>
                  <span className="font-medium">Certification:</span>
                  <span className="ml-2 text-gray-600">USAPA Certified</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "Lesson With Me":
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <p className="text-gray-600 leading-relaxed animate-in fade-in duration-700 delay-100">
              I focus on fundamentals, strategy, and building confidence on the
              court. My teaching style is patient and encouraging.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Single Lesson",
                  desc: "One-on-one coaching",
                  price: "$75/hour",
                },
                {
                  title: "2 Player Lesson",
                  desc: "Semi-private coaching",
                  price: "$50/hour per person",
                },
                {
                  title: "Small Group Lesson",
                  desc: "3-4 players max",
                  price: "$35/hour per person",
                },
              ].map((lesson, index) => (
                <Card
                  key={index}
                  className={`p-4 hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-${
                    (index + 2) * 100
                  }`}
                >
                  <h4 className="font-semibold mb-2">{lesson.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{lesson.desc}</p>
                  <p className="text-lg font-bold text-[#00775C]">
                    {lesson.price}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        );

      case "Coaching":
        return (
          <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
            <p className="text-gray-600 leading-relaxed animate-in fade-in duration-700 delay-100">
              My coaching philosophy centers on building solid fundamentals
              while keeping the game fun and engaging. I work with players at
              all skill levels.
            </p>

            <div className="space-y-3">
              {[
                "Beginner to Advanced levels",
                "Strategy and game tactics",
                "Tournament preparation",
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 animate-in slide-in-from-left-4 duration-500 delay-${
                    (index + 2) * 100
                  }`}
                >
                  <div className="w-2 h-2 bg-[#00775C] rounded-full animate-pulse"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case "Gallery":
        return (
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map((item, index) => (
                <div
                  key={index}
                  className={`relative group cursor-pointer animate-in zoom-in-50 duration-500 delay-${
                    index * 100
                  }`}
                >
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-sm text-center mt-2 text-gray-600 group-hover:text-[#00775C] transition-colors duration-300">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "Reviews":
        return (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6 animate-in fade-in duration-700 delay-100">
              <div className="text-4xl font-bold text-[#00775C] animate-in zoom-in-50 duration-700 delay-200">
                4.9
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 fill-yellow-400 text-yellow-400 animate-in zoom-in-50 duration-300 delay-${
                        (i + 3) * 100
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 animate-in fade-in duration-700 delay-500">
                  127 reviews • 98% recommend
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.map((review, index) => (
                <Card
                  key={index}
                  className={`p-4 hover:shadow-md transition-shadow duration-300 animate-in slide-in-from-left-4 delay-${
                    (index + 6) * 100
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Image
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="rounded-full hover:scale-110 transition-transform duration-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{review.name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "Locations":
        return (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <p className="text-gray-600 animate-in fade-in duration-700 delay-100">
              Available coaching locations in Austin area:
            </p>
            {venues.map((venue, index) => (
              <Card
                key={index}
                className={`p-4 hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-in slide-in-from-bottom-4 delay-${
                  (index + 2) * 100
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{venue.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {typeof venue.location === 'string' 
                        ? venue.location 
                        : (venue.location as any)?.address || 'Địa chỉ chưa cập nhật'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{venue.rating}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b animate-in slide-in-from-top-4 duration-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            <div className="relative animate-in zoom-in-50 duration-700 delay-200">
              <Image
                src={coach.image || "/placeholder.svg"}
                alt={coach.name}
                width={120}
                height={120}
                className="rounded-full border-4 border-white shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="animate-in slide-in-from-left-4 duration-700 delay-300">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {coach.name}
                  </h1>
                  <p className="text-gray-600 mb-3">{coach.title}</p>

                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 fill-yellow-400 text-yellow-400 animate-in zoom-in-50 duration-300 delay-${
                            (i + 5) * 100
                          }`}
                        />
                      ))}
                      <span className="ml-1 font-semibold">{coach.rating}</span>
                      <span className="text-gray-500">
                        ({coach.reviews} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{coach.location}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`transition-all duration-300 hover:scale-105 animate-in slide-in-from-right-4 duration-700 delay-400 ${
                    isFavorite
                      ? "text-red-500 border-red-500 bg-red-50"
                      : "text-gray-500 hover:text-red-500 hover:border-red-500"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-1 transition-all duration-300 ${
                      isFavorite ? "fill-current scale-110" : ""
                    }`}
                  />
                  Favorite
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b animate-in slide-in-from-top-4 duration-700 delay-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 hover:scale-105 animate-in fade-in delay-${
                  (index + 5) * 100
                } ${
                  activeTab === tab
                    ? "border-[#00775C] text-[#00775C] scale-105"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700 delay-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              {renderTabContent()}
            </Card>
          </div>

          {/* Right Sidebar - Booking */}
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-700 delay-600">
            {/* Pricing & Booking */}
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Available Now</span>
                <span className="text-2xl font-bold text-[#00775C] animate-pulse">
                  ${coach.hourlyRate}/hr
                </span>
              </div>

              <Button className="w-full bg-black hover:bg-gray-800 text-white mb-4 hover:scale-105 transition-all duration-300">
                Book Now
              </Button>

              <p className="text-xs text-center text-gray-500 mb-6">
                Instant booking available
              </p>

              {/* Next Availability */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Next Availability</h4>
                <div className="space-y-2">
                  {availability.map((slot, index) => (
                    <div
                      key={index}
                      className={`flex justify-between text-sm p-2 rounded hover:bg-gray-50 transition-colors duration-200 animate-in slide-in-from-left-4 delay-${
                        (index + 7) * 100
                      }`}
                    >
                      <span className="text-gray-600">{slot.day}</span>
                      <span className="font-medium">{slot.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Availability */}
              <div className="space-y-3">
                <h4 className="font-semibold">Request for Availability</h4>
                <Input
                  placeholder="Name"
                  className="hover:border-[#00775C] focus:border-[#00775C] transition-colors duration-300"
                />
                <Input
                  placeholder="Email"
                  className="hover:border-[#00775C] focus:border-[#00775C] transition-colors duration-300"
                />
                <Input
                  placeholder="Phone"
                  className="hover:border-[#00775C] focus:border-[#00775C] transition-colors duration-300"
                />
                <Select>
                  <SelectTrigger className="hover:border-[#00775C] focus:border-[#00775C] transition-colors duration-300">
                    <SelectValue placeholder="Select Court" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="austin-tennis">
                      Austin Tennis Center
                    </SelectItem>
                    <SelectItem value="zilker-park">
                      Zilker Park Courts
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Details"
                  rows={3}
                  className="hover:border-[#00775C] focus:border-[#00775C] transition-colors duration-300"
                />
                <Button className="w-full bg-black hover:bg-gray-800 text-white hover:scale-105 transition-all duration-300">
                  Send Request
                </Button>
              </div>
            </Card>

            {/* Listing By Owner */}
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-semibold mb-4">Listing By Owner</h4>
              <div className="space-y-3">
                {venues.map((venue, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300 animate-in slide-in-from-bottom-4 delay-${
                      (index + 10) * 100
                    }`}
                  >
                    <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">
                      Court
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{venue.name}</p>
                      <p className="text-xs text-gray-600">
                        {typeof venue.location === 'string' 
                          ? venue.location 
                          : (venue.location as any)?.address || 'Địa chỉ chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Share Venue */}
            <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
              <h4 className="font-semibold mb-4">Share Venue</h4>
              <div className="flex justify-center gap-4">
                {[Share2, Twitter, Instagram, Link].map((Icon, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={`p-2 bg-transparent hover:scale-110 hover:bg-[#00775C] hover:text-white transition-all duration-300 animate-in zoom-in-50 delay-${
                      (index + 12) * 100
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
