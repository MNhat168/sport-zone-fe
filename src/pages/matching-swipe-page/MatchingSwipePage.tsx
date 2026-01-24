import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { fetchCandidates, swipeUser, fetchMatchProfile } from '@/features/matching/matchingThunk';
import { SwipeAction } from '@/features/matching/matchingSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Heart, X, Star, MapPin, Trophy, ShieldCheck, RefreshCcw, Compass, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TermsAndConditionsModal } from '@/components/matching/TermsAndConditionsModal';
import { useMatchingSocket } from '@/hooks/useMatchingSocket';
import { MatchNotificationToast } from '@/components/matching/MatchNotificationToast';
import { cn } from '@/lib/utils';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';

const SwipeCard: React.FC<{
    candidate: any;
    onSwipe: (direction: 'left' | 'right' | 'up') => void;
    isActive: boolean;
}> = ({ candidate, onSwipe, isActive }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const heartOpacity = useTransform(x, [50, 150], [0, 1]);
    const xOpacity = useTransform(x, [-50, -150], [0, 1]);
    const starOpacity = useTransform(y, [-50, -150], [0, 1]);

    const [imgIndex, setImgIndex] = useState(0);
    const photos = candidate.photos?.length > 0 ? candidate.photos : [candidate.userId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.userId?._id}`];

    const handleDragEnd = (_: any, info: any) => {
        if (!isActive) return;
        if (info.offset.x > 100) onSwipe('right');
        else if (info.offset.x < -100) onSwipe('left');
        else if (info.offset.y < -100) onSwipe('up');
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImgIndex(prev => (prev < photos.length - 1 ? prev + 1 : prev));
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImgIndex(prev => (prev > 0 ? prev - 1 : prev));
    };

    return (
        <motion.div
            style={{ x, y, rotate, opacity, zIndex: isActive ? 10 : 0 }}
            drag={isActive ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            className={cn(
                "w-full h-full cursor-grab active:cursor-grabbing transition-all duration-500",
                !isActive && "scale-95 opacity-50 blur-[1px]"
            )}
        >
            <Card className="w-full h-full overflow-hidden shadow-2xl border-none relative bg-white flex flex-col rounded-3xl">
                <div className="h-3/4 relative group">
                    {/* Multi-image indicators */}
                    {photos.length > 1 && (
                        <div className="absolute top-4 left-4 right-4 z-30 flex gap-1.5">
                            {photos.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 flex-1 rounded-full transition-all duration-300",
                                        i === imgIndex ? "bg-white shadow-sm" : "bg-white/30"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.img
                            key={imgIndex}
                            src={photos[imgIndex]}
                            alt={`${candidate.userId?.fullName} - Image ${imgIndex + 1}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full object-cover pointer-events-none select-none"
                        />
                    </AnimatePresence>

                    {/* Image Navigation Controls */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className={cn(
                                    "absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100",
                                    imgIndex === 0 && "cursor-not-allowed opacity-0 group-hover:opacity-30"
                                )}
                                disabled={imgIndex === 0}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextImage}
                                className={cn(
                                    "absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 text-white backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100",
                                    imgIndex === photos.length - 1 && "cursor-not-allowed opacity-0 group-hover:opacity-30"
                                )}
                                disabled={imgIndex === photos.length - 1}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Visual Feedbacks */}
                    <motion.div style={{ opacity: heartOpacity }} className="absolute top-12 left-10 z-20 border-4 border-green-500 rounded-xl p-2 rotate-[-15deg] pointer-events-none">
                        <span className="text-green-500 text-4xl font-black uppercase">LIKE</span>
                    </motion.div>
                    <motion.div style={{ opacity: xOpacity }} className="absolute top-12 right-10 z-20 border-4 border-red-500 rounded-xl p-2 rotate-[15deg] pointer-events-none">
                        <span className="text-red-500 text-4xl font-black uppercase">NOPE</span>
                    </motion.div>
                    <motion.div style={{ opacity: starOpacity }} className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 border-4 border-blue-500 rounded-xl p-2 pointer-events-none">
                        <span className="text-blue-500 text-3xl font-black uppercase">SUPER LIKE</span>
                    </motion.div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute bottom-8 left-8 right-8 text-white space-y-2 pointer-events-none">
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-bold">{candidate.userId?.fullName}, {candidate.age || '??'}</h2>
                            {candidate.userId?.isVerified && <ShieldCheck className="text-blue-400 fill-blue-400/20" size={24} />}
                        </div>
                        <div className="flex items-center gap-2 text-slate-200">
                            <MapPin size={16} className="text-primary" />
                            <span className="text-sm font-medium">Cách bạn {Math.round(candidate.distance || 0)} km</span>
                        </div>
                    </div>
                </div>

                <CardContent className="p-8 space-y-6 flex-1 bg-white">
                    <div className="flex flex-wrap gap-2">
                        {candidate.sportPreferences?.map((sport: string) => (
                            <Badge key={sport} variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700 capitalize rounded-full text-xs font-semibold">
                                {sport}
                            </Badge>
                        ))}
                        <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary flex items-center gap-1.5 rounded-full text-xs font-semibold bg-primary/5">
                            <Trophy size={14} className="text-yellow-500 fill-yellow-500/20" /> {candidate.skillLevel}
                        </Badge>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-sm">
                        {candidate.bio || "Thành viên này chưa cập nhật phần giới thiệu bản thân."}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const SPORTS_INFO: Record<string, { label: string; icon: string | React.ReactNode }> = {
    all: { label: 'Tất cả', icon: <Compass size={22} className="group-hover:rotate-12 transition-transform" /> },
    football: { label: 'Bóng đá', icon: '⚽' },
    basketball: { label: 'Bóng rổ', icon: '🏀' },
    badminton: { label: 'Cầu lông', icon: '🏸' },
    tennis: { label: 'Quần vợt', icon: '🎾' },
    volleyball: { label: 'Bóng chuyền', icon: '🏐' },
    pickleball: { label: 'Pickleball', icon: '🥒' },
};

const MatchingSwipePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { candidates, loading, profile } = useAppSelector((state) => state.matching);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [activeSport, setActiveSport] = useState<string | null>(null);
    const [api, setApi] = useState<CarouselApi>();

    // Scroll to active sport
    useEffect(() => {
        if (!api || !profile) return;

        let index = 0;
        if (activeSport && activeSport !== 'all') {
            const sportIndex = profile.sportPreferences.findIndex((s: string) => s === activeSport);
            if (sportIndex !== -1) {
                index = sportIndex + 1; // +1 because 'all' is at index 0
            }
        }

        api.scrollTo(index);
    }, [api, activeSport, profile]);

    // WebSocket for real-time match notifications
    const { onMatchCreated } = useMatchingSocket();

    // Listen for match notifications
    useEffect(() => {
        onMatchCreated((data) => {
            const matchedUser = data.match?.user2Id || data.match?.user1Id;
            if (matchedUser) {
                toast.custom(
                    (t) => (
                        <MatchNotificationToast
                            matchedUser={matchedUser}
                            matchId={data.match._id}
                            onDismiss={() => toast.dismiss(t)}
                        />
                    ),
                    {
                        duration: 10000,
                        position: 'top-center',
                    }
                );
            }
        });
    }, [onMatchCreated]);

    useEffect(() => {
        const init = async () => {
            try {
                const prof = await dispatch(fetchMatchProfile()).unwrap();
                if (!prof) {
                    handleNoProfile();
                    return;
                }

                // Initialize active sport
                if (prof.sportPreferences?.length > 0) {
                    const initialSport = prof.sportPreferences[0];
                    setActiveSport(initialSport);
                    fetchCandidatesForSport(initialSport, prof);
                }
            } catch (error) {
                handleNoProfile();
            }
        };
        init();
    }, [dispatch]);

    const fetchCandidatesForSport = (sport: string | null, prof: any) => {
        setCurrentIndex(0);
        dispatch(fetchCandidates({
            sportType: sport === 'all' ? undefined : (sport || undefined),
            maxDistance: prof.location.searchRadius,
            skillLevel: 'any',
            genderPreference: prof.preferredGender
        }));
    };

    const handleNoProfile = () => {
        const hasAgreed = localStorage.getItem('matching_terms_accepted');
        if (hasAgreed) {
            navigate('/matching/profile');
        } else {
            setShowTermsModal(true);
        }
    };

    const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
        const candidate = candidates[currentIndex];
        if (!candidate || !activeSport) return;

        let action: SwipeAction = SwipeAction.PASS;
        if (direction === 'right') action = SwipeAction.LIKE;
        else if (direction === 'left') action = SwipeAction.PASS;
        else if (direction === 'up') action = SwipeAction.SUPER_LIKE;

        try {
            // CRITICAL: Always use activeSport from the search context, NOT the candidate's first sport
            const result = await dispatch(swipeUser({
                targetUserId: candidate.userId?._id,
                action,
                sportType: activeSport === 'all' ? candidate.sportPreferences[0] : activeSport
            })).unwrap();

            if (result.matched) {
                toast.success(`Hợp quá! Bạn đã bắt cặp với ${candidate.userId?.fullName}!`, {
                    description: `Hai bạn đều thích chơi ${SPORTS_INFO[activeSport]?.label || activeSport}. Hãy nhắn tin ngay nhé!`,
                    action: {
                        label: 'Nhắn tin',
                        onClick: () => navigate(`/matching/matches/${result.match?._id}`)
                    }
                });
            }
        } catch (error: any) {
            toast.error(error || 'Có lỗi xảy ra');
        }

        setCurrentIndex(prev => prev + 1);
    };

    const handleSportChange = (sport: string) => {
        if (sport === activeSport || !profile) return;
        setActiveSport(sport);
        fetchCandidatesForSport(sport, profile);
    };

    if (loading && candidates.length === 0 && !showTermsModal) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-xl font-medium text-slate-600">Đang tìm kiếm cộng sự phù hợp cho bạn...</p>
                </div>
            </div>
        );
    }

    const currentCandidate = candidates[currentIndex];

    return (
        <div className="flex flex-col items-center justify-center py-8">
            <TermsAndConditionsModal
                isOpen={showTermsModal}
                onAgree={() => {
                    localStorage.setItem('matching_terms_accepted', 'true');
                    navigate('/matching/profile');
                }}
                onDecline={() => navigate('/user-dashboard')}
            />

            {/* Sport Selector */}
            {profile && (
                <div className="w-full max-w-xl mx-auto mb-10 px-12">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "center",
                            dragFree: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2">
                            <CarouselItem className="pl-2 basis-1/4 sm:basis-1/5">
                                <button
                                    onClick={() => handleSportChange('all')}
                                    className={cn(
                                        "group flex flex-col items-center gap-2 w-full transition-all",
                                        activeSport === 'all' || activeSport === null ? "opacity-100 scale-105" : "opacity-50 hover:opacity-80"
                                    )}
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                                        activeSport === 'all' || activeSport === null ? "bg-primary text-white shadow-primary/30 ring-4 ring-primary/10" : "bg-white text-slate-400 border border-slate-200"
                                    )}>
                                        {SPORTS_INFO['all'].icon}
                                    </div>
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", activeSport === 'all' || activeSport === null ? "text-primary" : "text-slate-500")}>
                                        {SPORTS_INFO['all'].label}
                                    </span>
                                </button>
                            </CarouselItem>

                            {profile.sportPreferences?.map((sport: string) => (
                                <CarouselItem key={sport} className="pl-2 basis-1/4 sm:basis-1/5">
                                    <button
                                        onClick={() => handleSportChange(sport)}
                                        className={cn(
                                            "group flex flex-col items-center gap-2 w-full transition-all",
                                            activeSport === sport ? "opacity-100 scale-105" : "opacity-50 hover:opacity-80"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all shadow-sm",
                                            activeSport === sport ? "bg-primary text-white shadow-primary/30 ring-4 ring-primary/10" : "bg-white border border-slate-200"
                                        )}>
                                            {SPORTS_INFO[sport]?.icon || '🎾'}
                                        </div>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider text-center truncate w-full", activeSport === sport ? "text-primary" : "text-slate-500")}>
                                            {SPORTS_INFO[sport]?.label || sport}
                                        </span>
                                    </button>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-10 w-9 h-9 border-slate-200 hover:bg-white hover:text-primary" />
                        <CarouselNext className="-right-10 w-9 h-9 border-slate-200 hover:bg-white hover:text-primary" />
                    </Carousel>
                </div>
            )}

            <div className="w-full max-w-md h-[650px] relative">
                <div
                    className="w-full h-full overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth pb-20"
                    onScroll={(e) => {
                        const target = e.currentTarget;
                        const scrollY = target.scrollTop;
                        const height = target.clientHeight;
                        const newIndex = Math.round(scrollY / height);
                        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < candidates.length) {
                            setCurrentIndex(newIndex);
                        }
                    }}
                >
                    <AnimatePresence>
                        {candidates.length > 0 ? (
                            candidates.map((candidate, index) => (
                                <div
                                    key={candidate.userId?._id}
                                    className="w-full h-full snap-start snap-always py-4 flex items-center justify-center shrink-0"
                                >
                                    <SwipeCard
                                        candidate={candidate}
                                        onSwipe={handleSwipe}
                                        isActive={index === currentIndex}
                                    />
                                </div>
                            ))
                        ) : !loading && !showTermsModal && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex items-center justify-center px-4"
                            >
                                <Card className="w-full text-center p-12 space-y-6 shadow-xl border-dashed bg-white/50 backdrop-blur-sm rounded-3xl">
                                    <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                        <RefreshCcw className="text-slate-400 w-12 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-slate-800">Không còn ai quanh đây!</h3>
                                        <p className="text-slate-500">
                                            Thử mở rộng bán kính tìm kiếm hoặc thay đổi môn thể thao ưa thích trong hồ sơ của bạn.
                                        </p>
                                    </div>
                                    <div className="space-y-3 pt-4">
                                        <Button onClick={() => navigate('/matching/profile')} variant="outline" className="w-full py-6 rounded-2xl font-bold">
                                            Chỉnh sửa hồ sơ
                                        </Button>
                                        <Button onClick={() => window.location.reload()} className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20">
                                            Tải lại trang
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Controls */}
            {currentCandidate && !showTermsModal && (
                <div className="flex items-center gap-6 mt-8">
                    <Button
                        onClick={() => handleSwipe('left')}
                        variant="ghost"
                        className="w-16 h-16 rounded-full shadow-lg bg-white hover:bg-red-50 text-red-500 border-2 border-slate-100 hover:border-red-200"
                    >
                        <X size={32} />
                    </Button>
                    <Button
                        onClick={() => handleSwipe('up')}
                        variant="ghost"
                        className="w-14 h-14 rounded-full shadow-lg bg-white hover:bg-blue-50 text-blue-500 border-2 border-slate-100 hover:border-blue-200"
                    >
                        <Star size={24} />
                    </Button>
                    <Button
                        onClick={() => handleSwipe('right')}
                        variant="ghost"
                        className="w-16 h-16 rounded-full shadow-lg bg-white hover:bg-green-50 text-green-500 border-2 border-slate-100 hover:border-green-200"
                    >
                        <Heart size={32} fill="currentColor" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MatchingSwipePage;
