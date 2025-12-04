"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { NavbarComponent } from "@/components/header/navbar-component"
import { FooterComponent } from "@/components/footer/footer-component"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  DollarSign,
  User,
  Award,
  ChevronRight,
  Share2,
  Bookmark,
  Shield,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  Users2,
  Target,
  Hash
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { fetchTournamentById, registerForTournament, selectTeam } from "@/features/tournament/tournamentThunk"
import { getSportDisplayNameVN, getCategoryDisplayName, getFormatDisplayName } from "@/components/enums/ENUMS"
import TournamentFormationMap from "@/components/tournamnent/TournamentFormationMapProps "
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createPayOSPayment, queryPayOSTransaction } from "@/features/transactions/transactionsThunk"
import { setError } from "@/features/tournament"

export default function TournamentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentTournament, loading, error } = useAppSelector((state) => state.tournament)
  const { user } = useAppSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState("overview")
  const [isRegistering, setIsRegistering] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("wallet")
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [highlightedTeam, setHighlightedTeam] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchTournamentById(id))
    }
  }, [dispatch, id])

  // Clear team highlight when switching tabs
  useEffect(() => {
    if (activeTab !== "participants" && activeTab !== "teams") {
      setHighlightedTeam(null)
    }
  }, [activeTab])

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // TODO: Implement actual bookmark API call
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentTournament?.name,
        text: `Check out this tournament: ${currentTournament?.name}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      // TODO: Show toast notification
    }
  }

  const handleRegister = async () => {
    if (!currentTournament || !user) {
      navigate('/login');
      return;
    }

    setIsRegistering(true);
    try {
      // Register for tournament - now returns full response
      const registrationResponse = await dispatch(registerForTournament({
        tournamentId: currentTournament._id,
        paymentMethod
      })).unwrap();

      console.log('Full registration response:', registrationResponse);

      // ✅ Check different possible response structures
      let paymentUrl = null;
      let orderCode = null;
      let transactionId = null;

      if (registrationResponse.paymentUrl) {
        // Direct paymentUrl in response
        paymentUrl = registrationResponse.paymentUrl;
        orderCode = registrationResponse.orderCode;
        transactionId = registrationResponse.transaction?._id;
      } else if (registrationResponse.data?.paymentUrl) {
        // Nested in data property
        paymentUrl = registrationResponse.data.paymentUrl;
        orderCode = registrationResponse.data.orderCode;
        transactionId = registrationResponse.data.transaction?._id;
      } else if (registrationResponse.result?.paymentUrl) {
        // Nested in result property
        paymentUrl = registrationResponse.result.paymentUrl;
        orderCode = registrationResponse.result.orderCode;
        transactionId = registrationResponse.result.transaction?._id;
      }

      console.log('Extracted payment info:', { paymentUrl, orderCode, transactionId });

      // Handle PayOS payment
      if (paymentMethod === 'payos' && paymentUrl) {
        // Store payment info
        localStorage.setItem('pendingTournamentPayment', JSON.stringify({
          tournamentId: currentTournament._id,
          orderCode,
          transactionId,
          timestamp: Date.now()
        }));

        // Close dialog and redirect
        setShowRegisterDialog(false);

        // Short delay to ensure dialog closes
        setTimeout(() => {
          console.log('Redirecting to PayOS:', paymentUrl);
          window.location.href = paymentUrl;
        }, 100);

        return;
      }

      // For non-PayOS methods
      if (paymentMethod !== 'payos') {
        setRegistrationSuccess(true);
        setShowRegisterDialog(false);
        dispatch(fetchTournamentById(currentTournament._id));

        setTimeout(() => setRegistrationSuccess(false), 5000);
      } else {
        // PayOS was selected but no paymentUrl returned
        throw new Error('No payment URL received from server');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(`Registration failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    // Check for payment status in URL parameters
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment');
      const orderCode = params.get('orderCode');

      if (paymentStatus && id) {
        // Clear URL parameters without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);

        if (paymentStatus === 'success') {
          // Show success message
          setRegistrationSuccess(true);
          // Refresh tournament data
          dispatch(fetchTournamentById(id));

          // Show success toast/notification
          setTimeout(() => {
            setRegistrationSuccess(false);
          }, 5000);
        } else if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
          // Show error toast/notification
          const reason = params.get('reason');
          console.error('Payment failed:', { paymentStatus, reason });
          // You might want to show a toast notification here
        }
      }
    }
  }, [id, dispatch]);

  const handlePayOSPayment = async () => {
    try {
      if (!currentTournament || !user) {
        console.error('Missing tournament or user data');
        return;
      }

      console.log('Starting PayOS payment process...');

      // First, create a tournament registration transaction
      const registrationResponse = await dispatch(registerForTournament({
        tournamentId: currentTournament._id,
        paymentMethod: 'payos'
      })).unwrap();

      console.log('Registration response:', registrationResponse);

      // ✅ FIX: Check if we already have a payment link in the response
      if (registrationResponse.paymentLink) {
        setShowRegisterDialog(false);

        // Store payment info for polling
        localStorage.setItem('pendingPayment', JSON.stringify({
          tournamentId: currentTournament._id,
          orderCode: registrationResponse.orderCode,
          transactionId: registrationResponse.transaction?._id,
          timestamp: Date.now()
        }));

        // Open payment window directly
        window.open(registrationResponse.paymentLink, '_blank', 'width=500,height=700');
        return;
      }

      // If no payment link, try to create one using transaction ID
      console.log('No payment link in response, trying with transaction ID...');

      // Extract transaction ID from registration response
      const transactionId = registrationResponse.transaction?._id;
      if (!transactionId) {
        throw new Error('No transaction ID found in registration response');
      }

      // Create PayOS payment link using createPayOSPayment API
      console.log('Creating PayOS payment link using transaction ID:', transactionId);
      const response = await dispatch(createPayOSPayment({
        orderId: transactionId, // ✅ Use transaction ID
        amount: currentTournament.registrationFee,
        description: `Đăng ký tham gia giải đấu ${currentTournament.name}`,
        returnUrl: `${window.location.origin}/tournaments/${currentTournament._id}/payment-return`,
        cancelUrl: `${window.location.origin}/tournaments/${currentTournament._id}`,
        items: [{
          name: `Đăng ký giải đấu: ${currentTournament.name}`,
          quantity: 1,
          price: currentTournament.registrationFee
        }],
        buyerName: user.fullName || user.email || 'User',
        buyerEmail: user.email,
        buyerPhone: user.phone || '',
        expiredAt: 15
      })).unwrap();

      console.log('PayOS payment link response:', response);

      if (response.checkoutUrl) {
        setShowRegisterDialog(false);
        console.log('Opening payment URL:', response.checkoutUrl);

        // Store payment info for polling
        localStorage.setItem('pendingPayment', JSON.stringify({
          tournamentId: currentTournament._id,
          orderCode: response.orderCode,
          transactionId: transactionId,
          timestamp: Date.now()
        }));

        window.open(response.checkoutUrl, '_blank', 'width=500,height=700');
      }
    } catch (error: any) {
      console.error('PayOS payment failed:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }

      alert(`Payment Error: ${error.message || 'Failed to create payment link'}`);
    }
  };

  // Handle team click from formation map
  const handleTeamClick = (teamNumber: number) => {
    setActiveTab("participants")
    setHighlightedTeam(teamNumber)
    dispatch(selectTeam(teamNumber))

    // Scroll to team section after a short delay
    setTimeout(() => {
      const teamElement = document.getElementById(`team-${teamNumber}`)
      if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        teamElement.classList.add('animate-pulse')
        setTimeout(() => {
          teamElement.classList.remove('animate-pulse')
        }, 2000)
      }
    }, 100)
  }

  // Navigate to team details
  const handleViewTeamDetails = (teamNumber: number) => {
    setActiveTab("participants")
    setHighlightedTeam(teamNumber)
    dispatch(selectTeam(teamNumber))

    setTimeout(() => {
      const teamElement = document.getElementById(`team-${teamNumber}`)
      if (teamElement) {
        teamElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  if (loading) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="mt-4 text-gray-600">Loading tournament details...</p>
            </div>
          </div>
        </div>
        <FooterComponent />
      </>
    )
  }

  if (error || !currentTournament) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error || "Tournament not found"}
              </AlertDescription>
            </Alert>
            <Button className="mt-4" onClick={() => navigate('/tournaments')}>
              Back to Tournaments
            </Button>
          </div>
        </div>
        <FooterComponent />
      </>
    )
  }

  const tournament = currentTournament
  const isParticipant = user && tournament.participants?.some(p =>
    p.user?._id === user._id && p.paymentStatus === 'confirmed'
  );

  const hasPendingPayment = user && tournament.participants?.some(p =>
    p.user?._id === user._id && p.paymentStatus === 'pending'
  );
  const isRegistrationOpen = tournament.status === 'pending' || tournament.status === 'confirmed'
  const isFull = tournament.participants?.length >= (tournament.maxParticipants || 0);
  const daysUntilTournament = Math.ceil(
    (new Date(tournament.tournamentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  console.log('Tournament object:', {
    participants: tournament.participants,
    participantsLength: tournament.participants?.length,
    maxParticipants: tournament.maxParticipants,
    numberOfTeams: tournament.numberOfTeams,
    teamSize: tournament.teamSize,
    calculatedMax: tournament.numberOfTeams * tournament.teamSize,
    isFullCalculation: (tournament.participants?.length || 0) >= (tournament.maxParticipants || tournament.numberOfTeams * tournament.teamSize || 0)
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' VNĐ'
  }

  // Calculate total financials
  const totalRegistrationFees = tournament.totalRegistrationFeesCollected || 0
  const totalFieldCost = tournament.totalFieldCost || 0
  const commissionAmount = tournament.commissionAmount || 0
  const prizePool = tournament.prizePool || 0

  // Team statistics
  const fullTeams = tournament.teams?.filter(team => team.isFull)?.length || 0
  const incompleteTeams = tournament.currentTeams - fullTeams
  const emptyTeams = tournament.numberOfTeams - tournament.currentTeams

  // Group participants by team
  const participantsByTeam: Record<number, any[]> = {}
  tournament.participants?.forEach(participant => {
    const teamNumber = participant.teamNumber || 0
    if (!participantsByTeam[teamNumber]) {
      participantsByTeam[teamNumber] = []
    }
    participantsByTeam[teamNumber].push(participant)
  })

  console.log('Tournament data debug:', {
    maxParticipants: tournament.maxParticipants,
    minParticipants: tournament.minParticipants,
    participantsCount: tournament.participants?.length || 0,
    participants: tournament.participants,
    numberOfTeams: tournament.numberOfTeams,
    teamSize: tournament.teamSize,
    calculatedMax: tournament.numberOfTeams * tournament.teamSize
  });

  return (
    <>
      <NavbarComponent />

      {/* Success Alert */}
      {registrationSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-96">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              You have successfully registered for the tournament.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-24 pb-12">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
              {/* Tournament Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-white/20 backdrop-blur-sm border-0 text-white">
                    {getSportDisplayNameVN(tournament.sportType)}
                  </Badge>
                  <Badge className={`${tournament.status === 'confirmed' ? 'bg-green-500' :
                    tournament.status === 'pending' ? 'bg-yellow-500' :
                      tournament.status === 'ongoing' ? 'bg-red-500' :
                        tournament.status === 'completed' ? 'bg-blue-500' :
                          'bg-gray-500'
                    } text-white border-0`}>
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="bg-transparent border-white/30 text-white">
                    {getCategoryDisplayName(tournament.category, tournament.sportType)}
                  </Badge>
                  <Badge variant="outline" className="bg-transparent border-white/30 text-white flex items-center gap-1">
                    <Users2 className="h-3 w-3" />
                    {tournament.numberOfTeams} Teams
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4">{tournament.name}</h1>

                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{tournament.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{formatDate(tournament.tournamentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{tournament.startTime} - {tournament.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{tournament.participants?.length || 0}/{tournament.maxParticipants} participants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span>{tournament.currentTeams}/{tournament.numberOfTeams} teams</span>
                  </div>
                </div>

                <p className="text-lg opacity-90">{tournament.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 min-w-[300px]">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold mb-2">
                      {formatCurrency(tournament.registrationFee)}
                    </div>
                    <div className="text-sm opacity-80">Entry Fee Per Person</div>
                  </div>

                  <div className="space-y-3">
                    {isParticipant ? (
                      <Button disabled className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Already Registered
                      </Button>
                    ) : isFull ? (
                      <Button disabled className="w-full bg-gray-600">
                        Tournament Full
                      </Button>
                    ) : !isRegistrationOpen ? (
                      <Button disabled className="w-full bg-gray-600">
                        Registration Closed
                      </Button>
                    ) : (
                      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6">
                            <Trophy className="h-5 w-5 mr-2" />
                            Join Now
                          </Button>
                        </DialogTrigger>
                        {/* Inside the Register Dialog Content */}
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">Join Tournament</DialogTitle>
                          </DialogHeader>

                          <ScrollArea className="max-h-[80vh] pr-4">
                            <div className="space-y-6 py-4">
                              <div className="space-y-2">
                                <h3 className="font-semibold">Tournament Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <div className="text-gray-600">Name</div>
                                    <div className="font-medium">{tournament.name}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Fee</div>
                                    <div className="font-medium">{formatCurrency(tournament.registrationFee)}</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Teams</div>
                                    <div className="font-medium">{tournament.numberOfTeams} teams</div>
                                  </div>
                                  <div>
                                    <div className="text-gray-600">Team Size</div>
                                    <div className="font-medium">{tournament.teamSize} players</div>
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-4">
                                <h3 className="font-semibold">Select Payment Method</h3>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                                  {/* SportZone Wallet option */}
                                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value="wallet" id="wallet" />
                                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                                      <div className="font-medium">SportZone Wallet</div>
                                      <div className="text-sm text-gray-600">Pay from your wallet balance</div>
                                    </Label>
                                    <Badge variant="outline">Recommended</Badge>
                                  </div>

                                  {/* PayOS option */}
                                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value="payos" id="payos" />
                                    <Label htmlFor="payos" className="flex-1 cursor-pointer">
                                      <div className="font-medium">PayOS Payment</div>
                                      <div className="text-sm text-gray-600">Credit/Debit card, e-wallet via PayOS</div>
                                    </Label>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      Popular
                                    </Badge>
                                  </div>

                                  {/* MoMo option */}
                                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value="momo" id="momo" />
                                    <Label htmlFor="momo" className="flex-1 cursor-pointer">
                                      <div className="font-medium">MoMo E-Wallet</div>
                                      <div className="text-sm text-gray-600">Instant payment via MoMo</div>
                                    </Label>
                                  </div>

                                  {/* Bank Transfer option */}
                                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                                    <RadioGroupItem value="banking" id="banking" />
                                    <Label htmlFor="banking" className="flex-1 cursor-pointer">
                                      <div className="font-medium">Bank Transfer</div>
                                      <div className="text-sm text-gray-600">Direct bank transfer</div>
                                    </Label>
                                  </div>
                                </RadioGroup>

                                {/* Payment Method Details */}
                                {paymentMethod === 'payos' && (
                                  <Alert className="bg-blue-50 border-blue-200">
                                    <div className="flex items-start gap-2">
                                      <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    </div>
                                  </Alert>
                                )}
                              </div>

                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  You will be automatically assigned to a team based on availability.
                                  By joining, you agree to the tournament rules and understand that fees are non-refundable unless the tournament is cancelled.
                                </AlertDescription>
                              </Alert>

                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  className="flex-1"
                                  onClick={() => setShowRegisterDialog(false)}
                                  disabled={isRegistering}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={handleRegister}
                                  disabled={isRegistering}
                                >
                                  {isRegistering ? "Processing..." : "Confirm & Pay"}
                                </Button>
                              </div>
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-white/30 text-white bg-white/10"
                        onClick={handleBookmark}
                      >
                        <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-white' : ''}`} />
                        {isBookmarked ? 'Saved' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-white/30 text-white bg-white/10"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Registration Progress</span>
                    <span>
                      {tournament.participants?.length || 0}/
                      {tournament.numberOfTeams * tournament.teamSize}
                    </span>
                  </div>
                  <Progress
                    value={
                      ((tournament.participants?.length || 0) /
                        (tournament.numberOfTeams * tournament.teamSize)) * 100
                    }
                    className="h-2"
                  />
                  <div className="text-xs text-center mt-2 opacity-80">
                    {tournament.minParticipants} participants needed to confirm tournament
                  </div>
                </div>

                {/* Team Progress */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Team Formation</span>
                    <span>{tournament.currentTeams}/{tournament.numberOfTeams}</span>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div
                      className="bg-green-500 rounded-l"
                      style={{ width: `${(fullTeams / tournament.numberOfTeams) * 100}%` }}
                    />
                    <div
                      className="bg-yellow-500"
                      style={{ width: `${(incompleteTeams / tournament.numberOfTeams) * 100}%` }}
                    />
                    <div
                      className="bg-gray-500 rounded-r"
                      style={{ width: `${(emptyTeams / tournament.numberOfTeams) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-2 opacity-80">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {fullTeams} full
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      {incompleteTeams} forming
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      {emptyTeams} empty
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Tournament Details */}
            <div className="lg:col-span-2 space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="format">Format & Rules</TabsTrigger>
                  <TabsTrigger value="participants">Teams & Participants</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                  {/* Tournament Formation Map */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        Team Formation & Structure
                      </CardTitle>
                      <CardDescription>
                        Visual representation of team formations and tournament structure.
                        Click on a team to view its details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TournamentFormationMap
                        sportType={tournament.sportType}
                        category={tournament.category}
                        competitionFormat={tournament.competitionFormat}
                        participants={tournament.participants || []}
                        teams={tournament.teams || []}
                        maxParticipants={tournament.maxParticipants}
                        numberOfTeams={tournament.numberOfTeams}
                        teamSize={tournament.teamSize}
                        currentTeams={tournament.currentTeams}
                        onTeamClick={handleTeamClick}
                      />
                    </CardContent>
                  </Card>

                  {/* Quick Team Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-green-800">Full Teams</h3>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-700 mb-2">
                          {fullTeams}
                        </div>
                        <p className="text-sm text-green-600">
                          Ready to compete
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-yellow-800">Forming Teams</h3>
                          <Users className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-700 mb-2">
                          {incompleteTeams}
                        </div>
                        <p className="text-sm text-yellow-600">
                          Need more players
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-blue-800">Available Spots</h3>
                          <Hash className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-blue-700 mb-2">
                          {tournament.maxParticipants - tournament.participants.length}
                        </div>
                        <p className="text-sm text-blue-600">
                          Players can still join
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tournament Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tournament Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Competition Format
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Format:</span>
                              <span className="font-medium">{getFormatDisplayName(tournament.competitionFormat)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Category:</span>
                              <span className="font-medium">
                                {getCategoryDisplayName(tournament.category, tournament.sportType)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Teams:</span>
                              <span className="font-medium">{tournament.numberOfTeams} teams</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Team Size:</span>
                              <span className="font-medium">{tournament.teamSize} players/team</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Schedule
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tournament Date:</span>
                              <span className="font-medium">{formatDate(tournament.tournamentDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time:</span>
                              <span className="font-medium">{tournament.startTime} - {tournament.endTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Registration Ends:</span>
                              <span className="font-medium">{formatDate(tournament.registrationEnd)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confirmation Deadline:</span>
                              <span className="font-medium">{formatDate(tournament.confirmationDeadline)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold mb-3">Description</h3>
                        <p className="text-gray-700 whitespace-pre-line">{tournament.description}</p>
                      </div>

                      {tournament.rules && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold mb-3">Additional Rules</h3>
                            <p className="text-gray-700 whitespace-pre-line">{tournament.rules}</p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Field Information */}
                  {tournament.fields && tournament.fields.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Venue & Fields
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Location</h4>
                            <p className="text-gray-700">{tournament.location}</p>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Selected Fields</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {tournament.fields.map((fieldItem, index) => (
                                <Card key={index} className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h5 className="font-medium mb-1">
                                        {fieldItem.field?.name || `Field ${index + 1}`}
                                      </h5>
                                      {fieldItem.field?.location && (
                                        <p className="text-sm text-gray-600">{fieldItem.field.location.address}</p>
                                      )}
                                    </div>
                                    <Badge variant="outline">
                                      {fieldItem.field?.basePrice ? formatCurrency(fieldItem.field.basePrice) : 'Price info'}
                                    </Badge>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Format & Rules Tab */}
                <TabsContent value="format" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tournament Format</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{getFormatDisplayName(tournament.competitionFormat)}</h3>
                        <p className="text-gray-700">
                          {tournament.competitionFormat === 'single_elimination' &&
                            "Single elimination format where teams are eliminated after one loss. The tournament continues until only one team remains undefeated."}
                          {tournament.competitionFormat === 'double_elimination' &&
                            "Double elimination format where teams are eliminated after two losses. This ensures every team gets at least two matches."}
                          {tournament.competitionFormat === 'round_robin' &&
                            "Round robin format where every team plays against every other team. Points are awarded based on match results."}
                          {tournament.competitionFormat === 'group_stage' &&
                            "Group stage format where teams are divided into groups for initial matches, followed by knockout stages."}
                          {tournament.competitionFormat === 'league' &&
                            "League format with a longer schedule where teams accumulate points over multiple matches."}
                          {tournament.competitionFormat === 'knockout' &&
                            "Knockout format similar to single elimination, often used for cup competitions."}
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h3 className="font-semibold">Team Structure</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-gray-600">Total Teams</div>
                            <div className="font-medium">{tournament.numberOfTeams} teams</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Team Size</div>
                            <div className="font-medium">{tournament.teamSize} players per team</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Category</div>
                            <div className="font-medium">{getCategoryDisplayName(tournament.category, tournament.sportType)}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Current Teams</div>
                            <div className="font-medium">{tournament.currentTeams} formed</div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h3 className="font-semibold">Tournament Rules</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>All participants must arrive 30 minutes before the scheduled start time</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Proper sports attire and equipment are mandatory</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Team captains must be designated for each team</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Referee decisions are final</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Unsportsmanlike conduct will result in disqualification</span>
                          </div>
                          {tournament.rules && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-semibold mb-2">Additional Rules:</h4>
                              <p className="text-gray-700 whitespace-pre-line">{tournament.rules}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Teams & Participants Tab */}
                <TabsContent value="participants" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users2 className="h-5 w-5" />
                        Teams & Participants ({tournament.participants?.length || 0}/{tournament.maxParticipants})
                      </CardTitle>
                      <CardDescription>
                        {tournament.numberOfTeams} teams, {tournament.teamSize} players per team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {highlightedTeam && (
                        <Alert className="mb-4 bg-blue-50 border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">Viewing Team {highlightedTeam}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setHighlightedTeam(null)}
                            >
                              Clear
                            </Button>
                          </div>
                        </Alert>
                      )}

                      {tournament.teams && tournament.teams.length > 0 ? (
                        <ScrollArea className="h-[600px]">
                          <div className="space-y-6">
                            {tournament.teams.map((team) => {
                              const teamParticipants = participantsByTeam[team.teamNumber] || []
                              const isHighlighted = highlightedTeam === team.teamNumber
                              const isTeamFull = team.isFull

                              return (
                                <Card
                                  key={team.teamNumber}
                                  id={`team-${team.teamNumber}`}
                                  className={`transition-all ${isHighlighted
                                    ? 'border-2 border-blue-500 shadow-lg'
                                    : 'hover:border-gray-300'
                                    } ${isTeamFull ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}
                                >
                                  <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                          style={{ backgroundColor: team.color }}
                                        >
                                          {team.teamNumber}
                                        </div>
                                        <div>
                                          <h3 className="font-semibold text-lg">
                                            {team.name || `Team ${team.teamNumber}`}
                                          </h3>
                                          <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Badge variant={isTeamFull ? "default" : "outline"} className={
                                              isTeamFull
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                            }>
                                              {isTeamFull ? 'Full Team' : `${teamParticipants.length}/${tournament.teamSize}`}
                                            </Badge>
                                            {team.captain && (
                                              <Badge variant="outline" className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Captain
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <div className="text-sm text-gray-600">Team Score</div>
                                        <div className="text-2xl font-bold">{team.score || 0}</div>
                                      </div>
                                    </div>

                                    {/* Team Members */}
                                    <div className="mb-4">
                                      <h4 className="font-semibold mb-2">Team Members</h4>
                                      {teamParticipants.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {teamParticipants.map((participant, pIndex) => (
                                            <div
                                              key={pIndex}
                                              className="flex items-center gap-3 p-2 bg-white rounded-lg border"
                                            >
                                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold">
                                                {participant.user?.fullName?.charAt(0) || 'U'}
                                              </div>
                                              <div className="flex-1">
                                                <p className="font-medium">
                                                  {participant.user?.fullName || `Participant ${pIndex + 1}`}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                  {participant.position || 'Player'}
                                                </p>
                                              </div>
                                              {participant.user?._id === team.captain?._id && (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                  Captain
                                                </Badge>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-center py-4 text-gray-500">
                                          <Users2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                          <p>No members yet</p>
                                          <p className="text-sm">Be the first to join this team!</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Team Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                      <div className="text-center p-2 bg-gray-100 rounded">
                                        <div className="font-semibold">{team.matchesPlayed || 0}</div>
                                        <div className="text-gray-600">Matches</div>
                                      </div>
                                      <div className="text-center p-2 bg-green-100 rounded">
                                        <div className="font-semibold text-green-700">{team.matchesWon || 0}</div>
                                        <div className="text-gray-600">Wins</div>
                                      </div>
                                      <div className="text-center p-2 bg-red-100 rounded">
                                        <div className="font-semibold text-red-700">{team.matchesLost || 0}</div>
                                        <div className="text-gray-600">Losses</div>
                                      </div>
                                      <div className="text-center p-2 bg-yellow-100 rounded">
                                        <div className="font-semibold text-yellow-700">{team.matchesDrawn || 0}</div>
                                        <div className="text-gray-600">Draws</div>
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-4">
                                      <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => handleViewTeamDetails(team.teamNumber)}
                                      >
                                        View Team Details
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8">
                          <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams formed yet</h3>
                          <p className="text-gray-600 mb-4">Teams will be automatically formed as participants join</p>
                          {!isParticipant && isRegistrationOpen && !isFull && (
                            <Button onClick={() => setShowRegisterDialog(true)}>
                              <Trophy className="h-4 w-4 mr-2" />
                              Be the First Participant
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tournament Schedule</CardTitle>
                      <CardDescription>
                        Match schedule and results
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tournament.schedule && tournament.schedule.length > 0 ? (
                        <div className="space-y-4">
                          {tournament.schedule.map((match) => {
                            const teamA = tournament.teams?.find(t => t.teamNumber === match.teamA)
                            const teamB = tournament.teams?.find(t => t.teamNumber === match.teamB)

                            return (
                              <Card key={match.matchNumber} className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge variant="outline" className={
                                    match.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      match.status === 'ongoing' ? 'bg-red-100 text-red-800' :
                                        match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                          'bg-gray-100 text-gray-800'
                                  }>
                                    {match.status?.charAt(0).toUpperCase() + match.status?.slice(1)}
                                  </Badge>
                                  <span className="text-sm text-gray-600">Round {match.round}</span>
                                </div>

                                <div className="grid grid-cols-3 items-center py-4">
                                  {/* Team A */}
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                      <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: teamA?.color || '#EF4444' }}
                                      />
                                      <span className="font-semibold">{teamA?.name || `Team ${match.teamA}`}</span>
                                    </div>
                                    {match.status === 'completed' && (
                                      <div className="text-2xl font-bold">{match.scoreA || 0}</div>
                                    )}
                                  </div>

                                  {/* VS */}
                                  <div className="text-center">
                                    <div className="text-lg font-bold text-gray-700">VS</div>
                                    {match.startTime && (
                                      <div className="text-sm text-gray-600">
                                        {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    )}
                                  </div>

                                  {/* Team B */}
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                      <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: teamB?.color || '#3B82F6' }}
                                      />
                                      <span className="font-semibold">{teamB?.name || `Team ${match.teamB}`}</span>
                                    </div>
                                    {match.status === 'completed' && (
                                      <div className="text-2xl font-bold">{match.scoreB || 0}</div>
                                    )}
                                  </div>
                                </div>

                                {match.winner && (
                                  <div className="text-center mt-2">
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                      Winner: Team {match.winner}
                                    </Badge>
                                  </div>
                                )}
                              </Card>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule not available yet</h3>
                          <p className="text-gray-600">
                            The tournament schedule will be generated once all teams are formed.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Financials Tab */}
                <TabsContent value="financials" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Breakdown
                      </CardTitle>
                      <CardDescription>
                        Total amounts and distribution of tournament funds
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Total Amounts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-green-800">Total Registration Fees</h3>
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-3xl font-bold text-green-700 mb-2">
                              {formatCurrency(totalRegistrationFees)}
                            </div>
                            <p className="text-sm text-green-600">
                              From {tournament.participants?.length || 0} participants
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-blue-800">Total Field Cost</h3>
                              <MapPin className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-blue-700 mb-2">
                              {formatCurrency(totalFieldCost)}
                            </div>
                            <p className="text-sm text-blue-600">
                              {tournament.fields?.length || 0} fields booked
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-purple-800">Prize Pool</h3>
                              <Award className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="text-3xl font-bold text-purple-700 mb-2">
                              {formatCurrency(prizePool)}
                            </div>
                            <p className="text-sm text-purple-600">
                              Distributed to winning teams
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-semibold text-amber-800">Platform Commission</h3>
                              <Shield className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="text-3xl font-bold text-amber-700 mb-2">
                              {formatCurrency(commissionAmount)}
                            </div>
                            <p className="text-sm text-amber-600">
                              {((tournament.commissionRate ?? 0.1) * 100)}% of total fees
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Separator />

                      {/* Financial Flow */}
                      <div>
                        <h3 className="font-semibold mb-4">Financial Flow</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>Total Registration Fees Collected</span>
                            <span className="font-semibold text-green-600">{formatCurrency(totalRegistrationFees)}</span>
                          </div>

                          <div className="flex justify-center">
                            <ChevronRight className="h-6 w-6 text-gray-400 transform rotate-90" />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex justify-between">
                                <span>Field Costs</span>
                                <span className="font-semibold text-blue-600">-{formatCurrency(totalFieldCost)}</span>
                              </div>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                              <div className="flex justify-between">
                                <span>Platform Commission</span>
                                <span className="font-semibold text-amber-600">-{formatCurrency(commissionAmount)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <ChevronRight className="h-6 w-6 text-gray-400 transform rotate-90" />
                          </div>

                          <div className="p-3 bg-purple-50 rounded-lg">
                            <div className="flex justify-between">
                              <span className="font-semibold">Available Prize Pool</span>
                              <span className="font-bold text-purple-700">{formatCurrency(prizePool)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          All financial transactions are handled securely through SportZone's payment system.
                          Funds are held in escrow until the tournament is confirmed.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Organizer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-white font-semibold">
                      {tournament.organizer?.fullName?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <h4 className="font-semibold">{tournament.organizer?.fullName || 'Tournament Organizer'}</h4>
                      <p className="text-sm text-gray-600">Organizer</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tournament.organizer?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{tournament.organizer.email}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tournament Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Tournament Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge className={
                        tournament.status === 'confirmed' || tournament.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          tournament.status === 'pending' || tournament.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            tournament.status === 'ongoing' || tournament.status === 'ONGOING' ? 'bg-red-100 text-red-800' :
                              tournament.status === 'completed' || tournament.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                tournament.status === 'cancelled' || tournament.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                                  'bg-gray-100 text-gray-800'
                      }>
                        {tournament.status?.toLowerCase().charAt(0).toUpperCase() + tournament.status?.toLowerCase().slice(1) || 'Unknown'}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmation</span>
                      <span className="font-medium">
                        {tournament.participants?.length >= tournament.minParticipants ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="text-yellow-600">
                            Needs {tournament.minParticipants - (tournament.participants?.length || 0)} more
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Until Tournament</span>
                      <span className="font-medium">{daysUntilTournament} days</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Closes In</span>
                      <span className="font-medium">
                        {Math.ceil(
                          (new Date(tournament.registrationEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                        )} days
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Teams Formed</span>
                      <span className="font-medium">{tournament.currentTeams}/{tournament.numberOfTeams}</span>
                    </div>
                  </div>

                  {tournament.status === 'pending' && tournament.participants?.length < tournament.minParticipants && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        This tournament needs {tournament.minParticipants - (tournament.participants?.length || 0)} more participants to be confirmed.
                        Join now to help reach the minimum!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isParticipant && isRegistrationOpen && !isFull && (
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                      onClick={() => setShowRegisterDialog(true)}
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Join Tournament
                    </Button>
                  )}

                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Tournament
                  </Button>

                  <Button variant="outline" className="w-full" onClick={handleBookmark}>
                    <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                    {isBookmarked ? 'Saved' : 'Save for Later'}
                  </Button>

                  <Button variant="outline" className="w-full">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>

              {/* Prize Distribution */}
              {(prizePool > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Prize Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                            1
                          </div>
                          <span className="font-semibold">1st Place Team</span>
                        </div>
                        <span className="font-bold text-yellow-700">
                          {formatCurrency(prizePool * 0.5)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                            2
                          </div>
                          <span className="font-semibold">2nd Place Team</span>
                        </div>
                        <span className="font-bold text-gray-700">
                          {formatCurrency(prizePool * 0.3)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold">
                            3
                          </div>
                          <span className="font-semibold">3rd Place Team</span>
                        </div>
                        <span className="font-bold text-amber-700">
                          {formatCurrency(prizePool * 0.2)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 text-center">
                      *Prize distribution may vary based on final participant count
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <FooterComponent />
    </>
  )
}