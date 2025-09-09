"use client";
import { useState, useEffect } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Star,
  TrendingUp,
  MapPin,
  User,
  Heart,
  Share2,
  MessageCircle,
  ChevronRight,
  Flame,
  Activity,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useLocation } from "react-router-dom";
import axiosPublic from "../../utils/axios/axiosPublic";


export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tab, setTab] = useState<'fields'|'coaches'>('fields');
  type FieldItem = { id:string; name:string; sportType:string; description:string; location:string; images:string[]; pricePerHour:number; rating:number; totalReviews:number };
  type CoachItem = { id:string; fullName:string; avatarUrl?:string; sports:string[]; bio:string; hourlyRate:number; isVerified:boolean; rating:number; totalReviews:number };
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [sport, setSport] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [animatedStats, setAnimatedStats] = useState({
    players: 0,
    games: 0,
    tournaments: 0,
    countries: 0,
  });

  const heroSlides = [
    {
      title: "Master Your Game",
      subtitle: "Professional coaching for badminton and pickleball",
      image: "/badminton-player-action.png",
      cta: "Start Training",
    },
    {
      title: "Join Tournaments",
      subtitle: "Compete with players worldwide",
      image: "/pickleball-tournament-crowd.png",
      cta: "View Tournaments",
    },
    {
      title: "Track Progress",
      subtitle: "Advanced analytics for your performance",
      image: "/placeholder-211tk.png",
      cta: "See Analytics",
    },
  ];

  const newsArticles = [
    {
      id: 1,
      title:
        "World Badminton Championship 2024: Stunning Upsets and Record-Breaking Performances",
      excerpt:
        "The latest championship saw incredible matches with new world records set in multiple categories. Young talents emerge as future stars.",
      image: "/badminton-championship-trophy.png",
      category: "Badminton",
      date: "2 hours ago",
      author: "Sarah Chen",
      likes: 234,
      comments: 45,
      trending: true,
    },
    {
      id: 2,
      title:
        "Pickleball Popularity Soars: 50% Growth in Professional Players This Year",
      excerpt:
        "The fastest-growing sport continues its meteoric rise with new professional leagues forming across continents.",
      image: "/pickleball-professional-match.png",
      category: "Pickleball",
      date: "5 hours ago",
      author: "Mike Rodriguez",
      likes: 189,
      comments: 32,
      trending: true,
    },
    {
      id: 3,
      title:
        "Revolutionary Training Techniques: AI-Powered Coaching Changes Everything",
      excerpt:
        "New artificial intelligence systems are helping players improve their game with personalized training programs.",
      image: "/placeholder-fs2k4.png",
      category: "Technology",
      date: "1 day ago",
      author: "Dr. Emily Watson",
      likes: 156,
      comments: 28,
      trending: false,
    },
    {
      id: 4,
      title: "Olympic Preparation: Top Athletes Share Their Training Secrets",
      excerpt:
        "Exclusive interviews with Olympic hopefuls reveal the dedication and strategies behind their success.",
      image: "/olympic-badminton-training.png",
      category: "Olympics",
      date: "1 day ago",
      author: "James Park",
      likes: 298,
      comments: 67,
      trending: false,
    },
    {
      id: 5,
      title:
        "Youth Development Programs Show Remarkable Results Across 15 Countries",
      excerpt:
        "International youth programs are producing the next generation of world-class athletes with innovative training methods.",
      image: "/youth-badminton-training.png",
      category: "Youth Sports",
      date: "2 days ago",
      author: "Lisa Thompson",
      likes: 145,
      comments: 23,
      trending: false,
    },
    {
      id: 6,
      title:
        "Equipment Innovation: New Racquet Technology Approved for Professional Play",
      excerpt:
        "Latest carbon fiber innovations promise to revolutionize how professional players approach their game strategy.",
      image: "/modern-badminton-racquet.png",
      category: "Equipment",
      date: "3 days ago",
      author: "Alex Kumar",
      likes: 112,
      comments: 19,
      trending: false,
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "International Badminton Masters",
      date: "Dec 15-18, 2024",
      location: "Tokyo, Japan",
      prize: "$500,000",
      participants: 128,
      image: "/badminton-tournament.png",
    },
    {
      id: 2,
      title: "Pickleball World Cup",
      date: "Jan 8-12, 2025",
      location: "Miami, USA",
      prize: "$300,000",
      participants: 256,
      image: "/placeholder.svg?height=150&width=200",
    },
    {
      id: 3,
      title: "Asian Championship Series",
      date: "Feb 20-25, 2025",
      location: "Singapore",
      prize: "$200,000",
      participants: 96,
      image: "/placeholder.svg?height=150&width=200",
    },
  ];

  // Auto-slide hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Animate stats on mount
  useEffect(() => {
    const targets = {
      players: 50000,
      games: 1000000,
      tournaments: 500,
      countries: 24,
    };
    const duration = 2000;
    const steps = 60;
    const increment = {
      players: targets.players / steps,
      games: targets.games / steps,
      tournaments: targets.tournaments / steps,
      countries: targets.countries / steps,
    };
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setAnimatedStats({
        players: Math.min(
          Math.floor(increment.players * step),
          targets.players
        ),
        games: Math.min(Math.floor(increment.games * step), targets.games),
        tournaments: Math.min(
          Math.floor(increment.tournaments * step),
          targets.tournaments
        ),
        countries: Math.min(
          Math.floor(increment.countries * step),
          targets.countries
        ),
      });
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for JWT in localStorage (or cookie if you use cookies)
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  // Sync tab with query param
  useEffect(() => {
    const url = new URL(window.location.href);
    const t = url.searchParams.get('tab');
    setTab(t === 'coaches' ? 'coaches' : 'fields');
  }, [location.search]);

  // Fetch browse data based on tab and filters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'fields') {
          const params = new URLSearchParams();
          if (q) params.set('name', q);
          if (sport) params.set('sportType', sport);
          if (locationFilter) params.set('location', locationFilter);
          const res = await axiosPublic.get(`/fields?${params.toString()}`);
          setFields(res.data || []);
        } else {
          const params = new URLSearchParams();
          if (q) params.set('name', q);
          if (sport) params.set('sportType', sport);
          if (minRate) params.set('minRate', minRate);
          if (maxRate) params.set('maxRate', maxRate);
          const res = await axiosPublic.get(`/coaches?${params.toString()}`);
          setCoaches(res.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tab, q, sport, locationFilter, minRate, maxRate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <div className="home-page">
      {/* Animated Background Elements */}
      <div className="floating-elements">
        <div className="floating-ball ball-1"></div>
        <div className="floating-ball ball-2"></div>
        <div className="floating-ball ball-3"></div>
        <div className="floating-ball ball-4"></div>
        <div className="floating-ball ball-5"></div>
        <div className="floating-ball ball-6"></div>
        <div className="floating-racket racket-1">🏸</div>
        <div className="floating-racket racket-2">🏓</div>
        <div className="floating-racket racket-3">🎾</div>
        <div className="floating-racket racket-4">🏸</div>
        <div className="floating-racket racket-5">🏓</div>
        <div className="floating-racket racket-6">🎾</div>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="navbar-brand">
              <Trophy className="brand-icon" size={32} />
              <span className="brand-text">SportZone</span>
            </div>
            <div className="navbar-menu">
              <a href="#" className="nav-link active">
                Home
              </a>
              <a href="#" className="nav-link">
                News
              </a>
              <a href="#" className="nav-link">
                Tournaments
              </a>
              <a href="#" className="nav-link">
                Training
              </a>
              <a href="#" className="nav-link">
                Community
              </a>

              {isLoggedIn && (
                <a
                  className="nav-link"
                  onClick={() => navigate("/profile")}
                  style={{ cursor: "pointer" }}
                >
                  Profile
                </a>
              )}

              {isLoggedIn ? (
                <Button className="nav-cta-btn" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <Button
                  className="nav-cta-btn"
                  onClick={() => navigate("/login")}
                >
                  Join Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="hero-section">
        <div className="hero-carousel">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
            >
              <div className="hero-background">
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  className="hero-image"
                />
                <div className="hero-overlay"></div>
              </div>
              <div className="hero-container">
                <div className="hero-content">
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <Button className="hero-cta">
                    {slide.cta} <ArrowRight size={20} className="ms-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="hero-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <div className="stat-number">
                {formatNumber(animatedStats.players)}+
              </div>
              <div className="stat-label">Active Players</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Activity size={32} />
              </div>
              <div className="stat-number">
                {formatNumber(animatedStats.games)}+
              </div>
              <div className="stat-label">Games Played</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Trophy size={32} />
              </div>
              <div className="stat-number">{animatedStats.tournaments}+</div>
              <div className="stat-label">Tournaments</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <MapPin size={32} />
              </div>
              <div className="stat-number">{animatedStats.countries}+</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Section (Fields/Coaches tabs) */}
      <section id="browse" className="browse-section">
        <div className="browse-container">
          <div className="browse-header">
            <div className="tabs">
              <button className={`tab ${tab==='fields'?'active':''}`} onClick={()=>{navigate('/?tab=fields#browse'); setTab('fields')}}>Fields</button>
              <button className={`tab ${tab==='coaches'?'active':''}`} onClick={()=>{navigate('/?tab=coaches#browse'); setTab('coaches')}}>Coaches</button>
            </div>
            <div className="filters">
              <input className="filter-input" placeholder={tab==='fields'? 'Search field name' : 'Search coach name'} value={q} onChange={(e)=>setQ(e.target.value)} />
              <select className="filter-select" value={sport} onChange={(e)=>setSport(e.target.value)}>
                <option value="">All sports</option>
                <option value="football">football</option>
                <option value="tennis">tennis</option>
                <option value="badminton">badminton</option>
                <option value="pickleball">pickleball</option>
                <option value="basketball">basketball</option>
                <option value="volleyball">volleyball</option>
                <option value="swimming">swimming</option>
                <option value="gym">gym</option>
              </select>
              {tab==='fields' ? (
                <input className="filter-input" placeholder="Location" value={locationFilter} onChange={(e)=>setLocationFilter(e.target.value)} />
              ) : (
                <>
                  <input type="number" className="filter-input small" placeholder="Min $/h" value={minRate} onChange={(e)=>setMinRate(e.target.value)} />
                  <input type="number" className="filter-input small" placeholder="Max $/h" value={maxRate} onChange={(e)=>setMaxRate(e.target.value)} />
                </>
              )}
            </div>
          </div>
          <div className="browse-grid">
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : tab==='fields' ? (
              fields.length? fields.map((f:FieldItem)=>(
                <div key={f.id} className="browse-card">
                  <div className="thumb"><img src={f.images?.[0] || '/placeholder.svg'} alt={f.name}/></div>
                  <div className="content">
                    <div className="title-row"><h5>{f.name}</h5><span className="badge text-capitalize">{f.sportType}</span></div>
                    <div className="muted">{f.location}</div>
                    <div className="muted truncate" title={f.description}>{f.description}</div>
                    <div className="meta"><span className="price">${f.pricePerHour}/h</span><span className="muted">⭐ {f.rating} ({f.totalReviews})</span></div>
                  </div>
                </div>
              )) : <div className="text-center py-5">No fields found</div>
            ) : (
              coaches.length? coaches.map((c:CoachItem)=>(
                <div key={c.id} className="browse-card">
                  <div className="coach-head">
                    <img className="avatar" src={c.avatarUrl || '/default-avatar.png'} alt={c.fullName}/>
                    <div>
                      <h5 className="mb-1">{c.fullName}</h5>
                      <div className="muted">⭐ {c.rating} ({c.totalReviews})</div>
                    </div>
                  </div>
                  <div className="content">
                    <div className="chips">{c.sports?.map((s:string)=>(<span key={s} className="chip text-capitalize">{s}</span>))}</div>
                    <div className="truncate" title={c.bio}>{c.bio}</div>
                    <div className="meta"><span className="price">${c.hourlyRate}/h</span>{c.isVerified && <span className="ok">Verified</span>}</div>
                  </div>
                </div>
              )) : <div className="text-center py-5">No coaches found</div>
            )}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="news-section">
        <div className="news-container">
          <div className="section-header">
            <h2 className="section-title">
              <Flame className="section-icon" size={32} />
              Latest Sports News
            </h2>
            <p className="section-subtitle">
              Stay updated with the latest in badminton, pickleball, and racquet
              sports
            </p>
          </div>

          <div className="news-layout">
            {/* Featured News */}
            <div className="featured-section">
              <div className="featured-news">
                <Card className="featured-card">
                  <div className="featured-image-container">
                    <img
                      src={newsArticles[0].image || "/placeholder.svg"}
                      alt={newsArticles[0].title}
                      className="featured-image"
                    />
                    <div className="featured-overlay">
                      <Badge className="trending-badge">
                        <TrendingUp size={14} className="me-1" />
                        Trending
                      </Badge>
                      <Badge className="category-badge">
                        {newsArticles[0].category}
                      </Badge>
                    </div>
                  </div>
                  <Card.Body className="featured-body">
                    <h3 className="featured-title">{newsArticles[0].title}</h3>
                    <p className="featured-excerpt">
                      {newsArticles[0].excerpt}
                    </p>
                    <div className="featured-meta">
                      <div className="author-info">
                        <User size={16} />
                        <span>{newsArticles[0].author}</span>
                        <Clock size={16} className="ms-3" />
                        <span>{newsArticles[0].date}</span>
                      </div>
                      <div className="engagement-stats">
                        <span className="stat">
                          <Heart size={16} />
                          {newsArticles[0].likes}
                        </span>
                        <span className="stat">
                          <MessageCircle size={16} />
                          {newsArticles[0].comments}
                        </span>
                        <Button variant="link" className="share-btn">
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* News Grid */}
              <div className="news-grid">
                {newsArticles.slice(1, 5).map((article) => (
                  <div key={article.id} className="news-item">
                    <Card className="news-card">
                      <div className="news-image-container">
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="news-image"
                        />
                        {article.trending && (
                          <Badge className="trending-badge-small">
                            <Flame size={12} />
                          </Badge>
                        )}
                        <Badge className="category-badge-small">
                          {article.category}
                        </Badge>
                      </div>
                      <Card.Body className="news-body">
                        <h5 className="news-title">{article.title}</h5>
                        <p className="news-excerpt">{article.excerpt}</p>
                        <div className="news-meta">
                          <div className="news-author">
                            <User size={14} />
                            <span>{article.author}</span>
                          </div>
                          <div className="news-stats">
                            <span>
                              <Heart size={14} />
                              {article.likes}
                            </span>
                            <span>
                              <MessageCircle size={14} />
                              {article.comments}
                            </span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="sidebar">
              {/* Upcoming Events */}
              <Card className="sidebar-card">
                <Card.Header className="sidebar-header">
                  <h4>
                    <Calendar size={20} className="me-2" />
                    Upcoming Events
                  </h4>
                </Card.Header>
                <Card.Body className="sidebar-body">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="event-item">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.title}
                        className="event-image"
                      />
                      <div className="event-content">
                        <h6 className="event-title">{event.title}</h6>
                        <div className="event-details">
                          <div className="event-detail">
                            <Calendar size={14} />
                            <span>{event.date}</span>
                          </div>
                          <div className="event-detail">
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </div>
                          <div className="event-detail">
                            <Trophy size={14} />
                            <span>{event.prize}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="event-arrow" />
                    </div>
                  ))}
                </Card.Body>
              </Card>

              {/* Top Players */}
              <Card className="sidebar-card">
                <Card.Header className="sidebar-header">
                  <h4>
                    <Star size={20} className="me-2" />
                    Top Players
                  </h4>
                </Card.Header>
                <Card.Body className="sidebar-body">
                  {[
                    {
                      name: "Chen Wei",
                      sport: "Badminton",
                      rank: 1,
                      points: 98500,
                    },
                    {
                      name: "Maria Santos",
                      sport: "Pickleball",
                      rank: 2,
                      points: 95200,
                    },
                    {
                      name: "Yuki Tanaka",
                      sport: "Badminton",
                      rank: 3,
                      points: 92800,
                    },
                    {
                      name: "Alex Johnson",
                      sport: "Pickleball",
                      rank: 4,
                      points: 89600,
                    },
                  ].map((player, index) => (
                    <div key={index} className="player-item">
                      <div className="player-rank">#{player.rank}</div>
                      <div className="player-info">
                        <h6 className="player-name">{player.name}</h6>
                        <span className="player-sport">{player.sport}</span>
                      </div>
                      <div className="player-points">
                        {player.points.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Elevate Your Game?</h2>
            <p className="cta-subtitle">
              Join thousands of athletes training with SportZone
            </p>
            <div className="cta-buttons">
              <Button className="cta-primary">Start Free Trial</Button>
              <Button variant="outline-light" className="cta-secondary">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Global Resets */
        :global(body) {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden;
        }
        :global(html) {
          margin: 0 !important;
          padding: 0 !important;
        }

        .home-page {
          min-height: 100vh;
          width: 100vw;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        /* Floating Elements */
        .floating-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-ball {
          position: absolute;
          border-radius: 50%;
          opacity: 0.05;
          animation: float 20s ease-in-out infinite;
        }

        .ball-1 {
          width: 100px;
          height: 100px;
          background: #ff6b6b;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }
        .ball-2 {
          width: 80px;
          height: 80px;
          background: #4ecdc4;
          top: 20%;
          right: 10%;
          animation-delay: 3s;
        }
        .ball-3 {
          width: 120px;
          height: 120px;
          background: #45b7d1;
          bottom: 15%;
          left: 8%;
          animation-delay: 6s;
        }
        .ball-4 {
          width: 90px;
          height: 90px;
          background: #96ceb4;
          top: 60%;
          left: 15%;
          animation-delay: 9s;
        }
        .ball-5 {
          width: 110px;
          height: 110px;
          background: #feca57;
          bottom: 25%;
          right: 8%;
          animation-delay: 12s;
        }
        .ball-6 {
          width: 70px;
          height: 70px;
          background: #ff9ff3;
          top: 40%;
          right: 20%;
          animation-delay: 15s;
        }

        .floating-racket {
          position: absolute;
          font-size: 4rem;
          opacity: 0.03;
          animation: rotate 40s linear infinite;
        }

        .racket-1 {
          top: 15%;
          left: 20%;
          animation-delay: 0s;
        }
        .racket-2 {
          bottom: 20%;
          right: 25%;
          animation-delay: 8s;
        }
        .racket-3 {
          top: 50%;
          left: 10%;
          animation-delay: 16s;
        }
        .racket-4 {
          top: 30%;
          right: 30%;
          animation-delay: 24s;
        }
        .racket-5 {
          bottom: 40%;
          left: 30%;
          animation-delay: 32s;
        }
        .racket-6 {
          top: 70%;
          right: 15%;
          animation-delay: 40s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-30px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(20px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translateY(-15px) rotate(270deg) scale(1.05);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100vw;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          z-index: 1000;
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .navbar-container {
          width: 100%;
          padding: 0 2rem;
        }

        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.5rem;
          font-weight: 800;
          color: #667eea;
        }

        .brand-icon {
          color: #ffd700;
          filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
        }

        .navbar-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link:hover,
        .nav-link.active {
          color: #667eea;
        }

        .nav-link.active::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 2px;
          background: #667eea;
          border-radius: 1px;
        }

        .nav-cta-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .nav-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          margin-top: 80px;
        }

        .hero-carousel {
          position: relative;
          height: 100%;
          width: 100%;
        }

        .hero-slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1s ease-in-out;
          display: flex;
          align-items: center;
        }

        .hero-slide.active {
          opacity: 1;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(102, 126, 234, 0.8),
            rgba(118, 75, 162, 0.8)
          );
        }

        .hero-container {
          width: 100%;
          padding: 0 2rem;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          color: white;
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          animation: slideInUp 1s ease-out;
        }

        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          animation: slideInUp 1s ease-out 0.2s both;
        }

        .hero-cta {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid white;
          color: white;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          animation: slideInUp 1s ease-out 0.4s both;
        }

        .hero-cta:hover {
          background: white;
          color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        .hero-indicators {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 1rem;
          z-index: 3;
        }

        .indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: white;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Stats Section */
        .stats-section {
          padding: 4rem 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          position: relative;
          z-index: 2;
          width: 100vw;
        }

        .stats-container {
          width: 100%;
          padding: 0 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .stat-card {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease-out;
        }

        .stat-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          color: #667eea;
          margin-bottom: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 800;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: #666;
          font-weight: 500;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* News Section */
        .browse-section { background: rgba(255,255,255,0.98); position: relative; z-index:2; width:100vw; padding: 3rem 0 2rem; border-top: 1px solid #eef0ff; }
        .browse-container { width:100%; padding: 0 2rem; max-width: 1400px; margin: 0 auto; }
        .browse-header { display:flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .tabs { display:flex; gap:.5rem; background:#f1f3ff; padding:.35rem; border-radius: 999px; }
        .tab { border:none; background:transparent; padding:.5rem 1rem; border-radius:999px; font-weight:600; color:#667eea; cursor:pointer; }
        .tab.active { background:white; box-shadow: 0 4px 14px rgba(102,126,234,.25); }
        .filters { display:flex; gap:.5rem; align-items:center; }
        .filter-input { background:#fff; color:#000; border:1px solid #eaeaff; border-radius:10px; padding:.5rem .75rem; min-width: 200px; }
        .filter-input.small{ min-width:120px }
        .filter-select { background:#fff; color:#000; border:1px solid #eaeaff; border-radius:10px; padding:.5rem .75rem; }
        .browse-grid { display:grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap:1rem; }
        .browse-card { background:#fff; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); overflow:hidden; transition:.2s; }
        .browse-card:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(0,0,0,.12); }
        .thumb { aspect-ratio: 16/9; width:100%; overflow:hidden; background:#f4f6ff }
        .thumb img{ width:100%; height:100%; object-fit:cover }
        .content{ padding: .75rem .9rem 1rem }
        .title-row{ display:flex; justify-content:space-between; align-items:center }
        .badge{ background: linear-gradient(135deg,#667eea,#764ba2); color:#fff; padding:.2rem .6rem; border-radius: 999px; font-size:.75rem }
        .muted{ color:#333; font-size:.9rem }
        .truncate{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
        .meta{ display:flex; justify-content:space-between; align-items:center; margin-top:.5rem }
        .price{ font-weight:700; color:#111 }
        .coach-head{ display:flex; align-items:center; gap:.75rem; padding:.75rem .9rem 0 }
        .avatar{ width:56px; height:56px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,.1) }
        .chips{ display:flex; flex-wrap:wrap; gap:.35rem; margin:.25rem 0 }
        .chip{ background:#f1f3ff; border-radius:999px; padding:.2rem .5rem; font-size:.75rem }
        .ok{ background:#22c55e; color:#fff; padding:.15rem .5rem; border-radius:999px; font-size:.75rem }

        .news-section {
          padding: 4rem 0;
          background: rgba(255, 255, 255, 0.98);
          position: relative;
          z-index: 2;
          width: 100vw;
        }

        .news-container {
          width: 100%;
          padding: 0 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #333;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .section-icon {
          color: #ff6b6b;
          animation: bounce 2s ease-in-out infinite;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .news-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 3rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .featured-section {
          width: 100%;
        }

        /* Featured News */
        .featured-news {
          margin-bottom: 3rem;
        }

        .featured-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .featured-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .featured-image-container {
          position: relative;
          height: 300px;
          overflow: hidden;
        }

        .featured-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .featured-card:hover .featured-image {
          transform: scale(1.05);
        }

        .featured-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          gap: 0.5rem;
        }

        .trending-badge {
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
        }

        .category-badge {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
        }

        .featured-body {
          padding: 2rem;
        }

        .featured-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .featured-excerpt {
          font-size: 1.1rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .featured-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .engagement-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #666;
          font-size: 0.9rem;
        }

        .share-btn {
          color: #666;
          padding: 0.25rem;
          transition: color 0.3s ease;
        }

        .share-btn:hover {
          color: #667eea;
        }

        /* News Grid */
        .news-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .news-item {
          width: 100%;
        }

        .news-card {
          border: none;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
        }

        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
        }

        .news-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .news-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .news-card:hover .news-image {
          transform: scale(1.05);
        }

        .trending-badge-small {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
          border: none;
          padding: 0.25rem 0.5rem;
          border-radius: 15px;
          font-size: 0.8rem;
        }

        .category-badge-small {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          border: none;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .news-body {
          padding: 1.5rem;
        }

        .news-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .news-excerpt {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .news-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .news-author {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #666;
          font-size: 0.8rem;
        }

        .news-stats {
          display: flex;
          gap: 0.75rem;
        }

        .news-stats span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #666;
          font-size: 0.8rem;
        }

        /* Sidebar */
        .sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .sidebar-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .sidebar-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
        }

        .sidebar-header h4 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .sidebar-body {
          padding: 0;
        }

        /* Event Items */
        .event-item {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .event-item:hover {
          background: #f8f9fa;
        }

        .event-item:last-child {
          border-bottom: none;
        }

        .event-image {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
          margin-right: 1rem;
        }

        .event-content {
          flex: 1;
        }

        .event-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .event-detail {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          color: #666;
        }

        .event-arrow {
          color: #ccc;
          transition: all 0.3s ease;
        }

        .event-item:hover .event-arrow {
          color: #667eea;
          transform: translateX(3px);
        }

        /* Player Items */
        .player-item {
          display: flex;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.3s ease;
        }

        .player-item:hover {
          background: #f8f9fa;
        }

        .player-item:last-child {
          border-bottom: none;
        }

        .player-rank {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
          margin-right: 1rem;
        }

        .player-info {
          flex: 1;
        }

        .player-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .player-sport {
          font-size: 0.8rem;
          color: #666;
        }

        .player-points {
          font-size: 0.9rem;
          font-weight: 600;
          color: #667eea;
        }

        /* CTA Section */
        .cta-section {
          padding: 4rem 0;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          text-align: center;
          position: relative;
          z-index: 2;
          width: 100vw;
        }

        .cta-container {
          width: 100%;
          padding: 0 2rem;
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .cta-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-primary {
          background: white;
          color: #667eea;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          background: #f8f9fa;
        }

        .cta-secondary {
          border: 2px solid white;
          color: white;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .cta-secondary:hover {
          background: white;
          color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .news-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .sidebar {
            position: static;
            margin-top: 0;
          }
        }

        @media (max-width: 991px) {
          .navbar-menu {
            display: none;
          }
          
          .hero-title {
            font-size: 3rem;
          }
          
          .navbar-container {
            padding: 0 1rem;
          }
          
          .hero-container {
            padding: 0 1rem;
          }
          
          .stats-container {
            padding: 0 1rem;
          }
          
          .news-container {
            padding: 0 1rem;
          }
          
          .cta-container {
            padding: 0 1rem;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.2rem;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .featured-title {
            font-size: 1.5rem;
          }
          
          .cta-title {
            font-size: 2rem;
          }
          
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .cta-primary,
          .cta-secondary {
            width: 100%;
            max-width: 300px;
          }
          
          .news-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .stats-section {
            padding: 2rem 0;
          }
          
          .stat-number {
            font-size: 2rem;
          }
          
          .news-section {
            padding: 2rem 0;
          }
          
          .featured-body {
            padding: 1.5rem;
          }
          
          .news-body {
            padding: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
