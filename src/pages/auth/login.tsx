import type React from "react"
import { useState } from "react"
import { Eye, Slash as EyeSlash, Mail, Lock, Trophy, Zap, Play, Users, Award, Target } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowAlert(false)
    try {
      // Replace with your API call
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("access_token", data.access_token)
        setIsLoading(false)
        navigate("/")
      } else {
        throw new Error("Login failed")
      }
    } catch (err: any) {
      setIsLoading(false)
      setShowAlert(false)
      alert(err.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen w-screen m-0 p-0 overflow-x-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
      {/* Full Width Purple Background */}
      <div className="relative min-h-screen w-screen m-0 p-0 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
          {/* Floating Balls */}
          <div className="absolute w-32 h-32 rounded-full bg-red-400 opacity-10 top-[5%] left-[5%] animate-float"></div>
          <div className="absolute w-32 h-32 rounded-full bg-teal-400 opacity-10 top-[15%] right-[8%] animate-float-delayed-3">🏸</div>
          <div className="absolute w-32 h-32 rounded-full bg-blue-400 opacity-10 bottom-[10%] left-[10%] animate-float-delayed-6">🏓</div>
          <div className="absolute w-32 h-32 rounded-full bg-green-400 opacity-10 top-[60%] left-[3%] animate-float-delayed-9">🎾</div>
          <div className="absolute w-32 h-32 rounded-full bg-yellow-400 opacity-10 bottom-[20%] right-[5%] animate-float-delayed-12">🎾</div>
          <div className="absolute w-32 h-32 rounded-full bg-pink-400 opacity-10 top-[40%] right-[15%] animate-float-delayed-15">🎾</div>
        </div>

        <div className="flex min-h-screen">
          {/* Left Side - Sports Content */}
          <div className="hidden lg:flex lg:w-2/3 relative z-20 items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            <div className="relative z-20 text-center text-white max-w-2xl w-full">
              <div className="mb-16">
                {/* Logo and Title */}
                <div className="mb-6">
                  <div className="relative inline-block animate-bounce">
                    <Trophy className="text-yellow-400 drop-shadow-lg" size={50} />
                    <Zap className="absolute -top-1 -right-6 text-red-400 animate-pulse" size={25} />
                  </div>
                </div>
                <h1
                  className="text-5xl font-extrabold mb-6 text-white drop-shadow-2xl animate-glow"
                  style={{ textShadow: "0 4px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,1)" }}
                >
                  SportZone
                </h1>
                <p
                  className="text-lg text-white leading-relaxed mb-8 drop-shadow-lg"
                  style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)" }}
                >
                  Join thousands of athletes mastering badminton, pickleball, and racquet sports
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/50 backdrop-blur-md rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-black/60 hover:shadow-2xl border border-white/30 animate-slide-up">
                    <Play className="text-yellow-400 drop-shadow-sm mx-auto mb-4" size={32} />
                    <h5
                      className="mb-3 font-semibold text-lg text-white drop-shadow-md"
                      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)" }}
                    >
                      Live Coaching
                    </h5>
                    <p
                      className="m-0 text-white leading-relaxed drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Get real-time feedback from professional coaches
                    </p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-black/60 hover:shadow-2xl border border-white/30 animate-slide-up-delayed-1">
                    <Users className="text-yellow-400 drop-shadow-sm mx-auto mb-4" size={32} />
                    <h5
                      className="mb-3 font-semibold text-lg text-white drop-shadow-md"
                      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)" }}
                    >
                      Community
                    </h5>
                    <p
                      className="m-0 text-white leading-relaxed drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Connect with players at your skill level
                    </p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-black/60 hover:shadow-2xl border border-white/30 animate-slide-up-delayed-2">
                    <Award className="text-yellow-400 drop-shadow-sm mx-auto mb-4" size={32} />
                    <h5
                      className="mb-3 font-semibold text-lg text-white drop-shadow-md"
                      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)" }}
                    >
                      Tournaments
                    </h5>
                    <p
                      className="m-0 text-white leading-relaxed drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Compete in local and online competitions
                    </p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:bg-black/60 hover:shadow-2xl border border-white/30 animate-slide-up-delayed-3">
                    <Target className="text-yellow-400 drop-shadow-sm mx-auto mb-4" size={32} />
                    <h5
                      className="mb-3 font-semibold text-lg text-white drop-shadow-md"
                      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,1)" }}
                    >
                      Skill Tracking
                    </h5>
                    <p
                      className="m-0 text-white leading-relaxed drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Monitor your progress with detailed analytics
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-around mt-8">
                  <div className="text-center">
                    <h3 className="text-4xl font-extrabold mb-2 text-yellow-400 drop-shadow-md">50K+</h3>
                    <p
                      className="m-0 text-white text-lg drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Active Players
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-4xl font-extrabold mb-2 text-yellow-400 drop-shadow-md">1M+</h3>
                    <p
                      className="m-0 text-white text-lg drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Games Played
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-4xl font-extrabold mb-2 text-yellow-400 drop-shadow-md">500+</h3>
                    <p
                      className="m-0 text-white text-lg drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Tournaments
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-4xl font-extrabold mb-2 text-yellow-400 drop-shadow-md">24/7</h3>
                    <p
                      className="m-0 text-white text-lg drop-shadow-sm"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9), 0 1px 1px rgba(0,0,0,1)" }}
                    >
                      Support
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/3 relative z-20 flex items-center justify-center">
            <div className="w-full max-w-lg p-6 mr-0 lg:mr-20">
              <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl animate-slide-in-right border border-white/20">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Sign in to continue your sports journey</p>
                </div>

                {/* Alert */}
                {showAlert && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-green-50 border-l-4 border-green-500 rounded-2xl animate-slide-down">
                    <div className="flex items-center">
                      <Trophy size={20} className="mr-2 text-green-600" />
                      <span className="text-green-800">Welcome back, Champion! 🏆</span>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                    <div className="relative">
                      <Mail
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
                        size={20}
                      />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-12 h-12 border-2 border-gray-200 rounded-2xl transition-all duration-300 bg-white/90 text-sm focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/25 focus:bg-white focus:-translate-y-0.5 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">Password</label>
                    <div className="relative">
                      <Lock
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10"
                        size={20}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-12 h-12 border-2 border-gray-200 rounded-2xl transition-all duration-300 bg-white/90 text-sm focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/25 focus:bg-white focus:-translate-y-0.5 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors duration-300 z-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                      />
                      <span className="ml-2 text-sm text-gray-700">Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="text-indigo-500 hover:text-purple-600 font-medium transition-all duration-300 hover:underline"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-indigo-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/40 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group mb-6 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      "Sign In to Play"
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center text-center mb-6">
                  <hr className="flex-1 h-px bg-gray-300 border-0" />
                  <span className="px-4 text-gray-500 text-sm bg-white/95">or continue with</span>
                  <hr className="flex-1 h-px bg-gray-300 border-0" />
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    className="h-12 border-2 border-red-300 text-red-600 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/15 flex items-center justify-center"
                    onClick={() => {
                      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
                      const redirectUri = `${window.location.origin}/auth/google/callback`
                      const scope = "email profile"
                      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
                      window.location.href = oauthUrl
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="h-12 border-2 border-blue-300 text-blue-600 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/15 flex items-center justify-center"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2">
                      <path
                        fill="#1877f2"
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="mb-0 text-gray-600">
                    New to SportZone?{" "}
                    <button
                      type="button"
                      className="text-indigo-500 hover:text-purple-600 font-semibold transition-colors duration-300 hover:underline"
                      onClick={() => navigate("/register")}
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          25% { transform: translateY(-50px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(30px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-25px) rotate(270deg) scale(1.05); }
        }

        @keyframes glow {
          from { text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3), 0 0 25px rgba(255, 255, 255, 0.1); }
          to { text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3), 0 0 35px rgba(255, 255, 255, 0.2); }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float { animation: float 15s ease-in-out infinite; }
        .animate-float-delayed-3 { animation: float 15s ease-in-out infinite 3s; }
        .animate-float-delayed-6 { animation: float 15s ease-in-out infinite 6s; }
        .animate-float-delayed-9 { animation: float 15s ease-in-out infinite 9s; }
        .animate-float-delayed-12 { animation: float 15s ease-in-out infinite 12s; }
        .animate-float-delayed-15 { animation: float 15s ease-in-out infinite 15s; }
        
        .animate-spin-slow { animation: spin 35s linear infinite; }
        .animate-spin-slow-delayed-7 { animation: spin 35s linear infinite 7s; }
        .animate-spin-slow-delayed-14 { animation: spin 35s linear infinite 14s; }
        .animate-spin-slow-delayed-21 { animation: spin 35s linear infinite 21s; }
        .animate-spin-slow-delayed-28 { animation: spin 35s linear infinite 28s; }
        
        .animate-glow { animation: glow 3s ease-in-out infinite alternate; }
        .animate-slide-up { animation: slideInUp 0.8s ease-out; }
        .animate-slide-up-delayed-1 { animation: slideInUp 0.8s ease-out 0.1s both; }
        .animate-slide-up-delayed-2 { animation: slideInUp 0.8s ease-out 0.2s both; }
        .animate-slide-up-delayed-3 { animation: slideInUp 0.8s ease-out 0.3s both; }
        .animate-slide-in-right { animation: slideInRight 0.8s ease-out; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }

        @media (max-width: 768px) {
          .text-8xl { font-size: 4rem; }
        }
      `}</style>
    </div>
  )
}
