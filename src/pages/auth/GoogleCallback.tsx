import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

interface AuthState {
  status: "loading" | "success" | "error";
  message: string;
}

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    status: "loading",
    message: "Processing login with Google...",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      // Add a small delay for better UX
      setTimeout(() => {
        axios
          .post(
            `${
              import.meta.env.VITE_API_URL || "http://localhost:3000/"
            }auth/google/callback`,
            { code }
          )
          .then((res) => {
            localStorage.setItem("access_token", res.data.access_token);
            setAuthState({
              status: "success",
              message: "Login successful! Redirecting...",
            });

            // Delay redirect to show success animation
            setTimeout(() => {
              navigate("/");
            }, 2000);
          })
          .catch((err) => {
            const errorMsg =
              err?.response?.data?.error ||
              err?.response?.data?.message ||
              err.message ||
              "Google login failed";

            setAuthState({
              status: "error",
              message: errorMsg,
            });
          });
      }, 1000);
    } else {
      setAuthState({
        status: "error",
        message: "Authentication code from Google not found",
      });
    }
  }, [navigate]);

  const handleRetry = () => {
    navigate("/login");
  };

  const renderContent = () => {
    switch (authState.status) {
      case "loading":
        return (
          <div className="text-center loading-content">
            <div className="mb-4">
              <Spinner
                animation="border"
                variant="primary"
                style={{ width: "4rem", height: "4rem" }}
                className="pulse-animation"
              />
            </div>
            <h4 className="mb-3 text-primary">Processing...</h4>
            <p className="text-muted mb-0">{authState.message}</p>
            <div className="loading-dots mt-3">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center success-content">
            <div className="mb-4">
              <CheckCircle size={64} className="text-success success-icon" />
            </div>
            <h4 className="mb-3 text-success">Success!</h4>
            <p className="text-muted mb-0">{authState.message}</p>
            <div className="progress mt-3" style={{ height: "4px" }}>
              <div
                className="progress-bar bg-success progress-bar-animated"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center error-content">
            <div className="mb-4">
              <XCircle size={64} className="text-danger error-icon" />
            </div>
            <h4 className="mb-3 text-danger">An error occurred</h4>
            <Alert variant="danger" className="text-start">
              {authState.message}
            </Alert>
            <Button variant="primary" onClick={handleRetry} className="mt-2">
              <ArrowLeft size={16} className="me-2" />
              Back to login
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
      .auth-container {
        min-height: 100vh;
        width: 100vw;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
      }
      
      .auth-content {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        animation: slideUp 0.6s ease-out;
      }
      
      .content-wrapper {
        text-align: center;
        padding: 40px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        min-width: 400px;
        max-width: 600px;
        width: 90%;
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .pulse-animation {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.7;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      .loading-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
      }
      
      .loading-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #007bff;
        animation: bounce 1.4s infinite ease-in-out both;
      }
      
      .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
      .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
      
      @keyframes bounce {
        0%, 80%, 100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
      
      .success-icon {
        animation: successPop 0.6s ease-out;
      }
      
      @keyframes successPop {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        50% {
          transform: scale(1.2);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      .error-icon {
        animation: errorShake 0.6s ease-out;
      }
      
      @keyframes errorShake {
        0%, 100% {
          transform: translateX(0);
        }
        10%, 30%, 50%, 70%, 90% {
          transform: translateX(-5px);
        }
        20%, 40%, 60%, 80% {
          transform: translateX(5px);
        }
      }
      
      .loading-content,
      .success-content,
      .error-content {
        animation: fadeIn 0.5s ease-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .progress-bar-animated {
        animation: progress-bar-stripes 1s linear infinite;
      }
      
      @keyframes progress-bar-stripes {
        0% {
          background-position: 1rem 0;
        }
        100% {
          background-position: 0 0;
        }
      }
      
      .btn {
        border-radius: 10px;
        padding: 12px 30px;
        font-weight: 500;
        font-size: 16px;
        transition: all 0.3s ease;
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      
      .alert {
        border-radius: 10px;
        border: none;
        font-size: 16px;
      }
      
      h4 {
        font-size: 2rem;
        font-weight: 600;
      }
      
      p {
        font-size: 1.1rem;
      }
      
      @media (max-width: 768px) {
        .content-wrapper {
          min-width: 300px;
          width: 95%;
          padding: 30px 20px;
        }
        
        h4 {
          font-size: 1.5rem;
        }
        
        p {
          font-size: 1rem;
        }
      }
    `}</style>

      <div className="auth-container">
        <div className="auth-content">
          <div className="content-wrapper">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}
