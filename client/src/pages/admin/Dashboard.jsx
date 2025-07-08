import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { adminAPI } from "../../utils/api";
import { formatDate, formatApiError } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    employees: { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
    leaves: { total: 0, pending: 0, approved: 0, rejected: 0 },
    attendance: {
      checkedIn: 0,
      checkedOut: 0,
      stillWorking: 0,
      avgHoursToday: 0,
    },
    recent: { pendingLeaves: [], todayAttendance: [], newEmployees: [] },
    summary: { attendanceRate: 0, leaveUtilization: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      setDashboardData(response.data || {});
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Admin Dashboard</h2>
        <Button variant="outline-primary" onClick={fetchDashboardData}>
          <i className="fas fa-sync-alt me-2"></i>
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="stat-card border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-primary mb-2">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="mb-1">{dashboardData.employees.total}</h3>
              <p className="text-muted mb-0 small">Total Employees</p>
              <small className="text-success">
                +{dashboardData.employees.newThisMonth} this month
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-success mb-2">
                <i className="fas fa-user-check"></i>
              </div>
              <h3 className="mb-1">{dashboardData.attendance.checkedIn}</h3>
              <p className="text-muted mb-0 small">Present Today</p>
              <small className="text-info">
                {dashboardData.summary.attendanceRate}% attendance rate
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-warning mb-2">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="mb-1">{dashboardData.leaves.pending}</h3>
              <p className="text-muted mb-0 small">Pending Leaves</p>
              <small className="text-muted">
                {dashboardData.leaves.total} total requests
              </small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="stat-card border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <div className="display-6 text-info mb-2">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="mb-1">
                {dashboardData.attendance.avgHoursToday}h
              </h3>
              <p className="text-muted mb-0 small">Avg Hours Today</p>
              <small className="text-success">
                {dashboardData.attendance.stillWorking} still working
              </small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Overview</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Active Employees</span>
                  <span>
                    {Math.round(
                      (dashboardData.employees.active /
                        dashboardData.employees.total) *
                        100
                    ) || 0}
                    %
                  </span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        (dashboardData.employees.active /
                          dashboardData.employees.total) *
                          100 || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Daily Attendance</span>
                  <span>{dashboardData.summary.attendanceRate}%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-info"
                    style={{
                      width: `${dashboardData.summary.attendanceRate}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Leave Utilization</span>
                  <span>{dashboardData.summary.leaveUtilization}%</span>
                </div>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${dashboardData.summary.leaveUtilization}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="text-muted small">
                Last updated: {new Date().toLocaleString()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Pending Leaves</h6>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.recent.pendingLeaves.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recent.pendingLeaves.map((leave) => (
                    <ListGroup.Item
                      key={leave._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-medium">{leave.employee?.name}</div>
                        <small className="text-muted">
                          {formatDate(leave.startDate)} -{" "}
                          {formatDate(leave.endDate)}
                        </small>
                      </div>
                      <Badge bg="warning">Pending</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-check-circle mb-2"></i>
                  <p className="mb-0 small">No pending leaves</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Today's Check-ins</h6>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.recent.todayAttendance.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recent.todayAttendance
                    .slice(0, 5)
                    .map((attendance) => (
                      <ListGroup.Item
                        key={attendance._id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-medium">
                            {attendance.employee?.name}
                          </div>
                          <small className="text-muted">
                            {attendance.employee?.employeeId}
                          </small>
                        </div>
                        <small className="text-success">
                          {new Date(attendance.checkInTime).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </small>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-clock mb-2"></i>
                  <p className="mb-0 small">No check-ins yet today</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">New Employees</h6>
            </Card.Header>
            <Card.Body className="p-0">
              {dashboardData.recent.newEmployees.length > 0 ? (
                <ListGroup variant="flush">
                  {dashboardData.recent.newEmployees.map((employee) => (
                    <ListGroup.Item
                      key={employee._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-medium">{employee.name}</div>
                        <small className="text-muted">
                          {employee.department}
                        </small>
                      </div>
                      <Badge bg="primary">{employee.employeeId}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-users mb-2"></i>
                  <p className="mb-0 small">No new employees recently</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
