import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { employeeAPI } from "../../utils/api";
import {
  LEAVE_STATUS,
  LEAVE_STATUS_LABELS,
  LEAVE_STATUS_COLORS,
  LEAVE_TYPES,
  LEAVE_TYPE_LABELS,
  LEAVE_TYPE_OPTIONS,
  DATE_FORMATS,
  VALIDATION_MESSAGES,
} from "../../utils/constants";
import {
  formatDate,
  formatApiError,
  validateRequired,
} from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch my leaves
  const fetchMyLeaves = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
      };

      const response = await employeeAPI.getMyLeaves(params);
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

  const fetchLeaveBalance = async () => {
    try {
      const response = await employeeAPI.getLeaveBalance();
      setLeaveBalance(response.data.balance || 0);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!validateRequired(formData.type)) {
      errors.type = VALIDATION_MESSAGES.REQUIRED;
    }

    if (!validateRequired(formData.startDate)) {
      errors.startDate = VALIDATION_MESSAGES.REQUIRED;
    }

    if (!validateRequired(formData.endDate)) {
      errors.endDate = VALIDATION_MESSAGES.REQUIRED;
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (endDate < startDate) {
        errors.endDate = VALIDATION_MESSAGES.END_DATE_BEFORE_START;
      }
    }

    if (!validateRequired(formData.reason)) {
      errors.reason = VALIDATION_MESSAGES.REQUIRED;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate working days
  const calculateWorkingDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
    }

    return workingDays;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);

      const leaveData = {
        leaveType: Number(formData.type), 
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      };

      await employeeAPI.createLeave(leaveData);
      toast.success("Leave application submitted successfully!");
      setShowForm(false);
      setFormData({
        type: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
      fetchMyLeaves();
      fetchLeaveBalance();
    } catch (error) {
      console.error("Error submitting leave:", error);
      toast.error(formatApiError(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle leave cancellation
  const handleCancelLeave = async (leaveId) => {
    if (
      !window.confirm("Are you sure you want to cancel this leave request?")
    ) {
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [leaveId]: true }));
      await employeeAPI.cancelLeave(leaveId);
      toast.success("Leave cancelled successfully!");
      fetchMyLeaves();
      fetchLeaveBalance();
    } catch (error) {
      console.error("Error cancelling leave:", error);
      toast.error(formatApiError(error));
    } finally {
      setActionLoading((prev) => ({ ...prev, [leaveId]: false }));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchMyLeaves();
    fetchLeaveBalance();
  }, []);

  // Calculate working days for form preview
  const workingDaysPreview = calculateWorkingDays(
    formData.startDate,
    formData.endDate
  );

  if (loading && leaves.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">My Leaves</h1>
          <p className="text-muted mb-0">Manage your leave requests</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fas fa-plus me-2"></i>
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance Card */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4 text-primary mb-2">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h2 className="mb-1">{leaveBalance}</h2>
              <p className="text-muted mb-0">Available Leave Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Application Form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Apply for Leave</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowForm(false)}
              ></button>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Leave Type <span className="text-danger">*</span>
                  </label>
                  <select
                    name="type"
                    className={`form-select ${
                      formErrors.type ? "is-invalid" : ""
                    }`}
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select leave type</option>
                    {LEAVE_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.type && (
                    <div className="invalid-feedback">{formErrors.type}</div>
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    Start Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className={`form-control ${
                      formErrors.startDate ? "is-invalid" : ""
                    }`}
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={formatDate(new Date(), "YYYY-MM-DD")}
                  />
                  {formErrors.startDate && (
                    <div className="invalid-feedback">
                      {formErrors.startDate}
                    </div>
                  )}
                </div>

                <div className="col-md-3">
                  <label className="form-label">
                    End Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className={`form-control ${
                      formErrors.endDate ? "is-invalid" : ""
                    }`}
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={
                      formData.startDate || formatDate(new Date(), "YYYY-MM-DD")
                    }
                  />
                  {formErrors.endDate && (
                    <div className="invalid-feedback">{formErrors.endDate}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="reason"
                    className={`form-control ${
                      formErrors.reason ? "is-invalid" : ""
                    }`}
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Please provide reason for leave..."
                  ></textarea>
                  {formErrors.reason && (
                    <div className="invalid-feedback">{formErrors.reason}</div>
                  )}
                </div>

                {/* Working Days Preview */}
                {workingDaysPreview > 0 && (
                  <div className="col-12">
                    <div className="alert alert-info">
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Working Days:</strong> {workingDaysPreview} day(s)
                      {workingDaysPreview > leaveBalance && (
                        <div className="text-warning mt-1">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Warning: Requested days exceed available balance
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Submit Application
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave History */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Leave History</h5>
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
                <h5>No Leave Requests</h5>
                <p>You haven't applied for any leaves yet.</p>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3">Leave Type</th>
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
                          <div className="avatar-sm bg-light text-primary rounded d-flex align-items-center justify-content-center me-2">
                            <i className="fas fa-calendar-alt"></i>
                          </div>
                          <div>
                            <div className="fw-medium">
                              {LEAVE_TYPE_LABELS[leave.type] || leave.type}
                            </div>
                            <small className="text-muted">
                              {leave.reason?.substring(0, 30)}...
                            </small>
                          </div>
                        </div>
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
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelLeave(leave._id)}
                            disabled={actionLoading[leave._id]}
                            title="Cancel Leave"
                          >
                            {actionLoading[leave._id] ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <>
                                <i className="fas fa-times me-1"></i>
                                Cancel
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-muted small">
                            {leave.status === LEAVE_STATUS.APPROVED
                              ? "Approved"
                              : leave.status === LEAVE_STATUS.REJECTED
                              ? "Rejected"
                              : leave.status === LEAVE_STATUS.CANCELLED
                              ? "Cancelled"
                              : "No action available"}
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
                  onClick={() => fetchMyLeaves(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => fetchMyLeaves(pagination.page + 1)}
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

export default MyLeaves;
