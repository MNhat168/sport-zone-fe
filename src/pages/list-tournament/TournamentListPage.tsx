"use client"

import { useState, useEffect } from "react"
import { NavbarComponent } from "@/components/header/navbar-component"
import { FooterComponent } from "@/components/footer/footer-component"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, Users, MapPin, Trophy, Clock, ChevronRight } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { fetchTournaments } from "@/features/tournament/tournamentThunk"
import { Link } from "react-router-dom"

export default function TournamentListPage() {
  const dispatch = useAppDispatch()
  const { tournaments, loading, error } = useAppSelector((state) => state.tournament)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("")

  useEffect(() => {
    dispatch(fetchTournaments({}))
  }, [dispatch])

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSport = sportFilter === "all" || tournament.sportType === sportFilter
    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter
    const matchesLocation = !locationFilter || tournament.location.toLowerCase().includes(locationFilter.toLowerCase())
    
    return matchesSearch && matchesSport && matchesStatus && matchesLocation
  })

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
      case 'confirmed': return 'Confirmed'
      case 'pending': return 'Registration Open'
      case 'ongoing': return 'Live'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tournaments...</p>
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
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Tournaments</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover and join exciting sports tournaments in your area. Compete, connect, and conquer.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          {/* Search and Filters */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tournaments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Sport Filter */}
                <Select value={sportFilter} onValueChange={setSportFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="volleyball">Volleyball</SelectItem>
                    <SelectItem value="pickleball">Pickleball</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Registration Open</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="ongoing">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Location Filter */}
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full lg:w-48"
                />
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Tournaments <span className="text-gray-500">({filteredTournaments.length})</span>
            </h2>
          </div>

          {/* Tournaments Grid */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-700">Error loading tournaments: {error}</p>
              </CardContent>
            </Card>
          )}

          {filteredTournaments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tournaments found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || sportFilter !== 'all' || statusFilter !== 'all' || locationFilter
                    ? "Try adjusting your search filters to find more tournaments."
                    : "Be the first to create a tournament in your area!"
                  }
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Create Tournament
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament._id} 
                  tournament={tournament}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <FooterComponent />
    </>
  )
}

interface TournamentCardProps {
  tournament: any
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  formatDate: (date: string) => string
}

function TournamentCard({ tournament, getStatusColor, getStatusText, formatDate }: TournamentCardProps) {
  const isRegistrationOpen = tournament.status === 'pending' || tournament.status === 'confirmed'
  const isLive = tournament.status === 'ongoing'
  const isCompleted = tournament.status === 'completed'

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white group">
      <CardContent className="p-0">
        {/* Tournament Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 relative">
          <div className="flex justify-between items-start mb-3">
            <Badge className={`${getStatusColor(tournament.status)} capitalize`}>
              {getStatusText(tournament.status)}
            </Badge>
            {isLive && (
              <div className="flex items-center gap-1 bg-red-600 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold">LIVE</span>
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
            {tournament.name}
          </h3>
          
          <div className="flex items-center gap-2 text-gray-300">
            <Trophy className="h-4 w-4" />
            <span className="text-sm capitalize">{tournament.sportType}</span>
          </div>
        </div>

        {/* Tournament Details */}
        <div className="p-6 space-y-4">
          {/* Date and Time */}
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">{formatDate(tournament.tournamentDate)}</div>
              <div>{tournament.startTime} - {tournament.endTime}</div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{tournament.location}</span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="h-4 w-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">{tournament.participants?.length || 0}</span>
              <span className="text-gray-500">/{tournament.maxParticipants} participants</span>
            </div>
          </div>

          {/* Registration Period */}
          {isRegistrationOpen && (
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <div className="text-sm">
                Registeration end by: {formatDate(tournament.registrationEnd)}
              </div>
            </div>
          )}

          {/* Fee */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {tournament.registrationFee > 0 
                ? `${tournament.registrationFee.toLocaleString()} VNĐ`
                : 'Free'
              }
            </div>
            <Badge variant="outline" className="text-gray-600">
              Entry Fee
            </Badge>
          </div>
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6">
          <Link to={`/tournaments/${tournament._id}`}>
            <Button 
              className={`w-full group/btn ${
                isCompleted 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : isLive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={tournament.status === 'cancelled'}
            >
              {isCompleted ? 'View Results' : 
               isLive ? 'Watch Live' : 
               tournament.status === 'cancelled' ? 'Cancelled' : 
               'View Details'}
              <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}