import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { employeeAPI } from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatDate } from "../../utils/helpers";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    leaveBalance: 0,
    leavesThisMonth: 0,
    attendanceThisMonth: 0,
    todayStatus: null,
  });
  const [checkInStatus, setCheckInStatus] = useState({
    isCheckedIn: false,
    canCheckOut: false,
    checkInTime: null,
    checkOutTime: null,
    hoursWorked: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchCheckInStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leaveBalance, attendanceStats] = await Promise.all([
        employeeAPI.getLeaveBalance(),
        employeeAPI.getAttendanceStats({
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        }),
      ]);

      setStats({
        leaveBalance: leaveBalance.data?.balance || 0,
        leavesThisMonth: leaveBalance.data?.usedThisMonth || 0,
        attendanceThisMonth: attendanceStats.data?.daysPresent || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckInStatus = async () => {
    try {
      const response = await employeeAPI.getCheckInStatus();
      setCheckInStatus(response.data);
    } catch (error) {
      console.error("Error fetching check-in status:", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await employeeAPI.checkIn();
      fetchCheckInStatus();
    } catch (error) {
      console.error("Check-in failed:", error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await employeeAPI.checkOut();
      fetchCheckInStatus();
    } catch (error) {
      console.error("Check-out failed:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Welcome, {user?.firstName}!</h2>
          <p className="text-muted mb-0">Today is {formatDate(new Date())}</p>
        </div>
        <Button
          variant="outline-primary"
          onClick={() => {
            fetchDashboardData();
            fetchCheckInStatus();
          }}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Today's Attendance */}
      <Row className="mb-4">
        <Col>
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>
                Today's Attendance
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <div className="text-center">
                    <h6>Check In</h6>
                    <p className="mb-0 fw-bold text-success">
                      {checkInStatus.checkInTime
                        ? new Date(
                            checkInStatus.checkInTime
                          ).toLocaleTimeString()
                        : "Not checked in"}
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h6>Check Out</h6>
                    <p className="mb-0 fw-bold text-danger">
                      {checkInStatus.checkOutTime
                        ? new Date(
                            checkInStatus.checkOutTime
                          ).toLocaleTimeString()
                        : "Not checked out"}
                    </p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-center">
                    <h6>Hours Worked</h6>
                    <p className="mb-0 fw-bold text-info">
                      {checkInStatus.hoursWorked || 0}h
                    </p>
                  </div>
                </Col>
              </Row>
              <div className="text-center mt-3">
                {!checkInStatus.isCheckedIn ? (
                  <Button variant="success" onClick={handleCheckIn}>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Check In
                  </Button>
                ) : checkInStatus.canCheckOut ? (
                  <Button variant="danger" onClick={handleCheckOut}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Check Out
                  </Button>
                ) : (
                  <Button variant="secondary" disabled>
                    <i className="fas fa-check me-2"></i>
                    Day Complete
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card success">
            <Card.Body className="border rounded">
              <div className="d-flex align-items-center">
                <div className="ms-3">
                  <h5 className="fw-bold mb-0">{stats.leaveBalance}</h5>
                  <p className="text-muted mb-0">Leave Balance</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card warning">
            <Card.Body className="border rounded">
              <div className="d-flex align-items-center">
                <div className="ms-3">
                  <h5 className="fw-bold mb-0">{stats.leavesThisMonth}</h5>
                  <p className="text-muted mb-0">Leaves This Month</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card info">
            <Card.Body className="border rounded">
              <div className="d-flex align-items-center">
                <div className="ms-3">
                  <h5 className="fw-bold mb-0">{stats.attendanceThisMonth}</h5>
                  <p className="text-muted mb-0">Days Present</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card primary">
            <Card.Body className="border rounded">
              <div className="d-flex align-items-center">
                <div className="ms-3">
                  <h5 className="fw-bold mb-0">
                    {Math.round(
                      (stats.attendanceThisMonth / new Date().getDate()) * 100
                    ) || 0}
                    %
                  </h5>
                  <p className="text-muted mb-0">Attendance Rate</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Profile Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-2">
                <strong>Employee ID:</strong> {user?.employeeId}
              </div>
              <div className="mb-2">
                <strong>Department:</strong> {user?.department}
              </div>
              <div className="mb-2">
                <strong>Position:</strong> {user?.position}
              </div>
              <div className="mb-2">
                <strong>Join Date:</strong> {formatDate(user?.joinDate)}
              </div>
              <div className="mb-2">
                <strong>Email:</strong> {user?.email}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeDashboard;
