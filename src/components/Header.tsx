import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { Button } from "./ui/button";
import NotificationBell from "./NotificationBell";

type HeaderProps = { hideBrowseLinks?: boolean };

export default function Header({ hideBrowseLinks }: HeaderProps) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  // Scroll detection for sticky navbar
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          setIsScrolled(scrollTop > 80);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      <nav className={`sz-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="sz-navbar-container">
          <div className="sz-navbar-content">
            <div className="sz-navbar-brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
              <Trophy className="sz-brand-icon" size={28} />
              <span className="sz-brand-text">SportZone</span>
            </div>
            <div className="sz-navbar-menu">
              <NavLink to="/" className={({ isActive }) => `sz-nav-link ${isActive ? "active" : ""}`}>Home</NavLink>
              {!hideBrowseLinks && (
                <>
                  <NavLink to="/?tab=fields#browse" className={({ isActive }) => `sz-nav-link ${isActive ? "active" : ""}`}>Fields</NavLink>
                  <NavLink to="/?tab=coaches#browse" className={({ isActive }) => `sz-nav-link ${isActive ? "active" : ""}`}>Coaches</NavLink>
                </>
              )}
              <a className="sz-nav-link">News</a>
              <a className="sz-nav-link">Tournaments</a>
              <a className="sz-nav-link">Training</a>
              <a className="sz-nav-link">Community</a>
              {isLoggedIn && <NotificationBell />}
              {isLoggedIn && (
                <NavLink to="/profile" className={({ isActive }) => `sz-nav-link ${isActive ? "active" : ""}`}>
                  Profile
                </NavLink>
              )}
              {isLoggedIn ? (
                <Button className="sz-nav-cta-btn" onClick={handleLogout}>Logout</Button>
              ) : (
                <Button className="sz-nav-cta-btn" onClick={() => navigate("/login")}>Join Now</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style>{`
      .sz-navbar { position: fixed; top: 0; left: 0; right: 0; width: 100vw; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); z-index: 1000; padding: 0.75rem 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
      .sz-navbar-container { width: 100%; padding: 0 2rem; }
      .sz-navbar-content { display: flex; justify-content: space-between; align-items: center; width: 100%; }
      .sz-navbar-brand { display: flex; align-items: center; gap: .5rem; font-size: 1.25rem; font-weight: 800; color: #667eea; }
      .sz-brand-icon { color: #ffd700; filter: drop-shadow(0 2px 4px rgba(255,215,0,.3)); }
      .sz-navbar-menu { display: flex; align-items: center; gap: 1.5rem; }
      .sz-nav-link { text-decoration: none; color: #333; font-weight: 500; transition: all .3s ease; position: relative; }
      .sz-nav-link:hover, .sz-nav-link.active { color: #667eea; }
      .sz-nav-link.active::after { content: ""; position: absolute; bottom: -6px; left: 0; right: 0; height: 2px; background: #667eea; border-radius: 1px; }
      .sz-nav-cta-btn { background: linear-gradient(135deg, #667eea, #764ba2); border: none; padding: .45rem 1.25rem; border-radius: 25px; font-weight: 600; }
      @media (max-width: 991px) { .sz-navbar-container { padding: 0 1rem; } .sz-navbar-menu { gap: 1rem; } }
      `}</style>
    </>
  );
}


