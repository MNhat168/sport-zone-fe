"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Row, Col, Form, Button, Alert } from "react-bootstrap";
import {
  Mail,
  ArrowLeft,
  Trophy,
  Zap,
  Play,
  Users,
  Award,
  Target,
  CheckCircle,
  Edit,
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
interface VerifyRegisterProps {
  email?: string;
  onVerificationComplete?: () => void;
  onBackToRegister?: () => void;
}
export default function VerifyRegister(props: VerifyRegisterProps) {
  const { onVerificationComplete, onBackToRegister, email: emailProp } = props;
  const location = useLocation();
  // Prefer email from navigation state, fallback to prop
  const email = location.state?.email || emailProp || "user@example.com";
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "danger">("success");
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend code
  useEffect(() => {
    if (!isVerified) {
      // setCanResend(true) - REMOVED
    }
  }, [isVerified]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...verificationCode];
    newCode[index] = value;

    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setVerificationCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const navigate = useNavigate();
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setAlertType("danger");
      setAlertMessage("Please enter all 6 digits");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    setIsLoading(true);
    setShowAlert(false);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}auth/verify`,
        {
          email,
          verificationToken: code,
        }
      );
      setIsLoading(false);
      setIsVerified(true);
      setAlertType("success");
      setAlertMessage("Email verified successfully! Welcome to SportZone! �");
      setShowAlert(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setAlertType("danger");
      setAlertMessage(err.response?.data?.message || "Verification failed");
      setShowAlert(true);
    }
  };

  // const handleResendCode = () => { - REMOVED
  //   setTimeLeft(60)
  //   setCanResend(false)
  //   setVerificationCode(["", "", "", "", "", ""])
  //   setAlertType("success")
  //   setAlertMessage("New verification code sent to your email!")
  //   setShowAlert(true)
  //   setTimeout(() => setShowAlert(false), 3000)
  //   inputRefs.current[0]?.focus()
  // }

  const handleBackToRegister = () => {
    onBackToRegister?.();
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

          {/* Right Side - Email Verification Form */}
          <Col lg={4} className="login-form-side">
            <div className="login-form-wrapper">
              <div className="login-form-container">
                {!isVerified ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="verify-email-icon mb-3">
                        <Mail size={48} className="text-primary" />
                      </div>
                      <h2 className="login-title mb-2">Verify Your Email</h2>
                      <p className="text-muted mb-3">
                        We've sent a 6-digit verification code to
                      </p>
                      <div className="email-display mb-3">
                        <strong className="text-primary">{email}</strong>
                        <Button
                          variant="link"
                          size="sm"
                          className="edit-email-btn p-0 ms-2"
                          onClick={handleBackToRegister}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                      <p className="text-muted small">
                        Please check your inbox and enter the code below to
                        complete your registration
                      </p>
                    </div>

                    {/* Alert */}
                    {showAlert && (
                      <Alert
                        variant={alertType}
                        className="animated-alert mb-4"
                      >
                        <div className="d-flex align-items-center">
                          <Trophy size={20} className="me-2" />
                          {alertMessage}
                        </div>
                      </Alert>
                    )}

                    {/* Verification Code Form */}
                    <Form onSubmit={handleVerificationSubmit}>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold text-center d-block mb-3">
                          Enter Verification Code
                        </Form.Label>
                        <div
                          className="verification-code-container"
                          onPaste={handlePaste}
                        >
                          {verificationCode.map((digit, index) => (
                            <input
                              key={index}
                              ref={el => { inputRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleCodeChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              className="verification-input"
                              autoComplete="off"
                              disabled={isLoading}
                            />
                          ))}
                        </div>
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            You can paste the entire code at once
                          </small>
                        </div>
                      </Form.Group>

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
                            Verifying...
                          </>
                        ) : (
                          "Verify Email"
                        )}
                      </Button>
                    </Form>

                    {/* Help Section */}
                    <div className="help-section">
                      <div className="help-card">
                        <h6 className="help-title">Didn't receive the code?</h6>
                        <ul className="help-list">
                          <li>Check your spam/junk folder</li>
                          <li>Make sure {email} is correct</li>
                          <li>Wait a few minutes for delivery</li>
                          <li>Try resending the code</li>
                        </ul>
                      </div>
                    </div>

                    {/* Back to Register */}
                    <div className="text-center mt-4">
                      <Button
                        variant="link"
                        className="back-link p-0"
                        onClick={handleBackToRegister}
                      >
                        <ArrowLeft size={16} className="me-2" />
                        Back to Registration
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Success State */}
                    <div className="text-center">
                      <div className="success-icon mb-4">
                        <CheckCircle size={64} className="text-success" />
                      </div>
                      <h2 className="login-title mb-3 text-success">
                        Email Verified!
                      </h2>
                      <p className="text-muted mb-4">
                        Congratulations! Your email has been successfully
                        verified. Your SportZone account is now active and ready
                        to use.
                      </p>

                      {/* Success Alert */}
                      {showAlert && (
                        <Alert
                          variant="success"
                          className="animated-alert mb-4"
                        >
                          <div className="d-flex align-items-center">
                            <Trophy size={20} className="me-2" />
                            {alertMessage}
                          </div>
                        </Alert>
                      )}

                      <div className="welcome-message">
                        <h5 className="mb-3">Welcome to SportZone! 🏆</h5>
                        <p className="text-muted mb-4">
                          You can now access all features including live
                          coaching, tournaments, and connect with our sports
                          community.
                        </p>
                      </div>

                      <Button className="login-btn w-100 mb-3">
                        Continue to Dashboard
                      </Button>

                      <Button variant="outline-primary" className="w-100">
                        Start Your First Session
                      </Button>
                    </div>
                  </>
                )}
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
  0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
  25% { transform: translateY(-50px) rotate(90deg) scale(1.1); }
  50% { transform: translateY(30px) rotate(180deg) scale(0.9); }
  75% { transform: translateY(-25px) rotate(270deg) scale(1.05); }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.3); }
}

.brand-title-large {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
  text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3), 0 0 25px rgba(255, 255, 255, 0.1); }
  to { text-shadow: 0 6px 12px rgba(0, 0, 0, 0.3), 0 0 35px rgba(255, 255, 255, 0.2); }
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

.feature-card:nth-child(1) { animation-delay: 0.1s; }
.feature-card:nth-child(2) { animation-delay: 0.2s; }
.feature-card:nth-child(3) { animation-delay: 0.3s; }
.feature-card:nth-child(4) { animation-delay: 0.4s; }

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

.verify-email-icon {
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
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.verify-email-icon .text-primary {
  color: white !important;
}

.success-icon {
  animation: successBounce 0.6s ease-out;
}

@keyframes successBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.email-display {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.edit-email-btn {
  color: #6c757d;
  transition: color 0.3s ease;
}

.edit-email-btn:hover {
  color: #667eea;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.verification-code-container {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.verification-input {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  outline: none;
}

.verification-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
  background: white;
  transform: translateY(-2px);
}

.verification-input:not(:placeholder-shown) {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.verification-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.resend-section {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.resend-btn {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.help-section {
  margin-top: 1rem;
}

.help-card {
  background: rgba(255, 248, 220, 0.8);
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 1rem;
}

.help-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #856404;
  margin-bottom: 0.5rem;
}

.help-list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: #856404;
}

.help-list li {
  margin-bottom: 0.2rem;
}

.welcome-message {
  background: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
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
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
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
  .verification-code-container {
    gap: 8px;
  }
  
  .verification-input {
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
  
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
}

@media (max-width: 480px) {
  .verification-code-container {
    gap: 6px;
  }
  
  .verification-input {
    width: 40px;
@media (max-width: 480px) {
  .verification-code-container {
    gap: 6px;
  }
  
  .verification-input {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
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
  
  .help-card {
    padding: 0.8rem;
  }
  
  .resend-section {
    padding: 1rem;
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
