import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { employeeAPI } from "../../utils/api";
import {
  ATTENDANCE_STATUS,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
  DATE_FORMATS,
  WORKING_HOURS,
} from "../../utils/constants";
import { formatDate, formatTime, formatApiError } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState({
    isCheckedIn: false,
    canCheckOut: false,
  });
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({
    checkIn: false,
    checkOut: false,
  });
  const [activeTab, setActiveTab] = useState("today");
  const [filters, setFilters] = useState({
    month: formatDate(new Date(), "YYYY-MM"),
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  const fetchTodayAttendance = async () => {
    try {
      const response = await employeeAPI.getTodayAttendance();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error("Error fetching today attendance:", error);
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

  const fetchAttendanceHistory = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await employeeAPI.getMyAttendance(params);
      const { data, pagination: paginationData } = response.data;

      setAttendance(data || []);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
        page,
      }));
    } catch (error) {
      console.error("Error fetching attendance history:", error);
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const params = filters.month ? { month: filters.month } : {};
      const response = await employeeAPI.getAttendanceStats(params);
      setStats(response.data || {});
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, checkIn: true }));
      await employeeAPI.checkIn();
      toast.success("Checked in successfully!");
      fetchTodayAttendance();
      fetchCheckInStatus();
      fetchStats();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error(formatApiError(error));
    } finally {
      setActionLoading((prev) => ({ ...prev, checkIn: false }));
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading((prev) => ({ ...prev, checkOut: true }));
      await employeeAPI.checkOut();
      toast.success("Checked out successfully!");
      fetchTodayAttendance();
      fetchCheckInStatus();
      fetchStats();
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error(formatApiError(error));
    } finally {
      setActionLoading((prev) => ({ ...prev, checkOut: false }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchAttendanceHistory(1);
    fetchStats();
  };

  const clearFilters = () => {
    setFilters({
      month: formatDate(new Date(), "YYYY-MM"),
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => {
      fetchAttendanceHistory(1);
      fetchStats();
    }, 100);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchAttendanceHistory(1);
    }
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";

    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime - checkInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getAttendanceStatus = (record) => {
    if (!record.checkIn) return ATTENDANCE_STATUS.ABSENT;
    if (!record.checkOut) return ATTENDANCE_STATUS.PRESENT;

    const checkInTime = new Date(record.checkIn);
    const standardTime = new Date(checkInTime);
    standardTime.setHours(9, 30, 0, 0); // 9:30 AM

    if (checkInTime > standardTime) return ATTENDANCE_STATUS.LATE;
    if (record.totalHours < 4) return ATTENDANCE_STATUS.HALF_DAY;
    return ATTENDANCE_STATUS.PRESENT;
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchCheckInStatus();
    fetchAttendanceHistory();
    fetchStats();
  }, []);

  if (loading && !todayAttendance && attendance.length === 0) {
    return <LoadingSpinner />;
  }

  const currentTime = new Date().toLocaleString();

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">My Attendance</h1>
          <p className="text-muted mb-0">Track your daily attendance</p>
        </div>
        <div className="text-muted small">Current Time: {currentTime}</div>
      </div>

      {/* Statistics Cards */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-2">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <h3 className="mb-1">{stats.totalDays || 0}</h3>
                <p className="text-muted mb-0 small">Total Days</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-primary mb-2">
                  <i className="fas fa-user-check"></i>
                </div>
                <h3 className="mb-1">{stats.presentDays || 0}</h3>
                <p className="text-muted mb-0 small">Present Days</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-warning mb-2">
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className="mb-1">{stats.totalHours || 0}h</h3>
                <p className="text-muted mb-0 small">Total Hours</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-2">
                  <i className="fas fa-percentage"></i>
                </div>
                <h3 className="mb-1">
                  {stats.attendanceRate
                    ? `${Math.round(stats.attendanceRate)}%`
                    : "0%"}
                </h3>
                <p className="text-muted mb-0 small">Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "today" ? "active" : ""}`}
                onClick={() => handleTabSwitch("today")}
              >
                <i className="fas fa-calendar-day me-2"></i>
                Today
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "history" ? "active" : ""
                }`}
                onClick={() => handleTabSwitch("history")}
              >
                <i className="fas fa-history me-2"></i>
                History
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body">
          {/* Today's Attendance Tab */}
          {activeTab === "today" && (
            <div>
              {/* Check-in/Check-out Section */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body text-center">
                      <h5 className="card-title">Check In / Check Out</h5>
                      <div className="d-flex gap-3 justify-content-center">
                        {!checkInStatus.isCheckedIn ? (
                          <button
                            type="button"
                            className="btn btn-success btn-lg"
                            onClick={handleCheckIn}
                            disabled={actionLoading.checkIn}
                          >
                            {actionLoading.checkIn ? (
                              <i className="fas fa-spinner fa-spin me-2"></i>
                            ) : (
                              <i className="fas fa-sign-in-alt me-2"></i>
                            )}
                            Check In
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger btn-lg"
                            onClick={handleCheckOut}
                            disabled={
                              !checkInStatus.canCheckOut ||
                              actionLoading.checkOut
                            }
                          >
                            {actionLoading.checkOut ? (
                              <i className="fas fa-spinner fa-spin me-2"></i>
                            ) : (
                              <i className="fas fa-sign-out-alt me-2"></i>
                            )}
                            Check Out
                          </button>
                        )}
                      </div>
                      <div className="mt-3">
                        <small className="text-muted">
                          {checkInStatus.isCheckedIn
                            ? checkInStatus.canCheckOut
                              ? "You can check out now"
                              : "Already checked in today"
                            : "Click Check In to start your workday"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Summary */}
                <div className="col-md-6">
                  <div className="card border-0 bg-light h-100">
                    <div className="card-body">
                      <h5 className="card-title">Today's Summary</h5>
                      {todayAttendance ? (
                        <div className="row g-2">
                          <div className="col-6">
                            <small className="text-muted">Check In:</small>
                            <div className="fw-medium">
                              {todayAttendance.checkIn
                                ? formatTime(todayAttendance.checkIn)
                                : "Not checked in"}
                            </div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Check Out:</small>
                            <div className="fw-medium">
                              {todayAttendance.checkOut
                                ? formatTime(todayAttendance.checkOut)
                                : "Still working"}
                            </div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Hours Worked:</small>
                            <div className="fw-medium">
                              {calculateHours(
                                todayAttendance.checkIn,
                                todayAttendance.checkOut
                              )}
                            </div>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Status:</small>
                            <div>
                              <span
                                className={`badge bg-${
                                  ATTENDANCE_STATUS_COLORS[
                                    getAttendanceStatus(todayAttendance)
                                  ]
                                }`}
                              >
                                {
                                  ATTENDANCE_STATUS_LABELS[
                                    getAttendanceStatus(todayAttendance)
                                  ]
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted">
                          <i className="fas fa-info-circle me-2"></i>
                          No attendance record for today
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance History Tab */}
          {activeTab === "history" && (
            <div>
              {/* Filters */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label small fw-medium">Month</label>
                  <input
                    type="month"
                    className="form-control"
                    value={filters.month}
                    onChange={(e) =>
                      handleFilterChange("month", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.startDate}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.endDate}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={applyFilters}
                      disabled={loading}
                    >
                      <i className="fas fa-search me-1"></i>
                      Apply
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={clearFilters}
                      disabled={loading}
                    >
                      <i className="fas fa-times me-1"></i>
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Table */}
              {loading ? (
                <div className="text-center py-4">
                  <LoadingSpinner />
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-5">
                  <div className="text-muted">
                    <i className="fas fa-calendar-times fa-3x mb-3"></i>
                    <h5>No Attendance Records</h5>
                    <p>No attendance records found for the selected period.</p>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Hours Worked</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record._id}>
                          <td>
                            <div className="fw-medium">
                              {formatDate(record.date, DATE_FORMATS.DISPLAY)}
                            </div>
                            <small className="text-muted">
                              {formatDate(record.date, "dddd")}
                            </small>
                          </td>
                          <td>
                            {record.checkIn ? (
                              <span className="text-success fw-medium">
                                {formatTime(record.checkIn)}
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {record.checkOut ? (
                              <span className="text-info fw-medium">
                                {formatTime(record.checkOut)}
                              </span>
                            ) : record.checkIn ? (
                              <span className="text-warning">
                                Still working
                              </span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <span className="fw-medium">
                              {calculateHours(record.checkIn, record.checkOut)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                ATTENDANCE_STATUS_COLORS[
                                  getAttendanceStatus(record)
                                ]
                              }`}
                            >
                              {
                                ATTENDANCE_STATUS_LABELS[
                                  getAttendanceStatus(record)
                                ]
                              }
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted small">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </div>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() =>
                        fetchAttendanceHistory(pagination.page - 1)
                      }
                      disabled={pagination.page <= 1 || loading}
                    >
                      <i className="fas fa-chevron-left"></i> Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() =>
                        fetchAttendanceHistory(pagination.page + 1)
                      }
                      disabled={
                        pagination.page >= pagination.totalPages || loading
                      }
                    >
                      Next <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
