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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Users,
  Facebook,
  Twitter,
  Instagram,
  Menu,
  Search,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold" style={{ color: "#00775C" }}>
                SPYN
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a
                href="#"
                className="text-gray-900 hover:text-[#00775C] transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#00775C] transition-colors"
              >
                Shop
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#00775C] transition-colors"
              >
                Blog
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#00775C] transition-colors"
              >
                Events
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#00775C] transition-colors"
              >
                Pages
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#00775C] transition-colors"
              >
                News
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Contact
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/tennis-hero.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 text-center text-white animate-fade-in-up">
          <div className="inline-block mb-6 animate-bounce-in">
            <Badge
              className="text-white px-6 py-2 text-lg font-semibold"
              style={{ backgroundColor: "#00775C" }}
            >
              TENNIS AID
            </Badge>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-slide-in-left">
            SPORT ACADEMY
          </h1>
          <div className="inline-block animate-slide-in-right">
            <Badge
              className="text-black px-6 py-2 text-lg font-semibold"
              style={{ backgroundColor: "#F2A922" }}
            >
              100% QUALIFIED
            </Badge>
          </div>
        </div>
      </section>

      {/* Find Your Field Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Field
            </h2>
            <p className="text-gray-600 text-lg">
              Book your perfect sports venue
            </p>
          </div>

          <Card className="max-w-4xl mx-auto animate-scale-in">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sport Type
                  </label>
                  <Select
                    value={selectedSport}
                    onValueChange={setSelectedSport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sport" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="badminton">Badminton</SelectItem>
                      <SelectItem value="squash">Squash</SelectItem>
                      <SelectItem value="padel">Padel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Your location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="downtown">Downtown</SelectItem>
                      <SelectItem value="north">North District</SelectItem>
                      <SelectItem value="south">South District</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
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
                    Time
                  </label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
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
                  Search Fields
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
              Featured Fields
            </h2>
            <p className="text-gray-600 text-lg">
              Popular venues with great deals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Soccer Field",
                subtitle: "Downtown Sports Club",
                price: "$45/hr",
                rating: "NEW",
                image: "/soccer-field.png",
              },
              {
                title: "Professional Tennis Court",
                subtitle: "Elite Tennis Club",
                price: "$35/hr",
                rating: "HOT",
                image: "/outdoor-tennis-court.png",
              },
              {
                title: "Indoor Badminton Court",
                subtitle: "City Sports Center",
                price: "$25/hr",
                rating: "POPULAR",
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
                      Book Now
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
              Premium Soccer Field
            </div>
            <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
              Badminton Court Image
            </div>
            <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              Premium Soccer Field
            </div>
            <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
              Badminton Court Image
            </div>
            <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              Premium Soccer Field
            </div>
          </div>
          <div className="grid grid-cols-5 h-64">
            {/* Bottom row */}
            <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
              Badminton Court Image
            </div>
            <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              Premium Soccer Field
            </div>
            <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
              Badminton Court Image
            </div>
            <div className="bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
              Premium Soccer Field
            </div>
            <div className="bg-gray-400 flex items-center justify-center text-white font-semibold">
              Badminton Court Image
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Pickerball */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Pickerball?
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need for the perfect game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "⏰",
                title: "Instant Booking",
                description:
                  "Book your field in seconds with real-time availability",
              },
              {
                icon: "👥",
                title: "Professional Coaches",
                description:
                  "Access certified coaches for training and improvement",
              },
              {
                icon: "⚙️",
                title: "Multi-Sport Support",
                description:
                  "Find fields for soccer, tennis, badminton, and more",
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
                Course For Any Ages !
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy
                text ever since the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen book
              </p>
            </div>

            <div className="animate-slide-in-right relative">
              <div className="relative bg-gray-400 rounded-lg h-80 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  Badminton Court Image
                </span>

                {/* Skill level indicators */}
                <div className="absolute right-4 top-8 space-y-4">
                  <div className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">Image</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Mixed Groups</div>
                      <div className="font-semibold">BEGINNER LEVEL</div>
                    </div>
                    <div className="text-lg font-bold">$</div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">Image</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Maximum 6 people
                      </div>
                      <div className="font-semibold">INTERMEDIATE</div>
                    </div>
                    <div className="text-lg font-bold">$</div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow-lg flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold">Image</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">
                        Private Lesson
                      </div>
                      <div className="font-semibold">ADVANCED SKILLS</div>
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
                    Men's Tournaments
                  </h3>
                  <p className="text-gray-600">
                    Access certified coaches for training and improvement
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
                    Women's Tournaments
                  </h3>
                  <p className="text-gray-600">
                    Access certified coaches for training and improvement
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
              Want to Sign Up!
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need for the perfect game
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "SignUp as User",
                description:
                  "Book your favorite sports field and enjoy playing with friends or booking system.",
              },
              {
                icon: Award,
                title: "SignUp as Coach",
                description:
                  "Access to professional coaching for all skill levels and sports.",
              },
              {
                icon: MapPin,
                title: "SignUp as FieldOwner",
                description:
                  "List your sports fields, manage bookings and grow your business with our platform.",
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
                  Sign Up Now
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div
                className="text-2xl font-bold mb-4"
                style={{ color: "#F2A922" }}
              >
                Pickerball
              </div>
              <p className="text-gray-400 mb-4">
                Your premier destination for sports field booking and coaching
                services.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Book Field
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Find Coaches
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Nearby Fields
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Pickerball. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
