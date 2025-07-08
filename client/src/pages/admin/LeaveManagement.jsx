import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { adminAPI } from "../../utils/api";
import {
  LEAVE_STATUS,
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_COLORS,
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  DATE_FORMATS,
} from "../../utils/constants";
import { formatDate, formatApiError } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    search: "",
    startDate: "",
    endDate: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchLeaves = async (page = 1) => {
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

      const response = await adminAPI.getAllLeaves(params);
      const { data, pagination: paginationData } = response.data;

      setLeaves(data || []);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
        page,
      }));
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error(formatApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getLeaveStats();
      setStats(response.data || {});
    } catch (error) {
      console.error("Error fetching leave stats:", error);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
      await adminAPI.approveLeave(leaveId);
      toast.success("Leave approved successfully!");
      fetchLeaves(pagination.page);
      fetchStats();
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error(formatApiError(error));
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
      await adminAPI.rejectLeave(leaveId);
      toast.success("Leave rejected successfully!");
      fetchLeaves(pagination.page);
      fetchStats();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error(formatApiError(error));
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
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
    fetchLeaves(1);
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      type: "",
      search: "",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => fetchLeaves(1), 100);
  };

  useEffect(() => {
    fetchLeaves();
    fetchStats();
  }, []);

  if (loading && leaves.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Leave Management</h1>
          <p className="text-muted mb-0">Manage employee leave requests</p>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-warning mb-2">
                  <i className="fas fa-clock"></i>
                </div>
                <h3 className="mb-1">{stats.pending || 0}</h3>
                <p className="text-muted mb-0 small">Pending Requests</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-success mb-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="mb-1">{stats.approved || 0}</h3>
                <p className="text-muted mb-0 small">Approved</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-danger mb-2">
                  <i className="fas fa-times-circle"></i>
                </div>
                <h3 className="mb-1">{stats.rejected || 0}</h3>
                <p className="text-muted mb-0 small">Rejected</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center">
                <div className="display-6 text-info mb-2">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <h3 className="mb-1">{stats.total || 0}</h3>
                <p className="text-muted mb-0 small">Total Requests</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-medium">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by employee name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-medium">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                {Object.entries(LEAVE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-medium">Type</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                {Object.entries(LEAVE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-medium">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-medium">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className="col-md-1 d-flex align-items-end">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={applyFilters}
                  disabled={loading}
                >
                  <i className="fas fa-search"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Leave Requests</h5>
            <span className="badge bg-light text-dark">
              Total: {pagination.total} requests
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-4">
              <LoadingSpinner />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="fas fa-calendar-times fa-3x mb-3"></i>
                <h5>No Leave Requests Found</h5>
                <p>No leave requests match your current filters.</p>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3">Employee</th>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td className="px-3">
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2">
                            {leave.employee?.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="fw-medium">
                              {leave.employee?.name || "Unknown"}
                            </div>
                            <small className="text-muted">
                              {leave.employee?.employeeId || ""}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {LEAVE_TYPE_LABELS[leave.type] || leave.type}
                        </span>
                      </td>
                      <td>
                        {formatDate(leave.startDate, DATE_FORMATS.DISPLAY)}
                      </td>
                      <td>{formatDate(leave.endDate, DATE_FORMATS.DISPLAY)}</td>
                      <td>
                        <span className="fw-medium">
                          {leave.workingDays || 0}
                        </span>
                        <small className="text-muted"> days</small>
                      </td>
                      <td>
                        <span
                          className={`badge bg-${
                            LEAVE_STATUS_COLORS[leave.status]
                          }`}
                        >
                          {LEAVE_STATUS_LABELS[leave.status] || leave.status}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDate(leave.createdAt, DATE_FORMATS.DISPLAY)}
                        </small>
                      </td>
                      <td className="text-center">
                        {leave.status === LEAVE_STATUS.PENDING ? (
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => handleApproveLeave(leave._id)}
                              disabled={actionLoading[leave._id]}
                              title="Approve Leave"
                            >
                              {actionLoading[leave._id] ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => handleRejectLeave(leave._id)}
                              disabled={actionLoading[leave._id]}
                              title="Reject Leave"
                            >
                              {actionLoading[leave._id] ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <i className="fas fa-times"></i>
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            {leave.status === LEAVE_STATUS.APPROVED
                              ? "Approved"
                              : leave.status === LEAVE_STATUS.REJECTED
                              ? "Rejected"
                              : "No action needed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="card-footer bg-white border-top">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => fetchLeaves(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => fetchLeaves(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
