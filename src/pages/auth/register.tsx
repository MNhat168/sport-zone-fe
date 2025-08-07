"use client";

import type React from "react";
import { useState } from "react";
import { Row, Col, Form, Button, Alert } from "react-bootstrap";
import {
  Eye,
  SlashIcon as EyeSlash,
  Mail,
  Lock,
  Trophy,
  Zap,
  Play,
  Users,
  Award,
  Target,
  User,
  Phone,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SportsRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowAlert(false);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/"}auth/register`,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }
      );
      setIsLoading(false);
      navigate("/verify-register", { state: { email: formData.email } });
    } catch (err: any) {
      setIsLoading(false);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="sports-login-fullwidth">
      {/* Full Width Purple Background */}
      <div className="full-width-purple-background">
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
        </div>

        <Row className="min-vh-100 g-0">
          {/* Left Side - Sports Content */}
          <Col lg={8} className="sports-content-side">
            <div className="sports-content-wrapper">
              <div className="content-overlay">
                <div className="brand-section">
                  {/* Logo and Title */}
                  <div className="logo-container mb-4">
                    <div className="sports-logo-large">
                      <Trophy className="trophy-icon-large" size={50} />
                      <Zap className="zap-icon-large" size={25} />
                    </div>
                  </div>
                  <h1 className="brand-title-large mb-4">SportZone</h1>
                  <p className="brand-subtitle mb-5">
                    Join thousands of athletes mastering badminton, pickleball,
                    and racquet sports
                  </p>

                  {/* Feature Cards */}
                  <div className="feature-cards">
                    <div className="feature-card">
                      <Play className="feature-icon" size={32} />
                      <h5>Live Coaching</h5>
                      <p>Get real-time feedback from professional coaches</p>
                    </div>
                    <div className="feature-card">
                      <Users className="feature-icon" size={32} />
                      <h5>Community</h5>
                      <p>Connect with players at your skill level</p>
                    </div>
                    <div className="feature-card">
                      <Award className="feature-icon" size={32} />
                      <h5>Tournaments</h5>
                      <p>Compete in local and online competitions</p>
                    </div>
                    <div className="feature-card">
                      <Target className="feature-icon" size={32} />
                      <h5>Skill Tracking</h5>
                      <p>Monitor your progress with detailed analytics</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="stats-section">
                    <div className="stat-item">
                      <h3>50K+</h3>
                      <p>Active Players</p>
                    </div>
                    <div className="stat-item">
                      <h3>1M+</h3>
                      <p>Games Played</p>
                    </div>
                    <div className="stat-item">
                      <h3>500+</h3>
                      <p>Tournaments</p>
                    </div>
                    <div className="stat-item">
                      <h3>24/7</h3>
                      <p>Support</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side - Register Form */}
          <Col lg={4} className="login-form-side">
            <div className="login-form-wrapper">
              <div className="login-form-container">
                <div className="text-center mb-4">
                  <h2 className="login-title mb-2">Create Account</h2>
                  <p className="text-muted">
                    Join SportZone and start your athletic journey
                  </p>
                </div>

                {/* Alert */}
                {showAlert && (
                  <Alert variant="success" className="animated-alert mb-4">
                    <div className="d-flex align-items-center">
                      <Trophy size={20} className="me-2" />
                      Welcome to SportZone! 🎉
                    </div>
                  </Alert>
                )}

                {/* Register Form */}
                <Form onSubmit={handleSubmit}>
                  {/* Name Fields */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Full Name</Form.Label>
                    <div className="input-group-custom">
                      <User className="input-icon" size={18} />
                      <Form.Control
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) =>
                          handleInputChange("fullName", e.target.value)
                        }
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Email Address
                    </Form.Label>
                    <div className="input-group-custom">
                      <Mail className="input-icon" size={18} />
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Phone Number
                    </Form.Label>
                    <div className="input-group-custom">
                      <Phone className="input-icon" size={18} />
                      <Form.Control
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <div className="input-group-custom">
                      <Lock className="input-icon" size={18} />
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="form-control-custom"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlash size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Confirm Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <Lock className="input-icon" size={18} />
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="form-control-custom"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeSlash size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </Form.Group>

                  <div className="mb-4">
                    <Form.Check
                      type="checkbox"
                      id="terms-agreement"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="custom-checkbox"
                      label={
                        <span>
                          I agree to the{" "}
                          <a href="#" className="signup-link">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="#" className="signup-link">
                            Privacy Policy
                          </a>
                        </span>
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="login-btn w-100 mb-4"
                    disabled={isLoading || !agreedToTerms}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </Form>

                {/* Divider */}
                <div className="divider-container mb-4">
                  <hr className="divider-line" />
                  <span className="divider-text">or sign up with</span>
                  <hr className="divider-line" />
                </div>

                {/* Social Login Buttons */}
                <Row className="mb-4">
                  <Col xs={6}>
                    <Button
                      variant="outline-danger"
                      className="social-btn w-100"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        className="me-2"
                      >
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
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button
                      variant="outline-primary"
                      className="social-btn w-100"
                      style={{ borderColor: "#1877f2", color: "#1877f2" }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        className="me-2"
                      >
                        <path
                          fill="#1877f2"
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                      </svg>
                      Facebook
                    </Button>
                  </Col>
                </Row>

                {/* Sign In Link */}
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{" "}
                    <a className="signup-link" onClick={() => navigate("/login")}>
                      Sign In
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style >{`
        .sports-login-fullwidth {
          min-height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .full-width-purple-background {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        .full-width-purple-background .row {
          margin: 0;
          width: 100%;
        }

        .full-width-purple-background .col-lg-8,
        .full-width-purple-background .col-lg-4 {
          padding: 0;
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-ball {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          opacity: 0.08;
          animation: float 15s ease-in-out infinite;
        }

        .ball-1 {
          background: #ff6b6b;
          top: 5%;
          left: 5%;
          animation-delay: 0s;
        }

        .ball-2 {
          background: #4ecdc4;
          top: 15%;
          right: 8%;
          animation-delay: 3s;
        }

        .ball-3 {
          background: #45b7d1;
          bottom: 10%;
          left: 10%;
          animation-delay: 6s;
        }

        .ball-4 {
          background: #96ceb4;
          top: 60%;
          left: 3%;
          animation-delay: 9s;
        }

        .ball-5 {
          background: #feca57;
          bottom: 20%;
          right: 5%;
          animation-delay: 12s;
        }

        .ball-6 {
          background: #ff9ff3;
          top: 40%;
          right: 15%;
          animation-delay: 15s;
        }

        .floating-racket {
          position: absolute;
          font-size: 6rem;
          opacity: 0.06;
          animation: rotate 35s linear infinite;
        }

        .racket-1 {
          top: 8%;
          left: 15%;
          animation-delay: 0s;
        }

        .racket-2 {
          bottom: 15%;
          right: 20%;
          animation-delay: 7s;
        }

        .racket-3 {
          top: 50%;
          left: 8%;
          animation-delay: 14s;
        }

        .racket-4 {
          top: 25%;
          right: 25%;
          animation-delay: 21s;
        }

        .racket-5 {
          bottom: 40%;
          left: 25%;
          animation-delay: 28s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
          }
          25% {
            transform: translateY(-50px) rotate(90deg) scale(1.1);
          }
          50% {
            transform: translateY(30px) rotate(180deg) scale(0.9);
          }
          75% {
            transform: translateY(-25px) rotate(270deg) scale(1.05);
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

        .sports-content-side {
          position: relative;
          z-index: 2;
        }

        .sports-content-wrapper {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .content-overlay {
          position: relative;
          z-index: 2;
          text-align: center;
          color: white;
          max-width: 700px;
          width: 100%;
        }

        .sports-logo-large {
          position: relative;
          display: inline-block;
          animation: bounce 3s ease-in-out infinite;
        }

        .trophy-icon-large {
          color: #ffd700;
          filter: drop-shadow(0 6px 12px rgba(255, 215, 0, 0.4));
        }

        .zap-icon-large {
          position: absolute;
          top: -5px;
          right: -25px;
          color: #ff6b6b;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%,
          20%,
          50%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
          60% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.3);
          }
        }

        .brand-title-large {
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 0.8rem;
          text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
          animation: glow 3s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3),
              0 0 25px rgba(255, 255, 255, 0.1);
          }
          to {
            text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3),
              0 0 35px rgba(255, 255, 255, 0.2);
          }
        }

        .brand-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          padding: 1.3rem;
          text-align: center;
          transition: all 0.3s ease;
          animation: slideInUp 0.8s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feature-card:nth-child(1) {
          animation-delay: 0.1s;
        }
        .feature-card:nth-child(2) {
          animation-delay: 0.2s;
        }
        .feature-card:nth-child(3) {
          animation-delay: 0.3s;
        }
        .feature-card:nth-child(4) {
          animation-delay: 0.4s;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.18);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        }

        .feature-icon {
          color: #ffd700;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.3));
        }

        .feature-card h5 {
          margin-bottom: 0.8rem;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .feature-card p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
          line-height: 1.5;
        }

        .stats-section {
          display: flex;
          justify-content: space-around;
          margin-top: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item h3 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: #ffd700;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .stat-item p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.2rem;
        }

        .login-form-side {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 600px;
          padding: 1.5rem;
          margin-right: 7rem;
        }

        .login-form-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 2rem;
          border-radius: 25px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          animation: slideInRight 0.8s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .login-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
        }

        .input-group-custom {
          position: relative;
          margin-bottom: 0;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
          z-index: 3;
        }

        .form-control-custom {
          padding-left: 50px;
          padding-right: 50px;
          height: 42px;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        .form-control-custom:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          background: white;
          transform: translateY(-2px);
        }

        .password-toggle {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          z-index: 3;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        .custom-checkbox .form-check-input:checked {
          background-color: #667eea;
          border-color: #667eea;
        }

        .forgot-password-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .forgot-password-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .login-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          height: 42px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .login-btn:hover::before {
          left: 100%;
        }

        .divider-container {
          display: flex;
          align-items: center;
          text-align: center;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #dee2e6;
          border: none;
          margin: 0;
        }

        .divider-text {
          padding: 0 1rem;
          color: #6c757d;
          font-size: 0.85rem;
          background: rgba(255, 255, 255, 0.95);
        }

        .social-btn {
          height: 42px;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
        }

        .social-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .signup-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .signup-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        .animated-alert {
          animation: slideDown 0.5s ease-out;
          border: none;
          border-radius: 15px;
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          border-left: 4px solid #28a745;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsiveness */
        @media (max-width: 991px) {
          .sports-content-side {
            display: none;
          }

          .login-form-container {
            margin: 1rem;
            padding: 2rem;
          }

          .login-form-wrapper {
            margin-right: 1rem;
          }
        }

        @media (max-width: 768px) {
          .brand-title-large {
            font-size: 3.5rem;
          }

          .feature-cards {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .stats-section {
            flex-wrap: wrap;
            gap: 1.5rem;
          }

          .login-title {
            font-size: 1.6rem;
          }

          .stat-item h3 {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .stats-section {
            flex-direction: column;
            gap: 1rem;
          }

          .floating-ball {
            width: 80px;
            height: 80px;
          }

          .floating-racket {
            font-size: 4rem;
          }
        }

        /* Global body reset to ensure no margins */
        :global(body) {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden;
        }

        :global(html) {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
