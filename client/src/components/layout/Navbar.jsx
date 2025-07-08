import React from "react";
import { Navbar as BootstrapNavbar, Nav, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = ({ userType, onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <BootstrapNavbar bg="white" className="navbar-custom px-3 py-2">
      <div className="d-flex align-items-center">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onToggleSidebar}
          className="me-3"
        >
          <i className="fas fa-bars"></i>
        </Button>

        <div className="text-muted">
          Welcome back,{" "}
          <span className="fw-bold text-dark">
            {user?.name || user?.firstName}!
          </span>
        </div>
      </div>

      <Nav className="ms-auto d-flex align-items-center">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={handleLogout}
          className="d-flex align-items-center"
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Logout
        </Button>
      </Nav>
    </BootstrapNavbar>
  );
};

export default Navbar;
