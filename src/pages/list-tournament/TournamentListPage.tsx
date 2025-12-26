"use client"

import { useState, useEffect } from "react"
import { NavbarComponent } from "@/components/header/navbar-component"
import { FooterComponent } from "@/components/footer/footer-component"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, Calendar, Users, MapPin, Trophy, Clock, ChevronRight, ChevronLeft, ChevronRightIcon } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { fetchTournaments } from "@/features/tournament/tournamentThunk"
import { Link } from "react-router-dom"
import { SportType, SportCategories, getSportDisplayNameVN, getCategoryDisplayName } from "@/components/enums/ENUMS"

const ITEMS_PER_PAGE = 10;

import Loading from "@/components/ui/loading"

export default function TournamentListPage() {
  const dispatch = useAppDispatch()
  const { tournaments, loading, error } = useAppSelector((state) => state.tournament)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [minFee, setMinFee] = useState(0)
  const [maxFee, setMaxFee] = useState(1000000)
  const [locationFilter, setLocationFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchTournaments({}))
  }, [dispatch])

  // Get all available sports from ENUMS
  const allSports = Object.values(SportType)

  // Get categories for selected sports
  const getAvailableCategories = () => {
    if (selectedSports.length === 0) return []

    const categories: string[] = []
    selectedSports.forEach(sport => {
      switch (sport) {
        case SportType.FOOTBALL:
          categories.push(...Object.values(SportCategories.FOOTBALL))
          break
        case SportType.BASKETBALL:
          categories.push(...Object.values(SportCategories.BASKETBALL))
          break
        case SportType.VOLLEYBALL:
          categories.push(...Object.values(SportCategories.VOLLEYBALL))
          break
        case SportType.TENNIS:
        case SportType.BADMINTON:
        case SportType.PICKLEBALL:
          categories.push(...Object.values(SportCategories.NET_SPORTS))
          break
        case SportType.SWIMMING:
          categories.push(...Object.values(SportCategories.SWIMMING))
          break
        case SportType.GYM:
          categories.push(...Object.values(SportCategories.GYM))
          break
      }
    })
    return [...new Set(categories)] // Remove duplicates
  }

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport = selectedSports.length === 0 || selectedSports.includes(tournament.sportType)
    const matchesLocation = !locationFilter || tournament.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesFee = tournament.registrationFee >= minFee && tournament.registrationFee <= maxFee

    return matchesSearch && matchesSport && matchesLocation && matchesFee
  })

  // Calculate pagination
  const totalItems = filteredTournaments.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTournaments = filteredTournaments.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'ongoing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận'
      case 'pending': return 'Đang mở đăng ký'
      case 'ongoing': return 'Đang diễn ra'
      case 'completed': return 'Đã hoàn thành'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ'
  }

  const handleSportToggle = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport)
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    )
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of results when changing page
    const resultsElement = document.getElementById('tournament-results')
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Fixed FeeSlider Component
  const FeeSlider = () => {
    const handleMaxFeeChange = (value: number) => {
      setMaxFee(value)
      setCurrentPage(1) // Reset to first page when filters change
    }

    const getProgressWidth = () => {
      return (maxFee / 1000000) * 100
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-semibold">Khoảng phí đăng ký</Label>
          <span className="text-sm text-gray-600">
            {minFee === 0 && maxFee === 1000000 ? 'Bất kỳ' : `Lên đến ${formatCurrency(maxFee)}`}
          </span>
        </div>

        {/* Custom Slider */}
        <div className="space-y-3">
          <div className="relative">
            {/* Slider Track */}
            <div className="h-2 bg-gray-200 rounded-lg">
              {/* Progress Fill */}
              <div
                className="h-full bg-green-500 rounded-lg"
                style={{ width: `${getProgressWidth()}%` }}
              />
            </div>

            {/* Slider Thumb */}
            <input
              type="range"
              min="0"
              max="1000000"
              step="50000"
              value={maxFee}
              onChange={(e) => handleMaxFeeChange(parseInt(e.target.value))}
              className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
            />

            {/* Custom Thumb */}
            <div
              className="absolute top-1/2 w-4 h-4 bg-green-600 border-2 border-white rounded-full shadow-lg transform -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={{ left: `calc(${getProgressWidth()}% - 8px)` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>50K</span>
            <span>1M VNĐ</span>
          </div>
        </div>

        {/* Quick selection buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 50000, label: '50K' },
            { value: 200000, label: '200K' },
            { value: 500000, label: '500K' },
            { value: 1000000, label: '1M+' }
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMinFee(50000)
                setMaxFee(value)
                setCurrentPage(1) // Reset to first page when filters change
              }}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${maxFee === value
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Loading size={100} />
              <p className="mt-4 text-gray-600">Đang tải giải đấu...</p>
            </div>
          </div>
        </div>
        <FooterComponent />
      </>
    )
  }

  return (
    <>
      <NavbarComponent />

      {/* Compact Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">Giải đấu</h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Khám phá và tham gia các giải đấu thể thao thú vị trong khu vực của bạn
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Tìm kiếm giải đấu theo tên, địa điểm hoặc môn thể thao..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page when search changes
                }}
                className="pl-10 py-6 text-base border-gray-300 focus:border-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters (1/4) - Now scrollable */}
            <div className="w-1/4">
              <Card className="shadow-sm border border-gray-200 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSports([])
                        setSelectedCategories([])
                        setMinFee(0)
                        setMaxFee(1000000)
                        setLocationFilter("")
                        setSearchTerm("")
                        setCurrentPage(1)
                      }}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 text-sm"
                    >
                      Đặt lại tất cả
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label htmlFor="location" className="text-sm font-semibold">Địa điểm</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Nhập địa điểm..."
                        value={locationFilter}
                        onChange={(e) => {
                          setLocationFilter(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Sport Types */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Loại thể thao</Label>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {allSports.map((sport) => (
                        <div key={sport} className="flex items-center space-x-3">
                          <Checkbox
                            id={`sport-${sport}`}
                            checked={selectedSports.includes(sport)}
                            onCheckedChange={() => handleSportToggle(sport)}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          <Label
                            htmlFor={`sport-${sport}`}
                            className="text-sm font-normal cursor-pointer flex items-center gap-2"
                          >
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                              <Trophy className="h-3 w-3 text-gray-600" />
                            </div>
                            {getSportDisplayNameVN(sport)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  {getAvailableCategories().length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Danh mục</Label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {getAvailableCategories().map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategoryToggle(category)}
                              className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <Label
                              htmlFor={`category-${category}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {getCategoryDisplayName(category, selectedSports[0])}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entry Fee Range with Fixed Slider */}
                  <FeeSlider />
                </CardContent>
              </Card>
            </div>

            {/* Right Content - Tournaments List (3/4) */}
            <div className="w-3/4" id="tournament-results">
              {/* Results Count */}
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Giải đấu
                </h2>
                <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                  {filteredTournaments.length} tìm thấy
                </span>
                {filteredTournaments.length > 0 && (
                  <span className="text-sm text-gray-600">
                    (Trang {currentPage} / {totalPages})
                  </span>
                )}
              </div>

              {/* Tournaments List */}
              {error && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <p className="text-red-700">Lỗi khi tải giải đấu: {error}</p>
                  </CardContent>
                </Card>
              )}

              {currentTournaments.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy giải đấu</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || selectedSports.length > 0 || locationFilter || minFee > 0 || maxFee < 1000000
                        ? "Thử điều chỉnh bộ lọc tìm kiếm để tìm thêm giải đấu."
                        : "Hãy là người đầu tiên tạo giải đấu trong khu vực của bạn!"
                      }
                    </p>
                    <Link to="/tournaments/create">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Tạo giải đấu
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-4">
                    {currentTournaments.map((tournament) => (
                      <TournamentCard
                        key={tournament._id}
                        tournament={tournament}
                        getStatusColor={getStatusColor}
                        getStatusText={getStatusText}
                        formatDate={formatDate}
                        formatCurrency={formatCurrency}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterComponent />
    </>
  )

  // Pagination component function
  function renderPagination() {
    if (totalPages <= 1) return null

    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    return (
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md border ${currentPage === 1
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
              : 'hover:bg-gray-100 border-gray-300 text-gray-700'
              }`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* First page */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`px-3 py-1 rounded-md border ${currentPage === 1
                  ? 'bg-green-600 text-white border-green-600'
                  : 'hover:bg-gray-100 border-gray-300 text-gray-700'
                  }`}
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-1 text-gray-500">
                  ...
                </span>
              )}
            </>
          )}

          {/* Page numbers */}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded-md border ${currentPage === pageNum
                ? 'bg-green-600 text-white border-green-600'
                : 'hover:bg-gray-100 border-gray-300 text-gray-700'
                }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Last page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-1 text-gray-500">
                  ...
                </span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-md border ${currentPage === totalPages
                  ? 'bg-green-600 text-white border-green-600'
                  : 'hover:bg-gray-100 border-gray-300 text-gray-700'
                  }`}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md border ${currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
              : 'hover:bg-gray-100 border-gray-300 text-gray-700'
              }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Hiển thị {startIndex + 1} - {Math.min(endIndex, totalItems)} trong tổng số {totalItems} giải đấu
        </p>
      </div>
    )
  }
}

interface TournamentCardProps {
  tournament: any
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (date: string) => string
  formatCurrency: (amount: number) => string
}

function TournamentCard({ tournament, getStatusColor, getStatusText, formatDate, formatCurrency }: TournamentCardProps) {
  const isRegistrationOpen = tournament.status === 'pending' || tournament.status === 'confirmed'
  const isLive = tournament.status === 'ongoing'
  const isCompleted = tournament.status === 'completed'

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          {/* Left Content */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {/* Sport Icon/Emblem */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-white" />
              </div>

              {/* Tournament Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getStatusColor(tournament.status)} capitalize text-xs`}>
                    {getStatusText(tournament.status)}
                  </Badge>
                  {isLive && (
                    <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-white">TRỰC TIẾP</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                  {tournament.name}
                </h3>

                <div className="space-y-2 mb-4">
                  {/* Sport Type and Location */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span className="capitalize">{getSportDisplayNameVN(tournament.sportType)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{tournament.location}</span>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(tournament.tournamentDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{tournament.startTime} - {tournament.endTime}</span>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      <span className="font-semibold">{tournament.participants?.length || 0}</span>
                      <span className="text-gray-500">/{tournament.maxParticipants} người tham gia</span>
                    </span>
                  </div>
                </div>

                {/* Registration Period */}
                {isRegistrationOpen && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                    <Clock className="h-4 w-4" />
                    <span>Đăng ký kết thúc: {formatDate(tournament.registrationEnd)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Fee and Action */}
          <div className="flex flex-col items-end gap-4 ml-6">
            {/* Fee */}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {tournament.registrationFee > 0
                  ? formatCurrency(tournament.registrationFee)
                  : 'Miễn phí'
                }
              </div>
              <Badge variant="outline" className="text-gray-600 mt-1">
                Phí đăng ký
              </Badge>
            </div>

            {/* Action Button */}
            <Link to={`/tournaments/${tournament._id}`}>
              <Button
                className={`group/btn ${isCompleted
                  ? 'bg-gray-600 hover:bg-gray-700'
                  : isLive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
                disabled={tournament.status === 'cancelled'}
              >
                {isCompleted ? 'Xem kết quả' :
                  isLive ? 'Xem trực tiếp' :
                    tournament.status === 'cancelled' ? 'Đã hủy' :
                      'Xem chi tiết'}
                <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}