import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { employeeAPI } from "../../utils/api";
import { AuthContext } from "../../contexts/AuthContext";
import {
  DEPARTMENTS,
  POSITIONS,
  DATE_FORMATS,
  VALIDATION_MESSAGES,
  REGEX_PATTERNS,
} from "../../utils/constants";
import {
  formatDate,
  formatApiError,
  validateRequired,
  validateEmail,
  validatePhone,
} from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    dateOfJoining: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Initialize form data with user information
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
        position: user.position || "",
        dateOfJoining: user.dateOfJoining
          ? formatDate(user.dateOfJoining, "YYYY-MM-DD")
          : "",
      });
    }
  }, [user]);

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

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};

    if (!validateRequired(formData.name)) {
      errors.name = VALIDATION_MESSAGES.REQUIRED;
    }

    if (!validateRequired(formData.email)) {
      errors.email = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validateEmail(formData.email)) {
      errors.email = VALIDATION_MESSAGES.EMAIL_INVALID;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = VALIDATION_MESSAGES.PHONE_INVALID;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!validateRequired(passwordData.currentPassword)) {
      errors.currentPassword = VALIDATION_MESSAGES.REQUIRED;
    }

    if (!validateRequired(passwordData.newPassword)) {
      errors.newPassword = VALIDATION_MESSAGES.REQUIRED;
    } else if (!REGEX_PATTERNS.PASSWORD.test(passwordData.newPassword)) {
      errors.newPassword = VALIDATION_MESSAGES.PASSWORD_WEAK;
    }

    if (!validateRequired(passwordData.confirmPassword)) {
      errors.confirmPassword = VALIDATION_MESSAGES.REQUIRED;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    try {
      setSubmitLoading(true);

      // Note: This would typically call an API to update profile
      // For now, we'll just show success and update local state
      const updatedUser = { ...user, ...formData };
      updateUser(updatedUser);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(formatApiError(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle password change
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      await employeeAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(formatApiError(error));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">My Profile</h1>
          <p className="text-muted mb-0">
            Manage your personal information and settings
          </p>
        </div>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="avatar-lg bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <span className="h2 mb-0">{user?.name?.charAt(0) || "U"}</span>
              </div>
              <h5 className="card-title mb-1">
                {user?.name || "Unknown User"}
              </h5>
              <p className="text-muted mb-2">{user?.position || "Employee"}</p>
              <span className="badge bg-primary">
                {user?.employeeId || "N/A"}
              </span>

              <hr className="my-4" />

              <div className="row text-center">
                <div className="col">
                  <div className="h6 mb-0">{user?.department || "N/A"}</div>
                  <small className="text-muted">Department</small>
                </div>
                <div className="col border-start">
                  <div className="h6 mb-0">
                    {user?.dateOfJoining
                      ? formatDate(user.dateOfJoining, "MMM YYYY")
                      : "N/A"}
                  </div>
                  <small className="text-muted">Joined</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            {/* Tabs */}
            <div className="card-header bg-white border-bottom">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "profile" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <i className="fas fa-user me-2"></i>
                    Profile Information
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "password" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("password")}
                  >
                    <i className="fas fa-lock me-2"></i>
                    Change Password
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${
                          formErrors.name ? "is-invalid" : ""
                        }`}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && (
                        <div className="invalid-feedback">
                          {formErrors.name}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Employee ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.employeeId || ""}
                        disabled
                        placeholder="Auto-generated"
                      />
                      <small className="text-muted">
                        Employee ID cannot be changed
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${
                          formErrors.email ? "is-invalid" : ""
                        }`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                      />
                      {formErrors.email && (
                        <div className="invalid-feedback">
                          {formErrors.email}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-control ${
                          formErrors.phone ? "is-invalid" : ""
                        }`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                      {formErrors.phone && (
                        <div className="invalid-feedback">
                          {formErrors.phone}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Department</label>
                      <select
                        name="department"
                        className="form-select"
                        value={formData.department}
                        onChange={handleInputChange}
                        disabled
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        Contact HR to change department
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Position</label>
                      <select
                        name="position"
                        className="form-select"
                        value={formData.position}
                        onChange={handleInputChange}
                        disabled
                      >
                        <option value="">Select position</option>
                        {POSITIONS.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                      <small className="text-muted">
                        Contact HR to change position
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Date of Joining</label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        className="form-control"
                        value={formData.dateOfJoining}
                        onChange={handleInputChange}
                        disabled
                      />
                      <small className="text-muted">
                        Date of joining cannot be changed
                      </small>
                    </div>
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
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Profile
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          phone: user?.phone || "",
                          department: user?.department || "",
                          position: user?.position || "",
                          dateOfJoining: user?.dateOfJoining
                            ? formatDate(user.dateOfJoining, "YYYY-MM-DD")
                            : "",
                        });
                        setFormErrors({});
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === "password" && (
                <form onSubmit={handlePasswordUpdate}>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Password must be at least 8 characters long and contain
                        uppercase, lowercase, number and special character.
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Current Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        className={`form-control ${
                          passwordErrors.currentPassword ? "is-invalid" : ""
                        }`}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                      />
                      {passwordErrors.currentPassword && (
                        <div className="invalid-feedback">
                          {passwordErrors.currentPassword}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        New Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        className={`form-control ${
                          passwordErrors.newPassword ? "is-invalid" : ""
                        }`}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />
                      {passwordErrors.newPassword && (
                        <div className="invalid-feedback">
                          {passwordErrors.newPassword}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Confirm New Password{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className={`form-control ${
                          passwordErrors.confirmPassword ? "is-invalid" : ""
                        }`}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />
                      {passwordErrors.confirmPassword && (
                        <div className="invalid-feedback">
                          {passwordErrors.confirmPassword}
                        </div>
                      )}
                    </div>
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
                          Changing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key me-2"></i>
                          Change Password
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordErrors({});
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
