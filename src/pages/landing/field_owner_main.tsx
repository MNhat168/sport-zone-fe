// FieldOwnerDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  BarChart2, 
  Settings,
  LogOut
} from 'react-feather';
import HeaderFieldOwner from '../../components/HeaderFieldOwner';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export default function FieldOwnerDashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldData, setFieldData] = useState({
    name: 'City Sports Arena',
    bookings: 128,
    revenue: 8450,
    rating: 4.7,
    fields: 8
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      if (decoded.role !== 'field_owner') {
        navigate('/');
        return;
      }

      setUserRole(decoded.role);
      // In a real app, you would fetch field data here
      // fetchFieldData(decoded.sub);
    } catch (err) {
      setError('Invalid session. Please login again.');
      console.error('Token decoding failed:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Verifying your credentials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>Session Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Return to Login
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <><HeaderFieldOwner /><Container fluid className="p-4 bg-light min-vh-100">
          {/* Dashboard Header */}
          <Row className="mb-4 align-items-center">
              <Col md={6}>
                  <h1 className="mb-0">Field Owner Dashboard</h1>
                  <p className="text-muted">Manage your sports facilities and bookings</p>
              </Col>
          </Row>

          {/* Stats Overview */}
          <Row className="mb-4">
              <Col md={3} sm={6}>
                  <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                          <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                  <Calendar size={24} className="text-primary" />
                              </div>
                              <div>
                                  <h5 className="mb-0">{fieldData.bookings}</h5>
                                  <p className="text-muted mb-0">Bookings</p>
                              </div>
                          </div>
                      </Card.Body>
                  </Card>
              </Col>
              <Col md={3} sm={6}>
                  <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                          <div className="d-flex align-items-center">
                              <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                  <DollarSign size={24} className="text-success" />
                              </div>
                              <div>
                                  <h5 className="mb-0">${fieldData.revenue}</h5>
                                  <p className="text-muted mb-0">Revenue</p>
                              </div>
                          </div>
                      </Card.Body>
                  </Card>
              </Col>
              <Col md={3} sm={6}>
                  <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                          <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                  <BarChart2 size={24} className="text-info" />
                              </div>
                              <div>
                                  <h5 className="mb-0">{fieldData.rating}/5</h5>
                                  <p className="text-muted mb-0">Avg. Rating</p>
                              </div>
                          </div>
                      </Card.Body>
                  </Card>
              </Col>
              <Col md={3} sm={6}>
                  <Card className="border-0 shadow-sm h-100">
                      <Card.Body>
                          <div className="d-flex align-items-center">
                              <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                                  <MapPin size={24} className="text-warning" />
                              </div>
                              <div>
                                  <h5 className="mb-0">{fieldData.fields}</h5>
                                  <p className="text-muted mb-0">Fields</p>
                              </div>
                          </div>
                      </Card.Body>
                  </Card>
              </Col>
          </Row>

          {/* Main Content */}
          <Row>
              {/* Left Column - Management Actions */}
              <Col md={8}>
                  <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                          <div className="d-flex justify-content-between align-items-center mb-4">
                              <Card.Title className="mb-0">Field Management</Card.Title>
                              <Button variant="primary">Add New Field</Button>
                          </div>

                          <Row>
                              <Col md={6} className="mb-3">
                                  <Card className="h-100">
                                      <Card.Body className="text-center">
                                          <Users size={36} className="mb-3 text-primary" />
                                          <Card.Title>Manage Bookings</Card.Title>
                                          <Card.Text>
                                              View and manage upcoming reservations
                                          </Card.Text>
                                          <Button variant="outline-primary">View Bookings</Button>
                                      </Card.Body>
                                  </Card>
                              </Col>
                              <Col md={6} className="mb-3">
                                  <Card className="h-100">
                                      <Card.Body className="text-center">
                                          <DollarSign size={36} className="mb-3 text-success" />
                                          <Card.Title>Financial Reports</Card.Title>
                                          <Card.Text>
                                              Access revenue reports and analytics
                                          </Card.Text>
                                          <Button variant="outline-success">View Reports</Button>
                                      </Card.Body>
                                  </Card>
                              </Col>
                              <Col md={6} className="mb-3">
                                  <Card className="h-100">
                                      <Card.Body className="text-center">
                                          <MapPin size={36} className="mb-3 text-warning" />
                                          <Card.Title>Field Setup</Card.Title>
                                          <Card.Text>
                                              Configure your sports facilities
                                          </Card.Text>
                                          <Button variant="outline-warning">Configure Fields</Button>
                                      </Card.Body>
                                  </Card>
                              </Col>
                              <Col md={6} className="mb-3">
                                  <Card className="h-100">
                                      <Card.Body className="text-center">
                                          <BarChart2 size={36} className="mb-3 text-info" />
                                          <Card.Title>Performance</Card.Title>
                                          <Card.Text>
                                              View field utilization and ratings
                                          </Card.Text>
                                          <Button variant="outline-info">View Analytics</Button>
                                      </Card.Body>
                                  </Card>
                              </Col>
                          </Row>
                      </Card.Body>
                  </Card>
              </Col>

              {/* Right Column - Recent Activity */}
              <Col md={4}>
                  <Card className="border-0 shadow-sm mb-4">
                      <Card.Body>
                          <Card.Title>Recent Bookings</Card.Title>
                          <div className="list-group">
                              {[1, 2, 3, 4].map((item) => (
                                  <div key={item} className="list-group-item border-0 py-3">
                                      <div className="d-flex justify-content-between">
                                          <h6 className="mb-1">Field #{item}</h6>
                                          <small>2 hours ago</small>
                                      </div>
                                      <p className="mb-1">Badminton - 2 players</p>
                                      <small className="text-muted">John Doe - 3:00 PM to 5:00 PM</small>
                                  </div>
                              ))}
                          </div>
                          <Button variant="link" className="mt-2 p-0">
                              View all bookings
                          </Button>
                      </Card.Body>
                  </Card>

                  <Card className="border-0 shadow-sm">
                      <Card.Body>
                          <Card.Title>Quick Actions</Card.Title>
                          <Button variant="outline-primary" className="w-100 mb-2">
                              Create Promotion
                          </Button>
                          <Button variant="outline-success" className="w-100 mb-2">
                              Generate Report
                          </Button>
                          <Button variant="outline-warning" className="w-100 mb-2">
                              Maintenance Request
                          </Button>
                          <Button variant="outline-info" className="w-100">
                              Send Notification
                          </Button>
                      </Card.Body>
                  </Card>
              </Col>
          </Row>

          <style>{`
        .bg-light {
          background-color: #f8f9fa !important;
        }
        .card {
          border-radius: 12px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .list-group-item {
          border-left: 3px solid #0d6efd;
        }
      `}</style>
      </Container></>
  );
}