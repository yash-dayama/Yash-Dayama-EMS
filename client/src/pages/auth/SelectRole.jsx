import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const SelectRole = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = userType === "admin" ? "/admin" : "/employee";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userType, navigate]);

  const handleRoleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5 text-center">
                {/* Logo */}
                <div className="login-logo">
                  <i className="fas fa-building"></i>
                  <h2 className="fw-bold text-primary mt-2">
                    Employee Management System
                  </h2>
                  <p className="text-muted">
                    Welcome! Please select your role to continue
                  </p>
                </div>

                {/* Role Selection */}
                <Row className="mt-4">
                  <Col md={6} className="mb-3">
                    <Card
                      className="role-card h-100 border-0 shadow-sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRoleSelect("admin")}
                    >
                      <Card.Body className="p-4 text-center">
                        <div className="role-icon mb-3">
                          <i
                            className="fas fa-user-shield text-primary"
                            style={{ fontSize: "3rem" }}
                          ></i>
                        </div>
                        <h5 className="fw-bold">Administrator</h5>
                        <p className="text-muted small mb-3">
                          Manage employees, leaves, and attendance
                        </p>
                        <Button
                          variant="primary"
                          className="w-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleSelect("admin");
                          }}
                        >
                          Login as Admin
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} className="mb-3">
                    <Card
                      className="role-card h-100 border-0 shadow-sm"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRoleSelect("employee")}
                    >
                      <Card.Body className="p-4 text-center">
                        <div className="role-icon mb-3">
                          <i
                            className="fas fa-user text-success"
                            style={{ fontSize: "3rem" }}
                          ></i>
                        </div>
                        <h5 className="fw-bold">Employee</h5>
                        <p className="text-muted small mb-3">
                          Manage your leaves, attendance, and profile
                        </p>
                        <Button
                          variant="success"
                          className="w-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleSelect("employee");
                          }}
                        >
                          Login as Employee
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Features */}
                <div className="mt-5">
                  <h6 className="text-muted mb-3">System Features</h6>
                  <Row>
                    <Col md={4}>
                      <div className="feature-item text-center">
                        <i
                          className="fas fa-calendar-check text-primary mb-2"
                          style={{ fontSize: "1.5rem" }}
                        ></i>
                        <div className="small text-muted">Leave Management</div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="feature-item text-center">
                        <i
                          className="fas fa-clock text-success mb-2"
                          style={{ fontSize: "1.5rem" }}
                        ></i>
                        <div className="small text-muted">
                          Attendance Tracking
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="feature-item text-center">
                        <i
                          className="fas fa-chart-line text-info mb-2"
                          style={{ fontSize: "1.5rem" }}
                        ></i>
                        <div className="small text-muted">
                          Analytics & Reports
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted">
                    Need help? Contact IT Support at{" "}
                    <a
                      href="mailto:support@company.com"
                      className="text-decoration-none"
                    >
                      support@company.com
                    </a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SelectRole;
