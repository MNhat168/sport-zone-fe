// Header.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { 
  PersonCircle, 
  Calendar, 
  Gear, 
  People,
  Map,
  Trophy,
  BoxArrowRight
} from 'react-bootstrap-icons';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  fullName?: string;
}

interface UserInfo {
  id: string;
  email: string;
  role: string;
  name: string;
  avatar?: string;
}

export default function Header() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUserInfo({
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        name: decoded.fullName || decoded.email.split('@')[0]
      });
    } catch (err) {
      console.error('Failed to decode token:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const getRoleSpecificLinks = () => {
    if (!userInfo) return null;
    
    switch (userInfo.role) {
      case 'field_owner':
        return (
          <>
            <Nav.Link as={Link} to="/list-field">
              <Map className="me-1" /> Fields
            </Nav.Link>
            <Nav.Link as={Link} to="/bookings">
              <Calendar className="me-1" /> Bookings
            </Nav.Link>
          </>
        );
      case 'coach':
        return (
          <>
            <Nav.Link as={Link} to="/sessions">
              <Calendar className="me-1" /> Sessions
            </Nav.Link>
            <Nav.Link as={Link} to="/athletes">
              <People className="me-1" /> Athletes
            </Nav.Link>
          </>
        );
      case 'admin':
        return (
          <>
            <Nav.Link as={Link} to="/dashboard">
              <Gear className="me-1" /> Admin
            </Nav.Link>
            <Nav.Link as={Link} to="/users">
              <People className="me-1" /> Users
            </Nav.Link>
          </>
        );
      default: // Regular user
        return (
          <>
            <Nav.Link as={Link} to="/bookings">
              <Calendar className="me-1" /> Book
            </Nav.Link>
            <Nav.Link as={Link} to="/coaches">
              <Trophy className="me-1" /> Coaches
            </Nav.Link>
          </>
        );
    }
  };

  if (loading) return null;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/field-owner" className="d-flex align-items-center">
          <div className="bg-primary p-2 rounded me-2">
            <Trophy size={24} />
          </div>
          <span className="fw-bold">SportZone</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="main-navbar" />
        
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {userInfo && getRoleSpecificLinks()}
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
          </Nav>
          
          <Nav className="align-items-center">
            {userInfo ? (
              <>
                <NavDropdown 
                  title={
                    <div className="d-inline-flex align-items-center">
                      {userInfo.avatar ? (
                        <img 
                          src={userInfo.avatar} 
                          alt={userInfo.name} 
                          className="rounded-circle me-2" 
                          width="32" 
                          height="32" 
                        />
                      ) : (
                        <PersonCircle size={24} className="me-1" />
                      )}
                      <span>{userInfo.name}</span>
                    </div>
                  } 
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    <PersonCircle className="me-2" /> Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/settings">
                    <Gear className="me-2" /> Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <BoxArrowRight className="me-2" /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
                
                <div className="d-lg-none">
                  <NavDropdown.Item onClick={handleLogout}>
                    <BoxArrowRight className="me-2" /> Logout
                  </NavDropdown.Item>
                </div>
              </>
            ) : (
              <>
                <Button 
                  variant="outline-light" 
                  className="me-2" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}