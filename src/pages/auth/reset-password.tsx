"use client";

 import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Form, Button, Alert } from "react-bootstrap";
import {
  Lock,
  Eye,
  SlashIcon as EyeSlash,
  ArrowLeft,
  Trophy,
  Zap,
  Play,
  Users,
  Award,
  Target,
  Shield,
  CheckCircle,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
import { useNavigate } from "react-router-dom";
export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { email, resetPasswordToken } = location.state || {};
  useEffect(() => {
    if (!email || !resetPasswordToken) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [email, resetPasswordToken, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    color: "#dc3545",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Check password strength when password field changes
    if (field === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let feedback = "";
    let color = "#dc3545";

    if (password.length === 0) {
      setPasswordStrength({ score: 0, feedback: "", color: "#dc3545" });
      return;
    }

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine feedback and color
    if (score <= 2) {
      feedback = "Weak password";
      color = "#dc3545";
    } else if (score <= 4) {
      feedback = "Medium strength";
      color = "#ffc107";
    } else {
      feedback = "Strong password";
      color = "#28a745";
    }

    setPasswordStrength({ score, feedback, color });
  };

  const validatePasswords = () => {
    if (formData.password.length < 8) {
      setAlertType("danger");
      setAlertMessage("Password must be at least 8 characters long");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlertType("danger");
      setAlertMessage("Passwords do not match");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }

    if (passwordStrength.score < 3) {
      setAlertType("danger");
      setAlertMessage("Please choose a stronger password");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    if (!email || !resetPasswordToken) {
      setAlertType("danger");
      setAlertMessage("Missing email or token. Please restart the reset flow.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}auth/reset-password`,
        {
          email,
          resetPasswordToken,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );
      setIsLoading(false);
      setAlertType("success");
      setAlertMessage("Password reset successfully! Redirecting to login...");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
      navigate("/auth/login");
    } catch (err: any) {
      setIsLoading(false);
      setAlertType("danger");
      setAlertMessage(err.response?.data?.message || "Failed to reset password");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const getPasswordRequirements = () => {
    const requirements = [
      { text: "At least 8 characters", met: formData.password.length >= 8 },
      {
        text: "Contains lowercase letter",
        met: /[a-z]/.test(formData.password),
      },
      {
        text: "Contains uppercase letter",
        met: /[A-Z]/.test(formData.password),
      },
      { text: "Contains number", met: /[0-9]/.test(formData.password) },
      {
        text: "Contains special character",
        met: /[^A-Za-z0-9]/.test(formData.password),
      },
    ];
    return requirements;
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

          {/* Right Side - Reset Password Form */}
          <Col lg={4} className="login-form-side">
            <div className="login-form-wrapper">
              <div className="login-form-container">
                <div className="text-center mb-4">
                  <div className="reset-password-icon mb-3">
                    <Shield size={48} className="text-primary" />
                  </div>
                  <h2 className="login-title mb-2">Reset Password</h2>
                  <p className="text-muted">
                    Create a new secure password for your account
                  </p>
                </div>

                {/* Alert */}
                {showAlert && (
                  <Alert variant={alertType} className="animated-alert mb-4">
                    <div className="d-flex align-items-center">
                      <Trophy size={20} className="me-2" />
                      {alertMessage}
                    </div>
                  </Alert>
                )}

                {/* Reset Password Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      New Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <Lock className="input-icon" size={20} />
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
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
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="password-strength mt-2">
                        <div className="strength-bar-container">
                          <div
                            className="strength-bar"
                            style={{
                              width: `${(passwordStrength.score / 6) * 100}%`,
                              backgroundColor: passwordStrength.color,
                            }}
                          ></div>
                        </div>
                        <small
                          className="strength-text"
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.feedback}
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Confirm New Password
                    </Form.Label>
                    <div className="input-group-custom">
                      <Lock className="input-icon" size={20} />
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
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
                          <EyeSlash size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="password-match mt-2">
                        {formData.password === formData.confirmPassword ? (
                          <small className="text-success">
                            <CheckCircle size={16} className="me-1" />
                            Passwords match
                          </small>
                        ) : (
                          <small className="text-danger">
                            Passwords do not match
                          </small>
                        )}
                      </div>
                    )}
                  </Form.Group>

                  {/* Password Requirements */}
                  {formData.password && (
                    <div className="password-requirements mb-4">
                      <h6 className="requirements-title">
                        Password Requirements:
                      </h6>
                      <div className="requirements-list">
                        {getPasswordRequirements().map((req, index) => (
                          <div
                            key={index}
                            className={`requirement-item ${
                              req.met ? "met" : "unmet"
                            }`}
                          >
                            <CheckCircle
                              size={16}
                              className="requirement-icon"
                            />
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="login-btn w-100 mb-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </Form>

                {/* Back to Login */}
                <div className="text-center">
                  <Button variant="link" className="back-link p-0">
                    <ArrowLeft size={16} className="me-2" />
                    Back to Login
                  </Button>
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
          margin-right: 5rem;
        }

        .login-form-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 2.5rem;
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

        .reset-password-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 50%;
          margin: 0 auto;
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .reset-password-icon .text-primary {
          color: white !important;
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
          padding-left: 55px;
          padding-right: 55px;
          height: 45px;
          border: 2px solid #e9ecef;
          border-radius: 15px;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          font-size: 0.95rem;
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

        .password-strength {
          margin-top: 8px;
        }

        .strength-bar-container {
          width: 100%;
          height: 4px;
          background-color: #e9ecef;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 4px;
        }

        .strength-bar {
          height: 100%;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .strength-text {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .password-match {
          display: flex;
          align-items: center;
        }

        .password-requirements {
          background: rgba(248, 249, 250, 0.8);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid #e9ecef;
        }

        .requirements-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .requirements-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .requirement-item {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          transition: all 0.3s ease;
        }

        .requirement-item.met {
          color: #28a745;
        }

        .requirement-item.met .requirement-icon {
          color: #28a745;
        }

        .requirement-item.unmet {
          color: #6c757d;
        }

        .requirement-item.unmet .requirement-icon {
          color: #dee2e6;
        }

        .requirement-icon {
          margin-right: 0.5rem;
          flex-shrink: 0;
        }

        .login-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          height: 45px;
          border-radius: 15px;
          font-weight: 600;
          font-size: 1rem;
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

        .back-link {
          color: #6c757d;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .back-link:hover {
          color: #667eea;
          text-decoration: none;
        }

        .animated-alert {
          animation: slideDown 0.5s ease-out;
          border: none;
          border-radius: 15px;
          border-left: 4px solid;
        }

        .animated-alert.alert-success {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          border-left-color: #28a745;
        }

        .animated-alert.alert-danger {
          background: linear-gradient(135deg, #f8d7da, #f5c6cb);
          border-left-color: #dc3545;
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

          .requirements-list {
            gap: 0.4rem;
          }

          .requirement-item {
            font-size: 0.75rem;
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

          .password-requirements {
            padding: 0.8rem;
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
