import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Modal,
} from "react-bootstrap";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { validateEmail, validateRequired } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Login = () => {
  const navigate = useNavigate();
  const { role } = useParams();
  const {
    login,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    isAuthenticated,
    userType,
    loading,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [resetData, setResetData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = userType === "admin" ? "/admin" : "/employee";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userType, navigate]);

  useEffect(() => {
    if (role !== "admin" && role !== "employee") {
      navigate("/", { replace: true });
    }
  }, [role, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!validateRequired(formData.email)) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!validateRequired(formData.password)) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoginError("");

    try {
      const result = await login(formData, role);

      if (result.success) {
        const redirectPath = role === "admin" ? "/admin" : "/employee";
        navigate(redirectPath, { replace: true });
      } else {
        setLoginError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setLoginError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const result = await forgotPassword(resetData.email, role);
      if (result.success) {
        setResetStep("code");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const result = await verifyResetCode(
        resetData.email,
        resetData.code,
        role
      );
      if (result.success) {
        setResetStep("password");
      }
    } catch (error) {
      console.error("Verify code error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetData.newPassword !== resetData.confirmPassword) {
      return;
    }

    setResetLoading(true);

    try {
      const result = await resetPassword(
        resetData.email,
        resetData.code,
        resetData.newPassword,
        role
      );
      if (result.success) {
        setShowForgotPassword(false);
        setResetStep("email");
        setResetData({
          email: "",
          code: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const resetModalHandleClose = () => {
    setShowForgotPassword(false);
    setResetStep("email");
    setResetData({ email: "", code: "", newPassword: "", confirmPassword: "" });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="login-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="login-card shadow-lg">
              <Card.Body className="login-form">
                {/* Header */}
                <div className="login-logo">
                  <i
                    className={`fas ${
                      role === "admin" ? "fa-user-shield" : "fa-user"
                    }`}
                  ></i>
                  <h3 className="fw-bold mt-3">
                    {role === "admin"
                      ? "Administrator Login"
                      : "Employee Login"}
                  </h3>
                  <p className="text-muted">Please sign in to continue</p>
                </div>

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  {loginError && (
                    <Alert variant="danger" className="mb-3">
                      {loginError}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.email}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.password}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      label="Remember me"
                    />
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => {
                        setResetData((prev) => ({
                          ...prev,
                          email: formData.email,
                        }));
                        setShowForgotPassword(true);
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    variant={role === "admin" ? "primary" : "success"}
                    size="lg"
                    className="w-100 mb-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </Form>

                {/* Back to role selection */}
                <div className="text-center">
                  <Link to="/" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>
                    Back to Role Selection
                  </Link>
                </div>

                {/* Demo credentials */}
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">Demo Credentials:</h6>
                  {role === "admin" ? (
                    <div className="small">
                      <div>
                        <strong>Admin:</strong> admin@company.com / Admin@123
                      </div>
                      <div>
                        <strong>Manager:</strong> manager@company.com /
                        Manager@123
                      </div>
                    </div>
                  ) : (
                    <div className="small">
                      <div>
                        <strong>Employee:</strong> john.doe@company.com /
                        Employee@123
                      </div>
                      <div>
                        <strong>Employee:</strong> jane.smith@company.com /
                        Employee@123
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Forgot Password Modal */}
      <Modal show={showForgotPassword} onHide={resetModalHandleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resetStep === "email" && (
            <Form onSubmit={handleForgotPassword}>
              <p className="text-muted">
                Enter your email address and we'll send you a reset code.
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  value={resetData.email}
                  onChange={(e) =>
                    setResetData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button variant="secondary" onClick={resetModalHandleClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </div>
            </Form>
          )}

          {resetStep === "code" && (
            <Form onSubmit={handleVerifyCode}>
              <p className="text-muted">
                Enter the reset code sent to your email.
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Reset Code</Form.Label>
                <Form.Control
                  type="text"
                  value={resetData.code}
                  onChange={(e) =>
                    setResetData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="Enter reset code"
                  required
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setResetStep("email")}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" disabled={resetLoading}>
                  {resetLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </Form>
          )}

          {resetStep === "password" && (
            <Form onSubmit={handleResetPassword}>
              <p className="text-muted">Enter your new password.</p>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={resetData.newPassword}
                  onChange={(e) =>
                    setResetData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={resetData.confirmPassword}
                  onChange={(e) =>
                    setResetData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  required
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setResetStep("code")}
                >
                  Back
                </Button>
                <Button type="submit" variant="primary" disabled={resetLoading}>
                  {resetLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Login;
